<script lang="ts" setup>
import type { RangeCalendarCellProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { RangeCalendarCell, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<RangeCalendarCellProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <RangeCalendarCell
    data-slot="range-calendar-cell"
    :class="cn(
      'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
      '[&:has([data-selected]:not([data-outside-view]))]:bg-accent',
      'first:[&:has([data-selected])]:rounded-s-md last:[&:has([data-selected])]:rounded-e-md',
      '[&:has([data-selected][data-selection-end])]:rounded-e-md [&:has([data-selected][data-selection-start])]:rounded-s-md',
      // Don't paint the range wash under hidden adjacent-month days
      '[&:has([data-outside-view])]:bg-transparent',
      props.class,
    )"
    v-bind="forwardedProps"
  >
    <slot />
  </RangeCalendarCell>
</template>
