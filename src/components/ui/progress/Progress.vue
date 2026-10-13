<script setup lang="ts">
import type { ProgressRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  ProgressIndicator,
  ProgressRoot,
} from "reka-ui"
import { cn } from "@/lib/utils"

const props = withDefaults(
  defineProps<ProgressRootProps & { class?: HTMLAttributes["class"] }>(),
  {
    modelValue: 0,
  },
)

const delegatedProps = reactiveOmit(props, "class")

/* Explicit null = indeterminate (job running, no % from the backend) */
const isIndeterminate = computed(() => props.modelValue === null)
</script>

<template>
  <ProgressRoot
    data-slot="progress"
    v-bind="delegatedProps"
    :model-value="isIndeterminate ? undefined : (props.modelValue ?? 0)"
    :class="
      cn(
        'bg-muted h-1 rounded-full relative flex w-full items-center overflow-hidden',
        props.class,
      )
    "
  >
    <!-- Direction-aware fill: the track is a flex row, so the indicator packs
         at the inline-start (right in RTL, left in LTR) and grows by `width`.
         The previous `translateX(-N%)` was a physical-axis transform that
         filled end→start in RTL. Indeterminate slides a 40% bar along the
         logical `inset-inline-start`, so it runs start→end in both dirs. -->
    <ProgressIndicator
      data-slot="progress-indicator"
      :class="
        cn(
          'bg-primary h-full shrink-0 rounded-full',
          isIndeterminate ? 'absolute w-2/5 animate-progress-indeterminate' : 'transition-[width]',
        )
      "
      :style="isIndeterminate ? undefined : `width: ${props.modelValue ?? 0}%`"
    />
  </ProgressRoot>
</template>
