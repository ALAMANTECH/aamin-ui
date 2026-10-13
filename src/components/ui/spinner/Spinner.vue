<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Loader2Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { i18n } from "@/lib/i18n";

const t = i18n.global.t;

const props = withDefaults(
  defineProps<{
    /** Icon scale — matches the kit's icon sizing (sm=3.5, default=4, lg=6). */
    size?: "sm" | "default" | "lg";
    class?: HTMLAttributes["class"];
    /** Visually-hidden label announced to screen readers while it spins. */
    label?: string;
  }>(),
  {
    size: "default",
  },
);

const sizeClass = {
  sm: "size-3.5",
  default: "size-4",
  lg: "size-6",
} satisfies Record<NonNullable<typeof props.size>, string>;
</script>

<template>
  <span role="status" class="inline-flex items-center">
    <Loader2Icon :class="cn('animate-spin', sizeClass[size], props.class)" aria-hidden="true" />
    <span class="sr-only">{{ label ?? t("common.loading") }}</span>
  </span>
</template>
