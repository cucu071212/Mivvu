import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type {
  Facility,
  IllustrativeRecommendation,
  IllustrativeRegressionContext,
  IllustrativeRegressionFacility,
  IllustrativeTravelMatrix,
  ProductionFeasibilityRecommendation,
  ProductionRecommendation,
  ProductionTravelMatrix,
  RecommendFacilities,
  RecommendFacilitiesIllustrative,
  UserContext,
} from "@/types/airport";
import {
  ILLUSTRATIVE_T3_E_FACILITY_LOCATION,
  ILLUSTRATIVE_T3_F_FACILITY_LOCATION,
  PRODUCTION_T2_D_FACILITY_LOCATION,
} from "@/data/fixtures/production-facility-defaults";
import { recommendFacilities, recommendFacilitiesIllustrative } from "./recommend";

// Synthetic assumptions only. No real facility or measured SFO time is used.
// Valid production fixtures are D-only. Out-of-scope runtime inputs are explicitly
// marked rejection tests below; they do not widen the production Zone contract.
const context: UserContext = {
  gateZone: "D", minutesUntilBoarding: 50, bufferMinutes: 10,
  queueAdjustmentMinutes: 0, passengerSecurityArea: "post",
};
const travel: ProductionTravelMatrix = { D: { D: 3 } };
function facility(overrides: Partial<Facility> = {}): Facility {
  return {
    ...PRODUCTION_T2_D_FACILITY_LOCATION,
    id: "model-cafe", name: "Model Cafe", zone: "D", category: "food",
    securityZone: "post", waitMinutes: 8, activityMinutes: 10,
    locationConfidence: "demo_estimate", timeConfidence: "demo_estimate",
    ...overrides,
  };
}
const recommend: RecommendFacilities = recommendFacilities;

function single(
  row: Facility = facility(),
  input: UserContext = context,
  matrix: ProductionTravelMatrix = travel,
): ProductionRecommendation {
  const result = recommend(input, [row], matrix);
  assert.equal(result.length, 1, "Every supplied facility needs an explained outcome.");
  return result[0];
}

function feasibility(result: ProductionRecommendation): ProductionFeasibilityRecommendation {
  assert.ok(result.kind === "feasibility", "Expected a complete model calculation.");
  return result;
}

describe("recommendFacilities — production D-only contract", () => {
  it("counts both within-zone legs, queue, activity and exactly one buffer", () => {
    // Independently calculated: 3 + 3 + 8 + 10 + 10 = 34; 50 - 34 = 16.
    assert.deepEqual(single(), {
      facilityId: "model-cafe", facilityName: "Model Cafe", category: "food",
      zone: "D", securityZone: "post", locationConfidence: "demo_estimate",
      timeConfidence: "demo_estimate", kind: "feasibility", status: "feasible_in_model",
      breakdown: {
        outboundMinutes: 3, returnMinutes: 3, queueMinutes: 8, activityMinutes: 10,
        bufferMinutes: 10, requiredMinutes: 34, marginMinutes: 16,
      },
    });
  });

  for (const [available, margin, status] of [
    [33, -1, "over_budget"], [34, 0, "tight_in_model"],
    [43, 9, "tight_in_model"], [44, 10, "feasible_in_model"],
  ] as const) {
    it(`classifies margin ${margin} at ${available} minutes until boarding starts`, () => {
      const result = feasibility(single(facility(), { ...context, minutesUntilBoarding: available }));
      assert.equal(result.breakdown.requiredMinutes, 34);
      assert.equal(result.breakdown.marginMinutes, margin);
      assert.equal(result.status, status);
    });
  }

  it("does not improve classification as time until boarding decreases", () => {
    const results = [44, 43, 34, 33].map((minutesUntilBoarding) =>
      feasibility(single(facility(), { ...context, minutesUntilBoarding })));
    assert.deepEqual(results.map((result) => result.status), [
      "feasible_in_model", "tight_in_model", "tight_in_model", "over_budget",
    ]);
    assert.deepEqual(results.map((result) => result.breakdown.marginMinutes), [10, 9, 0, -1]);
  });

  for (const [queueAdjustmentMinutes, queue, required, margin, status] of [
    [7, 15, 41, 9, "tight_in_model"],
    [-3, 5, 31, 19, "feasible_in_model"],
    [-8, 0, 26, 24, "feasible_in_model"],
    [-99, 0, 26, 24, "feasible_in_model"],
  ] as const) {
    it(`applies signed queue adjustment ${queueAdjustmentMinutes} with a zero floor`, () => {
      const result = feasibility(single(facility(), { ...context, queueAdjustmentMinutes }));
      assert.deepEqual(result.breakdown, {
        outboundMinutes: 3, returnMinutes: 3, queueMinutes: queue, activityMinutes: 10,
        bufferMinutes: 10, requiredMinutes: required, marginMinutes: margin,
      });
      assert.equal(result.status, status);
    });
  }

  it("a +7 queue change reduces margin by exactly 7 and explains the changed outcome numerically", () => {
    const before = feasibility(single());
    const after = feasibility(single(facility(), { ...context, queueAdjustmentMinutes: 7 }));
    assert.equal(before.breakdown.marginMinutes, 16);
    assert.equal(after.breakdown.marginMinutes, 9);
    assert.equal(before.breakdown.marginMinutes - after.breakdown.marginMinutes, 7);
    assert.equal(before.status, "feasible_in_model");
    assert.equal(after.status, "tight_in_model");
  });

  it("preserves known zero durations, distinguishing zero from unknown", () => {
    const result = feasibility(single(facility({ waitMinutes: 0, activityMinutes: 0 })));
    assert.deepEqual(result.breakdown, {
      outboundMinutes: 3, returnMinutes: 3, queueMinutes: 0, activityMinutes: 0,
      bufferMinutes: 10, requiredMinutes: 16, marginMinutes: 34,
    });
  });

  it("preserves an explicitly zero buffer", () => {
    const result = feasibility(single(facility(), { ...context, bufferMinutes: 0 }));
    assert.equal(result.breakdown.bufferMinutes, 0);
    assert.equal(result.breakdown.requiredMinutes, 24);
    assert.equal(result.breakdown.marginMinutes, 26);
  });

  it("preserves zero time until boarding rather than applying a default", () => {
    const result = feasibility(single(facility(), { ...context, minutesUntilBoarding: 0 }));
    assert.equal(result.breakdown.marginMinutes, -34);
    assert.equal(result.status, "over_budget");
  });

  it("explains a missing queue without computing a partial total or feasibility status", () => {
    // Third-party confidence permits partially unknown durations in the frozen contract.
    assert.deepEqual(single(facility({ waitMinutes: null, timeConfidence: "third_party" })), {
      facilityId: "model-cafe", facilityName: "Model Cafe", category: "food",
      zone: "D", securityZone: "post", locationConfidence: "demo_estimate",
      timeConfidence: "third_party", kind: "unknown", unknownReason: "missing_queue_estimate",
      breakdown: {
        outboundMinutes: 3, returnMinutes: 3, queueMinutes: null, activityMinutes: 10,
        bufferMinutes: 10, requiredMinutes: null, marginMinutes: null,
      },
    });
  });

  it("explains a missing activity duration without replacing it with zero", () => {
    assert.deepEqual(single(facility({ activityMinutes: null, timeConfidence: "third_party" })), {
      facilityId: "model-cafe", facilityName: "Model Cafe", category: "food",
      zone: "D", securityZone: "post", locationConfidence: "demo_estimate",
      timeConfidence: "third_party", kind: "unknown", unknownReason: "missing_activity_estimate",
      breakdown: {
        outboundMinutes: 3, returnMinutes: 3, queueMinutes: 8, activityMinutes: null,
        bufferMinutes: 10, requiredMinutes: null, marginMinutes: null,
      },
    });
  });

  for (const queueAdjustmentMinutes of [-99, 0, 99]) {
    it(`does not turn an unknown queue into a number with adjustment ${queueAdjustmentMinutes}`, () => {
      const result = single(facility({ waitMinutes: null, timeConfidence: "third_party" }),
        { ...context, queueAdjustmentMinutes });
      assert.ok(result.kind === "unknown");
      assert.equal(result.unknownReason, "missing_queue_estimate");
      assert.equal(result.breakdown.queueMinutes, null);
      assert.equal(result.breakdown.requiredMinutes, null);
      assert.equal(result.breakdown.marginMinutes, null);
      assert.ok(!("status" in result));
    });
  }

  it("retains wholly unknown visit times without assuming known production-facility estimates", () => {
    const result = single(facility({ waitMinutes: null, activityMinutes: null, timeConfidence: "unknown" }));
    assert.ok(result.kind === "unknown");
    // The contract does not prioritize reasons when multiple essentials are missing.
    assert.ok(["missing_queue_estimate", "missing_activity_estimate"].includes(result.unknownReason));
    assert.equal(result.timeConfidence, "unknown");
    assert.equal(result.breakdown.queueMinutes, null);
    assert.equal(result.breakdown.activityMinutes, null);
    assert.equal(result.breakdown.requiredMinutes, null);
    assert.equal(result.breakdown.marginMinutes, null);
  });

  it("keeps both travel legs unknown when the single production matrix edge is missing", () => {
    const result = single(facility(), context, { D: { D: null } });
    assert.ok(result.kind === "unknown");
    assert.ok(["missing_travel_outbound", "missing_travel_return"].includes(result.unknownReason));
    assert.equal(result.breakdown.outboundMinutes, null);
    assert.equal(result.breakdown.returnMinutes, null);
    assert.equal(result.breakdown.bufferMinutes, 10);
    assert.equal(result.breakdown.requiredMinutes, null);
    assert.equal(result.breakdown.marginMinutes, null);
    assert.ok(!("status" in result));
  });

  for (const invalidDuration of [-1, NaN, Infinity]) {
    it(`does not model invalid production travel duration ${invalidDuration} or replace it with zero`, () => {
      const result = single(facility(), context, { D: { D: invalidDuration } });
      assert.ok(result.kind === "unknown");
      assert.ok(["missing_travel_outbound", "missing_travel_return"].includes(result.unknownReason));
      assert.equal(result.breakdown.outboundMinutes, null);
      assert.equal(result.breakdown.returnMinutes, null);
      assert.equal(result.breakdown.requiredMinutes, null);
      assert.equal(result.breakdown.marginMinutes, null);
      assert.ok(!("status" in result));
    });
  }

  for (const zone of ["E", "F"] as const) {
    it(`rejects runtime facility zone ${zone} through the production API`, () => {
      // Deliberately malformed runtime input, never a valid production fixture.
      const outside = { ...facility(), zone } as unknown as Facility;
      const result = single(outside);
      assert.ok(result.kind === "ineligible");
      assert.equal(result.ineligibilityReason, "outside_supported_zone");
      assert.ok(!("breakdown" in result));
      assert.ok(!("status" in result));
    });
    it(`rejects runtime gate zone ${zone} through the production API`, () => {
      const outside = { ...context, gateZone: zone } as unknown as UserContext;
      const result = single(facility(), outside);
      assert.ok(result.kind === "ineligible");
      assert.equal(result.ineligibilityReason, "outside_supported_zone");
      assert.ok(!("breakdown" in result));
      assert.ok(!("status" in result));
    });
  }

  for (const securityZone of ["post", "both"] as const) {
    it(`models a ${securityZone} facility for a post-security passenger`, () => {
      const result = feasibility(single(facility({ securityZone })));
      assert.equal(result.securityZone, securityZone);
      assert.equal(result.breakdown.requiredMinutes, 34);
    });
  }
  for (const [securityZone, reason] of [
    ["unknown", "security_zone_unknown"], ["pre", "security_zone_pre_only"],
  ] as const) {
    it(`returns an explicit ineligible union for security status ${securityZone}`, () => {
      assert.deepEqual(single(facility({ securityZone })), {
        facilityId: "model-cafe", facilityName: "Model Cafe", category: "food",
        zone: "D", securityZone, locationConfidence: "demo_estimate",
        timeConfidence: "demo_estimate", kind: "ineligible", ineligibilityReason: reason,
      });
    });
  }

  it("orders feasible, tight, over-budget and unknown results and is deterministic", () => {
    // Required/margin: feasible 34/+16; tight 44/+6; over 64/-14; unknown null/null.
    const rows = [
      facility({ id: "unknown", name: "A Unknown", activityMinutes: null, timeConfidence: "third_party" }),
      facility({ id: "over", name: "B Over", activityMinutes: 40 }),
      facility({ id: "tight", name: "C Tight", activityMinutes: 20 }),
      facility({ id: "feasible", name: "Z Feasible" }),
    ];
    const result = recommend(context, rows, travel);
    assert.deepEqual(result.map((row) => row.facilityId), ["feasible", "tight", "over", "unknown"]);
    assert.deepEqual(recommend(context, rows, travel), result);
  });

  it("preserves all tied candidates and their deterministic ordering without inventing a tie-break contract", () => {
    const rows = [facility({ id: "one" }), facility({ id: "two" })];
    const result = recommend(context, rows, travel);
    assert.equal(result.length, 2);
    assert.deepEqual(new Set(result.map((row) => row.facilityId)), new Set(["one", "two"]));
    assert.deepEqual(recommend(context, rows, travel), result);
  });

  it("returns no recommendations for an empty facility list", () => {
    assert.deepEqual(recommend(context, [], travel), []);
  });

  it("does not mutate frozen inputs while calculating and sorting", () => {
    const input = Object.freeze({ ...context });
    const matrix = Object.freeze({ D: Object.freeze({ D: 3 }) });
    const rows = Object.freeze([
      Object.freeze(facility({ id: "over", activityMinutes: 40 })),
      Object.freeze(facility({ id: "feasible" })),
    ]);
    const result = recommend(input, rows, matrix);
    assert.deepEqual(result.map((row) => row.facilityId), ["feasible", "over"]);
    assert.deepEqual(rows.map((row) => row.id), ["over", "feasible"]);
    assert.equal(rows[0].activityMinutes, 40);
    assert.equal(input.minutesUntilBoarding, 50);
    assert.equal(matrix.D.D, 3);
  });
});

// Approved illustrative export only: these E/F fixtures never reach the production API.
// All values below are synthetic, independently calculated examples, not airport facts.
const illustrativeContext: IllustrativeRegressionContext = {
  gateZone: "D", minutesUntilBoarding: 50, bufferMinutes: 10, queueAdjustmentMinutes: 0,
};
const illustrativeFacility: IllustrativeRegressionFacility = {
  ...facility(),
  ...ILLUSTRATIVE_T3_E_FACILITY_LOCATION,
  id: "synthetic-e",
  name: "Synthetic E Cafe",
  zone: "E",
};
const illustrativeTravel: IllustrativeTravelMatrix = {
  D: { D: 3, E: 7, F: 12 },
  E: { D: 11, E: 3, F: 6 },
  F: { D: 4, E: 6, F: 3 },
};
const recommendIllustrative: RecommendFacilitiesIllustrative = recommendFacilitiesIllustrative;

function singleIllustrative(
  row: IllustrativeRegressionFacility = illustrativeFacility,
  input: IllustrativeRegressionContext = illustrativeContext,
  matrix: IllustrativeTravelMatrix = illustrativeTravel,
): IllustrativeRecommendation {
  const result = recommendIllustrative(input, [row], matrix);
  assert.equal(result.length, 1);
  return result[0];
}

describe("recommendFacilitiesIllustrative — synthetic D/E/F arithmetic only", () => {
  it("uses directed outbound 7 and return 11 rather than assuming symmetry", () => {
    // 7 + 11 + 8 + 10 + 10 = 46; 50 - 46 = 4.
    const result = singleIllustrative();
    assert.ok(result.kind === "feasibility");
    assert.equal(result.zone, "E");
    assert.equal(result.status, "tight_in_model");
    assert.deepEqual(result.breakdown, {
      outboundMinutes: 7, returnMinutes: 11, queueMinutes: 8, activityMinutes: 10,
      bufferMinutes: 10, requiredMinutes: 46, marginMinutes: 4,
    });
  });

  it("reverses the directed legs when gate E visits a synthetic D facility", () => {
    const result = singleIllustrative({ ...illustrativeFacility, zone: "D" },
      { ...illustrativeContext, gateZone: "E" });
    assert.ok(result.kind === "feasibility");
    assert.deepEqual(result.breakdown, {
      outboundMinutes: 11, returnMinutes: 7, queueMinutes: 8, activityMinutes: 10,
      bufferMinutes: 10, requiredMinutes: 46, marginMinutes: 4,
    });
  });

  for (const [available, margin, status] of [
    [50, 8, "tight_in_model"], [35, -7, "over_budget"], [52, 10, "feasible_in_model"],
    [41, -1, "over_budget"], [42, 0, "tight_in_model"], [51, 9, "tight_in_model"],
  ] as const) {
    it(`calculates the 42-minute hero scenario at ${available} available minutes (margin ${margin})`, () => {
      // 7 + 7 + 8 + 10 + 10 = 42. Expected margins/statuses are literals.
      const matrix: IllustrativeTravelMatrix = {
        ...illustrativeTravel, E: { ...illustrativeTravel.E, D: 7 },
      };
      const result = singleIllustrative(illustrativeFacility,
        { ...illustrativeContext, minutesUntilBoarding: available }, matrix);
      assert.ok(result.kind === "feasibility");
      assert.equal(result.status, status);
      assert.deepEqual(result.breakdown, {
        outboundMinutes: 7, returnMinutes: 7, queueMinutes: 8, activityMinutes: 10,
        bufferMinutes: 10, requiredMinutes: 42, marginMinutes: margin,
      });
    });
  }

  it("explains missing outbound travel while preserving the known return leg", () => {
    const matrix: IllustrativeTravelMatrix = {
      ...illustrativeTravel, D: { ...illustrativeTravel.D, E: null },
    };
    const result = singleIllustrative(illustrativeFacility, illustrativeContext, matrix);
    assert.ok(result.kind === "unknown");
    assert.equal(result.unknownReason, "missing_travel_outbound");
    assert.deepEqual(result.breakdown, {
      outboundMinutes: null, returnMinutes: 11, queueMinutes: 8, activityMinutes: 10,
      bufferMinutes: 10, requiredMinutes: null, marginMinutes: null,
    });
    assert.ok(!("status" in result));
  });

  it("explains missing return travel while preserving the known outbound leg", () => {
    const matrix: IllustrativeTravelMatrix = {
      ...illustrativeTravel, E: { ...illustrativeTravel.E, D: null },
    };
    const result = singleIllustrative(illustrativeFacility, illustrativeContext, matrix);
    assert.ok(result.kind === "unknown");
    assert.equal(result.unknownReason, "missing_travel_return");
    assert.deepEqual(result.breakdown, {
      outboundMinutes: 7, returnMinutes: null, queueMinutes: 8, activityMinutes: 10,
      bufferMinutes: 10, requiredMinutes: null, marginMinutes: null,
    });
    assert.ok(!("status" in result));
  });

  it("uses synthetic D→F 12 and F→D 4 for 44 required minutes and margin +6", () => {
    // 12 + 4 + 8 + 10 + 10 = 44; 50 - 44 = 6.
    const result = singleIllustrative({
      ...illustrativeFacility,
      ...ILLUSTRATIVE_T3_F_FACILITY_LOCATION,
      zone: "F",
    });
    assert.ok(result.kind === "feasibility");
    assert.equal(result.zone, "F");
    assert.equal(result.status, "tight_in_model");
    assert.deepEqual(result.breakdown, {
      outboundMinutes: 12, returnMinutes: 4, queueMinutes: 8, activityMinutes: 10,
      bufferMinutes: 10, requiredMinutes: 44, marginMinutes: 6,
    });
  });

  for (const invalidDuration of [-1, NaN, Infinity]) {
    it(`treats invalid outbound duration ${invalidDuration} as unknown without a partial total`, () => {
      const matrix: IllustrativeTravelMatrix = {
        ...illustrativeTravel, D: { ...illustrativeTravel.D, E: invalidDuration },
      };
      const result = singleIllustrative(illustrativeFacility, illustrativeContext, matrix);
      assert.ok(result.kind === "unknown");
      assert.equal(result.unknownReason, "missing_travel_outbound");
      assert.deepEqual(result.breakdown, {
        outboundMinutes: null, returnMinutes: 11, queueMinutes: 8, activityMinutes: 10,
        bufferMinutes: 10, requiredMinutes: null, marginMinutes: null,
      });
      assert.ok(!("status" in result));
    });
    it(`treats invalid return duration ${invalidDuration} as unknown without a partial total`, () => {
      const matrix: IllustrativeTravelMatrix = {
        ...illustrativeTravel, E: { ...illustrativeTravel.E, D: invalidDuration },
      };
      const result = singleIllustrative(illustrativeFacility, illustrativeContext, matrix);
      assert.ok(result.kind === "unknown");
      assert.equal(result.unknownReason, "missing_travel_return");
      assert.deepEqual(result.breakdown, {
        outboundMinutes: 7, returnMinutes: null, queueMinutes: 8, activityMinutes: 10,
        bufferMinutes: 10, requiredMinutes: null, marginMinutes: null,
      });
      assert.ok(!("status" in result));
    });
  }
});
