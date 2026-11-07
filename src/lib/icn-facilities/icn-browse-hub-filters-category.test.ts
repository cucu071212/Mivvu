/**
 * @vitest-environment jsdom
 */
import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import {
  getIcnBrowseHubFiltersSnapshot,
  resetIcnBrowseHubFilters,
  setIcnBrowseHubCategoryLarge,
  setIcnBrowseHubCategoryMedium,
  subscribeIcnBrowseHubFilters,
} from "./icn-browse-hub-filters";
import {
  clearIcnBrowseSessionContext,
  saveIcnBrowseDetailNavigation,
  scheduleHubRestoreFromDetail,
} from "./icn-browse-session";

describe("icn-browse-hub-filters category restore", () => {
  afterEach(() => {
    clearIcnBrowseSessionContext();
    resetIcnBrowseHubFilters();
  });

  it("restores category filters from detail return alongside search and terminal", () => {
    saveIcnBrowseDetailNavigation({
      query: "아라비카",
      terminalFilter: "P03",
      categoryLarge: "식・음료",
      categoryMedium: "스낵/카페/디저트",
      refPathSegment: "ref-a",
    });
    scheduleHubRestoreFromDetail();
    const unsub = subscribeIcnBrowseHubFilters(() => {});
    assert.deepEqual(getIcnBrowseHubFiltersSnapshot(), {
      query: "아라비카",
      terminalFilter: "P03",
      categoryLarge: "식・음료",
      categoryMedium: "스낵/카페/디저트",
    });
    unsub();
  });

  it("clears subcategory when top-level category changes", () => {
    setIcnBrowseHubCategoryLarge("식・음료");
    setIcnBrowseHubCategoryMedium("스낵/카페/디저트");
    setIcnBrowseHubCategoryLarge("공항즐기기");
    assert.equal(getIcnBrowseHubFiltersSnapshot().categoryLarge, "공항즐기기");
    assert.equal(getIcnBrowseHubFiltersSnapshot().categoryMedium, "all");
  });
});
