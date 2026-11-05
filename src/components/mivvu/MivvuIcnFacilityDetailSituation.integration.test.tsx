/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MivvuIcnFacilityDetailPageClient } from "./MivvuIcnFacilityDetailPageClient";
import { MivvuPreviewLocaleProvider } from "./MivvuPreviewLocaleProvider";
import { writeStoredMivvuPreviewLocale } from "@/lib/mivvu-preview-locale";
import { buildIcnFacilityDetailView } from "@/lib/icn-facilities/icn-facility-detail-present";
import { buildIcnFacilityReferenceCatalogs } from "@/lib/icn-facilities/icn-browse-detail-refs";
import {
  createIcnFacilityRef,
  resolveIcnFacilityRef,
  serializeIcnFacilityRef,
} from "@/lib/icn-facilities/icn-facility-reference";
import { projectIcnGoodsServicesForDetail } from "@/lib/icn-facilities/icn-goods-services-associate";
import { loadAndValidateReviewedGoodsServicesCompanion } from "@/lib/icn-facilities/icn-goods-services-adoption";
import { buildIcnBrowseCatalog } from "@/lib/icn-facilities/icn-browse-view-model";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "@/lib/icn-facilities/load-icn-facilities-fixture";
import { mivvuPreviewMessages } from "@/lib/mivvu-preview-messages";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("MivvuIcnFacilityDetailPageClient situation integration", () => {
  const koFixture = loadIcnFacilitiesKoFixture();
  const enFixture = loadIcnFacilitiesEnFixture();
  const catalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
  const companion = loadAndValidateReviewedGoodsServicesCompanion(koFixture, enFixture);

  it("shows situation and goods/services on the same detail view", () => {
    expect(companion.ok).toBe(true);
    if (!companion.ok) return;
    const record = koFixture.facilities.find((row) => row.sourceId === "3289")!;
    const serializedRef = serializeIcnFacilityRef(createIcnFacilityRef(record, catalogs));
    const resolutionKo = resolveIcnFacilityRef(serializedRef, catalogs, "K");
    const resolutionEn = resolveIcnFacilityRef(serializedRef, catalogs, "E");
    const detailKo = buildIcnFacilityDetailView(resolutionKo, "ko", null);
    const detailEn = buildIcnFacilityDetailView(resolutionEn, "en", null);
    if (detailKo.kind !== "found" || detailEn.kind !== "found") throw new Error("expected found");
    const goodsKo = projectIcnGoodsServicesForDetail({
      rawCompanion: companion.companion,
      koFixture,
      enFixture,
      referenceCatalogs: catalogs,
      serializedRef,
      previewLocale: "ko",
      resolution: resolutionKo,
      koSourceLabel: mivvuPreviewMessages("ko").icnGoodsServicesKoSourceLabel,
    });
    const goodsEn = projectIcnGoodsServicesForDetail({
      rawCompanion: companion.companion,
      koFixture,
      enFixture,
      referenceCatalogs: catalogs,
      serializedRef,
      previewLocale: "en",
      resolution: resolutionEn,
      koSourceLabel: mivvuPreviewMessages("en").icnGoodsServicesKoSourceLabel,
    });

    const catalogKo = buildIcnBrowseCatalog(koFixture, "ko");
    const catalogEn = buildIcnBrowseCatalog(enFixture, "en");

    writeStoredMivvuPreviewLocale("ko");

    render(
      <MivvuPreviewLocaleProvider>
        <MivvuIcnFacilityDetailPageClient
          refPathSegment="test-ref"
          snapshotKo={catalogKo.snapshot}
          snapshotEn={catalogEn.snapshot}
          detailKo={detailKo}
          detailEn={detailEn}
          goodsServicesKo={goodsKo}
          goodsServicesEn={goodsEn}
          serializedRef={serializedRef}
        />
      </MivvuPreviewLocaleProvider>,
    );

    const messages = mivvuPreviewMessages("ko");
    expect(screen.getByRole("heading", { level: 2, name: messages.icnSituationTitle })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: messages.icnGoodsServicesHeading })).toBeTruthy();
    expect(screen.getByText(messages.icnDetailListingNotes, { selector: "summary" })).toBeTruthy();
  });
});
