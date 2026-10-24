import { buildFlightContextInput } from "@/lib/browse-integration";
import { validateContext } from "@/lib/validate-context";

/**
 * Returns minutes until boarding only when the draft passes the same
 * validateContext rules as the flight-context form (finite non-negative integer).
 */
export function acceptedMinutesUntilBoardingFromDraft(
  minutesDraft: string,
  bufferDraft: string,
): number | undefined {
  const result = validateContext(
    buildFlightContextInput(minutesDraft, bufferDraft),
  );
  return result.context?.minutesUntilBoarding;
}

/**
 * Preserved manual minutes for countdown restore when both drafts form a valid
 * flight context (either field may have been edited last).
 */
export function preservedManualMinutesFromValidContext(
  minutesDraft: string,
  bufferDraft: string,
): number | undefined {
  return acceptedMinutesUntilBoardingFromDraft(minutesDraft, bufferDraft);
}

/** Updates preserved only when combined drafts validate (manual entry mode). */
export function nextPreservedManualMinutes(
  currentPreserved: number,
  minutesDraft: string,
  bufferDraft: string,
): number {
  const accepted = preservedManualMinutesFromValidContext(
    minutesDraft,
    bufferDraft,
  );
  return accepted === undefined ? currentPreserved : accepted;
}
