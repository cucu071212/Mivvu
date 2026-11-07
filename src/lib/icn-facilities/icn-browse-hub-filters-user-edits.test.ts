/**
 * @vitest-environment jsdom
 */
import { it, expect } from "vitest";
import * as h from "@/lib/icn-facilities/icn-browse-hub-filters";
import {
  saveIcnBrowseDetailNavigation,
  scheduleHubRestoreFromDetail,
  clearIcnBrowseSessionContext,
} from "@/lib/icn-facilities/icn-browse-session";

it("attaching an additional subscriber preserves current edits in an active hub", () => {
  const first = h.subscribeIcnBrowseHubFilters(() => {});
  h.setIcnBrowseHubQuery("current user edit");
  const second = h.subscribeIcnBrowseHubFilters(() => {});
  const actual = h.getIcnBrowseHubFiltersSnapshot().query;
  first();
  second();
  expect(actual).toBe("current user edit");
});

it("a committed restore does not overwrite edits made after a peek", () => {
  h.resetIcnBrowseHubFilters();
  clearIcnBrowseSessionContext();
  saveIcnBrowseDetailNavigation({ query: "old restore", terminalFilter: "P03", refPathSegment: "r" });
  scheduleHubRestoreFromDetail();
  h.getIcnBrowseHubFiltersSnapshot();
  h.setIcnBrowseHubQuery("new edit");
  const unsub = h.subscribeIcnBrowseHubFilters(() => {});
  const actual = h.getIcnBrowseHubFiltersSnapshot().query;
  unsub();
  expect(actual).toBe("new edit");
});
