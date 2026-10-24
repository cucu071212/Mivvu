import { describe, expect, expectTypeOf, it } from "vitest";
import {
  parseBoardingStartAt, minutesUntilBoardingFromTimestamp,
  pauseCountdown, resumeCountdown, clearCountdown,
  type BoardingCountdownState, type BoardingCountdownTick,
} from "./boarding-countdown";

const now = new Date("2026-10-24T12:00:00.000Z");
const running = Object.freeze({ mode: "countdown", runState: "running",
  boardingStartAt: "2026-10-24T12:10:30.500Z" } as const);
const localNow = new Date(2026, 9, 24, 12, 0);

function parsed(input: string, clock: Date = now): Date {
  const result = parseBoardingStartAt(input, clock);
  if ("error" in result) throw new Error(result.error);
  return result.boardingStartAt;
}

describe("parseBoardingStartAt", () => {
  it("accepts local datetime input in the runtime timezone", () => {
    expect(parsed("2026-10-24T12:30", localNow).getTime())
      .toBe(new Date(2026, 9, 24, 12, 30).getTime());
  });

  it.each([
    ["2026-10-24T12:30:00Z", "2026-10-24T12:30:00.000Z"],
    ["2026-10-24T08:30-04:00", "2026-10-24T12:30:00.000Z"],
    ["2026-10-24T18:00:01.125+05:30", "2026-10-24T12:30:01.125Z"],
  ])("accepts explicit timezone %s", (input, expected) => {
    expect(parsed(input).toISOString()).toBe(expected);
  });

  it.each(["2026-10-24T12:00:00Z", "2026-10-25T12:00:00Z", "2026-10-23T12:00:00Z"])(
    "accepts exact now, 24-hour boundary and past timestamp %s", (input) => {
      expect(parsed(input).toISOString()).toBe(new Date(input).toISOString());
    },
  );

  it("rejects more than 24 absolute hours, including one millisecond over", () => {
    expect(parseBoardingStartAt("2026-10-25T12:00:00.001Z", now)).toEqual({ error: "boarding_start_too_far" });
  });

  it.each(["", " ", "tomorrow", "2026-10-24", "10/24/2026 12:30", "2026-02-30T12:00",
    "2026-13-01T12:00", "2026-10-24T24:00", "2026-10-24T12:60", "2026-10-24T12:30:60Z",
    "2026-10-24T12:30+24:00", "2026-10-24T12:30+01:60", "2026-10-24T12:30Zjunk",
    "2026-10-24T12:30:00.1234Z", " 2026-10-24T12:30Z ", "2025-02-29T12:00Z"])(
    "rejects malformed or normalized-invalid calendar input %s", (input) => {
      expect(parseBoardingStartAt(input, now)).toEqual({ error: "invalid_boarding_start" });
    },
  );

  it("accepts valid leap day and local midnight across dates", () => {
    expect(parsed("2028-02-29T00:10Z", new Date("2028-02-28T23:50Z")).toISOString()).toBe("2028-02-29T00:10:00.000Z");
    expect(parsed("2026-10-25T00:10", new Date(2026, 9, 24, 23, 50)).getTime()).toBe(new Date(2026, 9, 25, 0, 10).getTime());
  });

  it("rejects an invalid clock and preserves input dates", () => {
    expect(parseBoardingStartAt("2026-10-24T12:30Z", new Date(NaN))).toEqual({ error: "invalid_now" });
    const before = now.getTime();
    const result = parsed("2026-10-24T12:30Z");
    result.setTime(0);
    expect(now.getTime()).toBe(before);
  });
});

describe("minutesUntilBoardingFromTimestamp", () => {
  it.each([
    [1_800_000, 30, false], [90_000, 1, false], [60_000, 1, false],
    [59_999, 0, false], [1, 0, false], [0, 0, true], [-1, 0, true],
    [-86_400_001, 0, true], [86_400_000, 1440, false],
  ])("floors/clamps %s milliseconds", (remaining, minutes, started) => {
    const result = minutesUntilBoardingFromTimestamp(new Date(now.getTime() + remaining), now);
    expectTypeOf(result).toEqualTypeOf<BoardingCountdownTick>();
    expect(result).toEqual({ invalid: false, minutesUntilBoarding: minutes, boardingStarted: started });
  });

  it("rejects dates outside the 24-hour future window", () => {
    expect(minutesUntilBoardingFromTimestamp(new Date(now.getTime() + 86_400_001), now))
      .toEqual({ invalid: true, code: "boarding_start_too_far" });
  });

  it.each([
    [new Date(NaN), now, "invalid_boarding_start"],
    [now, new Date(NaN), "invalid_now"],
  ])("rejects invalid dates", (boarding, clock, code) => {
    expect(minutesUntilBoardingFromTimestamp(boarding, clock)).toEqual({ invalid: true, code });
  });

  it("uses absolute timestamps across midnight and offsets without mutating dates", () => {
    const clock = new Date("2026-10-24T23:50:00-04:00");
    const boarding = new Date("2026-10-25T00:10:00-04:00");
    expect(minutesUntilBoardingFromTimestamp(boarding, clock)).toEqual({ invalid: false, minutesUntilBoarding: 20, boardingStarted: false });
    expect(clock.toISOString()).toBe("2026-10-25T03:50:00.000Z");
    expect(boarding.toISOString()).toBe("2026-10-25T04:10:00.000Z");
  });
});

describe("pause, resume and clear", () => {
  it("freezes exact remaining milliseconds and ignores elapsed paused time", () => {
    const paused = pauseCountdown(running, now);
    expect(paused).toEqual({ ...running, runState: "paused", pausedRemainingMs: 630_500 });
    expect(pauseCountdown(Object.freeze(paused), new Date("2026-10-24T12:05Z"))).toEqual(paused);
    const resumed = resumeCountdown(paused, new Date("2026-10-24T12:05Z"));
    expect(resumed).toEqual({ mode: "countdown", runState: "running", boardingStartAt: "2026-10-24T12:15:30.500Z" });
    expect(minutesUntilBoardingFromTimestamp(new Date(resumed.boardingStartAt), new Date("2026-10-24T12:06Z")))
      .toEqual({ invalid: false, minutesUntilBoarding: 9, boardingStarted: false });
    expect(running.boardingStartAt).toBe("2026-10-24T12:10:30.500Z");
    expect(paused.pausedRemainingMs).toBe(630_500);
    expectTypeOf(paused).toMatchTypeOf<Extract<BoardingCountdownState, { runState: "paused" }>>();
    expectTypeOf(resumed).toMatchTypeOf<Extract<BoardingCountdownState, { runState: "running" }>>();
  });

  it("repeated pause/resume cycles preserve sub-minute precision", () => {
    const first = pauseCountdown(running, now);
    const resumed = resumeCountdown(first, new Date("2026-10-25T12:00Z"));
    const second = pauseCountdown(resumed, new Date("2026-10-25T12:00:30Z"));
    expect(second.pausedRemainingMs).toBe(600_500);
    expect(resumeCountdown(second, new Date("2026-10-26T23:59Z")).boardingStartAt).toBe("2026-10-27T00:09:00.500Z");
  });

  it.each(["2026-10-24T12:10:30.500Z", "2026-10-24T13:00Z"])("pauses an expired countdown at zero", (clock) => {
    const paused = pauseCountdown(running, new Date(clock));
    expect(paused.pausedRemainingMs).toBe(0);
    expect(resumeCountdown(paused, now).boardingStartAt).toBe(now.toISOString());
  });

  it("rejects invalid state transitions using RangeError without changing state", () => {
    expect(() => pauseCountdown(running, new Date(NaN))).toThrow(RangeError);
    expect(() => pauseCountdown({ ...running, boardingStartAt: "bad" }, now)).toThrow(RangeError);
    expect(() => pauseCountdown({ ...running, boardingStartAt: "2026-10-26T12:00Z" }, now)).toThrow(RangeError);
    const paused = pauseCountdown(running, now);
    expect(() => resumeCountdown(paused, new Date(NaN))).toThrow(RangeError);
    for (const remaining of [-1, NaN, Infinity, 0.5, 86_400_001]) {
      expect(() => resumeCountdown({ ...paused, pausedRemainingMs: remaining }, now)).toThrow(RangeError);
    }
  });

  it.each([0, 35, 1500])("clears to the caller's manual fallback %s", (minutes) => {
    expect(clearCountdown(minutes)).toEqual({ mode: "manual", minutesUntilBoarding: minutes });
  });
  it.each([-1, 0.5, NaN, Infinity])("rejects invalid manual fallback %s", (minutes) => {
    expect(() => clearCountdown(minutes)).toThrow(RangeError);
  });
});

const inNewYork = Intl.DateTimeFormat().resolvedOptions().timeZone === "America/New_York";
describe.skipIf(!inNewYork)("DST in America/New_York (run with TZ=America/New_York)", () => {
  it("rejects nonexistent spring-forward local times", () => {
    expect(parseBoardingStartAt("2026-03-08T02:30", new Date("2026-03-08T00:00-05:00")))
      .toEqual({ error: "invalid_boarding_start" });
  });
  it("rejects ambiguous fall-back local times but accepts explicit offsets", () => {
    const clock = new Date("2026-11-01T00:00-04:00");
    expect(parseBoardingStartAt("2026-11-01T01:30", clock)).toEqual({ error: "ambiguous_local_time" });
    expect(parsed("2026-11-01T01:30-04:00", clock).toISOString()).toBe("2026-11-01T05:30:00.000Z");
    expect(parsed("2026-11-01T01:30-05:00", clock).toISOString()).toBe("2026-11-01T06:30:00.000Z");
  });
  it("uses absolute elapsed hours across both DST transitions", () => {
    expect(minutesUntilBoardingFromTimestamp(new Date("2026-03-08T03:30-04:00"), new Date("2026-03-08T01:30-05:00")))
      .toEqual({ invalid: false, minutesUntilBoarding: 60, boardingStarted: false });
    expect(parseBoardingStartAt("2026-11-02T00:00", new Date("2026-11-01T00:00-04:00")))
      .toEqual({ error: "boarding_start_too_far" });
    expect(minutesUntilBoardingFromTimestamp(new Date("2026-11-01T01:30-05:00"), new Date("2026-11-01T01:30-04:00")))
      .toEqual({ invalid: false, minutesUntilBoarding: 60, boardingStarted: false });
  });
});
