import { describe, it, expect, beforeEach } from "vitest";
import { nextTick } from "vue";
import { useLocale } from "@/composables/useLocale";
import { i18n } from "@/lib/i18n";

describe("useLocale", () => {
  beforeEach(() => useLocale().set("ar"));

  it("owns direction: ar → rtl, en → ltr, and syncs i18n + <html>", async () => {
    const { set } = useLocale();
    set("en");
    await nextTick();
    expect(i18n.global.locale.value).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("en");
    set("ar");
    await nextTick();
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("ar");
  });

  it("toggle cycles through the configured locales", async () => {
    const { toggle, locale } = useLocale();
    toggle();
    expect(locale.value).toBe("en");
    toggle();
    expect(locale.value).toBe("ar");
  });

  it("loads every src/locales file, keyed by its basename", () => {
    const { t } = i18n.global;
    expect(t("app.name", {}, { locale: "ar" })).toBe("أمِن UI");
    expect(t("app.name", {}, { locale: "en" })).toBe("Aamin UI");
  });

  it("ignores unknown codes", () => {
    const { set, locale } = useLocale();
    set("fr");
    expect(locale.value).toBe("ar");
  });

  it("normalizes a stale/unknown stored locale back to the default", async () => {
    const { locale } = useLocale();
    // Simulates a persisted "aamin-ui-locale" from a removed/renamed language.
    locale.value = "fr";
    await nextTick();
    expect(locale.value).toBe("ar");
    expect(i18n.global.locale.value).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
  });
});
