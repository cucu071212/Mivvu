import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { it } from "vitest";
import { buildIcnBrowseCatalog } from "./icn-browse-view-model";
import { buildKoreanFallbackIndex, toBrowseDisplayItems } from "./icn-browse-display";
import { loadIcnFacilitiesFixture } from "./load-icn-facilities-fixture";

it("preserves shipped catalog and display content", () => {
  const ko = buildIcnBrowseCatalog(loadIcnFacilitiesFixture("ko"), "ko");
  for (const locale of ["ko", "en"] as const) {
    const catalog = buildIcnBrowseCatalog(loadIcnFacilitiesFixture(locale), locale);
    const display = toBrowseDisplayItems(catalog.items, locale, buildKoreanFallbackIndex(ko.items, catalog.items));
    // Date formatting is timezone-dependent; content, keys, order and terminal options are not.
    const content = JSON.stringify({ items: catalog.items, terminals: catalog.terminals, display });
    // Baseline captured GW-ICN-018-HASH-DISPOSITION @ 7dbca21; fixture bytes unchanged since 5bd3121.
    // Supersedes digests recorded at main @ 5bd3121 (GW-ICN-007 / GW-ICN-009). On shipped fixtures,
    // GW-ICN-007 preserved this serialized output (Antigravity structural diff); GW-ICN-014 added
    // categoryLargeKey / categoryMediumKey on list + display rows — sole cause of digest change vs 5bd3121.
    // Listing count/order/terminals: icn-browse-catalog.fixture.test.ts and related suites.
    const baseline = {
      ko: "b6149d16c23e2bf2cbc5351aca4de64d73d2ac592dcbeb8296cd0e75d5485a9a",
      en: "9d1718c59ecfcbb4d33a168e4fb8a89aa41be1a8f6f5d50e5fada7493190342e",
    };
    assert.equal(createHash("sha256").update(content).digest("hex"), baseline[locale]);
  }
});
