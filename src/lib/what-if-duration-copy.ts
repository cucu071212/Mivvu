/** User-facing duration resolution order (matches resolveFacilityDurations). */
export const WHAT_IF_DURATION_PRECEDENCE =
  "Personal override → Demo estimate → Official record → Unknown";

export const WHAT_IF_DEMO_MODE_ON_NOTE =
  "Demo mode is on: 8 min queue and 10 min activity apply per field where you have not entered a personal override (demo estimates take precedence over official records in the model).";

export const WHAT_IF_DEMO_MODE_OFF_NOTE =
  "Demo mode is off: each field uses your personal override when set, otherwise the official dataset value, otherwise unknown (never zero-filled).";
