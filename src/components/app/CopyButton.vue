<script setup lang="ts">
import { computed, ref } from "vue";
import { CheckIcon, CopyIcon } from "@/lib/icons";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import type { ButtonVariants } from "@/components/ui/button";
import { i18n } from "@/lib/i18n";

// i18n.global.t (not useI18n) — unit-mounted without the i18n plugin.
const t = i18n.global.t;

const props = withDefaults(
  defineProps<{
    /** The text copied to the clipboard. */
    value: string;
    /** Accessible label for the icon-only button. */
    label?: string;
    /** Show a success toast after copying — `true` for a default message, or a custom string. */
    withToast?: boolean | string;
    size?: ButtonVariants["size"];
  }>(),
  {
    withToast: false,
    size: "icon-sm",
  },
);

const labelText = computed(() => props.label ?? t("copy.label"));

const copied = ref(false);
let resetTimer: ReturnType<typeof setTimeout> | undefined;

async function copy() {
  if (!navigator.clipboard) {
    toast.error(t("copy.failed"));
    return;
  }
  try {
    await navigator.clipboard.writeText(props.value);
    copied.value = true;
    if (props.withToast) {
      toast.success(
        typeof props.withToast === "string"
          ? props.withToast
          : t("copy.copied", { value: props.value }),
      );
    }
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch {
    // Clipboard permission denied/unavailable — nothing to recover client-side,
    // but the operator must know the paste they are about to make is empty.
    toast.error(t("copy.failed"));
  }
}
</script>

<template>
  <Button type="button" variant="ghost" :size="size" :aria-label="labelText" @click="copy">
    <CheckIcon v-if="copied" class="size-3.5 text-success" aria-hidden="true" />
    <CopyIcon v-else class="size-3.5" aria-hidden="true" />
  </Button>
</template>
