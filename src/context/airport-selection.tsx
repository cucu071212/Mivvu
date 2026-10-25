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

export function AirportSelectionProvider({ children }: { children: ReactNode }) {
  const [forcedOpen, setForcedOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [acknowledged, setAcknowledged] = useState(true);
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

  const gateOpen = forcedOpen || (hydrated && !acknowledged);

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
