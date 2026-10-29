import { buildIcnFacilityReferenceCatalogs } from "@/lib/icn-facilities/icn-browse-detail-refs";
import { buildKoreanFallbackIndex } from "@/lib/icn-facilities/icn-browse-display";
import { buildIcnBrowseCatalog } from "@/lib/icn-facilities/icn-browse-view-model";
import {
  buildIcnFacilityDetailView,
  mivvuPreviewLocaleToIcnLanguage,
} from "@/lib/icn-facilities/icn-facility-detail-present";
import { resolveIcnFacilityRef } from "@/lib/icn-facilities/icn-facility-reference";
import { decodeIcnFacilityRefPathSegment } from "@/lib/icn-facilities/icn-facility-ref-transport";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "@/lib/icn-facilities/load-icn-facilities-fixture";
import { MivvuIcnFacilityDetailPageClient } from "@/components/mivvu/MivvuIcnFacilityDetailPageClient";

export type MivvuIcnFacilityDetailPageProps = {
  refPathSegment: string;
};

export function MivvuIcnFacilityDetailPage({ refPathSegment }: MivvuIcnFacilityDetailPageProps) {
  const koFixture = loadIcnFacilitiesKoFixture();
  const enFixture = loadIcnFacilitiesEnFixture();
  const referenceCatalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
  const catalogKo = buildIcnBrowseCatalog(koFixture, "ko");
  const catalogEn = buildIcnBrowseCatalog(enFixture, "en");
  const koFallback = buildKoreanFallbackIndex(catalogKo.items, catalogEn.items);

  const serialized = decodeIcnFacilityRefPathSegment(refPathSegment);
  const resolutionKo = resolveIcnFacilityRef(serialized, referenceCatalogs, mivvuPreviewLocaleToIcnLanguage("ko"));
  const resolutionEn = resolveIcnFacilityRef(serialized, referenceCatalogs, mivvuPreviewLocaleToIcnLanguage("en"));

  const detailKo = buildIcnFacilityDetailView(resolutionKo, "ko", null);
  const detailEn = buildIcnFacilityDetailView(
    resolutionEn,
    "en",
    koFallback,
  );

  return (
    <MivvuIcnFacilityDetailPageClient
      refPathSegment={refPathSegment}
      snapshotKo={catalogKo.snapshot}
      snapshotEn={catalogEn.snapshot}
      detailKo={detailKo}
      detailEn={detailEn}
    />
  );
}
