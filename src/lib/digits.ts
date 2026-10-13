/**
 * Typed-input digit helpers — what a user typed or pasted (often off a photo,
 * WhatsApp or an Arabic document) made safe to read as a number or a code.
 */

/** Arabic-Indic (U+0660–U+0669) and Extended Arabic-Indic (U+06F0–U+06F9) digits → ASCII. */
export function toLatinDigits(input: string): string {
  return input
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/**
 * What an agent typed or pasted, ready to read as a number or a code: invisible
 * format marks dropped (text copied from WhatsApp or an Arabic document carries
 * U+200E/U+200F and friends, and `trim()` keeps them), Arabic digits made ASCII,
 * outer spaces trimmed.
 */
export function cleanTyped(input: string): string {
  return toLatinDigits(input.replace(/\p{Cf}/gu, "")).trim();
}
