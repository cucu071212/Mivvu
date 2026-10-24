import { describe, expect, it } from "vitest";
import {
  evaluateRunningCountdownTick,
  manualMinutesAfterClear,
  safePauseCountdown,
} from "./boarding-countdown-ui";

describe("boarding countdown UI session", () => {
  it("flags boarding start beyond 24 hours as invalid", () => {
    const now = new Date("2026-10-24T12:00:00");
    const far = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();
    const result = evaluateRunningCountdownTick(far, now);
    expect(result).toEqual({ kind: "invalid", code: "boarding_start_too_far" });
  });

  it("returns live minutes for a valid running countdown", () => {
    const now = new Date("2026-10-24T12:00:00");
    const start = new Date(now.getTime() + 50 * 60 * 1000).toISOString();
    const result = evaluateRunningCountdownTick(start, now);
    expect(result).toEqual({
      kind: "ok",
      minutesUntilBoarding: 50,
      boardingStarted: false,
    });
  });

  it("does not throw when pause fails on corrupt stored timestamp", () => {
    const state = {
      mode: "countdown" as const,
      runState: "running" as const,
      boardingStartAt: "not-a-real-iso",
    };
    const result = safePauseCountdown(state, new Date("2026-10-24T12:00:00"));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("countdown_pause_failed");
    }
  });

  it("restores preserved manual minutes on clear, not the last tick", () => {
    expect(manualMinutesAfterClear(50)).toBe(50);
    expect(manualMinutesAfterClear(50)).not.toBe(49);
  });
});
