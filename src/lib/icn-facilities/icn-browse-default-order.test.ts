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
  // 빈 검색 + 카테고리/서브타입 비활성일 때 true(터미널 단독 선택 포함)인지 확인한다.
  it("is true for empty search with no category/subtype, including terminal-only", () => {
    // 전체 터미널 + 빈 검색이면 라운드를 적용한다.
    assert.equal(
      shouldApplyIcnDefaultCategoryRoundOrder({
        query: "", // 빈 검색어다.
        terminalFilter: "all", // 터미널 미선택이다.
        categoryFilter: {
          categoryLarge: ICN_BROWSE_CATEGORY_ALL, // 대분류 미선택이다.
          categoryMedium: ICN_BROWSE_CATEGORY_ALL, // 서브타입 미선택이다.
        },
      }),
      true, // 기본 목록에 라운드를 켠다.
    );
    // 공백만 있는 검색어도 빈 쿼리로 취급해 라운드를 켠다.
    assert.equal(
      shouldApplyIcnDefaultCategoryRoundOrder({
        query: "  \t　", // 일반·전각 공백만 있는 입력이다.
        terminalFilter: "all", // 터미널 미선택이다.
        categoryFilter: {
          categoryLarge: ICN_BROWSE_CATEGORY_ALL, // 대분류 미선택이다.
          categoryMedium: ICN_BROWSE_CATEGORY_ALL, // 서브타입 미선택이다.
        },
      }),
      true, // 정규화 후 빈 검색이므로 라운드를 켠다.
    );
    // T1만 선택해도 검색·카테고리가 없으면 라운드를 켠다.
    assert.equal(
      shouldApplyIcnDefaultCategoryRoundOrder({
        query: "", // 빈 검색어다.
        terminalFilter: "P01", // T1(제1여객터미널)만 선택한 상태다.
        categoryFilter: {
          categoryLarge: ICN_BROWSE_CATEGORY_ALL, // 대분류 미선택이다.
          categoryMedium: ICN_BROWSE_CATEGORY_ALL, // 서브타입 미선택이다.
        },
      }),
      true, // 터미널 단독은 라운드를 막지 않는다.
    );
    // T2만 선택해도 동일하게 라운드를 켠다.
    assert.equal(
      shouldApplyIcnDefaultCategoryRoundOrder({
        query: "", // 빈 검색어다.
        terminalFilter: "P03", // T2(제2여객터미널)만 선택한 상태다.
        categoryFilter: {
          categoryLarge: ICN_BROWSE_CATEGORY_ALL, // 대분류 미선택이다.
          categoryMedium: ICN_BROWSE_CATEGORY_ALL, // 서브타입 미선택이다.
        },
      }),
      true, // 터미널 단독은 라운드를 막지 않는다.
    );
    // 검색어가 있으면 터미널과 무관하게 라운드를 끈다.
    assert.equal(
      shouldApplyIcnDefaultCategoryRoundOrder({
        query: "AED", // 실질 검색어가 있다.
        terminalFilter: "all", // 터미널 미선택이다.
        categoryFilter: {
          categoryLarge: ICN_BROWSE_CATEGORY_ALL, // 대분류 미선택이다.
          categoryMedium: ICN_BROWSE_CATEGORY_ALL, // 서브타입 미선택이다.
        },
      }),
      false, // 검색 활성 시 기존 순서를 유지한다.
    );
    // AED + T1 조합도 검색이 활성이므로 라운드를 끈다.
    assert.equal(
      shouldApplyIcnDefaultCategoryRoundOrder({
        query: "AED", // 검색어가 활성이다.
        terminalFilter: "P01", // T1도 함께 선택된 조합이다.
        categoryFilter: {
          categoryLarge: ICN_BROWSE_CATEGORY_ALL, // 대분류 미선택이다.
          categoryMedium: ICN_BROWSE_CATEGORY_ALL, // 서브타입 미선택이다.
        },
      }),
      false, // 검색+터미널 조합은 필터 순서를 보존한다.
    );
    // 대분류만 켜져 있으면 라운드를 끈다.
    assert.equal(
      shouldApplyIcnDefaultCategoryRoundOrder({
        query: "", // 빈 검색어다.
        terminalFilter: "all", // 터미널 미선택이다.
        categoryFilter: {
          categoryLarge: "식・음료", // 대분류 필터가 활성이다.
          categoryMedium: ICN_BROWSE_CATEGORY_ALL, // 서브타입은 미선택이다.
        },
      }),
      false, // 카테고리 활성 시 기존 순서를 유지한다.
    );
    // 대분류 + T1 조합도 카테고리가 활성이므로 라운드를 끈다.
    assert.equal(
      shouldApplyIcnDefaultCategoryRoundOrder({
        query: "", // 빈 검색어다.
        terminalFilter: "P01", // T1이 함께 선택된 조합이다.
        categoryFilter: {
          categoryLarge: "식・음료", // 대분류 필터가 활성이다.
          categoryMedium: ICN_BROWSE_CATEGORY_ALL, // 서브타입은 미선택이다.
        },
      }),
      false, // 카테고리+터미널 조합은 필터 순서를 보존한다.
    );
    // 서브타입까지 켜져 있으면 라운드를 끈다.
    assert.equal(
      shouldApplyIcnDefaultCategoryRoundOrder({
        query: "", // 빈 검색어다.
        terminalFilter: "all", // 터미널 미선택이다.
        categoryFilter: {
          categoryLarge: "식・음료", // 대분류가 활성이다.
          categoryMedium: "스낵/카페/디저트", // 서브타입도 활성이다.
        },
      }),
      false, // 서브타입 활성 시 기존 순서를 유지한다.
    );
  });

  // filterIcnBrowseItems 자체는 재정렬하지 않으며, 검색/카테고리 결과는 카탈로그 상대 순서를 유지한다.
  it("leaves search and filtered order unchanged in filterIcnBrowseItems", () => {
    // KO 픽스처로 브라우즈 카탈로그를 만든다.
    const catalog = buildIcnBrowseCatalog(loadIcnFacilitiesKoFixture(), "ko");
    // AED 검색 결과를 구한다(터미널 전체).
    const aedHits = filterIcnBrowseItems(catalog.items, "AED", "all", "ko");
    // 최소 한 건 이상 매칭되어야 한다.
    assert.ok(aedHits.length > 0);
    // Contiguous catalog order for AED search: same sequence as scanning the catalog.
    const expectedAedIds = catalog.items
      .filter((row) => aedHits.some((hit) => hit.id === row.id))
      .map((row) => row.id);
    // 필터 결과 ID 순서가 카탈로그 스캔 순서와 같아야 한다.
    assert.deepEqual(
      aedHits.map((row) => row.id),
      expectedAedIds,
    );

    // AED + T1도 필터 상대 순서(카탈로그 스캔)를 유지해야 한다.
    const aedT1 = filterIcnBrowseItems(catalog.items, "AED", "P01", "ko");
    // T1 AED 결과가 존재해야 한다.
    assert.ok(aedT1.length > 0);
    // 모든 결과가 T1이어야 한다.
    assert.ok(aedT1.every((row) => row.terminalId === "P01"));
    // 라운드 게이트는 꺼져 있어야 한다(화면이 재정렬하지 않음).
    assert.equal(
      shouldApplyIcnDefaultCategoryRoundOrder({
        query: "AED",
        terminalFilter: "P01",
        categoryFilter: {
          categoryLarge: ICN_BROWSE_CATEGORY_ALL,
          categoryMedium: ICN_BROWSE_CATEGORY_ALL,
        },
      }),
      false,
    );
    // 기대 ID는 카탈로그에서 T1 AED만 스캔한 순서다.
    const expectedAedT1Ids = catalog.items
      .filter((row) => row.terminalId === "P01" && aedT1.some((hit) => hit.id === row.id))
      .map((row) => row.id);
    // 필터 결과가 그 베이스라인과 같아야 한다.
    assert.deepEqual(
      aedT1.map((row) => row.id),
      expectedAedT1Ids,
    );

    // 대분류만 켠 음식 필터도 카탈로그 상대 순서를 유지한다.
    const foodOnly = filterIcnBrowseItems(catalog.items, "", "all", "ko", {
      categoryLarge: "식・음료",
      categoryMedium: ICN_BROWSE_CATEGORY_ALL,
    });
    // 음식 대분류 스캔 순서와 같아야 한다.
    assert.deepEqual(
      foodOnly.map((row) => row.id),
      catalog.items.filter((row) => row.categoryLargeKey === "식・음료").map((row) => row.id),
    );
  });

  // 터미널만 고른 브라우즈는 필터 집합을 유지한 채 대분류 라운드로 섞인다.
  it("applies category rounds after T1-only and T2-only terminal filtering", () => {
    // KO 픽스처 카탈로그를 로드한다.
    const catalog = buildIcnBrowseCatalog(loadIcnFacilitiesKoFixture(), "ko");
    // 터미널을 끈 기본 라운드 순서를 베이스라인으로 둔다.
    const defaultOrdered = orderIcnBrowseItemsByTopLevelCategoryRounds(catalog.items);
    // T1(P01)·T2(P03) 각각에 대해 동일 검증을 반복한다.
    for (const terminal of ["P01", "P03"] as const) {
      // 검색·카테고리 없이 해당 터미널만 필터한다.
      const filtered = filterIcnBrowseItems(catalog.items, "", terminal, "ko");
      // 필터 결과가 비어 있으면 안 된다.
      assert.ok(filtered.length > 0, `expected facilities for ${terminal}`);
      // 모든 시설이 선택한 터미널에 속해야 한다.
      assert.ok(
        filtered.every((row) => row.terminalId === terminal),
        `all rows must belong to ${terminal}`,
      );
      // 터미널 단독이면 라운드 게이트가 켜져야 한다.
      assert.equal(
        shouldApplyIcnDefaultCategoryRoundOrder({
          query: "",
          terminalFilter: terminal,
          categoryFilter: {
            categoryLarge: ICN_BROWSE_CATEGORY_ALL,
            categoryMedium: ICN_BROWSE_CATEGORY_ALL,
          },
        }),
        true,
      );
      // 필터 결과 위에 라운드 정렬을 적용한다.
      const ordered = orderIcnBrowseItemsByTopLevelCategoryRounds(filtered);
      // 결과 개수는 필터 베이스라인과 같아야 한다(누락·중복 없음).
      assert.equal(ordered.length, filtered.length);
      // ID 집합이 필터 베이스라인과 같아야 한다.
      assert.deepEqual(
        [...ordered.map((row) => row.id)].sort(),
        [...filtered.map((row) => row.id)].sort(),
      );
      // 재정렬 후에도 터미널 소속은 유지되어야 한다.
      assert.ok(ordered.every((row) => row.terminalId === terminal));
      // 필터에 대분류가 2개 이상이면 초반 결과가 섞여야 한다.
      const catsInTerminal = new Set(
        filtered.map((row) => row.categoryLargeKey).filter((key): key is string => Boolean(key)),
      );
      if (catsInTerminal.size >= 2) {
        // 앞쪽 최대 8개에서 서로 다른 대분류가 2개 이상 나와야 한다.
        const earlyCats = new Set(
          ordered
            .slice(0, Math.min(8, ordered.length))
            .map((row) => row.categoryLargeKey)
            .filter((key): key is string => Boolean(key)),
        );
        assert.ok(
          earlyCats.size >= 2,
          `expected early category mix for terminal-only ${terminal}, got ${[...earlyCats].join(",")}`,
        );
      }
    }

    // 터미널을 다시 all로 두면 전체 기본 라운드 목록과 동일해야 한다.
    const clearedTerminalFiltered = filterIcnBrowseItems(catalog.items, "", "all", "ko");
    // all 필터는 카탈로그 전체와 같아야 한다.
    assert.deepEqual(
      clearedTerminalFiltered.map((row) => row.id),
      catalog.items.map((row) => row.id),
    );
    // all + 라운드는 기존 기본 목록 베이스라인과 같아야 한다.
    assert.deepEqual(
      orderIcnBrowseItemsByTopLevelCategoryRounds(clearedTerminalFiltered).map((row) => row.id),
      defaultOrdered.map((row) => row.id),
    );
  });
});
