import { describe, expect, it } from "vitest";
import facilitiesJson from "@/data/facilities.json";
import { productionTravelMinutes, productionTravelMatrixMetadata } from "@/data/travel-times";
import { prepareProductionFacilities } from "@/lib/browse-integration";
import { recommendFacilitiesWithPersonalization } from "@/lib/recommend-facilities-with-personalization";
import type { FacilityDurationOverrideMap, UserContext } from "@/types/airport";

const context: UserContext = Object.freeze({
  gateZone: "D",
  minutesUntilBoarding: 50,
  bufferMinutes: 10,
  queueAdjustmentMinutes: 0,
  passengerSecurityArea: "post",
});

describe("production recommendation red-team invariants", () => {
  it("cannot promote any of the 14 browse-only facilities with zero overrides or demo mode", () => {
    const { facilities, datasetErrors } = prepareProductionFacilities(facilitiesJson);
    expect(datasetErrors).toEqual([]);
    expect(facilities.filter((facility) => facility.browseEligible)).toHaveLength(26);
    const overrides: FacilityDurationOverrideMap = Object.fromEntries(facilities.map((facility) => [
      facility.id, { facilityId: facility.id, queueMinutes: 0, activityMinutes: 0 },
    ]));
    for (const useDemoTimeEstimates of [false, true]) {
      const rows = recommendFacilitiesWithPersonalization(
        { ...context, minutesUntilBoarding: 1440, queueAdjustmentMinutes: -1440 },
        facilities, productionTravelMinutes, { overrides, useDemoTimeEstimates },
      );
      expect(rows.filter((row) => row.kind === "feasibility")).toHaveLength(12);
      expect(rows.filter((row) => row.kind === "ineligible")).toHaveLength(14);
      for (const facility of facilities) {
        const row = rows.find((candidate) => candidate.facilityId === facility.id)!;
        expect(row.kind).toBe(facility.recommendEligible ? "feasibility" : "ineligible");
        if (row.kind === "feasibility") expect(row.zone).toBe("D");
      }
    }
    expect(productionTravelMatrixMetadata.timeConfidence).toBe("demo_estimate");
  });

  it("keeps repeated scenarios independent and restores unknowns when overrides are reset", () => {
    const { facilities } = prepareProductionFacilities(facilitiesJson);
    const facility = Object.freeze(facilities.find((row) => row.id === "sfo-t2-d-brookstone")!);
    const input = Object.freeze([facility]);
    const overrides = Object.freeze({
      [facility.id]: Object.freeze({ facilityId: facility.id, queueMinutes: 5, activityMinutes: 12 }),
    });
    const before = JSON.stringify({ input, overrides, context, productionTravelMinutes });
    // 3 outbound + 3 return + max(0, 5 + delta) queue + 12 activity + 10 buffer.
    for (const [delta, required, margin] of [[0, 33, 17], [7, 40, 10], [-100, 28, 22], [7, 40, 10], [0, 33, 17]]) {
      const [row] = recommendFacilitiesWithPersonalization(
        { ...context, queueAdjustmentMinutes: delta }, input, productionTravelMinutes,
        { overrides, useDemoTimeEstimates: true },
      );
      expect(row).toMatchObject({ kind: "feasibility", breakdown: { requiredMinutes: required, marginMinutes: margin } });
    }
    expect(recommendFacilitiesWithPersonalization(context, input, productionTravelMinutes,
      { overrides: {}, useDemoTimeEstimates: false })[0]).toMatchObject({
      kind: "unknown", breakdown: { queueMinutes: null, activityMinutes: null, requiredMinutes: null },
    });
    expect(recommendFacilitiesWithPersonalization(context, input, productionTravelMinutes,
      { overrides: {}, useDemoTimeEstimates: true })[0]).toMatchObject({
      kind: "feasibility", breakdown: { requiredMinutes: 34, marginMinutes: 16 },
    });
    expect(JSON.stringify({ input, overrides, context, productionTravelMinutes })).toBe(before);
  });
});
