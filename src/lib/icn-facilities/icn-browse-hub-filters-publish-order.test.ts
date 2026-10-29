/**
 * @vitest-environment jsdom
 */
import { it, expect } from "vitest";
import * as h from "@/lib/icn-facilities/icn-browse-hub-filters";
import * as s from "@/lib/icn-facilities/icn-browse-session";

it("restore notifications expose the committed restore, not an intermediate pre-restore snapshot", () => {
  const observed: string[] = [];
  const unsubscribe = h.subscribeIcnBrowseHubFilters(() => {
    observed.push(h.getIcnBrowseHubFiltersSnapshot().query);
  });
  s.saveIcnBrowseDetailNavigation({ query: "ARABICA", terminalFilter: "P03", refPathSegment: "r" });
  observed.length = 0;
  s.scheduleHubRestoreFromDetail();
  unsubscribe();
  expect(observed.length).toBeGreaterThan(0);
  expect(observed.every((q) => q === "ARABICA")).toBe(true);
});
