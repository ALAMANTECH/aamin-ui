// Composites A: Amount, DocNo, TotalsStrip, StatusSwitch, SettingRow,
// AsyncConfirmDialog, ReasonPinDialog. StatusSwitch cases are ported from the
// production Aamin dashboard and made locale-agnostic.
import { describe, it, expect, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { h } from "vue";
import { StoreIcon } from "@/lib/icons";
import { i18n } from "@/lib/i18n";
import { TooltipProvider } from "@/components/ui/tooltip";
import Amount from "@/components/app/Amount.vue";
import DocNo from "@/components/app/DocNo.vue";
import TotalsStrip, { type TotalsGroup } from "@/components/app/TotalsStrip.vue";
import StatusSwitch from "@/components/app/StatusSwitch.vue";
import SettingRow from "@/components/app/SettingRow.vue";
import AsyncConfirmDialog from "@/components/app/AsyncConfirmDialog.vue";
import ReasonPinDialog from "@/components/app/ReasonPinDialog.vue";

const t = i18n.global.t;

describe("DocNo", () => {
  it("puts only digit runs in .num", () => {
    const w = mount(DocNo, { props: { value: "INV-2026-0042" } });
    expect(w.findAll(".num").map((n) => n.text())).toEqual(["2026", "0042"]);
  });

  it("isolates as a <bdi> root so a Latin code never reverses in RTL, digit split unchanged", () => {
    const w = mount(DocNo, { props: { value: "INV-2026-0042" } });
    expect(w.element.tagName).toBe("BDI");
    expect(w.text()).toBe("INV-2026-0042");
    expect(w.findAll(".num").map((n) => n.text())).toEqual(["2026", "0042"]);
  });

  it("renders nothing for a blank value", () => {
    const w = mount(DocNo, { props: { value: null } });
    expect(w.findAll(".num")).toEqual([]);
    expect(w.text()).toBe("");
  });
});

describe("Amount", () => {
  it("formats via money.ts (truncate, not round)", () => {
    const w = mount(Amount, { props: { value: 1.23456 } });
    expect(w.text()).toContain("1.234");
    expect(w.text()).not.toContain("1.235");
  });

  it("keeps the stored precision on hover only when it differs", () => {
    expect(
      mount(Amount, { props: { value: 1.23456 } })
        .get(".num")
        .attributes("title"),
    ).toBe("1.23456");
    expect(
      mount(Amount, { props: { value: 2000 } })
        .get(".num")
        .attributes("title"),
    ).toBeUndefined();
  });

  it("shows the magnitude with abs, plus the sign and unit", () => {
    const w = mount(Amount, { props: { value: -42.5, abs: true, sign: "−", unit: "LYD" } });
    expect(w.text()).toContain("42.5");
    expect(w.text()).not.toContain("-42.5");
    expect(w.text()).toContain("−");
    expect(w.text()).toContain("LYD");
  });

  it("renders an em-dash for a missing value", () => {
    expect(
      mount(Amount, { props: { value: null } })
        .get(".num")
        .text(),
    ).toBe("—");
  });
});

describe("TotalsStrip", () => {
  const totals = [
    {
      currency: "LYD",
      items: [
        { label: "Open", value: 1200.5 },
        { label: "Paid", value: 300 },
      ],
    },
    { currency: "USD", items: [{ label: "Open", value: 10 }] },
  ];
  const mountStrip = (props: { totals: TotalsGroup[]; dimmed?: boolean }) =>
    mount({ render: () => h(TooltipProvider, null, () => h(TotalsStrip, props)) });

  it("renders one section per currency with a tile per item", () => {
    const w = mountStrip({ totals });
    expect(w.findAll("section")).toHaveLength(2);
    expect(w.text()).toContain("LYD");
    expect(w.text()).toContain("1,200.5");
    expect(w.text()).toContain("Paid");
  });

  it("renders no sections when there are no totals", () => {
    expect(mountStrip({ totals: [] }).findAll("section")).toHaveLength(0);
  });

  it("dims the strip without hiding it", () => {
    expect(mountStrip({ totals, dimmed: true }).find("[data-dimmed]").exists()).toBe(true);
    expect(mountStrip({ totals }).find("[data-dimmed]").exists()).toBe(false);
  });
});

describe("StatusSwitch", () => {
  const mountSwitch = (modelValue = true) =>
    mount(StatusSwitch, { props: { modelValue, label: "Toggle Palm Grocery" } });

  it("spells the current state out in words next to the switch", () => {
    expect(mountSwitch(true).get('[data-testid="status-switch-state"]').text()).toContain(
      t("common.enabled"),
    );
    expect(mountSwitch(false).get('[data-testid="status-switch-state"]').text()).toContain(
      t("common.disabled"),
    );
  });

  it("renders both state words so the pill reserves the wider one's width", () => {
    const w = mountSwitch(true);
    expect(w.text()).toContain(t("common.enabled"));
    expect(w.text()).toContain(t("common.disabled"));
  });

  it("emits update:modelValue when the switch is activated", async () => {
    const w = mountSwitch(true);
    await w.get('[role="switch"]').trigger("click");
    expect(w.emitted("update:modelValue")![0]).toEqual([false]);
  });

  it("stays on the value the caller passes until the caller changes it", async () => {
    const w = mountSwitch(true);
    await w.get('[role="switch"]').trigger("click");
    expect(w.get('[role="switch"]').attributes("aria-checked")).toBe("true");
    expect(w.get('[data-testid="status-switch-state"]').text()).toContain(t("common.enabled"));
  });

  it("is disabled while pending", () => {
    const w = mount(StatusSwitch, { props: { modelValue: true, label: "x", pending: true } });
    expect(w.get('[role="switch"]').attributes("disabled")).toBeDefined();
  });
});

describe("SettingRow", () => {
  const props = {
    modelValue: true,
    icon: StoreIcon,
    title: "Selling",
    hint: "Turning it off stops sales",
    onLabel: "On",
    offLabel: "Off",
    switchLabel: "Selling — Palm Grocery",
  };

  it("shows title, hint and the state words, and emits the requested value", async () => {
    const w = mount(SettingRow, { props });
    expect(w.text()).toContain("Selling");
    expect(w.text()).toContain("Turning it off stops sales");
    expect(w.get('[data-testid="status-switch-state"]').text()).toContain("On");
    await w.get('[role="switch"]').trigger("click");
    expect(w.emitted("update:modelValue")![0]).toEqual([false]);
  });

  it("shows the note and marks the dimmed state", () => {
    const w = mount(SettingRow, { props: { ...props, note: "Overridden", dimmed: true } });
    expect(w.text()).toContain("Overridden");
    expect(w.find("[data-dimmed]").exists()).toBe(true);
  });
});

describe("AsyncConfirmDialog", () => {
  it("stays open while onConfirm is pending and shows the refusal inline", async () => {
    let reject!: (e: unknown) => void;
    const onConfirm = () => new Promise<void>((_, r) => (reject = r));
    const w = mount(AsyncConfirmDialog, {
      props: { open: true, title: "t", onConfirm },
      attachTo: document.body,
    });
    await flushPromises(); // reka teleports the dialog content a tick after mount
    document.querySelector<HTMLButtonElement>("[data-test=confirm]")!.click();
    expect(document.body.textContent).toContain("t");
    reject(new Error("refused"));
    await flushPromises();
    expect(document.body.textContent).toContain("refused");
    expect(w.emitted("update:open")).toBeUndefined();
    w.unmount();
  });

  it("falls back to the generic network message for a non-Error refusal", async () => {
    const onConfirm = () => Promise.reject("boom");
    const w = mount(AsyncConfirmDialog, {
      props: { open: true, title: "t", onConfirm },
      attachTo: document.body,
    });
    await flushPromises();
    document.querySelector<HTMLButtonElement>("[data-test=confirm]")!.click();
    await flushPromises();
    expect(document.body.textContent).toContain(t("common.networkError"));
    w.unmount();
  });

  it("survives a throwing errorMessage mapper: fallback text, buttons re-enabled, no unhandled rejection", async () => {
    const unhandled = vi.fn();
    process.on("unhandledRejection", unhandled);
    const w = mount(AsyncConfirmDialog, {
      props: {
        open: true,
        title: "t",
        onConfirm: () => Promise.reject(new Error("net")),
        errorMessage: (e: unknown) =>
          (e as { response: { data: { message: string } } }).response.data.message,
      },
      attachTo: document.body,
    });
    await flushPromises();
    const confirm = document.querySelector<HTMLButtonElement>("[data-test=confirm]")!;
    confirm.click();
    await flushPromises();
    expect(document.body.textContent).toContain(t("common.networkError"));
    expect(confirm.disabled).toBe(false);
    expect(
      [...document.querySelectorAll<HTMLButtonElement>("[role=alertdialog] button")].every(
        (b) => !b.disabled,
      ),
    ).toBe(true);
    await new Promise((r) => setTimeout(r, 0));
    expect(unhandled).not.toHaveBeenCalled();
    process.off("unhandledRejection", unhandled);
    w.unmount();
  });

  it("falls back to the generic message when the refusal's message is empty", async () => {
    const w = mount(AsyncConfirmDialog, {
      props: { open: true, title: "t", onConfirm: () => Promise.reject(new Error()) },
      attachTo: document.body,
    });
    await flushPromises();
    document.querySelector<HTMLButtonElement>("[data-test=confirm]")!.click();
    await flushPromises();
    expect(document.querySelector("[role=alert]")!.textContent!.trim()).toBe(
      t("common.networkError"),
    );
    w.unmount();
  });

  it("uses a custom errorMessage, and closes + emits success on resolve", async () => {
    const failing = mount(AsyncConfirmDialog, {
      props: {
        open: true,
        title: "t",
        onConfirm: () => Promise.reject(new Error("raw")),
        errorMessage: () => "custom",
      },
      attachTo: document.body,
    });
    await flushPromises();
    document.querySelector<HTMLButtonElement>("[data-test=confirm]")!.click();
    await flushPromises();
    expect(document.body.textContent).toContain("custom");
    failing.unmount();

    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const w = mount(AsyncConfirmDialog, {
      props: { open: true, title: "t", onConfirm },
      attachTo: document.body,
    });
    await flushPromises();
    document.querySelector<HTMLButtonElement>("[data-test=confirm]")!.click();
    await flushPromises();
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(w.emitted("update:open")![0]).toEqual([false]);
    expect(w.emitted("success")).toHaveLength(1);
    w.unmount();
  });
});

describe("ReasonPinDialog", () => {
  const base = {
    open: true,
    title: "Void payment",
    reasonLabel: "Reason",
    continueLabel: "Continue",
    pinTitle: "Enter your PIN",
    confirmLabel: "Void",
  };

  it("requires a reason before the PIN step opens", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const w = mount(ReasonPinDialog, { props: { ...base, onConfirm }, attachTo: document.body });
    await flushPromises();
    document.querySelector<HTMLButtonElement>("[data-testid=reason-pin-continue]")!.click();
    await flushPromises();
    expect(document.body.textContent).toContain(t("reasonPin.reasonRequired"));
    expect(document.body.textContent).not.toContain("Enter your PIN");
    w.unmount();
  });

  it("opens the PIN step once a reason is given", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const w = mount(ReasonPinDialog, { props: { ...base, onConfirm }, attachTo: document.body });
    await flushPromises();
    const reason = document.querySelector<HTMLTextAreaElement>("[data-testid=reason-pin-reason]")!;
    reason.value = "stock ran out";
    reason.dispatchEvent(new Event("input"));
    await flushPromises();
    document.querySelector<HTMLButtonElement>("[data-testid=reason-pin-continue]")!.click();
    await flushPromises();
    expect(document.body.textContent).toContain("Enter your PIN");
    w.unmount();
  });
});
