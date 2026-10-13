import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { ChartTooltipContent } from "@/components/ui/chart";
import { i18n } from "@/lib/i18n";

const config = {
  local: { label: "محلي", color: "var(--chart-1)" },
  service: { label: "حوالات", color: "var(--chart-2)" },
};

describe("ChartTooltipContent showTotal (kit addition)", () => {
  it("sums the configured numeric series into a separated total row", () => {
    const wrapper = mount(ChartTooltipContent, {
      props: {
        payload: { local: 100, service: 50 },
        config,
        showTotal: true,
        totalLabel: "الإجمالي",
      },
    });
    expect(wrapper.text()).toContain("الإجمالي");
    expect(wrapper.text()).toContain("150");
  });

  it("skips the total row when only one series is visible", () => {
    const wrapper = mount(ChartTooltipContent, {
      props: {
        payload: { local: 100 },
        config,
        showTotal: true,
        totalLabel: "الإجمالي",
      },
    });
    expect(wrapper.text()).not.toContain("الإجمالي");
  });

  it("renders no total row by default", () => {
    const wrapper = mount(ChartTooltipContent, {
      props: { payload: { local: 100, service: 50 }, config },
    });
    expect(wrapper.text()).not.toContain("150");
  });

  it("tooltip values are .num with Latin digits", () => {
    i18n.global.locale.value = "ar";
    const wrapper = mount(ChartTooltipContent, {
      props: { payload: { local: 12345.5 }, config },
    });
    expect(wrapper.find(".num").text()).toMatch(/^[0-9,.]+$/);
  });

  it("total value is .num too", () => {
    i18n.global.locale.value = "ar";
    const wrapper = mount(ChartTooltipContent, {
      props: {
        payload: { local: 1000, service: 2500 },
        config,
        showTotal: true,
        totalLabel: "الإجمالي",
      },
    });
    const nums = wrapper.findAll(".num").map((n) => n.text());
    expect(nums).toContain("3,500");
  });

  it("shows a zero value instead of hiding it", () => {
    const wrapper = mount(ChartTooltipContent, {
      props: { payload: { local: 0, service: 50 }, config },
    });
    const nums = wrapper.findAll(".num").map((n) => n.text());
    expect(nums).toEqual(["0", "50"]);
  });
});
