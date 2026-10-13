# Pages: the anatomy every screen follows

One page standard for every Aamin project — title, breadcrumbs, spacing and type sizes — **measured from the production Aamin dashboard, not invented**. Three living references (dev-only, under `/reference/*`):

| Reference | Route | File — copy from here |
|---|---|---|
| List page template | `/reference/templates/list` | `src/pages/reference/templates/ListPageTemplate.vue` |
| Detail page template | `/reference/templates/detail` | `src/pages/reference/templates/DetailPageTemplate.vue` |
| Page anatomy (overlay + spec tables) | `/reference/page-anatomy` | `src/pages/reference/PageAnatomyPage.vue` (`ANATOMY` table) |

**To start a new page:**

1. Copy the matching template into `src/pages/`.
2. Rename the `templates.*` i18n keys to your feature's keys.
3. Change the route constants to your feature's routes — `DETAIL_PATH` in the list template, `LIST_PATH` in the detail template (they point at `/reference/templates/*`, which does not exist in production builds).
4. Replace the marked `/* ---- Data … ---- */` block with your real data source — your data layer (a fetch composable / query hook) feeding DataTable's server-mode props. The kit ships no data layer; see [datatable.md](datatable.md) for server mode.
5. Delete the `previewState` prop and the `data-anatomy` attributes (they only feed the anatomy overlay).
6. Register the route with a `titleKey` and add the nav item to `appGroups` in `src/lib/nav.app.ts`.

The anatomy page renders either template inside a frame that repeats the shell's page gutters, with a **Show measurements** switch that outlines and labels every measured value live (gutters, header→content gap, section gaps, card padding, grid gaps), a state picker (ready / first load / refreshing / error / empty), and the two spec tables below. `ANATOMY` in `PageAnatomyPage.vue` is the source of truth; `src/__tests__/pages.spec.ts` fails if a class value there is missing from this file.

## The rules

1. **One `PageHeader` per page** (`src/components/app/PageHeader.vue`) — the page's only `<h1>`. Title `text-xl font-semibold tracking-tight sm:text-2xl`; `description` under it; `#title` when the title is more than text (a document number); `#meta` for a detail page's identity lines; `#actions` at the end edge.
2. **Breadcrumbs from the nav root.** Every page passes `breadcrumbs`, starting at the nav root (`{ label: t("nav.home"), to: "/" }`), then each parent list, ending at the current page (no `to`). Detail pages also pass `back` = the parent list path (an arrow with `cn-rtl-flip`).
3. **At most one `glow-primary` per page** — the single primary action in `#actions`. Its label hides on phones (`<span class="max-sm:hidden">`) and the button keeps an Arabic/English `aria-label`. Everything else is `variant="outline"`/`ghost`.
4. **Detail actions recipe:** primary (glow) · two everyday actions `variant="outline" class="max-md:hidden"` · a "More" `DropdownMenu` (`size="icon"`, `aria-label` = `common.more`) holding the rest — and, on phones, the two everyday ones (`class="md:hidden"` items + separator). Destructive item last, after a separator.
5. **Page spacing tokens** — the page root is `space-y-6` (header → content, block → block); an overview of headed sections is `space-y-8`; a detail page's body below the header is `space-y-4`. Never invent a gap — pick from the spacing table.
6. **Section heading style** — `<section class="space-y-3">` with `<h2 class="flex items-center gap-2 text-sm font-semibold">` and an icon `size-4 text-primary` (`aria-hidden`). Section cards: `CardHeader class="pb-2"` + `CardTitle class="text-sm"`, fact rows `flex items-baseline justify-between gap-4 py-2 text-sm` inside `CardContent class="divide-y"`.
7. **States, in this order:** first load → skeletons **in the final shape** (list: `h-9 w-full sm:w-64` search + `h-9 w-24` end control + a bordered box of `h-9` rows; detail: four `h-28` tiles, a `h-9 w-72` tab strip, a `h-64` panel) → nothing loaded and an error → `EmptyState state="error"` with retry → loaded but empty → the DataTable `#empty` slot with `<EmptyState bare>` (filtered vs. never-had-data wording, with "clear filters" or the create action) → refreshing → the table dims (`opacity-40 transition-opacity`, `aria-busy`) under a centered `Spinner size="lg"`.
8. **List toolbar** (DataTable `#toolbar`): search form (`sm:w-64` input + secondary submit whose label hides on phones) → `FilterSheet class="xl:hidden"` with stacked fields / the same fields inline `max-xl:hidden` → `DataTableViewOptions` pushed to the end (`ms-auto`) → `FilterChips class="order-last basis-full"`. On phones the DataTable draws the toolbar as a tinted band bled to the screen edges and the rows as ledger cards (column `meta.mobile`: `title` / `trailing` / `stat` / `hidden`).
9. **Tabs ride the URL** — `?tab=` (the default tab leaves it out), synced both ways; panels `pt-4`, inactive panels unmount. Below `sm` the kit's `TabsList` is a full-width snap strip (no wrapper needed).
10. **Responsive behavior** — gutters grow `px-3 → sm:px-4 → md:px-8`; header title + actions share one row from `sm`, phones keep icon-only primary; stat grids go 1 → `sm:grid-cols-2` → `xl:grid-cols-4`; side-by-side splits wait for `lg`; table columns drop with `meta.class` (`max-md:hidden`, `max-lg:hidden`, `max-xl:hidden`).
11. **Digits, money, dates** — every digit run in `.num`; money through `Amount` / `MoneyFigure` / `StatCard` (`src/lib/money.ts`); dates through `src/lib/datetime.ts`; document codes through `DocNo`; statuses through `StatusBadge`.
12. **No hardcoded UI text** — every string through `useI18n()` keys, in both `src/locales/ar/` and `src/locales/en/` (project strings in `app.json`).

## Type scale

Reference widths: phone **375**, tablet **768**, desktop **1280**.

| Role | Classes | 375 | 768 | 1280 |
|---|---|---|---|---|
| Page title | `text-xl font-semibold tracking-tight sm:text-2xl` | 20px | 24px | 24px |
| Page description | `mt-1 text-sm text-muted-foreground` | 14px | 14px | 14px |
| Breadcrumb | `gap-1.5 text-sm text-muted-foreground` | 14px | 14px | 14px |
| Section heading | `flex items-center gap-2 text-sm font-semibold` | 14px | 14px | 14px |
| Section heading icon | `size-4 text-primary` | 16px | 16px | 16px |
| Card title | `text-base leading-snug font-medium` | 16px | 16px | 16px |
| Section card title | `CardTitle class="text-sm"` | 14px | 14px | 14px |
| Body text | `text-sm` | 14px | 14px | 14px |
| Stat label | `text-[13px] font-medium text-muted-foreground` | 13px | 13px | 13px |
| Stat figure | `num text-2xl → text-xl → text-lg` (steps down by length) | 24px | 24px | 24px |
| Meta line | `gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground` | 12px | 12px | 12px |
| Hint | `text-[11px] leading-snug text-muted-foreground` | 11px | 11px | 11px |
| Phone card title | `text-[15px] font-semibold leading-tight` | 15px | — | — |

## Spacing scale

| Role | Classes | 375 | 768 | 1280 |
|---|---|---|---|---|
| Page gutter (inline) | `px-3 sm:px-4 md:px-8` | 12px | 32px | 32px |
| Page gutter (block) | `py-4 sm:py-6 md:py-8` | 16px | 32px | 32px |
| Max content width | `mx-auto max-w-7xl` | 1280px | 1280px | 1280px |
| Topbar | `h-[calc(4rem+env(safe-area-inset-top))]` | 64px | 64px | 64px |
| Header → content | `space-y-6` | 24px | 24px | 24px |
| Between overview sections | `space-y-8` | 32px | 32px | 32px |
| Section heading → content | `space-y-3` | 12px | 12px | 12px |
| Breadcrumb → title | `space-y-2` | 8px | 8px | 8px |
| Title ↔ actions | `gap-3 sm:gap-4` | 12px | 16px | 16px |
| Title → meta | `mt-2 space-y-1.5` | 8px | 8px | 8px |
| Between header actions | `flex shrink-0 flex-wrap items-center gap-2 sm:justify-end` | 8px | 8px | 8px |
| Toolbar → table | `space-y-3` | 12px | 12px | 12px |
| Toolbar items (phone band) | `gap-2 max-md:-mx-3 max-md:border-y max-md:bg-muted/30 max-md:px-3 max-md:py-2.5` | 8px | 8px | 8px |
| Detail page blocks | `space-y-4` | 16px | 16px | 16px |
| Stat grid (1 / 2 / 4 cols) | `grid gap-3 sm:grid-cols-2 xl:grid-cols-4` | 12px | 12px | 12px |
| Overview card grid (1 / 2 / 4 cols) | `grid gap-4 sm:grid-cols-2 xl:grid-cols-4` | 16px | 16px | 16px |
| Chart + side split (1 / 1 / 2 cols) | `grid gap-4 lg:grid-cols-[2fr_1fr]` | 16px | 16px | 16px |
| Section card grid (1 / 1 / 3 cols) | `grid gap-3 lg:grid-cols-3` | 12px | 12px | 12px |
| Stat card padding | `p-5` | 20px | 20px | 20px |
| Card padding (block) | `gap-4 rounded-xl py-4` | 16px | 16px | 16px |
| Card padding (inline) | `px-4` | 16px | 16px | 16px |
| Fact row | `flex items-baseline justify-between gap-4 py-2 text-sm` | 8px | 8px | 8px |
| Tabs → panel | `TabsContent class="pt-4"` | 16px | 16px | 16px |
| Bare empty state | `py-12` | 48px | 48px | 48px |
| Control height (button default) | `h-8` | 32px | 32px | 32px |
| Search skeleton | `h-9 w-full sm:w-64` | 36px | 36px | 36px |
| Stat skeleton | `h-28 w-full` | 112px | 112px | 112px |

Between the reference widths the breakpoint prefixes in the Classes column apply (`sm` 640, `md` 768, `lg` 1024, `xl` 1280) — e.g. at 700px the inline gutter is `sm:px-4` = 16px.

## Standard theme & locale switch placement

Fixed in every project — don't fork, don't move (the shell owns them; see [new-project.md](new-project.md#shell-placement-fixed--dont-fork-dont-move)):

- **Dashboard pages:** the topbar end cluster in `AppTopbar.vue`, in this order: `[notifications slot] · LocaleToggle · ThemeToggle · user menu` (wrappers carry `data-shell-slot="notifications|locale|theme|user"`). A product's bell goes in the `#notifications` slot.
- **Full-screen pages (login, 404):** route them under `BlankLayout.vue`, which renders the top-end corner cluster `LocaleToggle · ThemeToggle` (`absolute end-4 top-[max(1rem,env(safe-area-inset-top))]`). Never add the toggles inside a page.
- `ThemeToggle` flips light/dark through `useTheme()`; `LocaleToggle` switches the i18n locale, `<html lang dir>` and reka's `ConfigProvider :dir` together through `useLocale()` (2 locales → one icon button whose tooltip names the other language in its own script; 3+ → a dropdown).
