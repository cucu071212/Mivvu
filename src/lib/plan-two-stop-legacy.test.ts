import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";
import { productionTravelMinutes } from "@/data/travel-times";
import { PRODUCTION_T2_D_FACILITY_LOCATION } from "@/data/fixtures/production-facility-defaults";
import { recommendFacilities } from "@/lib/recommend";
import type { Facility } from "@/types/airport";
import {
  evaluateTwoStopPairLegacy,
  twoStopVersusSingleStopGapMinutes,
  validateTwoStopSelection,
} from "@/lib/plan-two-stop-legacy";
import { validateFacilities } from "@/lib/validate-facilities";
import type {
  ResolvedFacilityDurations,
  UserContext,
} from "@/types/airport";

const productionJson = JSON.parse(
  readFileSync(new URL("../data/facilities.json", import.meta.url), "utf8"),
) as unknown;

const DEMO_QUEUE = 8;
const DEMO_ACTIVITY = 10;

const baseContext: UserContext = {
  gateZone: "D",
  minutesUntilBoarding: 50,
  bufferMinutes: 10,
  queueAdjustmentMinutes: 0,
  passengerSecurityArea: "post",
};

function demoResolved(): ResolvedFacilityDurations {
  return {
    queueMinutes: DEMO_QUEUE,
    activityMinutes: DEMO_ACTIVITY,
    queueSource: "demo_estimate",
    activitySource: "demo_estimate",
  };
}

function facilitiesMap() {
  const { facilities } = validateFacilities(productionJson);
  return new Map(facilities.map((f) => [f.id, f]));
}

function resolvedMap(ids: string[]) {
  const map = new Map<string, ResolvedFacilityDurations>();
  for (const id of ids) {
    map.set(id, demoResolved());
  }
  return map;
}

describe("plan-two-stop-legacy", () => {
  it("T-E1-01: demo_legacy_d over_budget at T=50", () => {
    const facilitiesById = facilitiesMap();
    const selection = [
      "sfo-t2-d-burger-joint",
      "sfo-t2-d-peets-coffee-d7",
    ] as const;
    const result = evaluateTwoStopPairLegacy({
      context: baseContext,
      selection,
      facilitiesById,
      travelTimes: productionTravelMinutes,
      resolvedByFacilityId: resolvedMap([...selection]),
      travelPolicy: "demo_legacy_d",
    });
    assert.equal(result.travelPolicy, "demo_legacy_d");
    assert.equal(result.usesDemoTravelAssumption, true);
    assert.equal(result.orderAB.kind, "feasibility");
    if (result.orderAB.kind === "feasibility") {
      assert.equal(result.orderAB.ledger.requiredMinutes, 55);
      assert.equal(result.orderAB.ledger.marginMinutes, -5);
      assert.equal(result.orderAB.status, "over_budget");
      assert.equal(result.orderAB.ledger.legs.length, 3);
    }
  });

  it("T-E1-02: symmetric demo legs yield same required minutes both orders", () => {
    const facilitiesById = facilitiesMap();
    const selection = [
      "sfo-t2-d-burger-joint",
      "sfo-t2-d-napa-farms-market",
    ] as const;
    const result = evaluateTwoStopPairLegacy({
      context: baseContext,
      selection,
      facilitiesById,
      travelTimes: productionTravelMinutes,
      resolvedByFacilityId: resolvedMap([...selection]),
      travelPolicy: "demo_legacy_d",
    });
    assert.equal(result.orderAB.kind, "feasibility");
    assert.equal(result.orderBA.kind, "feasibility");
    if (
      result.orderAB.kind === "feasibility" &&
      result.orderBA.kind === "feasibility"
    ) {
      assert.equal(
        result.orderAB.ledger.requiredMinutes,
        result.orderBA.ledger.requiredMinutes,
      );
    }
  });

  it("T-E1-03/04: classification boundaries at margin 0 and 10", () => {
    const facilitiesById = facilitiesMap();
    const selection = [
      "sfo-t2-d-burger-joint",
      "sfo-t2-d-wakaba",
    ] as const;
    const resolved = resolvedMap([...selection]);
    const tight = evaluateTwoStopPairLegacy({
      context: { ...baseContext, minutesUntilBoarding: 55 },
      selection,
      facilitiesById,
      travelTimes: productionTravelMinutes,
      resolvedByFacilityId: resolved,
      travelPolicy: "demo_legacy_d",
    });
    assert.equal(
      tight.orderAB.kind === "feasibility" && tight.orderAB.status,
      "tight_in_model",
    );
    const feasible = evaluateTwoStopPairLegacy({
      context: { ...baseContext, minutesUntilBoarding: 65 },
      selection,
      facilitiesById,
      travelTimes: productionTravelMinutes,
      resolvedByFacilityId: resolved,
      travelPolicy: "demo_legacy_d",
    });
    assert.equal(
      feasible.orderAB.kind === "feasibility" && feasible.orderAB.status,
      "feasible_in_model",
    );
  });

  it("T-E1-05: rejects duplicate selection", () => {
    const facilitiesById = facilitiesMap();
    const id = "sfo-t2-d-burger-joint";
    assert.equal(
      validateTwoStopSelection([id, id], facilitiesById, baseContext),
      "duplicate_selection",
    );
  });

  it("T-E1-06: rejects browse-only facility", () => {
    const facilitiesById = facilitiesMap();
    assert.equal(
      validateTwoStopSelection(
        ["sfo-t2-d-burger-joint", "sfo-t2-d-vino-volo"],
        facilitiesById,
        baseContext,
      ),
      "outside_recommend_eligibility",
    );
  });

  it("T-E1-07: strict policy unknown when services missing", () => {
    const facilitiesById = facilitiesMap();
    const selection = [
      "sfo-t2-d-burger-joint",
      "sfo-t2-d-cat-cora",
    ] as const;
    const emptyResolved = new Map<string, ResolvedFacilityDurations>([
      [
        selection[0],
        {
          queueMinutes: null,
          activityMinutes: null,
          queueSource: "unknown",
          activitySource: "unknown",
        },
      ],
      [
        selection[1],
        {
          queueMinutes: null,
          activityMinutes: null,
          queueSource: "unknown",
          activitySource: "unknown",
        },
      ],
    ]);
    const result = evaluateTwoStopPairLegacy({
      context: baseContext,
      selection,
      facilitiesById,
      travelTimes: productionTravelMinutes,
      resolvedByFacilityId: emptyResolved,
      travelPolicy: "strict",
    });
    assert.equal(result.orderAB.kind, "unknown");
    assert.equal(result.orderBA.kind, "unknown");
  });

  it("T-E1-08: strict policy unknown for inter-facility leg even with demo services", () => {
    const facilitiesById = facilitiesMap();
    const selection = [
      "sfo-t2-d-burger-joint",
      "sfo-t2-d-peets-coffee-d7",
    ] as const;
    const result = evaluateTwoStopPairLegacy({
      context: baseContext,
      selection,
      facilitiesById,
      travelTimes: productionTravelMinutes,
      resolvedByFacilityId: resolvedMap([...selection]),
      travelPolicy: "strict",
    });
    assert.equal(result.usesDemoTravelAssumption, false);
    assert.equal(result.orderAB.kind, "unknown");
    if (result.orderAB.kind === "unknown") {
      assert.equal(result.orderAB.unknownReason, "missing_travel_return");
      assert.equal(result.orderAB.ledger.legs[1].minutes, null);
    }
  });

  it("T-E1-08b: queue adjustment applies per stop (d=+7 → margin −14)", () => {
    const facilitiesById = facilitiesMap();
    const selection = [
      "sfo-t2-d-burger-joint",
      "sfo-t2-d-peets-coffee-d7",
    ] as const;
    const baseline = evaluateTwoStopPairLegacy({
      context: baseContext,
      selection,
      facilitiesById,
      travelTimes: productionTravelMinutes,
      resolvedByFacilityId: resolvedMap([...selection]),
      travelPolicy: "demo_legacy_d",
    });
    const adjusted = evaluateTwoStopPairLegacy({
      context: { ...baseContext, queueAdjustmentMinutes: 7 },
      selection,
      facilitiesById,
      travelTimes: productionTravelMinutes,
      resolvedByFacilityId: resolvedMap([...selection]),
      travelPolicy: "demo_legacy_d",
    });
    assert.equal(baseline.orderAB.kind, "feasibility");
    assert.equal(adjusted.orderAB.kind, "feasibility");
    if (
      baseline.orderAB.kind === "feasibility" &&
      adjusted.orderAB.kind === "feasibility"
    ) {
      assert.equal(
        adjusted.orderAB.ledger.marginMinutes -
          baseline.orderAB.ledger.marginMinutes,
        -14,
      );
    }
  });

  it("T-E1-09: applies safety buffer exactly once", () => {
    const facilitiesById = facilitiesMap();
    const selection = [
      "sfo-t2-d-burger-joint",
      "sfo-t2-d-peets-coffee-d7",
    ] as const;
    const result = evaluateTwoStopPairLegacy({
      context: { ...baseContext, bufferMinutes: 0 },
      selection,
      facilitiesById,
      travelTimes: productionTravelMinutes,
      resolvedByFacilityId: resolvedMap([...selection]),
      travelPolicy: "demo_legacy_d",
    });
    assert.equal(result.orderAB.kind, "feasibility");
    if (result.orderAB.kind === "feasibility") {
      assert.equal(result.orderAB.ledger.requiredMinutes, 45);
      assert.equal(result.orderAB.ledger.bufferMinutes, 0);
    }
  });

  it("T-E1-10: documents gap versus summing single-stop totals", () => {
    assert.equal(twoStopVersusSingleStopGapMinutes(34, 34, 55), 13);
    assert.equal(3 + 3 + 10 - 3, 13);
  });

  it("T-E1-11: deterministic evaluation", () => {
    const facilitiesById = facilitiesMap();
    const selection = [
      "sfo-t2-d-lark-creek-grill",
      "sfo-t2-d-wakaba",
    ] as const;
    const input = {
      context: baseContext,
      selection,
      facilitiesById,
      travelTimes: productionTravelMinutes,
      resolvedByFacilityId: resolvedMap([...selection]),
      travelPolicy: "demo_legacy_d" as const,
    };
    const a = JSON.stringify(evaluateTwoStopPairLegacy(input));
    const b = JSON.stringify(evaluateTwoStopPairLegacy(input));
    assert.equal(a, b);
  });

  it("T-E1-12: single-stop recommend engine unchanged (model cafe fixture)", () => {
    const modelCafe: Facility = {
      ...PRODUCTION_T2_D_FACILITY_LOCATION,
      id: "model-cafe",
      name: "Model Cafe",
      zone: "D",
      category: "food",
      securityZone: "post",
      waitMinutes: 8,
      activityMinutes: 10,
      locationConfidence: "demo_estimate",
      timeConfidence: "demo_estimate",
    };
    const [result] = recommendFacilities(
      baseContext,
      [modelCafe],
      productionTravelMinutes,
    );
    assert.equal(result.kind, "feasibility");
    if (result.kind === "feasibility") {
      assert.equal(result.breakdown.requiredMinutes, 34);
      assert.equal(result.breakdown.marginMinutes, 16);
    }
  });
});
