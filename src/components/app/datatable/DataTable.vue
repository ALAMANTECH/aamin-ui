<script setup lang="ts" generic="T">
import { computed, ref, watch } from "vue";
import { useLocalStorage, useMediaQuery } from "@vueuse/core";
import type {
  Cell,
  Column,
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  Row,
  SortingState,
  VisibilityState,
} from "@tanstack/vue-table";
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronRightIcon,
  LayoutListIcon,
  Table2Icon,
} from "@/lib/icons";
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { valueUpdater } from "@/components/ui/table/utils";
import { i18n } from "@/lib/i18n";
import { formatStat } from "@/lib/money";
import DataTablePagination from "./DataTablePagination.vue";
import { isOfferedPageSize } from "./page-jump";

const t = i18n.global.t;

const props = withDefaults(
  defineProps<{
    columns: ColumnDef<T, unknown>[];
    data: T[];
    pageSize?: number;
    enableSelection?: boolean;
    /** Server-driven mode: pagination/sorting/filtering are manual and emitted
     *  upward instead of computed locally. See maintenance notes in the plan. */
    serverMode?: boolean;
    /** Total page count — required when `serverMode`. */
    pageCount?: number;
    /** Total row count — used when `serverMode` to derive the range text. */
    rowCount?: number;
    /** Two-way search string wired to TanStack's global filter. */
    globalFilter?: string;
    /** Controlled pagination — pass from a server-table composable so URL/`?page=`
     *  and search resets stay in sync with the footer pager. */
    pagination?: PaginationState;
    /** Controlled sorting — pass from a server-table composable when using server mode. */
    sorting?: SortingState;
    /** Stable row identity — pass when rows can be added/removed so selection
     *  survives reindexing (defaults to the row's array index). */
    getRowId?: (row: T, index: number) => string;
    /** When set, the whole row becomes clickable and navigates to this href
     *  (same target as the row's "view" action). Interactive cells must stop
     *  propagation so their own clicks don't also navigate. */
    rowHref?: (row: T) => string;
    /** Persist column visibility, the phone card/table choice and (for
     *  client-paginated tables) the page size in localStorage under
     *  `aamin:table:<key>:columns|mobileView|pageSize` so the layout survives
     *  reloads. Unset → nothing is stored. */
    storageKey?: string;
    /** Leading "#" column numbering the rows 1, 2, 3… across pages (page 2 of
     *  10-row pages starts at 11) so a reader can follow and quote a position.
     *  It is the visible order, not data — never sorted, hidden or exported. */
    rowNumbers?: boolean;
  }>(),
  {
    pageSize: 10,
    enableSelection: false,
    serverMode: false,
    pageCount: undefined,
    rowCount: undefined,
    globalFilter: "",
    pagination: undefined,
    sorting: undefined,
    getRowId: undefined,
    rowHref: undefined,
    storageKey: undefined,
    rowNumbers: true,
  },
);

const emit = defineEmits<{
  "update:globalFilter": [value: string];
  "update:sorting": [value: SortingState];
  "update:pagination": [value: PaginationState];
  "update:columnFilters": [value: ColumnFiltersState];
}>();

const sorting = ref<SortingState>(props.sorting ? [...props.sorting] : []);
const columnFilters = ref<ColumnFiltersState>([]);
// With a storageKey, visibility, the phone view and (client mode only) the page
// size live in localStorage so the admin's table layout survives reloads.
const columnVisibility = props.storageKey
  ? useLocalStorage<VisibilityState>(`aamin:table:${props.storageKey}:columns`, {})
  : ref<VisibilityState>({});
const rowSelection = ref<Record<string, boolean>>({});
// Phone view: ledger cards by default; a toolbar toggle swaps in the full
// (sideways-scrolling) table for the "I need the whole spreadsheet" moment.
// Persisted per table so the choice survives navigation.
const mobileView = props.storageKey
  ? useLocalStorage<"cards" | "table">(`aamin:table:${props.storageKey}:mobileView`, "cards")
  : ref<"cards" | "table">("cards");
// Storage is user-editable and outlives deploys: anything but a known view
// would hide both the cards and the table on phones.
if (mobileView.value !== "cards" && mobileView.value !== "table") mobileView.value = "cards";
// Client mode only: in server mode the parent fetches with its own page size,
// and a size restored here (without an update:pagination emit) would make the
// footer and row numbers disagree with the rows the server actually sent.
const storedPageSize =
  props.storageKey && !props.pagination && !props.serverMode
    ? useLocalStorage<number>(`aamin:table:${props.storageKey}:pageSize`, props.pageSize)
    : null;
// A corrupt or stale value ("abc" -> NaN, 0, -5, a size the footer no longer
// offers) must never become the page size: 0/NaN render an empty table with
// no pager to recover from.
const restoredPageSize = isOfferedPageSize(storedPageSize?.value)
  ? storedPageSize.value
  : props.pageSize;
const pagination = ref<PaginationState>(
  props.pagination ? { ...props.pagination } : { pageIndex: 0, pageSize: restoredPageSize },
);
if (storedPageSize) {
  watch(
    () => pagination.value.pageSize,
    (size) => {
      storedPageSize.value = size;
    },
  );
}
const globalFilter = ref(props.globalFilter ?? "");

function sameSorting(a: SortingState, b: SortingState): boolean {
  return (
    a.length === b.length &&
    a.every((entry, i) => entry.id === b[i]?.id && entry.desc === b[i]?.desc)
  );
}

// The search box usually lives in the page toolbar and binds `v-model:global-filter`;
// keep the internal state in sync when the prop changes (guarded to avoid loops).
watch(
  () => props.globalFilter,
  (value) => {
    if (value !== undefined && value !== globalFilter.value) globalFilter.value = value;
  },
);

watch(
  () => props.pagination,
  (value) => {
    if (!value) return;
    if (
      value.pageIndex !== pagination.value.pageIndex ||
      value.pageSize !== pagination.value.pageSize
    ) {
      pagination.value = { ...value };
    }
  },
);

watch(
  () => props.sorting,
  (value) => {
    if (value === undefined) return;
    if (!sameSorting(value, sorting.value)) sorting.value = [...value];
  },
);

const table = useVueTable({
  get data() {
    return props.data;
  },
  get columns() {
    return props.columns;
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: props.serverMode ? undefined : getSortedRowModel(),
  getFilteredRowModel: props.serverMode ? undefined : getFilteredRowModel(),
  getPaginationRowModel: props.serverMode ? undefined : getPaginationRowModel(),
  manualSorting: props.serverMode,
  manualFiltering: props.serverMode,
  manualPagination: props.serverMode,
  // Getters, not values: useVueTable reads options through a merge proxy that
  // re-evaluates on every access, so a getter tracks the prop while a plain
  // value freezes at mount. These two change on every search/filter (the
  // server returns a new total), and a frozen footer would keep reporting the
  // unfiltered count and page count forever.
  get pageCount() {
    return props.serverMode ? (props.pageCount ?? -1) : undefined;
  },
  get rowCount() {
    return props.serverMode ? props.rowCount : undefined;
  },
  getRowId: props.getRowId,
  enableRowSelection: props.enableSelection,
  // Keep the current page across data/filter changes; the page handles the
  // clamp explicitly (see plan 005 — stay on the current page when still valid,
  // never strand the pager on an empty page).
  autoResetPageIndex: false,
  onSortingChange: (updater) => {
    valueUpdater(updater, sorting);
    emit("update:sorting", sorting.value);
  },
  onColumnFiltersChange: (updater) => {
    valueUpdater(updater, columnFilters);
    emit("update:columnFilters", columnFilters.value);
  },
  onColumnVisibilityChange: (updater) => valueUpdater(updater, columnVisibility),
  onRowSelectionChange: (updater) => valueUpdater(updater, rowSelection),
  onPaginationChange: (updater) => {
    valueUpdater(updater, pagination);
    emit("update:pagination", pagination.value);
  },
  onGlobalFilterChange: (updater) => {
    valueUpdater(updater, globalFilter);
    emit("update:globalFilter", globalFilter.value);
  },
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
    get pagination() {
      return pagination.value;
    },
    get globalFilter() {
      return globalFilter.value;
    },
  },
});

// autoResetPageIndex is off so a background data refresh never yanks the admin
// back to page 1 — but that leaves the clamp to whoever owns filtering. Server
// mode: the page/composable that fetches resets to page 1 on a new search;
// CLIENT mode filters inside this component, so it clamps here. Without it, searching from page 3
// lands on an empty page that reads "no matching results" for a search that
// actually matched.
watch(
  () => (props.serverMode ? -1 : table.getPageCount()),
  (count) => {
    if (props.serverMode) return;
    const last = Math.max(0, count - 1);
    if (pagination.value.pageIndex > last) table.setPageIndex(last);
  },
);

/* ------------------------------ Selection glue --------------------------- */
const selectedRows = computed(() =>
  table.getFilteredSelectedRowModel().rows.map((row) => row.original),
);
const selectedCount = computed(() => selectedRows.value.length);
const totalRows = computed(() => table.getFilteredRowModel().rows.length);

function clearSelection() {
  table.resetRowSelection();
}
function selectAll() {
  table.toggleAllRowsSelected(true);
}

/* -------------------------------- Sort UX -------------------------------- */
function sortIcon(column: Column<T, unknown>) {
  const dir = column.getIsSorted();
  return dir === "asc" ? ArrowUpIcon : dir === "desc" ? ArrowDownIcon : ArrowUpDownIcon;
}
function ariaSort(column: Column<T, unknown>): "ascending" | "descending" | "none" {
  const dir = column.getIsSorted();
  return dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none";
}

// Exposed so a page toolbar can drive column filters (e.g. a status Select)
// and read selection without prop-drilling every piece of table state.
defineExpose({ table });

function isChromeColumn(id: string) {
  return id === "actions" || id === "select";
}

const RESPONSIVE_HIDE = /(?:^|\s)max-(?:sm|md|lg|xl):hidden(?=\s|$)/g;

/** Columns the desktop table already hides below lg/md — keep cards equally lean. */
function isDesktopOnlyColumn(column: Column<T, unknown>) {
  RESPONSIVE_HIDE.lastIndex = 0;
  return RESPONSIVE_HIDE.test(column.columnDef.meta?.class ?? "");
}

/**
 * The class a table header/cell gets. `meta.class` carries responsive hides
 * (`max-lg:hidden`) meant for narrow DESKTOP windows — but when a phone user
 * toggles the table on they asked for the whole spreadsheet, so below md the
 * hides are dropped and the table simply scrolls sideways. From md up the
 * class applies verbatim. (Decided in JS via a media query rather than by
 * composing `md:max-lg:hidden` at runtime — Tailwind only emits classes it
 * finds literally in source, so a built string would silently not exist.)
 */
const isMdUp = useMediaQuery("(min-width: 48rem)");
function tableCellClass(column: Column<T, unknown>) {
  const cls = column.columnDef.meta?.class ?? "";
  if (!cls) return undefined;
  if (isMdUp.value) return cls;
  RESPONSIVE_HIDE.lastIndex = 0;
  const stripped = cls.replace(RESPONSIVE_HIDE, " ").replace(/\s+/g, " ").trim();
  return stripped || undefined;
}

function columnLabel(column: Column<T, unknown>) {
  const label = column.columnDef.meta?.label;
  if (label) return label;
  return typeof column.columnDef.header === "string" ? column.columnDef.header : column.id;
}

function mobileRole(column: Column<T, unknown>) {
  return column.columnDef.meta?.mobile;
}

// A `max-*:hidden` class hides a column on narrow DESKTOP windows and, by
// default, drops it from cards too. An explicit mobile intent (a `mobile`
// role or `mobileLabeled`) overrides that: a column can be squeezed out of a
// 1024px table yet still earn a slot on the card (retailers' sales figures
// live in the stat strip but hide below xl; the marketer joins the meta line).
function mobileDataCells(row: Row<T>) {
  return row.getVisibleCells().filter((cell) => {
    if (isChromeColumn(cell.column.id)) return false;
    const meta = cell.column.columnDef.meta;
    if (meta?.mobile === "hidden") return false;
    if (meta?.mobile || meta?.mobileLabeled !== undefined) return true;
    return !isDesktopOnlyColumn(cell.column);
  });
}

// Tone → theme-token text colour for a stat figure on the card meta line.
const TONE_CLASS = {
  default: "text-foreground/85",
  destructive: "text-destructive",
  success: "text-success",
  muted: "text-muted-foreground",
} as const;

/** Money-formatted figure for a stat cell (full grouped value, never
 *  compacted — exact stored precision in the title), or null when the value
 *  isn't numeric so the column's own renderer takes over. */
function statOf(cell: Cell<T, unknown>) {
  return formatStat(cell.getValue());
}

function cellById(row: Row<T>, id: string) {
  return row.getVisibleCells().find((cell) => cell.column.id === id);
}

// Ledger-row anatomy: title + muted meta line at the start, `meta.mobile:
// "trailing"` cells stacked at the row end. The first cell that is neither
// trailing nor stat is the default title.
const mobileRows = computed(() =>
  table.getRowModel().rows.map((row) => {
    const cells = mobileDataCells(row);
    const title =
      cells.find((cell) => mobileRole(cell.column) === "title") ??
      cells.find((cell) => {
        const role = mobileRole(cell.column);
        return role !== "trailing" && role !== "stat";
      });
    const trailing = cells.filter((cell) => mobileRole(cell.column) === "trailing");
    const stats = cells.filter((cell) => mobileRole(cell.column) === "stat");
    return {
      row,
      title,
      trailing,
      stats,
      meta: cells.filter(
        (cell) => cell !== title && !trailing.includes(cell) && !stats.includes(cell),
      ),
      select: cellById(row, "select"),
      actions: cellById(row, "actions"),
    };
  }),
);

/* --------------------------- Mobile sort control -------------------------- */
// Cards have no sortable headers — a `md:hidden` dropdown re-exposes sorting.
const mobileSortableColumns = computed(() =>
  table
    .getAllLeafColumns()
    .filter((column) => !isChromeColumn(column.id) && column.getIsVisible() && column.getCanSort()),
);
const mobileSortedColumn = computed(() =>
  mobileSortableColumns.value.find((column) => column.getIsSorted()),
);

/* ------------------------------- Row numbers ----------------------------- */
// Position on screen, continued across pages — the rows before this page plus
// the row's place in it (sorted/filtered order, not the data's own index).
function rowNumber(indexOnPage: number) {
  const { pageIndex, pageSize } = table.getState().pagination;
  return pageIndex * pageSize + indexOnPage + 1;
}

/* ------------------------------ Row activation --------------------------- */
// Resolved only when the page opts into clickable rows — datatable unit tests
// mount without a router, and useRouter() would warn on every mount.
const router = props.rowHref ? useRouter() : undefined;
function onRowClick(row: T) {
  if (!props.rowHref) return;
  void router?.push(props.rowHref(row));
}
</script>

<template>
  <div class="space-y-3">
    <!-- Toolbar: page supplies search / filters / view-options; gets the table.
         Phones: a tinted band bled to the screen edges and attached to the
         list beneath (the sheet's "top bar"); md+: the plain flex row. -->
    <div
      v-if="$slots.toolbar"
      class="flex flex-wrap items-center gap-2 max-md:-mx-3 max-md:border-y max-md:bg-muted/30 max-md:px-3 max-md:py-2.5"
    >
      <slot name="toolbar" :table="table" />
      <!-- Phone table toggle rides in the toolbar with the other icon controls
           (view-options, filters) so nothing sits stranded on its own row. -->
      <Button
        variant="ghost"
        size="icon-sm"
        class="shrink-0 text-muted-foreground md:hidden"
        :aria-label="mobileView === 'cards' ? t('datatable.showTable') : t('datatable.showCards')"
        :aria-pressed="mobileView === 'table'"
        @click="mobileView = mobileView === 'cards' ? 'table' : 'cards'"
      >
        <component :is="mobileView === 'cards' ? Table2Icon : LayoutListIcon" class="size-4" />
      </Button>
    </div>

    <!-- Bulk-actions bar (only when selection is enabled and rows are picked) -->
    <div
      v-if="enableSelection && selectedCount > 0"
      class="flex flex-wrap items-center gap-2 rounded-xl border border-primary/25 bg-accent/60 px-3 py-2"
    >
      <p class="text-sm text-accent-foreground">
        <span class="num font-medium">{{ selectedCount }}</span>
        {{ selectedCount === 1 ? t("datatable.selectedRow") : t("datatable.selectedRows") }}
      </p>
      <!-- In server mode only the loaded page can be selected — the label must
           not promise "all N" when N is just this page's rows. -->
      <button
        v-if="selectedCount < totalRows"
        type="button"
        class="text-xs font-medium text-primary underline-offset-4 hover:underline"
        @click="selectAll"
      >
        {{ t(serverMode ? "datatable.selectPage" : "datatable.selectAll") }} (<span class="num">{{
          totalRows
        }}</span
        >)
      </button>
      <div class="ms-auto flex items-center gap-1.5">
        <slot
          name="bulk-actions"
          :selected-rows="selectedRows"
          :selected-count="selectedCount"
          :clear-selection="clearSelection"
        />
      </div>
    </div>

    <!-- Table shell — phones: a full-bleed sheet (no box; hairline rows run
         edge to edge, the shell bleeds past the page gutter and hugs the
         toolbar band above it). md+: the bordered rounded table box. -->
    <div
      class="overflow-hidden max-md:-mx-3 max-md:border-b md:rounded-xl md:border"
      :class="[
        // Attach directly under the toolbar band (cancel the root's space-y)
        // unless the bulk bar sits between them.
        $slots.toolbar && !(enableSelection && selectedCount > 0) ? 'max-md:-mt-3' : undefined,
        $slots.toolbar ? undefined : 'max-md:border-t',
      ]"
    >
      <!-- Empty: the shell IS the frame, so the content stretches to fill it
           (pages pass unframed content — <EmptyState bare>). min-h (not h) so a taller custom
           panel pushes the shell instead of bleeding over the footer; phones
           get a roomier floor so the sheet reads as a full panel, not a sliver. -->
      <template v-if="!table.getRowModel().rows.length">
        <div class="grid min-h-32 place-items-stretch max-md:min-h-[50vh]">
          <slot name="empty">
            <p class="grid place-items-center px-4 py-4 text-sm text-muted-foreground">
              {{ t("datatable.empty") }}
            </p>
          </slot>
        </div>
      </template>
      <template v-else>
        <!-- Sort bar (phones): only when sortable columns exist — with no
             toolbar the table toggle falls back to living here. -->
        <div
          v-if="mobileSortableColumns.length || !$slots.toolbar"
          class="flex items-center border-b px-2 py-0.5 md:hidden"
        >
          <DropdownMenu v-if="mobileSortableColumns.length">
            <DropdownMenuTrigger as-child>
              <Button
                variant="ghost"
                size="sm"
                class="gap-1.5 text-xs text-muted-foreground"
                :aria-label="t('datatable.sortByAria')"
              >
                <component
                  :is="mobileSortedColumn ? sortIcon(mobileSortedColumn) : ArrowUpDownIcon"
                  class="size-3.5"
                  aria-hidden="true"
                />
                {{ mobileSortedColumn ? columnLabel(mobileSortedColumn) : t("datatable.sortBy") }}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="w-44">
              <DropdownMenuItem
                v-for="column in mobileSortableColumns"
                :key="column.id"
                @select="column.toggleSorting()"
              >
                <span class="flex-1">{{ columnLabel(column) }}</span>
                <component
                  :is="sortIcon(column)"
                  v-if="column.getIsSorted()"
                  class="size-3.5 text-muted-foreground"
                  aria-hidden="true"
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            v-if="!$slots.toolbar"
            variant="ghost"
            size="icon-sm"
            class="ms-auto text-muted-foreground"
            :aria-label="
              mobileView === 'cards' ? t('datatable.showTable') : t('datatable.showCards')
            "
            :aria-pressed="mobileView === 'table'"
            @click="mobileView = mobileView === 'cards' ? 'table' : 'cards'"
          >
            <component :is="mobileView === 'cards' ? Table2Icon : LayoutListIcon" class="size-4" />
          </Button>
        </div>

        <ul v-if="mobileView === 'cards'" class="divide-y md:hidden" data-slot="table-cards">
          <!-- Whole-card click mirrors the desktop row (a pointer shortcut);
               the keyboard path is the row's own actions menu / links. -->
          <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
          <li
            v-for="(item, itemIndex) in mobileRows"
            :key="item.row.id"
            :data-state="item.row.getIsSelected() ? 'selected' : undefined"
            class="px-3 py-3.5 data-[state=selected]:bg-muted"
            :class="rowHref ? 'cursor-pointer active:bg-muted/50' : undefined"
            @click="onRowClick(item.row.original)"
          >
            <!-- # · identity + meta line · trailing figure · actions -->
            <div class="flex items-center gap-3">
              <span
                v-if="rowNumbers"
                data-slot="row-number"
                class="num min-w-6 shrink-0 rounded-md bg-muted/60 px-1 py-0.5 text-center text-xs text-muted-foreground"
                :aria-label="`${t('datatable.rowNumberAria')} ${rowNumber(itemIndex)}`"
                >{{ rowNumber(itemIndex) }}</span
              >
              <div v-if="item.select" @click.stop>
                <slot
                  name="cell-select"
                  :row="item.row.original"
                  :value="item.select.getValue()"
                  :cell="item.select"
                >
                  <FlexRender
                    v-if="item.select.column.columnDef.cell"
                    :render="item.select.column.columnDef.cell"
                    :props="item.select.getContext()"
                  />
                </slot>
              </div>

              <!-- Leading mark: an avatar/brand mark that anchors the row — pages
                 opt in via #leading; without it the row starts at the title. -->
              <div v-if="$slots.leading" class="shrink-0">
                <slot name="leading" :row="item.row.original" />
              </div>

              <div class="min-w-0 flex-1">
                <div
                  v-if="item.title"
                  data-slot="card-title"
                  class="truncate text-[15px] font-semibold leading-tight"
                >
                  <slot
                    :name="`cell-${item.title.column.id}`"
                    :row="item.row.original"
                    :value="item.title.getValue()"
                    :cell="item.title"
                  >
                    <FlexRender
                      v-if="item.title.column.columnDef.cell"
                      :render="item.title.column.columnDef.cell"
                      :props="item.title.getContext()"
                    />
                    <template v-else>{{ item.title.getValue() }}</template>
                  </slot>
                </div>
                <!-- Meta line: plain secondary cells, then `mobile: "stat"` cells
                   as "Label: value" pairs on the same muted line. Stats used to be
                   a separate row under the card; as a second full-width block they
                   kept reading as another card, so they join this line instead —
                   still toned, full figure, stored precision in the title. -->
                <div
                  v-if="item.meta.length || item.stats.length"
                  class="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground"
                >
                  <template v-for="(cell, index) in item.meta" :key="cell.id">
                    <span v-if="index" class="text-muted-foreground/50" aria-hidden="true">·</span>
                    <!-- Labeled pairs stay on one line — "label:" must not orphan
                       from its number when the line wraps. -->
                    <span
                      class="min-w-0"
                      :class="
                        cell.column.columnDef.meta?.mobileLabeled ? 'whitespace-nowrap' : undefined
                      "
                    >
                      <span
                        v-if="cell.column.columnDef.meta?.mobileLabeled"
                        class="text-muted-foreground/70"
                        >{{ columnLabel(cell.column) }}:
                      </span>
                      <slot
                        :name="`cell-${cell.column.id}`"
                        :row="item.row.original"
                        :value="cell.getValue()"
                        :cell="cell"
                      >
                        <FlexRender
                          v-if="cell.column.columnDef.cell"
                          :render="cell.column.columnDef.cell"
                          :props="cell.getContext()"
                        />
                        <template v-else>{{ cell.getValue() }}</template>
                      </slot>
                    </span>
                  </template>
                  <template v-for="(cell, index) in item.stats" :key="cell.id">
                    <span
                      v-if="index || item.meta.length"
                      class="text-muted-foreground/50"
                      aria-hidden="true"
                      >·</span
                    >
                    <span class="whitespace-nowrap">
                      <span class="text-muted-foreground/70">{{ columnLabel(cell.column) }}: </span>
                      <span
                        v-if="statOf(cell)"
                        class="font-medium"
                        :class="TONE_CLASS[cell.column.columnDef.meta?.tone ?? 'default']"
                        :title="statOf(cell)!.truncated ? statOf(cell)!.exact : undefined"
                      >
                        <span class="num">{{ statOf(cell)!.text }}</span>
                        <span v-if="statOf(cell)!.unit" class="font-normal text-muted-foreground">
                          {{ statOf(cell)!.unit }}
                        </span>
                      </span>
                      <span v-else class="font-medium text-foreground/85">
                        <slot
                          :name="`cell-${cell.column.id}`"
                          :row="item.row.original"
                          :value="cell.getValue()"
                          :cell="cell"
                        >
                          <FlexRender
                            v-if="cell.column.columnDef.cell"
                            :render="cell.column.columnDef.cell"
                            :props="cell.getContext()"
                          />
                          <template v-else>{{ cell.getValue() }}</template>
                        </slot>
                      </span>
                    </span>
                  </template>
                </div>
              </div>

              <div
                v-if="item.trailing.length"
                data-slot="card-trailing"
                class="flex shrink-0 flex-col items-end gap-1 text-end"
              >
                <!-- Caption above value — inline labels made the block as wide as
                   the whole row on long labels (e.g. "بعد الخصم" + 10-digit money). -->
                <div
                  v-for="(cell, index) in item.trailing"
                  :key="cell.id"
                  class="flex flex-col items-end gap-0.5 text-sm"
                >
                  <!-- self-start: the caption reads from the block's logical start
                     (right in RTL) instead of hugging the value's end edge. -->
                  <span
                    v-if="cell.column.columnDef.meta?.mobileLabeled !== false"
                    class="self-start text-[10px] leading-none text-muted-foreground"
                  >
                    {{ columnLabel(cell.column) }}
                  </span>
                  <span :class="index === 0 ? 'font-semibold' : undefined">
                    <slot
                      :name="`cell-${cell.column.id}`"
                      :row="item.row.original"
                      :value="cell.getValue()"
                      :cell="cell"
                    >
                      <FlexRender
                        v-if="cell.column.columnDef.cell"
                        :render="cell.column.columnDef.cell"
                        :props="cell.getContext()"
                      />
                      <template v-else>{{ cell.getValue() }}</template>
                    </slot>
                  </span>
                </div>
              </div>

              <div v-if="item.actions" class="shrink-0" @click.stop>
                <slot
                  name="cell-actions"
                  :row="item.row.original"
                  :value="item.actions.getValue()"
                  :cell="item.actions"
                >
                  <FlexRender
                    v-if="item.actions.column.columnDef.cell"
                    :render="item.actions.column.columnDef.cell"
                    :props="item.actions.getContext()"
                  />
                </slot>
              </div>
              <ChevronRightIcon
                v-else-if="rowHref"
                class="cn-rtl-flip size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          </li>
        </ul>

        <!-- The table: always from md up; on phones only when the toggle asks
             for it (then it scrolls sideways inside this wrapper). -->
        <div class="overflow-x-auto md:block" :class="mobileView === 'table' ? 'block' : 'hidden'">
          <Table>
            <TableHeader>
              <TableRow
                v-for="headerGroup in table.getHeaderGroups()"
                :key="headerGroup.id"
                class="hover:bg-transparent"
              >
                <TableHead
                  v-if="rowNumbers"
                  data-slot="row-number"
                  class="row-number"
                  :title="t('datatable.rowNumberAria')"
                >
                  <span aria-hidden="true">{{ t("datatable.rowNumber") }}</span>
                  <span class="sr-only">{{ t("datatable.rowNumberAria") }}</span>
                </TableHead>
                <TableHead
                  v-for="header in headerGroup.headers"
                  :key="header.id"
                  :class="tableCellClass(header.column)"
                  :aria-sort="header.column.getCanSort() ? ariaSort(header.column) : undefined"
                >
                  <template v-if="!header.isPlaceholder">
                    <button
                      v-if="header.column.getCanSort()"
                      type="button"
                      class="-mx-1.5 inline-flex items-center gap-1 rounded px-1.5 py-1 transition-colors hover:text-foreground"
                      :aria-label="
                        t('datatable.sortByColumn', { label: columnLabel(header.column) })
                      "
                      @click="header.column.getToggleSortingHandler()?.($event)"
                    >
                      <FlexRender
                        :render="header.column.columnDef.header"
                        :props="header.getContext()"
                      />
                      <component
                        :is="sortIcon(header.column)"
                        class="size-3.5 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </button>
                    <FlexRender
                      v-else
                      :render="header.column.columnDef.header"
                      :props="header.getContext()"
                    />
                  </template>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow
                v-for="(row, rowIndex) in table.getRowModel().rows"
                :key="row.id"
                :data-state="row.getIsSelected() ? 'selected' : undefined"
                :class="rowHref ? 'cursor-pointer' : undefined"
                @click="onRowClick(row.original)"
              >
                <TableCell v-if="rowNumbers" data-slot="row-number" class="row-number"
                  ><span class="num">{{ rowNumber(rowIndex) }}</span></TableCell
                >
                <TableCell
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  :class="tableCellClass(cell.column)"
                >
                  <slot
                    :name="`cell-${cell.column.id}`"
                    :row="cell.row.original"
                    :value="cell.getValue()"
                    :cell="cell"
                  >
                    <FlexRender
                      v-if="cell.column.columnDef.cell"
                      :render="cell.column.columnDef.cell"
                      :props="cell.getContext()"
                    />
                    <template v-else>{{ cell.getValue() }}</template>
                  </slot>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </template>

      <!-- A "0-0 of 0 / page 1 of 1" footer under an empty panel is noise. -->
      <DataTablePagination v-if="table.getRowModel().rows.length" :table="table" />
    </div>
  </div>
</template>
