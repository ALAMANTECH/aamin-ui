import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import DateField from "@/components/app/DateField.vue";
import { Calendar } from "@/components/ui/calendar";
import ar from "@/locales/ar/common.json";

describe("DateField", () => {
  it("shows the placeholder without a date and the date in .num with one — never a native date input", () => {
    const empty = mount(DateField, { props: { modelValue: "", placeholder: "من تاريخ" } });
    expect(empty.text()).toContain("من تاريخ");
    expect(empty.find('input[type="date"]').exists()).toBe(false);

    const set = mount(DateField, { props: { modelValue: "2026-09-21" } });
    expect(set.get(".num").text()).toBe("2026/09/21");
  });

  it("falls back to the localized prompt and marks the button invalid", () => {
    const w = mount(DateField, { props: { modelValue: "", invalid: true, id: "paid-on" } });
    const button = w.get("button#paid-on");
    expect(button.text()).toContain(ar.common.pickDate);
    expect(button.attributes("aria-invalid")).toBe("true");
  });

  it("clears to the empty string only when clearable and set", async () => {
    const plain = mount(DateField, { props: { modelValue: "2026-09-21" } });
    expect(plain.find(`button[aria-label="${ar.common.clearDate}"]`).exists()).toBe(false);

    const w = mount(DateField, { props: { modelValue: "2026-09-21", clearable: true } });
    await w.get(`button[aria-label="${ar.common.clearDate}"]`).trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([""]);
  });

  it("hands the calendar its bounds as dates and emits the picked day as YYYY-MM-DD", async () => {
    const w = mount(DateField, {
      props: { modelValue: "2026-09-10", min: "2026-09-01", max: "2026-09-30" },
      attachTo: document.body,
    });
    await w.get("button").trigger("click");
    const calendar = w.findComponent(Calendar);
    expect(calendar.props("minValue")?.toString()).toBe("2026-09-01");
    expect(calendar.props("maxValue")?.toString()).toBe("2026-09-30");
    calendar.vm.$emit("update:modelValue", calendar.props("minValue"));
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["2026-09-01"]);
    w.unmount();
  });
});
