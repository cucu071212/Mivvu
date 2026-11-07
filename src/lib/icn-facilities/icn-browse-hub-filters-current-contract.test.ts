/**
 * @vitest-environment jsdom
 */
import { it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
  vi.resetModules();
  sessionStorage.clear();
});

async function freshModules() {
  const h = await import("@/lib/icn-facilities/icn-browse-hub-filters");
  const s = await import("@/lib/icn-facilities/icn-browse-session");
  return { h, s };
}

it("published snapshots stay identical and touch no storage/listeners until a committed restore", async () => {
  const { h, s } = await freshModules();
  const before = h.getIcnBrowseHubFiltersSnapshot();
  s.saveIcnBrowseDetailNavigation({ query: "ARABICA", terminalFilter: "P03", refPathSegment: "r" });
  s.scheduleHubRestoreFromDetail();
  const get = vi.spyOn(Storage.prototype, "getItem");
  const remove = vi.spyOn(Storage.prototype, "removeItem");
  const add = vi.spyOn(window, "addEventListener");
  const emit = vi.spyOn(window, "dispatchEvent");
  expect(h.getIcnBrowseHubFiltersSnapshot()).toBe(before);
  expect(h.getIcnBrowseHubFiltersSnapshot()).toBe(before);
  expect(h.getIcnBrowseHubFiltersServerSnapshot()).toBe(h.getIcnBrowseHubFiltersServerSnapshot());
  expect(get).not.toHaveBeenCalled();
  expect(remove).not.toHaveBeenCalled();
  expect(add).not.toHaveBeenCalled();
  expect(emit).not.toHaveBeenCalled();
  vi.restoreAllMocks();
  const off = h.subscribeIcnBrowseHubFilters(() => {});
  const committed = h.getIcnBrowseHubFiltersSnapshot();
  expect(committed.query).toBe("ARABICA");
  expect(h.getIcnBrowseHubFiltersSnapshot()).toBe(committed);
  expect(s.readIcnBrowseDetailSession()).toBeNull();
  expect(h.commitScheduledHubRestoreIfIdle()).toBe(false);
  off();
});

it("detail-origin consumer observes false before and after silent hub consumption", async () => {
  const { h, s } = await freshModules();
  s.saveIcnBrowseDetailNavigation({ query: "ARABICA", terminalFilter: "P03", refPathSegment: "r" });
  const token = s.consumeBrowseOriginIntent("r")!;
  const unmount = s.registerActiveDetailVisit(token);
  let observed = s.detailOpenedFromBrowse("r");
  const offDetail = s.subscribeIcnBrowseSession(() => {
    observed = s.detailOpenedFromBrowse("r");
  });
  expect(observed).toBe(true);
  s.scheduleHubRestoreFromDetail();
  expect(observed).toBe(false);
  const offHub = h.subscribeIcnBrowseHubFilters(() => {});
  expect(observed).toBe(s.detailOpenedFromBrowse("r"));
  expect(s.readIcnBrowseDetailSession()).toBeNull();
  offDetail();
  offHub();
  unmount();
  await Promise.resolve();
});

it("document ownership cannot replay after explicit clear or against a different new visit", async () => {
  const { s } = await freshModules();
  s.saveIcnBrowseDetailNavigation({ query: "ARABICA", terminalFilter: "P03", refPathSegment: "r" });
  const token = s.consumeBrowseOriginIntent("r")!;
  const off = s.registerActiveDetailVisit(token);
  expect(s.reattachCommittedBrowseOriginVisit("r")).toBe(token);
  s.clearIcnBrowseSessionContext();
  expect(s.reattachCommittedBrowseOriginVisit("r")).toBeNull();
  expect(s.resumeBrowseOriginAfterBfcache("r")).toBe(false);
  s.saveIcnBrowseDetailNavigation({ query: "new", terminalFilter: "all", refPathSegment: "r" });
  expect(s.reattachCommittedBrowseOriginVisit("r")).toBeNull();
  expect(s.resumeBrowseOriginAfterBfcache("r")).toBe(false);
  off();
  await Promise.resolve();
});
