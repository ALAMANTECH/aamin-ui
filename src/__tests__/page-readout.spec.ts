// The "n / m" page readout that doubles as the jump control (DataTablePagination):
// the shared parser plus the readout's open/commit/cancel behaviour.
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { PageReadout, resolvePage } from "@/components/app/datatable";

describe("resolvePage", () => {
  it("maps a 1-based page to a 0-based index", () => {
    expect(resolvePage("5", 412)).toBe(4);
  });
  it("ignores empty and non-numeric input", () => {
    expect(resolvePage("", 412)).toBeNull();
    expect(resolvePage("abc", 412)).toBeNull();
  });
  it("strips stray characters", () => {
    expect(resolvePage("12a", 412)).toBe(11);
  });
  it("clamps to both edges", () => {
    expect(resolvePage("0", 412)).toBe(0);
    expect(resolvePage("999", 412)).toBe(411);
  });
  it("treats a zero page count as a single page", () => {
    expect(resolvePage("7", 0)).toBe(0);
  });
});

describe("PageReadout", () => {
  it("shows the readout as a button, then a pre-filled input on click", async () => {
    const wrapper = mount(PageReadout, { props: { pageIndex: 4, pageCount: 412 } });
    expect(wrapper.find("input").exists()).toBe(false);
    expect(wrapper.text()).toContain("5");
    expect(wrapper.text()).toContain("412");
    await wrapper.find("button").trigger("click");
    await nextTick();
    const input = wrapper.find("input");
    expect(input.exists()).toBe(true);
    expect((input.element as HTMLInputElement).value).toBe("5");
  });

  it("commits a clamped index on Enter and cancels on Escape", async () => {
    const wrapper = mount(PageReadout, { props: { pageIndex: 4, pageCount: 412 } });
    await wrapper.find("button").trigger("click");
    await nextTick();
    await wrapper.find("input").setValue("999");
    await wrapper.find("input").trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:pageIndex")).toEqual([[411]]);
    expect(wrapper.find("input").exists()).toBe(false);

    await wrapper.find("button").trigger("click");
    await nextTick();
    await wrapper.find("input").setValue("300");
    await wrapper.find("input").trigger("keydown", { key: "Escape" });
    expect(wrapper.emitted("update:pageIndex")).toHaveLength(1);
    expect(wrapper.find("input").exists()).toBe(false);
  });

  it("does not emit when the typed page is the current one or empty", async () => {
    const wrapper = mount(PageReadout, { props: { pageIndex: 4, pageCount: 412 } });
    await wrapper.find("button").trigger("click");
    await nextTick();
    await wrapper.find("input").trigger("keydown", { key: "Enter" }); // still "5"
    await wrapper.find("button").trigger("click");
    await nextTick();
    await wrapper.find("input").setValue("");
    await wrapper.find("input").trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:pageIndex")).toBeUndefined();
  });

  it("stays a plain readout while busy", async () => {
    const wrapper = mount(PageReadout, { props: { pageIndex: 0, pageCount: 3, busy: true } });
    expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    await wrapper.find("button").trigger("click");
    await nextTick();
    expect(wrapper.find("input").exists()).toBe(false);
  });

  it("labels the control in the active locale", async () => {
    const { i18n } = await import("@/lib/i18n");
    const wrapper = mount(PageReadout, { props: { pageIndex: 1, pageCount: 9 } });
    expect(wrapper.find("button").attributes("aria-label")).toBe(
      i18n.global.t("datatable.pageReadoutAria", { page: 2, count: 9 }),
    );
    expect(wrapper.find("button").attributes("aria-label")).toContain("9");
  });
});
