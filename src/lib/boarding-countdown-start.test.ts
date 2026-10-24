import { describe, expect, it } from "vitest";

/** Mirrors BoardingCountdownControls start guard (no silent default datetime). */
export function canStartCountdownWithDatetime(datetimeLocal: string): boolean {
  return datetimeLocal.trim() !== "";
}

describe("countdown start validation", () => {
  it("rejects empty boarding datetime", () => {
    expect(canStartCountdownWithDatetime("")).toBe(false);
    expect(canStartCountdownWithDatetime("   ")).toBe(false);
  });

  it("accepts an explicit local datetime", () => {
    expect(canStartCountdownWithDatetime("2026-10-24T15:30")).toBe(true);
  });
});
