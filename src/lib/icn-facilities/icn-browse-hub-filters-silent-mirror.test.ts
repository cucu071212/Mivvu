/**
 * @vitest-environment jsdom
 */
import { it, expect, vi } from "vitest";

it("reading a snapshot cannot change future observable state after pending state is cleared", async () => {
  async function run(read: boolean) {
    vi.resetModules();
    sessionStorage.clear();
    const h = await import("@/lib/icn-facilities/icn-browse-hub-filters");
    const s = await import("@/lib/icn-facilities/icn-browse-session");
    s.saveIcnBrowseDetailNavigation({ query: "ARABICA", terminalFilter: "P03", refPathSegment: "r" });
    s.scheduleHubRestoreFromDetail();
    if (read) h.getIcnBrowseHubFiltersSnapshot();
    s.clearIcnBrowseSessionContext();
    return h.getIcnBrowseHubFiltersSnapshot();
  }
  const withoutRead = await run(false);
  const withRead = await run(true);
  expect(withRead).toEqual(withoutRead);
});
