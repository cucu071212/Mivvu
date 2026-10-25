import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  summarizeWhatIfComparisonAnnouncement,
  whatIfMarginDelta,
  whatIfStatusChanged,
} from "./what-if-present";
import { partitionWhatIfComparisons } from "./what-if-compare";
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

  it("summarizes eligible comparison announcements for screen readers", () => {
    const announcement = summarizeWhatIfComparisonAnnouncement([
      {
        facilityId: "a",
        facilityName: "A",
        baseline: row("feasible_in_model", 12),
        scenario: row("tight_in_model", 5),
        explanation: "x",
      },
    ]);
    assert.match(announcement, /1 eligible facilities/);
    assert.match(announcement, /1 status change/);
  });

  it("partitions browse-only rows out of the primary What-if list", () => {
    const { primary, excludedBrowseOnly } = partitionWhatIfComparisons([
      {
        facilityId: "a",
        facilityName: "A",
        baseline: row("feasible_in_model", 12),
        scenario: row("feasible_in_model", 12),
        explanation: "x",
      },
      {
        facilityId: "b",
        facilityName: "B",
        baseline: {
          kind: "ineligible",
          facilityId: "b",
          facilityName: "B",
          category: "food",
          zone: "B",
          locationConfidence: "official_verified",
          timeConfidence: "unknown",
          securityZone: "post",
          ineligibilityReason: "outside_recommend_eligibility",
        },
        scenario: {
          kind: "ineligible",
          facilityId: "b",
          facilityName: "B",
          category: "food",
          zone: "B",
          locationConfidence: "official_verified",
          timeConfidence: "unknown",
          securityZone: "post",
          ineligibilityReason: "outside_recommend_eligibility",
        },
        explanation: "unchanged",
      },
    ]);
    assert.equal(primary.length, 1);
    assert.equal(excludedBrowseOnly.length, 1);
  });
});
