/** Date display helpers — API payloads are ISO / MySQL datetime strings. */

/** ISO → YYYY/MM/DD (digit run only — pair with the `num` class). */
export function formatDateYmd(value: string | null | undefined): string {
  return value ? value.slice(0, 10).replaceAll("-", "/") : "—";
}

/**
 * The calendar day of an ISO / MySQL datetime, as the API wrote it
 * (`YYYY-MM-DD`) — the grouping key for day-grouped lists. Empty → "".
 * Never re-parse through `Date` here: that would shift the day by the
 * viewer's offset.
 */
export function dayKey(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "";
}

/**
 * YYYY/MM/DD from a Date's LOCAL calendar day.
 *
 * Charts parse an API day (`2026-07-28`) as local midnight, so round-tripping
 * through `toISOString()` renders it in UTC and lands on the previous day for
 * any positive offset — Africa/Tripoli (UTC+2) showed 2026/07/27. Read the
 * local components instead; never reformat a local Date through UTC.
 */
export function formatLocalDateYmd(value: Date | number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}/${month}/${day}`;
}

/**
 * YYYY-MM-DD from a Date's LOCAL calendar day — the value a `type="date"` input
 * holds. Same local-components rule as {@link formatLocalDateYmd}.
 */
export function formatLocalDateInput(value: Date): string {
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${value.getFullYear()}-${month}-${day}`;
}

/**
 * ISO → YYYY/MM/DD HH:mm (digit run only — pair with the `num` class).
 * Prefer for detail stamps; lists usually use {@link formatDateYmd} + {@link formatTimeAgo}.
 */
export function formatDateTime(value: string | null | undefined): string {
  return value ? `${value.slice(0, 10).replaceAll("-", "/")} ${value.slice(11, 16)}` : "—";
}

/** Extract HH:mm from a datetime (or pass-through if already a time). For day-grouped rows. */
export function formatTimeHm(value: string | null | undefined): string {
  if (!value) return "—";
  const match = value.match(/(\d{2}:\d{2})/);
  return match?.[1] ?? "—";
}

/**
 * Extract HH:mm:ss from a datetime. For receipts and provider reconciliation,
 * where two transfers to the same number minutes apart are told apart by the
 * seconds; everything else on screen uses {@link formatTimeHm}.
 */
export function formatTimeHms(value: string | null | undefined): string {
  if (!value) return "—";
  const match = value.match(/(\d{2}:\d{2}:\d{2})/);
  return match?.[1] ?? "—";
}

const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

/** Localized "time ago" via Intl.RelativeTimeFormat (auto: yesterday…). */
export function formatTimeAgo(value: string | null | undefined, locale: string): string {
  if (!value) return "—";
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "—";
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  let duration = (time - Date.now()) / 1000;
  for (const d of DIVISIONS) {
    if (Math.abs(duration) < d.amount) {
      return rtf.format(Math.round(duration), d.unit);
    }
    duration /= d.amount;
  }
  return "—";
}
