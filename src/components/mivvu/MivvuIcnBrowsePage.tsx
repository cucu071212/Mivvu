import { MivvuIcnBrowsePageClient } from "@/components/mivvu/MivvuIcnBrowsePageClient";
import { buildIcnBrowseCatalog } from "@/lib/icn-facilities/icn-browse-view-model";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "@/lib/icn-facilities/load-icn-facilities-fixture";

export function MivvuIcnBrowsePage() {
  const catalogKo = buildIcnBrowseCatalog(loadIcnFacilitiesKoFixture(), "ko");
  const catalogEn = buildIcnBrowseCatalog(loadIcnFacilitiesEnFixture(), "en");

  return <MivvuIcnBrowsePageClient catalogKo={catalogKo} catalogEn={catalogEn} />;
}
