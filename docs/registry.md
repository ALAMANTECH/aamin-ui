# The @aamin registry — install the kit with the shadcn-vue CLI

Besides the template-clone flow ([new-project.md](new-project.md)), the kit is published as a **shadcn-vue registry** named `@aamin`. A product project is a normal `shadcn-vue` Vite app that pulls the kit's source in through the CLI — you own the files after they land, and you can pull a single updated component later.

- The registry lives in this repo: `registry.json` (the item list, generated) and `registry/r/*.json` (one built file per item, served from `main` over `raw.githubusercontent.com`).
- The repo is **public**: no token, no login, no extra headers. The `@aamin` registry entry in a consumer's `components.json` is just the raw URL.
- Always run the CLI as **`npx shadcn-vue@2.7.4`** (the version the registry is built and tested with).
- Registry consumers keep **`rtl: false`** in `components.json` (set by the starter). The kit's sources are already logical-utility RTL; the CLI's own RTL transform would corrupt them.

## 1. New project from the registry

PowerShell:

```powershell
npx shadcn-vue@2.7.4 init -t vite -n my-app --preset https://raw.githubusercontent.com/ALAMANTECH/aamin-ui/main/registry/r/starter.json -y
cd my-app
npm pkg set scripts.dev="vite" scripts.build="vue-tsc -b && vite build" scripts.preview="vite preview" scripts.typecheck="vue-tsc -b --noEmit" scripts.lint="eslint ." scripts.test="vitest run --passWithNoTests" scripts.format="prettier --write src" scripts.check="npm run lint && npm run typecheck && npm run test"
# optional, recommended (step 3):
npx shadcn-vue@2.7.4 add @aamin/reference -y
Remove-Item src/assets/index.css
npm run dev
```

bash:

```bash
npx shadcn-vue@2.7.4 init -t vite -n my-app --preset https://raw.githubusercontent.com/ALAMANTECH/aamin-ui/main/registry/r/starter.json -y
cd my-app
npm pkg set scripts.dev="vite" scripts.build="vue-tsc -b && vite build" scripts.preview="vite preview" scripts.typecheck="vue-tsc -b --noEmit" scripts.lint="eslint ." scripts.test="vitest run --passWithNoTests" scripts.format="prettier --write src" scripts.check="npm run lint && npm run typecheck && npm run test"
# optional, recommended (step 3):
npx shadcn-vue@2.7.4 add @aamin/reference -y
rm src/assets/index.css
npm run dev
```

The first `npx` run of a version asks `Ok to proceed? (y)` before downloading the CLI — answer `y` (or run `npx --yes shadcn-vue@2.7.4 …`).

What each step does:

1. **`init … --preset <starter.json URL>`** creates the stock shadcn-vue Vite app and applies `@aamin/starter` to it as the preset: the consumer `components.json` (Tailwind v4 paths, aliases, `rtl: false`, and the `@aamin` registry entry), the whole kit (all `ui` families, the app composites, composables, `lib/`, locales ar + en, the app shell, the layouts, `AGENTS.md` + `docs/`), and the project config (vite/vitest/eslint/tsconfig, `index.html`, `.gitignore`) — replacing the template's own versions of those files. It also installs the npm dependencies. It does **not** include the dev-only reference pages (step 3).
2. **`npm pkg set …`** adds the npm scripts (registry items cannot add scripts). The same command works in both shells. `check` = lint + typecheck + tests; tests are not shipped, so `test` passes with no test files.
3. **Optional, recommended: `add @aamin/reference -y`** — the dev-only living reference (section 6). The project's `AGENTS.md` points agents at these pages (`/reference/components`, the page templates, the recipes), so install it unless you have a reason not to. Right after the init every shared file is identical, so `-y` runs without prompts. Production builds never include it.
4. **Remove the template's leftover `src/assets/index.css`** (dead CSS the starter never imports). Delete the `src/assets/` folder too if nothing else is in it.
5. `npm run dev` and open the printed URL (port 3100). `npm run check` must be green.

Then read the `AGENTS.md` that landed in the project root — it is the contract for building screens ([new-project.md](new-project.md) sections 2–5 apply: rebrand, shell placement, recipes).

### Expected noise during `init` / `add`

The CLI prints **about 80 `Failed to transform imports in <file>` warnings, each with a long stack trace**. They are expected and harmless: CLI 2.7.4 runs an import resolver over every written file by its name and cannot parse JSON/Markdown/HTML/dotfiles as TypeScript. The files are still written **verbatim** (byte-identical to the kit). Warnings for `.vue`/`.ts`/`.css` files would be a real problem — report those.

### An existing shadcn-vue project

To pull single `@aamin/*` items into a project that was not created from the starter, add the registry entry to its `components.json` (the consumer config is also published as `https://raw.githubusercontent.com/ALAMANTECH/aamin-ui/main/registry/components.json`):

```json
"registries": {
  "@aamin": { "url": "https://raw.githubusercontent.com/ALAMANTECH/aamin-ui/main/registry/r/{name}.json" }
}
```

and keep `"rtl": false`. The kit's conventions (tokens in `src/style.css`, i18n setup, the `@/lib/icons` barrel) come with the starter, so most items expect it.

## 2. Pinning a release

The init command above tracks `main`. To pin a tag instead, replace `main` with the tag (`…/ALAMANTECH/aamin-ui/<tag>/registry/r/starter.json`) in the `--preset` URL, and in `components.json` replace `main` with the same tag in the `@aamin` registry URL (`…/ALAMANTECH/aamin-ui/<tag>/registry/r/{name}.json`) — the starter's config always points at `main`. Later `add`s then read that tag until you move it.

## 3. Your strings and app name

Locale JSON is split per namespace: `src/locales/<lang>/<namespace>.json`. The kit's namespace files (`common.json`, `datatable.json`, …) are **overwritten by updates** — never edit them for your product. Everything of yours goes in **`src/locales/<lang>/app.json`** (app name and title, page strings), which only `@aamin/starter` ships (as a small starting point). Single-item updates never touch it; do not re-apply the starter (`add @aamin/starter --overwrite`, or another `init --preset`) on a project that has begun — it would reset `app.json` and the app entry files. Add languages via `LOCALES` in `src/lib/locales.app.ts`.

## 4. Adding or updating one item

Items are named `@aamin/<name>`: one per `ui` family (`button`, `dialog`, …), one per app composite (`data-table`, `stat-card`, `pin-confirm`, …), plus `lib-*`, `use-*`, `locale-*`, `shell`, `agents-docs`, `starter` and `reference`. The full list is the `items` array in `registry.json` in the kit (or the files in `registry/r/`). Dependencies between items resolve automatically.

```bash
git add -A && git commit -m "before kit update"      # commit first: add --overwrite replaces files
npx shadcn-vue@2.7.4 add @aamin/data-table --overwrite -y
git diff                                              # review exactly what the kit changed
```

Unchanged files stay clean, so re-adding an up-to-date item produces an empty diff. If you customized a file the item ships, `git diff` shows the collision — restore your parts (section 5). Run `npm run check` afterwards.

## 5. What updates overwrite

`add @aamin/<x> --overwrite` rewrites **every file of `x` and of all its dependencies** (transitively — `@aamin/data-table` alone pulls in `lib-i18n`, `lib-icons`, several `ui` families and locale files). So the files are split by owner:

| Kit-owned — rewritten by updates, never edit for your product | Project-owned — shipped once by `@aamin/starter`, never by an update |
|---|---|
| `src/components/ui/**`, `src/components/app/**` | `src/lib/icons.app.ts` — your icons (`@/lib/icons` re-exports them) |
| `src/lib/*.ts` (incl. `icons.ts`, `nav.ts`, `i18n.ts`), `src/composables/**` | `src/lib/nav.app.ts` — your sidebar/⌘K groups (`appGroups`) |
| `src/locales/<lang>/<namespace>.json` (kit namespaces) | `src/lib/locales.app.ts` — `LOCALES` (your languages) |
| `src/layouts/**`, `src/pages/NotFoundPage.vue` (`@aamin/shell`) | `src/locales/<lang>/app.json` — your strings + overrides of kit strings |
| `AGENTS.md`, `CLAUDE.md`, `docs/*.md` (`@aamin/agents-docs`) | `src/pages/HomePage.vue` and every page you add |
| `src/pages/reference/**` (`@aamin/reference`) | `src/router.ts`, `src/main.ts`, `src/App.vue`, `src/style.css` (tokens), `index.html`, `vite.config.ts`, the tooling config |

Re-applying the starter on a started project resets the project-owned column too — don't. After **any** `--overwrite`, review `git diff`; where the kit replaced a deliberate local change, put your hunks back interactively (commit before updating, so there is something to restore from):

```bash
git checkout -p -- <file>      # y = restore your hunk, n = keep the kit's
```

Without `--overwrite`, `add` asks per changed file instead (even with `-y`): answer `n` to keep yours.

## 6. The living reference

Recommended right after the init (section 1, step 3):

```bash
npx shadcn-vue@2.7.4 add @aamin/reference -y
```

Adds `src/pages/reference/` (the demo/recipe pages, routed in dev only under `/reference/*`, including `/reference/components` and the page-anatomy overlay). The shell shows the reference links only when these pages exist; production builds tree-shake them out. **Installing it later**, after you have changed kit files: run it without `--overwrite` (`npx shadcn-vue@2.7.4 add @aamin/reference`) and answer the overwrite prompts — `n` keeps your version of a file it shares. Remove the folder whenever you no longer need it.

## 7. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `npx` stops at `Ok to proceed? (y)` | First run of that CLI version. Answer `y`, or pass `--yes` (`npx --yes shadcn-vue@2.7.4 …`) in scripts. |
| PowerShell: "npx.ps1 cannot be loaded because running scripts is disabled" | Windows PowerShell's default `Restricted` execution policy. Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, or call `npx.cmd` (and `npm.cmd`) instead of `npx`. |
| A change just pushed to the kit is not installed | `raw.githubusercontent.com` caches for about 5 minutes. Wait and retry. |
| "Failed to fetch … check your network" (or a 404) | A mistyped item name or URL, a tag that does not exist (section 2), or no network. Open the item's URL in a browser — `…/registry/r/<name>.json` must show JSON. |
| `Unknown registry "@aamin"` on `add` | `components.json` has no `@aamin` entry (the project was not created from the starter) — add it (section 1, "An existing shadcn-vue project"). |
| Dozens of "Failed to transform imports" warnings | Expected — see above. |
| `npm warn Removing dependencies.X in favor of devDependencies.X` | The template and the starter disagree on dev/runtime placement; npm resolves it. Ignore. |
| Wrong files edited by the CLI's RTL transform | `components.json` must say `"rtl": false`. Set it back (the starter's value). |

## 8. Maintainers: releasing a kit change

The registry is generated from the source tree — never hand-edit `registry.json` or `registry/`.

1. Change the kit; `npm run check` green (a drift test fails if the committed registry no longer matches the source).
2. `npm run registry:build` — regenerates `registry.json` and `registry/r/*.json` + `registry/components.json` (kept out of `public/`, so kit builds never ship them).
3. Optional but recommended before a release (about 10 minutes, needs network): `npm run registry:e2e` — runs the section 1 flow against a local server that mimics public GitHub raw (the exact `init --preset` command, with the host swapped), then the consumer's build, check, update workflow and the reference install. It never commits in the kit repo. `AAMIN_REGISTRY_BASE=https://raw.githubusercontent.com npm run registry:e2e` runs the same flow against the published registry instead (after a push).
4. Commit `registry.json` + `registry/` together with the change.
5. Push to `main` (consumers read `main`). Tag a release (`git tag v1.2.0 && git push --tags`) so projects can pin it.

Generator and e2e live in `scripts/registry/`; which source files belong to which item is declared in `scripts/registry/items.config.mjs`.
