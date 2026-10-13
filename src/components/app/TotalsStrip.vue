<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/app/StatCard.vue";
import { i18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * The totals strip above a list: one row per currency present in the WHOLE
 * filtered set (server totals — every filter applied, all pages, never just
 * the page on screen). Each row is a small heading (the currency + the scope
 * note) over one StatCard per figure, so the number is the big thing on the
 * tile and the stored decimals sit in its tooltip. Money never adds across
 * currencies, so a mixed list shows several rows. Renders nothing for an empty
 * `totals` (the table says so). `dimmed` greys the strip while the list
 * refetches, without hiding the last figures.
 */
export interface TotalsGroup {
  /** Already-localized currency name or code, shown as the row's badge and each tile's unit. */
  currency: string;
  items: { label: string; value: number }[];
}

defineProps<{ totals: TotalsGroup[]; dimmed?: boolean }>();

const t = i18n.global.t;

/** StatCard parses strings through money.ts; exponent notation would not parse. */
function asString(value: number): string {
  return String(value).includes("e") ? value.toFixed(5) : String(value);
}

/** Literal class strings (Tailwind reads them from the source): tiles across, by how many there are. */
const COLUMNS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
  5: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  6: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
};
</script>

<template>
  <div
    v-if="totals.length"
    :class="cn('space-y-4 transition-opacity', dimmed && 'opacity-60')"
    :data-dimmed="dimmed || undefined"
  >
    <section v-for="group in totals" :key="group.currency" class="space-y-2">
      <h3 class="flex flex-wrap items-center gap-2 text-sm font-semibold">
        <Badge variant="outline">{{ group.currency }}</Badge>
        <span class="ms-auto text-xs font-normal text-muted-foreground">
          {{ t("totalsStrip.scope") }}
        </span>
      </h3>
      <div
        class="grid gap-3"
        :class="COLUMNS[group.items.length] ?? 'sm:grid-cols-2 xl:grid-cols-4'"
      >
        <StatCard
          v-for="item in group.items"
          :key="item.label"
          :label="item.label"
          :value="asString(item.value)"
          :unit="group.currency"
        />
      </div>
    </section>
  </div>
</template>
