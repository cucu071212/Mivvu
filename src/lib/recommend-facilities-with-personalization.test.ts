import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { UserContext } from "@/types/airport";
import { productionTravelMinutes } from "@/data/travel-times";
import { prepareProductionFacilities } from "./browse-integration";
import { buildRankedRecommendations } from "./recommendation-page-integration";
import { resolveFacilityDurations } from "./resolve-facility-durations";
import {
  DEMO_ACTIVITY_MINUTES,
  DEMO_QUEUE_MINUTES,
} from "./demo-estimate-facilities";

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

describe("GW-F1 personalization integration", () => {
  it("demo on at 50 minutes yields +16 model margin (unchanged MVP)", () => {
    const facilities = loadOfficialFacilities();
    const recommendations = buildRankedRecommendations({
      context,
      facilities,
      filter: { text: "Brookstone" },
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: true,
    });
    assert.equal(recommendations.length, 1);
    const row = recommendations[0];
    assert.equal(row.kind, "feasibility");
    if (row.kind === "feasibility") {
      assert.equal(row.breakdown.marginMinutes, 16);
      assert.equal(row.status, "feasible_in_model");
    }
  });

  it("queue override only leaves activity unknown when demo is off", () => {
    const facilities = loadOfficialFacilities();
    const brookstone = facilities.find((f) => f.id === "sfo-t2-d-brookstone");
    assert.ok(brookstone);
    const resolved = resolveFacilityDurations(brookstone, {
      overrides: {
        "sfo-t2-d-brookstone": {
          facilityId: "sfo-t2-d-brookstone",
          queueMinutes: 5,
        },
      },
      useDemoTimeEstimates: false,
      demoQueueMinutes: DEMO_QUEUE_MINUTES,
      demoActivityMinutes: DEMO_ACTIVITY_MINUTES,
    });
    assert.equal(resolved.queueSource, "user_override");
    assert.equal(resolved.activitySource, "unknown");

    const recommendations = buildRankedRecommendations({
      context,
      facilities,
      filter: { text: "Brookstone" },
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: false,
      durationOverrides: {
        "sfo-t2-d-brookstone": {
          facilityId: "sfo-t2-d-brookstone",
          queueMinutes: 5,
        },
      },
    });
    assert.equal(recommendations[0].kind, "unknown");
  });

  it("user queue override beats demo estimate for that field", () => {
    const facilities = loadOfficialFacilities();
    const recommendations = buildRankedRecommendations({
      context,
      facilities,
      filter: { text: "Brookstone" },
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: true,
      durationOverrides: {
        "sfo-t2-d-brookstone": {
          facilityId: "sfo-t2-d-brookstone",
          queueMinutes: 20,
          activityMinutes: 10,
        },
      },
    });
    const row = recommendations[0];
    assert.equal(row.kind, "feasibility");
    if (row.kind === "feasibility") {
      assert.equal(row.breakdown.queueMinutes, 20);
      assert.equal(row.breakdown.activityMinutes, 10);
    }
  });

  it("explicit zero queue is accepted in overrides", () => {
    const facilities = loadOfficialFacilities();
    const recommendations = buildRankedRecommendations({
      context,
      facilities,
      filter: { text: "Brookstone" },
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: false,
      durationOverrides: {
        "sfo-t2-d-brookstone": {
          facilityId: "sfo-t2-d-brookstone",
          queueMinutes: 0,
          activityMinutes: 12,
        },
      },
    });
    const row = recommendations[0];
    assert.equal(row.kind, "feasibility");
    if (row.kind === "feasibility") {
      assert.equal(row.breakdown.queueMinutes, 0);
      assert.equal(row.breakdown.activityMinutes, 12);
    }
  });
});
