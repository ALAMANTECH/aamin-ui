// LocaleToggle renders nothing for a single-language app — a switch with
// nowhere to go is noise in the shell's end cluster.
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import { TooltipProvider } from "@/components/ui/tooltip";

const locales = ref([{ code: "ar", dir: "rtl", label: "العربية" }]);

vi.mock("@/composables/useLocale", () => ({
  useLocale: () => ({
    locale: ref("ar"),
    get locales() {
      return locales.value;
    },
    set: () => {},
    toggle: () => {},
  }),
}));

const { default: LocaleToggle } = await import("@/components/app/LocaleToggle.vue");

describe("LocaleToggle", () => {
  it("renders nothing when only one locale is configured", () => {
    locales.value = [{ code: "ar", dir: "rtl", label: "العربية" }];
    const w = mount(LocaleToggle, { global: { stubs: { teleport: true } } });
    expect(w.find("button").exists()).toBe(false);
    expect(w.html()).not.toContain("<button");
  });

  it("renders the switch with two locales", () => {
    locales.value = [
      { code: "ar", dir: "rtl", label: "العربية" },
      { code: "en", dir: "ltr", label: "English" },
    ];
    const w = mount({
      components: { TooltipProvider, LocaleToggle },
      template: "<TooltipProvider><LocaleToggle /></TooltipProvider>",
    });
    expect(w.find("button").exists()).toBe(true);
  });
});
