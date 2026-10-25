import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  guidanceForUnknownOrder,
  guidanceForUnknownPair,
  interFacilityLegIsMissing,
} from "@/lib/two-stop-unknown-guidance";
import type { TwoStopOrderResult, TwoStopPairEvaluation } from "@/types/two-stop-plan";

function unknownPairStub(
  travelPolicy: "strict" | "demo_legacy_d",
): TwoStopPairEvaluation {
  const unknownOrder = {
    kind: "unknown" as const,
    unknownReason: "missing_travel_return" as const,
    ledger: {
      order: ["a", "b"] as const,
      legs: [
        {
          kind: "gate_to_stop" as const,
          fromFacilityId: "gate" as const,
          toFacilityId: "a",
          minutes: 3,
          timeConfidence: "demo_estimate" as const,
          provenanceNote: "",
          isDemoTravelAssumption: true,
        },
        {
          kind: "stop_to_stop" as const,
          fromFacilityId: "a",
          toFacilityId: "b",
          minutes: travelPolicy === "strict" ? null : 3,
          timeConfidence: "demo_estimate" as const,
          provenanceNote: "",
          isDemoTravelAssumption: travelPolicy === "demo_legacy_d",
        },
        {
          kind: "stop_to_gate" as const,
          fromFacilityId: "b",
          toFacilityId: "gate" as const,
          minutes: 3,
          timeConfidence: "demo_estimate" as const,
          provenanceNote: "",
          isDemoTravelAssumption: true,
        },
      ] as const,
      stops: [
        {
          facilityId: "a",
          facilityName: "A",
          queueMinutes: 8,
          activityMinutes: 10,
          queueSource: "demo_estimate" as const,
          activitySource: "demo_estimate" as const,
        },
        {
          facilityId: "b",
          facilityName: "B",
          queueMinutes: 8,
          activityMinutes: 10,
          queueSource: "demo_estimate" as const,
          activitySource: "demo_estimate" as const,
        },
      ],
      bufferMinutes: 10,
      requiredMinutes: null,
      marginMinutes: null,
    },
  } satisfies TwoStopOrderResult;
  return {
    facilityIds: ["a", "b"],
    orderAB: unknownOrder,
    orderBA: unknownOrder,
    bestModeledOrder: null,
    travelMode: "legacy_zone",
    travelPolicy,
    usesDemoTravelAssumption: travelPolicy === "demo_legacy_d",
    modelDisclaimer: "demo",
  };
}

describe("two-stop-unknown-guidance", () => {
  it("detects strict inter-facility missing leg", () => {
    const evaluation = unknownPairStub("strict");
    assert.equal(interFacilityLegIsMissing(evaluation.orderAB), true);
    const hints = guidanceForUnknownOrder(evaluation.orderAB, "strict");
    assert.ok(
      hints.some((row) => row.category === "inter_facility_travel"),
    );
  });

  it("aggregates pair guidance without duplicate categories", () => {
    const evaluation = unknownPairStub("strict");
    const hints = guidanceForUnknownPair(evaluation, true);
    const categories = hints.map((row) => row.category);
    assert.equal(new Set(categories).size, categories.length);
  });

  it("suggests Flight link when queue/activity missing", () => {
    const evaluation = unknownPairStub("demo_legacy_d");
    assert.equal(evaluation.orderAB.kind, "unknown");
    const base = evaluation.orderAB;
    evaluation.orderAB = {
      kind: "unknown",
      unknownReason: "missing_queue_estimate",
      ledger: {
        ...base.ledger,
        stops: [
          {
            ...base.ledger.stops[0],
            queueMinutes: null,
            queueSource: "unknown",
          },
          base.ledger.stops[1],
        ],
      },
    };
    const hints = guidanceForUnknownPair(evaluation, false);
    assert.ok(hints.some((row) => row.actionHref === "/"));
  });
});
