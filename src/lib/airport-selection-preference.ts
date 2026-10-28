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

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readStoredAirportSelection(): StoredAirportSelection | null {
  const storage = getLocalStorage();
  if (!storage) return null;
  try {
    return parseStoredAirportSelection(
      storage.getItem(AIRPORT_SELECTION_STORAGE_KEY),
    );
  } catch {
    return null;
  }
}

/** Tab-session acknowledgment when localStorage read/write fails or is unavailable. */
let sessionAirportSelectionAcknowledged = false;

export function isAirportSelectionAcknowledged(): boolean {
  return readStoredAirportSelection() !== null || sessionAirportSelectionAcknowledged;
}

/**
 * Records explicit SFO entry acknowledgment for the current tab session and attempts persistence.
 * Always notifies listeners so route guards see acknowledgment even when persistence fails.
 */
export function acknowledgeAirportSelection(acknowledgedAt: string): void {
  if (!isCalendarDate(acknowledgedAt)) return;
  sessionAirportSelectionAcknowledged = true;
  persistAirportSelection(acknowledgedAt);
  notifyAirportSelectionPreferenceChange();
}

export function clearSessionAirportSelectionAcknowledgmentForTests(): void {
  sessionAirportSelectionAcknowledged = false;
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
  const storage = getLocalStorage();
  if (!storage) return null;
  try {
    storage.setItem(
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
  sessionAirportSelectionAcknowledged = false;
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(AIRPORT_SELECTION_STORAGE_KEY);
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
  const storage = getLocalStorage();
  if (!storage) return false;
  try {
    const probe = "__gw_airport_selection_probe__";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
