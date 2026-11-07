/**
 * @vitest-environment jsdom
 */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MivvuIcnBrowsePageClient } from "@/components/mivvu/MivvuIcnBrowsePageClient";
import {
  getIcnBrowseHubFiltersSnapshot,
  resetIcnBrowseHubFilters,
  resetIcnBrowseHubModuleStateForTests,
  setIcnBrowseHubQuery,
  setIcnBrowseHubTerminalFilter,
} from "@/lib/icn-facilities/icn-browse-hub-filters";
import { resetIcnBrowseUrlHistorySyncGuardForTests } from "@/lib/icn-facilities/icn-browse-url-history-sync-guard";
import {
  notifyIcnBrowseUrlLocationSearchChanged,
  resetIcnBrowseUrlLocationBootstrapForTests,
} from "@/lib/icn-facilities/icn-browse-url-location-bootstrap";
import {
  saveIcnBrowseDetailNavigation,
  scheduleHubRestoreFromDetail,
} from "@/lib/icn-facilities/icn-browse-session";
import type { IcnBrowseCatalog } from "@/lib/icn-facilities/icn-browse-view-model";
import { MivvuPreviewLocaleProvider } from "@/components/mivvu/MivvuPreviewLocaleProvider";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const catalogKo: IcnBrowseCatalog = {
  items: [
    {
      id: "browse-0",
      sourceId: "1",
      name: "스타벅스",
      terminalId: "P01",
      terminalLabel: "제1여객터미널",
      floor: "F3",
      locationDescription: "1층",
      categoryLabel: "식・음료",
      categoryLargeKey: "식・음료",
      categoryMediumKey: null,
      hoursText: null,
    },
    {
      id: "browse-1",
      sourceId: "2",
      name: "라운지",
      terminalId: "P03",
      terminalLabel: "제2여객터미널",
      floor: null,
      locationDescription: null,
      categoryLabel: null,
      categoryLargeKey: "안내・편의시설",
      categoryMediumKey: "라운지",
      hoursText: null,
    },
  ],
  terminals: [
    { value: "P01", label: "제1여객터미널", chipLabel: "T1" },
    { value: "P03", label: "제2여객터미널", chipLabel: "T2" },
  ],
  snapshot: {
    retrievedDateLabel: "test",
    sourceLabel: "test",
    coverageNote: "test",
    listingCount: 2,
  },
};

const catalogEn: IcnBrowseCatalog = {
  ...catalogKo,
  items: catalogKo.items.map((row) => ({ ...row, name: row.id === "browse-0" ? "Starbucks" : "Lounge" })),
  terminals: [
    { value: "P01", label: "Terminal 1", chipLabel: "T1" },
    { value: "P03", label: "Terminal 2", chipLabel: "T2" },
  ],
};

function renderBrowse(initialPath = "/icn") {
  window.history.replaceState({}, "", initialPath);
  return render(
    <MivvuPreviewLocaleProvider>
      <MivvuIcnBrowsePageClient catalogKo={catalogKo} catalogEn={catalogEn} />
    </MivvuPreviewLocaleProvider>,
  );
}

beforeEach(() => {
  cleanup();
  sessionStorage.clear();
  localStorage.setItem("mivvu.preview.locale.v1", "ko");
  resetIcnBrowseHubModuleStateForTests();
  resetIcnBrowseUrlLocationBootstrapForTests();
  resetIcnBrowseUrlHistorySyncGuardForTests();
  window.history.replaceState({}, "", "/icn");
});

describe("useIcnBrowseUrlSync", () => {
  it("replaceState updates q without pushState for search typing", () => {
    const replaceSpy = vi.spyOn(window.history, "replaceState");
    const pushSpy = vi.spyOn(window.history, "pushState");
    renderBrowse();
    replaceSpy.mockClear();
    pushSpy.mockClear();
    act(() => setIcnBrowseHubQuery("a"));
    act(() => setIcnBrowseHubQuery("ab"));
    expect(replaceSpy.mock.calls.length).toBeGreaterThan(0);
    expect(pushSpy).not.toHaveBeenCalled();
    expect(window.location.search).toContain("q=ab");
  });

  it("pushState adds a history entry for deliberate terminal changes", () => {
    const pushSpy = vi.spyOn(window.history, "pushState");
    renderBrowse();
    pushSpy.mockClear();
    act(() => setIcnBrowseHubTerminalFilter("P03"));
    expect(pushSpy).toHaveBeenCalled();
    expect(window.location.search).toContain("terminal=P03");
  });

  it("popstate Back to bare /icn resets controls and list count", async () => {
    renderBrowse();
    act(() => setIcnBrowseHubTerminalFilter("P03"));
    expect(screen.getAllByRole("button", { name: "제2여객터미널" })[0].getAttribute("aria-pressed")).toBe("true");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);

    act(() => {
      window.history.replaceState({}, "", "/icn");
    });
    act(() => {
      notifyIcnBrowseUrlLocationSearchChanged();
    });

    expect(window.location.pathname).toBe("/icn");
    expect(window.location.search).toBe("");
    expect(screen.getAllByRole("button", { name: "전체" })[0].getAttribute("aria-pressed")).toBe("true");
    expect(screen.getAllByRole("button", { name: "제2여객터미널" })[0].getAttribute("aria-pressed")).toBe("false");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("popstate Forward to bare /icn after All chip matches URL and results", async () => {
    window.history.replaceState({}, "", "/icn?terminal=P03");
    renderBrowse("/icn?terminal=P03");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);

    act(() => {
      window.history.pushState({}, "", "/icn");
      setIcnBrowseHubTerminalFilter("all");
    });
    expect(screen.getAllByRole("listitem")).toHaveLength(2);

    act(() => {
      window.history.replaceState({}, "", "/icn?terminal=P03");
    });
    act(() => notifyIcnBrowseUrlLocationSearchChanged());
    expect(window.location.search).toContain("terminal=P03");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);

    act(() => {
      window.history.replaceState({}, "", "/icn");
    });
    act(() => notifyIcnBrowseUrlLocationSearchChanged());

    expect(window.location.search).toBe("");
    expect(screen.getAllByRole("button", { name: "전체" })[0].getAttribute("aria-pressed")).toBe("true");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("hydrates searchbox from direct link query", () => {
    renderBrowse("/icn?q=direct-link");
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("direct-link");
  });

  it("does not push or replace /icn history when leaving for airport selection", async () => {
    window.history.replaceState({}, "", "/icn?terminal=P03");
    const pushSpy = vi.spyOn(window.history, "pushState");
    const replaceSpy = vi.spyOn(window.history, "replaceState");
    renderBrowse("/icn?terminal=P03");
    pushSpy.mockClear();
    replaceSpy.mockClear();
    await screen.findByRole("heading", { name: /인천공항 시설/i });
    fireEvent.click(screen.getByRole("button", { name: "공항 선택" }));
    expect(pushSpy).not.toHaveBeenCalled();
    expect(replaceSpy).not.toHaveBeenCalled();
    expect(window.location.search).toContain("terminal=P03");
  });

  it("reconciles stale search when browser returns to an earlier bare /icn entry", () => {
    window.history.replaceState({ entry: "bare-icn" }, "", "/icn");
    const first = renderBrowse("/icn");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);

    first.unmount();
    resetIcnBrowseHubFilters();
    window.history.pushState({ entry: "airports" }, "", "/");
    window.history.pushState({ entry: "icn-search" }, "", "/icn");
    const second = renderBrowse("/icn");
    act(() => setIcnBrowseHubQuery("스타벅스"));
    expect(window.location.search).toContain("q=");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);

    act(() => {
      window.history.replaceState({ entry: "airports" }, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(window.location.pathname).toBe("/");

    act(() => {
      window.history.replaceState({ entry: "bare-icn" }, "", "/icn");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(window.location.pathname).toBe("/icn");
    expect(window.location.search).toBe("");
    expect(getIcnBrowseHubFiltersSnapshot().query).toBe("");
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    second.unmount();
  });

  it("applies default filters on bare /icn remount via production bootstrap (force=false)", () => {
    setIcnBrowseHubTerminalFilter("P03");
    setIcnBrowseHubQuery("stale");
    window.history.replaceState({}, "", "/icn");
    renderBrowse("/icn");
    expect(getIcnBrowseHubFiltersSnapshot().terminalFilter).toBe("all");
    expect(getIcnBrowseHubFiltersSnapshot().query).toBe("");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("detail return on bare /icn restores filters and normalizes URL", () => {
    saveIcnBrowseDetailNavigation({
      query: "스타벅스",
      terminalFilter: "P03",
      categoryLarge: "식・음료",
      categoryMedium: "all",
      refPathSegment: "r",
    });
    scheduleHubRestoreFromDetail();
    const replaceSpy = vi.spyOn(window.history, "replaceState");
    renderBrowse("/icn");
    expect(getIcnBrowseHubFiltersSnapshot().terminalFilter).toBe("P03");
    expect(getIcnBrowseHubFiltersSnapshot().query).toBe("스타벅스");
    expect(replaceSpy.mock.calls.some((call) => String(call[2]).includes("terminal=P03"))).toBe(true);
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("스타벅스");
  });
});
