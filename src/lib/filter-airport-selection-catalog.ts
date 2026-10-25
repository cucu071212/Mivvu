import {
  AIRPORT_SELECTION_CATALOG,
  type AirportCatalogEntry,
} from "@/data/airport-selection-catalog";

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function entrySearchText(entry: AirportCatalogEntry): string {
  return [entry.iata, entry.name, entry.city].join(" ").toLowerCase();
}

/**
 * Case-insensitive filter over code, name, and city. Preserves catalog order (SFO first).
 */
export function filterAirportSelectionCatalog(
  query: string,
  catalog: readonly AirportCatalogEntry[] = AIRPORT_SELECTION_CATALOG,
): AirportCatalogEntry[] {
  const needle = normalizeQuery(query);
  if (!needle) return [...catalog];
  return catalog.filter((entry) => entrySearchText(entry).includes(needle));
}
