import type {
  Facility,
  FacilityDurationOverrideMap,
  ResolvedDurationSource,
  ResolvedFacilityDurations,
} from "@/types/airport";

/**
 * Resolves validated overrides > demo parameters > source record > unknown.
 * Call validateDurationOverrides at the input boundary. Parameters are required;
 * callers can import DEMO_QUEUE_MINUTES / DEMO_ACTIVITY_MINUTES for defaults.
 * Queue adjustments belong downstream in recommendFacilities, never here.
 */
export function resolveFacilityDurations(
  facility: Facility,
  options: {
    overrides: FacilityDurationOverrideMap;
    useDemoTimeEstimates: boolean;
    demoQueueMinutes: number;
    demoActivityMinutes: number;
  },
): ResolvedFacilityDurations {
  const override = Object.prototype.hasOwnProperty.call(options.overrides, facility.id)
    ? options.overrides[facility.id]
    : undefined;
  const resolve = (
    userMinutes: number | undefined,
    demoMinutes: number,
    recordMinutes: number | null,
  ): { minutes: number | null; source: ResolvedDurationSource } => {
    if (userMinutes !== undefined) {
      return { minutes: userMinutes, source: "user_override" };
    }
    if (options.useDemoTimeEstimates) {
      return { minutes: demoMinutes, source: "demo_estimate" };
    }
    if (recordMinutes !== null) {
      return { minutes: recordMinutes, source: "official_record" };
    }
    return { minutes: null, source: "unknown" };
  };
  const queue = resolve(
    override?.queueMinutes,
    options.demoQueueMinutes,
    facility.waitMinutes,
  );
  const activity = resolve(
    override?.activityMinutes,
    options.demoActivityMinutes,
    facility.activityMinutes,
  );
  return {
    queueMinutes: queue.minutes,
    activityMinutes: activity.minutes,
    queueSource: queue.source,
    activitySource: activity.source,
  };
}
