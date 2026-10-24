import {
  minutesUntilBoardingFromTimestamp,
  pauseCountdown,
  resumeCountdown,
  type BoardingCountdownState,
} from "@/lib/boarding-countdown";

type Running = Extract<BoardingCountdownState, { mode: "countdown"; runState: "running" }>;
type Paused = Extract<BoardingCountdownState, { mode: "countdown"; runState: "paused" }>;

export type RunningCountdownTickResult =
  | {
      kind: "ok";
      minutesUntilBoarding: number;
      boardingStarted: boolean;
    }
  | { kind: "invalid"; code: string };

export function evaluateRunningCountdownTick(
  boardingStartAtIso: string,
  now: Date,
): RunningCountdownTickResult {
  const tick = minutesUntilBoardingFromTimestamp(
    new Date(boardingStartAtIso),
    now,
  );
  if (tick.invalid) {
    return { kind: "invalid", code: tick.code };
  }
  return {
    kind: "ok",
    minutesUntilBoarding: tick.minutesUntilBoarding,
    boardingStarted: tick.boardingStarted,
  };
}

export function safePauseCountdown(
  state: Running,
  now: Date,
): { ok: true; state: Paused } | { ok: false; code: string } {
  try {
    return { ok: true, state: pauseCountdown(state, now) };
  } catch {
    return { ok: false, code: "countdown_pause_failed" };
  }
}

export function safeResumeCountdown(
  state: Paused,
  now: Date,
): { ok: true; state: Running } | { ok: false; code: string } {
  try {
    return { ok: true, state: resumeCountdown(state, now) };
  } catch {
    return { ok: false, code: "countdown_resume_failed" };
  }
}

/** Minutes restored when leaving countdown — never the last live tick. */
export function manualMinutesAfterClear(preservedManualMinutes: number): number {
  return preservedManualMinutes;
}
