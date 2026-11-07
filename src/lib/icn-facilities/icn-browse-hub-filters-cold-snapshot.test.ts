/**
 * @vitest-environment jsdom
 */
import { it, expect, vi } from "vitest";
import { getIcnBrowseHubFiltersSnapshot } from "@/lib/icn-facilities/icn-browse-hub-filters";
import { MIVVU_ICN_BROWSE_CONTEXT_SESSION_KEY as key } from "@/lib/mivvu-entry-routes";

it("cold first snapshot does not publish events, register bridge or consume storage", () => {
  sessionStorage.setItem(
    key,
    JSON.stringify({
      query: "restored",
      terminalFilter: "P03",
      refPathSegment: "r",
      restoreOnNextHubVisit: true,
      visitToken: "token",
    }),
  );
  const before = sessionStorage.getItem(key);
  const events: string[] = [];
  const onHub = () => events.push("hub");
  const onSession = () => events.push("session");
  window.addEventListener("mivvu:icn-browse-hub-filters", onHub);
  window.addEventListener("mivvu:icn-browse-session", onSession);
  const add = vi.spyOn(window, "addEventListener");
  const first = getIcnBrowseHubFiltersSnapshot();
  const second = getIcnBrowseHubFiltersSnapshot();
  const actual = {
    events,
    registrations: add.mock.calls.map((x) => x[0]),
    sameIdentity: first === second,
    storageUnchanged: sessionStorage.getItem(key) === before,
  };
  window.removeEventListener("mivvu:icn-browse-hub-filters", onHub);
  window.removeEventListener("mivvu:icn-browse-session", onSession);
  add.mockRestore();
  expect(actual).toEqual({
    events: [],
    registrations: [],
    sameIdentity: true,
    storageUnchanged: true,
  });
});
