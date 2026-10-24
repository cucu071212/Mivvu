import { describe, expect, expectTypeOf, it } from "vitest";
import type { Facility } from "@/types/airport";
import { DEMO_ACTIVITY_MINUTES, DEMO_QUEUE_MINUTES } from "./demo-estimate-facilities";
import { resolveFacilityDurations, type ResolvedFacilityDurations } from "./resolve-facility-durations";
import { validateDurationOverrides, type FacilityDurationOverrideMap } from "./validate-duration-overrides";
import { recommendFacilities } from "./recommend";

const facility: Facility = Object.freeze({
  id: "cafe", name: "Test fixture", category: "coffee", zone: "D", securityZone: "post",
  waitMinutes: null, activityMinutes: null, locationConfidence: "official_verified",
  timeConfidence: "unknown", sourceUrl: "https://example.com/fixture",
  locationDescription: "Fixture location", nearestGateLandmark: "D7",
});
const options = { overrides: {}, useDemoTimeEstimates: false,
  demoQueueMinutes: DEMO_QUEUE_MINUTES, demoActivityMinutes: DEMO_ACTIVITY_MINUTES };

describe("resolveFacilityDurations", () => {
  it.each([
    [false, {}, null, null, "unknown", "unknown"],
    [true, {}, 8, 10, "demo_estimate", "demo_estimate"],
    [false, { queueMinutes: 5 }, 5, null, "user_override", "unknown"],
    [true, { queueMinutes: 5 }, 5, 10, "user_override", "demo_estimate"],
    [false, { activityMinutes: 7 }, null, 7, "unknown", "user_override"],
    [true, { activityMinutes: 7 }, 8, 7, "demo_estimate", "user_override"],
    [false, { queueMinutes: 0, activityMinutes: 7 }, 0, 7, "user_override", "user_override"],
    [true, { queueMinutes: 0, activityMinutes: 0 }, 0, 0, "user_override", "user_override"],
  ] as const)("resolves independent fields: demo=%s override=%j", (demo, minutes, queue, activity, queueSource, activitySource) => {
    const overrides: FacilityDurationOverrideMap = Object.keys(minutes).length
      ? { cafe: { facilityId: "cafe", ...minutes } } : {};
    expect(resolveFacilityDurations(facility, { ...options, useDemoTimeEstimates: demo, overrides }))
      .toEqual({ queueMinutes: queue, activityMinutes: activity, queueSource, activitySource });
  });

  it("uses known source durations including zero when demo is off", () => {
    expect(resolveFacilityDurations({ ...facility, waitMinutes: 0, activityMinutes: 12 }, options))
      .toEqual({ queueMinutes: 0, activityMinutes: 12, queueSource: "official_record", activitySource: "official_record" });
  });

  it("keeps unknown queue independent from a known activity", () => {
    expect(resolveFacilityDurations({ ...facility, activityMinutes: 12 }, options))
      .toEqual({ queueMinutes: null, activityMinutes: 12, queueSource: "unknown", activitySource: "official_record" });
  });

  it("uses user then demo then known source in order", () => {
    const known = { ...facility, waitMinutes: 2, activityMinutes: 3 };
    const overrides = { cafe: { facilityId: "cafe", queueMinutes: 5 } };
    expect(resolveFacilityDurations(known, { ...options, overrides })).toEqual({
      queueMinutes: 5, activityMinutes: 3, queueSource: "user_override", activitySource: "official_record",
    });
    expect(resolveFacilityDurations(known, { ...options, overrides, useDemoTimeEstimates: true })).toEqual({
      queueMinutes: 5, activityMinutes: 10, queueSource: "user_override", activitySource: "demo_estimate",
    });
  });

  it("preserves known queue when only activity is overridden", () => {
    expect(resolveFacilityDurations({ ...facility, waitMinutes: 4 }, { ...options,
      overrides: { cafe: { facilityId: "cafe", activityMinutes: 9 } },
    })).toEqual({ queueMinutes: 4, activityMinutes: 9, queueSource: "official_record", activitySource: "user_override" });
  });

  it("preserves frozen matching overrides and options", () => {
    const entry = Object.freeze({ facilityId: "cafe", queueMinutes: 0, activityMinutes: 7 });
    const overrides = Object.freeze({ cafe: entry });
    const frozenOptions = Object.freeze({ ...options, overrides });
    expect(resolveFacilityDurations(facility, frozenOptions)).toEqual({
      queueMinutes: 0, activityMinutes: 7, queueSource: "user_override", activitySource: "user_override",
    });
    expect(overrides).toEqual({ cafe: { facilityId: "cafe", queueMinutes: 0, activityMinutes: 7 } });
  });

  it("keeps unknown queue unknown through downstream adjustments", () => {
    const resolved = resolveFacilityDurations(facility, options);
    const [result] = recommendFacilities({ gateZone: "D", minutesUntilBoarding: 50, bufferMinutes: 10,
      passengerSecurityArea: "post", queueAdjustmentMinutes: 7 },
    [{ ...facility, waitMinutes: resolved.queueMinutes, activityMinutes: resolved.activityMinutes }], { D: { D: 3 } });
    expect(result.kind).toBe("unknown");
    if (result.kind === "unknown") expect(result.breakdown.queueMinutes).toBeNull();
  });

  it("uses supplied demo parameters", () => {
    expect(resolveFacilityDurations(facility, { ...options, useDemoTimeEstimates: true, demoQueueMinutes: 4, demoActivityMinutes: 6 }))
      .toEqual({ queueMinutes: 4, activityMinutes: 6, queueSource: "demo_estimate", activitySource: "demo_estimate" });
  });

  it("does not mutate frozen inputs, provenance or other facilities' overrides", () => {
    const overrides = Object.freeze({ shop: Object.freeze({ facilityId: "shop", queueMinutes: 99 }) });
    const before = structuredClone(facility);
    const result = resolveFacilityDurations(facility, Object.freeze({ ...options, overrides }));
    expect(facility).toEqual(before);
    expect(overrides).toEqual({ shop: { facilityId: "shop", queueMinutes: 99 } });
    expect(result.queueMinutes).toBeNull();
  });

  it("feeds ephemeral engine copies with queue adjustment applied downstream exactly once", () => {
    const { overrides } = validateDurationOverrides({ cafe: { facilityId: "cafe", queueMinutes: 5, activityMinutes: 7 } }, ["cafe"]);
    const resolved = resolveFacilityDurations(facility, { ...options, overrides });
    expectTypeOf(resolved).toEqualTypeOf<ResolvedFacilityDurations>();
    expectTypeOf(resolved.queueSource).toEqualTypeOf<"user_override" | "demo_estimate" | "official_record" | "unknown">();
    for (const [adjustment, expectedQueue, required] of [[7, 12, 35], [-9, 0, 23]]) {
      const [result] = recommendFacilities({ gateZone: "D", minutesUntilBoarding: 50, bufferMinutes: 10,
        passengerSecurityArea: "post", queueAdjustmentMinutes: adjustment },
      [{ ...facility, waitMinutes: resolved.queueMinutes, activityMinutes: resolved.activityMinutes }], { D: { D: 3 } });
      expect(result.kind).toBe("feasibility");
      if (result.kind === "feasibility") {
        expect(result.breakdown.queueMinutes).toBe(expectedQueue);
        expect(result.breakdown.requiredMinutes).toBe(required);
      }
    }
    expect(resolved.queueMinutes).toBe(5);
    expect(facility.waitMinutes).toBeNull();
  });
});
