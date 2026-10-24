import type { Facility } from "@/types/airport";

/** Synthetic queue assumption for demo mode only — not a measured SFO wait. */
export const DEMO_QUEUE_MINUTES = 8;

/** Synthetic activity assumption for demo mode only — not a measured service time. */
export const DEMO_ACTIVITY_MINUTES = 10;

/** Returns shallow copies with labeled demo_estimate durations; does not mutate inputs. */
export function applyDemoTimeEstimates(
  facilities: readonly Facility[],
): Facility[] {
  return facilities.map((facility) => ({
    ...facility,
    waitMinutes: DEMO_QUEUE_MINUTES,
    activityMinutes: DEMO_ACTIVITY_MINUTES,
    timeConfidence: "demo_estimate",
  }));
}
