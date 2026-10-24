import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type {
  Facility,
  IllustrativeRegressionFacility,
  IllustrativeTravelMatrix,
  ProductionTravelMatrix,
  UserContext,
} from "@/types/airport";
import { productionTravelMinutes } from "@/data/travel-times";
import {
  recommendFacilities,
  recommendFacilitiesIllustrative,
} from "./recommend";

const timedFacility: Facility = {
  id: "timed",
  name: "Timed Cafe",
  zone: "D",
  category: "food",
  securityZone: "post",
  waitMinutes: 8,
  activityMinutes: 10,
  locationConfidence: "demo_estimate",
  timeConfidence: "demo_estimate",
};

const context: UserContext = {
  gateZone: "D",
  minutesUntilBoarding: 50,
  bufferMinutes: 10,
  queueAdjustmentMinutes: 0,
  passengerSecurityArea: "post",
};

function matrixWithOutbound(
  outbound: number | null,
): ProductionTravelMatrix {
  return { D: { D: outbound } };
}

describe("recommendFacilities travel leg validation (GW-011 review)", () => {
  for (const invalid of [-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    it(`treats invalid outbound travel ${String(invalid)} as unknown, not feasibility`, () => {
      const result = recommendFacilities(
        context,
        [timedFacility],
        matrixWithOutbound(invalid),
      );
      assert.equal(result[0].kind, "unknown");
      if (result[0].kind === "unknown") {
        assert.equal(result[0].unknownReason, "missing_travel_outbound");
        assert.equal(result[0].breakdown.requiredMinutes, null);
        assert.equal(result[0].breakdown.marginMinutes, null);
        assert.equal(result[0].breakdown.outboundMinutes, null);
      }
    });
  }

});

describe("recommendFacilitiesIllustrative travel leg validation", () => {
  const facility: IllustrativeRegressionFacility = {
    id: "e-food",
    name: "Zone E Example",
    zone: "E",
    category: "food",
    securityZone: "post",
    waitMinutes: 8,
    activityMinutes: 10,
    locationConfidence: "demo_estimate",
    timeConfidence: "demo_estimate",
  };

  it("treats invalid return travel as missing_travel_return while outbound is known", () => {
    const matrix: IllustrativeTravelMatrix = {
      D: { D: 3, E: 7, F: null },
      E: { D: Number.NaN, E: 3, F: null },
      F: { D: null, E: null, F: 3 },
    };
    const result = recommendFacilitiesIllustrative(
      {
        gateZone: "D",
        minutesUntilBoarding: 50,
        bufferMinutes: 10,
        queueAdjustmentMinutes: 0,
      },
      [facility],
      matrix,
    );
    assert.equal(result[0].kind, "unknown");
    if (result[0].kind === "unknown") {
      assert.equal(result[0].unknownReason, "missing_travel_return");
      assert.equal(result[0].breakdown.outboundMinutes, 7);
      assert.equal(result[0].breakdown.returnMinutes, null);
      assert.equal(result[0].breakdown.requiredMinutes, null);
    }
  });
});

describe("recommendFacilitiesIllustrative (GW-011 review)", () => {
  const illustrativeFacility: IllustrativeRegressionFacility = {
    id: "e-food",
    name: "Zone E Example",
    zone: "E",
    category: "food",
    securityZone: "post",
    waitMinutes: 8,
    activityMinutes: 10,
    locationConfidence: "demo_estimate",
    timeConfidence: "demo_estimate",
  };

  const illustrativeMatrix: IllustrativeTravelMatrix = {
    D: { D: 3, E: 7, F: null },
    E: { D: 7, E: 3, F: null },
    F: { D: null, E: null, F: 3 },
  };

  it("computes asymmetric D to E hero margins with the shared engine", () => {
    const result = recommendFacilitiesIllustrative(
      {
        gateZone: "D",
        minutesUntilBoarding: 50,
        bufferMinutes: 10,
        queueAdjustmentMinutes: 0,
      },
      [illustrativeFacility],
      illustrativeMatrix,
    );
    assert.equal(result[0].kind, "feasibility");
    if (result[0].kind === "feasibility") {
      assert.equal(result[0].zone, "E");
      assert.equal(result[0].breakdown.requiredMinutes, 42);
      assert.equal(result[0].breakdown.marginMinutes, 8);
      assert.equal(result[0].status, "tight_in_model");
    }
  });

  it("keeps production D-only zone enforcement separate from illustrative cross-zone", () => {
    const crossZoneFacility: Facility = {
      ...timedFacility,
      id: "not-in-production-json",
      zone: "D",
    };
    const productionResult = recommendFacilities(
      context,
      [crossZoneFacility],
      productionTravelMinutes,
    );
    assert.equal(productionResult[0].kind, "feasibility");
    const illustrativeOnly: IllustrativeRegressionFacility = {
      ...illustrativeFacility,
      zone: "F",
    };
    const illustrativeResult = recommendFacilitiesIllustrative(
      {
        gateZone: "D",
        minutesUntilBoarding: 50,
        bufferMinutes: 10,
        queueAdjustmentMinutes: 0,
      },
      [illustrativeOnly],
      illustrativeMatrix,
    );
    assert.equal(illustrativeResult[0].kind, "unknown");
    if (illustrativeResult[0].kind === "unknown") {
      assert.equal(illustrativeResult[0].unknownReason, "missing_travel_outbound");
    }
  });
});
