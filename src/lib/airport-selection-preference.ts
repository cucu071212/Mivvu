import { SUPPORTED_AIRPORT_IATA } from "@/types/airport";
import { isCalendarDate } from "@/lib/airport-local-time";

export const AIRPORT_SELECTION_STORAGE_KEY = "gatewise.airport-selection.v1";

export type StoredAirportSelection = {
  airportIata: typeof SUPPORTED_AIRPORT_IATA;
  acknowledgedAt: string;
};

export function parseStoredAirportSelection(
  raw: string | null,
): StoredAirportSelection | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<StoredAirportSelection>;
    if (value.airportIata !== SUPPORTED_AIRPORT_IATA) return null;
    if (!value.acknowledgedAt || !isCalendarDate(value.acknowledgedAt)) return null;
    return {
      airportIata: SUPPORTED_AIRPORT_IATA,
      acknowledgedAt: value.acknowledgedAt,
    };
  } catch {
    return null;
  }
}

export function readStoredAirportSelection(): StoredAirportSelection | null {
  if (typeof window === "undefined") return null;
  try {
    return parseStoredAirportSelection(
      window.localStorage.getItem(AIRPORT_SELECTION_STORAGE_KEY),
    );
  } catch {
    return null;
  }
}

export function persistAirportSelection(
  acknowledgedAt: string,
): StoredAirportSelection | null {
  if (!isCalendarDate(acknowledgedAt)) return null;
  const record: StoredAirportSelection = {
    airportIata: SUPPORTED_AIRPORT_IATA,
    acknowledgedAt,
  };
  if (typeof window === "undefined") return record;
  try {
    window.localStorage.setItem(
      AIRPORT_SELECTION_STORAGE_KEY,
      JSON.stringify(record),
    );
    notifyAirportSelectionPreferenceChange();
    return record;
  } catch {
    return null;
  }
}

export function clearStoredAirportSelection(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(AIRPORT_SELECTION_STORAGE_KEY);
  } catch {
    // Storage unavailable — no-op.
  }
}

const airportSelectionListeners = new Set<() => void>();

export function subscribeAirportSelectionPreference(onChange: () => void): () => void {
  airportSelectionListeners.add(onChange);
  return () => airportSelectionListeners.delete(onChange);
}

export function notifyAirportSelectionPreferenceChange(): void {
  for (const listener of airportSelectionListeners) {
    listener();
  }
}

export function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const probe = "__gw_airport_selection_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
