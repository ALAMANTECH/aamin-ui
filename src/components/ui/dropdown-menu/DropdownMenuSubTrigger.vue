<script setup lang="ts">
import { ChevronRightIcon } from "@/lib/icons";

import type { DropdownMenuSubTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  DropdownMenuSubTrigger,
  useForwardProps,
} from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<DropdownMenuSubTriggerProps & { class?: HTMLAttributes["class"], inset?: boolean }>()

const delegatedProps = reactiveOmit(props, "class", "inset")
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <DropdownMenuSubTrigger
    data-slot="dropdown-menu-sub-trigger"
    :data-inset="inset ? '' : undefined"
    v-bind="forwardedProps"
    :class="cn(
      'focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground gap-1.5 rounded-md px-2.5 py-1.5 text-sm data-inset:ps-7 [&_svg:not([class*=size-])]:size-4 relative flex cursor-default items-center outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 before:absolute before:start-1 before:inset-y-1.5 before:w-0.5 before:rounded-full before:bg-primary before:opacity-0 before:transition-opacity focus:before:opacity-100 data-open:before:opacity-100 data-[variant=destructive]:focus:before:bg-destructive',
      props.class,
    )"
  >
    <slot />
    <ChevronRightIcon class="cn-rtl-flip ms-auto" />
  </DropdownMenuSubTrigger>
</template>
