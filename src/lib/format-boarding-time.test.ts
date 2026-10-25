import { describe, expect, it } from "vitest";
import { formatBoardingStartLabel } from "@/lib/format-boarding-time";

describe("formatBoardingStartLabel", () => {
  it("formats ISO times with a stable en-US pattern", () => {
    const label = formatBoardingStartLabel("2026-10-24T18:30:00.000Z");
    expect(label).toMatch(/2026/);
    expect(label).toMatch(/:/);
  });

  it("returns a clear label for invalid input", () => {
    expect(formatBoardingStartLabel("not-a-date")).toBe("Invalid boarding time");
  });
});
