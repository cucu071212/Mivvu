import { MivvuIcnSavedFacilitiesPageClient } from "@/components/mivvu/MivvuIcnSavedFacilitiesPageClient";
import {
  buildIcnFacilityReferenceCatalogs,
} from "@/lib/icn-facilities/icn-browse-detail-refs";
import { buildIcnBrowseCatalog } from "@/lib/icn-facilities/icn-browse-view-model";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "@/lib/icn-facilities/load-icn-facilities-fixture";

export function MivvuIcnSavedFacilitiesPage() {
  const koFixture = loadIcnFacilitiesKoFixture();
  const enFixture = loadIcnFacilitiesEnFixture();
  const referenceCatalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
  const catalogKo = buildIcnBrowseCatalog(koFixture, "ko");
  const catalogEn = buildIcnBrowseCatalog(enFixture, "en");

  return (
    <MivvuIcnSavedFacilitiesPageClient
      referenceCatalogs={referenceCatalogs}
      catalogKo={catalogKo}
      catalogEn={catalogEn}
    />
  );
}
