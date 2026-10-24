import type {
  Facility,
  FacilityDurationOverrideMap,
  ProductionRecommendation,
  ProductionTravelMatrix,
  UserContext,
} from "@/types/airport";
import {
  DEMO_ACTIVITY_MINUTES,
  DEMO_QUEUE_MINUTES,
} from "@/lib/demo-estimate-facilities";
import { recommendFacilities } from "@/lib/recommend";
import { resolveFacilityDurations } from "@/lib/resolve-facility-durations";

export type RecommendFacilitiesWithPersonalizationOptions = {
  overrides: FacilityDurationOverrideMap;
  useDemoTimeEstimates: boolean;
};

/**
 * Applies GW-F1 duration resolution, then calls the unchanged recommendFacilities engine.
 * Source facilities and facilities.json are never mutated.
 */
export function recommendFacilitiesWithPersonalization(
  context: UserContext,
  facilities: readonly Facility[],
  travelTimes: ProductionTravelMatrix,
  options: RecommendFacilitiesWithPersonalizationOptions,
): ProductionRecommendation[] {
  const effectiveFacilities = facilities.map((facility) => {
    const resolved = resolveFacilityDurations(facility, {
      overrides: options.overrides,
      useDemoTimeEstimates: options.useDemoTimeEstimates,
      demoQueueMinutes: DEMO_QUEUE_MINUTES,
      demoActivityMinutes: DEMO_ACTIVITY_MINUTES,
    });

    let timeConfidence = facility.timeConfidence;
    if (
      resolved.queueSource === "demo_estimate" ||
      resolved.activitySource === "demo_estimate"
    ) {
      timeConfidence = "demo_estimate";
    }

    return {
      ...facility,
      waitMinutes: resolved.queueMinutes,
      activityMinutes: resolved.activityMinutes,
      timeConfidence,
    };
  });

  return recommendFacilities(context, effectiveFacilities, travelTimes);
}
