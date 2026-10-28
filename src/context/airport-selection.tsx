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
  acknowledgeAirportSelection,
  isAirportSelectionAcknowledged,
  isLocalStorageAvailable,
  subscribeAirportSelectionPreference,
} from "@/lib/airport-selection-preference";

type AirportSelectionContextValue = {
  gateOpen: boolean;
  hydrated: boolean;
  storageAvailable: boolean;
  preferenceRevision: number;
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
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [preferenceRevision, setPreferenceRevision] = useState(0);

  useEffect(() => {
    // Client-only preference read — avoids SSR/localStorage hydration mismatch.
    const available = isLocalStorageAvailable();
    queueMicrotask(() => {
      setStorageAvailable(available);
      setHydrated(true);
      if (isAirportSelectionAcknowledged()) {
        setPreferenceRevision((revision) => revision + 1);
      }
    });
  }, []);

  useEffect(() => {
    return subscribeAirportSelectionPreference(() => {
      setForcedOpen(false);
      setPreferenceRevision((revision) => revision + 1);
    });
  }, []);

  const gateOpen =
    forcedOpen ||
    (typeof window === "undefined" ? false : !isAirportSelectionAcknowledged());

  const completeSelection = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    acknowledgeAirportSelection(today);
    setForcedOpen(false);
    setPreferenceRevision((revision) => revision + 1);
  }, []);

  const reopenSelection = useCallback(() => {
    setForcedOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      gateOpen,
      hydrated,
      storageAvailable,
      preferenceRevision,
      completeSelection,
      reopenSelection,
    }),
    [
      gateOpen,
      hydrated,
      storageAvailable,
      preferenceRevision,
      completeSelection,
      reopenSelection,
    ],
  );

  return (
    <AirportSelectionContext.Provider value={value}>
      {children}
    </AirportSelectionContext.Provider>
  );
}
