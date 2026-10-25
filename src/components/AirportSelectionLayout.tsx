"use client";

import type { ReactNode } from "react";
import { useAirportSelection } from "@/context/airport-selection";
import { AirportSelectionBootScreen } from "@/components/AirportSelectionBootScreen";
import { WelcomeAirportScreen } from "@/components/WelcomeAirportScreen";
import { AppShell } from "@/components/AppShell";

export function AirportSelectionLayout({ children }: { children: ReactNode }) {
  const { gateOpen, hydrated } = useAirportSelection();

  if (!hydrated) {
    return <AirportSelectionBootScreen />;
  }

  if (gateOpen) {
    return <WelcomeAirportScreen />;
  }

  return <AppShell>{children}</AppShell>;
}
