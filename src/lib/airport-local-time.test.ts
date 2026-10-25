import { afterEach, describe, expect, it, vi } from "vitest";
import { presentAirportLocalTime, isCalendarDate } from "./airport-local-time";

afterEach(() => vi.useRealTimers());

describe("SFO timestamp presentation (not boarding calculations)", () => {
  it.each([
    ["2026-01-15T20:00:00Z", "2026-01-15", "12:00:00", -480, "UTC-08:00"],
    ["2026-07-15T20:00:00Z", "2026-07-15", "13:00:00", -420, "UTC-07:00"],
    ["2026-03-08T09:59:59Z", "2026-03-08", "01:59:59", -480, "UTC-08:00"],
    ["2026-03-08T10:00:00Z", "2026-03-08", "03:00:00", -420, "UTC-07:00"],
    ["2026-11-01T08:59:59Z", "2026-11-01", "01:59:59", -420, "UTC-07:00"],
    ["2026-11-01T09:00:00Z", "2026-11-01", "01:00:00", -480, "UTC-08:00"],
    ["2026-01-01T07:59:59Z", "2025-12-31", "23:59:59", -480, "UTC-08:00"],
    ["2026-01-01T08:00:00Z", "2026-01-01", "00:00:00", -480, "UTC-08:00"],
    ["2024-03-01T07:30:00Z", "2024-02-29", "23:30:00", -480, "UTC-08:00"],
    ["2026-07-15T07:00:00Z", "2026-07-15", "00:00:00", -420, "UTC-07:00"],
  ])("maps %s to an explicit Pacific local time", (instant, date, time, offsetMinutes, offsetLabel) => {
    expect(presentAirportLocalTime(instant)).toEqual({
      kind: "timestamp", date, time, offsetMinutes, offsetLabel,
      timezone: "America/Los_Angeles", text: `${date} ${time} Pacific Time (${offsetLabel})`,
    });
  });

  it("distinguishes the repeated fall-back hour by its offset", () => {
    const first = presentAirportLocalTime("2026-11-01T01:30:00-07:00");
    const second = presentAirportLocalTime("2026-11-01T01:30:00-08:00");
    expect(first).toMatchObject({ time: "01:30:00", offsetMinutes: -420 });
    expect(second).toMatchObject({ time: "01:30:00", offsetMinutes: -480 });
    expect(first.text).not.toBe(second.text);
  });

  it.each([null, undefined])("represents explicit/missing unknown timestamps: %s", (value) => {
    expect(presentAirportLocalTime(value)).toEqual({ kind: "unknown", text: "Time unknown", timezone: "America/Los_Angeles" });
  });

  it.each([
    "", "unknown", "invalid", "2026-10-25", "2026-10-25T12:00:00", "2026-11-01T01:30",
    "2026-03-08T02:30:00", "2026-02-29T00:00:00Z", "2026-04-31T12:00:00Z",
    "2026-01-01T24:00:00Z", "2026-01-01T00:60:00Z", "2026-01-01T00:00:60Z",
    "2026-01-01T00:00:00+24:00", "2026-01-01T00:00:00+00:60", "2026-01-01T00:00:00-00:00",
    " 2026-01-01T00:00:00Z", "2026-01-01T00:00:00Z ", "01/02/2026", 0, NaN, Infinity, {}, [],
    "0000-01-01T00:00:00Z", "0099-01-01T00:00:00Z", "10000-01-01T00:00:00Z",
  ])("rejects invalid or ambiguous timestamp %j without Date normalization", (value) => {
    expect(presentAirportLocalTime(value)).toEqual({ kind: "invalid", text: "Invalid timestamp", timezone: "America/Los_Angeles" });
  });

  it("accepts equivalent explicit-offset ISO instants and displays whole seconds", () => {
    const expected = presentAirportLocalTime("2026-07-15T20:00:00Z");
    for (const value of ["2026-07-15T13:00:00-07:00", "2026-07-16T05:00:00+09:00", "2026-07-15T20:00Z", "2026-07-15T20:00:00.999Z"]) {
      expect(presentAirportLocalTime(value)).toEqual(expected);
    }
  });

  it("has identical serializable output across host zones and wall clocks", () => {
    const originalTZ = process.env.TZ;
    const expected = { kind: "timestamp", date: "2026-03-08", time: "03:00:00", offsetMinutes: -420,
      offsetLabel: "UTC-07:00", timezone: "America/Los_Angeles", text: "2026-03-08 03:00:00 Pacific Time (UTC-07:00)" };
    vi.useFakeTimers();
    try {
      for (const zone of ["UTC", "Asia/Seoul", "America/New_York", "America/Los_Angeles"]) {
        process.env.TZ = zone;
        for (const now of ["2026-01-01T00:00:00Z", "2026-07-01T00:00:00Z"]) {
          vi.setSystemTime(new Date(now));
          expect(JSON.parse(JSON.stringify(presentAirportLocalTime("2026-03-08T10:00:00Z")))).toEqual(expected);
        }
      }
    } finally {
      if (originalTZ === undefined) delete process.env.TZ;
      else process.env.TZ = originalTZ;
    }
  });

  it("reports unavailable timezone support without substituting the host timezone", () => {
    const spy = vi.spyOn(Intl, "DateTimeFormat").mockImplementation(() => { throw new RangeError("missing ICU"); });
    try {
      expect(presentAirportLocalTime("2026-07-15T20:00:00Z")).toMatchObject({ kind: "unavailable" });
    } finally { spy.mockRestore(); }
  });

  it("fails closed when offset conversion exceeds the supported calendar range", () => {
    const result = presentAirportLocalTime("9999-12-31T23:59:59-23:59");
    expect(result).toMatchObject({ kind: "unavailable" });
    expect(JSON.stringify(result)).not.toContain("NaN");
  });
});

describe("date-only provenance validation (never converted to a timezone)", () => {
  it.each(["2024-02-29", "2000-02-29", "2026-10-25", "0100-01-01", "9999-12-31"])("accepts %s", (value) => {
    expect(isCalendarDate(value)).toBe(true);
  });
  it.each(["1900-02-29", "2026-02-29", "2026-04-31", "2026-13-01", "2026-00-01", "2026-01-00",
    "2026-1-1", " 2026-10-25", "2026-10-25T00:00:00Z", "0000-01-01", "0099-01-01", null, undefined, 20261025])(
    "rejects %j", (value) => { expect(isCalendarDate(value)).toBe(false); },
  );
});
