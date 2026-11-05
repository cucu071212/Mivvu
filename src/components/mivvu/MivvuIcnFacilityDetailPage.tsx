import { buildIcnFacilityReferenceCatalogs } from "@/lib/icn-facilities/icn-browse-detail-refs";
import { buildKoreanFallbackIndex } from "@/lib/icn-facilities/icn-browse-display";
import { buildIcnBrowseCatalog } from "@/lib/icn-facilities/icn-browse-view-model";
import {
  buildIcnFacilityDetailView,
  mivvuPreviewLocaleToIcnLanguage,
} from "@/lib/icn-facilities/icn-facility-detail-present";
import { resolveIcnFacilityRef } from "@/lib/icn-facilities/icn-facility-reference";
import { decodeIcnFacilityRefPathSegment } from "@/lib/icn-facilities/icn-facility-ref-transport";
import { projectIcnGoodsServicesForDetail } from "@/lib/icn-facilities/icn-goods-services-associate";
import {
  icnGoodsServicesDevCompanionLoadAllowed,
  loadIcnGoodsServicesCompanion,
} from "@/lib/icn-facilities/load-icn-goods-services-companion";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "@/lib/icn-facilities/load-icn-facilities-fixture";
import { mivvuPreviewMessages } from "@/lib/mivvu-preview-messages";
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

  const rawCompanion = loadIcnGoodsServicesCompanion();
  const labeledDevSyntheticCompanion = icnGoodsServicesDevCompanionLoadAllowed();
  const messagesEn = mivvuPreviewMessages("en");
  const goodsKo = projectIcnGoodsServicesForDetail({
    rawCompanion,
    koFixture,
    enFixture,
    referenceCatalogs,
    serializedRef: serialized,
    previewLocale: "ko",
    resolution: resolutionKo,
    koSourceLabel: messagesEn.icnGoodsServicesKoSourceLabel,
  });
  const goodsEn = projectIcnGoodsServicesForDetail({
    rawCompanion,
    koFixture,
    enFixture,
    referenceCatalogs,
    serializedRef: serialized,
    previewLocale: "en",
    resolution: resolutionEn,
    koSourceLabel: messagesEn.icnGoodsServicesKoSourceLabel,
  });

  return (
    <MivvuIcnFacilityDetailPageClient
      refPathSegment={refPathSegment}
      snapshotKo={catalogKo.snapshot}
      snapshotEn={catalogEn.snapshot}
      detailKo={detailKo}
      detailEn={detailEn}
      goodsServicesKo={goodsKo}
      goodsServicesEn={goodsEn}
      serializedRef={serialized}
      labeledDevSyntheticCompanion={labeledDevSyntheticCompanion}
    />
  );
}
