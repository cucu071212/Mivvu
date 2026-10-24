import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { UserContext } from "@/types/airport";
import { productionTravelMinutes } from "@/data/travel-times";
import { applyDemoTimeEstimates } from "./demo-estimate-facilities";
import { buildRankedRecommendations } from "./recommendation-page-integration";
import {
  buildWhatIfInputSummary,
  compareRecommendationRuns,
  recommendationOutcomeLabel,
} from "./what-if-compare";

const context: UserContext = {
  gateZone: "D",
  minutesUntilBoarding: 50,
  bufferMinutes: 10,
  queueAdjustmentMinutes: 0,
  passengerSecurityArea: "post",
};

const facility = {
  id: "sample",
  name: "Sample Cafe",
  zone: "D" as const,
  category: "food" as const,
  securityZone: "post" as const,
  waitMinutes: 8,
  activityMinutes: 10,
  locationConfidence: "demo_estimate" as const,
  timeConfidence: "demo_estimate" as const,
};

describe("what-if comparison (GW-017)", () => {
  it("uses independent recommendFacilities runs for baseline and scenario", () => {
    const baseline = buildRankedRecommendations({
      context,
      facilities: [facility],
      filter: {},
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: true,
    });
    const scenario = buildRankedRecommendations({
      context: { ...context, minutesUntilBoarding: 33 },
      facilities: [facility],
      filter: {},
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: true,
    });
    const comparisons = compareRecommendationRuns(baseline, scenario);
    assert.equal(comparisons.length, 1);
    assert.equal(recommendationOutcomeLabel(baseline[0]), "feasible_in_model");
    assert.equal(recommendationOutcomeLabel(scenario[0]), "over_budget");
  });

  it("reduces margin by 7 when queue adjustment increases by 7", () => {
    const baseline = buildRankedRecommendations({
      context,
      facilities: [facility],
      filter: {},
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: true,
    });
    const scenario = buildRankedRecommendations({
      context: { ...context, queueAdjustmentMinutes: 7 },
      facilities: [facility],
      filter: {},
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: true,
    });
    const before = baseline[0];
    const after = scenario[0];
    assert.equal(before.kind, "feasibility");
    assert.equal(after.kind, "feasibility");
    if (before.kind === "feasibility" && after.kind === "feasibility") {
      assert.equal(
        before.breakdown.marginMinutes - after.breakdown.marginMinutes,
        7,
      );
    }
  });

  it("keeps unknown outcomes when demo estimates are disabled", () => {
    const official = {
      ...facility,
      waitMinutes: null,
      activityMinutes: null,
      timeConfidence: "unknown" as const,
    };
    const baseline = buildRankedRecommendations({
      context,
      facilities: [official],
      filter: {},
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: false,
    });
    const scenario = buildRankedRecommendations({
      context: { ...context, minutesUntilBoarding: 35, queueAdjustmentMinutes: 7 },
      facilities: [official],
      filter: {},
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: false,
    });
    assert.equal(baseline[0].kind, "unknown");
    assert.equal(scenario[0].kind, "unknown");
    const [comparison] = compareRecommendationRuns(baseline, scenario);
    assert.match(comparison.explanation, /unchanged/i);
  });

  it("summarizes which boarding and queue inputs changed", () => {
    const summary = buildWhatIfInputSummary(context, {
      ...context,
      minutesUntilBoarding: 35,
      queueAdjustmentMinutes: -3,
    });
    assert.match(summary, /boarding/i);
    assert.match(summary, /queue/i);
  });

  it("does not mutate source facilities when building scenario runs", () => {
    const facilities = applyDemoTimeEstimates([facility]);
    const before = facilities[0].waitMinutes;
    buildRankedRecommendations({
      context: { ...context, queueAdjustmentMinutes: 5 },
      facilities: [facility],
      filter: {},
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: true,
    });
    assert.equal(facilities[0].waitMinutes, before);
  });
});
