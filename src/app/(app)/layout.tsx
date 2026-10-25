import type { ReactNode } from "react";
import { prepareProductionFacilities } from "@/lib/browse-integration";
import facilitiesJson from "@/data/facilities.json";
import { GateWiseProviders } from "@/components/GateWiseProviders";

const { facilities, datasetErrors } = prepareProductionFacilities(facilitiesJson);

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <GateWiseProviders facilities={facilities} datasetErrors={datasetErrors}>
      {children}
    </GateWiseProviders>
  );
}
