import { filterFacilities } from "@/lib/filter-facilities";
import type { Facility, FacilityFilterQuery } from "@/types/airport";

/** Browse directory: only `browseEligible` rows; same AND semantics as {@link filterFacilities}. */
export function filterBrowseDirectory(
  facilities: readonly Facility[],
  query: FacilityFilterQuery,
): Facility[] {
  const browse = facilities.filter((facility) => facility.browseEligible);
  return filterFacilities(browse, query);
}

export function countBrowseEligible(facilities: readonly Facility[]): number {
  return facilities.filter((facility) => facility.browseEligible).length;
}
