<script setup lang="ts">
import type { DialogRootEmits, DialogRootProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { useForwardPropsEmits } from "reka-ui";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Command from "./Command.vue";
import { i18n } from "@/lib/i18n";

const t = i18n.global.t;

const props = withDefaults(
  defineProps<
    DialogRootProps & {
      title?: string;
      description?: string;
      class?: HTMLAttributes["class"];
      showCloseButton?: boolean;
    }
  >(),
  {
    showCloseButton: false,
  },
);
const emits = defineEmits<DialogRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <Dialog v-slot="slotProps" v-bind="forwarded">
    <DialogContent
      :class="
        cn(
          'rounded-2xl! top-1/3 max-h-[min(80dvh,32rem)] translate-y-0 overflow-hidden p-0',
          props.class,
        )
      "
      :show-close-button="showCloseButton"
    >
      <DialogHeader class="sr-only">
        <DialogTitle>{{ title ?? t("command.title") }}</DialogTitle>
        <DialogDescription>{{ description ?? t("command.description") }}</DialogDescription>
      </DialogHeader>
      <Command>
        <slot v-bind="slotProps" />
      </Command>
    </DialogContent>
  </Dialog>
</template>
