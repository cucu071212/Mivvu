import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { UserContext } from "@/types/airport";
import { productionTravelMinutes } from "@/data/travel-times";
import { prepareProductionFacilities } from "./browse-integration";
import { applyDemoTimeEstimates } from "./demo-estimate-facilities";
import { buildRankedRecommendations } from "./recommendation-page-integration";

const context: UserContext = {
  gateZone: "D",
  minutesUntilBoarding: 50,
  bufferMinutes: 10,
  queueAdjustmentMinutes: 0,
  passengerSecurityArea: "post",
};

function loadOfficialFacilities() {
  const raw = JSON.parse(
    readFileSync(new URL("../data/facilities.json", import.meta.url), "utf8"),
  );
  return prepareProductionFacilities(raw).facilities;
}

describe("recommendation page integration (GW-014)", () => {
  it("keeps official records unknown when demo estimates are off", () => {
    const facilities = loadOfficialFacilities();
    const recommendations = buildRankedRecommendations({
      context,
      facilities,
      filter: {},
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: false,
    });
    assert.equal(recommendations.length, 23);
    assert.equal(
      recommendations.filter((row) => row.kind === "unknown").length,
      12,
    );
    assert.equal(
      recommendations.filter(
        (row) =>
          row.kind === "ineligible" &&
          row.ineligibilityReason === "outside_recommend_eligibility",
      ).length,
      6,
    );
    assert.equal(
      recommendations.filter(
        (row) =>
          row.kind === "ineligible" &&
          row.ineligibilityReason === "outside_supported_zone",
      ).length,
      5,
    );
    assert.ok(
      facilities.every((row) => row.waitMinutes === null && row.activityMinutes === null),
    );
  });

  it("does not mutate the official facility array when demo estimates are on", () => {
    const facilities = loadOfficialFacilities();
    const before = facilities.map((row) => ({
      wait: row.waitMinutes,
      activity: row.activityMinutes,
      confidence: row.timeConfidence,
    }));
    buildRankedRecommendations({
      context,
      facilities,
      filter: {},
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: true,
    });
    assert.deepEqual(
      facilities.map((row) => ({
        wait: row.waitMinutes,
        activity: row.activityMinutes,
        confidence: row.timeConfidence,
      })),
      before,
    );
  });

  it("produces feasibility outcomes when demo estimates are on", () => {
    const facilities = loadOfficialFacilities();
    const recommendations = buildRankedRecommendations({
      context,
      facilities,
      filter: {},
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: true,
    });
    assert.ok(recommendations.some((row) => row.kind === "feasibility"));
    const feasible = recommendations.find(
      (row) => row.kind === "feasibility" && row.status === "feasible_in_model",
    );
    assert.ok(feasible);
  });

  it("shifts a facility across tight and over-budget thresholds as minutes change", () => {
    const facilities = loadOfficialFacilities();
    const [sample] = applyDemoTimeEstimates(facilities);
    const tight = buildRankedRecommendations({
      context: { ...context, minutesUntilBoarding: 43 },
      facilities: [sample],
      filter: {},
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: true,
    })[0];
    const over = buildRankedRecommendations({
      context: { ...context, minutesUntilBoarding: 33 },
      facilities: [sample],
      filter: {},
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: true,
    })[0];
    assert.equal(tight.kind, "feasibility");
    assert.equal(over.kind, "feasibility");
    if (tight.kind === "feasibility" && over.kind === "feasibility") {
      assert.equal(tight.status, "tight_in_model");
      assert.equal(over.status, "over_budget");
    }
  });

  it("preserves engine ranking order for mixed feasibility statuses", () => {
    const facilities = loadOfficialFacilities();
    const demo = applyDemoTimeEstimates(facilities);
    const recommendations = buildRankedRecommendations({
      context: { ...context, minutesUntilBoarding: 40 },
      facilities: demo,
      filter: {},
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: false,
    });
    const statuses = recommendations
      .filter((row) => row.kind === "feasibility")
      .map((row) => (row.kind === "feasibility" ? row.status : ""));
    const rank = (status: string) =>
      status === "feasible_in_model"
        ? 0
        : status === "tight_in_model"
          ? 1
          : 2;
    for (let index = 1; index < statuses.length; index += 1) {
      assert.ok(rank(statuses[index - 1]) <= rank(statuses[index]));
    }
  });

  it("applies name/category filters before ranking", () => {
    const facilities = loadOfficialFacilities();
    const recommendations = buildRankedRecommendations({
      context,
      facilities,
      filter: { text: "Peet" },
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: true,
    });
    assert.equal(recommendations.length, 2);
    assert.ok(
      recommendations.every((row) => row.facilityName.includes("Peet")),
    );
  });
});
