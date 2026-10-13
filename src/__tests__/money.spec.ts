import { describe, expect, it } from "vitest";
import {
  formatAmount,
  formatAmountCell,
  formatCompact,
  formatCount,
  formatMoney,
  formatMoneyExact,
  formatStat,
  moneyFigure,
  numberFigure,
  moneySizeClass,
  moneyTitle,
  parseApiNumber,
} from "@/lib/money";

describe("display precision (3 decimals, trimmed)", () => {
  it("shows the full grouped number, never compact notation", () => {
    expect(formatMoney(154_863_047.5)).toBe("154,863,047.5");
  });

  it("trims trailing zeros instead of padding to 3", () => {
    expect(formatMoney(2000)).toBe("2,000");
    expect(formatMoney(2000.5)).toBe("2,000.5");
    expect(formatMoney(2000.25)).toBe("2,000.25");
  });

  it("truncates at 3 decimals rather than rounding", () => {
    // .61092 truncates to .610, then the trailing zero is trimmed.
    expect(formatMoney(311_843.61092)).toBe("311,843.61");
    // Rounding here would give "684,775.920" → trimmed "684,775.92", which
    // both overstates the balance and hides that precision was dropped.
    expect(formatMoney(684_775.91997)).toBe("684,775.919");
  });

  it("truncates toward zero for negatives too", () => {
    expect(formatMoney(-684_775.91997)).toBe("-684,775.919");
  });

  it("never prints a signed zero", () => {
    // -0.0004 truncates to zero at 3 decimals — "-0" would claim a debt.
    expect(formatMoney(-0.0004)).toBe("0");
    expect(formatMoney(-0)).toBe("0");
    expect(formatMoneyExact(-0.000001)).toBe("0");
    // The exact value still carries the sign when it is visible.
    expect(formatMoneyExact(-0.0004)).toBe("-0.0004");
  });
});

describe("exact precision (5 decimals, trimmed)", () => {
  it("reveals the stored precision", () => {
    expect(formatMoneyExact(311_843.61092)).toBe("311,843.61092");
  });

  it("trims rather than padding to 5", () => {
    expect(formatMoneyExact(2000)).toBe("2,000");
    expect(formatMoneyExact(154_863_047.5)).toBe("154,863,047.5");
  });
});

describe("moneyFigure", () => {
  it("flags truncated only when precision is actually hidden", () => {
    expect(moneyFigure(684_775.91997)).toEqual({
      text: "684,775.919",
      exact: "684,775.91997",
      truncated: true,
    });
    expect(moneyFigure(154_863_047.5)).toEqual({
      text: "154,863,047.5",
      exact: "154,863,047.5",
      truncated: false,
    });
    expect(moneyFigure(2000)?.truncated).toBe(false);
  });

  it("accepts the backend's grouped strings", () => {
    expect(moneyFigure("684,775.91997")?.text).toBe("684,775.919");
    expect(moneyFigure("2000.00000")?.text).toBe("2,000");
  });

  it("returns null for non-numbers so callers can render raw text", () => {
    expect(moneyFigure("—")).toBeNull();
    expect(moneyFigure(null)).toBeNull();
    expect(moneyFigure("")).toBeNull();
  });
});

describe("moneyTitle", () => {
  it("is undefined when the hover would repeat what is on screen", () => {
    expect(moneyTitle(2000)).toBeUndefined();
    expect(moneyTitle(154_863_047.5)).toBeUndefined();
    expect(moneyTitle("not a number")).toBeUndefined();
  });

  it("is the exact value when decimals are hidden", () => {
    expect(moneyTitle("684,775.91997")).toBe("684,775.91997");
  });
});

describe("cells", () => {
  it("formatAmount defaults to 3 decimals", () => {
    expect(formatAmount("684775.91997")).toBe("684,775.919");
    expect(formatAmount("684775.91997", 5)).toBe("684,775.91997");
  });

  it("formatAmountCell em-dashes blanks and passes non-numbers through", () => {
    expect(formatAmountCell(null)).toBe("—");
    expect(formatAmountCell("")).toBe("—");
    expect(formatAmountCell("n/a")).toBe("n/a");
    expect(formatAmountCell("2000.00000")).toBe("2,000");
  });

  it("formatCount stays whole", () => {
    expect(formatCount(255_000)).toBe("255,000");
  });
});

describe("formatStat", () => {
  it("never compacts — 10k+ values render in full", () => {
    expect(formatStat(684_775.91997)).toEqual({
      text: "684,775.919",
      unit: "",
      exact: "684,775.91997",
      truncated: true,
    });
    expect(formatStat(154_863_047.5)?.text).toBe("154,863,047.5");
  });

  it("returns null for non-numbers", () => {
    expect(formatStat("—")).toBeNull();
  });
});

describe("formatCompact stays for chart axes", () => {
  it("still compacts ticks", () => {
    expect(formatCompact(6_200_000)).toBe("6.2M");
    expect(formatCompact(214_500)).toBe("214.5K");
  });
});

describe("moneySizeClass", () => {
  it("steps down as the digit run grows", () => {
    expect(moneySizeClass("2,000", "hero")).toBe("text-3xl");
    expect(moneySizeClass("311,843.6", "hero")).toBe("text-3xl");
    expect(moneySizeClass("311,843.611", "hero")).toBe("text-2xl");
    // The canonical worst case is 13 chars — it still gets the mid tier.
    expect(moneySizeClass("154,863,047.5", "hero")).toBe("text-2xl");
    expect(moneySizeClass("1,154,863,047.5", "hero")).toBe("text-xl");
  });

  it("has its own ramp per size", () => {
    expect(moneySizeClass("2,000", "md")).toBe("text-xl");
    expect(moneySizeClass("2,000", "stat")).toBe("text-2xl");
    expect(moneySizeClass("154,863,047.5", "stat")).toBe("text-xl");
    expect(moneySizeClass("154,863,047.5", "md")).toBe("text-lg");
    expect(moneySizeClass("1,154,863,047.5", "md")).toBe("text-base");
    expect(moneySizeClass("1,154,863,047.5", "sm")).toBe("text-xs");
  });
});

describe("numberFigure", () => {
  it("is total for numbers, so widgets need no null check", () => {
    expect(numberFigure(684_775.91997).text).toBe("684,775.919");
  });

  it("reads a non-finite value as 0 instead of throwing", () => {
    expect(numberFigure(Number.NaN).text).toBe("0");
    expect(numberFigure(Number.POSITIVE_INFINITY).text).toBe("0");
  });
});

describe("parseApiNumber", () => {
  it("handles numbers, grouped strings and junk", () => {
    expect(parseApiNumber(12)).toBe(12);
    expect(parseApiNumber("311,843.61092")).toBe(311_843.61092);
    expect(parseApiNumber("abc")).toBeNull();
    expect(parseApiNumber(Number.NaN)).toBeNull();
  });
});
