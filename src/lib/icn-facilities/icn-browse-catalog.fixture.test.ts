import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { buildIcnBrowseCatalog } from "./icn-browse-view-model";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "./load-icn-facilities-fixture";

describe("ICN KO fixture browse catalog", () => {
  it("matches investigation counts after identical-row collapse", () => {
    const fixture = loadIcnFacilitiesKoFixture();
    assert.equal(fixture.facilities.length, 1028);
    assert.equal(fixture.meta.recordCount, 1028);

    const catalog = buildIcnBrowseCatalog(fixture, "ko");
    assert.equal(catalog.snapshot.listingCount, 1011);
    assert.equal(catalog.items.length, 1011);
    assert.ok(catalog.terminals.length > 0);
  });

  it("keeps English facilities in browse catalog when large category is missing on raw rows", () => {
    const fixture = loadIcnFacilitiesEnFixture();
    const missingLargeRaw = fixture.facilities.filter((row) => !row.categories.large?.trim()).length;
    assert.equal(missingLargeRaw, 164);

    const catalog = buildIcnBrowseCatalog(fixture, "en");
    assert.equal(catalog.snapshot.listingCount, 1011);
    assert.ok(catalog.items.some((item) => !item.categoryLabel));
  });
});
