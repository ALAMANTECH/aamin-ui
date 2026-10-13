/**
 * Shared Unovis conventions for kit charts: token-based theming, Latin-digit
 * axis formatters, a kit-styled HTML tooltip, and a reduced-motion duration.
 * Pair with `ChartState` (the per-chart async gate) and the `ui/chart` family.
 */
import { computed } from "vue";
import { usePreferredReducedMotion } from "@vueuse/core";
import { i18n } from "@/lib/i18n";

/**
 * Unovis reads CSS variables at runtime — point them at kit tokens so charts
 * re-theme with dark/light automatically. Bind on the chart's wrapper:
 * `<div :style="CHART_CONTAINER_STYLE">`. The `--vis-dark-*` variants never
 * apply (their selectors don't match the kit's `.dark` class), so these base
 * vars always win.
 */
export const CHART_CONTAINER_STYLE = {
  "--vis-font-family": "var(--font-sans)",
  "--vis-axis-tick-label-color": "var(--muted-foreground)",
  "--vis-axis-grid-color": "var(--border)",
  "--vis-axis-domain-color": "var(--border)",
  "--vis-axis-tick-color": "var(--border)",
  "--vis-tooltip-padding": "0px",
  "--vis-tooltip-background-color": "transparent",
  "--vis-tooltip-border-color": "transparent",
  "--vis-tooltip-shadow-color": "transparent",
  "--vis-tooltip-backdrop-filter": "none",
  // Crosshair: a readable guide line + series-coloured circles with a card
  // ring (circles only render when the chart passes `y` accessors).
  "--vis-crosshair-circle-stroke-color": "var(--card)",
  "--vis-crosshair-circle-stroke-width": "2",
  "--vis-crosshair-circle-stroke-opacity": "1",
  "--vis-crosshair-line-stroke-color": "var(--muted-foreground)",
  "--vis-crosshair-line-stroke-opacity": "0.6",
  "--vis-donut-segment-stroke-color": "var(--card)",
} as const;

/** Unovis enter/update duration — 0 when the user prefers reduced motion. */
export function useChartDuration() {
  const reduced = usePreferredReducedMotion();
  return computed(() => (reduced.value === "reduce" ? 0 : 400));
}

const dateFormat = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(`${i18n.global.locale.value}-u-nu-latn`, options);

/**
 * Axis tick for a daily series: "14 يوليو" / "14 Jul" (Latin digits).
 * Wrapped in an LTR isolate so SVG labels under an RTL page don't reorder the
 * number and punctuation.
 */
export function formatAxisDate(tick: number | Date): string {
  return `⁦${dateFormat({ day: "numeric", month: "short" }).format(new Date(tick))}⁩`;
}

/** Axis tick for "yyyy-mm" month ids: localized short month name. */
export function formatMonthTick(month: string): string {
  return dateFormat({ month: "short" }).format(new Date(`${month}-15T00:00:00`));
}

/** Point label for a series key: "yyyy-mm" → month name, "yyyy-mm-dd" → "14 يوليو". */
export function formatPointLabel(key: string): string {
  return key.length === 7 ? formatMonthTick(key) : formatAxisDate(new Date(`${key}T00:00:00`));
}

export interface TooltipRow {
  /** A CSS colour expression — a token (`var(--chart-1)`), never a raw hex. */
  color: string;
  label: string;
  /** Pre-formatted (Latin digits, via `@/lib/money`) — rendered inside `.num`. */
  value: string;
}

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ESCAPES[c]!);

/**
 * Kit-styled HTML tooltip for VisCrosshair / VisTooltip `template`s. Unovis
 * injects the string as HTML, so every caller string is escaped here — a
 * label that came from the API can never become markup.
 */
export function tooltipHtml(title: string, rows: TooltipRow[]): string {
  const rowsHtml = rows
    .map(
      (row) => `<div class="flex items-center justify-between gap-4">
        <span class="flex items-center gap-1.5 text-muted-foreground"><span class="size-2 shrink-0 rounded-full" style="background:${escapeHtml(row.color)}"></span>${escapeHtml(row.label)}</span>
        <span class="num font-medium text-popover-foreground">${escapeHtml(row.value)}</span>
      </div>`,
    )
    .join("");
  return `<div class="min-w-44 space-y-1.5 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
    <p class="num font-medium text-popover-foreground">${escapeHtml(title)}</p>
    <div class="space-y-1">${rowsHtml}</div>
  </div>`;
}
