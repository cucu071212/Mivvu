import {
  POST_ELIGIBLE_SECURITY_ZONES,
  PRODUCTION_ZONES,
  type Facility,
  type IneligibilityReason,
  type ProductionRecommendation,
  type ProductionTravelMatrix,
  type RecommendFacilities,
  type RecommendationTimeBreakdownComplete,
  type RecommendationTimeBreakdownPartial,
  type UnknownReason,
  type UserContext,
} from "@/types/airport";

function identityFromFacility(facility: Facility) {
  return {
    facilityId: facility.id,
    facilityName: facility.name,
    category: facility.category,
    locationConfidence: facility.locationConfidence,
    timeConfidence: facility.timeConfidence,
    securityZone: facility.securityZone,
    zone: facility.zone,
  };
}

function isPostEligible(securityZone: Facility["securityZone"]): boolean {
  return POST_ELIGIBLE_SECURITY_ZONES.includes(securityZone);
}

function ineligibilityForSecurity(
  securityZone: Facility["securityZone"],
): IneligibilityReason | null {
  if (securityZone === "pre") return "security_zone_pre_only";
  if (securityZone === "unknown") return "security_zone_unknown";
  return null;
}

function classifyMargin(marginMinutes: number): "feasible_in_model" | "tight_in_model" | "over_budget" {
  if (marginMinutes >= 10) return "feasible_in_model";
  if (marginMinutes >= 0) return "tight_in_model";
  return "over_budget";
}

function firstUnknownReason(parts: {
  outboundMinutes: number | null;
  returnMinutes: number | null;
  queueMinutes: number | null;
  activityMinutes: number | null;
}): UnknownReason {
  if (parts.outboundMinutes === null) return "missing_travel_outbound";
  if (parts.returnMinutes === null) return "missing_travel_return";
  if (parts.queueMinutes === null) return "missing_queue_estimate";
  return "missing_activity_estimate";
}

function sortRank(recommendation: ProductionRecommendation): number {
  if (recommendation.kind === "feasibility") {
    if (recommendation.status === "feasible_in_model") return 0;
    if (recommendation.status === "tight_in_model") return 1;
    return 2;
  }
  if (recommendation.kind === "unknown") return 3;
  return 4;
}

function compareRecommendations(
  left: ProductionRecommendation,
  right: ProductionRecommendation,
): number {
  const rankDelta = sortRank(left) - sortRank(right);
  if (rankDelta !== 0) return rankDelta;

  if (left.kind === "feasibility" && right.kind === "feasibility") {
    const marginDelta =
      right.breakdown.marginMinutes - left.breakdown.marginMinutes;
    if (marginDelta !== 0) return marginDelta;
  }

  const nameDelta = left.facilityName.localeCompare(right.facilityName, "en-US", {
    sensitivity: "base",
  });
  if (nameDelta !== 0) return nameDelta;

  return left.facilityId.localeCompare(right.facilityId, "en-US", {
    sensitivity: "base",
  });
}

function evaluateFacility(
  context: UserContext,
  facility: Facility,
  travelTimes: ProductionTravelMatrix,
): ProductionRecommendation {
  const identity = identityFromFacility(facility);

  if (context.passengerSecurityArea !== "post") {
    return {
      ...identity,
      kind: "ineligible",
      ineligibilityReason: "passenger_not_airside",
    };
  }

  if (
    !PRODUCTION_ZONES.includes(context.gateZone) ||
    !PRODUCTION_ZONES.includes(facility.zone) ||
    facility.zone !== context.gateZone
  ) {
    return {
      ...identity,
      kind: "ineligible",
      ineligibilityReason: "outside_supported_zone",
    };
  }

  const securityReason = ineligibilityForSecurity(facility.securityZone);
  if (securityReason !== null || !isPostEligible(facility.securityZone)) {
    return {
      ...identity,
      kind: "ineligible",
      ineligibilityReason: securityReason ?? "security_zone_unknown",
    };
  }

  const outboundRaw = travelTimes[context.gateZone]?.[facility.zone] ?? null;
  const returnRaw = travelTimes[facility.zone]?.[context.gateZone] ?? null;
  const outboundMinutes =
    outboundRaw === null || outboundRaw === undefined ? null : outboundRaw;
  const returnMinutes =
    returnRaw === null || returnRaw === undefined ? null : returnRaw;

  const queueMinutes =
    facility.waitMinutes === null
      ? null
      : Math.max(0, facility.waitMinutes + context.queueAdjustmentMinutes);
  const activityMinutes = facility.activityMinutes;

  const partial: RecommendationTimeBreakdownPartial = {
    outboundMinutes,
    returnMinutes,
    queueMinutes,
    activityMinutes,
    bufferMinutes: context.bufferMinutes,
    requiredMinutes: null,
    marginMinutes: null,
  };

  if (
    outboundMinutes === null ||
    returnMinutes === null ||
    queueMinutes === null ||
    activityMinutes === null
  ) {
    return {
      ...identity,
      kind: "unknown",
      unknownReason: firstUnknownReason(partial),
      breakdown: partial,
    };
  }

  const requiredMinutes =
    outboundMinutes +
    returnMinutes +
    queueMinutes +
    activityMinutes +
    context.bufferMinutes;
  const marginMinutes = context.minutesUntilBoarding - requiredMinutes;

  const complete: RecommendationTimeBreakdownComplete = {
    outboundMinutes,
    returnMinutes,
    queueMinutes,
    activityMinutes,
    bufferMinutes: context.bufferMinutes,
    requiredMinutes,
    marginMinutes,
  };

  return {
    ...identity,
    kind: "feasibility",
    status: classifyMargin(marginMinutes),
    breakdown: complete,
  };
}

/** Pure boarding-aware ranking; one result per input facility (after optional category filter). */
export const recommendFacilities: RecommendFacilities = (context, facilities, travelTimes) => {
  const recommendations: ProductionRecommendation[] = [];

  for (const facility of facilities) {
    if (context.category !== undefined && facility.category !== context.category) {
      continue;
    }
    recommendations.push(evaluateFacility(context, facility, travelTimes));
  }

  return recommendations.sort(compareRecommendations);
};
