// CompactPager (PageReadout jump) and FilterChips (clear-all).
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import CompactPager from "@/components/app/CompactPager.vue";
import FilterChips from "@/components/app/FilterChips.vue";

describe("CompactPager", () => {
  it("emits the clamped page from a jump", async () => {
    const w = mount(CompactPager, { props: { pageIndex: 0, pageCount: 5 } });
    await w.get("[data-slot=page-readout] button").trigger("click");
    await nextTick();
    await w.get("input").setValue("99");
    await w.get("input").trigger("keydown", { key: "Enter" });
    expect(w.emitted("update:pageIndex")!.at(-1)).toEqual([4]);
  });

  it("disables back arrows on the first page and forward arrows on the last", () => {
    const first = mount(CompactPager, { props: { pageIndex: 0, pageCount: 3 } });
    const firstButtons = first.findAll("button");
    // first, prev, readout, next, last
    expect(firstButtons[0].attributes("disabled")).toBeDefined();
    expect(firstButtons[1].attributes("disabled")).toBeDefined();
    expect(firstButtons[3].attributes("disabled")).toBeUndefined();

    const last = mount(CompactPager, { props: { pageIndex: 2, pageCount: 3 } });
    const lastButtons = last.findAll("button");
    expect(lastButtons[0].attributes("disabled")).toBeUndefined();
    expect(lastButtons[3].attributes("disabled")).toBeDefined();
    expect(lastButtons[4].attributes("disabled")).toBeDefined();
  });

  it("steps with next and goes to the end with last", async () => {
    const w = mount(CompactPager, { props: { pageIndex: 1, pageCount: 5 } });
    const buttons = w.findAll("button");
    await buttons[3].trigger("click");
    expect(w.emitted("update:pageIndex")!.at(-1)).toEqual([2]);
    await buttons[4].trigger("click");
    expect(w.emitted("update:pageIndex")!.at(-1)).toEqual([4]);
  });
});

describe("FilterChips", () => {
  it("emits clear-all from the clear button", async () => {
    const w = mount(FilterChips, {
      props: { chips: [{ id: "a", text: "نشط", clear: () => {} }] },
    });
    await w.get("[data-testid=filters-reset]").trigger("click");
    expect(w.emitted("clear-all")).toHaveLength(1);
  });

  it("clears a single chip by pressing it, and shows the date run in .num", async () => {
    let cleared = false;
    const w = mount(FilterChips, {
      props: {
        chips: [{ id: "d", text: "من", num: "2026/09/01", clear: () => (cleared = true) }],
      },
    });
    expect(w.get("[data-testid=filter-chip-d] .num").text()).toBe("2026/09/01");
    await w.get("[data-testid=filter-chip-d]").trigger("click");
    expect(cleared).toBe(true);
  });

  it("renders nothing without chips or a leading slot", () => {
    const w = mount(FilterChips, { props: { chips: [] } });
    expect(w.find("[data-testid=filter-chips]").exists()).toBe(false);
  });
});
