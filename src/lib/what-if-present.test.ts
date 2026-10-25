import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { whatIfMarginDelta, whatIfStatusChanged } from "./what-if-present";
import type { ProductionFeasibilityRecommendation } from "@/types/airport";

function row(
  status: ProductionFeasibilityRecommendation["status"],
  margin: number,
): ProductionFeasibilityRecommendation {
  return {
    kind: "feasibility",
    facilityId: "a",
    facilityName: "A",
    category: "food",
    zone: "D",
    locationConfidence: "official_verified",
    timeConfidence: "demo_estimate",
    securityZone: "post",
    status,
    breakdown: {
      outboundMinutes: 5,
      returnMinutes: 5,
      queueMinutes: 8,
      activityMinutes: 10,
      bufferMinutes: 10,
      requiredMinutes: 38,
      marginMinutes: margin,
    },
  };
}

describe("what-if-present", () => {
  it("detects feasibility status changes", () => {
    assert.equal(
      whatIfStatusChanged(
        row("feasible_in_model", 12),
        row("tight_in_model", 5),
      ),
      true,
    );
    assert.equal(
      whatIfStatusChanged(row("feasible_in_model", 12), row("feasible_in_model", 9)),
      false,
    );
  });

  it("computes margin delta only when both margins are modeled", () => {
    assert.equal(
      whatIfMarginDelta(row("feasible_in_model", 10), row("feasible_in_model", 6)),
      -4,
    );
    assert.equal(
      whatIfMarginDelta(
        { kind: "unknown", facilityId: "x", facilityName: "X", category: "food", zone: "D", locationConfidence: "official_verified", timeConfidence: "unknown", securityZone: "post", unknownReason: "missing_queue_estimate", breakdown: { outboundMinutes: 5, returnMinutes: 5, queueMinutes: null, activityMinutes: null, bufferMinutes: 10, requiredMinutes: null, marginMinutes: null } },
        row("feasible_in_model", 6),
      ),
      null,
    );
  });
});
