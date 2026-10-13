import writtenNumber from "written-number";
import { parseApiNumber } from "@/lib/money";

// Truncating, ungrouped, never-exponent digits — the same `roundingMode`
// widening money.ts uses (the TS lib predates the ES2023 option).
type TruncatingFormatOptions = Intl.NumberFormatOptions & { roundingMode: "trunc" };

function plainDigits(value: number, decimals: number): string {
  const options: TruncatingFormatOptions = {
    useGrouping: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
    roundingMode: "trunc",
  };
  return new Intl.NumberFormat("en-US", options).format(value);
}

/**
 * An amount spelled out in Arabic words ("القيمة بالحروف") — for copy texts,
 * receipts and cheques. Ported from the production Aamin dashboard,
 * on the same `written-number` package, so the wording stays the one
 * providers have always read.
 *
 * Input contract: a number, or a raw API string — plain ("2000.00000") or
 * grouped ("311,843.61092") — parsed through {@link parseApiNumber}. Non-negative
 * only: a negative, non-numeric or non-finite value returns "" (written-number
 * cannot spell negatives, and a silent wrong figure is worse than none).
 *
 * Its quirks are kept on purpose:
 * - the fraction is cut to `decimals` digits, never rounded (12.999 → "99")
 *   — and a short one is padded (33.7 → "70");
 * - a whole amount gets no fraction clause at all — including one whose
 *   fraction is zero after parsing ("2000.00000" → "ألفان دينار");
 * - the subunit may be a placeholder ("-") for currencies that have none in
 *   the provider's vocabulary.
 */
export function amountInArabicWords(
  value: number | string,
  currency: string,
  subunit: string,
  decimals = 2,
): string {
  const n = parseApiNumber(value);
  if (n == null || n < 0) return "";

  // Math.abs folds -0 into 0 so it formats as "0", not "-0".
  const [integerPart = "0", fractionPart] = plainDigits(Math.abs(n), decimals).split(".");
  let words = `${writtenNumber(parseInt(integerPart, 10) || 0, { lang: "ar" })} ${currency}`;

  if (fractionPart) {
    const fraction = parseInt(fractionPart.padEnd(decimals, "0").slice(0, decimals), 10);
    words += ` و ${writtenNumber(fraction, { lang: "ar" })} ${subunit}`;
  }

  return words;
}
