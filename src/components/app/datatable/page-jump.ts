/** The page sizes the footer offers — and the only ones a persisted
 *  `storageKey` page size may restore to (anything else is ignored). */
export const PAGE_SIZES: readonly number[] = [10, 25, 50];

/** True when a stored page size is one the footer can actually show. */
export function isOfferedPageSize(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && PAGE_SIZES.includes(value);
}

/**
 * Turns what a user typed into the page readout into a zero-based page index,
 * or `null` when there is nothing to go to.
 *
 * - Non-digits are ignored (`"12a"` → 12) so a stray character never blocks.
 * - Empty input is a no-op, never "page 1".
 * - Out-of-range values clamp to the nearest edge: the user asked for "too far",
 *   and the last page is the honest answer to that.
 */
export function resolvePage(raw: string, pageCount: number): number | null {
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return null;
  const wanted = Number.parseInt(digits, 10);
  if (!Number.isFinite(wanted)) return null;
  const last = Math.max(1, Math.floor(pageCount));
  const page = Math.min(Math.max(wanted, 1), last);
  return page - 1;
}
