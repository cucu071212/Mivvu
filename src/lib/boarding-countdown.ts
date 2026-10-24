/** Local GW-F2 contract types; shared airport.ts additions remain lead-owned. */
export type BoardingCountdownInput = { boardingStartAt: string };

/** Separate run-state members keep Extract<..., { runState: ... }> usable. */
export type BoardingCountdownState =
  | { mode: "manual"; minutesUntilBoarding: number }
  | { mode: "countdown"; boardingStartAt: string; runState: "running" }
  | { mode: "countdown"; boardingStartAt: string; runState: "paused"; pausedRemainingMs: number };

export type BoardingCountdownTick =
  | { minutesUntilBoarding: number; boardingStarted: boolean; invalid: false }
  | { invalid: true; code: string };

type Countdown = Extract<BoardingCountdownState, { mode: "countdown" }>;
type Paused = Extract<Countdown, { runState: "paused" }>;
type Running = Extract<Countdown, { runState: "running" }>;

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;
const DATETIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?$/;

function wallParts(date: Date, utc: boolean): number[] {
  return utc
    ? [date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()]
    : [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
}

function matchesWall(date: Date, parts: readonly number[], utc: boolean): boolean {
  return wallParts(date, utc).every((value, index) => value === parts[index]);
}

/**
 * Strict ISO local datetime or explicit Z/offset; minutes required, seconds optional.
 * Local input uses the runtime timezone. Reject calendar normalization, DST gaps
 * and repeated local times; an explicit offset can disambiguate a repeated hour.
 * Valid past timestamps are accepted for the contract's boarding-started path.
 */
export function parseBoardingStartAt(input: string, now: Date): { boardingStartAt: Date } | { error: string } {
  if (!Number.isFinite(now.getTime())) return { error: "invalid_now" };
  const match = DATETIME.exec(input);
  if (!match) return { error: "invalid_boarding_start" };
  const [, year, month, day, hour, minute, second, fraction, offset] = match;
  const parts = [Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute),
    Number(second ?? 0), Number((fraction ?? "").padEnd(3, "0"))];
  // Validate wall-clock components separately: Date parsing normalizes Feb 30.
  const wall = new Date(0);
  wall.setUTCFullYear(parts[0], parts[1], parts[2]);
  wall.setUTCHours(parts[3], parts[4], parts[5], parts[6]);
  if (!matchesWall(wall, parts, true) || (offset && offset !== "Z" &&
    (Number(offset.slice(1, 3)) > 23 || Number(offset.slice(4)) > 59))) {
    return { error: "invalid_boarding_start" };
  }

  const boardingStartAt = new Date(input);
  if (!offset) {
    if (!matchesWall(boardingStartAt, parts, false)) return { error: "invalid_boarding_start" };
    // Probe either side of a nearby timezone transition. Another offset that
    // yields the same local wall time means this input is ambiguous.
    for (const delta of [-DAY_MS, DAY_MS]) {
      const probeOffset = new Date(boardingStartAt.getTime() + delta).getTimezoneOffset();
      const alternative = new Date(boardingStartAt.getTime() +
        (probeOffset - boardingStartAt.getTimezoneOffset()) * MINUTE_MS);
      if (alternative.getTime() !== boardingStartAt.getTime() && matchesWall(alternative, parts, false)) {
        return { error: "ambiguous_local_time" };
      }
    }
  }
  const tick = minutesUntilBoardingFromTimestamp(boardingStartAt, now);
  return tick.invalid ? { error: tick.code } : { boardingStartAt };
}

/** Absolute timestamp math; the 24-hour future limit is inclusive. No clock reads. */
export function minutesUntilBoardingFromTimestamp(boardingStartAt: Date, now: Date): BoardingCountdownTick {
  if (!Number.isFinite(now.getTime())) return { invalid: true, code: "invalid_now" };
  if (!Number.isFinite(boardingStartAt.getTime())) return { invalid: true, code: "invalid_boarding_start" };
  const remainingMs = boardingStartAt.getTime() - now.getTime();
  if (remainingMs > DAY_MS) return { invalid: true, code: "boarding_start_too_far" };
  return { invalid: false, minutesUntilBoarding: Math.floor(Math.max(0, remainingMs) / MINUTE_MS),
    boardingStarted: remainingMs <= 0 };
}

function assertClock(now: Date): void {
  if (!Number.isFinite(now.getTime())) throw new RangeError("invalid_now");
}

function assertRemaining(remainingMs: number): void {
  if (!Number.isInteger(remainingMs) || remainingMs < 0 || remainingMs > DAY_MS) {
    throw new RangeError("invalid_paused_remaining_ms");
  }
}

/**
 * Capture exact milliseconds, clamped at zero. Repeated pause is idempotent.
 * Invalid transitions throw RangeError because the contract has no error variant.
 */
export function pauseCountdown(state: Countdown, now: Date): Paused {
  assertClock(now);
  if (state.runState === "paused") {
    assertRemaining(state.pausedRemainingMs);
    return { ...state };
  }
  const parsed = parseBoardingStartAt(state.boardingStartAt, now);
  if ("error" in parsed) throw new RangeError(parsed.error);
  return { mode: "countdown", runState: "paused", boardingStartAt: parsed.boardingStartAt.toISOString(),
    pausedRemainingMs: Math.max(0, parsed.boardingStartAt.getTime() - now.getTime()) };
}

/** Resume relative to the supplied clock; paused elapsed time never counts. */
export function resumeCountdown(state: Paused, now: Date): Running {
  assertClock(now);
  assertRemaining(state.pausedRemainingMs);
  const boardingStartAt = new Date(now.getTime() + state.pausedRemainingMs);
  if (!Number.isFinite(boardingStartAt.getTime())) throw new RangeError("invalid_boarding_start");
  return { mode: "countdown", runState: "running", boardingStartAt: boardingStartAt.toISOString() };
}

/** Return manual mode; the caller supplies the stored fallback, including zero. */
export function clearCountdown(fallbackMinutes: number): Extract<BoardingCountdownState, { mode: "manual" }> {
  if (!Number.isInteger(fallbackMinutes) || fallbackMinutes < 0) throw new RangeError("invalid_fallback_minutes");
  return { mode: "manual", minutesUntilBoarding: fallbackMinutes };
}
