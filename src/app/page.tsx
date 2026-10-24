import { GateWiseHome } from "@/components/GateWiseHome";
import { prepareProductionFacilities } from "@/lib/browse-integration";
import facilitiesJson from "@/data/facilities.json";

const { facilities, datasetErrors } = prepareProductionFacilities(facilitiesJson);

export default function Home() {
  return (
    <main className="min-h-full flex-1">
      <GateWiseHome facilities={facilities} datasetErrors={datasetErrors} />
    </main>
  );
}
