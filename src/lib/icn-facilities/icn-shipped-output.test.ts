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
    // Captured on main @ 5bd3121 before the GW-ICN-007 implementation.
    const baseline = {
      ko: "0986f6161b5f779a4ba1c92b5966a76347d6a4de5d2c00b7258fbe8e692ce91e",
      en: "5227073d4192c252455094e1c5671a078df07dafcf8c0d93cee1dde09249296d",
    };
    assert.equal(createHash("sha256").update(content).digest("hex"), baseline[locale]);
  }
});
