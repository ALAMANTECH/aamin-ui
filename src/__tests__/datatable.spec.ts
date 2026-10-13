// Behavioural tests for the DataTable backbone (plan 007). These mount the real
// component with @vue/test-utils under jsdom and assert the properties that make
// it worth existing over the hand-rolled table it replaces: cross-page selection,
// column sorting, pagination range math, and the StatusBadge semantic mapping.
import { describe, it, expect } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";
import type { Table } from "@tanstack/vue-table";
import type { ColumnDef } from "@tanstack/vue-table";
import DataTable from "@/components/app/datatable/DataTable.vue";
import { moneyCell, numericCell, selectionColumn } from "@/components/app/datatable/columns";
import DataTableViewOptions from "@/components/app/datatable/DataTableViewOptions.vue";
import StatusBadge from "@/components/app/StatusBadge.vue";
import { i18n } from "@/lib/i18n";

interface Row {
  id: string;
  name: string;
  amount: number;
}

// 12 rows over a pageSize of 5 → 3 pages, so "select all" must reach rows that
// are not in the current page's DOM.
const rows: Row[] = Array.from({ length: 12 }, (_, index) => ({
  id: `R-${index + 1}`,
  name: `صف ${index + 1}`,
  amount: (index * 7) % 11, // deliberately unsorted
}));

const columns: ColumnDef<Row, unknown>[] = [
  selectionColumn<Row>(),
  { accessorKey: "id", header: "المرجع", meta: { label: "المرجع" } },
  { accessorKey: "name", header: "الاسم", meta: { label: "الاسم" } },
  { accessorKey: "amount", header: "المبلغ", meta: { label: "المبلغ" } },
];

function mountTable(pageSize = 5) {
  // The generic SFC infers `T = unknown` at the mount boundary, so the strongly
  // typed column/row helpers are cast to the erased prop shape here (only place
  // this leaks; the component and pages stay fully typed).
  return mount(DataTable, {
    props: {
      columns: columns as unknown as ColumnDef<unknown, unknown>[],
      data: rows,
      pageSize,
      enableSelection: true,
      getRowId: (row: unknown) => (row as Row).id,
    },
  });
}

/** Reach the exposed TanStack table instance from the mounted component. */
function tableOf(wrapper: ReturnType<typeof mountTable>): Table<Row> {
  return (wrapper.vm as unknown as { table: Table<Row> }).table;
}

describe("DataTable", () => {
  it("renders only the first page of rows", () => {
    const wrapper = mountTable(5);
    expect(wrapper.findAll("tbody tr")).toHaveLength(5);
    expect(wrapper.text()).toContain("R-1");
    expect(wrapper.text()).not.toContain("R-12"); // lives on page 3
  });

  it("numbers rows with a leading # column that continues across pages", async () => {
    const wrapper = mountTable(5);
    const numbers = () =>
      wrapper.findAll('tbody td[data-slot="row-number"]').map((cell) => cell.text());
    expect(wrapper.find('thead th[data-slot="row-number"]').exists()).toBe(true);
    expect(numbers()).toEqual(["1", "2", "3", "4", "5"]);
    expect(
      wrapper.findAll('[data-slot="table-cards"] [data-slot="row-number"]').map((n) => n.text()),
    ).toEqual(["1", "2", "3", "4", "5"]);

    // Page 3 of 5-row pages picks up at 11, not back at 1.
    tableOf(wrapper).setPageIndex(2);
    await nextTick();
    expect(numbers()).toEqual(["11", "12"]);
  });

  it("drops the # column when rowNumbers is off", () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: columns as unknown as ColumnDef<unknown, unknown>[],
        data: rows,
        rowNumbers: false,
      },
    });
    expect(wrapper.find('[data-slot="row-number"]').exists()).toBe(false);
  });

  it("renders stacked cards for the current page", () => {
    const wrapper = mountTable(5);
    const cards = wrapper.find('[data-slot="table-cards"]');
    expect(cards.exists()).toBe(true);
    expect(cards.findAll("li")).toHaveLength(5);
    expect(cards.text()).toContain("R-1");
    expect(cards.text()).not.toContain("R-12");
  });

  it("applies meta.mobile roles in the ledger cards (title / trailing / hidden)", () => {
    const roleColumns: ColumnDef<Row, unknown>[] = [
      { accessorKey: "id", header: "المرجع", meta: { label: "المرجع", mobileLabeled: true } },
      { accessorKey: "name", header: "الاسم", meta: { label: "الاسم", mobile: "title" } },
      { accessorKey: "amount", header: "المبلغ", meta: { label: "المبلغ", mobile: "trailing" } },
    ];
    const wrapper = mount(DataTable, {
      props: {
        columns: roleColumns as unknown as ColumnDef<unknown, unknown>[],
        data: rows,
        pageSize: 5,
      },
    });
    const firstCard = wrapper.find('[data-slot="table-cards"] li');
    // name is pinned as the headline even though id comes first…
    expect(firstCard.find('[data-slot="card-title"]').text()).toContain("صف 1");
    // …amount renders in the bolded trailing block with its label beside it…
    const trailing = firstCard.find('[data-slot="card-trailing"]');
    expect(trailing.text()).toContain(String(rows[0].amount));
    expect(trailing.text()).toContain("المبلغ");
    // …and id falls into the muted meta line, label-prefixed via mobileLabeled.
    expect(firstCard.text()).toContain("المرجع:");
    expect(firstCard.text()).toContain("R-1");
    // Cards lose sortable headers → the md:hidden sort dropdown takes over.
    expect(wrapper.find('button[aria-label="ترتيب القائمة"]').exists()).toBe(true);

    const hiddenColumns: ColumnDef<Row, unknown>[] = [
      { accessorKey: "id", header: "المرجع", meta: { label: "المرجع", mobile: "hidden" } },
      { accessorKey: "name", header: "الاسم", meta: { label: "الاسم" } },
    ];
    const hiddenWrapper = mount(DataTable, {
      props: {
        columns: hiddenColumns as unknown as ColumnDef<unknown, unknown>[],
        data: rows,
        pageSize: 5,
      },
    });
    expect(hiddenWrapper.find('[data-slot="table-cards"]').text()).not.toContain("R-1");
  });

  it("puts stat columns on the card meta line as a labeled, toned full figure", () => {
    const statColumns: ColumnDef<{ name: string; sales: number }, unknown>[] = [
      { accessorKey: "name", header: "الاسم", meta: { label: "الاسم" } },
      {
        accessorKey: "sales",
        header: "المبيعات",
        meta: { label: "المبيعات", mobile: "stat", tone: "success", class: "max-xl:hidden" },
      },
    ];
    const wrapper = mount(DataTable, {
      props: {
        columns: statColumns as unknown as ColumnDef<unknown, unknown>[],
        data: [{ name: "أ", sales: 1660000.5625 }],
      },
    });
    const card = wrapper.find('[data-slot="table-cards"] li');
    // An explicit mobile role overrides the desktop max-*:hidden class.
    expect(card.text()).toContain("المبيعات:");
    // Never compacted: the full grouped figure, truncated to display precision,
    // with the stored precision in the title.
    const figure = card.find(".text-success");
    expect(figure.text()).toContain("1,660,000.562");
    expect(figure.attributes("title")).toBe("1,660,000.5625");
  });

  it("swaps phone cards for the table from the toggle", async () => {
    const wrapper = mountTable(5);
    const toggle = wrapper.get('button[aria-label="عرض كجدول"]');
    expect(toggle.attributes("aria-pressed")).toBe("false");
    await toggle.trigger("click");
    expect(wrapper.find('[data-slot="table-cards"]').exists()).toBe(false);
    expect(wrapper.get('button[aria-label="عرض كبطاقات"]').attributes("aria-pressed")).toBe("true");
  });

  it("sorts by a column, toggling direction on repeated header clicks", async () => {
    const wrapper = mountTable(12); // one page so every row is in the DOM
    // The amount is the 5th cell (#, checkbox, id, name, amount) of each body row.
    // (Reading the name cell instead would compare NaNs, which are equal, and
    // make the assertion vacuous — so read the real amount cell.)
    const readAmounts = () =>
      wrapper.findAll("tbody tr").map((tr) => Number(tr.findAll("td")[4].text()));

    const amountHeader = wrapper
      .findAll("thead button")
      .find((button) => button.text().includes("المبلغ"));
    expect(amountHeader).toBeTruthy();

    await amountHeader!.trigger("click"); // first click → monotonic order
    const first = readAmounts();
    expect(first.every(Number.isFinite)).toBe(true);
    expect(new Set(first).size).toBeGreaterThan(1);
    const ascending = [...first].sort((a, b) => a - b);
    // Sorted in one direction or the other (TanStack sorts numbers desc-first).
    expect([ascending, [...ascending].reverse()]).toContainEqual(first);

    await amountHeader!.trigger("click"); // second click → reversed
    expect(readAmounts()).toEqual([...first].reverse());

    // aria-sort marks exactly the amount column as sorted.
    const active = wrapper
      .findAll("thead th")
      .find((th) => ["ascending", "descending"].includes(th.attributes("aria-sort") ?? ""));
    expect(active?.text()).toContain("المبلغ");
  });

  it("selects ALL rows across pages from the header checkbox, not just the page", async () => {
    const wrapper = mountTable(5);
    // reka-ui renders the checkbox as a role=checkbox button, matched by its label.
    await wrapper.get('thead [aria-label="تحديد كل الصفوف"]').trigger("click");

    const table = tableOf(wrapper);
    expect(table.getSelectedRowModel().rows.length).toBe(12); // not 5
    expect(table.getIsAllRowsSelected()).toBe(true);
  });

  it("reports an accurate pagination range", () => {
    const wrapper = mountTable(5);
    const range = wrapper.findAll("p").find((p) => p.text().includes("عرض"));
    expect(range).toBeTruthy();
    // "عرض 1–5 من 12"
    expect(range!.text()).toContain("1");
    expect(range!.text()).toContain("5");
    expect(range!.text()).toContain("12");
  });

  it("uses a thumb-sized prev/next bar on mobile and keeps page-size on desktop", () => {
    const wrapper = mountTable(5);
    const mobile = wrapper.find('[data-slot="table-pagination-mobile"]');
    const desktop = wrapper.find('[data-slot="table-pagination-desktop"]');

    expect(mobile.exists()).toBe(true);
    expect(desktop.exists()).toBe(true);
    // Thumb-sized first/prev and next/last arrows plus the page readout's
    // jump button in between.
    for (const label of ["الصفحة الأولى", "الصفحة السابقة", "الصفحة التالية", "الصفحة الأخيرة"]) {
      expect(mobile.findAll(`button[aria-label="${label}"]`)).toHaveLength(1);
      expect(desktop.findAll(`button[aria-label="${label}"]`)).toHaveLength(1);
    }
    expect(mobile.find('[data-slot="page-readout"] button').exists()).toBe(true);
    expect(desktop.find('[data-slot="page-readout"] button').exists()).toBe(true);
    expect(mobile.text()).not.toContain("عدد الصفوف");
    expect(desktop.text()).toContain("عدد الصفوف");
  });

  it("jumps pages from the footer readout", async () => {
    const wrapper = mountTable(5);
    const desktop = wrapper.find('[data-slot="table-pagination-desktop"]');
    await desktop.get('[data-slot="page-readout"] button').trigger("click");
    await nextTick();
    const input = desktop.get("input");
    await input.setValue("3");
    await input.trigger("keydown", { key: "Enter" });
    expect(tableOf(wrapper).getState().pagination.pageIndex).toBe(2);
  });

  it("hides the pager under an empty table and renders the #empty slot", () => {
    const wrapper = mount(DataTable, {
      props: { columns: columns as unknown as ColumnDef<unknown, unknown>[], data: [] },
      slots: { empty: '<p data-test="empty">nothing</p>' },
    });
    expect(wrapper.find('[data-test="empty"]').exists()).toBe(true);
    expect(wrapper.find('[data-slot="table-pagination-desktop"]').exists()).toBe(false);
    expect(wrapper.find("table").exists()).toBe(false);
  });

  it("reports the server total, not the page's row count, in server mode", () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: columns as unknown as ColumnDef<unknown, unknown>[],
        data: rows.slice(0, 12), // one server page
        serverMode: true,
        pageCount: 3,
        rowCount: 62,
        pageSize: 25,
        pagination: { pageIndex: 2, pageSize: 25 },
      },
    });

    const range = wrapper.findAll("p").find((p) => p.text().includes("عرض"));
    expect(range).toBeTruthy();
    // "عرض 51–62 من 62" — never "من 12" (the page's rows).
    expect(range!.text()).toContain("51");
    expect(range!.text()).toContain("62");
    expect(range!.text()).not.toContain("12");
  });

  it("does not promise 'select all' in server mode — only the loaded page", async () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: columns as unknown as ColumnDef<unknown, unknown>[],
        data: rows.slice(0, 5),
        serverMode: true,
        enableSelection: true,
        pageCount: 3,
        rowCount: 62,
        getRowId: (row: unknown) => (row as Row).id,
      },
    });
    tableOf(wrapper).getRow("R-1").toggleSelected(true);
    await nextTick();
    expect(wrapper.text()).toContain(i18n.global.t("datatable.selectPage"));
    expect(wrapper.text()).not.toContain(`${i18n.global.t("datatable.selectAll")} (`);
  });

  it("clamps to the last page when a client-side filter shrinks the result", async () => {
    // 12 rows over pageSize 5 = 3 pages. Walk to page 3, then filter down to a
    // single match: autoResetPageIndex is off, so without an explicit clamp the
    // admin is stranded on an empty page 3 and the table claims "no results"
    // for a search that DID match.
    const wrapper = mountTable(5);
    const table = tableOf(wrapper);
    table.setPageIndex(2);
    await nextTick();
    expect(wrapper.findAll("tbody tr")).toHaveLength(2);

    table.setGlobalFilter("R-7");
    await nextTick();
    await nextTick();

    expect(table.getState().pagination.pageIndex).toBe(0);
    expect(wrapper.findAll("tbody tr")).toHaveLength(1);
    expect(wrapper.text()).toContain("R-7");
  });

  it("clamps to the new last page when rows are removed (bulk delete)", async () => {
    const wrapper = mountTable(5);
    const table = tableOf(wrapper);
    table.setPageIndex(2);
    await nextTick();

    await wrapper.setProps({ data: rows.slice(0, 7) }); // 2 pages left
    await nextTick();

    expect(table.getState().pagination.pageIndex).toBe(1);
    expect(wrapper.findAll("tbody tr")).toHaveLength(2);
  });

  it("re-reads the server total and page count when a search narrows the result", async () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: columns as unknown as ColumnDef<unknown, unknown>[],
        data: rows, // 12 rows of a 62-row result
        serverMode: true,
        pageCount: 3,
        rowCount: 62,
        pageSize: 25,
        pagination: { pageIndex: 0, pageSize: 25 },
      },
    });
    const footer = () => wrapper.find('[data-slot="table-pagination-desktop"]').text();
    expect(footer()).toContain("62");
    expect(footer()).toContain("1 / 3");

    // The search came back: 4 matches on a single page. TanStack reads
    // pageCount/rowCount off the options proxy, so they must be GETTERS on the
    // useVueTable object — plain values freeze at mount and the footer would
    // keep reporting the unfiltered 62 over 3 pages forever.
    await wrapper.setProps({ data: rows.slice(0, 4), rowCount: 4, pageCount: 1 });

    expect(footer()).toContain("4");
    expect(footer()).not.toContain("62");
    expect(footer()).toContain("1 / 1");
  });

  it("hydrates and syncs controlled pagination from the pagination prop", async () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: columns as unknown as ColumnDef<unknown, unknown>[],
        data: rows.slice(0, 5),
        serverMode: true,
        pageCount: 3,
        rowCount: 12,
        pageSize: 25,
        pagination: { pageIndex: 1, pageSize: 25 },
        sorting: [{ id: "amount", desc: true }],
      },
    });

    const table = tableOf(wrapper);
    expect(table.getState().pagination).toEqual({ pageIndex: 1, pageSize: 25 });
    expect(table.getState().sorting).toEqual([{ id: "amount", desc: true }]);

    await wrapper.setProps({ pagination: { pageIndex: 0, pageSize: 25 } });
    expect(table.getState().pagination.pageIndex).toBe(0);

    await wrapper.setProps({ sorting: [{ id: "name", desc: false }] });
    expect(table.getState().sorting).toEqual([{ id: "name", desc: false }]);
  });

  it("renders its strings in the active locale", () => {
    i18n.global.locale.value = "en";
    try {
      const wrapper = mountTable(5);
      expect(wrapper.text()).toContain("Showing");
      expect(wrapper.find('button[aria-label="Next page"]').exists()).toBe(true);
      expect(wrapper.find('thead [aria-label="Select all rows"]').exists()).toBe(true);
      expect(wrapper.find('thead button[aria-label="Sort by المبلغ"]').exists()).toBe(true);
    } finally {
      i18n.global.locale.value = "ar";
    }
  });
});

describe("DataTable storageKey persistence", () => {
  const STORAGE_KEY = "aamin:table:spec-columns:columns";

  function mountStored() {
    return mount(DataTable, {
      props: {
        columns: columns as unknown as ColumnDef<unknown, unknown>[],
        data: rows,
        storageKey: "spec-columns",
        getRowId: (row: unknown) => (row as Row).id,
      },
    });
  }

  it("restores hidden columns on a later visit", async () => {
    localStorage.clear();
    const first = mountStored();
    tableOf(first).getColumn("amount")!.toggleVisibility(false);
    await nextTick();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ amount: false });
    first.unmount();

    // A fresh visit to the same screen: the admin should not have to re-hide it.
    const second = mountStored();
    await nextTick();
    expect(tableOf(second).getColumn("amount")!.getIsVisible()).toBe(false);
    expect(tableOf(second).getColumn("name")!.getIsVisible()).toBe(true);
  });

  it("keeps tables independent and forgets nothing when no storageKey is given", async () => {
    localStorage.clear();
    const stored = mountStored();
    tableOf(stored).getColumn("amount")!.toggleVisibility(false);
    await nextTick();

    // A table without a storageKey must not read another table's map.
    const ephemeral = mountTable(5);
    await nextTick();
    expect(tableOf(ephemeral).getColumn("amount")!.getIsVisible()).toBe(true);
  });

  it("show-all clears the stored map rather than leaving stale ids behind", async () => {
    localStorage.clear();
    const wrapper = mountStored();
    tableOf(wrapper).getColumn("amount")!.toggleVisibility(false);
    await nextTick();

    // What the "show all columns" item calls — persistence makes hiding
    // permanent, so the way back has to write through to storage too.
    tableOf(wrapper).resetColumnVisibility();
    await nextTick();
    expect(tableOf(wrapper).getColumn("amount")!.getIsVisible()).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({});
  });

  it("persists the client-mode page size and the phone view", async () => {
    localStorage.clear();
    const first = mountStored();
    tableOf(first).setPageSize(25);
    await first.get('button[aria-label="عرض كجدول"]').trigger("click");
    await nextTick();
    expect(JSON.parse(localStorage.getItem("aamin:table:spec-columns:pageSize")!)).toBe(25);
    expect(localStorage.getItem("aamin:table:spec-columns:mobileView")).toBe("table");
    first.unmount();

    const second = mountStored();
    expect(tableOf(second).getState().pagination.pageSize).toBe(25);
    expect(second.find('[data-slot="table-cards"]').exists()).toBe(false);
  });

  it.each(["abc", "0", "-5", "7", "2.5"])(
    "ignores a corrupt or unofferable stored page size (%s) and uses the pageSize prop",
    (stored) => {
      localStorage.clear();
      localStorage.setItem("aamin:table:spec-columns:pageSize", stored);
      const wrapper = mountStored(); // pageSize prop defaults to 10
      expect(tableOf(wrapper).getState().pagination.pageSize).toBe(10);
      expect(wrapper.findAll("tbody tr")).toHaveLength(10);
      expect(wrapper.find('[data-slot="table-pagination-desktop"]').exists()).toBe(true);
    },
  );

  it("never applies a stored page size in server mode (the parent fetches with its own)", () => {
    localStorage.clear();
    localStorage.setItem("aamin:table:spec-server:pageSize", "25");
    const wrapper = mount(DataTable, {
      props: {
        columns: columns as unknown as ColumnDef<unknown, unknown>[],
        data: rows.slice(0, 10),
        serverMode: true,
        pageCount: 7,
        rowCount: 62,
        pageSize: 10,
        storageKey: "spec-server",
      },
    });
    expect(tableOf(wrapper).getState().pagination.pageSize).toBe(10);
    const range = wrapper.find('[data-slot="table-pagination-desktop"]').text();
    expect(range).toContain("10");
    expect(range).not.toContain("25");
  });

  it("falls back to cards when the stored phone view is not a known value", () => {
    localStorage.clear();
    localStorage.setItem("aamin:table:spec-columns:mobileView", "garbage");
    const wrapper = mountStored();
    expect(wrapper.find('[data-slot="table-cards"]').exists()).toBe(true);
    expect(wrapper.get('button[aria-label="عرض كجدول"]').attributes("aria-pressed")).toBe("false");
  });
});

describe("DataTableViewOptions", () => {
  it("counts the hidden columns on the trigger so none goes missing silently", async () => {
    localStorage.clear();
    const table = mount(DataTable, {
      props: {
        columns: columns as unknown as ColumnDef<unknown, unknown>[],
        data: rows,
        getRowId: (row: unknown) => (row as Row).id,
      },
    });
    // Same generic erasure as the columns cast above: the SFC infers T = unknown
    // at the mount boundary.
    const menu = mount(DataTableViewOptions, {
      props: { table: tableOf(table) as unknown as Table<unknown> },
    });
    expect(menu.find("button").attributes("aria-label")).toBe("الأعمدة");
    expect(menu.text()).not.toMatch(/\d/);

    tableOf(table).getColumn("amount")!.toggleVisibility(false);
    tableOf(table).getColumn("name")!.toggleVisibility(false);
    await nextTick();

    expect(menu.text()).toContain("2");
    expect(menu.find("button").attributes("aria-label")).toContain("2");
  });
});

describe("column helpers", () => {
  it("numericCell wraps the value in .num with an optional title", () => {
    const wrapper = mount({ render: () => numericCell(42, "exact") });
    expect(wrapper.classes()).toContain("num");
    expect(wrapper.text()).toBe("42");
    expect(wrapper.attributes("title")).toBe("exact");
  });

  it("moneyCell groups and trims, revealing stored precision only on hover", () => {
    const trimmed = mount({ render: () => moneyCell("2000.00000") });
    expect(trimmed.classes()).toContain("num");
    expect(trimmed.text()).toBe("2,000");
    expect(trimmed.attributes("title")).toBeUndefined();

    const precise = mount({ render: () => moneyCell(2.0625) });
    expect(precise.text()).toBe("2.062");
    expect(precise.attributes("title")).toBe("2.0625");

    expect(mount({ render: () => moneyCell(null) }).text()).toBe("—");
  });
});

describe("StatusBadge", () => {
  it("maps completed to the success variant with its status.* label", () => {
    const wrapper = mount(StatusBadge, { props: { status: "completed" } });
    expect(wrapper.html()).toContain("text-success");
    expect(wrapper.text()).toContain(i18n.global.t("status.completed"));
    expect(wrapper.text()).toContain("مكتملة");
  });

  it("maps pending to warning and rejected to destructive", () => {
    expect(mount(StatusBadge, { props: { status: "pending" } }).html()).toContain("text-warning");
    expect(mount(StatusBadge, { props: { status: "rejected" } }).html()).toContain(
      "text-destructive",
    );
  });

  it("maps active/enabled to success and suspended to destructive", () => {
    for (const status of ["active", "enabled"])
      expect(mount(StatusBadge, { props: { status } }).html()).toContain("text-success");
    expect(mount(StatusBadge, { props: { status: "suspended" } }).html()).toContain(
      "text-destructive",
    );
  });

  it("falls back to secondary and shows the raw string for unknown statuses", () => {
    const wrapper = mount(StatusBadge, { props: { status: "حالة غير معروفة" } });
    expect(wrapper.text()).toContain("حالة غير معروفة");
    expect(wrapper.html()).not.toContain("text-success");
  });

  it("renders the label for the active locale", async () => {
    const wrapper = mount(StatusBadge, { props: { status: "pending" } });
    expect(wrapper.text()).toContain(i18n.global.t("status.pending", {}, { locale: "ar" }));
    i18n.global.locale.value = "en";
    try {
      const en = mount(StatusBadge, { props: { status: "pending" } });
      expect(en.text()).toContain(i18n.global.t("status.pending", {}, { locale: "en" }));
      expect(en.text()).not.toContain(i18n.global.t("status.pending", {}, { locale: "ar" }));
    } finally {
      i18n.global.locale.value = "ar";
    }
  });

  it("honours a caller-supplied map override", () => {
    const wrapper = mount(StatusBadge, {
      props: { status: "قيد المراجعة", map: { "قيد المراجعة": { variant: "warning" } } },
    });
    expect(wrapper.html()).toContain("text-warning");
  });

  it("lets a caller map override a default code's variant and label", () => {
    const wrapper = mount(StatusBadge, {
      props: { status: "pending", map: { pending: { variant: "destructive", label: "مخصص" } } },
    });
    expect(wrapper.html()).toContain("text-destructive");
    expect(wrapper.text()).toContain("مخصص");
  });
});
