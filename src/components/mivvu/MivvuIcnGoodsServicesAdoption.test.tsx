/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MivvuIcnGoodsServicesSection } from "./MivvuIcnGoodsServicesSection";
import { mivvuPreviewMessages } from "@/lib/mivvu-preview-messages";
import { buildIcnFacilityReferenceCatalogs } from "@/lib/icn-facilities/icn-browse-detail-refs";
import {
  createIcnFacilityRef,
  resolveIcnFacilityRef,
  serializeIcnFacilityRef,
} from "@/lib/icn-facilities/icn-facility-reference";
import { projectIcnGoodsServicesForDetail } from "@/lib/icn-facilities/icn-goods-services-associate";
import { loadAndValidateReviewedGoodsServicesCompanion } from "@/lib/icn-facilities/icn-goods-services-adoption";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "@/lib/icn-facilities/load-icn-facilities-fixture";

describe("reviewed companion detail UI projection (jsdom)", () => {
  const koFixture = loadIcnFacilitiesKoFixture();
  const enFixture = loadIcnFacilitiesEnFixture();
  const loaded = loadAndValidateReviewedGoodsServicesCompanion(koFixture, enFixture);

  it("loads reviewed companion for UI fixtures", () => {
    expect(loaded.ok).toBe(true);
  });

  it("shows KO goods/services with observation date for sourceId 3289", () => {
    if (!loaded.ok) return;
    const catalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
    const record = koFixture.facilities.find((r) => r.sourceId === "3289")!;
    const serializedRef = serializeIcnFacilityRef(createIcnFacilityRef(record, catalogs));
    const projection = projectIcnGoodsServicesForDetail({
      rawCompanion: loaded.companion,
      koFixture,
      enFixture,
      referenceCatalogs: catalogs,
      serializedRef,
      previewLocale: "ko",
      resolution: resolveIcnFacilityRef(serializedRef, catalogs, "K"),
      koSourceLabel: mivvuPreviewMessages("ko").icnGoodsServicesKoSourceLabel,
    });
    render(
      <MivvuIcnGoodsServicesSection
        projection={projection}
        locale="ko"
        messages={mivvuPreviewMessages("ko")}
      />,
    );
    expect(screen.getByRole("region")).toBeTruthy();
    expect(screen.getByText(/라테|Latte|교토/i)).toBeTruthy();
    expect(screen.getByText(/2026/)).toBeTruthy();
  });

  it("shows EN goods/services for sourceId 3289 without KO fallback", () => {
    if (!loaded.ok) return;
    const catalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
    const record = enFixture.facilities.find((r) => r.sourceId === "3289")!;
    const serializedRef = serializeIcnFacilityRef(createIcnFacilityRef(record, catalogs));
    const projection = projectIcnGoodsServicesForDetail({
      rawCompanion: loaded.companion,
      koFixture,
      enFixture,
      referenceCatalogs: catalogs,
      serializedRef,
      previewLocale: "en",
      resolution: resolveIcnFacilityRef(serializedRef, catalogs, "E"),
      koSourceLabel: mivvuPreviewMessages("en").icnGoodsServicesKoSourceLabel,
    });
    render(
      <MivvuIcnGoodsServicesSection
        projection={projection}
        locale="en"
        messages={mivvuPreviewMessages("en")}
      />,
    );
    expect(screen.getByText(/Latte/i)).toBeTruthy();
    expect(projection.available?.fallbackUsed).toBe(false);
  });

  it("hides section for empty sourceId 3395 and unmatched 2063", () => {
    if (!loaded.ok) return;
    const catalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
    const messages = mivvuPreviewMessages("ko");
    for (const sourceId of ["3395", "2063"]) {
      const record = koFixture.facilities.find((r) => r.sourceId === sourceId)!;
      const serializedRef = serializeIcnFacilityRef(createIcnFacilityRef(record, catalogs));
      const projection = projectIcnGoodsServicesForDetail({
        rawCompanion: loaded.companion,
        koFixture,
        enFixture,
        referenceCatalogs: catalogs,
        serializedRef,
        previewLocale: "ko",
        resolution: resolveIcnFacilityRef(serializedRef, catalogs, "K"),
        koSourceLabel: messages.icnGoodsServicesKoSourceLabel,
      });
      const { container } = render(
        <MivvuIcnGoodsServicesSection projection={projection} locale="ko" messages={messages} />,
      );
      expect(container.firstChild).toBeNull();
    }
  });

  it("sourceId 243 KO: visible description without collapse (187 projected chars)", () => {
    if (!loaded.ok) return;
    const catalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
    const record = koFixture.facilities.find((r) => r.sourceId === "243")!;
    const serializedRef = serializeIcnFacilityRef(createIcnFacilityRef(record, catalogs));
    const projection = projectIcnGoodsServicesForDetail({
      rawCompanion: loaded.companion,
      koFixture,
      enFixture,
      referenceCatalogs: catalogs,
      serializedRef,
      previewLocale: "ko",
      resolution: resolveIcnFacilityRef(serializedRef, catalogs, "K"),
      koSourceLabel: mivvuPreviewMessages("ko").icnGoodsServicesKoSourceLabel,
    });
    expect(projection.sectionVisible).toBe(true);
    expect(projection.available?.longTextCollapsedByDefault).toBe(false);
    const { container } = render(
      <MivvuIcnGoodsServicesSection
        projection={projection}
        locale="ko"
        messages={mivvuPreviewMessages("ko")}
      />,
    );
    expect(container.querySelector(".mivvu-icn-goods-toggle")).toBeNull();
  });

  it("sourceId 243 EN E-origin: collapse control for 349 projected chars", () => {
    if (!loaded.ok) return;
    const catalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
    const record = enFixture.facilities.find((r) => r.sourceId === "243")!;
    const serializedRef = serializeIcnFacilityRef(createIcnFacilityRef(record, catalogs));
    const projection = projectIcnGoodsServicesForDetail({
      rawCompanion: loaded.companion,
      koFixture,
      enFixture,
      referenceCatalogs: catalogs,
      serializedRef,
      previewLocale: "en",
      resolution: resolveIcnFacilityRef(serializedRef, catalogs, "E"),
      koSourceLabel: mivvuPreviewMessages("en").icnGoodsServicesKoSourceLabel,
    });
    expect(projection.sectionVisible).toBe(true);
    expect(projection.available?.longTextCollapsedByDefault).toBe(true);
    render(
      <MivvuIcnGoodsServicesSection
        projection={projection}
        locale="en"
        messages={mivvuPreviewMessages("en")}
      />,
    );
    const toggle = screen.getByRole("button", { name: "Show more" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("KO locale only: no visible adopted row exceeds 280 projected chars", () => {
    if (!loaded.ok) return;
    const catalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
    const messages = mivvuPreviewMessages("ko");
    let maxLen = 0;
    for (const record of koFixture.facilities) {
      const serializedRef = serializeIcnFacilityRef(createIcnFacilityRef(record, catalogs));
      const projection = projectIcnGoodsServicesForDetail({
        rawCompanion: loaded.companion,
        koFixture,
        enFixture,
        referenceCatalogs: catalogs,
        serializedRef,
        previewLocale: "ko",
        resolution: resolveIcnFacilityRef(serializedRef, catalogs, "K"),
        koSourceLabel: messages.icnGoodsServicesKoSourceLabel,
      });
      if (!projection.sectionVisible) continue;
      const len = projection.available?.paragraphs.map((p) => p.text).join(" ").length ?? 0;
      if (len > maxLen) maxLen = len;
    }
    expect(maxLen).toBeLessThanOrEqual(280);
  }, 120_000);
});
