// Select remounts on a locale switch: reka's SelectItemText copies the
// selected item's text into the trigger once on mount, so without the
// central key the trigger kept the previous language.
import { describe, it, expect, afterEach } from "vitest";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { i18n } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

enableAutoUnmount(afterEach);

afterEach(() => {
  i18n.global.locale.value = "ar";
});

async function settle() {
  for (let i = 0; i < 5; i++) await nextTick();
  await new Promise((r) => setTimeout(r, 0));
  await nextTick();
}

describe("Select (kit: remount on locale switch)", () => {
  it("re-reads the selected item's translated label when the locale changes", async () => {
    i18n.global.locale.value = "ar";
    const value = ref("all");
    const Host = defineComponent({
      setup: () => () =>
        h(
          Select,
          {
            modelValue: value.value,
            "onUpdate:modelValue": (v: unknown) => (value.value = String(v)),
          },
          () => [
            h(SelectTrigger, { "data-testid": "trigger" }, () => h(SelectValue)),
            h(SelectContent, null, () =>
              h(SelectItem, { value: "all" }, () => i18n.global.t("common.close")),
            ),
          ],
        ),
    });
    const w = mount(Host, { attachTo: document.body });
    await settle();
    const ar = i18n.global.t("common.close", {}, { locale: "ar" });
    const en = i18n.global.t("common.close", {}, { locale: "en" });
    expect(ar).not.toBe(en);
    expect(w.get("[data-testid=trigger]").text()).toContain(ar);

    i18n.global.locale.value = "en";
    await settle();
    expect(w.get("[data-testid=trigger]").text()).toContain(en);
    expect(w.get("[data-testid=trigger]").text()).not.toContain(ar);
  });
});
