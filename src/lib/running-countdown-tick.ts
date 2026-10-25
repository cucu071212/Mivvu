import type { BoardingCountdownState } from "@/lib/boarding-countdown";
import { evaluateRunningCountdownTick } from "@/lib/boarding-countdown-ui";

/** Backward clock jumps larger than this stop the countdown as untrustworthy. */
export const CLOCK_ROLLBACK_TOLERANCE_MS = 5_000;

export type RunningTickMemory = {
  lastBaselineMinutes: number;
  /** Latest device time observed by accepted ticks; null right after start/resume. */
  lastTickAtMs: number | null;
  /** Latched once boarding start is reached; never un-expires for this countdown. */
  expired: boolean;
};

export type RunningTickOutcome =
  | { kind: "noop" }
  | {
      kind: "ok";
      minutesUntilBoarding: number;
      boardingStarted: boolean;
    }
  | { kind: "invalid"; code: string; lastBaselineMinutes: number };

export function freshTickMemory(lastBaselineMinutes: number): RunningTickMemory {
  return { lastBaselineMinutes, lastTickAtMs: null, expired: false };
}

/**
 * Single device-clock tick for an active running countdown.
 * Minutes never increase between accepted ticks, expiry is latched, and a
 * backward clock jump beyond tolerance is reported as `clock_moved_backward`.
 */
export function runRunningCountdownTick(
  state: BoardingCountdownState,
  now: Date,
  memory: RunningTickMemory,
): RunningTickOutcome {
  if (state.mode !== "countdown" || state.runState !== "running") {
    return { kind: "noop" };
  }
  const nowMs = now.getTime();
  if (
    memory.lastTickAtMs !== null &&
    Number.isFinite(nowMs) &&
    nowMs < memory.lastTickAtMs - CLOCK_ROLLBACK_TOLERANCE_MS
  ) {
    return {
      kind: "invalid",
      code: "clock_moved_backward",
      lastBaselineMinutes: memory.lastBaselineMinutes,
    };
  }
  const result = evaluateRunningCountdownTick(state.boardingStartAt, now);
  if (result.kind === "invalid") {
    return {
      kind: "invalid",
      code: result.code,
      lastBaselineMinutes: memory.lastBaselineMinutes,
    };
  }
  if (memory.expired || result.boardingStarted) {
    return { kind: "ok", minutesUntilBoarding: 0, boardingStarted: true };
  }
  const minutesUntilBoarding =
    memory.lastTickAtMs === null
      ? result.minutesUntilBoarding
      : Math.min(result.minutesUntilBoarding, memory.lastBaselineMinutes);
  return { kind: "ok", minutesUntilBoarding, boardingStarted: false };
}

/** Memory after an accepted tick (callers keep it in a ref). */
export function advanceTickMemory(
  outcome: Extract<RunningTickOutcome, { kind: "ok" }>,
  now: Date,
  previous: RunningTickMemory,
): RunningTickMemory {
  return {
    lastBaselineMinutes: outcome.minutesUntilBoarding,
    // Retain the high-water time so repeated small rollbacks cannot reset
    // the tolerance window and keep a stale recommendation budget alive.
    lastTickAtMs: Math.max(now.getTime(), previous.lastTickAtMs ?? now.getTime()),
    expired: outcome.boardingStarted,
  };
}
