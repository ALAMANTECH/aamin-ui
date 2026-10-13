/// <reference types="node" />
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { i18n, mergeLocaleFiles } from "@/lib/i18n";

// See conventions.spec.ts for why import.meta.url is resolved on its own.
const localesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "locales");

const keys = (o: Record<string, unknown>, p = ""): string[] =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === "object" ? keys(v as Record<string, unknown>, `${p}${k}.`) : [`${p}${k}`],
  );

/**
 * Every key that appears twice in the same object, as a dotted path.
 * JSON.parse keeps the LAST one silently — a later `"pin": { … }` wiped the
 * search form's `"pin"` label, which then rendered as its raw key.
 */
function duplicateKeys(source: string): string[] {
  const dupes: string[] = [];
  // One frame per open container: its path, and for objects the keys seen so far.
  const stack: { path: string; keys: Set<string> | null }[] = [];
  let pendingKey: string | null = null;
  let i = 0;
  const readString = () => {
    let out = "";
    i++; // opening quote
    while (source[i] !== '"') {
      if (source[i] === "\\") {
        out += source[i] + source[i + 1];
        i += 2;
      } else out += source[i++];
    }
    i++; // closing quote
    return out;
  };
  const childPath = () => {
    const top = stack[stack.length - 1];
    if (!top) return "";
    return top.keys && pendingKey !== null
      ? top.path
        ? `${top.path}.${pendingKey}`
        : pendingKey
      : `${top.path}[]`;
  };
  while (i < source.length) {
    const ch = source[i];
    if (ch === '"') {
      const text = readString();
      const top = stack[stack.length - 1];
      let j = i;
      while (/\s/.test(source[j] ?? "")) j++;
      if (top?.keys && source[j] === ":") {
        if (top.keys.has(text)) dupes.push(top.path ? `${top.path}.${text}` : text);
        top.keys.add(text);
        pendingKey = text;
      }
    } else if (ch === "{" || ch === "[") {
      stack.push({ path: childPath(), keys: ch === "{" ? new Set() : null });
      pendingKey = null;
      i++;
    } else if (ch === "}" || ch === "]") {
      stack.pop();
      i++;
    } else i++;
  }
  return dupes;
}

const LOCALE_CODES = ["ar", "en"];
const nsFiles = (code: string) =>
  readdirSync(join(localesDir, code)).filter((f) => f.endsWith(".json"));
const readJson = (code: string, file: string) =>
  JSON.parse(readFileSync(join(localesDir, code, file), "utf-8")) as Record<string, unknown>;

describe("locale starter files", () => {
  for (const code of LOCALE_CODES) {
    it(`${code}: every kit file holds exactly one top-level key equal to its file name`, () => {
      const kit = nsFiles(code).filter((f) => f !== "app.json");
      expect(kit.length).toBeGreaterThan(0);
      for (const f of kit)
        expect(Object.keys(readJson(code, f)), `${code}/${f}`).toEqual([f.replace(/\.json$/, "")]);
    });
    it(`${code}: app.json exists (project-owned, merged last)`, () => {
      expect(nsFiles(code)).toContain("app.json");
    });
  }

  it("ar and en ship the same files with identical key sets per file", () => {
    expect(nsFiles("en").sort()).toEqual(nsFiles("ar").sort());
    for (const f of nsFiles("ar"))
      expect(keys(readJson("en", f)).sort(), f).toEqual(keys(readJson("ar", f)).sort());
  });

  it("no empty values", () => {
    for (const code of LOCALE_CODES)
      for (const f of nsFiles(code))
        for (const k of keys(readJson(code, f))) {
          const v = k
            .split(".")
            .reduce<unknown>((o, s) => (o as Record<string, unknown>)[s], readJson(code, f));
          expect(v, `${code}/${f}:${k}`).not.toBe("");
        }
  });

  it("finds a duplicate key", () => {
    expect(duplicateKeys('{"a": {"x": "1", "y": [{"x": 1}], "x": {"z": 2}}}')).toEqual(["a.x"]);
  });

  for (const code of LOCALE_CODES)
    for (const f of nsFiles(code))
      it(`${code}/${f} has no key twice in one object`, () => {
        expect(duplicateKeys(readFileSync(join(localesDir, code, f), "utf-8"))).toEqual([]);
      });

  it("resolves kit keys in ar and en through the i18n instance", () => {
    expect(i18n.global.t("common.close", {}, { locale: "ar" })).not.toBe("common.close");
    expect(i18n.global.t("common.close", {}, { locale: "en" })).not.toBe("common.close");
    expect(i18n.global.t("common.close", {}, { locale: "en" })).not.toBe(
      i18n.global.t("common.close", {}, { locale: "ar" }),
    );
  });
});

describe("mergeLocaleFiles", () => {
  it("groups files by locale directory", () => {
    const out = mergeLocaleFiles({
      "./ar/common.json": { common: { close: "A" } },
      "./en/common.json": { common: { close: "E" } },
    });
    expect(out.ar).toEqual({ common: { close: "A" } });
    expect(out.en).toEqual({ common: { close: "E" } });
  });

  it("lets app.json override kit strings", () => {
    const out = mergeLocaleFiles({
      "./ar/common.json": { common: { close: "A", open: "O" } },
      "./ar/app.json": { common: { close: "B" } },
    });
    expect((out.ar!.common as Record<string, string>).close).toBe("B");
    expect((out.ar!.common as Record<string, string>).open).toBe("O");
  });

  it("applies app.json last regardless of input order", () => {
    const out = mergeLocaleFiles({
      "./ar/app.json": { common: { close: "B" } },
      "./ar/zzz.json": { common: { close: "Z" } },
    });
    expect((out.ar!.common as Record<string, string>).close).toBe("B");
  });

  it("accepts glob-style keys with an alias prefix", () => {
    const out = mergeLocaleFiles({ "/src/locales/ar/nav.json": { nav: { home: "H" } } });
    expect(out.ar).toEqual({ nav: { home: "H" } });
  });
});
