// Libyan mobile helpers. Contract: numbers are
// entered as "09xxxxxxxx" — 10 digits on the 091–095 carriers. Normalizing only
// strips separators; it never adds or drops the leading zero or a country code.
import { describe, it, expect } from "vitest";
import { isLibyanPhone, normalizeLibyanPhone } from "@/lib/phone";

describe("normalizeLibyanPhone", () => {
  it("keeps a clean local number as-is", () => {
    expect(normalizeLibyanPhone("0912345678")).toBe("0912345678");
  });

  it("strips spaces, dashes and other separators", () => {
    expect(normalizeLibyanPhone("091 234 5678")).toBe("0912345678");
    expect(normalizeLibyanPhone("092-345-6789")).toBe("0923456789");
    expect(normalizeLibyanPhone("(094) 555.1234")).toBe("0945551234");
  });

  it("does not add or rewrite a country code", () => {
    expect(normalizeLibyanPhone("+218 91 234 5678")).toBe("218912345678");
  });
});

describe("isLibyanPhone", () => {
  it("accepts 10 digits on every known carrier prefix", () => {
    for (const prefix of ["091", "092", "093", "094", "095"]) {
      expect(isLibyanPhone(`${prefix}1234567`)).toBe(true);
    }
  });

  it("accepts separated input", () => {
    expect(isLibyanPhone("091 234 5678")).toBe(true);
  });

  it("rejects unknown prefixes", () => {
    expect(isLibyanPhone("0961234567")).toBe(false);
    expect(isLibyanPhone("0211234567")).toBe(false);
  });

  it("rejects the wrong length, including the country-code form", () => {
    expect(isLibyanPhone("091234567")).toBe(false);
    expect(isLibyanPhone("09123456789")).toBe(false);
    expect(isLibyanPhone("218912345678")).toBe(false);
    expect(isLibyanPhone("")).toBe(false);
  });
});
