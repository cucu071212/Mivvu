import { APPROVED_LEGACY_RECOMMEND_FACILITY_IDS } from "@/data/approved-recommend-facility-ids";
import { productionTravelMinutes } from "@/data/travel-times";
import {
  evaluateTwoStopPairLegacy,
  validateTwoStopSelection,
} from "@/lib/plan-two-stop-legacy";
import type { Facility, ResolvedFacilityDurations, UserContext } from "@/types/airport";
import type {
  TwoStopPairEvaluation,
  TwoStopSelection,
  TwoStopTravelPolicy,
} from "@/types/two-stop-plan";

export type TwoStopPlannerInput = {
  context: UserContext;
  stopAId: string;
  stopBId: string;
  facilitiesById: ReadonlyMap<string, Facility>;
  resolvedByFacilityId: ReadonlyMap<string, ResolvedFacilityDurations>;
  travelPolicy: TwoStopTravelPolicy;
};

export type TwoStopPlannerState =
  | { phase: "incomplete"; message: string }
  | {
      phase: "ready";
      selection: TwoStopSelection;
      validation: ReturnType<typeof validateTwoStopSelection>;
      evaluation: TwoStopPairEvaluation;
    };

/** Stable list of the 12 legacy D-Gates facilities that may appear in the demo planner. */
export function listTwoStopEligibleFacilities(
  facilities: readonly Facility[],
): Facility[] {
  const allowed = new Set<string>(APPROVED_LEGACY_RECOMMEND_FACILITY_IDS);
  return facilities
    .filter((row) => allowed.has(row.id))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function travelPolicyFromDemoOptIn(
  demoLegacyTravelEnabled: boolean,
): TwoStopTravelPolicy {
  return demoLegacyTravelEnabled ? "demo_legacy_d" : "strict";
}

/**
 * Single integration entry: validates selection and delegates all feasibility math
 * to `evaluateTwoStopPairLegacy` (UI must not recompute margins or classifications).
 */
export function runTwoStopPlannerEvaluation(
  input: TwoStopPlannerInput,
): TwoStopPlannerState {
  const { stopAId, stopBId } = input;
  if (!stopAId || !stopBId) {
    return {
      phase: "incomplete",
      message: "Select two different D Gates facilities to compare visit orders.",
    };
  }

  const selection: TwoStopSelection = [stopAId, stopBId];
  const validation = validateTwoStopSelection(
    selection,
    input.facilitiesById,
    input.context,
  );

  const evaluation = evaluateTwoStopPairLegacy({
    context: input.context,
    selection,
    facilitiesById: input.facilitiesById,
    travelTimes: productionTravelMinutes,
    resolvedByFacilityId: input.resolvedByFacilityId,
    travelPolicy: input.travelPolicy,
  });

  return { phase: "ready", selection, validation, evaluation };
}
