<script setup lang="ts">
import type { TabsListProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import type { TabsListVariants } from ".";
import { reactiveOmit, usePreferredReducedMotion } from "@vueuse/core";
import { TabsList } from "reka-ui";
import { onBeforeUnmount, onMounted, useTemplateRef } from "vue";
import { cn } from "@/lib/utils";
import { tabsListVariants } from ".";
import TabsIndicator from "./TabsIndicator.vue";

const props = withDefaults(
  defineProps<
    TabsListProps & {
      class?: HTMLAttributes["class"];
      variant?: TabsListVariants["variant"];
    }
  >(),
  {
    variant: "default",
  },
);

const delegatedProps = reactiveOmit(props, "class", "variant");

// On phones the list is a horizontal scroll strip: keep the active trigger
// fully visible whenever it changes (tap on a half-clipped tab, or a route
// that opens on a later tab). Observed via data-state so it works without
// reaching into reka's context. Native `inline: nearest` is RTL-aware.
const listEl = useTemplateRef<InstanceType<typeof TabsList>>("list");
const motion = usePreferredReducedMotion();

function revealActive() {
  const root = (listEl.value as unknown as { $el?: HTMLElement } | null)?.$el;
  if (!root || root.scrollWidth <= root.clientWidth) return;
  const active = root.querySelector<HTMLElement>('[data-slot="tabs-trigger"][data-state="active"]');
  active?.scrollIntoView({
    block: "nearest",
    inline: "nearest",
    behavior: motion.value === "reduce" ? "auto" : "smooth",
  });
}

let observer: MutationObserver | undefined;
onMounted(() => {
  const root = (listEl.value as unknown as { $el?: HTMLElement } | null)?.$el;
  if (!root) return;
  revealActive();
  observer = new MutationObserver(revealActive);
  observer.observe(root, { subtree: true, attributes: true, attributeFilter: ["data-state"] });
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <TabsList
    ref="list"
    data-slot="tabs-list"
    :data-variant="variant"
    v-bind="delegatedProps"
    :class="cn(tabsListVariants({ variant }), props.class)"
  >
    <TabsIndicator :variant="variant" />
    <slot />
  </TabsList>
</template>
