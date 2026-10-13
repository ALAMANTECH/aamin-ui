<script setup lang="ts" generic="Type extends 'text' | 'number' = 'text'">
import type { PinInputRootEmits, PinInputRootProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { PinInputRoot, useForwardPropsEmits } from "reka-ui";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<PinInputRootProps<Type> & { class?: HTMLAttributes["class"] }>(),
  {
    otp: true,
  },
);
const emits = defineEmits<PinInputRootEmits<Type>>();

const delegatedProps = reactiveOmit(props, "class");

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <PinInputRoot
    :otp="props.otp"
    data-slot="pin-input"
    v-bind="forwarded"
    :class="
      cn(
        'flex w-fit max-w-full items-center gap-1.5 has-disabled:opacity-50 disabled:cursor-not-allowed sm:gap-2',
        props.class,
      )
    "
  >
    <slot />
  </PinInputRoot>
</template>
