import type { BoardingCountdownState } from "@/lib/boarding-countdown";
import { evaluateRunningCountdownTick } from "@/lib/boarding-countdown-ui";

type Running = Extract<
  BoardingCountdownState,
  { mode: "countdown"; runState: "running" }
>;

export type RunningTickOutcome =
  | { kind: "noop" }
  | {
      kind: "ok";
      minutesUntilBoarding: number;
      boardingStarted: boolean;
    }
  | { kind: "invalid"; code: string; lastBaselineMinutes: number };

/**
 * Single device-clock tick for an active running countdown.
 * Used by the countdown UI interval (stable deps; reads latest state via ref).
 */
export function runRunningCountdownTick(
  state: BoardingCountdownState,
  now: Date,
  lastBaselineMinutes: number,
): RunningTickOutcome {
  if (state.mode !== "countdown" || state.runState !== "running") {
    return { kind: "noop" };
  }
  const running = state as Running;
  const result = evaluateRunningCountdownTick(running.boardingStartAt, now);
  if (result.kind === "invalid") {
    return {
      kind: "invalid",
      code: result.code,
      lastBaselineMinutes,
    };
  }
  return {
    kind: "ok",
    minutesUntilBoarding: result.minutesUntilBoarding,
    boardingStarted: result.boardingStarted,
  };
}
