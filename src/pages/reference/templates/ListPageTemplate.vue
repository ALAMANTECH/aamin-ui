<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useTemplateRef, watch } from "vue";
import type { ColumnDef } from "@tanstack/vue-table";
import { useI18n } from "vue-i18n";
import { PlusIcon, SearchIcon, WalletIcon } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import DataTable from "@/components/app/datatable/DataTable.vue";
import DataTableViewOptions from "@/components/app/datatable/DataTableViewOptions.vue";
import DocNo from "@/components/app/DocNo.vue";
import EmptyState from "@/components/app/EmptyState.vue";
import FilterChips, { type FilterChip } from "@/components/app/FilterChips.vue";
import FilterSheet from "@/components/app/FilterSheet.vue";
import PageHeader from "@/components/app/PageHeader.vue";
import Amount from "@/components/app/Amount.vue";
import StatusBadge from "@/components/app/StatusBadge.vue";
import { formatDateYmd } from "@/lib/datetime";
import { normalizeArabic } from "@/lib/utils";

/**
 * LIST PAGE TEMPLATE — copy this file to start a list screen.
 * Anatomy (measured from the production Aamin dashboard; see docs/pages.md):
 *   page stack `space-y-6` · PageHeader (breadcrumbs from the nav root, ONE
 *   `glow-primary` action whose label hides on phones) · DataTable whose
 *   #toolbar holds search → FilterSheet (below xl) / inline filters (xl+) →
 *   view options at the end → FilterChips on their own row · `#empty` is a
 *   bare EmptyState · states: skeleton in the final shape → EmptyState error →
 *   dimmed table + spinner while refreshing.
 * `data-anatomy` attributes only feed the /reference/page-anatomy overlay —
 * delete them in your copy, along with `previewState`.
 */
type PreviewState = "ready" | "loading" | "refreshing" | "error" | "empty";
const props = withDefaults(defineProps<{ previewState?: PreviewState }>(), {
  previewState: undefined,
});

const { t } = useI18n();
const dataTable = useTemplateRef("dataTable");

const DETAIL_PATH = "/reference/templates/detail";

interface Row {
  id: number;
  code: string;
  /** Placeholder names are i18n keys (`templates.sample.names.*`). */
  name: string;
  currency: "LYD" | "USD";
  balance: number;
  outstanding: number;
  status: "active" | "suspended";
  updatedAt: string;
}

const NAMES = ["atlas", "cedar", "harbor", "meridian", "summit", "oasis"] as const;
const SAMPLE: Row[] = NAMES.flatMap((name, i) =>
  (["LYD", "USD"] as const).map((currency, j) => {
    const id = i * 2 + j + 1;
    return {
      id,
      code: `ACC-${String(1040 + id).padStart(5, "0")}`,
      name: `templates.sample.names.${name}`,
      currency,
      balance: (id * 7919.25) % 48000,
      outstanding: (id * 3301.5) % 12500,
      status: id % 5 === 0 ? "suspended" : "active",
      updatedAt: `2026-09-${String(28 - id).padStart(2, "0")}T10:00:00Z`,
    };
  }),
);

/* ---- Data — replace this block with your data layer (server-mode DataTable props). ---- */
const data = ref<Row[]>([]);
const isInitialLoading = ref(false);
const isRefreshing = ref(false);
const failed = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

function show(state: PreviewState) {
  data.value = state === "ready" || state === "refreshing" ? SAMPLE : [];
  isInitialLoading.value = state === "loading";
  isRefreshing.value = state === "refreshing";
  failed.value = state === "error";
}

function refresh() {
  clearTimeout(timer);
  show(data.value.length ? "refreshing" : "loading");
  timer = setTimeout(() => show(props.previewState ?? "ready"), 600);
}

watch(
  () => props.previewState,
  (state) => {
    clearTimeout(timer);
    if (state) show(state);
    else refresh();
  },
  { immediate: true },
);
onBeforeUnmount(() => clearTimeout(timer));
/* -------------------------------------------------------------------------- */

/* ---- Search + filters (server pages send these as query params) ---- */
const ALL = "all";
const searchDraft = ref("");
const search = ref("");
const filters = ref({ status: ALL, currency: ALL });

const filterDefs = computed(() => [
  {
    key: "status" as const,
    label: t("templates.list.filters.status"),
    options: [
      { value: "active", label: t("status.active") },
      { value: "suspended", label: t("status.suspended") },
    ],
  },
  {
    key: "currency" as const,
    label: t("templates.list.filters.currency"),
    options: [
      { value: "LYD", label: t("templates.unit.LYD") },
      { value: "USD", label: t("templates.unit.USD") },
    ],
  },
]);

const filterCount = computed(() => Object.values(filters.value).filter((v) => v !== ALL).length);
const filtered = computed(() => filterCount.value > 0 || search.value !== "");

function submitSearch() {
  search.value = searchDraft.value.trim();
}

function clearSearch() {
  searchDraft.value = "";
  search.value = "";
}

function resetFilters() {
  filters.value = { status: ALL, currency: ALL };
  clearSearch();
}

const chips = computed<FilterChip[]>(() => {
  const out: FilterChip[] = [];
  for (const def of filterDefs.value) {
    const value = filters.value[def.key];
    if (value === ALL) continue;
    out.push({
      id: def.key,
      text: def.options.find((o) => o.value === value)?.label ?? value,
      clear: () => (filters.value = { ...filters.value, [def.key]: ALL }),
    });
  }
  if (search.value) out.push({ id: "search", text: `"${search.value}"`, clear: clearSearch });
  return out;
});

const rows = computed(() => {
  const term = normalizeArabic(search.value);
  return data.value.filter(
    (row) =>
      (filters.value.status === ALL || row.status === filters.value.status) &&
      (filters.value.currency === ALL || row.currency === filters.value.currency) &&
      (!term || normalizeArabic(`${t(row.name)} ${row.code}`).includes(term)),
  );
});

/* ---- Columns (computed: labels follow the UI language) ---- */
const columns = computed<ColumnDef<Row, unknown>[]>(() => [
  {
    id: "name",
    accessorFn: (row) => t(row.name),
    header: t("templates.list.columns.name"),
    enableHiding: false,
    meta: { label: t("templates.list.columns.name"), mobile: "title" },
  },
  {
    accessorKey: "code",
    header: t("templates.list.columns.code"),
    enableSorting: false,
    meta: { label: t("templates.list.columns.code") },
  },
  {
    accessorKey: "currency",
    header: t("templates.list.columns.currency"),
    enableSorting: false,
    meta: { label: t("templates.list.columns.currency"), class: "max-lg:hidden" },
  },
  {
    accessorKey: "balance",
    header: t("templates.list.columns.balance"),
    meta: { label: t("templates.list.columns.balance"), mobile: "trailing" },
  },
  {
    accessorKey: "outstanding",
    header: t("templates.list.columns.outstanding"),
    meta: {
      label: t("templates.list.columns.outstanding"),
      class: "max-md:hidden",
      mobile: "stat",
    },
  },
  {
    accessorKey: "updatedAt",
    header: t("templates.list.columns.updated"),
    meta: { label: t("templates.list.columns.updated"), class: "max-xl:hidden", mobile: "hidden" },
  },
  {
    accessorKey: "status",
    header: t("templates.list.columns.status"),
    enableSorting: false,
    meta: { label: t("templates.list.columns.status"), mobile: "trailing", mobileLabeled: false },
  },
]);

const unit = (row: Row) => t(`templates.unit.${row.currency}`);
</script>

<template>
  <div class="space-y-6" data-anatomy="page">
    <PageHeader
      :title="t('templates.list.title')"
      :description="t('templates.list.description')"
      :breadcrumbs="[{ label: t('nav.home'), to: '/' }, { label: t('templates.list.title') }]"
      data-anatomy="header"
    >
      <template #actions>
        <!-- The page's ONE glow-primary. Phones keep the icon, the label hides. -->
        <Button class="glow-primary" :aria-label="t('templates.list.new')">
          <PlusIcon class="size-4" aria-hidden="true" />
          <span class="max-sm:hidden">{{ t("templates.list.new") }}</span>
        </Button>
      </template>
    </PageHeader>

    <!-- Error (nothing loaded): the EmptyState error panel with retry. -->
    <EmptyState
      v-if="failed && !data.length"
      state="error"
      :title="t('templates.states.loadFailed')"
      :error-message="t('templates.states.loadFailedHint')"
      data-testid="list-error"
      @retry="refresh()"
    />

    <!-- First load: skeletons in the final shape (toolbar row + table rows). -->
    <div v-else-if="isInitialLoading" class="space-y-3" data-testid="list-loading">
      <div class="flex flex-wrap items-center gap-2">
        <Skeleton class="h-9 w-full sm:w-64" />
        <Skeleton class="ms-auto h-9 w-24" />
      </div>
      <div class="space-y-2 overflow-hidden rounded-xl border p-4">
        <Skeleton v-for="n in 8" :key="n" class="h-9 w-full" />
      </div>
    </div>

    <div v-else class="relative" data-anatomy="table">
      <DataTable
        ref="dataTable"
        storage-key="reference-list-template"
        :columns="columns"
        :data="rows"
        :get-row-id="(row) => String(row.id)"
        :row-href="() => DETAIL_PATH"
        :aria-busy="isRefreshing"
        :class="isRefreshing ? 'opacity-40 transition-opacity' : 'transition-opacity'"
      >
        <template #toolbar>
          <form
            class="flex min-w-0 flex-1 items-center gap-2 sm:w-auto sm:flex-none"
            @submit.prevent="submitSearch"
          >
            <div class="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
              <SearchIcon
                class="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                v-model="searchDraft"
                :placeholder="t('templates.list.searchPlaceholder')"
                class="ps-8"
                maxlength="100"
                :aria-label="t('templates.list.searchPlaceholder')"
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              class="shrink-0"
              :disabled="isRefreshing"
              :aria-label="t('common.search')"
            >
              <SearchIcon class="size-4" aria-hidden="true" />
              <span class="max-sm:hidden">{{ t("common.search") }}</span>
            </Button>
          </form>

          <!-- Below xl: filters live in the bottom sheet (stacked fields). -->
          <FilterSheet class="xl:hidden" :count="filterCount" @clear="resetFilters">
            <div class="space-y-4">
              <div v-for="def in filterDefs" :key="def.key" class="space-y-2">
                <Label :for="`list-filter-${def.key}`">{{ def.label }}</Label>
                <Select v-model="filters[def.key]">
                  <SelectTrigger :id="`list-filter-${def.key}`" class="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem :value="ALL">{{ t("templates.list.filters.all") }}</SelectItem>
                    <SelectItem v-for="o in def.options" :key="o.value" :value="o.value">
                      {{ o.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FilterSheet>
          <!-- xl+: the same fields inline in the toolbar. -->
          <div class="flex items-center gap-2 max-xl:hidden">
            <Select v-for="def in filterDefs" :key="def.key" v-model="filters[def.key]">
              <SelectTrigger class="w-40" :aria-label="def.label">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="ALL"
                  >{{ def.label }}: {{ t("templates.list.filters.all") }}</SelectItem
                >
                <SelectItem v-for="o in def.options" :key="o.value" :value="o.value">
                  {{ o.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="ms-auto flex shrink-0 items-center gap-2">
            <DataTableViewOptions v-if="dataTable" :table="dataTable.table" />
          </div>
          <FilterChips :chips="chips" class="order-last basis-full" @clear-all="resetFilters" />
        </template>

        <template #cell-name="{ row }">
          <!-- click.stop: the row itself navigates too. -->
          <RouterLink
            :to="DETAIL_PATH"
            class="truncate font-medium text-primary underline-offset-4 hover:underline"
            @click.stop
          >
            {{ t(row.name) }}
          </RouterLink>
        </template>
        <template #cell-code="{ row }">
          <DocNo :value="row.code" class="text-muted-foreground" />
        </template>
        <template #cell-currency="{ row }">
          <Badge variant="outline" class="font-normal">{{ unit(row) }}</Badge>
        </template>
        <template #cell-balance="{ row }">
          <Amount :value="row.balance" :unit="unit(row)" class="font-semibold" />
        </template>
        <template #cell-outstanding="{ row }">
          <Amount :value="row.outstanding" :unit="unit(row)" />
        </template>
        <template #cell-updatedAt="{ row }">
          <span class="num text-muted-foreground">{{ formatDateYmd(row.updatedAt) }}</span>
        </template>
        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" />
        </template>

        <template #empty>
          <EmptyState
            bare
            :icon="WalletIcon"
            :title="filtered ? t('templates.states.emptyFiltered') : t('templates.states.empty')"
            :hint="
              filtered ? t('templates.states.emptyFilteredHint') : t('templates.states.emptyHint')
            "
            data-testid="list-empty"
          >
            <Button v-if="filtered" variant="outline" size="sm" @click="resetFilters">
              {{ t("common.clearFilters") }}
            </Button>
            <Button v-else variant="outline" size="sm">{{ t("templates.list.new") }}</Button>
          </EmptyState>
        </template>
      </DataTable>

      <!-- Refreshing: the table dims in place and a spinner sits over it. -->
      <div
        v-if="isRefreshing"
        class="pointer-events-none absolute inset-0 z-10 grid place-items-center"
        role="status"
        :aria-label="t('common.loading')"
      >
        <Spinner size="lg" class="text-primary" />
      </div>
    </div>
  </div>
</template>
