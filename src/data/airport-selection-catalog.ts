import { SUPPORTED_AIRPORT_IATA } from "@/types/airport";

export type AirportCatalogAvailability = "available" | "coming_soon";

export type AirportCatalogEntry = {
  iata: string;
  name: string;
  city: string;
  availability: AirportCatalogAvailability;
};

/** Static UI catalog only — not facility or routing data. */
export const AIRPORT_SELECTION_CATALOG: readonly AirportCatalogEntry[] = [
  {
    iata: SUPPORTED_AIRPORT_IATA,
    name: "San Francisco International Airport",
    city: "San Francisco",
    availability: "available",
  },
  {
    iata: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    availability: "coming_soon",
  },
  {
    iata: "LAX",
    name: "Los Angeles International Airport",
    city: "Los Angeles",
    availability: "coming_soon",
  },
  {
    iata: "ORD",
    name: "O'Hare International Airport",
    city: "Chicago",
    availability: "coming_soon",
  },
];

export function isAirportCatalogSelectable(
  entry: AirportCatalogEntry,
): boolean {
  return (
    entry.availability === "available" &&
    entry.iata === SUPPORTED_AIRPORT_IATA
  );
}
