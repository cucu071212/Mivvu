import { describe, expect, it } from "vitest";
import {
  PRODUCTION_D_TO_D_DEMO_MINUTES_PER_LEG,
  productionLegacyTravelMode,
  productionTravelEdgeMetadata,
  productionTravelMatrixMetadata,
  productionTravelMinutes,
} from "@/data/travel-times";
import {
  APPROVED_LEGACY_RECOMMEND_FACILITY_IDS,
  APPROVED_LEGACY_RECOMMEND_MANIFEST_VERSION,
} from "@/data/approved-recommend-facility-ids";
import { prepareProductionFacilities } from "@/lib/browse-integration";
import { recommendFacilitiesWithPersonalization } from "@/lib/recommend-facilities-with-personalization";
import facilitiesJson from "@/data/facilities.json";
import type { UserContext } from "@/types/airport";

const context: UserContext = {
  gateZone: "D",
  minutesUntilBoarding: 50,
  bufferMinutes: 10,
  queueAdjustmentMinutes: 0,
  passengerSecurityArea: "post",
};

describe("GW-B-002 production travel metadata", () => {
  it("exposes legacy_zone mode without changing D→D demo minutes", () => {
    expect(productionLegacyTravelMode).toEqual({
      kind: "legacy_zone",
      gateZone: "D",
      modelId: "legacy-d-demo-v1",
    });
    expect(productionTravelMinutes.D.D).toBe(
      PRODUCTION_D_TO_D_DEMO_MINUTES_PER_LEG,
    );
    expect(productionTravelMinutes.D.D).toBe(3);
  });

  it("labels the sole production edge with demo_estimate provenance and directed asymmetry note", () => {
    const edge = productionTravelEdgeMetadata.D.D;
    expect(edge).toBeDefined();
    if (!edge) throw new Error("missing D→D edge metadata");
    expect(edge.fromZone).toBe("D");
    expect(edge.toZone).toBe("D");
    expect(edge.minutes).toBe(3);
    expect(edge.timeConfidence).toBe("demo_estimate");
    expect(edge.directed).toBe(true);
    expect(edge.reverseMinutes).toBe(3);
    expect(edge.asymmetryNote).toMatch(/outbound.*return/i);
    expect(edge.provenanceRefs.length).toBeGreaterThanOrEqual(2);
    expect(edge.provenanceRefs.some((ref) => ref.kind === "policy_doc")).toBe(
      true,
    );
    expect(productionTravelMatrixMetadata.travelMode).toEqual(
      productionLegacyTravelMode,
    );
  });

  it("pins the versioned 12-ID recommend manifest used by regression guards", () => {
    expect(APPROVED_LEGACY_RECOMMEND_MANIFEST_VERSION).toBe("legacy-d-v1");
    expect(APPROVED_LEGACY_RECOMMEND_FACILITY_IDS).toHaveLength(12);
    const { facilities, datasetErrors } = prepareProductionFacilities(facilitiesJson);
    expect(datasetErrors).toEqual([]);
    const eligibleIds = facilities
      .filter((row) => row.recommendEligible)
      .map((row) => row.id)
      .sort();
    expect(eligibleIds).toEqual([...APPROVED_LEGACY_RECOMMEND_FACILITY_IDS].sort());
  });

  it("keeps directed travel legs at 3+3 minutes for all approved IDs under demo estimates", () => {
    const { facilities } = prepareProductionFacilities(facilitiesJson);
    const legacy = facilities.filter((row) =>
      (APPROVED_LEGACY_RECOMMEND_FACILITY_IDS as readonly string[]).includes(
        row.id,
      ),
    );
    expect(legacy).toHaveLength(12);
    const rows = recommendFacilitiesWithPersonalization(
      context,
      legacy,
      productionTravelMinutes,
      { overrides: {}, useDemoTimeEstimates: true },
    );
    expect(rows.every((row) => row.kind === "feasibility")).toBe(true);
    for (const row of rows) {
      if (row.kind !== "feasibility") continue;
      expect(row.breakdown.outboundMinutes).toBe(3);
      expect(row.breakdown.returnMinutes).toBe(3);
      expect(row.breakdown.bufferMinutes).toBe(10);
    }
    const brookstone = rows.find(
      (row) => row.facilityId === "sfo-t2-d-brookstone",
    );
    expect(brookstone).toMatchObject({
      kind: "feasibility",
      breakdown: { requiredMinutes: 34, marginMinutes: 16 },
    });
  });
});
