<script setup lang="ts">
import type { TabsIndicatorProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import type { TabsListVariants } from ".";
import { reactiveOmit } from "@vueuse/core";
import { TabsIndicator } from "reka-ui";
import { cn } from "@/lib/utils";

/*
  Animated active-tab indicator, auto-rendered by TabsList. Reka publishes the
  active trigger's geometry as CSS vars; offsetLeft/translateX are both
  physical, so the pair stays correct in RTL without logical utilities. Written
  as arbitrary properties on purpose: the shadcn-vue CLI's rtl transform rewrites
  physical translate utilities and would inject a broken `rtl:` twin.
  Horizontal-orientation styling only (the kit has no vertical tabs).
*/
const props = withDefaults(
  defineProps<
    TabsIndicatorProps & {
      class?: HTMLAttributes["class"];
      variant?: TabsListVariants["variant"];
    }
  >(),
  {
    variant: "default",
  },
);

const delegatedProps = reactiveOmit(props, "class", "variant");
</script>

<template>
  <TabsIndicator
    data-slot="tabs-indicator"
    v-bind="delegatedProps"
    :class="
      cn(
        'pointer-events-none absolute [left:0] [width:var(--reka-tabs-indicator-size)] [translate:var(--reka-tabs-indicator-position)] transition-[translate,width] duration-300 ease-out',
        variant === 'default'
          ? 'inset-y-1 rounded-lg bg-primary/15 dark:bg-primary/20'
          : '-bottom-px h-0.5 rounded-full bg-primary',
        props.class,
      )
    "
  />
</template>
