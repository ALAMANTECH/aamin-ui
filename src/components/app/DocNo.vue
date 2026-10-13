<script setup lang="ts">
import { computed } from "vue";

/**
 * A document number like "INV-2026-0042" (or "469 - ط /2026"). The digit runs
 * go in `.num` — wrapping the whole string in `.num` would force it LTR and an
 * Arabic reader would meet the year first. The root is a `<bdi>` (direction
 * auto from the first strong character), because each `.num` run is an
 * isolate and therefore bidi-neutral: without it, a Latin-prefixed code in an
 * RTL paragraph would display reversed ("0042-2026-INV"). Latin codes thus
 * render as one LTR run; Arabic-script numbers stay RTL. `wrap` lets a longer line (an entry's description) break across lines
 * instead of staying on one.
 */
const props = withDefaults(defineProps<{ value: string | null | undefined; wrap?: boolean }>(), {
  wrap: false,
});

const parts = computed(() =>
  (props.value ?? "")
    .split(/(\d+)/)
    .filter((part) => part !== "")
    .map((text) => ({ text, digits: /^\d+$/.test(text) })),
);
</script>

<template>
  <bdi :class="wrap ? undefined : 'whitespace-nowrap'">
    <template v-for="(part, index) in parts" :key="index">
      <span v-if="part.digits" class="num">{{ part.text }}</span>
      <template v-else>{{ part.text }}</template>
    </template>
  </bdi>
</template>
