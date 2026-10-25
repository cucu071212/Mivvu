import { describe, expect, it, vi } from "vitest";
import { runRunningCountdownTick } from "@/lib/running-countdown-tick";

describe("runRunningCountdownTick", () => {
  it("returns noop when not in running countdown mode", () => {
    expect(
      runRunningCountdownTick(
        { mode: "manual", minutesUntilBoarding: 40 },
        new Date(),
        40,
      ),
    ).toEqual({ kind: "noop" });
  });

  it("ticks without invalidating when boarding start is valid", () => {
    const now = new Date("2026-10-24T18:00:00");
    const start = new Date("2026-10-24T18:30:00");
    const outcome = runRunningCountdownTick(
      {
        mode: "countdown",
        runState: "running",
        boardingStartAt: start.toISOString(),
      },
      now,
      25,
    );
    expect(outcome).toEqual({
      kind: "ok",
      minutesUntilBoarding: 30,
      boardingStarted: false,
    });
  });

  it("surfaces boarding started at zero remaining", () => {
    const now = new Date("2026-10-24T18:30:00");
    const start = new Date("2026-10-24T18:29:30");
    const outcome = runRunningCountdownTick(
      {
        mode: "countdown",
        runState: "running",
        boardingStartAt: start.toISOString(),
      },
      now,
      1,
    );
    expect(outcome).toMatchObject({
      kind: "ok",
      minutesUntilBoarding: 0,
      boardingStarted: true,
    });
  });

  it("returns invalid with last baseline minutes for discontinuity handling", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-24T18:00:00"));
    const outcome = runRunningCountdownTick(
      {
        mode: "countdown",
        runState: "running",
        boardingStartAt: new Date("2026-10-26T18:00:00").toISOString(),
      },
      new Date(),
      12,
    );
    vi.useRealTimers();
    expect(outcome).toEqual({
      kind: "invalid",
      code: "boarding_start_too_far",
      lastBaselineMinutes: 12,
    });
  });
});
