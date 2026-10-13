<script setup lang="ts">
import { CheckIcon } from "@/lib/icons";

import type { SelectItemProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { SelectItem, SelectItemIndicator, SelectItemText, useForwardProps } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<SelectItemProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <SelectItem
    data-slot="select-item"
    v-bind="forwardedProps"
    :class="
      cn(
        // The dropdown menu's row: a primary bar on the start edge while
        // focused, the check on the end edge marking what is chosen (in the
        // primary, the row in medium weight), room to press on every side.
        'focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-[state=checked]:font-medium gap-2 rounded-md py-1.5 pe-8 ps-2.5 text-sm [&_svg:not([class*=size-])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 relative flex w-full cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 before:absolute before:start-1 before:inset-y-1.5 before:w-0.5 before:rounded-full before:bg-primary before:opacity-0 before:transition-opacity focus:before:opacity-100',
        props.class,
      )
    "
  >
    <span
      class="pointer-events-none absolute end-2 flex size-4 items-center justify-center text-primary"
    >
      <SelectItemIndicator>
        <slot name="indicator-icon">
          <CheckIcon class="pointer-events-none" stroke-width="2.5" />
        </slot>
      </SelectItemIndicator>
    </span>

    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
