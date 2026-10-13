// amountInArabicWords: an amount spelled out in Arabic words.
import { describe, it, expect } from "vitest";
import writtenNumber from "written-number";
import { amountInArabicWords } from "@/lib/number-words";

describe("amountInArabicWords", () => {
  it("spells a whole amount with the currency only", () => {
    expect(amountInArabicWords(100, "جنيه", "قرش")).toBe("مائة جنيه");
  });

  it("adds the fraction in the subunit", () => {
    expect(amountInArabicWords(1500.5, "جنيه", "قرش")).toBe("ألف وخمسمائة جنيه و خمسون قرش");
  });

  it("pads a short fraction and cuts a long one — never rounds", () => {
    // 0.7 is seventy of a hundred, not seven.
    expect(amountInArabicWords(33.7, "جنيه", "قرش")).toBe("ثلاثة وثلاثون جنيه و سبعون قرش");
    // .999 → 99, the way production has always read it.
    expect(amountInArabicWords(12.999, "جنيه", "قرش")).toBe("إثنا عشر جنيه و تسعة وتسعون قرش");
  });

  it("takes the provider's placeholder subunit as given", () => {
    expect(amountInArabicWords(20.25, "سيفا", "-")).toBe("عشرون سيفا و خمسة وعشرون -");
  });

  it("accepts a string amount and a 3-digit subunit (dinar/dirham)", () => {
    expect(amountInArabicWords("1250", "دينار", "درهم")).toBe(
      amountInArabicWords(1250, "دينار", "درهم"),
    );
    expect(amountInArabicWords("5.125", "دينار", "درهم", 3)).toMatch(/^خمسة دينار و .+ درهم$/);
  });
});

describe("amountInArabicWords — API string shapes", () => {
  const ar = (n: number) => writtenNumber(n, { lang: "ar" });

  it("reads a grouped API string as the whole amount, not its first group", () => {
    expect(amountInArabicWords("311,843.61092", "دينار", "درهم")).toBe(
      `${ar(311843)} دينار و ${ar(61)} درهم`,
    );
  });

  it("gives a storage-padded whole amount no fraction clause", () => {
    expect(amountInArabicWords("2000.00000", "دينار", "درهم")).toBe(`${ar(2000)} دينار`);
    expect(amountInArabicWords("2000.00000", "دينار", "درهم")).toBe(
      amountInArabicWords(2000, "دينار", "درهم"),
    );
  });

  it("returns an empty string for negatives and non-numbers", () => {
    expect(amountInArabicWords(-5.5, "دينار", "درهم")).toBe("");
    expect(amountInArabicWords("-5.5", "دينار", "درهم")).toBe("");
    expect(amountInArabicWords("abc", "دينار", "درهم")).toBe("");
    expect(amountInArabicWords("", "دينار", "درهم")).toBe("");
    expect(amountInArabicWords(Number.NaN, "دينار", "درهم")).toBe("");
  });
});
