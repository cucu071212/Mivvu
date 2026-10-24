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
