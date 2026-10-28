import type { AirportCatalogEntry } from "@/data/airport-selection-catalog";
import { SUPPORTED_AIRPORT_IATA } from "@/types/airport";

/** Mivvu first-entry slice — ICN + SFO only (not the full GateWise directory). */
export const MIVVU_ENTRY_AIRPORT_CATALOG: readonly AirportCatalogEntry[] = [
  {
    iata: "ICN",
    name: "Incheon International Airport",
    city: "Incheon, South Korea",
    availability: "coming_soon",
  },
  {
    iata: SUPPORTED_AIRPORT_IATA,
    name: "San Francisco International Airport",
    city: "San Francisco, United States",
    availability: "available",
  },
];

export type MivvuEntryAirportIata = "ICN" | typeof SUPPORTED_AIRPORT_IATA;

export const MIVVU_ENTRY_DEFAULT_IATA: MivvuEntryAirportIata = "ICN";

export function isMivvuEntryBrowsable(iata: string): boolean {
  return iata === SUPPORTED_AIRPORT_IATA;
}
