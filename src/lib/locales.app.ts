// The UI languages this app offers — PROJECT-OWNED (src/lib/i18n.ts is kit-owned
// and overwritten by registry updates; it re-exports LOCALES from here).
//
// First entry = default. To add a language, add an entry here AND a
// `src/locales/<code>/` folder with the same kit files as `src/locales/ar/`
// (ar/en parity per file is test-enforced in the kit). Direction derives from the
// chosen locale via `useLocale()` — never toggle `dir` alone.
import type { LocaleOption } from "./i18n";

export const LOCALES: LocaleOption[] = [
  { code: "ar", dir: "rtl", label: "العربية" },
  { code: "en", dir: "ltr", label: "English" },
];
