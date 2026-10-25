import type {
  IneligibilityReason,
  ProductionRecommendation,
  UnknownReason,
} from "@/types/airport";

export type StatusPresentation = {
  chipClass: string;
  shortLabel: string;
  accessibleLabel: string;
};

const MODEL_DISCLAIMER =
  "In-app model only; does not guarantee you will board on time.";

const INELIGIBILITY_LABELS: Record<IneligibilityReason, string> = {
  security_zone_unknown: "Security side is unverified for this facility.",
  security_zone_pre_only: "This facility is pre-security only.",
  passenger_not_airside: "Recommendations assume you are already post-security.",
  outside_supported_zone:
    "This facility is outside the supported Terminal 2 D Gates scope.",
  outside_recommend_eligibility:
    "This facility is not eligible for time-based recommendations in the current model.",
};

const UNKNOWN_LABELS: Record<UnknownReason, string> = {
  missing_travel_outbound: "Outbound walk time is not modeled.",
  missing_travel_return: "Return walk time is not modeled.",
  missing_queue_estimate: "Queue or wait time is unknown.",
  missing_activity_estimate: "Activity time at the facility is unknown.",
  invalid_numeric_input:
    "A time value is out of the supported numeric range for this model.",
};

const FEASIBILITY_SHORT: Record<
  "feasible_in_model" | "tight_in_model" | "over_budget",
  string
> = {
  feasible_in_model: "Feasible in model",
  tight_in_model: "Tight in model",
  over_budget: "Over budget in model",
};

export function ineligibilityReasonLabel(reason: IneligibilityReason): string {
  return INELIGIBILITY_LABELS[reason];
}

export function unknownReasonLabel(reason: UnknownReason): string {
  return UNKNOWN_LABELS[reason];
}

export function formatSignedMinutes(value: number | null): string {
  if (value === null) {
    return "Not modeled";
  }
  const prefix = value > 0 ? "+" : value < 0 ? "−" : "";
  const magnitude = Math.abs(value);
  return `${prefix}${magnitude} min`;
}

export function formatMinuteValue(value: number | null): string {
  if (value === null) {
    return "Not modeled";
  }
  return `${value} min`;
}

export function recommendationStatusPresentation(
  recommendation: ProductionRecommendation,
): StatusPresentation {
  if (recommendation.kind === "feasibility") {
    const shortLabel = FEASIBILITY_SHORT[recommendation.status];
    return {
      chipClass: `gw-status-chip ${
        recommendation.status === "feasible_in_model"
          ? "gw-status-feasible"
          : recommendation.status === "tight_in_model"
            ? "gw-status-tight"
            : "gw-status-over"
      }`,
      shortLabel,
      accessibleLabel: `${shortLabel}. ${MODEL_DISCLAIMER}`,
    };
  }

  if (recommendation.kind === "unknown") {
    return {
      chipClass: "gw-status-chip gw-status-unknown",
      shortLabel: "Unknown timing",
      accessibleLabel: `Unknown timing data. ${unknownReasonLabel(recommendation.unknownReason)} ${MODEL_DISCLAIMER}`,
    };
  }

  return {
    chipClass: "gw-status-chip gw-status-ineligible",
    shortLabel: "Not eligible",
    accessibleLabel: `Not eligible for time modeling. ${ineligibilityReasonLabel(recommendation.ineligibilityReason)}`,
  };
}
