"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  isLocalStorageAvailable,
  persistAirportSelection,
  readStoredAirportSelection,
  subscribeAirportSelectionPreference,
} from "@/lib/airport-selection-preference";

type AirportSelectionContextValue = {
  gateOpen: boolean;
  hydrated: boolean;
  storageAvailable: boolean;
  completeSelection: () => void;
  reopenSelection: () => void;
};

const AirportSelectionContext = createContext<AirportSelectionContextValue | null>(
  null,
);

export function useAirportSelection(): AirportSelectionContextValue {
  const value = useContext(AirportSelectionContext);
  if (!value) {
    throw new Error("useAirportSelection must be used within AirportSelectionProvider");
  }
  return value;
}

function readInitialAcknowledged(): boolean {
  if (typeof window === "undefined") return true;
  return readStoredAirportSelection() !== null;
}

export function AirportSelectionProvider({ children }: { children: ReactNode }) {
  const [forcedOpen, setForcedOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [acknowledged, setAcknowledged] = useState(readInitialAcknowledged);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    // Client-only preference read — avoids SSR/localStorage hydration mismatch.
    const available = isLocalStorageAvailable();
    const stored = readStoredAirportSelection() !== null;
    queueMicrotask(() => {
      setStorageAvailable(available);
      setAcknowledged(stored);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    return subscribeAirportSelectionPreference(() => {
      const stored = readStoredAirportSelection() !== null;
      setAcknowledged(stored);
      setForcedOpen(false);
    });
  }, []);

  const gateOpen =
    forcedOpen ||
    !(hydrated ? acknowledged : readInitialAcknowledged());

  const completeSelection = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    persistAirportSelection(today);
    setAcknowledged(true);
    setForcedOpen(false);
  }, []);

  const reopenSelection = useCallback(() => {
    setForcedOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      gateOpen,
      hydrated,
      storageAvailable,
      completeSelection,
      reopenSelection,
    }),
    [gateOpen, hydrated, storageAvailable, completeSelection, reopenSelection],
  );

  return (
    <AirportSelectionContext.Provider value={value}>
      {children}
    </AirportSelectionContext.Provider>
  );
}
