/**
 * Money formatting — the only way money reaches the screen. Latin digits
 * always — display sites wrap the digit runs in `class="num"`.
 *
 * Two precisions, one contract (see docs/money-and-status.md):
 *   display — up to DISPLAY_DIGITS decimals, truncated, trailing zeros trimmed
 *   exact   — up to EXACT_DIGITS decimals, truncated, trailing zeros trimmed
 * A figure only earns a hover affordance when the two differ; `moneyFigure`
 * reports that as `truncated`. Nothing here ever compacts — "154.86 مليون"
 * is not a money display in this app; `formatCompact` is for axis ticks only.
 */

/** Decimals shown on screen. The dinar's subunit is 1/1000. */
export const DISPLAY_DIGITS = 3;
/** Decimals revealed on hover — the backend's full storage precision. */
export const EXACT_DIGITS = 5;

// Truncates rather than rounds: a balance of 684,775.91997 reads as
// "684,775.919", never "684,775.92". Rounding at 3 would both overstate the
// figure and hide the fact that there is more precision underneath — and
// "…919" → "…920" → trimmed "…92" would look like a plain 2-decimal value.
// `roundingMode` and `signDisplay: "negative"` are ES2023 Intl; the TS lib this
// project targets predates them, so they are attached through a local widening
// rather than bumping `lib`. "negative" drops the sign of a value that
// truncates to zero: −0.0004 reads "0", never "-0" (a phantom debt).
type TruncatingFormatOptions = Omit<Intl.NumberFormatOptions, "signDisplay"> & {
  roundingMode: "trunc";
  signDisplay: "negative";
};

// Unlike an unknown `roundingMode` (ignored), an unknown `signDisplay` value
// THROWS in pre-2023 engines — detect once and fall back to "auto" + a "-0" fix.
const SIGN_NEGATIVE_SUPPORTED = (() => {
  try {
    new Intl.NumberFormat("en-US", {
      signDisplay: "negative",
    } as unknown as Intl.NumberFormatOptions);
    return true;
  } catch {
    return false;
  }
})();

function group(value: number, digits: number): string {
  const options: TruncatingFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
    roundingMode: "trunc",
    signDisplay: "negative",
  };
  if (!SIGN_NEGATIVE_SUPPORTED) {
    const text = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
      roundingMode: "trunc",
    } as Intl.NumberFormatOptions).format(value);
    return text === "-0" ? "0" : text;
  }
  // The cast only bridges the pre-ES2023 lib typing of `signDisplay`.
  return new Intl.NumberFormat("en-US", options as unknown as Intl.NumberFormatOptions).format(
    value,
  );
}

/**
 * On-screen money: grouped, Latin digits, up to 3 decimals with trailing zeros
 * trimmed — 154863047.5 → "154,863,047.5", 2000 → "2,000". Never compacted:
 * the business reads exact figures, so "154.86 مليون" is not an option.
 */
export function formatMoney(value: number): string {
  return group(value, DISPLAY_DIGITS);
}

/**
 * The hover string: same grouping, up to 5 decimals — "311,843.61092". Only
 * worth showing when it differs from {@link formatMoney}.
 */
export function formatMoneyExact(value: number): string {
  return group(value, EXACT_DIGITS);
}

/**
 * THE display primitive. Every money figure on screen goes through this so the
 * 3-shown/5-on-hover rule lives in one place. Returns null for anything
 * non-numeric so callers can fall back to rendering the raw value.
 */
export function moneyFigure(
  value: unknown,
): { text: string; exact: string; truncated: boolean } | null {
  const n = parseApiNumber(value);
  if (n == null) return null;
  const text = formatMoney(n);
  const exact = formatMoneyExact(n);
  return { text, exact, truncated: text !== exact };
}

/**
 * {@link moneyFigure} for a value already typed as a number — the null case is
 * impossible, so widgets get a plain figure instead of a non-null assertion.
 * A non-finite value (a bad API payload) reads as 0 rather than throwing.
 */
export function numberFigure(value: number): { text: string; exact: string; truncated: boolean } {
  return moneyFigure(Number.isFinite(value) ? value : 0)!;
}

/**
 * The hover title for a money figure, or undefined when nothing is hidden —
 * bind straight onto the `.num` span: `:title="moneyTitle(row.balance)"`.
 * The cheap counterpart to a reka Tooltip for table cells.
 */
export function moneyTitle(value: unknown): string | undefined {
  const figure = moneyFigure(value);
  return figure?.truncated ? figure.exact : undefined;
}

/**
 * Trimmed money for list cells and detail rows: grouped, no trailing zeros, so
 * a backend "2000.00000" reads as "2,000" instead of leaking its storage
 * precision. `digits` defaults to DISPLAY_DIGITS; pass EXACT_DIGITS for the
 * full stored value.
 * Returns null for anything non-numeric so callers can render the raw value.
 */
export function formatAmount(value: unknown, digits = DISPLAY_DIGITS): string | null {
  const n = parseApiNumber(value);
  if (n == null) return null;
  return group(n, digits);
}

/**
 * Display wrapper on {@link formatAmount} for list cells and detail rows:
 * em-dash for blanks, raw text for non-numbers — so every money figure in the
 * app renders one way ("2,000", never "2000.00000" or "311843.61").
 */
export function formatAmountCell(value: unknown): string {
  if (value == null || value === "") return "—";
  return formatAmount(value) ?? String(value);
}

/** Whole-number display with grouping: 255000 → 255,000. */
export function formatCount(value: unknown): string | null {
  const n = parseApiNumber(value);
  if (n == null) return null;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}

/**
 * Compact axis ticks with Latin digits: 214.5k / 6.2M. Chart axes only — a
 * full grouped number cannot fit a tick. Every other surface shows the figure.
 */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Parse an API money/number field — number, or a grouped string like
 * "311,843.61092" — into a number. Returns null for anything non-numeric
 * (names, dashes, empty) so callers can fall back to rendering the raw value.
 */
export function parseApiNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const cleaned = value.trim().replace(/,/g, "");
  if (cleaned === "" || !/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Figure for a tight cell (card stat strips, KPI tiles): the full grouped
 * value, with `exact` for the hover when precision is hidden. `unit` is kept
 * (always "") so stat-strip callers keep one render shape.
 */
export function formatStat(
  value: unknown,
): { text: string; unit: string; exact: string; truncated: boolean } | null {
  const figure = moneyFigure(value);
  if (figure == null) return null;
  return { ...figure, unit: "" };
}

/**
 * Font-size tier for a money figure. `.num` is tabular mono, so character
 * count is a reliable width proxy — long values step down instead of
 * overflowing the tile or forcing a sideways scroll.
 */
export type MoneySize = "hero" | "stat" | "md" | "sm";

const SIZE_TIERS: Record<MoneySize, [string, string, string]> = {
  hero: ["text-3xl", "text-2xl", "text-xl"],
  stat: ["text-2xl", "text-xl", "text-lg"],
  md: ["text-xl", "text-lg", "text-base"],
  sm: ["text-sm", "text-sm", "text-xs"],
};

export function moneySizeClass(text: string, size: MoneySize = "md"): string {
  const [short, mid, long] = SIZE_TIERS[size];
  if (text.length <= 9) return short;
  if (text.length <= 13) return mid;
  return long;
}
