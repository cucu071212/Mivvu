/**
 * @vitest-environment jsdom
 */
import { it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { StrictMode, useSyncExternalStore } from "react";
import { render, cleanup, act, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import * as hub from "@/lib/icn-facilities/icn-browse-hub-filters";
import * as session from "@/lib/icn-facilities/icn-browse-session";
import { MivvuIcnFacilityDetailPageClient } from "@/components/mivvu/MivvuIcnFacilityDetailPageClient";
import { MivvuPreviewLocaleProvider } from "@/components/mivvu/MivvuPreviewLocaleProvider";
import { MIVVU_ICN_BROWSE_CONTEXT_SESSION_KEY as key } from "@/lib/mivvu-entry-routes";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const info = {
  retrievedDateLabel: "test",
  sourceLabel: "test",
  coverageNote: "test",
  listingCount: 1,
};
const props = {
  refPathSegment: "r",
  serializedRef: "invalid",
  snapshotKo: info,
  snapshotEn: info,
  detailKo: { kind: "error", status: "invalid_reference" },
  detailEn: { kind: "error", status: "invalid_reference" },
  goodsServicesKo: { sectionVisible: false },
  goodsServicesEn: { sectionVisible: false },
  labeledDevSyntheticCompanion: false,
} as const;

beforeEach(() => {
  sessionStorage.clear();
  localStorage.setItem("mivvu.preview.locale.v1", "en");
  hub.resetIcnBrowseHubFilters();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function scheduled() {
  session.saveIcnBrowseDetailNavigation({ query: "own search", terminalFilter: "P03", refPathSegment: "r" });
  session.scheduleHubRestoreFromDetail();
}

it("client snapshot identity stable across repeated reads", () => {
  scheduled();
  const unsub = hub.subscribeIcnBrowseHubFilters(() => {});
  const a = hub.getIcnBrowseHubFiltersSnapshot();
  expect(a).toBe(hub.getIcnBrowseHubFiltersSnapshot());
  expect(a.query).toBe("own search");
  unsub();
});

it("snapshot read does not consume storage or notify subscribers", () => {
  scheduled();
  const before = sessionStorage.getItem(key);
  const event = vi.fn();
  window.addEventListener("mivvu:icn-browse-session", event);
  hub.getIcnBrowseHubFiltersSnapshot();
  window.removeEventListener("mivvu:icn-browse-session", event);
  expect({ storage: sessionStorage.getItem(key), notifies: event.mock.calls.length }).toEqual({
    storage: before,
    notifies: 0,
  });
});

it("server snapshot identity remains stable", () => {
  expect(hub.getIcnBrowseHubFiltersServerSnapshot()).toBe(hub.getIcnBrowseHubFiltersServerSnapshot());
});

it("restore scheduled after initial subscription is observed", () => {
  hub.getIcnBrowseHubFiltersSnapshot();
  const unsub = hub.subscribeIcnBrowseHubFilters(() => hub.getIcnBrowseHubFiltersSnapshot());
  scheduled();
  const actual = hub.getIcnBrowseHubFiltersSnapshot().query;
  unsub();
  expect(actual).toBe("own search");
});

it("Strict Mode detail mount preserves legitimate browse origin", () => {
  session.saveIcnBrowseDetailNavigation({ query: "own search", terminalFilter: "P03", refPathSegment: "r" });
  render(
    <StrictMode>
      <MivvuPreviewLocaleProvider>
        <MivvuIcnFacilityDetailPageClient {...props} />
      </MivvuPreviewLocaleProvider>
    </StrictMode>,
  );
  expect(session.detailOpenedFromBrowse("r")).toBe(true);
  expect(screen.queryByText(/You did not arrive/)).toBeNull();
});

it("ordinary detail mount preserves browse origin", () => {
  session.saveIcnBrowseDetailNavigation({ query: "own search", terminalFilter: "P03", refPathSegment: "r" });
  render(
    <MivvuPreviewLocaleProvider>
      <MivvuIcnFacilityDetailPageClient {...props} />
    </MivvuPreviewLocaleProvider>,
  );
  expect(session.detailOpenedFromBrowse("r")).toBe(true);
});

it("remounted hub retains module filters without a return session", () => {
  function Hub() {
    const f = useSyncExternalStore(
      hub.subscribeIcnBrowseHubFilters,
      hub.getIcnBrowseHubFiltersSnapshot,
      hub.getIcnBrowseHubFiltersServerSnapshot,
    );
    return <p>{f.query || "empty"}</p>;
  }
  const a = render(<Hub />);
  act(() => hub.setIcnBrowseHubQuery("old visit"));
  a.unmount();
  session.clearIcnBrowseSessionContext();
  render(<Hub />);
  expect(screen.getByText("empty")).toBeTruthy();
});

it("isolated hydration checks getServerSnapshot identity", async () => {
  function Hub() {
    const f = useSyncExternalStore(
      hub.subscribeIcnBrowseHubFilters,
      hub.getIcnBrowseHubFiltersSnapshot,
      hub.getIcnBrowseHubFiltersServerSnapshot,
    );
    return <p>{f.query || "empty"}</p>;
  }
  const errors: string[] = [];
  vi.spyOn(console, "error").mockImplementation((...x) => errors.push(x.join(" ")));
  const node = document.createElement("div");
  document.body.appendChild(node);
  node.innerHTML = renderToString(<Hub />);
  let root: ReturnType<typeof hydrateRoot> | undefined;
  await act(async () => {
    root = hydrateRoot(node, <Hub />);
  });
  await act(async () => root?.unmount());
  node.remove();
  expect(errors.filter((x) => x.includes("getServerSnapshot"))).toEqual([]);
});

it("subscription notification exposes the restored snapshot after changing store", () => {
  scheduled();
  const observed: string[] = [];
  const unsub = hub.subscribeIcnBrowseHubFilters(() => {
    observed.push(hub.getIcnBrowseHubFiltersSnapshot().query);
  });
  const actual = hub.getIcnBrowseHubFiltersSnapshot().query;
  unsub();
  expect(actual).toBe("own search");
  expect(observed).toEqual(["own search"]);
});

it("server snapshot remains empty instead of exposing module client filters", () => {
  hub.setIcnBrowseHubQuery("client-only");
  expect(hub.getIcnBrowseHubFiltersServerSnapshot()).toEqual({
    query: "",
    terminalFilter: "all",
    categoryLarge: "all",
    categoryMedium: "all",
  });
});

it("stale session without live detail registration is not browse-origin", () => {
  session.saveIcnBrowseDetailNavigation({ query: "stale", terminalFilter: "P03", refPathSegment: "r" });
  expect(session.detailOpenedFromBrowse("r")).toBe(false);
});
