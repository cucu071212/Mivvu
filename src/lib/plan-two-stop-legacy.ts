import {
  productionTravelMatrixMetadata,
  productionTravelMatrixTimeConfidence,
} from "@/data/travel-times";
import { isFacilityRecommendEligibleForEngine } from "@/lib/facility-location";
import {
  isModelSafeMinute,
  MAX_BOARDING_WINDOW_MINUTES,
  parseStrictInteger,
  safeIntegerSum,
} from "@/lib/strict-integer";
import type {
  Facility,
  ProductionTravelMatrix,
  ResolvedFacilityDurations,
  UnknownReason,
  UserContext,
} from "@/types/airport";
import type {
  TwoStopIneligibilityReason,
  TwoStopOrderLedger,
  TwoStopOrderResult,
  TwoStopPairEvaluation,
  TwoStopSelection,
  TwoStopTravelLeg,
  TwoStopTravelPolicy,
} from "@/types/two-stop-plan";

const GATE = "gate" as const;
const PRODUCTION_GATE_ZONE = "D";

const INTER_FACILITY_DEMO_NOTE =
  "P-E-LEG-001 demo_legacy_d: synthetic D→D movement between distinct D Gates listings — not a surveyed path between those venues.";

const GATE_FACILITY_DEMO_NOTE =
  "Legacy D→D directed leg (demo_estimate) — same assumption as single-stop recommendations.";

const STRICT_INTER_FACILITY_NOTE =
  "strict policy: inter-facility walking leg not modeled; result Unknown.";

export type PlanTwoStopLegacyInput = {
  context: UserContext;
  selection: TwoStopSelection;
  facilitiesById: ReadonlyMap<string, Facility>;
  travelTimes: ProductionTravelMatrix;
  resolvedByFacilityId: ReadonlyMap<string, ResolvedFacilityDurations>;
  travelPolicy: TwoStopTravelPolicy;
};

function classifyMargin(
  marginMinutes: number,
): "feasible_in_model" | "tight_in_model" | "over_budget" {
  if (marginMinutes >= 10) return "feasible_in_model";
  if (marginMinutes >= 0) return "tight_in_model";
  return "over_budget";
}

/** Primitive context fields use the 24-hour window; 0 boarding minutes is valid. */
function isValidTwoStopContext(context: UserContext): boolean {
  return (
    parseStrictInteger(context.minutesUntilBoarding, {
      allowNegative: false,
      min: 0,
      max: MAX_BOARDING_WINDOW_MINUTES,
    }) !== undefined &&
    parseStrictInteger(context.bufferMinutes, {
      allowNegative: false,
      min: 0,
      max: MAX_BOARDING_WINDOW_MINUTES,
    }) !== undefined &&
    parseStrictInteger(context.queueAdjustmentMinutes, {
      allowNegative: true,
      min: -MAX_BOARDING_WINDOW_MINUTES,
      max: MAX_BOARDING_WINDOW_MINUTES,
    }) !== undefined
  );
}

/**
 * Adjusted queues are derived (raw queue + signed adjustment, floored at 0).
 * They may exceed the 1,440 primitive cap; do not recap them as model-unsafe.
 */
function isValidDerivedQueueMinute(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

function resolveLegacyDDemoLeg(
  travelTimes: ProductionTravelMatrix,
): number | null {
  const raw = travelTimes.D?.D;
  if (raw === null || raw === undefined || !isModelSafeMinute(raw)) {
    return null;
  }
  return raw;
}

function resolveInterFacilityLeg(
  policy: TwoStopTravelPolicy,
  travelTimes: ProductionTravelMatrix,
): Pick<TwoStopTravelLeg, "minutes" | "timeConfidence" | "provenanceNote" | "isDemoTravelAssumption"> {
  if (policy === "demo_legacy_d") {
    const minutes = resolveLegacyDDemoLeg(travelTimes);
    return {
      minutes,
      timeConfidence: productionTravelMatrixTimeConfidence,
      provenanceNote: INTER_FACILITY_DEMO_NOTE,
      isDemoTravelAssumption: true,
    };
  }
  return {
    minutes: null,
    timeConfidence: productionTravelMatrixTimeConfidence,
    provenanceNote: STRICT_INTER_FACILITY_NOTE,
    isDemoTravelAssumption: false,
  };
}

function resolveGateFacilityLeg(
  travelTimes: ProductionTravelMatrix,
): Pick<TwoStopTravelLeg, "minutes" | "timeConfidence" | "provenanceNote" | "isDemoTravelAssumption"> {
  const minutes = resolveLegacyDDemoLeg(travelTimes);
  return {
    minutes,
    timeConfidence: productionTravelMatrixTimeConfidence,
    provenanceNote: GATE_FACILITY_DEMO_NOTE,
    isDemoTravelAssumption: true,
  };
}

function resolveAdjustedQueue(
  queueMinutes: number | null,
  queueAdjustmentMinutes: number,
): number | null {
  if (queueMinutes === null) return null;
  if (!isModelSafeMinute(queueMinutes)) return null;
  const adjusted = safeIntegerSum([queueMinutes, queueAdjustmentMinutes]);
  if (adjusted === null) return null;
  return Math.max(0, adjusted);
}

function firstUnknownReason(parts: {
  legMinutes: readonly (number | null)[];
  queueMinutes: readonly (number | null)[];
  activityMinutes: readonly (number | null)[];
}): UnknownReason {
  if (parts.legMinutes[0] === null) return "missing_travel_outbound";
  if (parts.queueMinutes[0] === null) return "missing_queue_estimate";
  if (parts.activityMinutes[0] === null) return "missing_activity_estimate";
  if (parts.legMinutes[1] === null) return "missing_travel_return";
  if (parts.queueMinutes[1] === null) return "missing_queue_estimate";
  if (parts.activityMinutes[1] === null) return "missing_activity_estimate";
  if (parts.legMinutes[2] === null) return "missing_travel_return";
  return "missing_activity_estimate";
}

function facilityIneligibility(
  facility: Facility,
  context: UserContext,
): TwoStopIneligibilityReason | null {
  if (context.passengerSecurityArea !== "post") {
    return "passenger_not_airside";
  }
  if (context.gateZone !== PRODUCTION_GATE_ZONE || facility.zone !== PRODUCTION_GATE_ZONE) {
    return "outside_supported_zone";
  }
  if (facility.securityZone === "pre") return "security_zone_pre_only";
  if (facility.securityZone === "unknown") return "security_zone_unknown";
  if (
    !isFacilityRecommendEligibleForEngine({
      recommendEligible: facility.recommendEligible,
    })
  ) {
    return "outside_recommend_eligibility";
  }
  return null;
}

export function validateTwoStopSelection(
  selection: TwoStopSelection,
  facilitiesById: ReadonlyMap<string, Facility>,
  context: UserContext,
): TwoStopIneligibilityReason | null {
  const [idA, idB] = selection;
  if (idA === idB) return "duplicate_selection";
  const facilityA = facilitiesById.get(idA);
  const facilityB = facilitiesById.get(idB);
  if (!facilityA || !facilityB) return "unknown_facility_id";
  const reasonA = facilityIneligibility(facilityA, context);
  if (reasonA) return reasonA;
  const reasonB = facilityIneligibility(facilityB, context);
  if (reasonB) return reasonB;
  return null;
}

function buildStop(
  facility: Facility,
  resolved: ResolvedFacilityDurations | undefined,
  queueAdjustmentMinutes: number,
): TwoStopOrderLedger["stops"][number] {
  const queueMinutes = resolveAdjustedQueue(
    resolved?.queueMinutes ?? null,
    queueAdjustmentMinutes,
  );
  const activityMinutes = resolved?.activityMinutes ?? null;

  return {
    facilityId: facility.id,
    facilityName: facility.name,
    queueMinutes,
    activityMinutes,
    queueSource: resolved?.queueSource ?? "unknown",
    activitySource: resolved?.activitySource ?? "unknown",
  };
}

function evaluateOneOrder(
  context: UserContext,
  first: Facility,
  second: Facility,
  resolvedByFacilityId: ReadonlyMap<string, ResolvedFacilityDurations>,
  travelTimes: ProductionTravelMatrix,
  travelPolicy: TwoStopTravelPolicy,
): TwoStopOrderResult {
  const gateLeg = resolveGateFacilityLeg(travelTimes);
  const interLeg = resolveInterFacilityLeg(travelPolicy, travelTimes);

  const leg1: TwoStopTravelLeg = {
    kind: "gate_to_stop",
    fromFacilityId: GATE,
    toFacilityId: first.id,
    ...gateLeg,
  };
  const leg2: TwoStopTravelLeg = {
    kind: "stop_to_stop",
    fromFacilityId: first.id,
    toFacilityId: second.id,
    ...interLeg,
  };
  const leg3: TwoStopTravelLeg = {
    kind: "stop_to_gate",
    fromFacilityId: second.id,
    toFacilityId: GATE,
    ...gateLeg,
  };

  const stops: TwoStopOrderLedger["stops"] = [
    buildStop(
      first,
      resolvedByFacilityId.get(first.id),
      context.queueAdjustmentMinutes,
    ),
    buildStop(
      second,
      resolvedByFacilityId.get(second.id),
      context.queueAdjustmentMinutes,
    ),
  ];

  const bufferMinutes = context.bufferMinutes;
  const legMinutes = [leg1.minutes, leg2.minutes, leg3.minutes];
  const queueMinutes = [stops[0].queueMinutes, stops[1].queueMinutes];
  const activityMinutes = [stops[0].activityMinutes, stops[1].activityMinutes];

  const ledgerBase: TwoStopOrderLedger = {
    order: [first.id, second.id],
    legs: [leg1, leg2, leg3],
    stops,
    bufferMinutes,
    requiredMinutes: null,
    marginMinutes: null,
  };

  const hasInvalidNumeric =
    !isValidTwoStopContext(context) ||
    legMinutes.some((m) => m !== null && !isModelSafeMinute(m)) ||
    queueMinutes.some((m) => m !== null && !isValidDerivedQueueMinute(m)) ||
    activityMinutes.some((m) => m !== null && !isModelSafeMinute(m));

  if (hasInvalidNumeric) {
    return {
      kind: "unknown",
      unknownReason: "invalid_numeric_input",
      ledger: ledgerBase,
    };
  }

  if (
    legMinutes.some((m) => m === null) ||
    queueMinutes.some((m) => m === null) ||
    activityMinutes.some((m) => m === null)
  ) {
    return {
      kind: "unknown",
      unknownReason: firstUnknownReason({
        legMinutes,
        queueMinutes,
        activityMinutes,
      }),
      ledger: ledgerBase,
    };
  }

  const requiredMinutes = safeIntegerSum([
    legMinutes[0]!,
    queueMinutes[0]!,
    activityMinutes[0]!,
    legMinutes[1]!,
    queueMinutes[1]!,
    activityMinutes[1]!,
    legMinutes[2]!,
    bufferMinutes,
  ]);

  if (requiredMinutes === null) {
    return {
      kind: "unknown",
      unknownReason: "invalid_numeric_input",
      ledger: ledgerBase,
    };
  }

  const marginMinutes = context.minutesUntilBoarding - requiredMinutes;
  const ledger = {
    ...ledgerBase,
    requiredMinutes,
    marginMinutes,
  };

  return {
    kind: "feasibility",
    status: classifyMargin(marginMinutes),
    ledger,
  };
}

function ineligibleOrder(reason: TwoStopIneligibilityReason): TwoStopOrderResult {
  return { kind: "ineligible", reason };
}

function canonicalPair(selection: TwoStopSelection): TwoStopSelection {
  return selection[0] < selection[1]
    ? [selection[0], selection[1]]
    : [selection[1], selection[0]];
}

function bestOrder(
  orderAB: TwoStopOrderResult,
  orderBA: TwoStopOrderResult,
  selection: TwoStopSelection,
): "AB" | "BA" | null {
  const abReq =
    orderAB.kind === "feasibility" ? orderAB.ledger.requiredMinutes : null;
  const baReq =
    orderBA.kind === "feasibility" ? orderBA.ledger.requiredMinutes : null;
  if (abReq === null && baReq === null) return null;
  if (baReq === null) return "AB";
  if (abReq === null) return "BA";
  if (abReq < baReq) return "AB";
  if (baReq < abReq) return "BA";
  return selection[0] < selection[1] ? "AB" : "BA";
}

export function evaluateTwoStopPairLegacy(
  input: PlanTwoStopLegacyInput,
): TwoStopPairEvaluation {
  const { context, selection, facilitiesById, travelTimes, travelPolicy } =
    input;
  const validation = validateTwoStopSelection(
    selection,
    facilitiesById,
    context,
  );

  const [idA, idB] = selection;

  if (validation) {
    const rejected = ineligibleOrder(validation);
    return {
      facilityIds: canonicalPair(selection),
      orderAB: rejected,
      orderBA: rejected,
      bestModeledOrder: null,
      travelMode: "legacy_zone",
      travelPolicy,
      usesDemoTravelAssumption: travelPolicy === "demo_legacy_d",
      modelDisclaimer: productionTravelMatrixMetadata.disclaimer,
    };
  }

  const facilityA = facilitiesById.get(idA);
  const facilityB = facilitiesById.get(idB);
  if (!facilityA || !facilityB) {
    const rejected = ineligibleOrder("unknown_facility_id");
    return {
      facilityIds: canonicalPair(selection),
      orderAB: rejected,
      orderBA: rejected,
      bestModeledOrder: null,
      travelMode: "legacy_zone",
      travelPolicy,
      usesDemoTravelAssumption: travelPolicy === "demo_legacy_d",
      modelDisclaimer: productionTravelMatrixMetadata.disclaimer,
    };
  }

  const orderAB = evaluateOneOrder(
    context,
    facilityA,
    facilityB,
    input.resolvedByFacilityId,
    travelTimes,
    travelPolicy,
  );
  const orderBA = evaluateOneOrder(
    context,
    facilityB,
    facilityA,
    input.resolvedByFacilityId,
    travelTimes,
    travelPolicy,
  );

  return {
    facilityIds: canonicalPair(selection),
    orderAB,
    orderBA,
    bestModeledOrder: bestOrder(orderAB, orderBA, selection),
    travelMode: "legacy_zone",
    travelPolicy,
    usesDemoTravelAssumption: travelPolicy === "demo_legacy_d",
    modelDisclaimer: productionTravelMatrixMetadata.disclaimer,
  };
}

/**
 * Minutes by which summing two single-stop required totals overstates a true
 * two-stop itinerary (GW-B §6.1). Equals t(A,G) + t(G,B) + b − t(A,B) when
 * legs use the same resolved minute assumptions as those singles.
 */
export function twoStopVersusSingleStopGapMinutes(
  singleStopRequiredA: number,
  singleStopRequiredB: number,
  twoStopRequiredAB: number,
): number {
  return (
    singleStopRequiredA + singleStopRequiredB - twoStopRequiredAB
  );
}
