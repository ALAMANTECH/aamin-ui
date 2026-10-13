/// <reference types="node" />
// tsconfig.app.json scopes `types` to `["vite/client"]` only (out of scope
// for this plan), so @types/node's ambient `node:*` module declarations
// aren't picked up automatically — this directive opts this file in without
// touching tsconfig.
import { describe, it, expect } from "vitest";
import { globSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { router } from "@/router";

// Note: deliberately NOT `new URL("../style.css", import.meta.url)` — Vite
// statically rewrites that exact call pattern into a dev-server/build asset
// URL (see https://vite.dev/guide/assets.html#new-url-url-import-meta-url),
// which breaks fileURLToPath() at runtime under Vitest. Resolving
// import.meta.url on its own first sidesteps that transform.
const testDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(testDir, "..", "..");
const styleCssPath = join(testDir, "..", "style.css");
const styleCss = readFileSync(styleCssPath, "utf-8");

describe("style.css utility classes", () => {
  it("defines every @utility class the kit relies on", () => {
    for (const utility of [
      "@utility num",
      "@utility glow-primary",
      "@utility bg-grid",
      "@utility bg-halo",
      "@utility cn-rtl-flip",
      "@utility row-number",
    ]) {
      expect(styleCss).toContain(utility);
    }
  });
});

describe("style.css design tokens", () => {
  const rootStart = styleCss.indexOf(":root {");
  const darkStart = styleCss.indexOf(".dark {");
  const rootBlock = styleCss.slice(rootStart, darkStart);
  const darkBlock = styleCss.slice(darkStart);

  it("defines --primary, --background, --success, --warning in :root", () => {
    expect(rootStart).toBeGreaterThanOrEqual(0);
    expect(darkStart).toBeGreaterThan(rootStart);
    for (const token of ["--primary", "--background", "--success", "--warning"]) {
      expect(rootBlock).toContain(`${token}:`);
    }
  });

  it("defines --primary, --background, --success, --warning in .dark", () => {
    for (const token of ["--primary", "--background", "--success", "--warning"]) {
      expect(darkBlock).toContain(`${token}:`);
    }
  });
});

describe("router integrity", () => {
  it("registers at least 8 route records", () => {
    expect(router.getRoutes().length).toBeGreaterThanOrEqual(8);
  });

  // Sequential lazy-import of every page module: heavy on a cold Vite
  // transform cache, so it gets an explicit 60s budget instead of the 5s
  // default (flaky on slow machines otherwise).
  it(
    "resolves every route's lazy component to a module with a default export",
    { timeout: 60000 },
    async () => {
      const routes = router.getRoutes();
      const withLoader = routes.filter((route) => typeof route.components?.default === "function");
      expect(withLoader.length).toBeGreaterThan(0);

      for (const route of withLoader) {
        const loader = route.components!.default as () => Promise<{ default?: unknown }>;
        const mod = await loader();
        expect(mod?.default).toBeTruthy();
      }
    },
  );

  it("routes unknown paths to the not-found catch-all", () => {
    expect(router.getRoutes().some((r) => r.name === "not-found")).toBe(true);
    expect(router.resolve("/definitely-missing-page").name).toBe("not-found");
  });
});

describe("icon imports", () => {
  // icons.ts = kit icons (kit-owned, overwritten by updates); icons.app.ts = project icons.
  it("icons are imported only via @/lib/icons", () => {
    const offenders = globSync("src/**/*.{vue,ts}", { cwd: rootDir })
      .map((f) => f.replaceAll("\\", "/"))
      .filter((f) => !f.endsWith("lib/icons.ts") && !f.endsWith("lib/icons.app.ts"))
      .filter((f) =>
        /from ["'](lucide-vue-next|@lucide\/vue)["']/.test(readFileSync(join(rootDir, f), "utf8")),
      );
    expect(offenders).toEqual([]);
  });
});

describe("i18n literals", () => {
  const arabic = /[\u0600-\u06FF]/;
  const sources = [
    ...globSync("src/{components,layouts}/**/*.{vue,ts}", { cwd: rootDir }),
    // App pages (the dev-only reference pages under src/pages/reference/ are
    // Arabic-first demos and stay out of this guard).
    ...globSync("src/pages/*.vue", { cwd: rootDir }),
    "src/lib/nav.ts",
    "src/lib/nav.app.ts",
  ]
    .map((f) => f.replaceAll("\\", "/"))
    .filter((f) => !f.includes("/showcase/"));
  const withArabic = (f: string) =>
    arabic.test(
      readFileSync(join(rootDir, f), "utf8")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/\/\/.*|\/\*[\s\S]*?\*\//g, ""),
    );

  it("components, layouts, app pages and nav contain no hardcoded Arabic UI strings", () => {
    expect(sources.filter(withArabic)).toEqual([]);
  });
});

describe("nav", () => {
  it("every nav label/title is an i18n key that resolves in both locales", async () => {
    const { navGroups } = await import("@/lib/nav");
    const { i18n } = await import("@/lib/i18n");
    const keys = navGroups.flatMap((g) => [g.label, ...g.items.map((i) => i.title)]);
    for (const locale of ["ar", "en"]) {
      for (const key of keys) {
        expect(i18n.global.te(key, locale), `${locale}:${key}`).toBe(true);
      }
    }
  });
});
