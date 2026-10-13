/// <reference types="node" />
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatDateTime,
  dayKey,
  formatDateYmd,
  formatLocalDateYmd,
  formatTimeAgo,
  formatTimeHm,
  formatTimeHms,
} from "@/lib/datetime";

describe("datetime helpers", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("formatDateYmd uses slashes and empties to em dash", () => {
    expect(formatDateYmd("2025-06-12T15:36:00Z")).toBe("2025/06/12");
    expect(formatDateYmd("2025-06-12 15:36:00")).toBe("2025/06/12");
    expect(formatDateYmd(null)).toBe("—");
    expect(formatDateYmd(undefined)).toBe("—");
  });

  it("formatDateTime keeps date + HH:mm", () => {
    expect(formatDateTime("2025-06-12T15:36:00.000000Z")).toBe("2025/06/12 15:36");
    expect(formatDateTime("2025-06-12 15:36:00")).toBe("2025/06/12 15:36");
    expect(formatDateTime("")).toBe("—");
  });

  it("formatTimeHm pulls HH:mm", () => {
    expect(formatTimeHm("2025-06-12 09:14:00")).toBe("09:14");
    expect(formatTimeHm("2025-06-12T09:14:00Z")).toBe("09:14");
    expect(formatTimeHm("09:14")).toBe("09:14");
    expect(formatTimeHm(null)).toBe("—");
  });

  it("formatTimeHms keeps the seconds the receipt is reconciled by", () => {
    expect(formatTimeHms("2025-06-12 09:14:07")).toBe("09:14:07");
    expect(formatTimeHms("2025-06-12T09:14:07Z")).toBe("09:14:07");
    // No seconds in the stamp is not a receipt-grade time — dash, never a guess.
    expect(formatTimeHms("2025-06-12 09:14")).toBe("—");
    expect(formatTimeHms(null)).toBe("—");
  });

  it("formatTimeAgo localizes relative phrases", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-12T15:36:00Z"));
    expect(formatTimeAgo("2025-06-12T14:36:00Z", "en")).toMatch(/hour/i);
    expect(formatTimeAgo("2025-06-11T15:36:00Z", "en")).toMatch(/yesterday|day/i);
    expect(formatTimeAgo(null, "ar")).toBe("—");
    expect(formatTimeAgo("not-a-date", "en")).toBe("—");
  });
});

/**
 * A chart parses the API's day string as LOCAL midnight; rendering it through
 * toISOString() shifted it back a day for any positive UTC offset, so a
 * Tripoli user saw 2026/07/27 on the point the API returned as 2026-07-28.
 */
describe("formatLocalDateYmd", () => {
  const withTz = (tz: string, run: () => void) => {
    const original = process.env.TZ;
    process.env.TZ = tz;
    try {
      run();
    } finally {
      process.env.TZ = original;
    }
  };

  it("keeps the calendar day east of UTC, where the UTC round-trip lost one", () => {
    withTz("Africa/Tripoli", () => {
      const parsedAsChartsDo = new Date("2026-07-28T00:00:00");
      expect(formatLocalDateYmd(parsedAsChartsDo)).toBe("2026/07/28");
      // The old implementation, for contrast:
      expect(parsedAsChartsDo.toISOString().slice(0, 10)).toBe("2026-07-27");
    });
  });

  it("keeps the calendar day west of UTC too", () => {
    withTz("America/New_York", () => {
      expect(formatLocalDateYmd(new Date("2026-07-28T00:00:00"))).toBe("2026/07/28");
    });
  });

  it("accepts a timestamp and pads single digits", () => {
    expect(formatLocalDateYmd(new Date(2026, 0, 5).getTime())).toBe("2026/01/05");
  });

  it("renders a dash for empty or invalid input", () => {
    expect(formatLocalDateYmd(null)).toBe("—");
    expect(formatLocalDateYmd(undefined)).toBe("—");
    expect(formatLocalDateYmd(new Date("nope"))).toBe("—");
  });
});

describe("dayKey", () => {
  it("returns the calendar day (YYYY-MM-DD) as the API wrote it", () => {
    expect(dayKey("2026-10-05T23:30:00Z")).toBe("2026-10-05");
    expect(dayKey("2026-10-05 08:00:00")).toBe("2026-10-05");
    expect(dayKey("2026-10-05")).toBe("2026-10-05");
  });

  it("empties to an empty key", () => {
    expect(dayKey("")).toBe("");
    expect(dayKey(null)).toBe("");
    expect(dayKey(undefined)).toBe("");
  });
});
