import { describe, expect, it } from "vitest";
import { manualMinutesAfterClear } from "@/lib/boarding-countdown-ui";
import {
  acceptedMinutesUntilBoardingFromDraft,
  nextPreservedManualMinutes,
} from "@/lib/preserved-manual-minutes";

const DEFAULT_BUFFER = "10";

function applyMinutesDraft(
  preserved: number,
  draft: string,
  buffer = DEFAULT_BUFFER,
): number {
  const accepted = acceptedMinutesUntilBoardingFromDraft(draft, buffer);
  return accepted === undefined ? preserved : accepted;
}

describe("acceptedMinutesUntilBoardingFromDraft", () => {
  it("accepts valid integer minutes", () => {
    expect(acceptedMinutesUntilBoardingFromDraft("60", DEFAULT_BUFFER)).toBe(60);
  });

  it("rejects fractional drafts such as 12.5 (parseInt would wrongly accept 12)", () => {
    expect(acceptedMinutesUntilBoardingFromDraft("12.5", DEFAULT_BUFFER)).toBeUndefined();
  });
});

function syncPreservedWhenManualValid(
  preserved: number,
  minutesDraft: string,
  bufferDraft: string,
): number {
  return nextPreservedManualMinutes(preserved, minutesDraft, bufferDraft);
}

describe("preserved manual minutes when buffer is corrected after minutes edit", () => {
  it("updates preserved to 60 after invalid buffer is fixed (50 → invalid buffer → 60 → buffer 10)", () => {
    let preserved = syncPreservedWhenManualValid(50, "50", "10");
    expect(preserved).toBe(50);

    preserved = syncPreservedWhenManualValid(preserved, "50", "x");
    expect(preserved).toBe(50);

    preserved = syncPreservedWhenManualValid(preserved, "60", "x");
    expect(preserved).toBe(50);

    preserved = syncPreservedWhenManualValid(preserved, "60", "10");
    expect(preserved).toBe(60);

    expect(manualMinutesAfterClear(preserved)).toBe(60);
  });
});

describe("preserved manual minutes through invalid draft and countdown clear", () => {
  it("keeps last accepted value when draft becomes invalid, then clear restores it", () => {
    let preserved = applyMinutesDraft(50, "60");
    expect(preserved).toBe(60);

    preserved = applyMinutesDraft(preserved, "12.5");
    expect(preserved).toBe(60);

    const afterCountdownClear = manualMinutesAfterClear(preserved);
    expect(afterCountdownClear).toBe(60);
  });
});
