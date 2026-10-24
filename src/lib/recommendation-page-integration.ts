import type {
  Facility,
  FacilityFilterQuery,
  ProductionRecommendation,
  ProductionTravelMatrix,
  UserContext,
} from "@/types/airport";
import { applyDemoTimeEstimates } from "@/lib/demo-estimate-facilities";
import { filterFacilities } from "@/lib/filter-facilities";
import { recommendFacilities } from "@/lib/recommend";

export type BuildRankedRecommendationsInput = {
  context: UserContext;
  facilities: readonly Facility[];
  filter: FacilityFilterQuery;
  travelTimes: ProductionTravelMatrix;
  useDemoTimeEstimates: boolean;
};

export function buildRankedRecommendations({
  context,
  facilities,
  filter,
  travelTimes,
  useDemoTimeEstimates,
}: BuildRankedRecommendationsInput): ProductionRecommendation[] {
  const modeledFacilities = useDemoTimeEstimates
    ? applyDemoTimeEstimates(facilities)
    : facilities;
  const filtered = filterFacilities(modeledFacilities, filter);
  return recommendFacilities(context, filtered, travelTimes);
}
