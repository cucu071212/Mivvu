/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import {
  buildIcnBrowseCategoryTaxonomy,
  ICN_BROWSE_CATEGORY_ALL,
} from "./icn-browse-category-taxonomy";
import {
  buildIcnBrowseUrlSearchString,
  icnBrowseUrlHasExplicitBrowseParams,
  icnBrowseUrlSearchStringsEquivalent,
  parseIcnBrowseUrlState,
  serializeIcnBrowseUrlSearchParams,
} from "./icn-browse-url-state";
import type { IcnBrowseListItem } from "./icn-browse-view-model";

function row(partial: Partial<IcnBrowseListItem> & Pick<IcnBrowseListItem, "id">): IcnBrowseListItem {
  return {
    sourceId: partial.sourceId ?? partial.id,
    name: partial.name ?? "name",
    terminalId: partial.terminalId ?? "P03",
    terminalLabel: partial.terminalLabel ?? "T2",
    floor: partial.floor ?? "F3",
    locationDescription: partial.locationDescription ?? null,
    categoryLargeKey: partial.categoryLargeKey ?? "식・음료",
    categoryMediumKey: partial.categoryMediumKey ?? "카페",
    categoryLabel: partial.categoryLabel ?? null,
    hoursText: partial.hoursText ?? null,
    id: partial.id,
    detailRefTransport: partial.detailRefTransport,
  };
}

const koItems = [
  row({ id: "a", categoryLargeKey: "식・음료", categoryMediumKey: "카페" }),
  row({ id: "b", terminalId: "P01", categoryLargeKey: "공항즐기기", categoryMediumKey: "문화" }),
];
const enItems = [
  row({ id: "a", categoryLargeKey: "Food", categoryMediumKey: "Cafe" }),
  row({ id: "b", terminalId: "P01", categoryLargeKey: "Enjoy", categoryMediumKey: "Culture" }),
];

const taxonomy = buildIcnBrowseCategoryTaxonomy(koItems, enItems);
const context = {
  terminalValues: new Set(["P01", "P03"]),
  taxonomy,
};

describe("parseIcnBrowseUrlState", () => {
  it("returns defaults when search is empty", () => {
    const result = parseIcnBrowseUrlState("", context);
    expect(result.hadExplicitBrowseParams).toBe(false);
    expect(result.filters).toEqual({
      query: "",
      terminalFilter: ICN_BROWSE_CATEGORY_ALL,
      categoryLarge: ICN_BROWSE_CATEGORY_ALL,
      categoryMedium: ICN_BROWSE_CATEGORY_ALL,
    });
  });

  it("round-trips deliberate filters", () => {
    const filters = {
      query: "starbucks",
      terminalFilter: "P03",
      categoryLarge: "식・음료",
      categoryMedium: "카페",
    };
    const search = buildIcnBrowseUrlSearchString(filters);
    const parsed = parseIcnBrowseUrlState(search, context);
    expect(parsed.hadExplicitBrowseParams).toBe(true);
    expect(parsed.filters).toEqual(filters);
  });

  it("falls back terminal and type safely", () => {
    const parsed = parseIcnBrowseUrlState("?terminal=ZZZ&type=not-a-type", context);
    expect(parsed.filters.terminalFilter).toBe(ICN_BROWSE_CATEGORY_ALL);
    expect(parsed.filters.categoryLarge).toBe(ICN_BROWSE_CATEGORY_ALL);
    expect(parsed.filters.categoryMedium).toBe(ICN_BROWSE_CATEGORY_ALL);
  });

  it("keeps valid type when subtype is unknown", () => {
    const parsed = parseIcnBrowseUrlState(
      `?type=${encodeURIComponent("식・음료")}&subtype=unknown-medium`,
      context,
    );
    expect(parsed.filters.categoryLarge).toBe("식・음료");
    expect(parsed.filters.categoryMedium).toBe(ICN_BROWSE_CATEGORY_ALL);
  });

  it("uses first non-empty repeated param deterministically", () => {
    const params = new URLSearchParams();
    params.append("terminal", "P01");
    params.append("terminal", "P03");
    const parsed = parseIcnBrowseUrlState(params, context);
    expect(parsed.filters.terminalFilter).toBe("P01");
  });

  it("decodes malformed encoding without throwing", () => {
    const parsed = parseIcnBrowseUrlState("?q=%E0%A4%A", context);
    expect(typeof parsed.filters.query).toBe("string");
  });

  it("preserves plus and percent sequences through parse/serialize round trips", () => {
    for (const query of ["1+1", "%50", "100%25", "스타벅스"]) {
      const search = buildIcnBrowseUrlSearchString({
        query,
        terminalFilter: ICN_BROWSE_CATEGORY_ALL,
        categoryLarge: ICN_BROWSE_CATEGORY_ALL,
        categoryMedium: ICN_BROWSE_CATEGORY_ALL,
      });
      const parsed = parseIcnBrowseUrlState(search, context);
      expect(parsed.filters.query).toBe(query);
    }
  });

  it("skips whitespace-only q values and uses the next repeated q", () => {
    const parsed = parseIcnBrowseUrlState("?q=%20%20&q=starbucks", context);
    expect(parsed.filters.query).toBe("starbucks");
  });
});

describe("serializeIcnBrowseUrlSearchParams", () => {
  it("omits default values", () => {
    expect(
      serializeIcnBrowseUrlSearchParams({
        query: "",
        terminalFilter: ICN_BROWSE_CATEGORY_ALL,
        categoryLarge: ICN_BROWSE_CATEGORY_ALL,
        categoryMedium: ICN_BROWSE_CATEGORY_ALL,
      }).toString(),
    ).toBe("");
  });

  it("does not emit subtype without type", () => {
    const params = serializeIcnBrowseUrlSearchParams({
      query: "",
      terminalFilter: ICN_BROWSE_CATEGORY_ALL,
      categoryLarge: ICN_BROWSE_CATEGORY_ALL,
      categoryMedium: "카페",
    });
    expect(params.has("subtype")).toBe(false);
  });
});

describe("icnBrowseUrlHasExplicitBrowseParams", () => {
  it("detects browse keys only", () => {
    expect(icnBrowseUrlHasExplicitBrowseParams("?q=coffee")).toBe(true);
    expect(icnBrowseUrlHasExplicitBrowseParams("?locale=en")).toBe(false);
    expect(icnBrowseUrlHasExplicitBrowseParams("")).toBe(false);
  });
});

describe("icnBrowseUrlSearchStringsEquivalent", () => {
  it("treats equivalent encodings as equal", () => {
    expect(icnBrowseUrlSearchStringsEquivalent("?q=a+b", "?q=a%20b")).toBe(true);
  });
});
