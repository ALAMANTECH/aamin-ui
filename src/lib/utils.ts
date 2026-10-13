import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes Arabic text for tolerant search matching: strips tashkeel
 * (diacritics) and unifies common hamza/alef and taa-marbuta/alef-maqsura
 * spelling variants, so a bare-alef spelling of a word also matches a
 * hamza-alef spelling of the same word (see the combobox demo data).
 *
 * The codepoints below are generated from numeric constants (see the
 * script that produced this file in git history / plan 006) rather than
 * hand-typed, since bidi Arabic text mixed with regex syntax is very easy
 * to mistype or misread by eye, and a stray character here would silently
 * break matching without any type or lint error to catch it.
 */
export function normalizeArabic(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[ً-ٰٟ]/g, "") // strip tashkeel (diacritics)
    .replace(/[آأإا]/g, "ا") // alef variants → bare alef
    .replace(/ة/g, "ه") // taa marbuta → haa
    .replace(/ى/g, "ي") // alef maqsura → yaa
}
