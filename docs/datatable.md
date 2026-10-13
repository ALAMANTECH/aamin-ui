# DataTable — the list-screen backbone

`src/components/app/datatable/` builds every list screen: sorting, column visibility, **cross-page selection**, pagination, a phone card mode, and a server-mode contract. It composes the presentational `ui/table` parts over `@tanstack/vue-table`. The complete living example is **`src/pages/reference/TablesPage.vue`** — copy it, don't reinvent it.

## Files

| File | Exports |
|---|---|
| `DataTable.vue` | The component (generic over row type `T`) |
| `DataTablePagination.vue` | Footer (auto-rendered by DataTable, hidden under an empty table). From `sm`: page-size select (`pageSizes`, default 10/25/50), `عرض a–b من c` range, first/prev · `PageReadout` · next/last. Below `sm`: a thumb-sized bar — 40px first/prev and next/last arrows around the range + readout, no page-size select |
| `PageReadout.vue` | The `n / m` position readout that is also the jump control (see [Page jump](#page-jump)) |
| `page-jump.ts` | `resolvePage(raw, pageCount)` — the readout's parser; `PAGE_SIZES` (the footer's 10/25/50) and `isOfferedPageSize()` |
| `DataTableViewOptions.vue` | `الأعمدة` column-visibility dropdown — render it in your toolbar, pass the table. Shows a count badge of hidden columns and a «إظهار كل الأعمدة» item |
| `columns.ts` | `selectionColumn<T>()`, `numericCell(value, title?)`, `moneyCell(value)`, and the `ColumnMeta` augmentation |
| `index.ts` | Barrel for all of the above |

## DataTable props

| Prop | Type | Notes |
|---|---|---|
| `columns` | `ColumnDef<T, unknown>[]` | TanStack column defs; see meta below |
| `data` | `T[]` | Rows (client mode filters/sorts/pages them) |
| `pageSize` | `number = 10` | Initial page size |
| `enableSelection` | `boolean = false` | Enables row selection + the bulk bar |
| `getRowId` | `(row, index) => string` | **Pass whenever rows can be added/removed** — index-based IDs corrupt selection on mutation |
| `globalFilter` | `string` | Two-way search (`@update:global-filter`); page toolbar binds its search input to this |
| `serverMode` | `boolean = false` | Manual sorting/filtering/pagination — state is emitted, you fetch |
| `pageCount`, `rowCount` | `number` | Required/used only with `serverMode`. Read reactively — pass the new totals after every fetch and the footer follows |
| `pagination`, `sorting` | TanStack state | Optional controlled state (server mode) — keeps URL/`?page=` and search resets in sync with the footer pager |
| `rowHref` | `(row) => string` | Makes the whole row (and phone card) clickable; interactive cells must stop propagation. Cards without an actions column get a forward chevron |
| `storageKey` | `string` | Saves the table's layout in localStorage: `aamin:table:<key>:columns` (column visibility), `aamin:table:<key>:mobileView` (phone cards ⇄ table), `aamin:table:<key>:pageSize` (client mode only — never in `serverMode` or with a controlled `pagination` prop, whose owner fetches with its own size; restored only when it is one of the footer's sizes `PAGE_SIZES` = 10/25/50, otherwise `pageSize` wins). A stored phone view other than `cards`/`table` falls back to cards. Give each screen a stable, unique key; omit it and nothing is stored |
| `rowNumbers` | `boolean = true` | Leading **#** column numbering rows 1, 2, 3… in on-screen order, continued across pages (page 2 of 10-row pages starts at 11). Cells wear the `row-number` utility; phone cards show the same number in a small muted box. Not a TanStack column — never sorted, hidden, or exported. Pass `:row-numbers="false"` only where position means nothing |

Emits: `update:globalFilter`, `update:sorting`, `update:pagination`, `update:columnFilters` (all TanStack state shapes).
Exposed: `defineExpose({ table })` — grab it via a template ref for imperative control (`table.setPageIndex(0)`, `table.getColumn("status")?.setFilterValue(...)`, `table.resetRowSelection()`).

## Slots

| Slot | Scope | Use |
|---|---|---|
| `#toolbar` | `{ table }` | Search input, filter selects, `DataTableViewOptions`, export button. DataTable appends the phone cards⇄table toggle to this row |
| `#bulk-actions` | `{ selectedRows, selectedCount, clearSelection }` | Buttons in the bulk bar (appears when selection > 0; includes a built-in `تحديد الكل (M)` link — in server mode it reads `تحديد الصفحة الحالية`, because only the loaded page can be selected) |
| `#cell-<columnId>` | `{ row, value, cell }` | Per-column cell rendering — `#cell-status`, `#cell-amount`, `#cell-actions`… Used by both the table and the phone cards |
| `#leading` | `{ row }` | Phone-only mark at the start of each card (avatar / brand initials) — gives entity lists a visual anchor |
| `#empty` | — | No-results content. Pass **unframed** content (`<EmptyState bare>`, or a plain centered block): the table shell is already the frame, so a dashed EmptyState reads as a box in a box. The panel stretches to fill (`min-h-32`, `50vh` floor on phones), and the pager is hidden while empty |

## Column meta (kit augmentation)

```ts
{ accessorKey: "balance", header: "الرصيد", meta: { label: "الرصيد", mobile: "trailing" } }
```

- `meta.label` — the column's display name: visibility menu, the sort button's `aria-label` (`datatable.sortByColumn` → «ترتيب حسب …»), phone-card captions and the phone sort menu.
- `meta.class` — applied to the header cell AND its body cells (responsive hiding like `max-lg:hidden`). On phones, when the user toggles the full table on, `max-*:hidden` hides are dropped so the whole sheet scrolls sideways.
- `enableSorting: false` for non-sortable columns; `enableHiding: false` for must-stay columns (selection, actions).
- `meta.mobile`, `meta.mobileLabeled`, `meta.tone` — the phone card, below.

## Phone card mode (below `md`)

Below `md` DataTable renders each row as a **ledger card** instead of the table. From `md` up the bordered table returns.

```
[#] [☐] [#leading]  Title                         Caption
                    meta · meta · Label: value    TRAILING   [⋯]
```

- `meta.mobile: "title"` — pins the column as the headline. Default: the first column that is neither `trailing` nor `stat`.
- `meta.mobile: "trailing"` — stacks the cell at the card's end: the money figure and the status badge. The first trailing cell is bold; each renders its `label` as a small caption above the value so money is never a bare number.
- `meta.mobile: "stat"` — the column joins the muted meta line as a `Label: value` pair. Use it for secondary numbers (sales, averages, counts). **Numeric** values render through the money formatter (`formatStat` → `moneyFigure`): the full grouped figure truncated to 3 decimals, never compacted, with the stored precision in a `title` when digits were cut. Numeric stats bypass `#cell-*` slots (so a page formatter can't blow the line out) — colour them with `meta.tone`. Non-numeric values fall through to the column's own renderer.
- `meta.mobile: "hidden"` — drops the column from cards.
- Unset — the column joins the muted, `·`-separated meta line under the title.
- `meta.mobileLabeled` — `true` prefixes a meta-line value with `label:` (for numbers that are ambiguous without their name); `false` suppresses the caption on a trailing cell (status badges self-describe).
- `meta.tone` — `"destructive" | "success" | "muted"` colour for a `stat` figure.
- A `max-*:hidden` class drops a column from cards too, **unless** the column has an explicit `mobile` role or `mobileLabeled` — a column can be squeezed out of a narrow desktop table yet still earn its card slot (TablesPage's city column).
- The selection checkbox renders before the title, the actions cell at the row end (or a forward chevron for `rowHref` rows).
- Cards have no headers, so a phone **sort dropdown** («ترتيب») sits above the list whenever a sortable column exists.
- A **cards ⇄ table toggle** rides in the toolbar (or the sort bar when there is no toolbar). It persists per `storageKey`.

The phone layout is a full-bleed sheet: the toolbar becomes a tinted band bled to the screen edges (`-mx-3`) and the rows run edge to edge with hairline dividers. Toolbar recipe (TablesPage): search wrapper `relative min-w-0 flex-1 sm:w-64 sm:flex-none`; a filter select beside the search takes its own row with `max-md:order-last max-md:basis-full sm:w-36`; the actions group `ms-auto flex shrink-0 items-center gap-2`, with text buttons collapsing to icons on phones (`max-md:size-9 max-md:p-0` + a `max-md:hidden` label span + an `aria-label`).

## Filters in the toolbar

Filters live in the `#toolbar` slot, built from kit pieces — not hand-rolled selects and native date inputs:

- Fields: `SearchableSelect` / `MultiSelect` / `DateField` (`size="sm"`, `clearable`, `tinted`). Hide the inline fields below `lg` (`max-lg:hidden`) and render the same fields inside `FilterSheet` (`class="lg:hidden"`) — one `count` of active filters, one `@clear` that resets them.
- `FilterChips` goes right under the toolbar (or in a `#toolbar` second row): one chip per active value, each `clear()`s its own filter, «مسح الفلاتر» emits `clear-all`. The default slot is the result-count readout. A filtered-empty list is then never a mystery.

```vue
<template #toolbar>
  <SearchableSelect v-model="region" :options="regions" placeholder="كل المناطق" none-label="كل المناطق" aria-label="المنطقة" size="sm" class="max-lg:hidden" />
  <FilterSheet :count="activeCount" class="lg:hidden" @clear="clearAll">…the same fields, stacked…</FilterSheet>
</template>
<FilterChips :chips="chips" @clear-all="clearAll" />
```

Living demo: ComponentsPage «الفلاتر والمنتقيات» section.

## CompactPager — lists that are not a table

Card grids, queues and day-grouped ledgers have no TanStack instance, so `DataTablePagination` does not fit. `CompactPager` is the one shape: first / prev / `n / m` (the `PageReadout` jump) / next / last. `v-model:page-index` is zero-based; `page-count`, `busy`; a `#label` slot sits at the start; pass `class` for the horizontal inset.

## Page jump

`PageReadout` shows `n / m`; the current page is a dotted-underline button. Pressing it swaps in a numeric field pre-filled and selected with the page. Enter jumps, Esc or blur cancels. The footer stays as wide as a plain readout.

| Prop / event | Type | Notes |
|---|---|---|
| `pageIndex` | `number` | Zero-based (TanStack's convention) |
| `pageCount` | `number` | |
| `busy` | `boolean = false` | Disables the control while a request is in flight |
| `size` | `"sm" \| "lg" = "sm"` | `sm` for the desktop footer; `lg` is the phone footer's 40px touch size |
| `@update:pageIndex` | `number` | Emitted only when the target differs from the current page |

`resolvePage(raw, pageCount)` turns typed text into a zero-based index or `null`: non-digits are ignored (`"12a"` → page 12), empty input is a no-op, out-of-range values clamp to the nearest edge (`"0"` → first, `"999"` → last), and a zero page count is treated as one page. Use `PageReadout` for any non-table pager too, so every list jumps the same way.

## Cell helpers

- `numericCell(value, title?)` — the value inside a `.num` span, with an optional hover `title`.
- `moneyCell(value)` — **the** way money renders in a column's `cell`: `formatAmountCell` (grouped, trailing zeros trimmed, `—` for blanks, raw text for non-numbers) inside `.num`, and `moneyTitle` as the `title` when the stored value has more than 3 decimals. `"2000.00000"` reads `2,000`; `2.0625` reads `2.062` with `2.0625` on hover.

```ts
{ accessorKey: "balance", header: "الرصيد", cell: ({ getValue }) => moneyCell(getValue()), meta: { label: "الرصيد", mobile: "trailing" } }
```

## `row-number` utility

The `#` gutter style (`src/style.css`): shrink-to-fit width, centered, muted text, a lightly tinted background and an end-edge hairline (`border-inline-end`) so the position never reads as part of the figure beside it. DataTable applies it to its own `#` column. **Hand-rolled tables** (a `ui/table` without DataTable) put it on their `#` header and body cells and wrap the digits in `.num`:

```vue
<TableHead class="row-number">#</TableHead>
<TableCell class="row-number"><span class="num">{{ index + 1 }}</span></TableCell>
```

## Gotchas (learned in this repo — don't rediscover)

- **TanStack sorts numbers descending-first** on the first header click. Expected behavior; don't "fix" it.
- **Grouped-digit strings** (`"12,400"`) sort alphabetically — supply a `sortingFn` that parses (`Number(v.replace(/,/g, ""))`), as TablesPage's amount column does.
- **`autoResetPageIndex` is off** by design: a data refresh or deletion doesn't yank the user to page 1. In client mode DataTable **clamps** to the new last page whenever the page count shrinks (a search from page 3, a bulk delete), so the user never lands on an empty page that claims "no results". Resetting to the first page when a search or filter changes is still the page's choice — TablesPage calls `table.setPageIndex(0)`. In server mode the page that fetches owns the reset.
- **Status filtering** is a column filter with `filterFn: "equals"` driven from the toolbar Select via the exposed table — not a second computed pipeline.
- Numbers in cells still need `.num` — use the `#cell-*` slot, `numericCell()` or `moneyCell()`.
- **Hiding a column is persistent** with `storageKey`. That's why `DataTableViewOptions` shows a hidden-count badge and a show-all item (`table.resetColumnVisibility()`, which also clears stale ids from storage).

## Server mode (real APIs)

Set `serverMode` + `pageCount`/`rowCount`, listen to `update:sorting/pagination/columnFilters/globalFilter`, fetch on change, pass the fetched page as `data` and the new `pageCount`/`rowCount`. The component then does no client-side row modeling — it renders what you give it. The footer range reads `rowCount` (the server total), never the page's row count. No DataTable changes should ever be needed to wire a backend; if you think you need one, re-read this contract first.

## Minimal recipe

```vue
<DataTable ref="dt" :columns="columns" :data="rows" enable-selection storage-key="merchants"
           :get-row-id="(r) => r.id" v-model:global-filter="search">
  <template #toolbar><Input v-model="search" class="ps-8" aria-label="بحث" /></template>
  <template #bulk-actions="{ selectedRows }">
    <Button variant="destructive" size="sm" @click="removeAll(selectedRows)">حذف المحدد</Button>
  </template>
  <template #cell-status="{ value }"><StatusBadge :status="value as string" /></template>
  <template #empty><EmptyState bare title="لا توجد نتائج مطابقة" /></template>
</DataTable>
```

For everything else (row action menus, delete dialogs, export, phone card meta), read `src/pages/reference/TablesPage.vue` top to bottom — it is the canonical, tested implementation.
