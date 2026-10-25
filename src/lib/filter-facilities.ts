import type { FilterFacilities } from "@/types/airport";

/** Filters use AND; base-equal names retain input order in the stable sort. */
export const filterFacilities: FilterFacilities = (facilities, query) => {
  const text = query.text?.trim().toLowerCase() ?? "";

  // filter creates a new array, so sorting never changes the caller's array.
  return facilities
    .filter(
      (facility) =>
        facility.name.toLowerCase().includes(text) &&
        (query.category === undefined || facility.category === query.category) &&
        (query.zone === undefined || facility.zone === query.zone) &&
        (query.terminalCode === undefined ||
          facility.terminalCode === query.terminalCode),
    )
    .sort((left, right) =>
      left.name.localeCompare(right.name, "en-US", { sensitivity: "base" }),
    );
};
