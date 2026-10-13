<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { DialogClose } from "reka-ui";
import { cn } from "@/lib/utils";
import { i18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

const t = i18n.global.t;

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    showCloseButton?: boolean;
    /**
     * For dialogs whose DialogContent drops its padding (`p-0`) so sections can
     * bleed edge to edge: the footer supplies its own inset and anchors the
     * sheet with a tinted rule. Without this the treatment gets copy-pasted per
     * page and drifts.
     */
    bleed?: boolean;
  }>(),
  {
    showCloseButton: false,
    bleed: false,
  },
);
</script>

<template>
  <div
    data-slot="dialog-footer"
    :class="
      cn(
        'flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end',
        props.bleed && 'border-border bg-muted/20 border-t px-4 py-4 pt-4 sm:px-6',
        props.class,
      )
    "
  >
    <slot />
    <DialogClose v-if="showCloseButton" as-child>
      <Button variant="outline">
        {{ t("common.close") }}
      </Button>
    </DialogClose>
  </div>
</template>
