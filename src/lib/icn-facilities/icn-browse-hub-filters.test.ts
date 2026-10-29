/**
 * @vitest-environment jsdom
 */
import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import {
  getIcnBrowseHubFiltersSnapshot,
  resetIcnBrowseHubFilters,
  setIcnBrowseHubQuery,
  subscribeIcnBrowseHubFilters,
} from "./icn-browse-hub-filters";
import {
  clearIcnBrowseSessionContext,
  saveIcnBrowseDetailNavigation,
  scheduleHubRestoreFromDetail,
} from "./icn-browse-session";

describe("icn-browse-hub-filters", () => {
  afterEach(() => {
    clearIcnBrowseSessionContext();
    resetIcnBrowseHubFilters();
  });

  it("applies scheduled hub restore once via subscribe commit", () => {
    saveIcnBrowseDetailNavigation({ query: "% 아라비카", terminalFilter: "P03", refPathSegment: "ref-a" });
    scheduleHubRestoreFromDetail();
    const unsub = subscribeIcnBrowseHubFilters(() => {});
    assert.deepEqual(getIcnBrowseHubFiltersSnapshot(), { query: "% 아라비카", terminalFilter: "P03" });
    assert.deepEqual(getIcnBrowseHubFiltersSnapshot(), { query: "% 아라비카", terminalFilter: "P03" });
    unsub();
    setIcnBrowseHubQuery("changed");
    assert.equal(getIcnBrowseHubFiltersSnapshot().query, "changed");
  });

  it("starts empty when no scheduled restore is pending", () => {
    assert.deepEqual(getIcnBrowseHubFiltersSnapshot(), { query: "", terminalFilter: "all" });
  });
});
