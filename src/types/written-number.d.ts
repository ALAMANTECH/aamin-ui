// `written-number` (behind amountInArabicWords in src/lib/number-words.ts)
// ships no types.
declare module "written-number" {
  export default function writtenNumber(
    value: number,
    options?: { lang?: string; noAnd?: boolean },
  ): string;
}
