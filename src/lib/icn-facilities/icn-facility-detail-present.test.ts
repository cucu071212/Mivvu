import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { buildIcnFacilityDetailView, mivvuPreviewLocaleToIcnLanguage } from "./icn-facility-detail-present";
import { buildKoreanFallbackIndex } from "./icn-browse-display";
import { buildIcnBrowseCatalogWithDetailRefs, buildIcnFacilityReferenceCatalogs } from "./icn-browse-detail-refs";
import { decodeIcnFacilityRefPathSegment } from "./icn-facility-ref-transport";
import { resolveIcnFacilityRef } from "./icn-facility-reference";
import { loadIcnFacilitiesEnFixture, loadIcnFacilitiesKoFixture } from "./load-icn-facilities-fixture";

describe("icn-facility-detail-present", () => {
  it("maps locale to K/E for resolution", () => {
    assert.equal(mivvuPreviewLocaleToIcnLanguage("ko"), "K");
    assert.equal(mivvuPreviewLocaleToIcnLanguage("en"), "E");
  });

  it("preserves the same ref across EN locale with genuine EN fields for 3289", () => {
    const ko = loadIcnFacilitiesKoFixture();
    const en = loadIcnFacilitiesEnFixture();
    const catalogs = buildIcnFacilityReferenceCatalogs(ko, en);
    const catalogKo = buildIcnBrowseCatalogWithDetailRefs(ko, "ko", catalogs);
    const item = catalogKo.items.find((row) => row.sourceId === "3289")!;
    const serialized = decodeIcnFacilityRefPathSegment(item.detailRefTransport!);
    const resolution = resolveIcnFacilityRef(serialized, catalogs, "E");
    const catalogEn = buildIcnBrowseCatalogWithDetailRefs(en, "en", catalogs);
    const koFallback = buildKoreanFallbackIndex(catalogKo.items, catalogEn.items);
    const view = buildIcnFacilityDetailView(resolution, "en", koFallback);
    assert.equal(view.kind, "found");
    if (view.kind !== "found") throw new Error("expected found");
    assert.equal(view.displayName, "% ARABICA");
    assert.equal(view.nameFromKoreanFallback, false);
    assert.match(view.displayLocation ?? "", /209/i);
  });

  it("surfaces missing and ambiguous resolver outcomes without a record", () => {
    const missing = buildIcnFacilityDetailView(
      { status: "missing", reason: "reference_content_not_found" },
      "ko",
      null,
    );
    assert.equal(missing.kind, "error");
    const ambiguous = buildIcnFacilityDetailView(
      { status: "ambiguous", reason: "bilingual_pairing" },
      "en",
      null,
    );
    assert.equal(ambiguous.kind, "error");
    assert.equal(ambiguous.reason, "bilingual_pairing");
  });
});
