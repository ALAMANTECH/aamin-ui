import { h } from "vue";
import type { ColumnDef, RowData } from "@tanstack/vue-table";
import { Checkbox } from "@/components/ui/checkbox";
// i18n.global (not useI18n) — this module builds column defs outside setup().
import { i18n } from "@/lib/i18n";
import { formatAmountCell, moneyTitle } from "@/lib/money";

// Column-level metadata shared across the DataTable helpers: `label` powers the
// column-visibility menu, the sort button's aria-label and the phone-card
// captions; `class` is applied to BOTH the header cell and its body cells (used
// for responsive hides like `max-md:hidden`).
declare module "@tanstack/vue-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    class?: string;
    /** Role in the mobile ledger row (below `md`): `title` pins the column as
     *  the card headline, `trailing` stacks it at the row end (money/status),
     *  `stat` puts it on the meta line as a labeled `Label: value` figure
     *  (secondary numbers — sales, averages, counts), `hidden` drops it from
     *  cards. Unset → the muted meta line (the first unset column becomes the
     *  title). Trailing and stat cells render their `label` so money is never
     *  a bare number. */
    mobile?: "title" | "trailing" | "stat" | "hidden";
    /** Mobile label control. In the meta line: `true` prefixes the value with
     *  `label:` (for numbers that are ambiguous without their name). In the
     *  trailing block: captions render by default — `false` suppresses one
     *  (status badges self-describe; a caption over them is noise). */
    mobileLabeled?: boolean;
    /** Semantic colour for a `stat` figure on the phone card's meta line (a
     *  numeric stat renders through the money formatter and bypasses `#cell-*`
     *  slots — this is how a page still says "debts are red, profits green"). */
    tone?: "destructive" | "success" | "muted";
  }
}

/**
 * A tri-state selection column. The header checkbox reflects/toggles ALL rows
 * (across pages), not just the current page — this is the whole reason the
 * DataTable exists over the hand-rolled page-local selection it replaces.
 */
export function selectionColumn<T>(): ColumnDef<T> {
  return {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    meta: { label: i18n.global.t("datatable.select") },
    header: ({ table }) =>
      h(Checkbox, {
        modelValue: table.getIsAllRowsSelected()
          ? true
          : table.getIsSomeRowsSelected()
            ? "indeterminate"
            : false,
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllRowsSelected(value === true),
        "aria-label": i18n.global.t("datatable.selectAllRows"),
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(value === true),
        "aria-label": i18n.global.t("datatable.selectRow"),
      }),
  };
}

/** Render a numeric value inside the `.num` (mono/tabular/LTR-isolate) span,
 *  with an optional hover `title` (e.g. the exact stored value). */
export function numericCell(value: unknown, title?: string) {
  return h("span", { class: "num", title }, value == null ? "" : String(value));
}

/** Money cell: grouped + trimmed via formatAmountCell, inside `.num` — the one
 *  way money renders in tables (a raw backend "2000.00000" reads as "2,000").
 *  Decimals past the third live in the `title`, so hovering reveals the stored
 *  value and nothing else does. */
export function moneyCell(value: unknown) {
  return numericCell(formatAmountCell(value), moneyTitle(value));
}
