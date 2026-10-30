import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  ICN_BROWSE_TOP_LEVEL_CATEGORY_KEYS,
  applyIcnBrowseCategoryFilter,
  buildIcnBrowseCategoryTaxonomy,
  defaultIcnBrowseCategoryFilter,
  inheritKoreanCategoryKeysForFilter,
  resolveLargeCategoryDisplay,
  resolveMediumCategoryDisplay,
} from "./icn-browse-category-taxonomy";
import { buildIcnBrowseCatalog, filterIcnBrowseItems } from "./icn-browse-view-model";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "./load-icn-facilities-fixture";

describe("icn-browse-category-taxonomy", () => {
  it("matches the eight approved KO large categories in fixtures", () => {
    const ko = loadIcnFacilitiesKoFixture();
    const catalogKo = buildIcnBrowseCatalog(ko, "ko");
    const observed = new Set(
      catalogKo.items
        .map((item) => item.categoryLargeKey)
        .filter((value): value is string => Boolean(value)),
    );
    for (const key of ICN_BROWSE_TOP_LEVEL_CATEGORY_KEYS) {
      assert.ok(observed.has(key), `fixture missing approved large category: ${key}`);
    }
    assert.equal(ICN_BROWSE_TOP_LEVEL_CATEGORY_KEYS.length, 8);
  });

  it("preserves selection identity via KO keys across locales", () => {
    const ko = buildIcnBrowseCatalog(loadIcnFacilitiesKoFixture(), "ko");
    const en = buildIcnBrowseCatalog(loadIcnFacilitiesEnFixture(), "en");
    const taxonomy = buildIcnBrowseCategoryTaxonomy(ko.items, en.items);
    const food = taxonomy.topLevel.find((row) => row.key === "식・음료");
    assert.ok(food);
    assert.equal(food.labelEn, "Restaurants");
    assert.equal(food.labelEnFromKoreanFallback, false);
    assert.ok(food.subcategories.length > 0);
    const narrowed = applyIcnBrowseCategoryFilter(ko.items, {
      categoryLarge: "식・음료",
      categoryMedium: "all",
    });
    const enAligned = inheritKoreanCategoryKeysForFilter(ko.items, en.items);
    const enNarrowed = applyIcnBrowseCategoryFilter(enAligned, {
      categoryLarge: "식・음료",
      categoryMedium: "all",
    });
    assert.equal(narrowed.length, enNarrowed.length);
    assert.ok(narrowed.length > 0);
  });

  it("composes category filters with search and terminal", () => {
    const ko = buildIcnBrowseCatalog(loadIcnFacilitiesKoFixture(), "ko");
    const filtered = filterIcnBrowseItems(
      ko.items,
      "아라비카",
      "P03",
      "ko",
      { categoryLarge: "식・음료", categoryMedium: "all" },
    );
    assert.ok(filtered.length >= 1);
    assert.ok(filtered.every((item) => item.categoryLargeKey === "식・음료"));
  });

  it("clears medium when parent large changes at filter helper level", () => {
    const ko = buildIcnBrowseCatalog(loadIcnFacilitiesKoFixture(), "ko");
    const withMedium = applyIcnBrowseCategoryFilter(ko.items, {
      categoryLarge: "식・음료",
      categoryMedium: "스낵/카페/디저트",
    });
    const parentOnly = applyIcnBrowseCategoryFilter(ko.items, {
      categoryLarge: "공항즐기기",
      categoryMedium: "all",
    });
    assert.ok(withMedium.length > 0);
    assert.ok(parentOnly.length > 0);
    assert.notDeepEqual(withMedium[0].categoryLargeKey, parentOnly[0].categoryLargeKey);
    assert.deepEqual(defaultIcnBrowseCategoryFilter(), {
      categoryLarge: "all",
      categoryMedium: "all",
    });
  });

  it("flags KO fallback for EN labels and keeps 교통시설 → 주차장 membership", () => {
    const ko = buildIcnBrowseCatalog(loadIcnFacilitiesKoFixture(), "ko");
    const en = buildIcnBrowseCatalog(loadIcnFacilitiesEnFixture(), "en");
    const taxonomy = buildIcnBrowseCategoryTaxonomy(ko.items, en.items);
    const transport = taxonomy.topLevel.find((row) => row.key === "교통시설");
    assert.ok(transport);
    assert.equal(transport.labelEn, "교통시설");
    assert.equal(transport.labelEnFromKoreanFallback, true);
    const parking = transport.subcategories.find((row) => row.key === "주차장");
    assert.ok(parking);
    assert.equal(parking.labelEnFromKoreanFallback, true);

    const enDisplay = resolveLargeCategoryDisplay(taxonomy, "교통시설", "en");
    assert.ok(enDisplay?.labelFromKoreanFallback);
    const parkingDisplay = resolveMediumCategoryDisplay(
      taxonomy,
      "교통시설",
      "주차장",
      "en",
    );
    assert.ok(parkingDisplay?.labelFromKoreanFallback);

    const enAligned = inheritKoreanCategoryKeysForFilter(ko.items, en.items);
    const parkingFacilities = applyIcnBrowseCategoryFilter(enAligned, {
      categoryLarge: "교통시설",
      categoryMedium: "주차장",
    });
    assert.equal(parkingFacilities.length, 5);
  });
});
