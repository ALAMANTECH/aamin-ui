<script setup lang="ts">
import { computed } from "vue";
import { formatAmountCell, moneyTitle, parseApiNumber } from "@/lib/money";

/**
 * One inline money figure: the digits in `.num` (up to 3 decimals, truncated
 * by money.ts — never rounded — with the stored 5 on hover only when they
 * differ), an optional leading sign and a muted unit. Accepts a number or an
 * API string ("311,843.61092"); a blank renders an em-dash.
 */
const props = withDefaults(
  defineProps<{
    value: number | string | null | undefined;
    /** Currency unit after the figure, already localized. */
    unit?: string;
    /** Show the magnitude only — the side is said in words next to it. */
    abs?: boolean;
    sign?: "+" | "−" | "";
  }>(),
  { unit: "", abs: false, sign: "" },
);

const shown = computed(() => {
  if (!props.abs) return props.value;
  const n = parseApiNumber(props.value);
  return n == null ? props.value : Math.abs(n);
});
</script>

<template>
  <span class="inline-flex items-baseline gap-1 whitespace-nowrap">
    <span v-if="sign">{{ sign }}</span>
    <span class="num" :title="moneyTitle(shown)">{{ formatAmountCell(shown) }}</span>
    <span v-if="unit" class="text-[0.75em] font-normal text-muted-foreground">{{ unit }}</span>
  </span>
</template>
