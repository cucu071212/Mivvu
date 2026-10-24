import {
  POST_ELIGIBLE_SECURITY_ZONES,
  PRODUCTION_ZONES,
  type Facility,
  type FacilityCategory,
  type IllustrativeRecommendation,
  type IllustrativeTravelMatrix,
  type IllustrativeZone,
  type IneligibilityReason,
  type PassengerSecurityArea,
  type ProductionRecommendation,
  type RecommendFacilities,
  type RecommendFacilitiesIllustrative,
  type RecommendationTimeBreakdownComplete,
  type RecommendationTimeBreakdownPartial,
  type UnknownReason,
  type Zone,
} from "@/types/airport";

type TravelMatrixLike = Record<string, Record<string, number | null | undefined>>;

type RecommendFacilityLike = {
  id: string;
  name: string;
  zone: string;
  category: FacilityCategory;
  securityZone: Facility["securityZone"];
  waitMinutes: number | null;
  activityMinutes: number | null;
  locationConfidence: Facility["locationConfidence"];
  timeConfidence: Facility["timeConfidence"];
};

type RecommendContextLike = {
  gateZone: string;
  minutesUntilBoarding: number;
  bufferMinutes: number;
  category?: FacilityCategory;
  queueAdjustmentMinutes: number;
  passengerSecurityArea: PassengerSecurityArea;
};

type RecommendationLike =
  | ProductionRecommendation
  | IllustrativeRecommendation;

function identityFromFacility(facility: RecommendFacilityLike) {
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

function classifyMargin(
  marginMinutes: number,
): "feasible_in_model" | "tight_in_model" | "over_budget" {
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

/** Reject null, non-finite, and negative matrix edges without coercing to zero. */
function resolveDirectedTravelLeg(
  travelTimes: TravelMatrixLike,
  fromZone: string,
  toZone: string,
): number | null {
  const raw = travelTimes[fromZone]?.[toZone];
  if (raw === null || raw === undefined) {
    return null;
  }
  if (!Number.isFinite(raw) || raw < 0) {
    return null;
  }
  return raw;
}

function productionZoneIneligibility(
  gateZone: string,
  facilityZone: string,
): IneligibilityReason | null {
  if (
    !PRODUCTION_ZONES.includes(gateZone as Zone) ||
    !PRODUCTION_ZONES.includes(facilityZone as Zone) ||
    facilityZone !== gateZone
  ) {
    return "outside_supported_zone";
  }
  return null;
}

function illustrativeZoneIneligibility(
  gateZone: string,
  facilityZone: string,
): IneligibilityReason | null {
  const supported: IllustrativeZone[] = ["D", "E", "F"];
  if (
    !supported.includes(gateZone as IllustrativeZone) ||
    !supported.includes(facilityZone as IllustrativeZone)
  ) {
    return "outside_supported_zone";
  }
  return null;
}

function evaluateFacilityCore(
  context: RecommendContextLike,
  facility: RecommendFacilityLike,
  travelTimes: TravelMatrixLike,
  zoneIneligibility: (gateZone: string, facilityZone: string) => IneligibilityReason | null,
): RecommendationLike {
  const identity = identityFromFacility(facility);

  if (context.passengerSecurityArea !== "post") {
    return {
      ...identity,
      kind: "ineligible",
      ineligibilityReason: "passenger_not_airside",
    } as RecommendationLike;
  }

  const zoneReason = zoneIneligibility(context.gateZone, facility.zone);
  if (zoneReason !== null) {
    return {
      ...identity,
      kind: "ineligible",
      ineligibilityReason: zoneReason,
    } as RecommendationLike;
  }

  const securityReason = ineligibilityForSecurity(facility.securityZone);
  if (securityReason !== null || !isPostEligible(facility.securityZone)) {
    return {
      ...identity,
      kind: "ineligible",
      ineligibilityReason: securityReason ?? "security_zone_unknown",
    } as RecommendationLike;
  }

  const outboundMinutes = resolveDirectedTravelLeg(
    travelTimes,
    context.gateZone,
    facility.zone,
  );
  const returnMinutes = resolveDirectedTravelLeg(
    travelTimes,
    facility.zone,
    context.gateZone,
  );

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
    } as RecommendationLike;
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
  } as RecommendationLike;
}

function sortRank(recommendation: RecommendationLike): number {
  if (recommendation.kind === "feasibility") {
    if (recommendation.status === "feasible_in_model") return 0;
    if (recommendation.status === "tight_in_model") return 1;
    return 2;
  }
  if (recommendation.kind === "unknown") return 3;
  return 4;
}

function compareRecommendations(
  left: RecommendationLike,
  right: RecommendationLike,
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

function recommendCore<T extends RecommendationLike>(
  context: RecommendContextLike,
  facilities: readonly RecommendFacilityLike[],
  travelTimes: TravelMatrixLike,
  zoneIneligibility: (gateZone: string, facilityZone: string) => IneligibilityReason | null,
): T[] {
  const recommendations: T[] = [];

  for (const facility of facilities) {
    if (context.category !== undefined && facility.category !== context.category) {
      continue;
    }
    recommendations.push(
      evaluateFacilityCore(
        context,
        facility,
        travelTimes,
        zoneIneligibility,
      ) as T,
    );
  }

  return recommendations.sort(compareRecommendations) as T[];
}

/** Pure boarding-aware ranking; one result per input facility (after optional category filter). */
export const recommendFacilities: RecommendFacilities = (context, facilities, travelTimes) =>
  recommendCore<ProductionRecommendation>(
    context,
    facilities,
    travelTimes,
    productionZoneIneligibility,
  );

/** GW-012 synthetic fixtures only — same engine as production with illustrative zones/matrix. */
export const recommendFacilitiesIllustrative: RecommendFacilitiesIllustrative = (
  context,
  facilities,
  travelTimes,
) =>
  recommendCore<IllustrativeRecommendation>(
    {
      ...context,
      passengerSecurityArea: "post",
    },
    facilities,
    travelTimes as IllustrativeTravelMatrix,
    illustrativeZoneIneligibility,
  );
