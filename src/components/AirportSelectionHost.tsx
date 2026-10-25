"use client";

import type { ReactNode } from "react";
import { AirportSelectionProvider, useAirportSelection } from "@/context/airport-selection";
import { AirportSelectionGate } from "@/components/AirportSelectionGate";

function AirportSelectionShell({ children }: { children: ReactNode }) {
  const { gateOpen, hydrated } = useAirportSelection();
  const inert = hydrated && gateOpen;

  return (
    <>
      <div
        className="gw-airport-selection-app-host"
        aria-hidden={inert ? true : undefined}
        inert={inert ? true : undefined}
      >
        {children}
      </div>
      <AirportSelectionGate />
    </>
  );
}

export function AirportSelectionHost({ children }: { children: ReactNode }) {
  return (
    <AirportSelectionProvider>
      <AirportSelectionShell>{children}</AirportSelectionShell>
    </AirportSelectionProvider>
  );
}
