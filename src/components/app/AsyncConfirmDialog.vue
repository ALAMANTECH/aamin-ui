<script setup lang="ts">
import { ref, watch } from "vue";
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
import { Spinner } from "@/components/ui/spinner";
import { i18n } from "@/lib/i18n";

/**
 * The confirm step of a state-changing action (a SettingRow switch, a row-menu
 * item). Unlike a bare AlertDialogAction — which closes before its handler
 * runs — it stays open while `onConfirm` is in flight, so the request is never
 * left running behind a closed dialog, and a refusal is shown inside it
 * instead of vanishing with it. Closes and emits `success` once `onConfirm`
 * resolves. `errorMessage` turns a thrown value into the inline text; the
 * default reads an Error's message, else the generic network failure.
 */
const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    description?: string;
    /** Confirm button label; defaults to the generic "Confirm". */
    confirmLabel?: string;
    destructive?: boolean;
    onConfirm: () => Promise<unknown>;
    errorMessage?: (error: unknown) => string;
  }>(),
  { description: "", confirmLabel: undefined, destructive: false, errorMessage: undefined },
);

const emit = defineEmits<{ "update:open": [value: boolean]; success: [] }>();

const t = i18n.global.t;
const busy = ref(false);
const error = ref("");

watch(
  () => props.open,
  (open) => {
    if (open) error.value = "";
  },
);

/** Never throws and never returns empty: a refusal always says something. */
function messageFor(err: unknown): string {
  let message = "";
  try {
    message = props.errorMessage
      ? props.errorMessage(err)
      : err instanceof Error
        ? err.message
        : t("common.networkError");
  } catch {
    // A consumer mapper that chokes on an unexpected error shape (e.g. reads
    // `e.response.data` off a network error) must not leave the dialog stuck.
  }
  return message || t("common.networkError");
}

function onOpenChange(value: boolean) {
  // Escape / overlay / cancel cannot close it under a running request.
  if (!value && busy.value) return;
  emit("update:open", value);
}

async function confirm() {
  busy.value = true;
  error.value = "";
  try {
    await props.onConfirm();
    busy.value = false;
    emit("update:open", false);
    emit("success");
  } catch (err) {
    error.value = messageFor(err);
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <AlertDialog :open="open" @update:open="onOpenChange">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription v-if="description">{{ description }}</AlertDialogDescription>
      </AlertDialogHeader>
      <p
        v-if="error"
        class="text-sm text-destructive"
        role="alert"
        data-testid="async-confirm-error"
      >
        {{ error }}
      </p>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="busy">{{ t("common.cancel") }}</AlertDialogCancel>
        <Button
          :variant="destructive ? 'destructive' : 'default'"
          :disabled="busy"
          data-test="confirm"
          @click="confirm"
        >
          <Spinner v-if="busy" size="sm" />
          {{ confirmLabel ?? t("common.confirm") }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
