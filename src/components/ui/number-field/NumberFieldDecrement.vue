<script setup lang="ts">
import { MinusIcon } from "@/lib/icons";

import type { NumberFieldDecrementProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { NumberFieldDecrement, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"
import { i18n } from "@/lib/i18n";

const t = i18n.global.t;

const props = defineProps<NumberFieldDecrementProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <NumberFieldDecrement data-slot="decrement" :aria-label="t('numberField.decrement')" v-bind="forwarded" :class="cn('absolute top-1/2 start-1 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground active:bg-accent/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-30', props.class)">
    <slot>
      <MinusIcon class="h-3.5 w-3.5" />
    </slot>
  </NumberFieldDecrement>
</template>
