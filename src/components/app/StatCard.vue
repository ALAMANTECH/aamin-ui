<script setup lang="ts">
import { computed, type Component } from "vue";
import { TrendingDownIcon, TrendingUpIcon, TriangleAlertIcon } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
// i18n.global (not useI18n) so the unit-tested composite mounts without the plugin.
import { i18n } from "@/lib/i18n";
import { moneyFigure, moneySizeClass } from "@/lib/money";
import Sparkline from "./Sparkline.vue";

const props = withDefaults(
  defineProps<{
    label: string;
    value: string;
    /** Unit rendered after the value (e.g. "د.ل"). */
    unit?: string;
    /** Signed percentage; sign drives color and arrow. */
    delta?: number;
    deltaLabel?: string;
    trend?: number[];
    icon?: Component;
    /** Shows a skeleton in place of value/delta. Label and icon stay put. */
    loading?: boolean;
    /** Shows a destructive message + retry instead of value/delta. */
    error?: string;
    /** One quiet line under the figure saying what it counts. */
    hint?: string;
  }>(),
  {
    unit: "",
    delta: undefined,
    deltaLabel: "",
    trend: undefined,
    icon: undefined,
    loading: false,
    error: undefined,
    hint: undefined,
  },
);

const emit = defineEmits<{ retry: [] }>();

const t = i18n.global.t;

// Money renders in full — up to 3 decimals, the stored 5 on hover, and the
// font steps down rather than the figure scrolling sideways. Non-numeric
// values (dates, ratios, "—") fall through to the plain path untouched.
const figure = computed(() => moneyFigure(props.value));
const numberClass = computed(() =>
  figure.value ? moneySizeClass(figure.value.text, "stat") : "text-2xl",
);
</script>

<template>
  <Card class="group relative gap-0 overflow-hidden p-5 transition-colors hover:border-primary/30">
    <div class="flex items-start justify-between gap-3">
      <p class="text-[13px] font-medium text-muted-foreground">{{ label }}</p>
      <span
        v-if="icon"
        class="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110"
      >
        <component :is="icon" class="size-4" />
      </span>
    </div>

    <!-- Error -->
    <div v-if="error" class="mt-3 space-y-2.5">
      <p class="flex items-start gap-1.5 text-xs text-destructive">
        <TriangleAlertIcon class="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        {{ error }}
      </p>
      <Button variant="outline" size="xs" @click="emit('retry')">{{ t("common.retry") }}</Button>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="mt-3 space-y-2">
      <Skeleton class="h-7 w-24" />
      <Skeleton class="h-3.5 w-20" />
    </div>

    <!-- Data -->
    <div v-else class="mt-3 flex items-end justify-between gap-3">
      <div class="min-w-0">
        <!-- Money past 3 decimals: the stored value lives in the tooltip. -->
        <Tooltip v-if="figure?.truncated">
          <TooltipTrigger as-child>
            <p class="flex cursor-help items-baseline gap-1.5 font-semibold whitespace-nowrap">
              <span class="num leading-none tracking-tight" :class="numberClass">{{
                figure.text
              }}</span>
              <span v-if="unit" class="text-xs font-normal text-muted-foreground">{{ unit }}</span>
            </p>
          </TooltipTrigger>
          <TooltipContent>
            <span class="num">{{ figure.exact }}</span> {{ unit }}
          </TooltipContent>
        </Tooltip>
        <!-- scroll-x: a non-money value with no shrink ramp still scrolls
             sideways (thin indicator) instead of overflowing the card -->
        <p v-else class="scroll-x flex items-baseline gap-1.5 font-semibold whitespace-nowrap">
          <span class="num leading-none tracking-tight" :class="numberClass">{{
            figure ? figure.text : value
          }}</span>
          <span v-if="unit" class="text-xs font-normal text-muted-foreground">{{ unit }}</span>
        </p>
        <p
          v-if="delta !== undefined"
          class="mt-2 flex items-center gap-1 text-xs"
          :class="delta >= 0 ? 'text-success' : 'text-destructive'"
        >
          <TrendingUpIcon v-if="delta >= 0" class="size-3.5" aria-hidden="true" />
          <TrendingDownIcon v-else class="size-3.5" aria-hidden="true" />
          <span class="num">{{ delta >= 0 ? `+${delta}%` : `${delta}%` }}</span>
          <span v-if="deltaLabel" class="text-muted-foreground">{{ deltaLabel }}</span>
        </p>
        <!-- #footer: a tag that belongs to the figure (a balance's side). -->
        <div v-if="$slots.footer" class="mt-2"><slot name="footer" /></div>
        <p v-if="hint" class="mt-2 text-[11px] leading-snug text-muted-foreground">{{ hint }}</p>
      </div>
      <Sparkline
        v-if="trend"
        :data="trend"
        :color="delta !== undefined && delta < 0 ? 'var(--destructive)' : 'var(--chart-1)'"
        class="mb-1 shrink-0"
      />
    </div>
  </Card>
</template>
