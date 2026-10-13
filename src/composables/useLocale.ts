import { watchEffect } from "vue";
import { useStorage } from "@vueuse/core";
import { i18n, LOCALES } from "@/lib/i18n";
import { useDir } from "./useDir";

const locale = useStorage<string>("aamin-ui-locale", LOCALES[0]!.code);
const { dir } = useDir();

// Locale OWNS direction. One module-scope effect keeps i18n, useDir and
// <html lang> in sync for every consumer — never toggle direction alone.
watchEffect(() => {
  const option = LOCALES.find((l) => l.code === locale.value) ?? LOCALES[0]!;
  // A stale persisted code (removed/renamed language) falls back to the
  // default; write it back so `locale` never reports an unsupported code.
  if (option.code !== locale.value) locale.value = option.code;
  i18n.global.locale.value = option.code;
  dir.value = option.dir;
  document.documentElement.lang = option.code;
});

function set(code: string) {
  if (LOCALES.some((l) => l.code === code)) locale.value = code;
}

function toggle() {
  const i = LOCALES.findIndex((l) => l.code === locale.value);
  locale.value = LOCALES[(i + 1) % LOCALES.length]!.code;
}

/** UI language, persisted; switching it also switches direction. */
export function useLocale() {
  return { locale, locales: LOCALES, set, toggle };
}
