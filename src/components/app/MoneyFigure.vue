<script setup lang="ts">
import { computed } from "vue";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatMoney, formatMoneyExact, moneySizeClass, type MoneySize } from "@/lib/money";

defineOptions({ inheritAttrs: false });

/**
 * The money headline: the full grouped figure ("154,863,047.5"), never
 * compacted — the business reads exact numbers. Up to 3 decimals on screen,
 * the stored 5 in a tooltip, and only when that tooltip has something new to
 * say. Long values step the font down (see moneySizeClass) instead of
 * overflowing the tile.
 */
const props = withDefaults(
  defineProps<{
    value: number;
    currency: string;
    /** Exact server string for the tooltip; defaults to formatMoneyExact(value). */
    exact?: string;
    size?: MoneySize;
    tone?: "default" | "destructive" | "success";
  }>(),
  { exact: undefined, size: "md", tone: "default" },
);

const text = computed(() => formatMoney(props.value));
const exactText = computed(() => props.exact ?? formatMoneyExact(props.value));
/** No hover affordance when the tooltip would only repeat the headline. */
const truncated = computed(() => exactText.value !== text.value);
const numberClass = computed(() => moneySizeClass(text.value, props.size));

const TONE_CLASS: Record<NonNullable<typeof props.tone>, string> = {
  default: "text-foreground",
  destructive: "text-destructive",
  success: "text-success",
};
</script>

<template>
  <Tooltip v-if="truncated">
    <TooltipTrigger as-child>
      <p :class="cn('m-0 flex cursor-help flex-wrap items-baseline gap-x-1.5', $attrs.class)">
        <span
          class="num leading-none font-semibold tracking-tight"
          :class="[numberClass, TONE_CLASS[tone]]"
          >{{ text }}</span
        >
        <span class="text-muted-foreground" :class="size === 'sm' ? 'text-[10px]' : 'text-xs'">
          {{ currency }}
        </span>
      </p>
    </TooltipTrigger>
    <TooltipContent>
      <span class="num">{{ exactText }}</span> {{ currency }}
    </TooltipContent>
  </Tooltip>
  <p v-else :class="cn('m-0 flex flex-wrap items-baseline gap-x-1.5', $attrs.class)">
    <span
      class="num leading-none font-semibold tracking-tight"
      :class="[numberClass, TONE_CLASS[tone]]"
      >{{ text }}</span
    >
    <span class="text-muted-foreground" :class="size === 'sm' ? 'text-[10px]' : 'text-xs'">
      {{ currency }}
    </span>
  </p>
</template>
