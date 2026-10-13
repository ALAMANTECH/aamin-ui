import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { buttonVariants } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DialogFooter } from "@/components/ui/dialog";
import indicatorSrc from "@/components/ui/tabs/TabsIndicator.vue?raw";
import selectContentSrc from "@/components/ui/select/SelectContent.vue?raw";
import { tabsListVariants } from "@/components/ui/tabs";
import * as Combobox from "@/components/ui/combobox";
import { SelectContent } from "@/components/ui/select";

describe("button variants", () => {
  it.each(["success", "warning", "info"] as const)("%s is a soft tint", (variant) => {
    const cls = buttonVariants({ variant });
    expect(cls).toMatch(/bg-(success|warning|chart-2)\/10/);
    expect(cls).not.toMatch(/glow-primary/);
  });
});

describe("toggle-group", () => {
  it("renders data-orientation so flush groups get rounded ends", () => {
    const w = mount({
      components: { ToggleGroup, ToggleGroupItem },
      template: `<ToggleGroup type="single"><ToggleGroupItem value="a">A</ToggleGroupItem></ToggleGroup>`,
    });
    expect(w.html()).toContain('data-orientation="horizontal"');
  });
});

describe("dialog footer", () => {
  it("bleed supplies its own inset and a top rule", () => {
    const w = mount(DialogFooter, { props: { bleed: true } });
    const cls = w.classes();
    expect(cls).toContain("px-4");
    expect(cls).toContain("sm:px-6");
    expect(cls).toContain("border-t");
  });
});

describe("tabs", () => {
  it("list hides its scrollbar on phones (no visible scroll-x bar)", () => {
    const cls = tabsListVariants({});
    expect(cls).not.toMatch(/(^|\s)scroll-x(\s|$)/);
    expect(cls).toMatch(/snap-x/);
    expect(cls).toContain("[scrollbar-width:none]");
  });

  it("scroll-strip behaviour is horizontal-only (vertical lists are untouched)", () => {
    const cls = tabsListVariants({});
    const strip = cls
      .split(/\s+/)
      .filter((c) => /snap-|overflow-|scrollbar|mask-image/.test(c) && !c.startsWith("sm:"));
    expect(strip.length).toBeGreaterThan(0);
    for (const c of strip) expect(c).toMatch(/^group-data-horizontal\/tabs:/);
  });

  it("indicator is written as arbitrary properties (registry rtl codemod safe)", () => {
    const src = indicatorSrc;
    expect(src).toContain("[translate:var(--reka-tabs-indicator-position)]");
    expect(src).toContain("[width:var(--reka-tabs-indicator-size)]");
    expect(src).not.toMatch(/translate-x-/);
  });
});

describe("combobox", () => {
  it("re-exports ComboboxVirtualizer", () => {
    expect(Combobox).toHaveProperty("ComboboxVirtualizer");
  });
});

describe("select content", () => {
  it("anchors under the trigger with a single 4px offset (no extra translate)", () => {
    const props = (SelectContent as unknown as { props: Record<string, { default?: unknown }> })
      .props;
    expect(props.position.default).toBe("popper");
    expect(props.sideOffset.default).toBe(4);
    const src = selectContentSrc;
    expect(src).not.toMatch(/translate-y-1|translate-x-1/);
    expect(src).not.toContain("cn-menu-translucent");
  });
});
