/**
 * Libyan mobile number helpers for phone fields (validate + normalize before submit).
 * Numbers are entered as "09xxxxxxxx" (10 digits, 091–095 carriers); some
 * backend tables store them as integers, so the leading zero survives only in
 * display — never round-trip a stored int back through these validators.
 */

const LY_PHONE_PREFIXES = ["091", "092", "093", "094", "095"] as const;

/** Digits only — strips spaces, dashes and any other separators. */
export function normalizeLibyanPhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** 10 digits starting with a known Libyan mobile prefix. */
export function isLibyanPhone(raw: string): boolean {
  const digits = normalizeLibyanPhone(raw);
  return (
    digits.length === 10 && (LY_PHONE_PREFIXES as readonly string[]).includes(digits.slice(0, 3))
  );
}
