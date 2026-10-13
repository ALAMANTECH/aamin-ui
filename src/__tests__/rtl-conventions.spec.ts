/// <reference types="node" />
// tsconfig.app.json scopes `types` to `["vite/client"]` only (out of scope
// for this plan), so @types/node's ambient `node:*` module declarations
// aren't picked up automatically — this directive opts this file in without
// touching tsconfig.
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

function collectVueFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectVueFiles(full));
    } else if (entry.endsWith(".vue")) {
      files.push(full);
    }
  }
  return files;
}

// Note: deliberately NOT `new URL("../pages", import.meta.url)` — Vite
// statically rewrites that exact call pattern into a dev-server/build asset
// URL, which breaks fileURLToPath() at runtime under Vitest. Resolving
// import.meta.url on its own first sidesteps that transform.
const testDir = dirname(fileURLToPath(import.meta.url));
const uiDir = join(testDir, "..", "components", "ui");
const pagesDir = join(testDir, "..", "pages");
const navTsPath = join(testDir, "..", "lib", "nav.ts");

describe("RTL conventions", () => {
  // Un-skipped by plan 004: the ml-auto offenders flagged when this test was
  // written (CommandItem.vue, DropdownMenuSubTrigger.vue, plus
  // DropdownMenuShortcut.vue and CommandShortcut.vue) are now ms-auto.
  // The regex covers both digit-suffixed (ml-4) and `auto`-suffixed
  // (ml-auto) physical utilities — a bare `\d` match misses the latter.
  it("uses no physical margin/padding utilities (ml-/mr-/pl-/pr-) in ui or page components", () => {
    const files = [...collectVueFiles(uiDir), ...collectVueFiles(pagesDir)];
    expect(files.length).toBeGreaterThan(0);

    const physicalUtility = /[\s"'](ml|mr|pl|pr)-(\d|auto)/;
    const offenders = files.filter((file) => physicalUtility.test(readFileSync(file, "utf-8")));

    expect(offenders).toEqual([]);
  });
});

describe("component count badge", () => {
  // Added by plan 006 (10 new families: form, number-field, calendar,
  // range-calendar, combobox, tags-input, toggle-group, accordion, plus the
  // toggle-group/calendar transitive deps toggle and native-select). This
  // globs src/components/ui/** automatically, so future `shadcn-vue add`
  // runs only need to update the nav.ts badge string to keep this green —
  // no test-file edit required.
  it("nav.ts badge count matches the number of ui/ component family folders", () => {
    const familyCount = readdirSync(uiDir).filter((entry) =>
      statSync(join(uiDir, entry)).isDirectory(),
    ).length;

    const navSource = readFileSync(navTsPath, "utf-8");
    const badgeMatch = navSource.match(/badge:\s*"(\d+)"/);
    expect(badgeMatch, "nav.ts should have a numeric badge string").not.toBeNull();

    const badgeCount = Number(badgeMatch![1]);
    expect(badgeCount).toBe(familyCount);
  });
});
