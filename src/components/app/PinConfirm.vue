<script setup lang="ts">
// PinConfirm — the single gate for money-action PIN/OTP confirmation.
//
// Clear + refocus on a rejected code: reka-ui's PinInputRoot only exposes a
// controlled `modelValue` (no imperative `clear()`/`focus()` methods), so
// this component (a) resets `code` to `[]` from the outside — a plain
// v-model set, not blocked by anything in the primitive — and (b) bumps
// `attemptKey`, keyed onto <PinInput>, forcing Vue to destroy and recreate
// the whole pin-input subtree. That both guarantees a clean slate (no stale
// reka-ui internal state) and restarts the `cn-shake` CSS animation, which
// doesn't replay on a class re-application alone. Refocus is then a plain
// DOM query (`rootRef.querySelector('input')`) after `nextTick`, since the
// primitive doesn't forward a ref to its first slot's element either.
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  useTemplateRef,
  watch,
} from "vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PinInput, PinInputGroup, PinInputSlot } from "@/components/ui/pin-input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { i18n } from "@/lib/i18n";

// i18n.global.t (not useI18n) — this composite is unit-mounted without the
// i18n plugin; the global instance works standalone and stays reactive.
const t = i18n.global.t;

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    length?: 4 | 6;
    /** Render slots as password dots instead of digits. */
    masked?: boolean;
    /** Called with the completed code; reject/throw to surface the error state. */
    onConfirm: (code: string) => Promise<void>;
    resendable?: boolean;
    /** Resend cooldown, in seconds. */
    cooldown?: number;
    /** "dialog" (default): a Dialog-wrapped confirmation modal. "inline":
     *  the same state machine with no Dialog chrome, for pages (Login) that
     *  own their own step layout and surrounding UI. */
    variant?: "dialog" | "inline";
    /** Confirm button label (idle state). */
    confirmLabel?: string;
  }>(),
  {
    description: "",
    length: 6,
    masked: false,
    resendable: true,
    cooldown: 30,
    variant: "dialog",
  },
);

/** Idle confirm-button label — prop override, else the localized default. */
const confirmLabelText = computed(() => props.confirmLabel ?? t("common.confirm"));

// The resend countdown keeps its digits inside <span class="num"> (rule 2), so
// the localized sentence is split around a placeholder rather than interpolated.
const COUNTDOWN_MARK = "@@seconds@@";
const resendParts = computed(() => {
  const [before = "", after = ""] = t("pin.resendIn", { seconds: COUNTDOWN_MARK }).split(
    COUNTDOWN_MARK,
  );
  return { before, after };
});

const emit = defineEmits<{
  success: [];
  cancel: [];
  resend: [];
}>();

// Inline usage has no dismiss affordance — mounted implies open, so default
// true keeps that call site simple. Dialog usage always binds v-model:open
// explicitly, so the default is never actually relied on there.
const open = defineModel<boolean>("open", { default: true });

const baseId = useId();
const rootRef = useTemplateRef<HTMLDivElement>("rootRef");

type Status = "idle" | "verifying" | "error";
const status = ref<Status>("idle");
const errorMessage = ref("");
const code = ref<string[]>([]);
const attemptKey = ref(0);
const remaining = ref(props.cooldown);
let cooldownTimer: ReturnType<typeof setInterval> | undefined;
let closingAfterSuccess = false;

const isComplete = computed(() => code.value.filter(Boolean).length === props.length);

function focusFirstSlot() {
  nextTick(() => {
    rootRef.value?.querySelector<HTMLInputElement>("input")?.focus();
  });
}

function stopCooldown() {
  if (cooldownTimer !== undefined) {
    clearInterval(cooldownTimer);
    cooldownTimer = undefined;
  }
}

function startCooldown() {
  stopCooldown();
  remaining.value = props.cooldown;
  if (remaining.value <= 0) return;
  cooldownTimer = setInterval(() => {
    remaining.value -= 1;
    if (remaining.value <= 0) stopCooldown();
  }, 1000);
}

/** Fresh state for a newly (re)opened confirmation — dialog open-auto-focus
 *  and the inline mount hook both funnel through this. */
function resetForOpen() {
  code.value = [];
  status.value = "idle";
  errorMessage.value = "";
  attemptKey.value += 1;
  startCooldown();
  focusFirstSlot();
}

async function submit() {
  if (status.value === "verifying" || !isComplete.value) return;
  status.value = "verifying";
  errorMessage.value = "";
  try {
    await props.onConfirm(code.value.join(""));
    status.value = "idle";
    emit("success");
    if (props.variant === "dialog") {
      closingAfterSuccess = true;
      open.value = false;
    }
  } catch (err) {
    status.value = "error";
    errorMessage.value = err instanceof Error && err.message ? err.message : t("pin.invalid");
    code.value = [];
    attemptKey.value += 1;
    focusFirstSlot();
  }
}

function handleCodeUpdate(value: string[]) {
  code.value = value;
  if (status.value === "error" && value.some(Boolean)) {
    status.value = "idle";
    errorMessage.value = "";
  }
  if (value.filter(Boolean).length === props.length && status.value !== "verifying") {
    submit();
  }
}

function handleResend() {
  if (remaining.value > 0) return;
  emit("resend");
  startCooldown();
}

function handleOpenAutoFocus(event: Event) {
  event.preventDefault();
  resetForOpen();
}

function guardDismiss(event: Event) {
  if (status.value === "verifying") event.preventDefault();
}

function onInnerOpenChange(value: boolean) {
  open.value = value;
  if (!value && !closingAfterSuccess) emit("cancel");
  closingAfterSuccess = false;
}

// Safety net for parent-driven closes (open set false from the outside)
// that don't go through onInnerOpenChange — always stop the interval.
watch(open, (isOpen) => {
  if (!isOpen) stopCooldown();
});

onMounted(() => {
  if (props.variant === "inline") resetForOpen();
});

onBeforeUnmount(stopCooldown);
</script>

<template>
  <Dialog v-if="variant === 'dialog'" :open="open" @update:open="onInnerOpenChange">
    <DialogContent
      class="sm:max-w-sm"
      :show-close-button="status !== 'verifying'"
      @open-auto-focus="handleOpenAutoFocus"
      @escape-key-down="guardDismiss"
      @pointer-down-outside="guardDismiss"
    >
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription v-if="description">{{ description }}</DialogDescription>
      </DialogHeader>

      <div ref="rootRef" class="space-y-5">
        <PinInput
          :id="`${baseId}-pin`"
          :key="attemptKey"
          :model-value="code"
          :aria-label="title"
          otp
          dir="ltr"
          placeholder="○"
          :mask="masked"
          :disabled="status === 'verifying'"
          class="mx-auto"
          @update:model-value="handleCodeUpdate"
        >
          <PinInputGroup class="gap-1.5 sm:gap-2" :class="status === 'error' ? 'cn-shake' : ''">
            <PinInputSlot
              v-for="(slot, index) in length"
              :key="slot"
              :index="index"
              :aria-invalid="status === 'error' ? true : undefined"
              class="num size-8 rounded-lg border text-base sm:size-10 sm:text-lg"
            />
          </PinInputGroup>
        </PinInput>

        <p v-if="status === 'error'" class="text-center text-xs text-destructive" role="alert">
          {{ errorMessage }}
        </p>

        <Button
          type="button"
          class="h-10 w-full glow-primary"
          :disabled="!isComplete || status === 'verifying'"
          @click="submit"
        >
          <template v-if="status === 'verifying'">
            <Spinner size="sm" />
            {{ t("pin.checking") }}
          </template>
          <template v-else>{{ confirmLabelText }}</template>
        </Button>

        <p v-if="resendable" class="text-center text-xs text-muted-foreground">
          {{ t("pin.resendPrompt") }}
          <button
            type="button"
            class="text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
            :disabled="remaining > 0"
            @click="handleResend"
          >
            <template v-if="remaining > 0"
              >{{ resendParts.before }}<span class="num">{{ remaining }}</span
              >{{ resendParts.after }}</template
            >
            <template v-else>{{ t("pin.resend") }}</template>
          </button>
        </p>
      </div>
    </DialogContent>
  </Dialog>

  <div v-else-if="open" class="space-y-5">
    <div>
      <h3 class="text-xl font-semibold tracking-tight">{{ title }}</h3>
      <p v-if="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
    </div>

    <div ref="rootRef" class="space-y-5">
      <PinInput
        :id="`${baseId}-pin`"
        :key="attemptKey"
        :model-value="code"
        :aria-label="title"
        otp
        dir="ltr"
        placeholder="○"
        :mask="masked"
        :disabled="status === 'verifying'"
        class="mx-auto"
        @update:model-value="handleCodeUpdate"
      >
        <PinInputGroup class="gap-1.5 sm:gap-2" :class="status === 'error' ? 'cn-shake' : ''">
          <PinInputSlot
            v-for="(slot, index) in length"
            :key="slot"
            :index="index"
            :aria-invalid="status === 'error' ? true : undefined"
            class="num size-8 rounded-lg border text-base sm:size-10 sm:text-lg"
          />
        </PinInputGroup>
      </PinInput>

      <p v-if="status === 'error'" class="text-center text-xs text-destructive" role="alert">
        {{ errorMessage }}
      </p>

      <Button
        type="button"
        class="h-10 w-full glow-primary"
        :disabled="!isComplete || status === 'verifying'"
        @click="submit"
      >
        <template v-if="status === 'verifying'">
          <Spinner size="sm" />
          {{ t("pin.checking") }}
        </template>
        <template v-else>{{ confirmLabelText }}</template>
      </Button>

      <p v-if="resendable" class="text-center text-xs text-muted-foreground">
        {{ t("pin.resendPrompt") }}
        <button
          type="button"
          class="text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
          :disabled="remaining > 0"
          @click="handleResend"
        >
          <template v-if="remaining > 0"
            >{{ resendParts.before }}<span class="num">{{ remaining }}</span
            >{{ resendParts.after }}</template
          >
          <template v-else>{{ t("pin.resend") }}</template>
        </button>
      </p>
    </div>
  </div>
</template>
