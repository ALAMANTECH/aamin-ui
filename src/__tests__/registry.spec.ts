/// <reference types="node" />
// Registry guards: the @aamin shadcn-vue registry (registry.json + registry/r) is
// generated from the source tree by scripts/registry/generate.mjs. These tests
// keep the generator's output installable (scoped deps, ~/ targets, the
// starter config) and catch drift between the committed registry and the
// source tree. Pure + offline: no CLI calls, no network.
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  buildRegistry,
  buildConsumerConfig,
  collectI18nUsage,
  REGISTRY_URL,
} from "../../scripts/registry/generate.mjs";
import type { RegistryItem } from "../../scripts/registry/generate.mjs";
import { CONSUMER_INIT, CONSUMER_SCRIPTS } from "../../scripts/registry/consumer-scripts.mjs";
import { i18n } from "@/lib/i18n";

const testDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(testDir, "..", "..");
const pkg = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf-8")) as {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

const registry = buildRegistry({ root: rootDir });
const items = registry.items;
const byName = new Map(items.map((i) => [i.name, i]));
const item = (name: string): RegistryItem => {
  const found = byName.get(name);
  if (!found) throw new Error(`missing registry item ${name}`);
  return found;
};

function walk(dir: string): string[] {
  const abs = join(rootDir, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs).flatMap((entry) => {
    const rel = `${dir}/${entry}`;
    return statSync(join(rootDir, rel)).isDirectory() ? walk(rel) : [rel];
  });
}

const isTest = (f: string) => f.includes("/__tests__/") || /\.spec\.ts$/.test(f);

describe("registry coverage", () => {
  it("ships every non-test source file in exactly one item", () => {
    const owners = new Map<string, string[]>();
    for (const it of items)
      for (const f of it.files ?? []) owners.set(f.path, [...(owners.get(f.path) ?? []), it.name]);

    const sources = walk("src").filter((f) => !isTest(f));
    expect(sources.length).toBeGreaterThan(300);
    const missing = sources.filter((f) => !owners.has(f));
    expect(missing, `unshipped files: ${missing.join(", ")}`).toEqual([]);
    const dupes = [...owners].filter(([, names]) => names.length > 1);
    expect(dupes, `files in several items: ${JSON.stringify(dupes)}`).toEqual([]);
  });

  it("never ships tests", () => {
    const shipped = items.flatMap((i) => (i.files ?? []).map((f) => f.path));
    expect(shipped.filter(isTest)).toEqual([]);
  });

  it("every shipped path exists", () => {
    const shipped = items.flatMap((i) => (i.files ?? []).map((f) => f.path));
    expect(shipped.filter((p) => !existsSync(join(rootDir, p)))).toEqual([]);
  });

  it("has one registry:ui item per ui family, named after the folder", () => {
    const families = readdirSync(join(rootDir, "src/components/ui")).filter((e) =>
      statSync(join(rootDir, "src/components/ui", e)).isDirectory(),
    );
    const uiItems = items.filter((i) => i.type === "registry:ui").map((i) => i.name);
    expect(uiItems.sort()).toEqual(families.sort());
  });

  it("maps composites to kebab-case items (datatable → data-table, bell + feed together)", () => {
    expect(item("data-table").files!.map((f) => f.path)).toContain(
      "src/components/app/datatable/DataTable.vue",
    );
    expect(item("stat-card").type).toBe("registry:component");
    expect(item("notification-bell").files!.map((f) => f.path)).toEqual(
      expect.arrayContaining([
        "src/components/app/NotificationBell.vue",
        "src/components/app/NotificationFeed.vue",
      ]),
    );
    expect(item("lib-money").type).toBe("registry:lib");
    expect(item("use-async-job").type).toBe("registry:composable");
    expect(item("locale-common").files!.map((f) => f.target)).toEqual(
      expect.arrayContaining(["~/src/locales/ar/common.json", "~/src/locales/en/common.json"]),
    );
  });

  it("puts reference-only helpers (showcase) in the reference item", () => {
    expect(item("reference").files!.map((f) => f.path)).toContain(
      "src/components/app/showcase/ShowcaseSection.vue",
    );
  });

  it("app.json is starter-only (no locale-app item)", () => {
    expect(byName.has("locale-app")).toBe(false);
    expect(item("starter").files!.map((f) => f.target)).toEqual(
      expect.arrayContaining(["~/src/locales/ar/app.json", "~/src/locales/en/app.json"]),
    );
  });

  it("item names are unique and kebab-case", () => {
    const names = items.map((i) => i.name);
    expect(new Set(names).size).toBe(names.length);
    for (const n of names) expect(n).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
});

describe("registry dependencies", () => {
  it("are all @aamin/<name> and refer to existing items", () => {
    for (const it of items)
      for (const dep of it.registryDependencies ?? []) {
        expect(dep, it.name).toMatch(/^@aamin\/[a-z0-9-]+$/);
        expect(byName.has(dep.slice("@aamin/".length)), `${it.name} → ${dep}`).toBe(true);
      }
  });

  it("no item depends on itself, the starter or the reference", () => {
    for (const it of items) {
      const deps = it.registryDependencies ?? [];
      expect(deps, it.name).not.toContain(`@aamin/${it.name}`);
      expect(deps, it.name).not.toContain("@aamin/reference");
      if (it.name !== "starter") expect(deps, it.name).not.toContain("@aamin/starter");
    }
  });

  it("has no dependency cycles", () => {
    const state = new Map<string, "visiting" | "done">();
    const visit = (name: string, path: string[]): void => {
      if (state.get(name) === "done") return;
      if (state.get(name) === "visiting") throw new Error(`cycle: ${[...path, name].join(" → ")}`);
      state.set(name, "visiting");
      for (const dep of item(name).registryDependencies ?? [])
        visit(dep.slice("@aamin/".length), [...path, name]);
      state.set(name, "done");
    };
    for (const it of items) expect(() => visit(it.name, [])).not.toThrow();
  });

  it("detects imports: ui families, lib, composables, composites and locale namespaces", () => {
    expect(item("data-table").registryDependencies).toEqual(
      expect.arrayContaining([
        "@aamin/table",
        "@aamin/checkbox",
        "@aamin/lib-i18n",
        "@aamin/lib-money",
        "@aamin/locale-datatable",
      ]),
    );
    // i18n.global.t("pin.…") in a composite counts as a locale dependency.
    expect(item("pin-confirm").registryDependencies).toContain("@aamin/locale-pin");
    // StatCard imports ./Sparkline.vue (relative import → composite item).
    expect(item("stat-card").registryDependencies).toContain("@aamin/sparkline");
    // nav.ts keys ("nav.home") are i18n keys even outside a t() call.
    expect(item("lib-nav").registryDependencies).toContain("@aamin/locale-nav");
    // t("app.*") adds no dependency (app.json is starter-only).
    for (const it of items)
      expect(it.registryDependencies ?? [], it.name).not.toContain("@aamin/locale-app");
  });

  it("npm dependencies are the bare packages imported, with the kit's package.json range", () => {
    const ranges: Record<string, string> = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const it of items.filter((i) => i.name !== "starter")) {
      for (const dep of [...(it.dependencies ?? []), ...(it.devDependencies ?? [])]) {
        const at = dep.lastIndexOf("@");
        const name = dep.slice(0, at);
        expect(at, dep).toBeGreaterThan(0);
        expect(ranges[name], `${it.name}: ${dep}`).toBe(dep.slice(at + 1));
      }
    }
    expect(item("data-table").dependencies).toContain(
      `@tanstack/vue-table@${pkg.dependencies["@tanstack/vue-table"]}`,
    );
    expect(item("lib-number-words").dependencies).toContain(
      `written-number@${pkg.dependencies["written-number"]}`,
    );
    // reka-ui/date → reka-ui; vue-sonner/style.css → vue-sonner.
    expect(item("sonner").dependencies).toContain(`vue-sonner@${pkg.dependencies["vue-sonner"]}`);
    expect(item("lib-icons").dependencies).toEqual([
      `@lucide/vue@${pkg.dependencies["@lucide/vue"]}`,
    ]);
    // A file without bare imports has none.
    expect(item("locale-common").dependencies).toBeUndefined();
  });
});

describe("registry targets", () => {
  it("every file of a non-ui item has an explicit ~/ target", () => {
    for (const it of items.filter((i) => i.type !== "registry:ui"))
      for (const f of it.files ?? []) expect(f.target, `${it.name}: ${f.path}`).toMatch(/^~\//);
  });

  it("~/ targets mirror the source path (installs land where the kit has them)", () => {
    for (const it of items)
      for (const f of it.files ?? [])
        if (f.target) expect(f.target, `${it.name}`).toBe(`~/${f.path}`);
  });

  it("ui files keep their family folder under src/components/ui", () => {
    for (const it of items.filter((i) => i.type === "registry:ui"))
      for (const f of it.files ?? [])
        expect(f.path.startsWith(`src/components/ui/${it.name}/`), f.path).toBe(true);
  });

  it("never uses registry:page (skipped on Vite)", () => {
    for (const it of items) {
      expect(it.type).not.toBe("registry:page");
      for (const f of it.files ?? []) expect(f.type, f.path).not.toBe("registry:page");
    }
  });
});

describe("starter", () => {
  const starter = item("starter");

  it("is a registry:base that replaces the config (extends none, rtl false)", () => {
    expect(starter.type).toBe("registry:base");
    expect(starter.extends).toBe("none");
    expect(starter.config?.rtl).toBe(false);
    expect(starter.config?.font).toBe("");
    expect(starter.config?.iconLibrary).toBe("lucide");
    expect(starter.config?.tailwind?.css).toBe("src/style.css");
    // Public registry: the URL alone, never an auth header.
    expect(starter.config?.registries?.["@aamin"]).toEqual({ url: REGISTRY_URL });
  });

  it("depends on every item except itself and the reference", () => {
    const expected = items
      .map((i) => i.name)
      .filter((n) => n !== "starter" && n !== "reference")
      .map((n) => `@aamin/${n}`)
      .sort();
    expect([...(starter.registryDependencies ?? [])].sort()).toEqual(expected);
  });

  it("pins the kit's dependencies and devDependencies, shadcn-vue exactly 2.7.4", () => {
    expect(pkg.devDependencies["shadcn-vue"]).toBe("2.7.4");
    expect(starter.dependencies).toEqual(
      Object.entries(pkg.dependencies).map(([n, r]) => `${n}@${r}`),
    );
    expect(starter.devDependencies).toEqual(
      Object.entries(pkg.devDependencies).map(([n, r]) => `${n}@${r}`),
    );
    expect(starter.devDependencies).toContain("shadcn-vue@2.7.4");
  });

  it("ships the app entry files", () => {
    expect(starter.files!.map((f) => f.target)).toEqual(
      expect.arrayContaining([
        "~/src/style.css",
        "~/src/main.ts",
        "~/src/App.vue",
        "~/src/router.ts",
        "~/vite.config.ts",
        "~/vitest.config.ts",
        "~/index.html",
        "~/.gitattributes",
        "~/eslint.config.ts",
        "~/.prettierrc",
        "~/tsconfig.json",
        "~/tsconfig.app.json",
        "~/tsconfig.node.json",
        "~/.gitignore",
      ]),
    );
  });

  // `init -t vite` leaves a one-line .gitignore (node_modules): a project's
  // .env.local and dist/ would be committable without the kit's.
  it("ships a .gitignore that keeps local env files and build output out of git", () => {
    const f = starter.files!.find((x) => x.target === "~/.gitignore");
    expect(f).toBeDefined();
    const lines = readFileSync(join(rootDir, f!.path.replace(/\.txt$/, "")), "utf-8")
      .split("\n")
      .map((l) => l.trim());
    expect(lines).toEqual(expect.arrayContaining(["node_modules", "dist", "*.local", ".env"]));
  });

  // Vite >= 8.3 warns on extensionless relative imports in config files (its
  // native config loader needs them); consumers resolve newer Vite than the kit.
  it("config files import relative modules with explicit extensions", () => {
    const configs = starter.files!.filter((f) => /\.config\.ts$/.test(f.path));
    expect(configs.length).toBeGreaterThanOrEqual(3);
    for (const f of configs) {
      const src = readFileSync(join(rootDir, f.path), "utf-8");
      const bare = [...src.matchAll(/from\s+["'](\.{1,2}\/[^"']+)["']/g)]
        .map((m) => m[1])
        .filter((spec) => !/\.[cm]?[jt]s$/.test(spec));
      expect(bare, f.path).toEqual([]);
    }
  });
});

describe("project-owned files", () => {
  // `add @aamin/<x> --overwrite` rewrites every file of x's transitive deps, so
  // anything a project edits must live in starter-only files.
  const projectOwned = [
    "src/lib/icons.app.ts",
    "src/lib/nav.app.ts",
    "src/lib/locales.app.ts",
    "src/locales/ar/app.json",
    "src/locales/en/app.json",
    "src/pages/HomePage.vue",
    "src/main.ts",
    "src/App.vue",
    "src/router.ts",
    "vite.config.ts",
    "index.html",
    "src/style.css",
  ];

  it("ship only with the starter", () => {
    expect(item("starter").files!.map((f) => f.path)).toEqual(expect.arrayContaining(projectOwned));
    for (const it of items.filter((i) => i.name !== "starter"))
      for (const f of it.files ?? [])
        expect(projectOwned, `${it.name} ships ${f.path}`).not.toContain(f.path);
  });

  it("the shell no longer ships HomePage", () => {
    expect(item("shell").files!.map((f) => f.path)).not.toContain("src/pages/HomePage.vue");
  });

  it("kit-owned lib files pull project data from the *.app.ts files", () => {
    const src = (p: string) => readFileSync(join(rootDir, p), "utf-8");
    expect(src("src/lib/icons.ts")).toContain('export * from "./icons.app";');
    expect(src("src/lib/nav.ts")).toMatch(/import \{ appGroups \} from "\.\/nav\.app";/);
    expect(src("src/lib/i18n.ts")).toMatch(/from "\.\/locales\.app";/);
    // lib items still never depend on the starter
    for (const n of ["lib-icons", "lib-nav", "lib-i18n"])
      expect(item(n).registryDependencies ?? [], n).not.toContain("@aamin/starter");
  });
});

describe("public registry", () => {
  // The repo is public: nothing in the consumer flow may ask for a token.
  it("ships no env files and no auth headers", () => {
    const envFiles = (item("starter").files ?? []).filter((f) =>
      /^\.env(\.|$)/.test(f.path.split("/").pop()!),
    );
    expect(envFiles).toEqual([]);
    const consumer = JSON.stringify(buildConsumerConfig({ root: rootDir }));
    expect(consumer).not.toMatch(/headers|Authorization|TOKEN/i);
    const built = readFileSync(join(rootDir, "registry/r/starter.json"), "utf-8");
    expect(built).not.toMatch(/"headers"|Authorization|GITHUB_TOKEN/);
  });
});

describe("registry output location", () => {
  // Vite copies publicDir into dist: registry output there would ship inside
  // every kit build. It lives in registry/ instead.
  it("is served from registry/r, outside Vite's publicDir", () => {
    expect(REGISTRY_URL).toBe(
      "https://raw.githubusercontent.com/ALAMANTECH/aamin-ui/main/registry/r/{name}.json",
    );
    expect(existsSync(join(rootDir, "public/r"))).toBe(false);
    expect(existsSync(join(rootDir, "public/components.json"))).toBe(false);
    expect(existsSync(join(rootDir, "registry/components.json"))).toBe(true);
  });
});

describe("committed registry (drift guard)", () => {
  it("registry.json equals a fresh generation — run `npm run registry:build`", () => {
    const committed = JSON.parse(readFileSync(join(rootDir, "registry.json"), "utf-8"));
    expect(committed).toEqual(JSON.parse(JSON.stringify(registry)));
  });

  it("registry/components.json is the consumer config (rtl false, same registries)", () => {
    const consumer = JSON.parse(readFileSync(join(rootDir, "registry/components.json"), "utf-8"));
    expect(consumer).toEqual(buildConsumerConfig({ root: rootDir }));
    expect(consumer.rtl).toBe(false);
    expect(consumer.tailwind.css).toBe("src/style.css");
    expect(consumer.registries).toEqual(item("starter").config?.registries);
  });

  it("registry/r/<item>.json content matches the current source — run `npm run registry:build`", () => {
    const stale: string[] = [];
    for (const it of items) {
      const built = JSON.parse(
        readFileSync(join(rootDir, "registry/r", `${it.name}.json`), "utf-8"),
      ) as {
        files?: { path: string; content?: string }[];
      };
      const src = it.files ?? [];
      expect(built.files?.length, it.name).toBe(src.length);
      src.forEach((f, i) => {
        const b = built.files![i]!;
        expect([f.path, `${f.path}.txt`], it.name).toContain(b.path);
        const current = readFileSync(join(rootDir, f.path), "utf-8").replace(/\r\n/g, "\n");
        if (b.content !== current) stale.push(`${it.name}: ${f.path}`);
      });
    }
    expect(stale).toEqual([]);
  });

  it("registry/r/registry.json lists the same items as registry.json", () => {
    const index = JSON.parse(readFileSync(join(rootDir, "registry/r/registry.json"), "utf-8")) as {
      items: { name: string }[];
    };
    expect(index.items.map((i) => i.name)).toEqual(items.map((i) => i.name));
  });

  it("registry/r has one built file per item", () => {
    const built = readdirSync(join(rootDir, "registry/r"))
      .filter((f) => f.endsWith(".json") && f !== "registry.json")
      .map((f) => f.replace(/\.json$/, ""))
      .sort();
    expect(built).toEqual(items.map((i) => i.name).sort());
  });
});

describe("i18n keys used in src", () => {
  const usage = collectI18nUsage({ root: rootDir });

  it("finds the static keys (t, te, $t, keypath, key literals)", () => {
    expect(usage.keys.size).toBeGreaterThan(200);
    expect(usage.keys.has("common.close")).toBe(true);
    expect(usage.keys.has("nav.home")).toBe(true);
  });

  it("every static key resolves in ar and en", () => {
    const missing: string[] = [];
    for (const [key, files] of usage.keys)
      for (const locale of ["ar", "en"])
        if (!i18n.global.te(key, locale)) missing.push(`${locale}:${key} (${files.join(", ")})`);
    expect(missing).toEqual([]);
  });

  it("reports dynamic (template-literal) keys instead of guessing", () => {
    expect(usage.dynamic.length).toBeGreaterThan(0);
    for (const d of usage.dynamic) expect(d.expr).toContain("${");
  });
});

describe("docs/new-project.md", () => {
  it("has no stale AppSidebar wordmark edit (titles come from app.json)", () => {
    const doc = readFileSync(join(rootDir, "docs/new-project.md"), "utf-8");
    expect(doc).not.toMatch(/AppSidebar\.vue` wordmark/);
  });
});

describe("docs/registry.md", () => {
  const doc = readFileSync(join(rootDir, "docs/registry.md"), "utf-8");

  it("documents the exact consumer npm-scripts command the e2e runs", () => {
    // PowerShell and bash blocks both carry it
    expect(doc.split(CONSUMER_SCRIPTS).length - 1).toBeGreaterThanOrEqual(2);
  });

  it("documents the exact public init --preset command the e2e runs", () => {
    expect(CONSUMER_INIT).toBe(
      "npx shadcn-vue@2.7.4 init -t vite -n my-app --preset https://raw.githubusercontent.com/ALAMANTECH/aamin-ui/main/registry/r/starter.json -y",
    );
    // PowerShell and bash blocks both carry it
    expect(doc.split(CONSUMER_INIT).length - 1).toBeGreaterThanOrEqual(2);
  });

  it("asks for no token, header or login (the repo is public)", () => {
    expect(doc).not.toMatch(
      /AAMIN_GITHUB_TOKEN|GITHUB_TOKEN|github_pat|Authorization|\bPAT\b|\bprivate\b/,
    );
  });

  it("offers the reference right after the starter, and prompt-answering for later adds", () => {
    // PowerShell + bash blocks
    expect(
      doc.split("npx shadcn-vue@2.7.4 add @aamin/reference -y").length - 1,
    ).toBeGreaterThanOrEqual(2);
    expect(doc).not.toContain("add @aamin/reference --overwrite");
    expect(doc).toMatch(/without `--overwrite`/);
  });

  it("lists what updates overwrite, every project-owned file, and the restore step", () => {
    const at = doc.search(/^## (\d+\. )?What updates overwrite/m);
    expect(at).toBeGreaterThan(0);
    const section = doc.slice(at, doc.indexOf("\n## ", at + 1));
    for (const f of [
      "src/lib/icons.app.ts",
      "src/lib/nav.app.ts",
      "src/lib/locales.app.ts",
      "src/locales/<lang>/app.json",
      "src/pages/HomePage.vue",
      "src/router.ts",
      "src/main.ts",
      "src/App.vue",
      "src/style.css",
      "index.html",
      "vite.config.ts",
    ])
      expect(section, f).toContain(f);
    expect(section).toContain("git checkout -p -- <file>");
  });

  it("troubleshoots the npx prompt, execution policy, raw cache and a missing registry", () => {
    const at = doc.indexOf("Troubleshooting");
    const table = doc.slice(at);
    for (const s of [
      "Ok to proceed?",
      "--yes",
      "Set-ExecutionPolicy -Scope CurrentUser RemoteSigned",
      "npx.cmd",
      "about 5 minutes",
      'Unknown registry "@aamin"',
    ])
      expect(table, s).toContain(s);
  });

  it("pins the CLI version and the consumer config URL", () => {
    expect(doc).toContain("npx shadcn-vue@2.7.4 add @aamin/data-table --overwrite -y");
    expect(doc).toContain(
      "https://raw.githubusercontent.com/ALAMANTECH/aamin-ui/main/registry/components.json",
    );
  });
});
