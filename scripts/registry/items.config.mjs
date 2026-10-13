// Explicit overrides for scripts/registry/generate.mjs. Everything not listed
// here is derived from the source tree by convention:
//
//   src/components/ui/<family>/**        → <family>            (registry:ui)
//   src/components/app/<File>.vue|.ts    → kebab(<File>)       (registry:component)
//   src/components/app/<folder>/**       → kebab(<folder>)     (registry:component)
//   src/lib/<name>.ts                    → lib-<name>          (registry:lib)
//   src/composables/use<Name>.ts         → use-<kebab name>    (registry:composable)
//   src/locales/<lang>/<ns>.json         → locale-<kebab ns>   (registry:file, every lang)
//
// Composite name mapping (kebab-case of the component, one item per
// tightly-coupled group — files that import each other ship together):
//   datatable/ (DataTable, DataTablePagination, DataTableViewOptions,
//               PageReadout, columns.ts, page-jump.ts, index.ts) → data-table
//   NotificationBell.vue + NotificationFeed.vue (Feed imports Bell's
//               NotificationItem type, Bell renders Feed)        → notification-bell
//   every other composite file                                 → kebab(file name)
//               (StatCard → stat-card, chart-theme.ts → chart-theme, Kbd → kbd …)

/** Composite groups: item name → files/folders (repo-relative, `/`-suffixed = folder). */
export const compositeGroups = {
  "data-table": ["src/components/app/datatable/"],
  "notification-bell": [
    "src/components/app/NotificationBell.vue",
    "src/components/app/NotificationFeed.vue",
  ],
};

/** The app shell — fixed placement in every project (AGENTS.md "app shell"). */
export const shell = {
  name: "shell",
  title: "App shell",
  description:
    "Dashboard + blank layouts, sidebar, topbar, command menu, theme/locale toggles, 404 page.",
  files: [
    "src/layouts/DashboardLayout.vue",
    "src/layouts/BlankLayout.vue",
    "src/components/app/AppSidebar.vue",
    "src/components/app/AppTopbar.vue",
    "src/components/app/CommandMenu.vue",
    "src/components/app/ThemeToggle.vue",
    "src/components/app/LocaleToggle.vue",
    "src/pages/NotFoundPage.vue",
  ],
};

/**
 * The living reference (dev-only demo/recipe pages). Optional for consumers;
 * nothing else may depend on it. Locale namespaces used ONLY by these paths
 * (no other shipped file uses them) are added to this item automatically.
 */
export const reference = {
  name: "reference",
  title: "Living reference",
  description:
    "Dev-only demo/recipe pages under /reference/* (components gallery, page templates, tables, forms…).",
  paths: ["src/pages/reference/", "src/components/app/showcase/"],
};

/** AI-agent contract + docs. */
export const agentsDocs = {
  name: "agents-docs",
  title: "Agent guide + docs",
  description: "AGENTS.md, CLAUDE.md and docs/*.md — the contract agents follow in a kit project.",
  files: ["AGENTS.md", "CLAUDE.md"],
  docsDir: "docs",
};

/**
 * Project-owned modules that kit-owned files import (kit lib → project data).
 * `add @aamin/<x> --overwrite` rewrites every file of x's transitive deps, so what a
 * project edits must live outside kit items: these ship ONLY with the starter, and a
 * kit item importing one gets no registry dependency for it (the starter is always
 * installed first). Anything else starter-owned stays off-limits to kit items.
 */
export const projectModules = [
  "src/lib/icons.app.ts", // project icons, re-exported by kit-owned icons.ts
  "src/lib/nav.app.ts", // project sidebar groups (appGroups), read by kit-owned nav.ts
  "src/lib/locales.app.ts", // LOCALES, re-exported by kit-owned i18n.ts
];

/**
 * Starter: app entry + tooling files, plus every project-owned file (projectModules,
 * HomePage, the app.json locale files). `src/locales/<lang>/app.json` (project-owned,
 * the `app` namespace) is added for every locale directory automatically.
 */
export const starter = {
  name: "starter",
  title: "Aamin dashboard starter",
  description:
    "The whole kit (everything except the reference pages) + app entry, config and tooling files.",
  files: [
    "src/style.css",
    "src/main.ts",
    "src/App.vue",
    "src/router.ts",
    "src/pages/HomePage.vue",
    "vite.config.ts",
    "vitest.config.ts",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "index.html",
    "public/favicon.svg",
    ".gitattributes",
    ".gitignore",
    "eslint.config.ts",
    ".prettierrc",
    ".prettierignore",
  ],
};

/** Extra files that belong to a derived item (outside its convention folder). */
export const extraFiles = {
  // amountInArabicWords' module declaration for the untyped `written-number`.
  "lib-number-words": ["src/types/written-number.d.ts"],
};

/** Locale namespaces that never become locale-<ns> items (`app` = starter-only). */
export const starterOnlyNamespaces = ["app"];

/** Source files never shipped. */
export const isExcluded = (path) =>
  path.includes("/__tests__/") || /\.spec\.ts$/.test(path) || /\.test\.ts$/.test(path);
