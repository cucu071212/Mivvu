import type { UnknownReason } from "@/types/airport";
import type {
  TwoStopOrderResult,
  TwoStopPairEvaluation,
  TwoStopTravelPolicy,
} from "@/types/two-stop-plan";

export type TwoStopUnknownCategory =
  | "inter_facility_travel"
  | "queue_or_activity"
  | "other_travel"
  | "invalid_numeric"
  | "other";

export function interFacilityLegIsMissing(result: TwoStopOrderResult): boolean {
  if (result.kind !== "unknown") return false;
  const between = result.ledger.legs[1];
  return between.kind === "stop_to_stop" && between.minutes === null;
}

export function categorizeUnknownReason(reason: UnknownReason): TwoStopUnknownCategory {
  if (reason === "missing_queue_estimate" || reason === "missing_activity_estimate") {
    return "queue_or_activity";
  }
  if (reason === "invalid_numeric_input") return "invalid_numeric";
  if (reason === "missing_travel_outbound") return "other_travel";
  if (reason === "missing_travel_return") return "other_travel";
  return "other";
}

export type TwoStopUnknownGuidanceItem = {
  category: TwoStopUnknownCategory;
  message: string;
  actionLabel?: string;
  actionHref?: string;
};

const CATEGORY_MESSAGES: Record<
  Exclude<TwoStopUnknownCategory, "inter_facility_travel">,
  { message: string; actionLabel?: string; actionHref?: string }
> = {
  queue_or_activity: {
    message:
      "Queue or activity minutes are unknown for one or both stops. Enable illustrative demo estimates on Flight, personalize times on Results, or leave Unknown.",
    actionLabel: "Open Flight to enable demo queue/activity",
    actionHref: "/",
  },
  other_travel: {
    message: "A required gate walk leg is not modeled with the current travel policy.",
  },
  invalid_numeric: {
    message: "A time value is outside the supported range for this model.",
    actionLabel: "Review inputs on Flight",
    actionHref: "/",
  },
  other: {
    message: "Required timing inputs are incomplete for this itinerary.",
  },
};

export function guidanceForUnknownOrder(
  result: TwoStopOrderResult,
  travelPolicy: TwoStopTravelPolicy,
): TwoStopUnknownGuidanceItem[] {
  if (result.kind !== "unknown") return [];
  const items: TwoStopUnknownGuidanceItem[] = [];

  if (interFacilityLegIsMissing(result) && travelPolicy === "strict") {
    items.push({
      category: "inter_facility_travel",
      message:
        "Walking time between the two facilities is not modeled under strict policy. Opt in below to illustrative D-Gates travel (demo only), or accept Unknown.",
    });
  }

  const category = categorizeUnknownReason(result.unknownReason);
  if (category === "queue_or_activity") {
    items.push({ category, ...CATEGORY_MESSAGES.queue_or_activity });
  } else if (category === "invalid_numeric") {
    items.push({ category, ...CATEGORY_MESSAGES.invalid_numeric });
  } else if (
    category === "other_travel" &&
    !items.some((row) => row.category === "inter_facility_travel")
  ) {
    items.push({ category, ...CATEGORY_MESSAGES.other_travel });
  } else if (category === "other") {
    items.push({ category, ...CATEGORY_MESSAGES.other });
  }

  return items;
}

/** De-duplicated guidance when both orders are Unknown. */
export function guidanceForUnknownPair(
  evaluation: TwoStopPairEvaluation,
  demoQueueActivityEnabled: boolean,
): TwoStopUnknownGuidanceItem[] {
  const fromOrders = [
    ...guidanceForUnknownOrder(evaluation.orderAB, evaluation.travelPolicy),
    ...guidanceForUnknownOrder(evaluation.orderBA, evaluation.travelPolicy),
  ];
  const byCategory = new Map<TwoStopUnknownCategory, TwoStopUnknownGuidanceItem>();
  for (const item of fromOrders) {
    byCategory.set(item.category, item);
  }
  if (
    !demoQueueActivityEnabled &&
    [...byCategory.keys()].some((key) => key === "queue_or_activity") === false
  ) {
    const needsQueueHint = [evaluation.orderAB, evaluation.orderBA].some(
      (order) =>
        order.kind === "unknown" &&
        (order.unknownReason === "missing_queue_estimate" ||
          order.unknownReason === "missing_activity_estimate" ||
          order.ledger.stops.some(
            (stop) => stop.queueMinutes === null || stop.activityMinutes === null,
          )),
    );
    if (needsQueueHint) {
      byCategory.set("queue_or_activity", {
        category: "queue_or_activity",
        ...CATEGORY_MESSAGES.queue_or_activity,
      });
    }
  }
  return [...byCategory.values()];
}

export function pairHasUnknownItinerary(evaluation: TwoStopPairEvaluation): boolean {
  return (
    evaluation.orderAB.kind === "unknown" || evaluation.orderBA.kind === "unknown"
  );
}
