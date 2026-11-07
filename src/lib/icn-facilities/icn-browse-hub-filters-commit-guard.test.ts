/**
 * @vitest-environment jsdom
 */
import { it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
  vi.resetModules();
  sessionStorage.clear();
});

it("commit guard prevents recursive commit and preserves an edit made in the publish callback", async () => {
  const h = await import("@/lib/icn-facilities/icn-browse-hub-filters");
  const s = await import("@/lib/icn-facilities/icn-browse-session");
  let armed = false;
  const observed: string[] = [];
  const off = h.subscribeIcnBrowseHubFilters(() => {
    const q = h.getIcnBrowseHubFiltersSnapshot().query;
    if (!armed) return;
    observed.push(q);
    if (q === "ARABICA") {
      expect(h.commitScheduledHubRestoreIfIdle()).toBe(false);
      h.setIcnBrowseHubQuery("new edit");
    }
  });
  s.saveIcnBrowseDetailNavigation({ query: "ARABICA", terminalFilter: "P03", refPathSegment: "r" });
  armed = true;
  observed.length = 0;
  s.scheduleHubRestoreFromDetail();
  expect(observed[0]).toBe("ARABICA");
  expect(observed).toContain("new edit");
  expect(h.getIcnBrowseHubFiltersSnapshot().query).toBe("new edit");
  expect(s.readIcnBrowseDetailSession()).toBeNull();
  off();
});
