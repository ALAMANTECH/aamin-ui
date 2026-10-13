# Async: loading states, uploads, long-running jobs

Everything a screen needs between "user clicked" and "data arrived". Living demos: ComponentsPage sections **رفع الملفات** (upload), **المهام غير المتزامنة** (async jobs), **مكوّنات مركّبة** (StatCard/EmptyState states). None of these components touch the network — you inject the async functions.

## Spinner

`src/components/ui/spinner` — `<Spinner size="sm | default | lg" />` (3.5/4/6), `role="status"` with sr-only Arabic `label` (default `جارٍ التحميل`). The button-loading idiom:

```vue
<Button disabled><Spinner size="sm" /> جارٍ الحفظ…</Button>
```

## StatCard states

`label` + `value` (+ `unit`, `delta`, `deltaLabel`, `trend`, `icon`) as before, plus:

- `loading: boolean` — skeletons replace value/delta (label + icon stay put, no layout shift).
- `error: string` — destructive message + `إعادة المحاولة` button, emits `retry`.

- `hint?: string` — one quiet line under the figure saying what it counts.
- `#footer` slot — a tag that belongs to the figure (e.g. a balance's `دائن`/`مدين` badge), rendered under the delta.

**Money is automatic.** `value` stays a string; a numeric value (API number-string or number) goes through `moneyFigure()` from `src/lib/money.ts`: grouped Latin digits, up to 3 decimals **truncated** (never rounded), never compacted. When the stored 5-decimal value differs, the figure gets a `cursor-help` tooltip with the exact value. The font steps down by length (`moneySizeClass(text, "stat")`) instead of overflowing; non-numeric values (`"—"`, dates, ratios) render untouched. For a standalone headline figure outside a StatCard use `MoneyFigure` (see money-and-status.md).

```vue
<StatCard label="إجمالي المبيعات" :value="stats?.total ?? ''" unit="د.ل"
  :loading="pending" :error="loadError" @retry="reload" />
```

## EmptyState states

- `state: "empty" | "loading" | "error"` (default `empty` — existing props unchanged).
- `bare?: boolean` — drops the dashed frame and grid backdrop. Use it INSIDE an already-framed container (DataTable `#empty`, a Card) so there is no border-in-border. The root is a flex column that centres its content and stretches to fill a tall host.
- loading → `<Spinner size="lg" />` + title; error → destructive icon + `errorMessage ?? hint` + retry (`#retry` slot or `retry` emit); empty → icon + title + hint + default slot (action button).

## usePoll — interval polling

`src/composables/usePoll.ts`:

```ts
const poller = usePoll(fn, { interval: 2000, immediate: true, maxFailures: 5 });
// poller.isActive, poller.start(), poller.stop(), poller.failures
```

- `fn` sync or async; a rejection counts one consecutive failure, any success resets to 0.
- Auto-stops after `maxFailures` consecutive rejections (default `Infinity`).
- Timer is dispose-safe (`tryOnScopeDispose`) — no manual cleanup needed in components.
- Use for live feeds (e.g. a 2s activity feed).

## useAsyncJob — queue → poll → done | failed

`src/composables/useAsyncJob.ts` — the report-export/batch-import state machine:

```ts
const job = useAsyncJob<JobHandle, Blob>(
  (handle) => api.checkExport(handle),   // checkFn, fixed for the composable's lifetime
  { interval: 3000, maxFailures: 5 },
);
await job.start(() => api.startExport(params));   // startFn per call — retry = start() again
// job.status: idle|queued|running|done|failed — job.progress (0-100?) — job.result — job.error — job.reset()
```

`checkFn` returns a discriminated union — you can't read `result` before `done`:

```ts
type AsyncJobCheckResult<T> =
  | { status: "queued" | "running"; progress?: number }
  | { status: "done"; result: T }
  | { status: "failed"; error: string };
```

- `startFn` rejection → immediate `failed` with the error message.
- Poller exhaustion (`maxFailures` transient rejections) → `failed` with an Arabic message — a job can't hang silently on a dead poller.
- Real-backend mapping is 1:1: `startFn` = POST /export → job id; `checkFn` = GET /export/:id. Status UI: Progress bar + Badge per state (`قيد الانتظار / جارٍ التنفيذ / اكتمل / فشل`) — copy the ComponentsPage async-jobs demo, including its Blob-URL download pattern.

## FileDropzone

`src/components/app/FileDropzone.vue` — file **intake only**: accepts, validates, emits `File`s. Parsing (SheetJS etc.) is deliberately out of the kit — that's an integration-repo decision.

| Prop | Type | Notes |
|---|---|---|
| `v-model` | `File[]` | Accepted files |
| `accept` | `string[]` | Extensions (`[".xlsx", ".csv"]`); unset = any |
| `maxSize` | `number` | Bytes per file; unset = no limit |
| `multiple` | `boolean = true` | Native input stays reactive; single mode keeps first |
| `disabled` | `boolean` | |
| `variant` | `"default" \| "compact"` | `compact` = a single-line chip (drop target + browse + filename + remove) for dense per-row intake; a rejection shows inline in the chip until a file is accepted |
| `invalid` | `boolean` | The host refuses the file that is in: destructive frame + `aria-invalid` |

Emits `rejected(files, reason)` — one emit per distinct localized reason (`dropzone.typeNotAllowed`, `dropzone.sizeTooLarge`); rejected rows render inline in destructive tone with a remove button. Image files preview as thumbnails (object URLs are cached per file and revoked when the file leaves the model or on unmount); in single-file (`multiple=false`) default mode a picked image previews inside the drop field itself. All strings come from `dropzone.*` locale keys. Built-in: drag ring, keyboard open (Enter/Space, `role="button"` + localized aria-label), `<bdi>`-truncated filenames, `.num` KB/MB sizes. Files-only by construction (no directory-drop walking).

```vue
<FileDropzone v-model="files" :accept="['.xlsx']" :max-size="5 * 1024 * 1024"
  @rejected="(files, reason) => toast.error(reason)" />
```

## Sparkline

`<Sparkline :data="numbers" :color="'var(--chart-1)'" />` — under 2 points it renders a muted flat dash + sr-only `common.noData` text instead of an empty SVG. Paint colors come from tokens (`var(--chart-1)`, `var(--destructive)`).

- `endDot` — haloed dot on the newest point, so the reader knows which end of the line is "now".
- `labels?: string[]` — per-point display labels (same order as `data`). Providing them turns hover/touch on: a dashed crosshair plus a chip with the label and the value (`formatMoney`), clamped so it never leaves the card. The hover surface is `dir="ltr"` (charts flow LTR). Without `labels` the sparkline is purely decorative.
- Gradient ids come from `useId()`, so many sparklines on one page never collide.

## Choosing the affordance

| Situation | Use |
|---|---|
| Whole panel/list first load | `EmptyState state="loading"` or skeleton rows |
| KPI cards loading/failing | `StatCard :loading / :error` |
| Button-triggered mutation in flight | Button + `<Spinner size="sm" />` disabled idiom |
| Long-running backend job | `useAsyncJob` + Progress + Badge |
| Indeterminate wait (unknown %) | `Progress :model-value="null"` (animated, RTL-safe) |
| Live feed | `usePoll` |
| No data (not loading) | `EmptyState` (default) with an action in the slot |
| One chart in a dashboard loading / failing / empty | `ChartState` |
| Leaving the page mid-request | `useLeaveGuard(busy)` + `StickySubmitBar` |

## ChartState + chart-theme.ts

`src/components/app/ChartState.vue` — the per-chart async gate. Wrap each chart (not the page) so one failing series never takes the dashboard down:

```vue
<ChartState :loading="pending && !data" :error="loadError" :empty="!data?.length" @retry="reload">
  <div :style="CHART_CONTAINER_STYLE">…Unovis chart…</div>
</ChartState>
```

- Order: `loading` → 220px skeleton; `error` (string, `""` when healthy) → bare EmptyState error with retry; `empty` → «no data in this range» panel; otherwise the default slot.
- Pass `loading` only for the **first** load — a silent refresh keeps the stale chart on screen.
- `errorTitle` / `emptyTitle` override the default `chart.error` / `chart.noData` strings.

`src/components/app/chart-theme.ts` — shared Unovis conventions:

| Export | What |
|---|---|
| `CHART_CONTAINER_STYLE` | Unovis `--vis-*` vars mapped to kit tokens (axis, grid, crosshair, donut stroke, transparent tooltip shell) — bind as `:style` on the chart wrapper; re-themes with dark/light automatically |
| `useChartDuration()` | Computed enter/update duration: 400ms, or 0 under `prefers-reduced-motion` |
| `formatAxisDate(tick)` / `formatMonthTick("yyyy-mm")` / `formatPointLabel(key)` | Locale-aware, Latin-digit tick labels (date ticks are LTR-isolated so SVG text never reorders) |
| `tooltipHtml(title, rows: { color, label, value }[])` | Kit-styled HTML for `VisCrosshair`/`VisTooltip` templates. Every string is HTML-escaped; `value` is pre-formatted via `@/lib/money` and rendered in `.num`; `color` is a token expression (`var(--chart-1)`) |

Axis ticks use `formatCompact` from `@/lib/money` — the only place compact numbers are allowed.

## DaybookList

`src/components/app/DaybookList.vue` — a day-grouped ledger / activity feed. One framed section per calendar day (header: date + the day's total — net by default), one row per entry: kind icon, label, `HH:mm · time ago`, signed amount.

```ts
interface DaybookKind { icon: Component; tone: "success" | "destructive" | "warning" | "muted" | "primary"; sign: 1 | -1 | 0 }
interface DaybookEntry { id: string | number; at: string; kind: string; label: string; amount: number; currency?: string; link?: string }
```

- **Kinds are caller-supplied** (`kinds: Record<string, DaybookKind>`) — the list never guesses a kind from a backend label. Map your API's type field to a kind key in the page. Unknown kinds render muted and unsigned.
- `amount` is the magnitude; the sign glyph (`+` / `−`) comes from the kind, the tone colours icon + amount. Figures render through `Amount` (money.ts: 3 decimals truncated, exact value on hover; sign at the start in both directions).
- Rows group by `dayKey(at)` from `src/lib/datetime.ts` (the calendar day as the API wrote it — never re-parsed through `Date`).
- Day badge — `dayTotal`:
  - `"net"` (default): «صافي اليوم» = Σ `kind.sign × |amount|` (sign-0 kinds and unknown kinds add nothing), rendered signed through `Amount` and toned by the result — positive `success`, negative `destructive`, zero muted. A zero net is shown (it is information, not absence). Sums settle at 5 decimals so float residue never prints a signed «0».
  - `"turnover"`: «حركة اليوم» = Σ `|amount|`, unsigned — movement, not balance. Use it when the kinds carry no meaningful direction.
  - `"count"`: the day's row count. `"none"`: no badge.
  - Net and turnover are hidden on a day that mixes currencies (adding د.ل to USD is meaningless).
  - `showDayTotal` is deprecated: `false` still means `"count"`; `dayTotal` wins when both are set.
- Paging is server-side: `pageIndex` / `pageCount` / `rowCount` drive a CompactPager (`update:pageIndex`). `loading` = first-load skeletons; `refreshing` dims the rows behind a spinner; `error` with no rows = error panel (`retry`). `emptyTitle` / `loadErrorTitle` override the defaults.
- `link` turns the row into a RouterLink.

## AttachmentViewer

`src/components/app/AttachmentViewer.vue` — `attachments: { id, name, url, mime }[]` + `v-model` = the id on show (`null` closes). Opens a dialog: images (`image/*`) and PDFs (`mime === "application/pdf"` — never decided by the filename) render in the stage, anything else shows a «no preview» panel; the footer's «open in a new tab» link is always there.

**URL safety:** only `https:` / `http:` / `blob:` URLs (relative URLs resolve to the page origin) — plus `data:image/*` for image attachments — ever reach `<img src>`, `<iframe src>` or `<a href>` (`isSafeAttachmentUrl(url, mime)`, exported). Anything else (`javascript:`, `data:text/html`, …) gets no preview and a disabled «open in a new tab» with no link. Still serve attachment URLs from your own origin / signed storage; this is a last line of defence, not a sanitizer.
 With more than one attachment, prev/next buttons (tooltips + localized aria-labels) and **←/→ keys walk the set, swapped by direction** (`useDir()`: in RTL ← is "next"); both wrap. Names render in `<bdi>`.

## NotificationBell + NotificationFeed

`src/components/app/NotificationBell.vue` — the topbar bell, decoupled from any backend through an adapter:

```ts
interface NotificationItem { id: string; title: string; body?: string; createdAt: string; readAt: string | null; link?: string; event?: string; resource?: string }
interface NotificationAdapter {
  fetchCount(): Promise<number>;
  fetchList(): Promise<NotificationItem[]>;
  markRead(id: string): Promise<void>;
  markAll(): Promise<void>;
}
```

```vue
<AppTopbar>
  <template #notifications>
    <NotificationBell :adapter="notificationsAdapter" :event-icons="{ mentioned: AtSignIcon }"
      :event-tones="{ mentioned: 'bg-primary/15 text-primary' }" />
  </template>
</AppTopbar>
```

- The count is fetched at mount (and again when the popover opens) and polled every `pollMs` (default 60000, read once) via `usePoll` — 3 consecutive failures stop the poll. The list loads when the popover opens; a failure shows inline with retry.
- Row click: optimistic mark-read (`markRead`, toast on failure), emits `open(item)`, then follows `link` through the router when one is installed. «Mark all read» calls `markAll` and clears the badge.
- Look: `eventIcons` (wins) → `resourceIcons` → bell; `eventTones` → token tint classes, muted by default; `flipEvents` lists events whose icon is directional (mirrors under RTL).
- **No Tooltip around the trigger** — nesting TooltipTrigger and PopoverTrigger breaks reka's popper anchor; the aria-label names the button.
- `NotificationFeed` is the popover body (`items`, `unreadCount`, `loading`, `error`, the same maps; emits `open` / `readAll` / `retry`) — reuse it for a full-page inbox.
- The kit does **not** mount a bell in AppTopbar by default; the ComponentsPage demo uses an in-memory adapter.

## StickySubmitBar + useLeaveGuard — the intake recipe

`src/components/app/StickySubmitBar.vue` closes a long intake / batch page; `src/composables/useLeaveGuard.ts` keeps the operator from abandoning an in-flight request.

```vue
<script setup lang="ts">
const busy = ref(false);
useLeaveGuard(busy); // or useLeaveGuard(busy, () => t("myPage.leaveWarning"))
async function submit() {
  busy.value = true;
  try { await api.upload(rows.value); } finally { busy.value = false; }
}
</script>

<template>
  <!-- … the page's rows … -->
  <StickySubmitBar :stats="[{ label: t('myPage.rows'), value: formatCount(rows.length) ?? '0' }]"
    :busy="busy" :disabled="!rows.length" :submit-label="t('myPage.upload')"
    @submit="submit" @cancel="router.back()" />
</template>
```

- Bar props: `stats?: { label, value }[]` (value pre-formatted, rendered in `.num`), `busy`, `disabled?`, `submitLabel`, `busyLabel?` (default `submitBar.busy`), `cancelLabel?` (default `common.cancel`), `testId?` / `submitTestId?`; slots `#stats` (e.g. an `Amount`) and `#alert`; emits `submit` / `cancel`. The submit carries the screen's single `glow-primary`.
- Cancel is a real button (not an as-child RouterLink — `disabled` doesn't stop a link), locked while busy.
- `useLeaveGuard(busy, message?)`: while `busy`, in-app navigation asks `window.confirm(message?.() ?? t("submitBar.leaveWhileBusy"))` (registered only inside a route component) and a tab close / reload is blocked via `beforeunload`.
