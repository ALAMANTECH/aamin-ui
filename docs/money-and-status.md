# Money flows, statuses & small chrome

The composites for fintech's defining interactions: PIN-gated actions, status display, reference copying. Plus PageHeader, Timeline, Kbd — and the formatting contracts every money figure and date goes through.

## Money & dates — the formatting contract

UI-pure helpers (no Vue, no i18n), Latin digits always. Every digit run they return is rendered inside `class="num"` (rule 2). **Money reaches the screen only through `src/lib/money.ts`; dates only through `src/lib/datetime.ts`** — never `toFixed`, `toLocaleString`, `slice` or `replace` inline in a page.

### Money (`src/lib/money.ts`)

Two precisions, one contract:

| Constant | Value | Meaning |
|---|---|---|
| `DISPLAY_DIGITS` | `3` | Decimals shown on screen (the dinar's subunit is 1/1000) |
| `EXACT_DIGITS` | `5` | Decimals revealed on hover — the backend's full storage precision |

- **Truncated, never rounded** (`Intl.NumberFormat` `roundingMode: "trunc"`). `684,775.91997` shows `684,775.919`, never `684,775.92` — rounding would overstate the balance and hide that precision was dropped. Negatives truncate toward zero.
- **Trailing zeros trimmed**, never padded: `2000` → `2,000`, backend `"2000.00000"` → `2,000`, `2000.5` → `2,000.5`.
- **The exact value appears only when it differs** from the display value (`truncated: true`). `2,000` gets no hover; `684,775.919` hovers `684,775.91997`.
- **Never compacted.** `154,863,047.5` is shown in full on every surface — "154.86 مليون" is not a money display. `formatCompact` (`6.2M`, `214.5K`) exists **for chart axis ticks only**.

| Function | Signature | Use for |
|---|---|---|
| `moneyFigure` | `(v: unknown) => { text; exact; truncated } \| null` | **The display primitive.** Accepts numbers and grouped API strings (`"311,843.61092"`); `null` for non-numbers so callers render the raw value |
| `numberFigure` | `(v: number) => { text; exact; truncated }` | Same, total for typed numbers (non-finite → `0`) — widgets need no null check |
| `moneyTitle` | `(v: unknown) => string \| undefined` | Cheap hover for table cells: `:title="moneyTitle(row.balance)"` on the `.num` span; `undefined` when nothing is hidden |
| `formatMoney` / `formatMoneyExact` | `(v: number) => string` | Raw 3-digit / 5-digit strings |
| `formatAmount` | `(v: unknown, digits = DISPLAY_DIGITS) => string \| null` | Trimmed amount; pass `EXACT_DIGITS` for the full value |
| `formatAmountCell` | `(v: unknown) => string` | List cells / detail rows: `—` for blanks, raw text for non-numbers |
| `formatCount` | `(v: unknown) => string \| null` | Whole numbers with grouping (`255,000`) |
| `formatStat` | `(v: unknown) => { text; unit; exact; truncated } \| null` | KPI tiles / stat strips (`unit` always `""`) |
| `formatCompact` | `(v: number) => string` | **Chart axes only** |
| `parseApiNumber` | `(v: unknown) => number \| null` | Number or grouped string → number; `null` for junk |
| `moneySizeClass` | `(text: string, tier: "hero" \| "stat" \| "md" \| "sm" = "md") => string` | Font-size step-down by character count (≤9 / ≤13 / longer) so long figures shrink instead of overflowing |

```vue
<script setup lang="ts">
import { computed } from "vue";
import { moneyFigure, moneySizeClass } from "@/lib/money";
const figure = computed(() => moneyFigure(balance.value));
</script>

<template>
  <span v-if="figure" class="num" :class="moneySizeClass(figure.text, 'stat')"
    :title="figure.truncated ? figure.exact : undefined">{{ figure.text }}</span>
  <span v-else>{{ balance }}</span>
</template>
```

`src/lib/number-words.ts` — `amountInArabicWords(value, currency, subunit, decimals = 2)` spells an amount in Arabic words (`written-number`). Accepts a number or a raw API string — plain (`"2000.00000"`) or grouped (`"311,843.61092"`) — parsed via `parseApiNumber`; **non-negative only**, and returns `""` for negative, non-numeric or non-finite input. The fraction is cut to `decimals` digits (never rounded) and padded when short; a whole amount — including one whose fraction is zero after parsing (`"2000.00000"`) — gets no fraction clause. For copy texts and receipts — never a substitute for the `.num` figure.

### Dates (`src/lib/datetime.ts`)

API payloads are ISO / MySQL datetime strings. Every helper returns `—` for empty/invalid input.

| Function | Output | Use for |
|---|---|---|
| `formatDateYmd(v)` | `2025/06/12` | List rows (pair with `formatTimeAgo`) |
| `formatTimeAgo(v, locale)` | `قبل ساعة واحدة` / `أمس` / `yesterday` | Relative stamp in lists — pass the active locale |
| `formatDateTime(v)` | `2025/06/12 15:36` | Detail-page stamps |
| `formatTimeHm(v)` | `09:14` | Rows grouped under a day header |
| `formatTimeHms(v)` | `09:14:07` | Receipts / reconciliation only (seconds matter); `—` if the stamp has no seconds |
| `formatLocalDateYmd(d)` | `2026/07/28` | A local `Date`/timestamp (chart points) — reads local components, never `toISOString()` (which shifts the day east of UTC) |
| `formatLocalDateInput(d)` | `2026-07-28` | The value for a `type="date"` input |

### Typed input & phones

- `src/lib/digits.ts` — `toLatinDigits(s)` maps Arabic-Indic (`٠–٩`) and Extended (`۰–۹`) digits to ASCII; `cleanTyped(s)` also drops invisible format marks (U+200E/U+200F… from WhatsApp/Arabic documents) and trims. Run user-typed numbers and codes through `cleanTyped` before parsing.
- `src/lib/phone.ts` — `normalizeLibyanPhone(s)` keeps digits only (strips spaces/dashes; never adds a country code); `isLibyanPhone(s)` = 10 digits on a `091`–`095` prefix (`09xxxxxxxx`). Validate with `isLibyanPhone`, submit `normalizeLibyanPhone(value)`.

## PinConfirm — THE money-action gate

`src/components/app/PinConfirm.vue`. **Standing rule: never re-inline `PinInputRoot` scaffolding.** Every PIN/OTP confirmation goes through this component; reviewers reject new raw pin-input usages outside `PinConfirm.vue` and the Login OTP step.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | — | Also the pin group's aria-label |
| `description` | `string` | `""` | |
| `length` | `4 \| 6` | `6` | |
| `masked` | `boolean` | `false` | Password-dot slots |
| `onConfirm` | `(code: string) => Promise<void>` | — | **The contract**: resolve = success; reject/throw = error state (the thrown `Error.message` becomes the Arabic error line, else a default) |
| `resendable` | `boolean` | `true` | Shows the resend link |
| `cooldown` | `number` | `30` | Resend cooldown seconds (`.num` countdown; interval cleaned up on close/unmount) |
| `variant` | `"dialog" \| "inline"` | `"dialog"` | `inline` = same state machine, no Dialog chrome (Login uses this) |
| `confirmLabel` | `string` | `common.confirm` | Idle button label |

v-model: `open` (dialog usage binds it; inline defaults open). Emits: `success`, `cancel`, `resend`.

### Behavior you get for free

- Autofocus first slot on open; **auto-submit** when all digits are filled.
- While `onConfirm` is pending: spinner on the button, slots disabled, dialog dismissal blocked.
- On rejection: `cn-shake` on the slot group (no-op under `prefers-reduced-motion` — the `aria-invalid` destructive border is the signal), Arabic error line (`role="alert"`), slots cleared and refocused.
- PIN slots are `dir="ltr"` + `.num` (kit convention) and responsive: `size-8 text-base` on phones, `sm:size-10 sm:text-lg` from `sm` up (gap `gap-1.5 sm:gap-2`). Resend link disabled during cooldown with a live countdown whose digits stay inside `<span class="num">`. All strings come from `pin.*` keys.

### Usage

```vue
<PinConfirm v-model:open="confirmOpen" title="تأكيد دفع الدين"
  description="أدخل رمز التحقق المكوّن من 6 أرقام"
  :on-confirm="(code) => api.payDebt(id, code)"
  @success="refresh" @resend="api.resendOtp(id)" />
```

Backend errors: throw `new Error("الرمز غير صحيح")` from `onConfirm` to show that exact message.

## StatusBadge

`src/components/app/StatusBadge.vue` — the ONE status→color mapping. Renders a `Badge` with a leading dot.

- `status: string` — a canonical English status **code** (`completed`, `pending`, …).
- `map?: Record<string, { variant; label? }>` — **extends** (not replaces) the defaults.
- Defaults: `completed/active/enabled → success`, `pending → warning`, `rejected/suspended → destructive`, anything else → `secondary`.
- Labels come from `status.<code>` in the kit's `src/locales/<lang>/status.json` (add a key per new code, in every locale — in your project put additions in `src/locales/<lang>/app.json`, which is merged last). A status with no key renders as the raw string; `label` in a `map` entry overrides both.

```vue
<StatusBadge :status="tx.status" :map="{ in_review: { variant: 'warning' } }" />
```
and add `"status": { "in_review": "قيد المراجعة" }` to `src/locales/ar/app.json` / `en/app.json`.

Never write ad-hoc `status === 'x' ? 'default' : …` ternaries in pages — extend the map.

## CopyButton

`src/components/app/CopyButton.vue` — ghost icon button, `CopyIcon → CheckIcon` for 1.5s. Props: `value` (copied text), `label` (default: `copy.label`), `withToast?: boolean | string`, `size = "icon-sm"`. When the clipboard is unavailable or rejects, it shows an error toast (`copy.failed`) — never a silent no-op, so the operator knows the paste would be empty. Use it beside references/IDs (see TablesPage's `#cell-id`).

## Kbd

`src/components/app/Kbd.vue` — styled `<kbd>` chip (already used by CommandMenu for ⌘K). `<Kbd>⌘K</Kbd>`.

## Timeline

`src/components/app/Timeline.vue` — activity feeds and audit trails (used by OverviewPage + ProfilePage).

```ts
interface TimelineItem {
  text: string; time: string;              // time rendered in .num
  icon?: Component;                        // dot becomes an icon badge
  tone?: "default" | "primary";            // default: first item is primary (glow dot)
  diff?: { field: string; from: string; to: string };  // audit rendering: from (struck) → to
}
```

`<Timeline :items="items" />` with optional `#item="{ item, index }"` slot override. The diff arrow mirrors via `cn-rtl-flip` — this is the seed for audit-log screens; extend items, don't fork the component.

## PageHeader

`src/components/app/PageHeader.vue` — starts every page.

- `title`, `description`
- `breadcrumbs?: { label: string; to?: string }[]` — rendered above the title with `ui/breadcrumb`
- `back?: string | boolean` — ghost back button (arrow auto-mirrors). `true`/bare attribute = router `back()`; a string path = `router.push(path)`. Emits `back`.
- `#actions` slot — the page's buttons (ONE `glow-primary` max). On phones the actions sit at the end edge beside the title; from `sm` up they share the title row.
- `#title` slot — a title that is more than text (e.g. a document number in `.num`); the `title` prop stays the fallback and the accessible default.
- `#meta` slot — a detail page's identity lines under the title: status badge, whose it is, when.
- Breadcrumbs never wrap — they scroll horizontally (`scroll-x`). Title is `text-xl sm:text-2xl`.

```vue
<PageHeader title="تفاصيل المسوّق" back="/marketers"
  :breadcrumbs="[{ label: 'المسوّقون', to: '/marketers' }, { label: 'مسوّق تجريبي' }]">
  <template #actions><Button class="glow-primary">…</Button></template>
</PageHeader>
```

### Detail-page actions recipe

One primary action (the only `glow-primary` on the screen), secondary actions as outline buttons hidden on phones (`max-md:hidden`), and an icon-only «المزيد» dropdown that repeats the hidden actions for phones (`md:hidden` items) with the destructive item last after a separator:

```vue
<PageHeader :title="doc.number" back="/documents" :breadcrumbs="crumbs">
  <template #title><span class="num">{{ doc.number }}</span></template>
  <template #meta><StatusBadge :status="doc.status" /> …</template>
  <template #actions>
    <Button size="sm" class="glow-primary">اعتماد</Button>
    <Button variant="outline" size="sm" class="max-md:hidden">تعديل</Button>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline" size="icon-sm" aria-label="المزيد"><EllipsisIcon class="size-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem class="md:hidden">تعديل</DropdownMenuItem>
        <DropdownMenuSeparator class="md:hidden" />
        <DropdownMenuItem variant="destructive">إلغاء</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </template>
</PageHeader>
```

(Use `t(...)` for the labels in real screens.) Live demo: ComponentsPage → «مكوّنات مركّبة».

## MoneyFigure

`src/components/app/MoneyFigure.vue` — the money headline for a hero figure outside StatCard.

`<MoneyFigure :value="154863047.5" currency="د.ل" size="hero" tone="success" />`

- `value: number`, `currency: string`, `exact?: string` (server string for the tooltip; defaults to `formatMoneyExact(value)`), `size?: "hero" | "stat" | "md" | "sm"` (default `md`), `tone?: "default" | "destructive" | "success"`.
- Always the full grouped figure — **never compacted** ("1,660,000", not "1.66M" / "1.66 مليون"). Up to 3 decimals truncated; the stored 5 decimals show in a tooltip only when they differ (then the figure carries `cursor-help`).
- Long values step the font down (`moneySizeClass`) instead of overflowing. Accepts `class` for layout. The tooltip needs a `TooltipProvider` ancestor (wired in `App.vue`).

## Amount

`src/components/app/Amount.vue` — one inline money figure (cells, sentences, detail rows). Money goes through `money.ts`, so it is **truncated to 3 decimals, never rounded**: `<Amount :value="1.23456" />` shows `1.234`, and its `.num` span carries `title="1.23456"` only because the stored value differs.

- `value: number | string | null | undefined` — a number or an API string (`"311,843.61092"`); blank renders `—`, non-numeric text renders as-is.
- `unit?: string` — localized currency after the figure (muted, smaller). `sign?: "+" | "−" | ""` — leading sign. `abs?: boolean` — magnitude only (say the side in words beside it).
- Prefer `MoneyFigure` for a hero/headline figure and `StatCard` for a KPI tile; `Amount` is the in-line one.

## DocNo

`src/components/app/DocNo.vue` — a document number such as `INV-2026-0042` or `469 - ط /2026`. Only the digit runs go in `.num`. The root is a `<bdi>` (direction from the first strong character): each `.num` run is a bidi isolate, so without it `INV-2026-0042` would display reversed in an RTL paragraph — with it Latin codes render as one LTR run and Arabic-script numbers stay RTL. Never wrap the whole string in `.num` — that forces it LTR and an Arabic reader would meet the year first. `value: string | null | undefined`, `wrap?: boolean` (let a long line break instead of `whitespace-nowrap`).

## TotalsStrip

`src/components/app/TotalsStrip.vue` — the strip above a list: one row per currency, one StatCard per figure.

```vue
<TotalsStrip :totals="[{ currency: 'د.ل', items: [{ label: 'المتبقي', value: 311843.61092 }] }]" :dimmed="refetching" />
```

- `totals: { currency: string; items: { label: string; value: number }[] }[]` — feed it the **server totals for the whole filtered set** (all pages, every filter applied), never a sum of the visible page. Money never adds across currencies, so a mixed list is several groups. Empty `totals` renders nothing.
- `dimmed?: boolean` — greys the strip while the list refetches, keeping the last figures visible.
- Needs a `TooltipProvider` ancestor (StatCard's exact-value tooltip; wired in `App.vue`).

## StatusSwitch

`src/components/app/StatusSwitch.vue` — a switch **plus its state in words** (a StatusBadge), as one unit. A bare switch does not say what it currently is (the thumb side flips in RTL). **Every table-row or page-header enable/disable toggle uses StatusSwitch**; switches inside a form (a field among fields) stay plain `Switch` with a label.

- `modelValue: boolean`, `label: string` (accessible name — say what it toggles), `pending?: boolean` (disables while the request runs), `size?: "default" | "sm"`.
- `enabledLabel? / disabledLabel?` override the words (defaults `common.enabled` / `common.disabled`); `disabledVariant?: "secondary" | "warning" | "destructive"` (`destructive` where off is a block); `badgeSide?: "start" | "end"`; `class?`.
- Emits `update:modelValue`. It is **controlled**: it never flips itself — pair it with `AsyncConfirmDialog` and update the model once the change is stored. Both state words render (one invisible) so the pill keeps the wider word's width and the switch never shifts.

## SettingRow

`src/components/app/SettingRow.vue` — one setting switch explained: a tinted icon tile (success when on; `warning`/`destructive` when off per `offTone`), `title`, one-line `hint` (what turning it off does), an optional `note` (warning line), and a StatusSwitch carrying its **own** `onLabel` / `offLabel`. Stack several rows for a record with several switches — their distinct words tell them apart. `dimmed` greys it while another switch overrides it (still operable). Props: `modelValue, icon, title, hint, onLabel, offLabel, switchLabel, offTone?, pending?, note?, dimmed?`; emits `update:modelValue` (controlled).

## AsyncConfirmDialog

`src/components/app/AsyncConfirmDialog.vue` — the confirm step for a state change. A bare `AlertDialogAction` closes before its handler runs; this one **stays open while `onConfirm` is in flight** (Escape/overlay/Cancel are blocked), shows a refusal **inline** (`role="alert"`) and keeps the dialog open to retry, and on resolve emits `update:open(false)` then `success`.

- Props: `open`, `title`, `description?`, `confirmLabel?` (default `common.confirm`), `destructive?`, `onConfirm: () => Promise<unknown>`, `errorMessage?: (e: unknown) => string`. Default `errorMessage`: `e instanceof Error ? e.message : t("common.networkError")` — pass your own to map your backend's error shape.
- Emits `update:open`, `success`. Use `v-model:open`. For a money/PIN-gated action use `ReasonPinDialog` / `PinConfirm`, not this.

## ReasonPinDialog

`src/components/app/ReasonPinDialog.vue` — an irreversible action that the backend takes as `{ reason, pin }` (void a payment, reverse an allocation). Step 1 is an AlertDialog with a required reason (max 255); Continue opens a **`PinConfirm` step on top** (rule 9 — never inline pin-input here), and both close together on success.

- Props: `title, description?, reasonLabel, reasonPlaceholder?, continueLabel, pinTitle, pinDescription?, confirmLabel, onConfirm: (reason, pin) => Promise<void>, testId?` (data-testid prefix, default `reason-pin`); `v-model:open`; `#description` slot for rich text (amounts, `DocNo`).
- `onConfirm` **must throw on refusal** (wrong PIN, 422) — PinConfirm shows it in place and the reason is kept. Emits `success(reason)`.

## BrandMark

`src/components/app/BrandMark.vue` — the logo tile for a brand / provider / merchant / catalog entry. `name` (first character is the fallback letter), `src?` (image fills the tile edge to edge; an empty or failed URL falls back to the letter), `seed?: string | number` (stable tint — the same entity always gets the same colour), `size?: "sm" | "md" | "lg"`, `class`. Tints cycle through **theme tokens only** (`BRAND_MARK_TONES`: primary, chart-2, success, warning, destructive at /15), so a rebrand re-tints every mark from the token file. `toneFor(seed)` and `letterFor(name)` are exported for list cells that want the same tint without the tile.

```vue
<BrandMark :name="provider.name" :src="provider.icon" :seed="provider.id" size="sm" />
```
