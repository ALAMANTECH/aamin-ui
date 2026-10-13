# Starting a new project from this template

This kit is a **template repo** for ALAMANTECH projects (all rights reserved — see README): a project clones it, owns its copy of the source, and builds the product inside it. The guardrails (ESLint RTL guard, tests, tokens, conventions) travel with the clone — keep them.

## 1. Get the code

- GitHub: **Use this template** on `ALAMANTECH/aamin-ui` (clean history), or
- `npx degit ALAMANTECH/aamin-ui my-app` (no git history), then `git init`.

Then:

```bash
cd my-app
npm install
npm run check   # must be green before you touch anything
npm run dev     # port 3100
```

## 2. Rename & rebrand

| What | Where |
|---|---|
| Package name | `package.json` → `name` |
| App name/title strings | `src/locales/<lang>/app.json` (the project-owned namespace; kit namespace files are overwritten by registry updates) |
| Sidebar wordmark + tab title | No edit in the shell: AppSidebar and the `afterEach` document title in `src/router.ts` render `app.name`/`app.title` from `app.json` (row above). Only `index.html` `<title>` (shown before the app boots) is a literal — change it too |
| Brand colors/radius/fonts | `src/style.css` tokens ONLY — never inside components. See [theming.md](theming.md) |
| Sidebar sections & links | `appGroups` in `src/lib/nav.app.ts` (project-owned) — `src/lib/nav.ts` (kit-owned) feeds them to BOTH the sidebar and the ⌘K palette |

### Shell placement (fixed — don't fork, don't move)

- **Topbar end cluster** (`AppTopbar.vue`), in this order: `[notifications slot] · LocaleToggle · ThemeToggle · user menu`. Each wrapper has `data-shell-slot="notifications|locale|theme|user"`. Pass your bell via `<AppTopbar><template #notifications>…</template></AppTopbar>` in `DashboardLayout.vue` — the slot is empty by default.
- **Blank pages** (login, 404): route them as children of `src/layouts/BlankLayout.vue` (see `router.ts`); it renders the top-end `LocaleToggle · ThemeToggle` corner cluster (`data-shell-slot="locale|theme"`). Don't add the toggles inside the page.
- Phone gutter is `px-3` in `DashboardLayout` — DataTable's phone full-bleed (`-mx-3`) depends on it.

## 3. What to KEEP (do not delete)

- **`eslint.config.ts`** — the `vue/no-restricted-class` RTL guard is the kit's main defense. If it errors, fix the class, don't relax the rule.
- **`src/style.css`** — tokens + custom utilities (`num`, `glow-primary`, `bg-grid`, `bg-halo`, `cn-rtl-flip`, `cn-shake`) + the RTL input-direction rule.
- **`src/__tests__/`** — conventions, RTL glob, docs drift, component tests. They encode the kit's invariants.
- **`src/pages/reference/` (the living reference)** — the kit's demo/recipe pages, routed **only in dev** under `/reference/*` (they never ship: their routes live in `src/pages/reference/routes.ts`, which `router.ts` picks up through an `import.meta.glob` behind an `import.meta.env.DEV` guard — tree-shaken out of production builds; `nav.ts` shows the reference group only when that file exists). `/reference/components` renders every component live with Arabic RTL examples — agents should verify rendering against it.
- **`AGENTS.md` + `docs/`** — so agents in YOUR project keep the contract.

## 4. Build screens by copying the recipes

**The app starts empty on purpose** — one blank `HomePage` (replace it with your first real screen) plus the 404. Nothing to delete. The recipes live in `src/pages/reference/` (dev-only, never shipped):

| Recipe page | It demonstrates |
|---|---|
| `src/pages/reference/OverviewPage.vue` | Dashboard: StatCard grid, bar chart, Timeline feed, recent-rows table |
| `src/pages/reference/TablesPage.vue` | The full list-screen pattern on DataTable (search, filter, bulk delete, pager clamp) |
| `src/pages/reference/FormsPage.vue` | Form layouts + validation |
| `src/pages/reference/ProfilePage.vue` / `SettingsPage.vue` | Detail/tabbed + settings scrollspy patterns |
| `src/pages/reference/LoginPage.vue` | Auth flow incl. the PinConfirm inline OTP step |

Workflow per screen: copy the matching recipe into `src/pages/YourPage.vue`, register the route in the app block of `src/router.ts` + an `appGroups` entry in `src/lib/nav.app.ts`, then adapt. Recipe pages carry `Recipe note:` comments where a copied link/route needs repointing.

Optional: once your app has real screens, you may delete `src/pages/reference/` (the router and nav pick the change up on their own) — but there's no need; production builds never include them either way. If you do delete them, lower the route-count assertion in `src/__tests__/conventions.spec.ts` accordingly.

## 5. Test invariants to know about

- **Count badge test**: `nav.ts`'s `badge: "43"` must equal the number of `src/components/ui/*` folders. Add/remove a ui family → update the badge, the ComponentsPage header text, and README.
- **Docs drift test**: every ui family / app composite / composable must be mentioned in `AGENTS.md`. Add a component → add its inventory line.
- **RTL glob test**: any physical-direction utility anywhere in `src/components/ui` or `src/pages` fails the suite.

## 6. Adding new shadcn components later

```bash
npx shadcn-vue@latest add <component>
```

`components.json` already has `"rtl": true`. After generating: convert any physical utilities the generator emitted (rule 1 in AGENTS.md), Arabize user-facing strings, ensure icons are lucide, then update the count badge trio. `npm run check` will catch what you miss.

## 7. Pulling kit updates later

This is a template, not a dependency — updates are **manual and selective**:

```bash
git remote add kit https://github.com/ALAMANTECH/aamin-ui.git
git fetch kit
git log --oneline kit/main            # see what changed
git diff HEAD kit/main -- src/components/ui/badge   # inspect a family
git checkout kit/main -- src/components/ui/badge    # take it (then re-run check)
```

Prefer cherry-picking whole component folders (they're self-contained). Never overwrite `src/pages/` or files you've customized. Run `npm run check` after every pull.
