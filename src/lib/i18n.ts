import { createI18n } from "vue-i18n";
import { LOCALES } from "./locales.app";

export type LocaleCode = string;

export interface LocaleOption {
  code: LocaleCode;
  dir: "rtl" | "ltr";
  /** The language's own name in its own script — never translated. */
  label: string;
}

// The UI languages this app offers (first entry = default) live in the
// PROJECT-OWNED ./locales.app.ts — this file is kit-owned and overwritten by
// registry updates. Re-exported so `import { LOCALES } from "@/lib/i18n"` keeps working.
export { LOCALES };

// Locale layout: kit strings live in `src/locales/<code>/<namespace>.json` (one file
// per top-level namespace, kit-owned — the registry overwrites them). Project strings
// and overrides go in `src/locales/<code>/app.json`, which is merged LAST.

/**
 * Message tree of one locale. Deliberately loose: kit namespace files are added and
 * removed by the registry, so no static import list (and therefore no compile-time key
 * check) can exist. Key coverage is test-enforced instead (locales.spec.ts parity +
 * the "every used key resolves" guards in conventions/pages specs).
 */
export type MessageSchema = Record<string, unknown>;

type Tree = Record<string, unknown>;

const isTree = (v: unknown): v is Tree => !!v && typeof v === "object" && !Array.isArray(v);

function deepMerge(target: Tree, source: Tree): Tree {
  for (const [k, v] of Object.entries(source)) {
    const cur = target[k];
    target[k] = isTree(v) ? deepMerge(isTree(cur) ? cur : {}, v) : v;
  }
  return target;
}

/**
 * Folds glob results (`.../<code>/<file>.json` → parsed JSON) into one message tree per
 * locale code (the directory name). Kit files merge in path order; `app.json` merges
 * last so project strings override kit strings without touching kit files.
 */
export function mergeLocaleFiles(files: Record<string, Tree>): Record<string, Tree> {
  const byLocale: Record<string, [string, Tree][]> = {};
  for (const path of Object.keys(files).sort()) {
    const m = /([^/\\]+)[/\\]([^/\\]+)\.json$/.exec(path);
    if (!m) continue;
    (byLocale[m[1]!] ??= []).push([m[2]!, files[path]!]);
  }
  const out: Record<string, Tree> = {};
  for (const [code, list] of Object.entries(byLocale)) {
    const tree: Tree = {};
    for (const [, file] of list.filter(([name]) => name !== "app")) deepMerge(tree, file);
    for (const [, file] of list.filter(([name]) => name === "app")) deepMerge(tree, file);
    out[code] = tree;
  }
  return out;
}

// Every src/locales/<code>/<namespace>.json, merged per locale code.
const messages = mergeLocaleFiles(
  import.meta.glob<Tree>("@/locales/*/*.json", { eager: true, import: "default" }),
);

/**
 * App localization. The first LOCALES entry is the default; English is the
 * fallback. Composition-API mode (`legacy: false`) — pages use `useI18n()`;
 * components and lib use `i18n.global.t` so they mount without the plugin.
 *
 * Never set the locale here directly — `useLocale()` owns it and keeps
 * direction and `<html lang dir>` in sync.
 */
export const i18n = createI18n<[MessageSchema], LocaleCode, false>({
  legacy: false,
  globalInjection: true,
  locale: LOCALES[0]!.code,
  fallbackLocale: "en",
  messages,
});
