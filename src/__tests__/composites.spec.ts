// Behavioural tests for the plan 008 fintech composites: the PinConfirm
// state machine (auto-submit, error, cooldown), the async-ready StatCard /
// EmptyState affordances, the Timeline renderer, and CopyButton's icon swap.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises, type VueWrapper } from "@vue/test-utils";
import { nextTick, h, defineComponent, type Component } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { toast } from "vue-sonner";
import { CheckIcon, CopyIcon } from "@/lib/icons";
import { TooltipProvider } from "@/components/ui/tooltip";
import PinConfirm from "@/components/app/PinConfirm.vue";
import { PinInput } from "@/components/ui/pin-input";
import StatCard from "@/components/app/StatCard.vue";
import EmptyState from "@/components/app/EmptyState.vue";
import PageHeader from "@/components/app/PageHeader.vue";
import MoneyFigure from "@/components/app/MoneyFigure.vue";
import Sparkline from "@/components/app/Sparkline.vue";
import Timeline, { type TimelineItem } from "@/components/app/Timeline.vue";
import CopyButton from "@/components/app/CopyButton.vue";
import AppTopbar from "@/components/app/AppTopbar.vue";
import AppSidebar from "@/components/app/AppSidebar.vue";
import BlankLayout from "@/layouts/BlankLayout.vue";

// PinInput's generic <script setup> component confuses findComponent's
// return-type inference (it falls back to DOMWrapper, which has no `.vm`),
// so the wrapper is cast to a minimal hand-typed shape instead.
interface PinInputWrapper {
  vm: { $emit(event: "update:modelValue", value: string[]): void };
}

// Drives the pin-input's v-model directly through the emitted event rather
// than simulating raw keystrokes on jsdom <input> elements — this exercises
// PinConfirm's own state machine (the thing plan 008 actually adds) without
// depending on reka-ui's internal DOM/composition-event handling, which is
// that library's concern, not this component's.
function setCode(wrapper: VueWrapper, code: string[]) {
  const pinInput = wrapper.findComponent(PinInput) as unknown as PinInputWrapper;
  pinInput.vm.$emit("update:modelValue", code);
}

/** Real DOM value of each rendered pin slot, in order. */
function slotValues(wrapper: VueWrapper): string[] {
  return wrapper
    .findAll('input[aria-label^="pin input"]')
    .map((input) => (input.element as HTMLInputElement).value);
}

describe("PinConfirm", () => {
  it("auto-submits once all slots are filled and emits success", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const wrapper = mount(PinConfirm, {
      props: { variant: "inline", title: "تأكيد", onConfirm },
    });
    await nextTick();

    setCode(wrapper, ["1", "1", "1", "1", "1", "1"]);
    await flushPromises();

    expect(onConfirm).toHaveBeenCalledWith("111111");
    expect(wrapper.emitted("success")).toBeTruthy();
  });

  it("does not submit while the code is incomplete", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const wrapper = mount(PinConfirm, {
      props: { variant: "inline", title: "تأكيد", onConfirm },
    });
    await nextTick();

    setCode(wrapper, ["1", "2", "3"]);
    await flushPromises();

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("surfaces an onConfirm rejection as the error state and clears the code", async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error("رمز غير صحيح"));
    const wrapper = mount(PinConfirm, {
      props: { variant: "inline", title: "تأكيد", onConfirm },
    });
    await nextTick();

    setCode(wrapper, ["2", "2", "2", "2", "2", "2"]);
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain("رمز غير صحيح");
    expect(wrapper.find('[role="alert"]').exists()).toBe(true);
    expect(wrapper.emitted("success")).toBeFalsy();
    // Rejection resets the bound code so the (remounted) slots start empty.
    expect(slotValues(wrapper).every((value) => value === "")).toBe(true);
  });

  it("counts the resend cooldown down and re-enables resend at zero", async () => {
    vi.useFakeTimers();
    try {
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      const wrapper = mount(PinConfirm, {
        props: { variant: "inline", title: "تأكيد", onConfirm, cooldown: 5 },
      });
      await nextTick();

      expect(wrapper.text()).toContain("5");

      vi.advanceTimersByTime(3000);
      await nextTick();
      expect(wrapper.text()).toContain("2");

      vi.advanceTimersByTime(2000);
      await nextTick();
      expect(wrapper.text()).toContain("إعادة الإرسال");

      const resendButton = wrapper
        .findAll("button")
        .find((b) => b.text().includes("إعادة الإرسال"));
      expect(resendButton?.attributes("disabled")).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("PinConfirm resend countdown", () => {
  it("keeps the resend countdown digits inside a .num span (rule 2)", async () => {
    const wrapper = mount(PinConfirm, {
      props: { variant: "inline", title: "تأكيد", onConfirm: vi.fn(), cooldown: 5 },
    });
    await nextTick();
    const resend = wrapper.findAll("button").find((b) => b.text().includes("إعادة الإرسال"));
    expect(resend?.find("span.num").text()).toBe("5");
  });

  it("uses responsive slot sizing", async () => {
    const wrapper = mount(PinConfirm, {
      props: { variant: "inline", title: "تأكيد", onConfirm: vi.fn() },
    });
    await nextTick();
    const slot = wrapper.find('[data-slot="pin-input-slot"]');
    expect(slot.classes()).toEqual(expect.arrayContaining(["size-8", "sm:size-10", "sm:text-lg"]));
  });
});

describe("StatCard", () => {
  it("renders a skeleton instead of the value while loading, but keeps the label", () => {
    const wrapper = mount(StatCard, {
      props: { label: "مبيعات اليوم", value: "48,220", loading: true },
    });
    expect(wrapper.text()).toContain("مبيعات اليوم");
    expect(wrapper.text()).not.toContain("48,220");
    expect(wrapper.find('[data-slot="skeleton"]').exists()).toBe(true);
  });

  it("renders the value normally when not loading and no error", () => {
    const wrapper = mount(StatCard, {
      props: { label: "مبيعات اليوم", value: "48,220" },
    });
    expect(wrapper.text()).toContain("48,220");
    expect(wrapper.find('[data-slot="skeleton"]').exists()).toBe(false);
  });

  it("renders a destructive message and emits retry in the error state", async () => {
    const wrapper = mount(StatCard, {
      props: { label: "مبيعات اليوم", value: "48,220", error: "تعذّر التحميل" },
    });
    expect(wrapper.text()).toContain("تعذّر التحميل");
    expect(wrapper.text()).not.toContain("48,220");
    await wrapper.get("button").trigger("click");
    expect(wrapper.emitted("retry")).toBeTruthy();
  });
});

// Tooltip parts need an ancestor provider (App.vue supplies it in the app).
function mountWithTooltips(component: Component, props: Record<string, unknown>) {
  return mount(
    defineComponent({
      render: () => h(TooltipProvider, null, { default: () => h(component, props) }),
    }),
  );
}

describe("StatCard money", () => {
  it("truncates money to 3 decimals (never rounds) and exposes the exact value via tooltip", () => {
    // Money is detected from the value itself (numeric string/number), no flag.
    const w = mountWithTooltips(StatCard, { label: "x", value: "1234.56789" });
    expect(w.text()).toContain("1,234.567");
    expect(w.text()).not.toContain("1,234.568");
    // truncated → wrapped in the cursor-help tooltip trigger
    expect(w.find(".cursor-help").exists()).toBe(true);
  });

  it("does not add a hover affordance when nothing is hidden", () => {
    const w = mount(StatCard, { props: { label: "x", value: "1234.5" } });
    expect(w.text()).toContain("1,234.5");
    expect(w.find(".cursor-help").exists()).toBe(false);
  });

  it("passes non-numeric values through untouched", () => {
    const w = mount(StatCard, { props: { label: "x", value: "—" } });
    expect(w.text()).toContain("—");
  });

  it("renders hint and the #footer slot", () => {
    const w = mount(StatCard, {
      props: { label: "x", value: "10", hint: "عدد العمليات" },
      slots: { footer: "<span data-testid='ft'>دائن</span>" },
    });
    expect(w.text()).toContain("عدد العمليات");
    expect(w.find("[data-testid='ft']").exists()).toBe(true);
  });
});

describe("MoneyFigure", () => {
  it("never compacts", () => {
    const w = mount(MoneyFigure, { props: { value: 1660000, currency: "LYD" } });
    expect(w.text()).toContain("1,660,000");
    expect(w.text()).not.toMatch(/M|مليون/);
  });

  it("shows the exact value on hover only when precision is hidden", () => {
    const hidden = mountWithTooltips(MoneyFigure, { value: 311843.61092, currency: "LYD" });
    expect(hidden.find(".cursor-help").exists()).toBe(true);
    const plain = mount(MoneyFigure, { props: { value: 2000, currency: "LYD" } });
    expect(plain.find(".cursor-help").exists()).toBe(false);
  });
});

describe("Sparkline", () => {
  it("renders the hover chip with a formatted value when labels are provided", async () => {
    const w = mount(Sparkline, { props: { data: [1, 2, 1234.5678], labels: ["a", "b", "c"] } });
    const surface = w.get("[data-spark-hover]");
    vi.spyOn(surface.element, "getBoundingClientRect").mockReturnValue({
      left: 0,
      width: 100,
    } as DOMRect);
    // jsdom has no PointerEvent; a MouseEvent named "pointermove" carries clientX.
    surface.element.dispatchEvent(new MouseEvent("pointermove", { clientX: 100, bubbles: true }));
    await nextTick();
    expect(w.text()).toContain("c");
    expect(w.text()).toContain("1,234.567");
  });

  it("is purely decorative without labels", () => {
    const w = mount(Sparkline, { props: { data: [1, 2, 3] } });
    expect(w.find("[data-spark-hover]").exists()).toBe(false);
  });

  it("draws an end dot only when asked", () => {
    expect(mount(Sparkline, { props: { data: [1, 2, 3] } }).findAll("circle")).toHaveLength(0);
    expect(
      mount(Sparkline, { props: { data: [1, 2, 3], endDot: true } }).findAll("circle"),
    ).toHaveLength(2);
  });
});

describe("EmptyState", () => {
  it("bare drops the dashed frame", () => {
    const w = mount(EmptyState, { props: { state: "empty", title: "t", bare: true } });
    expect(w.html()).not.toContain("border-dashed");
    expect(mount(EmptyState, { props: { title: "t" } }).html()).toContain("border-dashed");
  });

  it("keeps the default empty-state markup when state is unset", () => {
    const wrapper = mount(EmptyState, { props: { title: "لا توجد بيانات" } });
    expect(wrapper.text()).toContain("لا توجد بيانات");
  });

  it("renders a retry affordance in the error state and emits retry on click", async () => {
    const wrapper = mount(EmptyState, {
      props: { title: "تعذّر التحميل", state: "error", errorMessage: "تحقق من الاتصال" },
    });
    expect(wrapper.text()).toContain("تعذّر التحميل");
    expect(wrapper.text()).toContain("تحقق من الاتصال");

    const retryButton = wrapper.findAll("button").find((b) => b.text().includes("إعادة المحاولة"));
    expect(retryButton).toBeTruthy();
    await retryButton!.trigger("click");
    expect(wrapper.emitted("retry")).toBeTruthy();
  });

  it("renders a loading affordance in the loading state", () => {
    const wrapper = mount(EmptyState, {
      props: { title: "جارٍ التحميل…", state: "loading" },
    });
    expect(wrapper.text()).toContain("جارٍ التحميل…");
    expect(wrapper.find('[role="status"]').exists()).toBe(true);
  });
});

describe("Timeline", () => {
  const items: TimelineItem[] = [
    { time: "قبل دقيقة", text: "حدث أول" },
    { time: "قبل ساعة", text: "حدث ثانٍ" },
    {
      time: "أمس",
      text: "غيّر الحد اليومي",
      diff: { field: "الحد اليومي", from: "5,000 د.ل", to: "8,000 د.ل" },
    },
  ];

  it("renders one item per entry", () => {
    const wrapper = mount(Timeline, { props: { items } });
    expect(wrapper.findAll("li")).toHaveLength(3);
    expect(wrapper.text()).toContain("حدث أول");
    expect(wrapper.text()).toContain("حدث ثانٍ");
  });

  it("renders a diff row with the from/to values", () => {
    const wrapper = mount(Timeline, { props: { items } });
    expect(wrapper.text()).toContain("5,000 د.ل");
    expect(wrapper.text()).toContain("8,000 د.ل");
    expect(wrapper.find(".line-through").exists()).toBe(true);
  });

  it("wraps the time in an inner .num span", () => {
    const wrapper = mount(Timeline, { props: { items } });
    expect(wrapper.find("li p > span.num").text()).toBe("قبل دقيقة");
  });
});

describe("CopyButton", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  it("copies the value, swaps to a check icon, then reverts", async () => {
    vi.useFakeTimers();
    try {
      const wrapper = mount(CopyButton, { props: { value: "TX-84921" } });
      expect(wrapper.findComponent(CopyIcon).exists()).toBe(true);
      expect(wrapper.findComponent(CheckIcon).exists()).toBe(false);

      await wrapper.get("button").trigger("click");
      await flushPromises();

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("TX-84921");
      expect(wrapper.findComponent(CheckIcon).exists()).toBe(true);
      expect(wrapper.findComponent(CopyIcon).exists()).toBe(false);

      vi.advanceTimersByTime(1500);
      await nextTick();
      expect(wrapper.findComponent(CopyIcon).exists()).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("toasts an error when the clipboard rejects", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("x")) },
      configurable: true,
    });
    const errorSpy = vi.spyOn(toast, "error").mockImplementation(() => "");
    const wrapper = mount(CopyButton, { props: { value: "abc" } });
    await wrapper.get("button").trigger("click");
    await flushPromises();
    expect(errorSpy).toHaveBeenCalled();
    expect(wrapper.findComponent(CheckIcon).exists()).toBe(false);
    errorSpy.mockRestore();
  });

  it("toasts an error when the clipboard API is unavailable", async () => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    const errorSpy = vi.spyOn(toast, "error").mockImplementation(() => "");
    const wrapper = mount(CopyButton, { props: { value: "abc" } });
    await wrapper.get("button").trigger("click");
    await flushPromises();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

describe("PageHeader", () => {
  // PageHeader calls useRouter() for the back button, so it needs a real
  // router instance injected — a minimal in-memory one is enough here.
  async function mountWithRouter(props: {
    title: string;
    breadcrumbs?: { label: string; to?: string }[];
    back?: string | boolean;
  }) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", component: { template: "<div />" } },
        { path: "/tables", component: { template: "<div />" } },
      ],
    });
    router.push("/");
    await router.isReady();
    return mount(PageHeader, { props, global: { plugins: [router] } });
  }

  it("shows the back button for the bare-attribute shorthand (back='')", async () => {
    // Vue's bare `<PageHeader back />` compiles to `back=""`, not `back={true}`,
    // because `back` is typed `string | boolean` with String first in the
    // union — this is the exact case that regressed during plan 008's dev
    // verification (see PageHeader.vue's `showBack` comment).
    const wrapper = await mountWithRouter({ title: "TX-1", back: "" });
    expect(wrapper.find('button[aria-label="رجوع"]').exists()).toBe(true);
  });

  it("shows the back button when back is true", async () => {
    const wrapper = await mountWithRouter({ title: "TX-1", back: true });
    expect(wrapper.find('button[aria-label="رجوع"]').exists()).toBe(true);
  });

  it("back accepts a path and navigates there", async () => {
    const wrapper = await mountWithRouter({ title: "t", back: "/tables" });
    await wrapper.get('button[aria-label="رجوع"]').trigger("click");
    await flushPromises();
    expect(wrapper.emitted("back")).toBeTruthy();
  });

  it("renders #title and #meta slots", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: "/", component: { template: "<div />" } }],
    });
    const w = mount(PageHeader, {
      props: { title: "fallback" },
      slots: {
        title: "<span data-testid='ti'>TX-1</span>",
        meta: "<span data-testid='me'>meta</span>",
      },
      global: { plugins: [router] },
    });
    expect(w.find("[data-testid='ti']").exists()).toBe(true);
    expect(w.text()).not.toContain("fallback");
    expect(w.find("[data-testid='page-header-meta']").exists()).toBe(true);
  });

  it("hides the back button when back is not set", async () => {
    const wrapper = await mountWithRouter({ title: "TX-1" });
    expect(wrapper.find('button[aria-label="رجوع"]').exists()).toBe(false);
  });

  it("renders breadcrumbs, linking every item except the last", async () => {
    const wrapper = await mountWithRouter({
      title: "TX-84918",
      breadcrumbs: [{ label: "الجداول", to: "/tables" }, { label: "TX-84918" }],
    });
    const link = wrapper.findAll("a").find((a) => a.text() === "الجداول");
    expect(link?.attributes("href")).toBe("/tables");
    // The current page is text, not a link.
    expect(wrapper.findAll("a").some((a) => a.text() === "TX-84918")).toBe(false);
    expect(wrapper.text()).toContain("TX-84918");
  });
});

describe("Shell (visual)", () => {
  async function shellRouter(path = "/") {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: "/:pathMatch(.*)*", component: { template: "<div />" } }],
    });
    router.push(path);
    await router.isReady();
    return router;
  }
  // Tooltips need a provider; App.vue supplies it in the real app.
  const withProvider = (component: Component, props: Record<string, unknown>, slots = {}) =>
    defineComponent({
      render: () => h(TooltipProvider, null, () => h(component, props, slots)),
    });

  it("topbar end cluster order: notifications slot · LocaleToggle · ThemeToggle · user menu", async () => {
    const router = await shellRouter();
    const w = mount(
      withProvider(
        AppTopbar,
        { isDesktop: true },
        { notifications: () => h("i", { "data-test": "bell" }) },
      ),
      { global: { plugins: [router] } },
    );
    const order = w.findAll("[data-shell-slot]").map((n) => n.attributes("data-shell-slot"));
    expect(order).toEqual(["notifications", "locale", "theme", "user"]);
  });

  it("topbar renders no notifications wrapper when the slot is empty", async () => {
    const router = await shellRouter();
    const w = mount(withProvider(AppTopbar, { isDesktop: true }), {
      global: { plugins: [router] },
    });
    const order = w.findAll("[data-shell-slot]").map((n) => n.attributes("data-shell-slot"));
    expect(order).toEqual(["locale", "theme", "user"]);
  });

  it("topbar menu button: sidebar toggle on desktop, open-menu on phone", async () => {
    const router = await shellRouter();
    const desktop = mount(withProvider(AppTopbar, { isDesktop: true }), {
      global: { plugins: [router] },
    });
    const phone = mount(withProvider(AppTopbar, { isDesktop: false }), {
      global: { plugins: [router] },
    });
    const label = (w: VueWrapper) => w.get("header button").attributes("aria-label");
    expect(label(desktop)).not.toBe(label(phone));
  });

  it("sidebar marks the longest matching nav path active", async () => {
    const router = await shellRouter("/reference/components/x");
    const w = mount(AppSidebar, { global: { plugins: [router] } });
    const current = w.findAll('a[aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0]!.attributes("href")).toBe("/reference/components");
  });

  it("sidebar never activates the home link on other routes", async () => {
    const router = await shellRouter("/reference/tables");
    const w = mount(AppSidebar, { global: { plugins: [router] } });
    expect(w.find('a[href="/"]').attributes("aria-current")).toBeUndefined();
  });

  it("BlankLayout corner cluster order: LocaleToggle · ThemeToggle", async () => {
    const router = await shellRouter();
    const w = mount(withProvider(BlankLayout, {}), { global: { plugins: [router] } });
    const order = w.findAll("[data-shell-slot]").map((n) => n.attributes("data-shell-slot"));
    expect(order).toEqual(["locale", "theme"]);
  });
});
