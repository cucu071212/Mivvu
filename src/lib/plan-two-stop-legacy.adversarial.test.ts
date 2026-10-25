import { describe, expect, it } from "vitest";
import { PRODUCTION_T2_D_FACILITY_LOCATION } from "@/data/fixtures/production-facility-defaults";
import { evaluateTwoStopPairLegacy } from "@/lib/plan-two-stop-legacy";
import { recommendFacilities } from "@/lib/recommend";
import type {
  Facility,
  ProductionTravelMatrix,
  ResolvedFacilityDurations,
  UserContext,
} from "@/types/airport";
import type {
  PlanTwoStopLegacyInput,
} from "@/lib/plan-two-stop-legacy";
import type { TwoStopOrderResult } from "@/types/two-stop-plan";

// Synthetic D-zone fixtures only. None of these minutes are airport measurements.
const a: Facility = {
  ...PRODUCTION_T2_D_FACILITY_LOCATION,
  id: "a", name: "Same Name", zone: "D", category: "food",
  securityZone: "post", waitMinutes: 8, activityMinutes: 10,
  locationConfidence: "demo_estimate", timeConfidence: "demo_estimate",
};
const b: Facility = { ...a, id: "b" };
const context: UserContext = {
  gateZone: "D", minutesUntilBoarding: 65, bufferMinutes: 10,
  queueAdjustmentMinutes: 0, passengerSecurityArea: "post",
};
const resolved: ResolvedFacilityDurations = {
  queueMinutes: 8, activityMinutes: 10,
  queueSource: "demo_estimate", activitySource: "demo_estimate",
};
const travelTimes: ProductionTravelMatrix = { D: { D: 3 } };

function input(changes: Partial<PlanTwoStopLegacyInput> = {}): PlanTwoStopLegacyInput {
  return {
    context, selection: ["a", "b"],
    facilitiesById: new Map([["a", a], ["b", b]]),
    travelTimes,
    resolvedByFacilityId: new Map([["a", resolved], ["b", resolved]]),
    travelPolicy: "demo_legacy_d",
    ...changes,
  };
}

function complete(order: TwoStopOrderResult) {
  expect(order.kind).toBe("feasibility");
  if (order.kind !== "feasibility") throw new Error("Expected complete order");
  return order;
}

function unknown(order: TwoStopOrderResult) {
  expect(order.kind).toBe("unknown");
  if (order.kind !== "unknown") throw new Error("Expected unknown order");
  expect(order.ledger.requiredMinutes).toBeNull();
  expect(order.ledger.marginMinutes).toBeNull();
  return order;
}

describe("GW-E1B independent adversarial ledger", () => {
  it.each([
    [54, -1, "over_budget"],
    [55, 0, "tight_in_model"],
    [64, 9, "tight_in_model"],
    [65, 10, "feasible_in_model"],
  ] as const)("E01: T=%i yields margin %i and %s in both orders", (minutes, margin, status) => {
    const result = evaluateTwoStopPairLegacy(input({ context: { ...context, minutesUntilBoarding: minutes } }));
    for (const order of [result.orderAB, result.orderBA]) {
      const value = complete(order);
      expect(value.ledger.requiredMinutes).toBe(55); // 3+8+10+3+8+10+3+10
      expect(value.ledger.marginMinutes).toBe(margin);
      expect(value.status).toBe(status);
    }
  });

  it.each([0, 1, 10, 15])("E03/E55: buffer %i is charged once in either selection order", (buffer) => {
    for (const selection of [["a", "b"], ["b", "a"]] as const) {
      const result = evaluateTwoStopPairLegacy(input({ selection, context: { ...context, bufferMinutes: buffer } }));
      for (const order of [result.orderAB, result.orderBA]) {
        const value = complete(order);
        expect(value.ledger.bufferMinutes).toBe(buffer);
        expect(value.ledger.requiredMinutes).toBe(45 + buffer); // three 3-minute legs + two 18-minute visits
        expect(value.ledger.marginMinutes).toBe(20 - buffer);
        expect(value.ledger.legs).toHaveLength(3);
        expect(value.ledger.stops).toHaveLength(2);
      }
    }
  });

  it("E04: zero boarding minutes remains zero and is over budget", () => {
    const result = evaluateTwoStopPairLegacy(input({ context: { ...context, minutesUntilBoarding: 0 } }));
    for (const order of [result.orderAB, result.orderBA]) {
      const value = complete(order);
      expect(value.ledger.marginMinutes).toBe(-55);
      expect(value.status).toBe("over_budget");
    }
  });

  it("E27: a negative queue adjustment floors both queues at zero", () => {
    const result = evaluateTwoStopPairLegacy(input({ context: { ...context, queueAdjustmentMinutes: -10 } }));
    for (const order of [result.orderAB, result.orderBA]) {
      const value = complete(order);
      expect(value.ledger.stops.map((stop) => stop.queueMinutes)).toEqual([0, 0]);
      expect(value.ledger.requiredMinutes).toBe(39); // 9 travel + 20 activity + 10 buffer
      expect(value.ledger.marginMinutes).toBe(26);
    }
  });

  it.each([-1440, 1440])("E29: unknown queue stays unknown under adjustment %i", (adjustment) => {
    const values = new Map([["a", { ...resolved, queueMinutes: null, queueSource: "unknown" as const }], ["b", resolved]]);
    const result = evaluateTwoStopPairLegacy(input({
      context: { ...context, queueAdjustmentMinutes: adjustment }, resolvedByFacilityId: values,
    }));
    for (const order of [result.orderAB, result.orderBA]) {
      const value = unknown(order);
      expect(value.unknownReason).toBe("missing_queue_estimate");
      expect(value.ledger.stops.find((stop) => stop.facilityId === "a")?.queueMinutes).toBeNull();
    }
  });

  it("E19/E52: unknown activity prevents totals even when known parts exceed the budget", () => {
    const values = new Map([["a", { ...resolved, activityMinutes: null, activitySource: "unknown" as const }], ["b", resolved]]);
    const result = evaluateTwoStopPairLegacy(input({
      context: { ...context, minutesUntilBoarding: 1 }, resolvedByFacilityId: values,
    }));
    for (const order of [result.orderAB, result.orderBA]) {
      expect(unknown(order).unknownReason).toBe("missing_activity_estimate");
    }
  });

  it("E21: explicit zero queue and user sources remain attached to the matching stop", () => {
    const values = new Map<string, ResolvedFacilityDurations>([
      ["a", { queueMinutes: 0, activityMinutes: 5, queueSource: "user_override", activitySource: "user_override" }],
      ["b", { queueMinutes: 1, activityMinutes: 4, queueSource: "user_override", activitySource: "user_override" }],
    ]);
    const result = evaluateTwoStopPairLegacy(input({ resolvedByFacilityId: values, context: { ...context, minutesUntilBoarding: 50 } }));
    for (const order of [result.orderAB, result.orderBA]) {
      const value = complete(order);
      expect(value.ledger.requiredMinutes).toBe(29); // 9+0+5+1+4+10
      expect(value.ledger.marginMinutes).toBe(21);
      expect(value.ledger.stops.find((stop) => stop.facilityId === "a")).toMatchObject({ queueMinutes: 0, activityMinutes: 5, queueSource: "user_override" });
    }
  });

  it("E10: missing D→D travel never becomes a zero-minute leg", () => {
    const result = evaluateTwoStopPairLegacy(input({ travelTimes: { D: { D: null } } }));
    for (const order of [result.orderAB, result.orderBA]) {
      const value = unknown(order);
      expect(value.unknownReason).toBe("missing_travel_outbound");
      expect(value.ledger.legs.map((leg) => leg.minutes)).toEqual([null, null, null]);
    }
  });

  it.each([-1, 1.5, 1441, Number.NaN, Number.POSITIVE_INFINITY])("E33: invalid travel minute %s is not modeled", (minute) => {
    const result = evaluateTwoStopPairLegacy(input({ travelTimes: { D: { D: minute } } }));
    for (const order of [result.orderAB, result.orderBA]) {
      expect(unknown(order).ledger.legs.map((leg) => leg.minutes)).toEqual([null, null, null]);
    }
  });

  it.each([-1, 1.5, 1441, Number.NaN, Number.POSITIVE_INFINITY])("E33: invalid activity minute %s is not modeled", (minute) => {
    const values = new Map([["a", { ...resolved, activityMinutes: minute }], ["b", resolved]]);
    const result = evaluateTwoStopPairLegacy(input({ resolvedByFacilityId: values }));
    for (const order of [result.orderAB, result.orderBA]) unknown(order);
  });

  it.each([
    ["boarding past 24 hours", { minutesUntilBoarding: 1441 }],
    ["negative boarding", { minutesUntilBoarding: -1 }],
    ["fractional buffer", { bufferMinutes: 1.5 }],
    ["negative buffer", { bufferMinutes: -1 }],
    ["queue adjustment below -24 hours", { queueAdjustmentMinutes: -1441 }],
    ["nonfinite queue adjustment", { queueAdjustmentMinutes: Number.NaN }],
  ] as const)("E32: %s cannot publish a numeric itinerary", (_label, change) => {
    const result = evaluateTwoStopPairLegacy(input({ context: { ...context, ...change } }));
    for (const order of [result.orderAB, result.orderBA]) unknown(order);
  });

  it("E31: maximum valid primitive components sum exactly without overflow", () => {
    const maximumResolved: ResolvedFacilityDurations = {
      ...resolved, queueMinutes: 1440, activityMinutes: 1440,
    };
    const result = evaluateTwoStopPairLegacy(input({
      context: {
        ...context, minutesUntilBoarding: 1440,
        bufferMinutes: 1440, queueAdjustmentMinutes: 1440,
      },
      travelTimes: { D: { D: 1440 } },
      resolvedByFacilityId: new Map([["a", maximumResolved], ["b", maximumResolved]]),
    }));
    for (const order of [result.orderAB, result.orderBA]) {
      const value = complete(order);
      expect(value.ledger.stops.map((stop) => stop.queueMinutes)).toEqual([2880, 2880]);
      expect(value.ledger.requiredMinutes).toBe(14400); // 3*1440 + 2*2880 + 2*1440 + 1440
      expect(value.ledger.marginMinutes).toBe(-12960);
      expect(value.status).toBe("over_budget");
    }
  });

  it("E12/E15: duplicate and browse-only selections reject both orders before arithmetic", () => {
    for (const [selection, facilitiesById, reason] of [
      [["a", "a"], new Map([["a", a], ["b", b]]), "duplicate_selection"],
      [["a", "b"], new Map([["a", a], ["b", { ...b, recommendEligible: false }]]), "outside_recommend_eligibility"],
    ] as const) {
      const result = evaluateTwoStopPairLegacy(input({ selection, facilitiesById }));
      expect(result.bestModeledOrder).toBeNull();
      expect(result.orderAB).toEqual({ kind: "ineligible", reason });
      expect(result.orderBA).toEqual({ kind: "ineligible", reason });
    }
  });

  it("E13: missing facility ID rejects both orders", () => {
    const result = evaluateTwoStopPairLegacy(input({ selection: ["a", "missing"] }));
    expect(result.orderAB).toEqual({ kind: "ineligible", reason: "unknown_facility_id" });
    expect(result.orderBA).toEqual({ kind: "ineligible", reason: "unknown_facility_id" });
  });

  it("E39: reversing input preserves physical orders and chooses the same ID tie", () => {
    const forward = evaluateTwoStopPairLegacy(input());
    const reverse = evaluateTwoStopPairLegacy(input({ selection: ["b", "a"] }));
    expect(forward.facilityIds).toEqual(["a", "b"]);
    expect(reverse.facilityIds).toEqual(["a", "b"]);
    expect(forward.bestModeledOrder).toBe("AB");
    expect(reverse.bestModeledOrder).toBe("BA");
    expect(forward.orderAB).toEqual(reverse.orderBA);
    expect(forward.orderBA).toEqual(reverse.orderAB);
  });

  it("E38: evaluation is repeatable and leaves all supplied objects unchanged", () => {
    const testInput = input();
    const before = {
      context: { ...testInput.context },
      facilities: [...testInput.facilitiesById.entries()].map(([id, facility]) => [id, { ...facility }]),
      resolved: [...testInput.resolvedByFacilityId.entries()].map(([id, value]) => [id, { ...value }]),
      travel: structuredClone(testInput.travelTimes),
    };
    expect(evaluateTwoStopPairLegacy(testInput)).toEqual(evaluateTwoStopPairLegacy(testInput));
    expect(testInput.context).toEqual(before.context);
    expect([...testInput.facilitiesById.entries()]).toEqual(before.facilities);
    expect([...testInput.resolvedByFacilityId.entries()]).toEqual(before.resolved);
    expect(testInput.travelTimes).toEqual(before.travel);
  });

  it("E18: each walking leg carries ordered endpoints and explicit demo provenance", () => {
    const result = evaluateTwoStopPairLegacy(input());
    for (const order of [result.orderAB, result.orderBA]) {
      const value = complete(order);
      const [first, second] = value.ledger.order;
      expect(value.ledger.legs.map((leg) => [leg.kind, leg.fromFacilityId, leg.toFacilityId])).toEqual([
        ["gate_to_stop", "gate", first], ["stop_to_stop", first, second], ["stop_to_gate", second, "gate"],
      ]);
      for (const leg of value.ledger.legs) {
        expect(leg.timeConfidence).toBe("demo_estimate");
        expect(leg.isDemoTravelAssumption).toBe(true);
        expect(leg.provenanceNote).toMatch(/demo/i);
      }
      expect(value.ledger.legs[1].provenanceNote).toMatch(/P-E-LEG-001/);
    }
    expect(result.modelDisclaimer).toMatch(/unverified demo estimates/i);
  });

  it("E10: strict policy retains gate legs but marks the middle leg unknown", () => {
    const result = evaluateTwoStopPairLegacy(input({ travelPolicy: "strict" }));
    expect(result.usesDemoTravelAssumption).toBe(false);
    expect(result.bestModeledOrder).toBeNull();
    for (const order of [result.orderAB, result.orderBA]) {
      const value = unknown(order);
      expect(value.ledger.legs.map((leg) => leg.minutes)).toEqual([3, null, 3]);
      expect(value.ledger.legs.map((leg) => leg.isDemoTravelAssumption)).toEqual([true, false, true]);
      expect(value.ledger.legs[1].provenanceNote).toMatch(/strict policy/i);
    }
  });

  it("E55: legacy single-stop arithmetic and return shape remain intact", () => {
    const [single] = recommendFacilities(context, [a], travelTimes);
    expect(single.kind).toBe("feasibility");
    if (single.kind !== "feasibility") throw new Error("Expected single-stop feasibility");
    expect(single.breakdown).toEqual({
      outboundMinutes: 3, returnMinutes: 3, queueMinutes: 8,
      activityMinutes: 10, bufferMinutes: 10, requiredMinutes: 34, marginMinutes: 31,
    });
    expect(single.status).toBe("feasible_in_model");
    expect(evaluateTwoStopPairLegacy(input()).orderAB.kind).toBe("feasibility");
  });
});
