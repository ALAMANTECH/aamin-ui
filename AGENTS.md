# aamin-ui — Agent Guide

RTL-first **Arabic fintech dashboard kit**: Vue 3.5 + Vite + TypeScript + Tailwind v4 + shadcn-vue (reka-ui). Dark-first **dim** theme: brand blue `#015B91` as primary over dim-navy surfaces tinted with the brand navy `#002F5D`'s hue (`success` stays mint green). **Template-repo model**: consuming projects clone this repo and own the source — there is no npm package. If you are building a product screen in a project cloned from this template, this file is your contract; depth lives in [docs/](docs/).

New project setup → **[docs/registry.md](docs/registry.md)** (shadcn-vue registry, preferred) or **[docs/new-project.md](docs/new-project.md)** (template clone).

## Hard rules (lint-enforced or convention — never violate)

1. **Logical utilities only.** `ms-*/me-*/ps-*/pe-*/start-*/end-*/text-start/border-s/rounded-s…` — never physical. ESLint `vue/no-restricted-class` ERRORS on: `/^(ml|mr|pl|pr)-/`, `/^-?(left|right)-\d/`, `text-left`, `text-right`, `/^border-l(-|$)/`, `/^border-r(-|$)/`, `/^rounded-l-/`, `/^rounded-r-/`. Details: [docs/rtl.md](docs/rtl.md).
2. **Every digit run goes inside `class="num"`** (mono, tabular, LTR-isolated): amounts, dates, IDs, counts, percentages, phone numbers. Money only via `src/lib/money.ts` (3 decimals shown, truncated, exact 5 on hover only when different, never compacted; `formatCompact` for chart axes only). Dates only via `src/lib/datetime.ts` (lists `formatDateYmd` + `formatTimeAgo`; detail stamps `formatDateTime`; day groups `formatTimeHm`; never inline `slice`/`replace`). Contracts: [docs/money-and-status.md](docs/money-and-status.md).
3. **Directional glyphs** (arrows, chevrons pointing "forward/back") get `cn-rtl-flip` or an `rtl:` variant. Vertical icons (sort arrows, up/down trends) never flip.
4. **Every UI string (incl. aria-labels) goes through vue-i18n keys.** Kit strings live in `src/locales/<lang>/<namespace>.json` (one file per namespace, ar/en starter values; kit-owned — don't edit them, the registry overwrites them). Project strings and overrides of kit strings go in `src/locales/<lang>/app.json` (merged last; also holds the `app.name`/`app.title` identity). Add locales via `LOCALES` in `src/lib/locales.app.ts` (project-owned; re-exported by `src/lib/i18n.ts`) plus a `src/locales/<code>/` folder. Every icon-only button still needs an `aria-label` (via a key). Code identifiers and comments are English.
5. **Icons from `@lucide/vue`, imported only via `@/lib/icons`** (lint-enforced) — swapping icon libraries is a one-file change. No other icon package.
6. **Colors via theme tokens only** (`bg-primary`, `text-success`, `border-destructive`…). Never raw hex/oklch inside components — rebranding must be a token-file edit. Tokens: [docs/theming.md](docs/theming.md).
7. **Direction is owned by `useLocale()` (locale → dir); never toggle `dir` alone.** `useDir()` stays the reka `ConfigProvider` feed (already wired through `ConfigProvider :dir` in `src/App.vue`). Never hardcode `dir` on containers. Exceptions that MUST stay `dir="ltr"`: PIN/OTP inputs and chart plot areas. Mixed-script text (filenames, codes) is wrapped in `<bdi>`.
8. **`glow-primary` at most once per screen** (the single primary action), plus the persistent sidebar identity.
9. **Money/PIN confirmation goes through `PinConfirm`** — never re-inline `PinInputRoot` scaffolding outside `PinConfirm.vue` and the login OTP step. See [docs/money-and-status.md](docs/money-and-status.md).

## Commands

| Command | What |
|---|---|
| `npm run dev` | Vite dev server on **port 3100** |
| `npm run check` | lint + typecheck + tests — the gate; must be green before any commit |
| `npm run build` | `vue-tsc -b && vite build` — production gate |
| `npm run test` | Vitest (jsdom) only |

## Component inventory

### `src/components/ui/` — 43 primitive families (shadcn-vue, source-owned)

Standard shadcn-vue APIs apply **except where the trap list below says otherwise**. One line each:

| Family | Use for |
|---|---|
| accordion | Collapsible FAQ/detail groups (one or many open) |
| alert | Static in-page notices — variants incl. `success`/`warning`/`info` (use sonner for transient events) |
| alert-dialog | Irreversible-action confirmation (destructive variant on the action) |
| avatar | Initials-based user/entity chips (no external images in demos) |
| badge | Short status/tag chips — variants incl. `success`/`warning` (kit additions) |
| breadcrumb | Path navigation (used by PageHeader's `breadcrumbs` prop) |
| button | All actions; sizes incl. `xs`, `icon-xs/sm/lg`; one primary per screen |
| calendar | Single-date picking — Libya-configured (see trap list) |
| card | Content containers; `CardHeader/CardContent/CardTitle` |
| chart | Unovis charts with token colors; `ChartTooltipContent` `showTotal` (values via `.num` + Latin digits); plot area inside `dir="ltr"` |
| checkbox | Multi-select; tri-state via `"indeterminate"` |
| collapsible | Hide secondary detail without tabs |
| combobox | Searchable select — Arabic-normalized search (see trap list) |
| command | Command palette (⌘K wired in the topbar via CommandMenu) |
| dialog | Focused short tasks; close on success |
| dropdown-menu | Contextual row/entity actions; destructive last after separator |
| form | vee-validate Field family — see [docs/forms.md](docs/forms.md) |
| input | Text fields; pair with Label; errors via `aria-invalid` |
| input-group | Input with inline-start/end addons (currency, icons) |
| label | Always above the field |
| native-select | OS-native select for dense forms/mobile |
| number-field | Bounded numeric input with steppers |
| pagination | Page controls for non-DataTable lists; `show-edges` on long lists |
| pin-input | OTP/PIN slots — only inside PinConfirm/login (rule 9) |
| popover | Light interactive overlay anchored to an element |
| progress | Determinate progress — logical-direction fill; `modelValue: null` = indeterminate (see trap list) |
| radio-group | Single choice among few visible options |
| range-calendar | From→to date range — Libya-configured like calendar; `layout`+`yearRange` add month/year header dropdowns |
| scroll-area | Custom scrollbar for long lists in bounded space |
| select | Standard styled select for fixed option sets |
| separator | Horizontal between sections, vertical between siblings |
| sheet | Side panel (drawer); side resolves from direction |
| skeleton | Loading placeholders mimicking final content shape |
| sonner | Toasts (`toast.success/info/error` from `vue-sonner`) |
| spinner | Loading glyph, sizes sm/default/lg — see [docs/async.md](docs/async.md) |
| switch | Immediate on/off; RTL thumb fix applied (see trap list) |
| table | Presentational table parts (DataTable composes these) |
| tabs | Parallel same-kind content, ≤5 tabs; animated TabsIndicator (see trap list) |
| tags-input | Multiple short values; Enter adds |
| textarea | Auto-growing multiline (field-sizing) |
| toggle | Single pressed/unpressed button |
| toggle-group | One-or-many selection from a short always-visible set |
| tooltip | Mandatory on icon-only buttons (with Arabic aria-label) |

### `src/components/app/` — composites (custom; full docs required reading)

| Component | Use for | Docs |
|---|---|---|
| datatable/ (DataTable, DataTablePagination, DataTableViewOptions, PageReadout, page-jump.ts, columns.ts) | Every list screen: sorting, column visibility (saved via `storageKey`), cross-page selection, server mode, phone ledger cards (`meta.mobile`), `n / m` page jump, `moneyCell`/`numericCell`. `rowNumbers` is on by default; hand-rolled tables use the `row-number` utility for their `#` gutter | [docs/datatable.md](docs/datatable.md) |
| StatusBadge | Status code → colored, localized badge (labels from `status.<code>`, extensible `map`) | [docs/money-and-status.md](docs/money-and-status.md) |
| PinConfirm | THE money-action PIN/OTP gate (dialog + inline variants, responsive slots) | [docs/money-and-status.md](docs/money-and-status.md) |
| CopyButton | Copy-to-clipboard ghost icon button (copy→check swap, error toast on failure) | [docs/money-and-status.md](docs/money-and-status.md) |
| Kbd | Keyboard-shortcut chip | [docs/money-and-status.md](docs/money-and-status.md) |
| Timeline | Activity feeds / audit trails, with old→new `diff` rendering | [docs/money-and-status.md](docs/money-and-status.md) |
| FileDropzone | File intake (drag + browse), `variant="compact"` chip, `invalid`, image previews, localized rejection reasons | [docs/async.md](docs/async.md) |
| StatCard | KPI card with trend sparkline, `loading`/`error` states, `hint`, `#footer`; money values auto-truncated to 3 decimals with exact-value tooltip | [docs/async.md](docs/async.md) |
| MoneyFigure | Full, never-compacted money headline (`value`, `currency`, `size`, `tone`) with exact-value tooltip | [docs/money-and-status.md](docs/money-and-status.md) |
| Amount | Inline money figure: `.num` digits (money.ts truncate, exact value on hover only when it differs), `sign`, `abs`, muted `unit`; accepts number or API string | [docs/money-and-status.md](docs/money-and-status.md) |
| DocNo | Document number ("INV-2026-0042"): root is a `<bdi>` (Latin codes stay one LTR run in RTL), only the digit runs get `.num`; `wrap` | [docs/money-and-status.md](docs/money-and-status.md) |
| TotalsStrip | List totals over the WHOLE filtered set: `totals: { currency, items: { label, value }[] }[]`, one StatCard row per currency, `dimmed` while refetching | [docs/money-and-status.md](docs/money-and-status.md) |
| StatusSwitch | Switch + its state spelled out in a StatusBadge (width-reserved pill). **Every row/header enable toggle uses StatusSwitch** — never a bare `Switch` there | [docs/money-and-status.md](docs/money-and-status.md) |
| SettingRow | One explained setting: tinted icon tile, title, hint, optional `note`, `dimmed`, and a StatusSwitch with its own on/off words. Controlled — confirm via AsyncConfirmDialog | [docs/money-and-status.md](docs/money-and-status.md) |
| AsyncConfirmDialog | Confirm that stays open while `onConfirm` runs and shows a refusal inline (`errorMessage?` maps the thrown value); closes + emits `success` on resolve | [docs/money-and-status.md](docs/money-and-status.md) |
| ReasonPinDialog | Irreversible `{ reason, pin }` action: reason AlertDialog, then a PinConfirm step on top (rule 9); `onConfirm(reason, pin)` must throw on refusal | [docs/money-and-status.md](docs/money-and-status.md) |
| FilterChips | What is filtering a list: one removable chip per active value (`chips: { id, text, num?, clear }[]`) + «مسح الفلاتر» → `clear-all`; default slot = leading result-count readout. Host builds chips and owns clearing | [docs/datatable.md](docs/datatable.md) |
| FilterSheet | Phone filters: «الفلاتر» button (active-count badge) + bottom sheet holding the host's stacked fields; edits apply live, `clear` event, host hides it where fields fit inline | [docs/datatable.md](docs/datatable.md) |
| SearchableSelect | THE searchable single select (Arabic-normalized, `noneLabel`, virtualized ≥40 rows, `loading`, `remote` + `search` event, `notice`). Replaces "copy the combobox demo" | [docs/forms.md](docs/forms.md) |
| MultiSelect | Multi-value sibling of SearchableSelect (`string[]` model; trigger shows the label or `countLabel` with `{count}`; inline clear) | [docs/forms.md](docs/forms.md) |
| DateField | THE single-date control: Libya calendar in a popover, `YYYY-MM-DD` model, `min`/`max`, `clearable`, `tinted` — never a native `type="date"` | [docs/forms.md](docs/forms.md) |
| TimeField | THE 24-hour time control: `HH:MM` model, hour grid by part of day + minute steps + typed time (Arabic digits ok) — never a native `type="time"` | [docs/forms.md](docs/forms.md) |
| CompactPager | First/prev/`n / m`/next/last pager for non-TanStack lists (card grids, ledgers); reuses `PageReadout` for the jump; zero-based `v-model:page-index` | [docs/datatable.md](docs/datatable.md) |
| LookupChipBoard | A one-field vocabulary as editable chips (inline rename, ✕ remove, dashed add chip); host persists via `create`/`rename` `done(ok)` callbacks and confirms `remove` | [docs/forms.md](docs/forms.md) |
| BrandMark | Logo tile for a brand/provider/merchant: image edge to edge, else the name's first letter on a token tint picked from `seed` (string or number); exports `toneFor`/`letterFor` | [docs/money-and-status.md](docs/money-and-status.md) |
| ChartState + chart-theme.ts | ChartState: per-chart async gate (skeleton → error+retry → «no data» → slot). chart-theme.ts: `CHART_CONTAINER_STYLE` (Unovis `--vis-*` → kit tokens), `useChartDuration` (reduced motion), Latin-digit axis formatters, escaped `tooltipHtml` | [docs/async.md](docs/async.md) |
| DaybookList | Day-grouped ledger/activity feed: caller-supplied `kinds: Record<string, { icon, tone, sign }>` (never inferred from labels), money via money.ts, `dayKey()` day groups, day badge `dayTotal: "net"` (default — signed Σ sign×|amount|, toned; 0 shown) `| "turnover" | "count" | "none"` (net/turnover hidden on mixed-currency days; `showDayTotal` deprecated), CompactPager, `loading`/`refreshing`/`error` | [docs/async.md](docs/async.md) |
| AttachmentViewer | In-app viewer dialog for `{ id, name, url, mime }[]` (`v-model` = id on show, null = closed): images + PDFs inline, «open in a new tab» for the rest; ←/→ step the set, swapped by direction | [docs/async.md](docs/async.md) |
| NotificationBell / NotificationFeed | Topbar bell for the `#notifications` slot: `NotificationAdapter { fetchCount, fetchList, markRead, markAll }` prop (no URLs inside), polls the count via usePoll (`pollMs`), `eventIcons`/`eventTones`/`resourceIcons`/`flipEvents` maps. Feed = the popover body, usable standalone. No Tooltip on the trigger (reka nesting bug) | [docs/async.md](docs/async.md) |
| StickySubmitBar | Sticky intake footer: `stats` + `#stats`/`#alert`, cancel + the screen's one primary action (spinner + `busyLabel` while `busy`). Pair with `useLeaveGuard(busy)` | [docs/async.md](docs/async.md) |
| EmptyState | `empty \| loading \| error` panel with retry; `bare` drops the frame inside framed containers | [docs/async.md](docs/async.md) |
| Sparkline | Tiny inline trend line (SVG); `endDot`, `labels[]` hover chip; flat-dash fallback under 2 points | [docs/async.md](docs/async.md) |
| PageHeader | Page title block: `breadcrumbs`, `back` (bool or path), description, `#title`/`#meta`/`#actions` slots + detail-page actions recipe | [docs/money-and-status.md](docs/money-and-status.md) |
| AppSidebar / AppTopbar / CommandMenu / ThemeToggle / LocaleToggle / BlankLayout (`src/layouts/`) | The app shell — fixed placement in every project: topbar end cluster `[notifications slot] · LocaleToggle · ThemeToggle · user menu` (each wrapper carries `data-shell-slot`); blank pages (login, 404) get a top-end `LocaleToggle · ThemeToggle` corner from `BlankLayout`. Extend via `src/lib/nav.app.ts` (project sidebar groups) and the topbar `#notifications` slot. Don't fork, don't move | [docs/new-project.md](docs/new-project.md) |

`src/components/app/showcase/` is internal to the `/components` reference page.

### `src/composables/`

| Composable | Use for | Docs |
|---|---|---|
| usePoll.ts | Interval polling with consecutive-failure auto-stop | [docs/async.md](docs/async.md) |
| useLeaveGuard.ts | `useLeaveGuard(busy, message?)` — while busy, confirm in-app navigation (route components) and block tab close/reload | [docs/async.md](docs/async.md) |
| useAsyncJob.ts | queue→poll→done\|failed job state machine (report exports…) | [docs/async.md](docs/async.md) |
| useTheme.ts | Dark/light mode singleton (`useColorMode` hoisted) | [docs/theming.md](docs/theming.md) |
| useLocale.ts | UI language singleton (persisted, driven by `LOCALES`); owns direction + `<html lang>` and syncs vue-i18n | [docs/rtl.md](docs/rtl.md) |
| useDir.ts | rtl/ltr singleton feeding `ConfigProvider` + `<html dir>` — written only by `useLocale` | [docs/rtl.md](docs/rtl.md) |

`src/lib/utils.ts` exports `cn()` and `normalizeArabic()` (hamza/tashkeel-tolerant search normalization). `src/lib/nav.ts` is the **single source of truth** for sidebar groups AND the ⌘K palette; it is kit-owned — the project's own groups go in `appGroups` in `src/lib/nav.app.ts` (project-owned), which nav.ts reads.

UI-pure formatting lib (no Vue, no i18n — safe anywhere): `src/lib/money.ts` (`formatMoney`, `moneyFigure`, `moneyTitle`, `formatAmountCell`, `formatCount`, `formatCompact`, `parseApiNumber`, `moneySizeClass`…), `src/lib/datetime.ts` (`formatDateYmd`, `formatLocalDateYmd/Input`, `formatDateTime`, `formatTimeHm/Hms`, `formatTimeAgo`), `src/lib/digits.ts` (`toLatinDigits`, `cleanTyped` — Arabic-digit/invisible-mark-tolerant typed input), `src/lib/phone.ts` (`normalizeLibyanPhone`, `isLibyanPhone`), `src/lib/number-words.ts` (`amountInArabicWords`). Contracts: [docs/money-and-status.md](docs/money-and-status.md).

## Divergences from stock shadcn (trap list)

You know shadcn-vue; this kit deliberately differs. Assuming upstream behavior here causes real bugs:

- **Icons** go through `@/lib/icons`. Kit icons live in `src/lib/icons.ts` (kit-owned, overwritten by updates); add project icons in `src/lib/icons.app.ts` (`export { X as XIcon } from "@lucide/vue"`), which icons.ts re-exports. Registry consumers keep `iconLibrary: "lucide"` in `components.json`.
- **Everything is physical→logical codemodded.** Never paste upstream shadcn diffs verbatim — re-apply the logical-utility conventions (rule 1) to any newly generated component.
- **badge** has extra `success` and `warning` variants (soft tinted, matching `destructive`'s pattern).
- **switch** carries an `rtl:` negated thumb-translate fix — upstream's physical `translate-x` breaks in RTL. State selectors are `data-[state=checked]/[state=unchecked]` (what reka 2.x actually sets), NOT `data-checked:`.
- **progress** fills by logical `width` in a flex track. Do NOT reintroduce upstream's `translateX(-N%)` — it fills the wrong side in RTL. `modelValue: null` renders an indeterminate animation (`animate-progress-indeterminate` keyframe in `style.css`, sliding on logical `inset-inline-start`, frozen under reduced motion).
- **tabs** auto-renders reka's animated `TabsIndicator` inside `TabsList`. Its position uses physical `left`/`translate-x` from reka's `--reka-tabs-indicator-*` vars ON PURPOSE (reka measures the DOM directly) — do NOT codemod these to logical properties. The indicator is written as **arbitrary properties** (`[width:var(--reka-tabs-indicator-size)]`, `[translate:var(--reka-tabs-indicator-position)]`, `[left:0]`) so a registry consumer's shadcn-vue CLI (`rtl: true`) doesn't rewrite `translate-x-*` into a broken `rtl:` twin — keep that spelling.
- **select** is restyled like dropdown-menu: `position="popper"` / `align="start"` / `sideOffset` 4 by default, `rounded-xl p-1 shadow-lg`, start-edge focus bar, primary check, trigger ring + rotating chevron. There is deliberately **no** popper `data-[side=*]:translate-*` (it doubled the offset) and no `cn-menu-translucent`; don't reintroduce either. `item-aligned` still works but is no longer the default.
- **select** root (`Select.vue`) is keyed on the i18n locale, so it remounts on a language switch — reka's `SelectItemText` copies the selected item's text into the trigger only once on mount. Don't add per-call `:key="locale"`; a label that changes for any OTHER reason (renamed option, async-loaded labels) still needs a caller-side `:key`.
- **combobox** has a flush search row (`InputGroup` `h-10 rounded-none border-0 border-b`), and re-exports `ComboboxVirtualizer` from reka for long lists.
- **tabs** `TabsList` is a phone strip below `sm`: no wrap, snap scrolling, **hidden scrollbar** (a bar under tabs reads as a second underline — don't use `scroll-x` here), end-edge fade mask (dir-aware, per-direction gradients because `to inline-end` is not valid in `mask-image`), and the active trigger auto-scrolls into view (MutationObserver on `data-state`, `behavior:'auto'` under reduced motion). All strip utilities are gated on `group-data-horizontal/tabs:` so vertical lists render as before; triggers are `shrink-0 snap-start`.
- **sonner** requires `import "vue-sonner/style.css"` (already in `Sonner.vue`) — v2 ships CSS separately; toasts are invisible without it. The toaster corner is direction-aware, and rich-colors are remapped to kit tokens (`--success`/`--warning`/…) in `Sonner.vue`.
- **calendar / range-calendar** are Libya-configured: `locale="ar-LY-u-nu-latn"` (Latin digits, explicit) + `:week-starts-on="6"` (Saturday). Keep both when copying the demos.
- **combobox** demos use `ignore-filter` + a `normalizeArabic()` computed — reka's built-in substring filter can't match أ/إ/آ/ا or ة/ه equivalences. Copy that pattern for any Arabic search.
- **Base CSS forces `email/tel/url/number` inputs LTR** (right-aligned) under RTL via a `style.css` rule — do not add per-input `dir="ltr"` hacks.
- **chart** plot areas render inside `dir="ltr"` (time axis flows left→right; sanctioned rule-7 exception); labels and tooltips stay token-colored with `.num` values.
- **pin-input** slots keep `dir="ltr"` and `.num` (digits read left-to-right even in Arabic UI).
- **pin-input** root is a bare `w-fit` slot row (no frame/padding) — center it with `mx-auto` (or a centering parent); slots are `h-8 w-8` and grow to `sm:h-9 sm:w-9`.
- **button** has soft-tint status variants `success` / `warning` / `info` (info uses `chart-2`) for resolve/undo/route action rows. They are NOT a second primary — they carry no glow; `glow-primary` rules (rule 8) are unchanged.
- **dialog**: `DialogContent` caps at `max-h-[min(90dvh,calc(100dvh-2rem))]` with `overflow-y-auto` and `p-4 sm:p-6`. For edge-to-edge sections pass `p-0` on the content and use `<DialogFooter bleed>` (own inset, tinted `border-t`) instead of copy-pasting the footer treatment. The close button's sr-only label is `t("common.close")`. alert-dialog content is `max-w-[calc(100%-2rem)]` so it never touches viewport edges on phones. The command palette dialog keeps its top-third anchoring and adds `max-h-[min(80dvh,32rem)]`.
- **scroll-area** viewport carries `max-h-[inherit]` — a root with only a `max-h-*` now scrolls instead of spilling (percentage height against an auto-height parent resolves to auto).
- **toggle-group** defaults `orientation="horizontal"` so reka renders `data-orientation` (the item rounding variants `data-horizontal`/`data-vertical` depend on it); flush groups would otherwise render square.
- **Custom utilities** live in `src/style.css`: `num`, `row-number` (the `#` gutter cell), `glow-primary`, `bg-grid`, `bg-halo`, `scroll-x`, `cn-rtl-flip`, `cn-shake` (reduced-motion-safe). They are `@utility` definitions — available like any Tailwind class. (`animate-progress-indeterminate` is a `@theme` keyframe, used by Progress's indeterminate mode.)

## Task index — "I need to build…"

| Task | Read | Copy from (living, tested reference) |
|---|---|---|
| A new page (title, breadcrumbs, spacing, states) | [docs/pages.md](docs/pages.md) | `src/pages/reference/templates/ListPageTemplate.vue`, `src/pages/reference/templates/DetailPageTemplate.vue` (`/reference/page-anatomy` overlays the measurements) |
| A list screen (table + filters + bulk actions) | [docs/datatable.md](docs/datatable.md) | `src/pages/reference/TablesPage.vue` |
| A form (validation, dates, numbers) | [docs/forms.md](docs/forms.md) | `src/pages/reference/FormsPage.vue`, ComponentsPage schema-form section |
| A money action / status display | [docs/money-and-status.md](docs/money-and-status.md) | ComponentsPage PinConfirm + "Amount/StatusSwitch/ReasonPinDialog" demos, `src/pages/reference/LoginPage.vue` OTP step |
| Upload / long-running job / loading states | [docs/async.md](docs/async.md) | ComponentsPage upload + async-jobs sections |
| A dashboard/overview page | [docs/async.md](docs/async.md) (StatCard) | `src/pages/reference/OverviewPage.vue` |
| A settings/profile page | — | `src/pages/reference/SettingsPage.vue`, `src/pages/reference/ProfilePage.vue` |
| A new project from the registry (shadcn-vue CLI, public GitHub) | [docs/registry.md](docs/registry.md) | — |
| A brand-new project from this kit (template clone) | [docs/new-project.md](docs/new-project.md) | — |
| Re-theme / rebrand | [docs/theming.md](docs/theming.md) | `src/style.css` |
| Anything RTL-related | [docs/rtl.md](docs/rtl.md) | — |

**The app surface is deliberately minimal** — `HomePage` + the 404. The demo/recipe pages above live in `src/pages/reference/` and are routed **only in dev** under `/reference/*` (production builds tree-shake them entirely). `/reference/components` renders every component live with Arabic RTL examples — use it to verify rendering in the browser during development.

## Working on the kit itself

- **Count invariant** (test-enforced): the `badge` string in `src/lib/nav.ts` must equal the number of `src/components/ui/*` folders, and the ComponentsPage header text must match. Adding/removing a ui family means updating both (currently 43).
- **Docs drift test** (`src/__tests__/docs.spec.ts`): every ui family, app composite, and composable must be mentioned in this file, and every `docs/*.md` must be linked from here. Adding a component without documenting it fails `npm run check`.
- Conventions tests: `src/__tests__/conventions.spec.ts` (style.css utilities, router integrity) and `rtl-conventions.spec.ts` (globs source for physical utilities).
- **Registry** (`registry.json`, `registry/` output, generator + e2e in `scripts/registry/`; guide: [docs/registry.md](docs/registry.md)): after changing kit code run `npm run registry:build` and commit the result — the drift test in `src/__tests__/registry.spec.ts` fails otherwise. Run `npm run registry:e2e` (slow, ~10 min, needs network) before releases — it runs the documented public `init --preset …/registry/r/starter.json` flow against a local raw-GitHub stand-in (no token anywhere). Registry consumers keep `"rtl": false` in their `components.json` (the sources are already logical-utility RTL); the kit itself keeps `"rtl": true`.
- New shadcn components: generate via CLI (`components.json` has `"rtl": true`), then apply the codemod conventions (rule 1 + Arabic strings + lucide icons) before committing.
