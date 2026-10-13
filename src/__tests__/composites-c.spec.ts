// Composites C: DaybookList, BrandMark, AttachmentViewer, ChartState,
// StickySubmitBar, useLeaveGuard. NotificationBell lives in its own spec
// (notification-bell.spec.ts).
import { describe, it, expect, afterEach } from "vitest";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { MinusIcon, PlusIcon } from "@/lib/icons";
import { i18n } from "@/lib/i18n";
import { useDir } from "@/composables/useDir";
import { useLeaveGuard } from "@/composables/useLeaveGuard";
import { TooltipProvider } from "@/components/ui/tooltip";
import DaybookList from "@/components/app/DaybookList.vue";
import BrandMark from "@/components/app/BrandMark.vue";
import AttachmentViewer, { type Attachment } from "@/components/app/AttachmentViewer.vue";
import ChartState from "@/components/app/ChartState.vue";
import StickySubmitBar from "@/components/app/StickySubmitBar.vue";
import { tooltipHtml } from "@/components/app/chart-theme";

const t = i18n.global.t;

// jsdom has no ResizeObserver; reka's popper/dialog measure with it.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

enableAutoUnmount(afterEach);

afterEach(() => {
  useDir().dir.value = "rtl";
});

describe("DaybookList", () => {
  it("DaybookList signs and colors entries from caller-supplied kinds and formats via money.ts", () => {
    const w = mount(DaybookList, {
      props: {
        rows: [{ id: 1, at: "2026-10-05T10:00:00Z", kind: "out", label: "x", amount: 12.34567 }],
        kinds: { out: { icon: MinusIcon, tone: "destructive", sign: -1 } },
        pageIndex: 0,
        pageCount: 1,
        rowCount: 1,
      },
    });
    expect(w.text()).toContain("12.345");
    expect(w.html()).toContain("text-destructive");
  });

  it("groups rows by calendar day and prefixes the sign from the kind", () => {
    const w = mount(DaybookList, {
      props: {
        rows: [
          { id: 1, at: "2026-10-05T10:00:00Z", kind: "in", label: "a", amount: 2000 },
          { id: 2, at: "2026-10-05T09:00:00Z", kind: "out", label: "b", amount: 500 },
          { id: 3, at: "2026-10-04T09:00:00Z", kind: "in", label: "c", amount: 1 },
        ],
        kinds: {
          in: { icon: PlusIcon, tone: "success", sign: 1 },
          out: { icon: MinusIcon, tone: "destructive", sign: -1 },
        },
      },
    });
    expect(w.findAll("section")).toHaveLength(2);
    expect(w.text()).toContain("2026/10/05");
    expect(w.text()).toContain("+");
    expect(w.text()).toContain("−");
    expect(w.text()).toContain("2,000");
    expect(w.text()).not.toContain("2000.00");
  });

  describe("day total", () => {
    const kinds = {
      in: { icon: PlusIcon, tone: "success" as const, sign: 1 as const },
      out: { icon: MinusIcon, tone: "destructive" as const, sign: -1 as const },
      move: { icon: PlusIcon, tone: "warning" as const, sign: 0 as const },
    };
    const day = (rows: { kind: string; amount: number; currency?: string }[]) =>
      rows.map((r, i) => ({
        id: i,
        at: `2026-10-05T1${i}:00:00Z`,
        label: `r${i}`,
        currency: "د.ل",
        ...r,
      }));
    const header = (w: ReturnType<typeof mount>) => w.get("section header");

    it("defaults to the signed net and shows a zero net", () => {
      const w = mount(DaybookList, {
        props: {
          rows: day([
            { kind: "in", amount: 500 },
            { kind: "out", amount: 500 },
          ]),
          kinds,
        },
      });
      const h = header(w);
      expect(h.text()).toContain(t("daybook.dayNet"));
      expect(h.find("[data-slot=day-total] .num").text()).toBe("0");
      expect(h.find("[data-slot=day-total]").classes()).toContain("text-muted-foreground");
    });

    it("signs and tones a positive net (sign-0 kinds add nothing)", () => {
      const w = mount(DaybookList, {
        props: {
          rows: day([
            { kind: "in", amount: 500 },
            { kind: "out", amount: 200 },
            { kind: "move", amount: 9999 },
          ]),
          kinds,
        },
      });
      const total = header(w).get("[data-slot=day-total]");
      expect(total.get(".num").text()).toBe("300");
      expect(total.text()).toContain("+");
      expect(total.classes()).toContain("text-success");
    });

    it("tones a negative net destructive with a minus sign", () => {
      const w = mount(DaybookList, {
        props: {
          rows: day([
            { kind: "in", amount: 100 },
            { kind: "out", amount: 250 },
          ]),
          kinds,
        },
      });
      const total = header(w).get("[data-slot=day-total]");
      expect(total.get(".num").text()).toBe("150");
      expect(total.text()).toContain("−");
      expect(total.classes()).toContain("text-destructive");
    });

    it("turnover mode sums magnitudes under the turnover label", () => {
      const w = mount(DaybookList, {
        props: {
          rows: day([
            { kind: "in", amount: 500 },
            { kind: "out", amount: 200 },
          ]),
          kinds,
          dayTotal: "turnover",
        },
      });
      const h = header(w);
      expect(h.text()).toContain(t("daybook.dayTurnover"));
      expect(h.get("[data-slot=day-total] .num").text()).toBe("700");
      expect(h.text()).not.toContain(t("daybook.dayNet"));
    });

    it("hides the total when the day mixes currencies", () => {
      const w = mount(DaybookList, {
        props: {
          rows: day([
            { kind: "in", amount: 500, currency: "د.ل" },
            { kind: "out", amount: 200, currency: "USD" },
          ]),
          kinds,
        },
      });
      expect(header(w).find("[data-slot=day-total]").exists()).toBe(false);
      expect(header(w).text()).not.toContain(t("daybook.dayNet"));
    });

    it("count mode (and the deprecated showDayTotal=false) shows the row count", () => {
      for (const props of [{ dayTotal: "count" as const }, { showDayTotal: false }]) {
        const w = mount(DaybookList, {
          props: {
            rows: day([
              { kind: "in", amount: 5 },
              { kind: "out", amount: 7 },
            ]),
            kinds,
            ...props,
          },
        });
        expect(header(w).find("[data-slot=day-total]").exists()).toBe(false);
        expect(header(w).get("[data-slot=day-count]").text()).toBe("2");
      }
    });

    it("none mode shows no badge", () => {
      const w = mount(DaybookList, {
        props: { rows: day([{ kind: "in", amount: 5 }]), kinds, dayTotal: "none" },
      });
      expect(header(w).find("[data-slot=day-total]").exists()).toBe(false);
      expect(header(w).find("[data-slot=day-count]").exists()).toBe(false);
    });
  });

  it("falls back to a muted, unsigned row for an unknown kind", () => {
    const w = mount(DaybookList, {
      props: {
        rows: [{ id: 1, at: "2026-10-05T10:00:00Z", kind: "nope", label: "x", amount: 3 }],
        kinds: {},
      },
    });
    expect(w.html()).toContain("text-muted-foreground");
    expect(w.text()).not.toContain("−");
  });

  it("shows the error panel with retry when the first load failed", async () => {
    const w = mount(DaybookList, { props: { rows: [], kinds: {}, error: "boom" } });
    expect(w.text()).toContain(t("daybook.loadError"));
    await w.get("button").trigger("click");
    expect(w.emitted("retry")).toHaveLength(1);
  });

  it("shows the pager only for more than one page and re-emits its page", async () => {
    const one = mount(DaybookList, { props: { rows: [], kinds: {}, pageCount: 1 } });
    expect(one.find("[data-slot=page-readout]").exists()).toBe(false);
    const many = mount(DaybookList, {
      props: { rows: [], kinds: {}, pageIndex: 0, pageCount: 3, rowCount: 60 },
    });
    expect(many.text()).toContain("60");
    const buttons = many.findAll("button");
    await buttons[3]!.trigger("click");
    expect(many.emitted("update:pageIndex")!.at(-1)).toEqual([1]);
  });
});

describe("BrandMark", () => {
  it("BrandMark falls back to a tinted first letter", () => {
    const w = mount(BrandMark, { props: { name: "Libyana", seed: "libyana" } });
    expect(w.text()).toBe("L");
    expect(w.classes().some((c) => c.startsWith("bg-"))).toBe(true);
  });

  it("is stable per seed and shows the image when a src is given", async () => {
    const a = mount(BrandMark, { props: { name: "A", seed: "x" } });
    const b = mount(BrandMark, { props: { name: "B", seed: "x" } });
    expect(a.classes()).toEqual(b.classes());
    const img = mount(BrandMark, { props: { name: "A", src: "data:image/svg+xml,<svg/>" } });
    expect(img.find("img").exists()).toBe(true);
    await img.get("img").trigger("error");
    expect(img.find("img").exists()).toBe(false);
    expect(img.text()).toBe("A");
  });
});

describe("AttachmentViewer", () => {
  const files: Attachment[] = [
    { id: 1, name: "a.svg", url: "data:image/svg+xml,<svg/>", mime: "image/svg+xml" },
    { id: 2, name: "b.svg", url: "data:image/svg+xml,<svg/>", mime: "image/svg+xml" },
    { id: 3, name: "c.docx", url: "data:,x", mime: "application/msword" },
  ];

  function mountViewer(modelValue: string | number | null, attachments: Attachment[] = files) {
    const emitted: unknown[] = [];
    const Root = defineComponent({
      setup: () => () =>
        h(TooltipProvider, null, () =>
          h(AttachmentViewer, {
            attachments,
            modelValue,
            "onUpdate:modelValue": (v: unknown) => emitted.push(v),
          }),
        ),
    });
    const wrapper = mount(Root, { attachTo: document.body });
    return { emitted, wrapper };
  }

  function press(key: string) {
    const dialog = document.body.querySelector("[role=dialog]")!;
    dialog.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  }

  it("AttachmentViewer arrow keys step through the set (direction-aware)", async () => {
    useDir().dir.value = "ltr";
    const ltr = mountViewer(1);
    await nextTick();
    press("ArrowRight");
    expect(ltr.emitted.at(-1)).toBe(2);
    press("ArrowLeft");
    expect(ltr.emitted.at(-1)).toBe(3); // wraps backwards from the first
    ltr.wrapper.unmount();

    useDir().dir.value = "rtl";
    const rtl = mountViewer(1);
    await nextTick();
    press("ArrowLeft");
    expect(rtl.emitted.at(-1)).toBe(2);
    press("ArrowRight");
    expect(rtl.emitted.at(-1)).toBe(3);
  });

  it("renders images in the stage and a no-preview panel for other types", async () => {
    const first = mountViewer(1);
    await nextTick();
    expect(document.body.querySelector("[role=dialog] img")).not.toBeNull();
    first.wrapper.unmount();
    mountViewer(3);
    await nextTick();
    expect(document.body.querySelector("[role=dialog] img")).toBeNull();
    expect(document.body.textContent).toContain(t("attachments.noPreview"));
  });

  describe("URL safety", () => {
    const stage = () => document.body.querySelector("[role=dialog]")!;
    const usesUrl = (url: string) =>
      [...stage().querySelectorAll("img, iframe, a")].some(
        (el) => el.getAttribute("src") === url || el.getAttribute("href") === url,
      );

    it.each([
      ["image", "image/png"],
      ["pdf", "application/pdf"],
      ["other", "application/msword"],
    ])("never renders a javascript: url (%s)", async (_kind, mime) => {
      const url = "javascript:alert(1)";
      mountViewer(9, [{ id: 9, name: "x", url, mime }]);
      await nextTick();
      expect(usesUrl(url)).toBe(false);
      expect(stage().querySelector("img, iframe")).toBeNull();
      expect(stage().querySelector("a[href]")).toBeNull();
      // The fallback still says how the file would open — just without a link.
      expect(stage().textContent).toContain(t("attachments.openInTab"));
    });

    it("decides PDF by mime only — an image named x.pdf is not framed", async () => {
      mountViewer(9, [
        { id: 9, name: "x.pdf", url: "https://files.example/x.pdf", mime: "image/png" },
      ]);
      await nextTick();
      expect(stage().querySelector("iframe")).toBeNull();
      expect(stage().querySelector("img")?.getAttribute("src")).toBe("https://files.example/x.pdf");
    });

    it("does not frame a non-PDF mime just because the name ends in .pdf", async () => {
      mountViewer(9, [
        { id: 9, name: "x.pdf", url: "https://files.example/x", mime: "application/octet-stream" },
      ]);
      await nextTick();
      expect(stage().querySelector("iframe")).toBeNull();
    });

    it("frames an https PDF and links it", async () => {
      const url = "https://files.example/statement.pdf";
      mountViewer(9, [{ id: 9, name: "statement", url, mime: "application/pdf" }]);
      await nextTick();
      expect(stage().querySelector("iframe")?.getAttribute("src")).toBe(url);
      expect(stage().querySelector("a")?.getAttribute("href")).toBe(url);
    });

    it("does not frame a data: PDF (data: is allowed for image/* only)", async () => {
      mountViewer(9, [
        { id: 9, name: "p", url: "data:application/pdf;base64,AA==", mime: "application/pdf" },
      ]);
      await nextTick();
      expect(stage().querySelector("iframe")).toBeNull();
      expect(stage().querySelector("a[href]")).toBeNull();
    });

    it("allows blob: and relative URLs", async () => {
      mountViewer(9, [
        { id: 9, name: "p", url: "blob:http://localhost/abc", mime: "application/pdf" },
      ]);
      await nextTick();
      expect(stage().querySelector("iframe")?.getAttribute("src")).toBe(
        "blob:http://localhost/abc",
      );
    });
  });

  it("is closed when the model is null", async () => {
    mountViewer(null);
    await nextTick();
    expect(document.body.querySelector("[role=dialog]")).toBeNull();
  });
});

describe("ChartState", () => {
  it("gates skeleton → error → empty → slot", async () => {
    const slots = { default: () => h("p", { id: "chart" }, "chart") };
    const w = mount(ChartState, { props: { loading: true, error: "", empty: false }, slots });
    expect(w.find("#chart").exists()).toBe(false);
    await w.setProps({ loading: false, error: "down" });
    expect(w.text()).toContain(t("chart.error"));
    await w.get("button").trigger("click");
    expect(w.emitted("retry")).toHaveLength(1);
    await w.setProps({ error: "", empty: true });
    expect(w.text()).toContain(t("chart.noData"));
    await w.setProps({ empty: false });
    expect(w.find("#chart").exists()).toBe(true);
  });
});

describe("chart-theme tooltipHtml", () => {
  it("escapes caller strings and keeps values inside .num", () => {
    const html = tooltipHtml("<b>t</b>", [
      { color: "var(--chart-1)", label: "<i>", value: "1,000" },
    ]);
    expect(html).not.toContain("<b>t</b>");
    expect(html).toContain("&lt;i&gt;");
    expect(html).toContain('class="num font-medium text-popover-foreground">1,000');
  });
});

describe("StickySubmitBar", () => {
  it("renders stats, emits submit/cancel and locks both while busy", async () => {
    const w = mount(StickySubmitBar, {
      props: { stats: [{ label: "rows", value: "12" }], busy: false, submitLabel: "Send" },
    });
    expect(w.get("dd .num").text()).toBe("12");
    await w.get("[data-testid=sticky-submit]").trigger("click");
    await w.get("[data-testid=sticky-cancel]").trigger("click");
    expect(w.emitted("submit")).toHaveLength(1);
    expect(w.emitted("cancel")).toHaveLength(1);

    await w.setProps({ busy: true });
    expect(w.get("[data-testid=sticky-submit]").attributes("disabled")).toBeDefined();
    expect(w.get("[data-testid=sticky-cancel]").attributes("disabled")).toBeDefined();
    expect(w.text()).toContain(t("submitBar.busy"));
  });
});

describe("useLeaveGuard", () => {
  it("blocks a tab close only while busy", async () => {
    const busy = ref(false);
    mount(
      defineComponent({
        setup() {
          useLeaveGuard(busy);
          return () => h("div");
        },
      }),
    );
    const idle = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(idle);
    expect(idle.defaultPrevented).toBe(false);
    busy.value = true;
    const leaving = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(leaving);
    expect(leaving.defaultPrevented).toBe(true);
  });
});
