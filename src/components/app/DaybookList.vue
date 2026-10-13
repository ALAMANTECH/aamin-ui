<script lang="ts">
import type { Component } from "vue";

/**
 * How one kind of entry looks: the icon, the token tone (icon + amount), and
 * the sign printed before the amount (1 → "+", -1 → "−", 0 → none). Kinds
 * are caller-supplied — the list never infers them from backend labels.
 */
export interface DaybookKind {
  icon: Component;
  tone: "success" | "destructive" | "warning" | "muted" | "primary";
  sign: 1 | -1 | 0;
}

export interface DaybookEntry {
  id: string | number;
  /** ISO / MySQL datetime — the calendar day groups the rows. */
  at: string;
  /** Key into the `kinds` map. Unknown kinds render muted and unsigned. */
  kind: string;
  label: string;
  /** Magnitude; the sign comes from the kind. */
  amount: number;
  /** Unit printed after the amount (e.g. "د.ل"). */
  currency?: string;
  /** Router path — the whole row becomes a link. */
  link?: string;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { WalletIcon } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import Amount from "@/components/app/Amount.vue";
import CompactPager from "@/components/app/CompactPager.vue";
import EmptyState from "@/components/app/EmptyState.vue";
import { dayKey, formatDateYmd, formatTimeAgo, formatTimeHm } from "@/lib/datetime";
import { i18n } from "@/lib/i18n";

/**
 * Day-grouped ledger / activity feed: one framed section per calendar day
 * (header = the date + that day's total, see `dayTotal`), one row per entry — kind icon,
 * label, time + "time ago", and the signed amount in the kind's tone. The host
 * owns paging (server-side): `pageIndex`/`pageCount`/`rowCount` drive a
 * CompactPager under the list. `refreshing` dims the list behind a spinner
 * while keeping the stale rows on screen.
 */
const props = withDefaults(
  defineProps<{
    rows: DaybookEntry[];
    kinds: Record<string, DaybookKind>;
    loading?: boolean;
    refreshing?: boolean;
    /** Load failure message — shows the error panel when there are no rows. */
    error?: string;
    emptyTitle?: string;
    loadErrorTitle?: string;
    pageIndex?: number;
    pageCount?: number;
    rowCount?: number;
    /**
     * Day-header badge:
     * - `"net"` (default) — Σ kind.sign × |amount|, signed and toned
     *   (positive success, negative destructive, zero muted); sign-0 kinds add nothing.
     * - `"turnover"` — Σ |amount|, labelled as turnover (movement, not balance).
     * - `"count"` — the day's row count. `"none"` — no badge.
     * Net/turnover are hidden on a day that mixes currencies.
     */
    dayTotal?: "net" | "turnover" | "count" | "none";
    /** @deprecated Use `dayTotal`. `false` = `dayTotal: "count"`; ignored when `dayTotal` is set. */
    showDayTotal?: boolean;
  }>(),
  {
    loading: false,
    refreshing: false,
    error: "",
    emptyTitle: "",
    loadErrorTitle: "",
    pageIndex: 0,
    pageCount: 1,
    rowCount: 0,
    dayTotal: undefined,
    showDayTotal: undefined,
  },
);

const emit = defineEmits<{
  retry: [];
  "update:pageIndex": [pageIndex: number];
}>();

const t = i18n.global.t;

const FALLBACK_KIND: DaybookKind = { icon: WalletIcon, tone: "muted", sign: 0 };

// Static strings so Tailwind sees every class.
const TONE_CLASS: Record<DaybookKind["tone"], string> = {
  success: "text-success",
  destructive: "text-destructive",
  warning: "text-warning",
  muted: "text-muted-foreground",
  primary: "text-primary",
};

const SIGN_GLYPH: Record<DaybookKind["sign"], "+" | "−" | ""> = { 1: "+", [-1]: "−", 0: "" };

const mode = computed<"net" | "turnover" | "count" | "none">(
  () => props.dayTotal ?? (props.showDayTotal === false ? "count" : "net"),
);

interface DayGroup {
  day: string;
  rows: DaybookEntry[];
  /** Net or turnover per `mode` — null when the day mixes currencies (or in count/none mode). */
  total: number | null;
  currency: string | undefined;
}

// Sums run on floats; settle them at money.ts's 5 stored decimals so
// +500.1 − 500.1 nets to an honest 0 instead of a signed 1e-13 residue.
const SCALE = 1e5;
const settle = (n: number) => Math.round(n * SCALE) / SCALE;

function dayTotalOf(rows: DaybookEntry[]): number | null {
  if (mode.value !== "net" && mode.value !== "turnover") return null;
  if (new Set(rows.map((r) => r.currency ?? "")).size !== 1) return null;
  let sum = 0;
  for (const r of rows) {
    if (!Number.isFinite(r.amount)) continue;
    const weight = mode.value === "net" ? kindOf(r).sign : 1;
    sum += weight * Math.abs(r.amount);
  }
  // `|| 0` folds −0 into 0.
  return settle(sum) || 0;
}

const days = computed<DayGroup[]>(() => {
  const map = new Map<string, DaybookEntry[]>();
  for (const row of props.rows) {
    const day = dayKey(row.at);
    const list = map.get(day) ?? [];
    list.push(row);
    map.set(day, list);
  }
  return [...map.entries()].map(([day, rows]) => ({
    day,
    rows,
    total: dayTotalOf(rows),
    currency: rows[0]?.currency,
  }));
});

function totalSign(total: number): "+" | "−" | "" {
  if (mode.value !== "net") return "";
  return total > 0 ? "+" : total < 0 ? "−" : "";
}

function totalTone(total: number): string {
  if (mode.value !== "net") return "";
  return TONE_CLASS[total > 0 ? "success" : total < 0 ? "destructive" : "muted"];
}

const showPager = computed(() => props.pageCount > 1);

function kindOf(row: DaybookEntry): DaybookKind {
  return props.kinds[row.kind] ?? FALLBACK_KIND;
}

function toneClass(row: DaybookEntry) {
  return TONE_CLASS[kindOf(row).tone];
}

function ago(value: string) {
  // -u-nu-latn: Latin digits in every locale, like the rest of the kit.
  return formatTimeAgo(value, `${i18n.global.locale.value}-u-nu-latn`);
}
</script>

<template>
  <div class="relative">
    <EmptyState
      v-if="error && !rows.length"
      state="error"
      :title="loadErrorTitle || t('daybook.loadError')"
      :error-message="error"
      @retry="emit('retry')"
    />

    <div v-else-if="loading" class="space-y-3">
      <Skeleton v-for="n in 3" :key="n" class="h-28 w-full rounded-lg" />
    </div>

    <div
      v-else
      :aria-busy="refreshing"
      class="transition-opacity"
      :class="refreshing ? 'opacity-40' : ''"
    >
      <div v-if="days.length" class="space-y-4">
        <section
          v-for="group in days"
          :key="group.day"
          class="overflow-hidden rounded-lg border border-border/80"
        >
          <header
            class="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2"
          >
            <p class="text-xs font-semibold tracking-wide text-muted-foreground">
              <span class="num">{{ formatDateYmd(group.day) }}</span>
            </p>
            <Badge v-if="group.total !== null" variant="secondary" class="gap-1 font-normal">
              {{ mode === "net" ? t("daybook.dayNet") : t("daybook.dayTurnover") }}
              <Amount
                data-slot="day-total"
                :class="totalTone(group.total)"
                :value="group.total"
                abs
                :sign="totalSign(group.total)"
                :unit="group.currency"
              />
            </Badge>
            <Badge v-else-if="mode === 'count'" variant="secondary" class="font-normal">
              <span data-slot="day-count" class="num">{{ group.rows.length }}</span>
            </Badge>
          </header>
          <ul class="divide-y divide-border/70">
            <li v-for="row in group.rows" :key="row.id">
              <component
                :is="row.link ? RouterLink : 'div'"
                :to="row.link || undefined"
                class="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/30"
              >
                <span
                  class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/60"
                  :class="toneClass(row)"
                >
                  <component :is="kindOf(row).icon" class="size-3.5" aria-hidden="true" />
                </span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium">{{ row.label }}</p>
                  <p class="truncate text-xs text-muted-foreground">
                    <span class="num">{{ formatTimeHm(row.at) }}</span>
                    · <span>{{ ago(row.at) }}</span>
                  </p>
                </div>
                <!-- Amount: money.ts truncation + hover, and an inline-flex row so
                     the sign sits at the start in both directions. -->
                <p class="shrink-0 text-sm font-semibold" :class="toneClass(row)">
                  <Amount
                    :value="row.amount"
                    abs
                    :sign="SIGN_GLYPH[kindOf(row).sign]"
                    :unit="row.currency"
                  />
                </p>
              </component>
            </li>
          </ul>
        </section>
      </div>

      <div v-else class="py-6">
        <EmptyState :title="emptyTitle || t('daybook.empty')" />
      </div>

      <CompactPager
        v-if="showPager"
        class="mt-3 px-1"
        :page-index="pageIndex"
        :page-count="pageCount"
        :busy="refreshing"
        @update:page-index="(next: number) => emit('update:pageIndex', next)"
      >
        <template #label>
          <span class="num">{{ rowCount }}</span>
          {{ t("daybook.rows") }}
        </template>
      </CompactPager>
    </div>

    <div
      v-if="refreshing"
      class="pointer-events-none absolute inset-0 z-10 grid place-items-center"
      role="status"
      :aria-label="t('common.loading')"
    >
      <Spinner size="lg" class="text-primary" />
    </div>
  </div>
</template>
