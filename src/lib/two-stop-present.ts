import {
  formatMinuteValue,
  formatSignedMinutes,
  unknownReasonLabel,
  type StatusPresentation,
} from "@/lib/recommendation-present";
import type { TwoStopIneligibilityReason, TwoStopOrderResult } from "@/types/two-stop-plan";

const MODEL_DISCLAIMER =
  "In-app model only; does not guarantee you will board on time.";

const TWO_STOP_INELIGIBILITY_LABELS: Record<TwoStopIneligibilityReason, string> = {
  duplicate_selection: "Choose two different facilities.",
  outside_recommend_eligibility:
    "One or both facilities are not eligible for time-based recommendations.",
  outside_supported_zone:
    "This planner supports Terminal 2 D Gates eligible facilities only.",
  passenger_not_airside:
    "Two-stop modeling assumes you are already post-security at D Gates.",
  security_zone_unknown: "Security side is unverified for a selected facility.",
  security_zone_pre_only: "A selected facility is pre-security only.",
  unknown_facility_id: "A selected facility could not be found in the dataset.",
};

const FEASIBILITY_SHORT: Record<
  "feasible_in_model" | "tight_in_model" | "over_budget",
  string
> = {
  feasible_in_model: "Feasible in model",
  tight_in_model: "Tight in model",
  over_budget: "Over budget in model",
};

export function twoStopIneligibilityLabel(reason: TwoStopIneligibilityReason): string {
  return TWO_STOP_INELIGIBILITY_LABELS[reason];
}

export function twoStopOrderStatusPresentation(
  result: TwoStopOrderResult,
): StatusPresentation {
  if (result.kind === "feasibility") {
    const shortLabel = FEASIBILITY_SHORT[result.status];
    return {
      chipClass: `gw-status-chip ${
        result.status === "feasible_in_model"
          ? "gw-status-feasible"
          : result.status === "tight_in_model"
            ? "gw-status-tight"
            : "gw-status-over"
      }`,
      shortLabel,
      accessibleLabel: `${shortLabel}. ${MODEL_DISCLAIMER}`,
    };
  }
  if (result.kind === "unknown") {
    return {
      chipClass: "gw-status-chip gw-status-unknown",
      shortLabel: "Unknown timing",
      accessibleLabel: `Unknown timing data. ${unknownReasonLabel(result.unknownReason)} ${MODEL_DISCLAIMER}`,
    };
  }
  return {
    chipClass: "gw-status-chip gw-status-ineligible",
    shortLabel: "Not eligible",
    accessibleLabel: `Not eligible for two-stop modeling. ${twoStopIneligibilityLabel(result.reason)}`,
  };
}

export type TwoStopBreakdownRow = { label: string; value: string };

export function twoStopLedgerBreakdownRows(
  result: TwoStopOrderResult,
): TwoStopBreakdownRow[] {
  if (result.kind === "ineligible") {
    return [];
  }
  const { ledger } = result;
  const [leg1, leg2, leg3] = ledger.legs;
  const [stop1, stop2] = ledger.stops;
  const legLabel = (kind: typeof leg1.kind) => {
    if (kind === "gate_to_stop") return "Walk: gate to first stop";
    if (kind === "stop_to_stop") return "Walk: between stops";
    return "Walk: second stop to gate";
  };

  const rows: TwoStopBreakdownRow[] = [
    { label: legLabel(leg1.kind), value: formatMinuteValue(leg1.minutes) },
    { label: `Queue at ${stop1.facilityName}`, value: formatMinuteValue(stop1.queueMinutes) },
    {
      label: `Activity at ${stop1.facilityName}`,
      value: formatMinuteValue(stop1.activityMinutes),
    },
    { label: legLabel(leg2.kind), value: formatMinuteValue(leg2.minutes) },
    { label: `Queue at ${stop2.facilityName}`, value: formatMinuteValue(stop2.queueMinutes) },
    {
      label: `Activity at ${stop2.facilityName}`,
      value: formatMinuteValue(stop2.activityMinutes),
    },
    { label: legLabel(leg3.kind), value: formatMinuteValue(leg3.minutes) },
    { label: "Safety buffer (once per itinerary)", value: `${ledger.bufferMinutes} min` },
    {
      label: "Total required (model)",
      value: formatMinuteValue(ledger.requiredMinutes),
    },
    {
      label: "Remaining margin (model)",
      value: formatSignedMinutes(ledger.marginMinutes),
    },
  ];
  return rows;
}

export const TWO_STOP_DEMO_TRAVEL_DISCLAIMER =
  "Walking times are illustrative assumptions, not measured airport routes. This demo is not a boarding-time guarantee.";
