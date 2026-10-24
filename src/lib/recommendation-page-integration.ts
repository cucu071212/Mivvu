import type {
  Facility,
  FacilityDurationOverrideMap,
  FacilityFilterQuery,
  ProductionRecommendation,
  ProductionTravelMatrix,
  UserContext,
} from "@/types/airport";
import { filterFacilities } from "@/lib/filter-facilities";
import { recommendFacilitiesWithPersonalization } from "@/lib/recommend-facilities-with-personalization";

export type BuildRankedRecommendationsInput = {
  context: UserContext;
  facilities: readonly Facility[];
  filter: FacilityFilterQuery;
  travelTimes: ProductionTravelMatrix;
  useDemoTimeEstimates: boolean;
  durationOverrides?: FacilityDurationOverrideMap;
};

export function buildRankedRecommendations({
  context,
  facilities,
  filter,
  travelTimes,
  useDemoTimeEstimates,
  durationOverrides = {},
}: BuildRankedRecommendationsInput): ProductionRecommendation[] {
  const filtered = filterFacilities(facilities, filter);
  return recommendFacilitiesWithPersonalization(
    context,
    filtered,
    travelTimes,
    { overrides: durationOverrides, useDemoTimeEstimates },
  );
}
