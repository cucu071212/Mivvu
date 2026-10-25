"use client";

import type { ReactNode } from "react";
import type { Facility, FacilityValidationError } from "@/types/airport";
import { GateWiseSessionProvider } from "@/context/gatewise-session";
import { AppShell } from "@/components/AppShell";

export type GateWiseProvidersProps = {
  facilities: Facility[];
  datasetErrors: FacilityValidationError[];
  children: ReactNode;
};

export function GateWiseProviders({
  facilities,
  datasetErrors,
  children,
}: GateWiseProvidersProps) {
  return (
    <GateWiseSessionProvider
      facilities={facilities}
      datasetErrors={datasetErrors}
    >
      <AppShell>{children}</AppShell>
    </GateWiseSessionProvider>
  );
}
