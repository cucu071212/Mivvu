import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { presentFacilityHours } from "./format-facility-hours";

describe("presentFacilityHours", () => {
  it("returns unknown copy when hours are omitted", () => {
    const result = presentFacilityHours(undefined, undefined);
    assert.equal(result.isUnknown, true);
    assert.match(result.scheduleLine, /not published/i);
  });

  it("formats normalized daily hours in Pacific Time", () => {
    const result = presentFacilityHours(
      {
        kind: "weekly_same_all_days",
        rawText: "Sunday- Saturday 4:30 am-8:30 pm",
        openLocal: "04:30",
        closeLocal: "20:30",
        timezone: "America/Los_Angeles",
      },
      "official_verified",
    );
    assert.equal(result.isUnknown, false);
    assert.match(result.scheduleLine, /4:30 AM/);
    assert.match(result.scheduleLine, /8:30 PM/);
    assert.match(result.scheduleLine, /Pacific Time/);
  });

  it("flags overnight spans when close is before open on the clock", () => {
    const result = presentFacilityHours(
      {
        kind: "weekly_same_all_days",
        rawText: "Sunday - Saturday 4:00 am-11:30 pm",
        openLocal: "22:00",
        closeLocal: "06:00",
        timezone: "America/Los_Angeles",
      },
      "official_verified",
    );
    assert.equal(result.spansMidnight, true);
    assert.match(result.scheduleLine, /midnight/i);
  });

  it("falls back to raw listing text when normalized times are absent", () => {
    const raw = "Sunday - Saturday 7:00 am-9:00 pm";
    const result = presentFacilityHours(
      {
        kind: "weekly_same_all_days",
        rawText: raw,
        openLocal: null,
        closeLocal: null,
        timezone: "America/Los_Angeles",
      },
      "official_verified",
    );
    assert.equal(result.scheduleLine, raw);
  });
});
