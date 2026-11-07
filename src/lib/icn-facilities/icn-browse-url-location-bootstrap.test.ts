/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  buildIcnBrowseCategoryTaxonomy,
  ICN_BROWSE_CATEGORY_ALL,
} from "./icn-browse-category-taxonomy";
import {
  getIcnBrowseHubFiltersSnapshot,
  resetIcnBrowseHubFilters,
  setIcnBrowseHubTerminalFilter,
  subscribeIcnBrowseHubFilters,
} from "./icn-browse-hub-filters";
import {
  ensureIcnBrowseHubLocationBootstrap,
  notifyIcnBrowseUrlLocationSearchChanged,
  registerIcnBrowseUrlValidationContext,
  resetIcnBrowseUrlLocationBootstrapForTests,
} from "./icn-browse-url-location-bootstrap";
import {
  saveIcnBrowseDetailNavigation,
  scheduleHubRestoreFromDetail,
} from "./icn-browse-session";
import type { IcnBrowseListItem } from "./icn-browse-view-model";

function row(id: string): IcnBrowseListItem {
  return {
    id,
    sourceId: id,
    name: "n",
    terminalId: "P03",
    terminalLabel: "T2",
    floor: "F3",
    locationDescription: null,
    categoryLargeKey: "식・음료",
    categoryMediumKey: "카페",
    categoryLabel: null,
    hoursText: null,
    detailRefTransport: undefined,
  };
}

const taxonomy = buildIcnBrowseCategoryTaxonomy([row("a")], [row("a")]);

beforeEach(() => {
  sessionStorage.clear();
  resetIcnBrowseHubFilters();
  resetIcnBrowseUrlLocationBootstrapForTests();
  registerIcnBrowseUrlValidationContext({
    terminalValues: new Set(["P03"]),
    taxonomy,
  });
  window.history.replaceState({}, "", "/icn");
});

describe("ensureIcnBrowseHubLocationBootstrap", () => {
  it("prefers explicit URL params over pending detail restore", () => {
    saveIcnBrowseDetailNavigation({
      query: "session-query",
      terminalFilter: "P03",
      refPathSegment: "r",
    });
    scheduleHubRestoreFromDetail();
    window.history.replaceState({}, "", "/icn?q=url-query");
    ensureIcnBrowseHubLocationBootstrap(true);
    expect(getIcnBrowseHubFiltersSnapshot().query).toBe("url-query");
  });

  it("leaves detail restore intact when URL has no browse params until hub subscribe", () => {
    saveIcnBrowseDetailNavigation({
      query: "session-query",
      terminalFilter: "P03",
      refPathSegment: "r",
    });
    scheduleHubRestoreFromDetail();
    ensureIcnBrowseHubLocationBootstrap(true);
    expect(getIcnBrowseHubFiltersSnapshot().query).toBe("");
    const unsub = subscribeIcnBrowseHubFilters(() => {});
    expect(getIcnBrowseHubFiltersSnapshot().query).toBe("session-query");
    unsub();
  });

  it("applies default filters on bare /icn when module state is stale", () => {
    setIcnBrowseHubTerminalFilter("P03");
    window.history.replaceState({}, "", "/icn");
    ensureIcnBrowseHubLocationBootstrap();
    expect(getIcnBrowseHubFiltersSnapshot().terminalFilter).toBe(ICN_BROWSE_CATEGORY_ALL);
  });
});

describe("notifyIcnBrowseUrlLocationSearchChanged", () => {
  it("applies defaults when popstate lands on bare /icn", () => {
    setIcnBrowseHubTerminalFilter("P03");
    window.history.replaceState({}, "", "/icn");
    notifyIcnBrowseUrlLocationSearchChanged();
    expect(getIcnBrowseHubFiltersSnapshot().terminalFilter).toBe(ICN_BROWSE_CATEGORY_ALL);
  });
});
