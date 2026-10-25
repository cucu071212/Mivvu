import { describe, expect, it, vi } from "vitest";
import type { BoardingCountdownState } from "@/lib/boarding-countdown";
import {
  advanceTickMemory,
  freshTickMemory,
  runRunningCountdownTick,
} from "@/lib/running-countdown-tick";

function running(start: Date): BoardingCountdownState {
  return {
    mode: "countdown",
    runState: "running",
    boardingStartAt: start.toISOString(),
  };
}

describe("runRunningCountdownTick", () => {
  it("returns noop when not in running countdown mode", () => {
    expect(
      runRunningCountdownTick(
        { mode: "manual", minutesUntilBoarding: 40 },
        new Date(),
        freshTickMemory(40),
      ),
    ).toEqual({ kind: "noop" });
  });

  it("ticks without invalidating when boarding start is valid", () => {
    const now = new Date("2026-10-24T18:00:00");
    const start = new Date("2026-10-24T18:30:00");
    expect(
      runRunningCountdownTick(running(start), now, freshTickMemory(25)),
    ).toEqual({
      kind: "ok",
      minutesUntilBoarding: 30,
      boardingStarted: false,
    });
  });

  it("surfaces boarding started at zero remaining", () => {
    const now = new Date("2026-10-24T18:30:00");
    const start = new Date("2026-10-24T18:29:30");
    expect(
      runRunningCountdownTick(running(start), now, freshTickMemory(1)),
    ).toMatchObject({
      kind: "ok",
      minutesUntilBoarding: 0,
      boardingStarted: true,
    });
  });

  it("returns invalid with last baseline minutes for discontinuity handling", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-24T18:00:00"));
    const outcome = runRunningCountdownTick(
      running(new Date("2026-10-26T18:00:00")),
      new Date(),
      freshTickMemory(12),
    );
    vi.useRealTimers();
    expect(outcome).toEqual({
      kind: "invalid",
      code: "boarding_start_too_far",
      lastBaselineMinutes: 12,
    });
  });

  it("reports clock_moved_backward when the clock rolls back after expiry", () => {
    const start = new Date("2026-10-24T18:01:00");
    const expiredAt = new Date("2026-10-24T18:02:00");
    const expiredOutcome = runRunningCountdownTick(
      running(start),
      expiredAt,
      freshTickMemory(1),
    );
    expect(expiredOutcome).toMatchObject({ kind: "ok", boardingStarted: true });
    if (expiredOutcome.kind !== "ok") throw new Error("expected ok");
    const memory = advanceTickMemory(expiredOutcome, expiredAt);

    const rolledBack = new Date("2026-10-24T17:12:00");
    expect(runRunningCountdownTick(running(start), rolledBack, memory)).toEqual({
      kind: "invalid",
      code: "clock_moved_backward",
      lastBaselineMinutes: 0,
    });
  });

  it("keeps expiry latched at zero even if computed remaining time reappears", () => {
    const start = new Date("2026-10-24T18:01:00");
    const memory = {
      lastBaselineMinutes: 0,
      lastTickAtMs: new Date("2026-10-24T18:01:03").getTime(),
      expired: true,
    };
    // 2 s backward stays within jitter tolerance and must not revive the baseline.
    const jitter = new Date("2026-10-24T18:01:01").getTime() - 61_000;
    expect(
      runRunningCountdownTick(
        running(start),
        new Date(jitter),
        { ...memory, lastTickAtMs: jitter + 2_000 },
      ),
    ).toEqual({ kind: "ok", minutesUntilBoarding: 0, boardingStarted: true });
  });

  it("never increases minutes between ticks for small backward jitter", () => {
    const start = new Date("2026-10-24T18:30:00");
    const memory = {
      lastBaselineMinutes: 29,
      lastTickAtMs: new Date("2026-10-24T18:00:03").getTime(),
      expired: false,
    };
    expect(
      runRunningCountdownTick(
        running(start),
        new Date("2026-10-24T18:00:00"),
        memory,
      ),
    ).toEqual({ kind: "ok", minutesUntilBoarding: 29, boardingStarted: false });
  });
});
