import { MivvuIcnBrowsePageClient } from "@/components/mivvu/MivvuIcnBrowsePageClient";
import {
  buildIcnBrowseCatalogWithDetailRefs,
  buildIcnFacilityReferenceCatalogs,
} from "@/lib/icn-facilities/icn-browse-detail-refs";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "@/lib/icn-facilities/load-icn-facilities-fixture";

export function MivvuIcnBrowsePage() {
  const koFixture = loadIcnFacilitiesKoFixture();
  const enFixture = loadIcnFacilitiesEnFixture();
  const referenceCatalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
  const catalogKo = buildIcnBrowseCatalogWithDetailRefs(koFixture, "ko", referenceCatalogs);
  const catalogEn = buildIcnBrowseCatalogWithDetailRefs(enFixture, "en", referenceCatalogs);

  return <MivvuIcnBrowsePageClient catalogKo={catalogKo} catalogEn={catalogEn} />;
}
