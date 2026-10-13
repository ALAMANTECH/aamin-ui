<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <kbd :class="cn('num rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground', props.class)">
    <slot />
  </kbd>
</template>
