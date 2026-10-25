import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";
import { APPROVED_LEGACY_RECOMMEND_FACILITY_IDS } from "@/data/approved-recommend-facility-ids";
import {
  listTwoStopEligibleFacilities,
  runTwoStopPlannerEvaluation,
  travelPolicyFromDemoOptIn,
} from "@/lib/two-stop-planner-integration";
import { validateFacilities } from "@/lib/validate-facilities";
import type { ResolvedFacilityDurations, UserContext } from "@/types/airport";

const productionJson = JSON.parse(
  readFileSync(new URL("../data/facilities.json", import.meta.url), "utf8"),
) as unknown;

const context: UserContext = {
  gateZone: "D",
  minutesUntilBoarding: 50,
  bufferMinutes: 10,
  queueAdjustmentMinutes: 0,
  passengerSecurityArea: "post",
};

function demoResolved(): ResolvedFacilityDurations {
  return {
    queueMinutes: 8,
    activityMinutes: 10,
    queueSource: "demo_estimate",
    activitySource: "demo_estimate",
  };
}

describe("two-stop-planner-integration", () => {
  it("lists exactly the 12 approved legacy facilities", () => {
    const { facilities } = validateFacilities(productionJson);
    const eligible = listTwoStopEligibleFacilities(facilities);
    assert.equal(eligible.length, 12);
    assert.deepEqual(
      eligible.map((f) => f.id).sort(),
      [...APPROVED_LEGACY_RECOMMEND_FACILITY_IDS].sort(),
    );
  });

  it("returns incomplete state until two stops are chosen", () => {
    const { facilities } = validateFacilities(productionJson);
    const map = new Map(facilities.map((f) => [f.id, f]));
    const resolved = new Map<string, ResolvedFacilityDurations>();
    const state = runTwoStopPlannerEvaluation({
      context,
      stopAId: "",
      stopBId: "",
      facilitiesById: map,
      resolvedByFacilityId: resolved,
      travelPolicy: "strict",
    });
    assert.equal(state.phase, "incomplete");
  });

  it("strict policy yields unknown for inter-facility leg with demo services", () => {
    const { facilities } = validateFacilities(productionJson);
    const map = new Map(facilities.map((f) => [f.id, f]));
    const ids = [
      "sfo-t2-d-burger-joint",
      "sfo-t2-d-peets-coffee-d7",
    ] as const;
    const resolved = new Map<string, ResolvedFacilityDurations>();
    for (const id of ids) resolved.set(id, demoResolved());
    const state = runTwoStopPlannerEvaluation({
      context,
      stopAId: ids[0],
      stopBId: ids[1],
      facilitiesById: map,
      resolvedByFacilityId: resolved,
      travelPolicy: "strict",
    });
    assert.equal(state.phase, "ready");
    if (state.phase === "ready") {
      assert.equal(state.evaluation.travelPolicy, "strict");
      assert.equal(state.evaluation.orderAB.kind, "unknown");
      assert.equal(state.evaluation.orderBA.kind, "unknown");
      assert.equal(state.evaluation.bestModeledOrder, null);
    }
  });

  it("demo opt-in enables demo_legacy_d and feasibility math", () => {
    assert.equal(travelPolicyFromDemoOptIn(false), "strict");
    assert.equal(travelPolicyFromDemoOptIn(true), "demo_legacy_d");
    const { facilities } = validateFacilities(productionJson);
    const map = new Map(facilities.map((f) => [f.id, f]));
    const ids = [
      "sfo-t2-d-burger-joint",
      "sfo-t2-d-peets-coffee-d7",
    ] as const;
    const resolved = new Map<string, ResolvedFacilityDurations>();
    for (const id of ids) resolved.set(id, demoResolved());
    const state = runTwoStopPlannerEvaluation({
      context,
      stopAId: ids[0],
      stopBId: ids[1],
      facilitiesById: map,
      resolvedByFacilityId: resolved,
      travelPolicy: "demo_legacy_d",
    });
    assert.equal(state.phase, "ready");
    if (state.phase === "ready") {
      assert.equal(state.evaluation.usesDemoTravelAssumption, true);
      assert.equal(state.evaluation.orderAB.kind, "feasibility");
      if (state.evaluation.orderAB.kind === "feasibility") {
        assert.equal(state.evaluation.orderAB.ledger.requiredMinutes, 55);
        assert.equal(state.evaluation.orderAB.ledger.bufferMinutes, 10);
      }
    }
  });

  it("evaluates both visit orders independently", () => {
    const { facilities } = validateFacilities(productionJson);
    const map = new Map(facilities.map((f) => [f.id, f]));
    const ids = [
      "sfo-t2-d-burger-joint",
      "sfo-t2-d-wakaba",
    ] as const;
    const resolved = new Map<string, ResolvedFacilityDurations>();
    for (const id of ids) resolved.set(id, demoResolved());
    const state = runTwoStopPlannerEvaluation({
      context: { ...context, minutesUntilBoarding: 65 },
      stopAId: ids[0],
      stopBId: ids[1],
      facilitiesById: map,
      resolvedByFacilityId: resolved,
      travelPolicy: "demo_legacy_d",
    });
    assert.equal(state.phase, "ready");
    if (state.phase === "ready") {
      assert.equal(state.evaluation.orderAB.kind, "feasibility");
      assert.equal(state.evaluation.orderBA.kind, "feasibility");
      assert.ok(state.evaluation.bestModeledOrder);
    }
  });

  it("missing queue/activity stays unknown under demo travel", () => {
    const { facilities } = validateFacilities(productionJson);
    const map = new Map(facilities.map((f) => [f.id, f]));
    const ids = [
      "sfo-t2-d-burger-joint",
      "sfo-t2-d-peets-coffee-d7",
    ] as const;
    const empty = new Map<string, ResolvedFacilityDurations>([
      [
        ids[0],
        {
          queueMinutes: null,
          activityMinutes: null,
          queueSource: "unknown",
          activitySource: "unknown",
        },
      ],
      [
        ids[1],
        {
          queueMinutes: null,
          activityMinutes: null,
          queueSource: "unknown",
          activitySource: "unknown",
        },
      ],
    ]);
    const state = runTwoStopPlannerEvaluation({
      context,
      stopAId: ids[0],
      stopBId: ids[1],
      facilitiesById: map,
      resolvedByFacilityId: empty,
      travelPolicy: "demo_legacy_d",
    });
    assert.equal(state.phase, "ready");
    if (state.phase === "ready") {
      assert.equal(state.evaluation.orderAB.kind, "unknown");
    }
  });
});
