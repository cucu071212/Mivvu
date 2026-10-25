export type CountdownManualExitReason = "user_clear" | "countdown_failure";

export type CountdownManualExitPayload = {
  reason: CountdownManualExitReason;
  /** Last manual budget before countdown (used only for explicit user_clear). */
  preservedManualMinutes: number;
  /** Last live baseline minutes when countdown failed (never auto-promoted to preserved). */
  lastBaselineMinutes: number;
  message?: string;
};

/** Recommendations stay suppressed until the traveler explicitly recovers after a failure. */
export function baselineRecoveryRequiredAfterExit(
  reason: CountdownManualExitReason,
): boolean {
  return reason === "countdown_failure";
}

export function minutesInputAfterCountdownExit(
  payload: CountdownManualExitPayload,
): string {
  if (payload.reason === "user_clear") {
    return String(payload.preservedManualMinutes);
  }
  return String(payload.lastBaselineMinutes);
}
