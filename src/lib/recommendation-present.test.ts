import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { ProductionRecommendation } from "@/types/airport";
import {
  formatSignedMinutes,
  ineligibilityReasonLabel,
  recommendationStatusPresentation,
  unknownReasonLabel,
} from "./recommendation-present";

const identity = {
  facilityId: "demo",
  facilityName: "Demo Cafe",
  category: "food" as const,
  zone: "D" as const,
  securityZone: "post" as const,
  locationConfidence: "demo_estimate" as const,
  timeConfidence: "demo_estimate" as const,
};

describe("recommendation presentation (GW-013)", () => {
  it("maps feasible_in_model to accessible status text and chip class", () => {
    const rec: ProductionRecommendation = {
      ...identity,
      kind: "feasibility",
      status: "feasible_in_model",
      breakdown: {
        outboundMinutes: 3,
        returnMinutes: 3,
        queueMinutes: 8,
        activityMinutes: 10,
        bufferMinutes: 10,
        requiredMinutes: 34,
        marginMinutes: 16,
      },
    };
    const view = recommendationStatusPresentation(rec);
    assert.equal(view.chipClass, "gw-status-chip gw-status-feasible");
    assert.match(view.accessibleLabel, /feasible in model/i);
    assert.match(view.accessibleLabel, /does not guarantee/i);
  });

  for (const status of ["tight_in_model", "over_budget"] as const) {
    it(`includes model-only disclaimer for ${status}`, () => {
      const rec: ProductionRecommendation = {
        ...identity,
        kind: "feasibility",
        status,
        breakdown: {
          outboundMinutes: 3,
          returnMinutes: 3,
          queueMinutes: 8,
          activityMinutes: 10,
          bufferMinutes: 10,
          requiredMinutes: 34,
          marginMinutes: status === "tight_in_model" ? 4 : -2,
        },
      };
      assert.match(
        recommendationStatusPresentation(rec).accessibleLabel,
        /does not guarantee/i,
      );
    });
  }

  it("labels unknown recommendations without implying feasibility", () => {
    const rec: ProductionRecommendation = {
      ...identity,
      kind: "unknown",
      unknownReason: "missing_queue_estimate",
      breakdown: {
        outboundMinutes: 3,
        returnMinutes: 3,
        queueMinutes: null,
        activityMinutes: 10,
        bufferMinutes: 10,
        requiredMinutes: null,
        marginMinutes: null,
      },
    };
    const view = recommendationStatusPresentation(rec);
    assert.equal(view.chipClass, "gw-status-chip gw-status-unknown");
    assert.match(view.accessibleLabel, /unknown/i);
    assert.doesNotMatch(view.accessibleLabel, /feasible/i);
  });

  it("maps ineligibility codes to plain language", () => {
    assert.match(
      ineligibilityReasonLabel("security_zone_pre_only"),
      /pre-security/i,
    );
  });

  it("maps unknown reason codes without inventing minutes", () => {
    assert.match(unknownReasonLabel("missing_travel_outbound"), /outbound/i);
    assert.equal(formatSignedMinutes(null), "Not modeled");
    assert.equal(formatSignedMinutes(8), "+8 min");
    assert.equal(formatSignedMinutes(-3), "−3 min");
  });
});
