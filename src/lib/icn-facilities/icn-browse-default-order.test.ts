import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  ICN_BROWSE_CATEGORY_ALL,
  ICN_BROWSE_TOP_LEVEL_CATEGORY_KEYS,
} from "./icn-browse-category-taxonomy";
import {
  ICN_BROWSE_DEFAULT_CATEGORY_ROUND_SIZE,
  orderIcnBrowseItemsByTopLevelCategoryRounds,
  shouldApplyIcnDefaultCategoryRoundOrder,
} from "./icn-browse-default-order";
import type { IcnBrowseListItem } from "./icn-browse-view-model";
import { buildIcnBrowseCatalog, filterIcnBrowseItems } from "./icn-browse-view-model";
import { loadIcnFacilitiesKoFixture, loadIcnFacilitiesEnFixture } from "./load-icn-facilities-fixture";
import { inheritKoreanCategoryKeysForFilter } from "./icn-browse-category-taxonomy";

function item(
  overrides: Partial<IcnBrowseListItem> & Pick<IcnBrowseListItem, "id" | "sourceId" | "name">,
): IcnBrowseListItem {
  return {
    terminalId: "P01",
    terminalLabel: "제1여객터미널",
    floor: "F3",
    locationDescription: "위치",
    categoryLabel: overrides.categoryLargeKey ?? "기타",
    categoryLargeKey: "식・음료",
    categoryMediumKey: null,
    hoursText: null,
    ...overrides,
  };
}

describe("orderIcnBrowseItemsByTopLevelCategoryRounds", () => {
  it("takes up to two facilities from each top-level category per round", () => {
    const food = ICN_BROWSE_TOP_LEVEL_CATEGORY_KEYS[0];
    const fun = ICN_BROWSE_TOP_LEVEL_CATEGORY_KEYS[1];
    const info = ICN_BROWSE_TOP_LEVEL_CATEGORY_KEYS[2];
    const input = [
      item({ id: "f1", sourceId: "1", name: "Food1", categoryLargeKey: food }),
      item({ id: "f2", sourceId: "2", name: "Food2", categoryLargeKey: food }),
      item({ id: "f3", sourceId: "3", name: "Food3", categoryLargeKey: food }),
      item({ id: "a1", sourceId: "4", name: "AED1", categoryLargeKey: info }),
      item({ id: "a2", sourceId: "5", name: "AED2", categoryLargeKey: info }),
      item({ id: "a3", sourceId: "6", name: "AED3", categoryLargeKey: info }),
      item({ id: "u1", sourceId: "7", name: "Fun1", categoryLargeKey: fun }),
    ];

    const ordered = orderIcnBrowseItemsByTopLevelCategoryRounds(input);
    assert.equal(ICN_BROWSE_DEFAULT_CATEGORY_ROUND_SIZE, 2);
    assert.deepEqual(
      ordered.map((row) => row.id),
      ["f1", "f2", "u1", "a1", "a2", "f3", "a3"],
    );
  });

  it("preserves relative order within each category and keeps leftover fallback keys", () => {
    const food = ICN_BROWSE_TOP_LEVEL_CATEGORY_KEYS[0];
    const input = [
      item({ id: "x1", sourceId: "10", name: "Unknown1", categoryLargeKey: null }),
      item({ id: "f1", sourceId: "11", name: "Food1", categoryLargeKey: food }),
      item({ id: "x2", sourceId: "12", name: "Unknown2", categoryLargeKey: "미분류" }),
      item({ id: "f2", sourceId: "13", name: "Food2", categoryLargeKey: food }),
      item({ id: "f3", sourceId: "14", name: "Food3", categoryLargeKey: food }),
    ];

    const ordered = orderIcnBrowseItemsByTopLevelCategoryRounds(input);
    assert.deepEqual(
      ordered.map((row) => row.id),
      ["f1", "f2", "x1", "x2", "f3"],
    );
  });

  it("includes every facility once for the KO fixture with odd-sized categories", () => {
    const catalog = buildIcnBrowseCatalog(loadIcnFacilitiesKoFixture(), "ko");
    const ordered = orderIcnBrowseItemsByTopLevelCategoryRounds(catalog.items);
    assert.equal(ordered.length, catalog.items.length);
    assert.equal(new Set(ordered.map((row) => row.id)).size, catalog.items.length);

    const first16 = ordered.slice(0, 16);
    const aedCount = first16.filter((row) => /AED/i.test(row.name)).length;
    assert.ok(aedCount <= 4, `expected at most two AED per early rounds, got ${aedCount}`);
    assert.deepEqual(
      first16.map((row) => row.categoryLargeKey),
      [
        "식・음료",
        "식・음료",
        "공항즐기기",
        "공항즐기기",
        "안내・편의시설",
        "안내・편의시설",
        "일반쇼핑",
        "일반쇼핑",
        "면세점쇼핑",
        "면세점쇼핑",
        "출입국시설",
        "출입국시설",
        "기타시설",
        "기타시설",
        "교통시설",
        "교통시설",
      ],
    );
  });

  it("applies the same round order to the EN catalog after KO category-key inheritance", () => {
    const ko = buildIcnBrowseCatalog(loadIcnFacilitiesKoFixture(), "ko");
    const enRaw = buildIcnBrowseCatalog(loadIcnFacilitiesEnFixture(), "en");
    const enItems = inheritKoreanCategoryKeysForFilter(ko.items, enRaw.items);
    const ordered = orderIcnBrowseItemsByTopLevelCategoryRounds(enItems);
    assert.equal(ordered.length, enItems.length);
    assert.deepEqual(
      ordered.slice(0, 8).map((row) => row.categoryLargeKey),
      [
        "식・음료",
        "식・음료",
        "공항즐기기",
        "공항즐기기",
        "안내・편의시설",
        "안내・편의시설",
        "일반쇼핑",
        "일반쇼핑",
      ],
    );
  });
});

describe("shouldApplyIcnDefaultCategoryRoundOrder", () => {
  it("is true only for empty search with no terminal/category/subtype filter", () => {
    assert.equal(
      shouldApplyIcnDefaultCategoryRoundOrder({
        query: "",
        terminalFilter: "all",
        categoryFilter: {
          categoryLarge: ICN_BROWSE_CATEGORY_ALL,
          categoryMedium: ICN_BROWSE_CATEGORY_ALL,
        },
      }),
      true,
    );
    assert.equal(
      shouldApplyIcnDefaultCategoryRoundOrder({
        query: "  \t　",
        terminalFilter: "all",
        categoryFilter: {
          categoryLarge: ICN_BROWSE_CATEGORY_ALL,
          categoryMedium: ICN_BROWSE_CATEGORY_ALL,
        },
      }),
      true,
    );
    assert.equal(
      shouldApplyIcnDefaultCategoryRoundOrder({
        query: "AED",
        terminalFilter: "all",
        categoryFilter: {
          categoryLarge: ICN_BROWSE_CATEGORY_ALL,
          categoryMedium: ICN_BROWSE_CATEGORY_ALL,
        },
      }),
      false,
    );
    assert.equal(
      shouldApplyIcnDefaultCategoryRoundOrder({
        query: "",
        terminalFilter: "P01",
        categoryFilter: {
          categoryLarge: ICN_BROWSE_CATEGORY_ALL,
          categoryMedium: ICN_BROWSE_CATEGORY_ALL,
        },
      }),
      false,
    );
    assert.equal(
      shouldApplyIcnDefaultCategoryRoundOrder({
        query: "",
        terminalFilter: "all",
        categoryFilter: {
          categoryLarge: "식・음료",
          categoryMedium: ICN_BROWSE_CATEGORY_ALL,
        },
      }),
      false,
    );
    assert.equal(
      shouldApplyIcnDefaultCategoryRoundOrder({
        query: "",
        terminalFilter: "all",
        categoryFilter: {
          categoryLarge: "식・음료",
          categoryMedium: "스낵/카페/디저트",
        },
      }),
      false,
    );
  });

  it("leaves search and filtered order unchanged in filterIcnBrowseItems", () => {
    const catalog = buildIcnBrowseCatalog(loadIcnFacilitiesKoFixture(), "ko");
    const aedHits = filterIcnBrowseItems(catalog.items, "AED", "all", "ko");
    assert.ok(aedHits.length > 0);
    // Contiguous catalog order for AED search: same sequence as scanning the catalog.
    const expectedAedIds = catalog.items
      .filter((row) => aedHits.some((hit) => hit.id === row.id))
      .map((row) => row.id);
    assert.deepEqual(
      aedHits.map((row) => row.id),
      expectedAedIds,
    );

    const foodOnly = filterIcnBrowseItems(catalog.items, "", "all", "ko", {
      categoryLarge: "식・음료",
      categoryMedium: ICN_BROWSE_CATEGORY_ALL,
    });
    assert.deepEqual(
      foodOnly.map((row) => row.id),
      catalog.items.filter((row) => row.categoryLargeKey === "식・음료").map((row) => row.id),
    );
  });
});
