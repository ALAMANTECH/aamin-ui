<script setup lang="ts">
import { computed, ref, useId, watch } from "vue";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PinConfirm from "@/components/app/PinConfirm.vue";
import { i18n } from "@/lib/i18n";

/**
 * An irreversible action that the backend takes as `{ reason, pin }` — voiding
 * a payment, reversing an allocation. The question and its reason come first
 * (an AlertDialog); Continue opens the PinConfirm step ON TOP of it, so closing
 * one reka dialog and opening the next in the same click never leaves the page
 * unclickable. Both close together on success.
 *
 * `onConfirm(reason, pin)` posts; a refusal (wrong PIN, the server's 422) must
 * be thrown — PinConfirm shows it in place and keeps the reason. The
 * description slot carries rich text (amounts, document numbers).
 */
const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    reasonLabel: string;
    reasonPlaceholder?: string;
    continueLabel: string;
    pinTitle: string;
    pinDescription?: string;
    confirmLabel: string;
    onConfirm: (reason: string, pin: string) => Promise<void>;
    /** Prefix of the data-testids: `{testId}-dialog`, `-reason`, `-continue`. */
    testId?: string;
  }>(),
  { description: "", reasonPlaceholder: "", pinDescription: "", testId: "reason-pin" },
);

const open = defineModel<boolean>("open", { default: false });
const emit = defineEmits<{ success: [reason: string] }>();

const t = i18n.global.t;
const id = useId();

/** The backend's `reason` ceiling. */
const REASON_MAX = 255;

const reason = ref("");
const attempted = ref(false);
const pinOpen = ref(false);

const missing = computed(() => !reason.value.trim());

watch(open, (isOpen) => {
  if (isOpen) {
    reason.value = "";
    attempted.value = false;
  } else {
    pinOpen.value = false;
  }
});

function onContinue() {
  attempted.value = true;
  if (missing.value) return;
  pinOpen.value = true;
}

async function confirm(pin: string): Promise<void> {
  await props.onConfirm(reason.value.trim(), pin);
}

function onConfirmed() {
  const given = reason.value.trim();
  pinOpen.value = false;
  open.value = false;
  emit("success", given);
}
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent class="sm:max-w-lg" :data-testid="`${testId}-dialog`">
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription>
          <slot name="description">{{ description }}</slot>
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div class="space-y-1.5">
        <Label :for="`${id}-reason`">{{ reasonLabel }}</Label>
        <Textarea
          :id="`${id}-reason`"
          v-model="reason"
          rows="2"
          :maxlength="REASON_MAX"
          :placeholder="reasonPlaceholder"
          :aria-invalid="(attempted && missing) || undefined"
          :aria-describedby="attempted && missing ? `${id}-reason-error` : undefined"
          :data-testid="`${testId}-reason`"
        />
        <p v-if="attempted && missing" :id="`${id}-reason-error`" class="text-xs text-destructive">
          {{ t("reasonPin.reasonRequired") }}
        </p>
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel>{{ t("common.cancel") }}</AlertDialogCancel>
        <Button variant="destructive" :data-testid="`${testId}-continue`" @click="onContinue">
          {{ continueLabel }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <PinConfirm
    v-model:open="pinOpen"
    :title="pinTitle"
    :description="pinDescription"
    :length="4"
    masked
    :resendable="false"
    :confirm-label="confirmLabel"
    :on-confirm="confirm"
    @success="onConfirmed"
  />
</template>
