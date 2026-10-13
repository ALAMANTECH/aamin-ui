// Digit normalization and typed-input cleanup (Arabic digits, invisible marks).
import { describe, it, expect } from "vitest";
import { cleanTyped, toLatinDigits } from "@/lib/digits";

describe("digits", () => {
  it("cleans a typed number of marks, Arabic digits and outer spaces", () => {
    expect(cleanTyped(" \u200f٧٦٣٦٩٧٨\u2069 ")).toBe("7636978");
    expect(cleanTyped("\ufeff12\u061c34")).toBe("1234");
    expect(cleanTyped("AB CD")).toBe("AB CD");
  });

  it("converts both Arabic digit ranges to ASCII", () => {
    expect(toLatinDigits("٠١٢٣٤٥٦٧٨٩ ۰۱۲۳۴۵۶۷۸۹ 42")).toBe("0123456789 0123456789 42");
  });
});
