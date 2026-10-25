"use client";

import type { ReactNode } from "react";
import type { Facility, FacilityValidationError } from "@/types/airport";
import { GateWiseSessionProvider } from "@/context/gatewise-session";
import { AirportSelectionProvider } from "@/context/airport-selection";
import { AirportSelectionLayout } from "@/components/AirportSelectionLayout";

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
    <AirportSelectionProvider>
      <GateWiseSessionProvider
        facilities={facilities}
        datasetErrors={datasetErrors}
      >
        <AirportSelectionLayout>{children}</AirportSelectionLayout>
      </GateWiseSessionProvider>
    </AirportSelectionProvider>
  );
}
