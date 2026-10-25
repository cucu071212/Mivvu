import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { Facility, UserContext } from "@/types/airport";
import { validateContext } from "./validate-context";
import { validateDurationOverrides } from "./validate-duration-overrides";
import { validateFacilities } from "./validate-facilities";
import { recommendFacilities, recommendFacilitiesIllustrative } from "./recommend";

const context: UserContext = {
  gateZone: "D", minutesUntilBoarding: 50, bufferMinutes: 10,
  queueAdjustmentMinutes: 0, passengerSecurityArea: "post",
};
const facility: Facility = {
  id: "sample", name: "Sample", zone: "D", category: "food", securityZone: "post",
  waitMinutes: 8, activityMinutes: 10,
  locationConfidence: "demo_estimate", timeConfidence: "demo_estimate",
};
const matrix = { D: { D: 3 } };

describe("numeric input hardening", () => {
  for (const field of ["minutesUntilBoarding", "bufferMinutes", "queueAdjustmentMinutes"] as const) {
    for (const value of ["1e20", "1e308", "1e2", "0x32", "0b10", "0o10", "50.0", "9007199254740993", 1e20, 1e308, 1441]) {
      it(`rejects ${field} = ${value} instead of coercing or rounding it`, () => {
        const result = validateContext({ ...context, [field]: value });
        assert.equal(result.context, null);
        assert.ok(result.errors.some((error) => error.field === field));
      });
    }
  }

  it("rejects the audit's equal enormous boarding/buffer values", () => {
    const result = validateContext({ ...context, minutesUntilBoarding: "1e20", bufferMinutes: "1e20" });
    assert.equal(result.context, null);
    assert.deepEqual(result.errors.map((error) => error.field), ["minutesUntilBoarding", "bufferMinutes"]);
  });

  it("preserves decimal integers, trimmed signs, leading zeros, and the inclusive 24h boundary", () => {
    assert.deepEqual(validateContext({ ...context, minutesUntilBoarding: " +01440 ", bufferMinutes: "000", queueAdjustmentMinutes: " -1440 " }), {
      context: { ...context, minutesUntilBoarding: 1440, bufferMinutes: 0, queueAdjustmentMinutes: -1440 }, errors: [],
    });
    assert.equal(validateContext({ ...context, bufferMinutes: 1440, queueAdjustmentMinutes: 1440 }).errors.length, 0);
    assert.equal(validateContext({ ...context, queueAdjustmentMinutes: -1441 }).context, null);
  });

  for (const field of ["queueMinutes", "activityMinutes"] as const) {
    it(`rejects unsafe ${field} without discarding independent valid overrides`, () => {
      const result = validateDurationOverrides({
        sample: { facilityId: "sample", [field]: 1e20 },
        other: { facilityId: "other", queueMinutes: 0, activityMinutes: 5 },
      }, ["sample", "other"]);
      assert.deepEqual(result.overrides, { other: { facilityId: "other", queueMinutes: 0, activityMinutes: 5 } });
      assert.ok(result.errors.some((error) => error.facilityId === "sample" && error.field === field));
    });
  }

  for (const value of ["0x10", "1e2", "9007199254740993", 1e20]) {
    it(`rejects unsafe/coerced dataset durations ${value}`, () => {
      const result = validateFacilities([{ ...facility, waitMinutes: value, activityMinutes: value }]);
      assert.deepEqual(result.facilities, []);
      assert.equal(result.errors.filter((error) => error.code === "invalid_minutes_field").length, 2);
    });
  }
});

describe("recommendation arithmetic hardening", () => {
  for (const [field, value] of [
    ["minutesUntilBoarding", 1e20], ["bufferMinutes", 1e308],
    ["queueAdjustmentMinutes", Infinity], ["queueAdjustmentMinutes", -1441],
  ] as const) {
    it(`fails explicitly if a direct caller bypasses validation for ${field}`, () => {
      assert.throws(() => recommendFacilities({ ...context, [field]: value }, [facility], matrix), RangeError);
    });
  }

  it("never classifies the audit's precision-loss input as tight", () => {
    assert.throws(() => recommendFacilities({ ...context, minutesUntilBoarding: 1e20, bufferMinutes: 1e20 }, [facility], matrix), RangeError);
  });

  for (const field of ["waitMinutes", "activityMinutes"] as const) {
    for (const value of [NaN, Infinity, -1, 1e20, 1e308]) {
      it(`keeps invalid ${field} = ${value} unknown, not feasible or zero-filled`, () => {
        const row = recommendFacilities(context, [{ ...facility, [field]: value }], matrix)[0];
        assert.equal(row.kind, "unknown");
        if (row.kind !== "unknown") return;
        assert.equal(row.breakdown.requiredMinutes, null);
        assert.equal(row.breakdown.marginMinutes, null);
        assert.equal(row.breakdown[field === "waitMinutes" ? "queueMinutes" : "activityMinutes"], null);
      });
    }
  }

  it("does not hide an unsafe queue sum with later clamping or classification", () => {
    const row = recommendFacilities({ ...context, queueAdjustmentMinutes: 1 }, [{ ...facility, waitMinutes: Number.MAX_SAFE_INTEGER }], matrix)[0];
    assert.equal(row.kind, "unknown");
    if (row.kind === "unknown") assert.equal(row.breakdown.queueMinutes, null);
  });

  it("withholds totals when individually safe durations overflow the exact-integer range", () => {
    const row = recommendFacilities(context, [{ ...facility, waitMinutes: Number.MAX_SAFE_INTEGER }], matrix)[0];
    assert.equal(row.kind, "unknown");
    if (row.kind !== "unknown") return;
    assert.equal(row.unknownReason, "invalid_numeric_input");
    assert.equal(row.breakdown.requiredMinutes, null);
    assert.equal(row.breakdown.marginMinutes, null);
  });

  it("treats unsafe travel legs as unknown", () => {
    const row = recommendFacilities(context, [facility], { D: { D: 1e20 } })[0];
    assert.equal(row.kind, "unknown");
    if (row.kind === "unknown") assert.equal(row.breakdown.outboundMinutes, null);
  });

  it("preserves signed adjustment clamping and independently calculated margins", () => {
    const row = recommendFacilities({ ...context, queueAdjustmentMinutes: -1440 }, [facility], matrix)[0];
    assert.equal(row.kind, "feasibility");
    if (row.kind !== "feasibility") return;
    assert.equal(row.breakdown.requiredMinutes, 26);
    assert.equal(row.breakdown.marginMinutes, 24);
    assert.equal(row.status, "feasible_in_model");
  });

  it("protects the illustrative engine through the same arithmetic boundary", () => {
    assert.throws(() => recommendFacilitiesIllustrative({ ...context, minutesUntilBoarding: 1e308 }, [{ ...facility, zone: "E" }], {
      D: { D: 3, E: 7, F: null }, E: { D: 7, E: 3, F: null }, F: { D: null, E: null, F: 3 },
    }), RangeError);
  });
});
