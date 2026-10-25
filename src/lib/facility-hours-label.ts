import { presentPublishedHours } from "@/lib/published-hours";
import type { Facility } from "@/types/airport";

/** Deterministic airport-local zone label for published facility hours (not live status). */
export const PUBLISHED_HOURS_TIMEZONE_LABEL =
  "America/Los_Angeles (Pacific Time)";

export function facilityPublishedHoursPresentation(facility: Facility) {
  return presentPublishedHours(facility.hours, facility.hoursConfidence);
}
