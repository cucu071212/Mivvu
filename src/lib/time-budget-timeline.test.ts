import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { buildTimeBudgetTimeline } from "./time-budget-timeline";
import type { ProductionFeasibilityRecommendation } from "@/types/airport";

function feasibilityFixture(
  overrides: Partial<ProductionFeasibilityRecommendation["breakdown"]> = {},
): ProductionFeasibilityRecommendation {
  return {
    kind: "feasibility",
    facilityId: "sfo-t2-d-burger-joint",
    facilityName: "Burger Joint",
    category: "food",
    zone: "D",
    locationConfidence: "official_verified",
    timeConfidence: "demo_estimate",
    securityZone: "post",
    status: "feasible_in_model",
    breakdown: {
      outboundMinutes: 5,
      returnMinutes: 5,
      queueMinutes: 8,
      activityMinutes: 10,
      bufferMinutes: 10,
      requiredMinutes: 38,
      marginMinutes: 12,
      ...overrides,
    },
  };
}

describe("buildTimeBudgetTimeline", () => {
  it("combines walking legs and includes margin segment for feasible outcomes", () => {
    const model = buildTimeBudgetTimeline(feasibilityFixture());
    assert.ok(model);
    const walk = model!.segments.find((s) => s.id === "walk");
    assert.equal(walk?.minutes, 10);
    const margin = model!.segments.find((s) => s.id === "margin");
    assert.equal(margin?.minutes, 12);
    assert.equal(margin?.tone, "margin-positive");
    assert.equal(model!.requiredMinutes, 38);
    assert.equal(model!.marginMinutes, 12);
  });

  it("marks negative margin tone without inventing zero-filled legs", () => {
    const model = buildTimeBudgetTimeline(
      feasibilityFixture({ marginMinutes: -3, requiredMinutes: 41 }),
    );
    const margin = model!.segments.find((s) => s.id === "margin");
    assert.equal(margin?.tone, "margin-negative");
    assert.equal(margin?.minutes, 3);
  });

  it("lists missing components for unknown breakdowns instead of zero-filling", () => {
    const model = buildTimeBudgetTimeline({
      kind: "unknown",
      facilityId: "x",
      facilityName: "X",
      category: "food",
      zone: "D",
      locationConfidence: "official_verified",
      timeConfidence: "unknown",
      securityZone: "post",
      unknownReason: "missing_queue_estimate",
      breakdown: {
        outboundMinutes: 5,
        returnMinutes: 5,
        queueMinutes: null,
        activityMinutes: null,
        bufferMinutes: 10,
        requiredMinutes: null,
        marginMinutes: null,
      },
    });
    assert.ok(model!.missingLabels.some((l) => /queue/i.test(l)));
    assert.equal(model!.marginMinutes, null);
    assert.ok(!model!.segments.some((s) => s.id === "margin"));
  });

  it("lists the missing directed leg when only one walking leg is known", () => {
    const outboundOnly = buildTimeBudgetTimeline({
      kind: "unknown",
      facilityId: "x",
      facilityName: "X",
      category: "food",
      zone: "D",
      locationConfidence: "official_verified",
      timeConfidence: "unknown",
      securityZone: "post",
      unknownReason: "missing_travel_return",
      breakdown: {
        outboundMinutes: 5,
        returnMinutes: null,
        queueMinutes: 8,
        activityMinutes: 10,
        bufferMinutes: 10,
        requiredMinutes: null,
        marginMinutes: null,
      },
    });
    assert.ok(outboundOnly!.missingLabels.includes("Return walking time"));
    assert.equal(outboundOnly!.segments.find((s) => s.id === "walk-out")?.minutes, 5);

    const returnOnly = buildTimeBudgetTimeline({
      kind: "unknown",
      facilityId: "x",
      facilityName: "X",
      category: "food",
      zone: "D",
      locationConfidence: "official_verified",
      timeConfidence: "unknown",
      securityZone: "post",
      unknownReason: "missing_travel_outbound",
      breakdown: {
        outboundMinutes: null,
        returnMinutes: 5,
        queueMinutes: 8,
        activityMinutes: 10,
        bufferMinutes: 10,
        requiredMinutes: null,
        marginMinutes: null,
      },
    });
    assert.ok(returnOnly!.missingLabels.includes("Outbound walking time"));
  });

  it("labels negative margin segments as deficits", () => {
    const model = buildTimeBudgetTimeline(
      feasibilityFixture({ marginMinutes: -6, requiredMinutes: 41 }),
    );
    const margin = model!.segments.find((s) => s.id === "margin");
    assert.equal(margin?.label, "Time deficit (model)");
    assert.equal(margin?.minutes, 6);
  });

  it("returns null for ineligible recommendations", () => {
    assert.equal(
      buildTimeBudgetTimeline({
        kind: "ineligible",
        facilityId: "x",
        facilityName: "X",
        category: "shop",
        zone: "D",
        locationConfidence: "official_verified",
        timeConfidence: "unknown",
        securityZone: "pre",
        ineligibilityReason: "passenger_not_airside",
      }),
      null,
    );
  });
});
