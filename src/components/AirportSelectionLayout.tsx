"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAirportSelection } from "@/context/airport-selection";
import { isAirportSelectionAcknowledged } from "@/lib/airport-selection-preference";
import { AirportSelectionBootScreen } from "@/components/AirportSelectionBootScreen";
import { AppShell } from "@/components/AppShell";
import { MIVVU_ENTRY_PATH } from "@/lib/mivvu-entry-routes";

export function AirportSelectionLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { gateOpen, hydrated, preferenceRevision } = useAirportSelection();

  useEffect(() => {
    if (!hydrated) return;
    if (isAirportSelectionAcknowledged()) return;
    if (!gateOpen) return;
    router.replace(MIVVU_ENTRY_PATH);
  }, [hydrated, gateOpen, preferenceRevision, router]);

  if (!hydrated) {
    return <AirportSelectionBootScreen />;
  }

  if (gateOpen) {
    return <AirportSelectionBootScreen />;
  }

  return <AppShell>{children}</AppShell>;
}
