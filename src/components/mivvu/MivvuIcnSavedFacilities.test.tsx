/** @vitest-environment jsdom */
import assert from "node:assert/strict";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { MivvuPreviewLocaleProvider } from "@/components/mivvu/MivvuPreviewLocaleProvider";
import { MivvuIcnFacilityDetailPageClient } from "@/components/mivvu/MivvuIcnFacilityDetailPageClient";
import { MivvuIcnSavedFacilitiesPageClient } from "@/components/mivvu/MivvuIcnSavedFacilitiesPageClient";
import { buildIcnFacilityReferenceCatalogs } from "@/lib/icn-facilities/icn-browse-detail-refs";
import { buildIcnBrowseCatalog } from "@/lib/icn-facilities/icn-browse-view-model";
import {
  createIcnFacilityRef,
  serializeIcnFacilityRef,
} from "@/lib/icn-facilities/icn-facility-reference";
import {
  setIcnSavedFacilitiesStorageBackend,
  writeIcnSavedFacilitiesToStorage,
} from "@/lib/icn-facilities/icn-saved-facilities-persistence";
import {
  notifyIcnSavedFacilitiesChanged,
  resetIcnSavedFacilitiesClientSnapshotCacheForTests,
} from "@/lib/icn-facilities/icn-saved-facilities-client-store";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "@/lib/icn-facilities/load-icn-facilities-fixture";

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

const snapshotInfo = {
  retrievedDateLabel: "test",
  sourceLabel: "test",
  coverageNote: "test",
  listingCount: 1,
};

describe("MivvuIcnSavedFacilitiesPageClient", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = memoryStorage();
    setIcnSavedFacilitiesStorageBackend(storage);
    resetIcnSavedFacilitiesClientSnapshotCacheForTests();
    localStorage.setItem("mivvu.preview.locale.v1", "en");
  });

  afterEach(() => {
    cleanup();
    setIcnSavedFacilitiesStorageBackend(undefined);
    resetIcnSavedFacilitiesClientSnapshotCacheForTests();
  });

  it("renders empty state without hydration crash", async () => {
    const koFixture = loadIcnFacilitiesKoFixture();
    const enFixture = loadIcnFacilitiesEnFixture();
    const catalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
    render(
      <MivvuPreviewLocaleProvider>
        <MivvuIcnSavedFacilitiesPageClient
          referenceCatalogs={catalogs}
          catalogKo={buildIcnBrowseCatalog(koFixture, "ko")}
          catalogEn={buildIcnBrowseCatalog(enFixture, "en")}
        />
      </MivvuPreviewLocaleProvider>,
    );
    await waitFor(() => {
      assert.ok(screen.getByText("Nothing saved yet. Save a facility from its detail page."));
    });
  });

  it("lists a saved facility after storage notify", async () => {
    const koFixture = loadIcnFacilitiesKoFixture();
    const enFixture = loadIcnFacilitiesEnFixture();
    const catalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
    const row = catalogs.K.find((r) => r.sourceId === "3289")!;
    const ser = serializeIcnFacilityRef(createIcnFacilityRef(row, catalogs));
    writeIcnSavedFacilitiesToStorage([{ serializedRef: ser, savedAtMs: 1 }], storage);
    notifyIcnSavedFacilitiesChanged();
    render(
      <MivvuPreviewLocaleProvider>
        <MivvuIcnSavedFacilitiesPageClient
          referenceCatalogs={catalogs}
          catalogKo={buildIcnBrowseCatalog(koFixture, "ko")}
          catalogEn={buildIcnBrowseCatalog(enFixture, "en")}
        />
      </MivvuPreviewLocaleProvider>,
    );
    await waitFor(() => {
      assert.ok(screen.getByRole("heading", { name: "% ARABICA" }));
    });
  });

  it("labels stale-row detail navigation as View detail, not Back to list", async () => {
    const koFixture = loadIcnFacilitiesKoFixture();
    const enFixture = loadIcnFacilitiesEnFixture();
    const fullCatalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
    const row = fullCatalogs.K[0]!;
    const ser = serializeIcnFacilityRef(createIcnFacilityRef(row, fullCatalogs));
    writeIcnSavedFacilitiesToStorage(
      [
        {
          serializedRef: ser,
          savedAtMs: 1,
          lastKnown: { displayName: "Stale Name", placeLine: "T1 · 3F", locale: "ko" },
        },
      ],
      storage,
    );
    notifyIcnSavedFacilitiesChanged();
    render(
      <MivvuPreviewLocaleProvider>
        <MivvuIcnSavedFacilitiesPageClient
          referenceCatalogs={{ K: [], E: [] }}
          catalogKo={buildIcnBrowseCatalog(koFixture, "ko")}
          catalogEn={buildIcnBrowseCatalog(enFixture, "en")}
        />
      </MivvuPreviewLocaleProvider>,
    );
    await waitFor(() => {
      assert.ok(screen.getByRole("button", { name: "View detail" }));
    });
    assert.equal(screen.queryByRole("button", { name: "Back to list" }), null);
  });

  it("re-localizes removal notice when locale toggles", async () => {
    const koFixture = loadIcnFacilitiesKoFixture();
    const enFixture = loadIcnFacilitiesEnFixture();
    const fullCatalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
    const row = fullCatalogs.K[0]!;
    const ser = serializeIcnFacilityRef(createIcnFacilityRef(row, fullCatalogs));
    writeIcnSavedFacilitiesToStorage(
      [
        {
          serializedRef: ser,
          savedAtMs: 1,
          lastKnown: { displayName: "Stale Name", placeLine: "T1", locale: "ko" },
        },
      ],
      storage,
    );
    notifyIcnSavedFacilitiesChanged();
    render(
      <MivvuPreviewLocaleProvider>
        <MivvuIcnSavedFacilitiesPageClient
          referenceCatalogs={{ K: [], E: [] }}
          catalogKo={buildIcnBrowseCatalog(koFixture, "ko")}
          catalogEn={buildIcnBrowseCatalog(enFixture, "en")}
        />
      </MivvuPreviewLocaleProvider>,
    );
    await waitFor(() => screen.getByRole("button", { name: "Remove from saved" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove from saved" }));
    await waitFor(() => screen.getByText("Removed from saved list."));
    fireEvent.click(screen.getByRole("button", { name: "한국어" }));
    await waitFor(() => screen.getByText("저장 목록에서 제거했습니다."));
    assert.equal(screen.queryByText("Removed from saved list."), null);
  });
});

describe("MivvuIcnFacilityDetailPageClient save control", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = memoryStorage();
    setIcnSavedFacilitiesStorageBackend(storage);
    resetIcnSavedFacilitiesClientSnapshotCacheForTests();
    localStorage.setItem("mivvu.preview.locale.v1", "en");
  });

  afterEach(() => {
    cleanup();
    setIcnSavedFacilitiesStorageBackend(undefined);
    resetIcnSavedFacilitiesClientSnapshotCacheForTests();
  });

  function renderDetail(serializedRef: string) {
    const koFixture = loadIcnFacilitiesKoFixture();
    const record = koFixture.facilities[0]!;
    render(
      <MivvuPreviewLocaleProvider>
        <MivvuIcnFacilityDetailPageClient
          refPathSegment="encoded-ref"
          serializedRef={serializedRef}
          snapshotKo={snapshotInfo}
          snapshotEn={snapshotInfo}
          detailKo={{
            kind: "found",
            displayName: "Test Cafe",
            nameFromKoreanFallback: false,
            placeLine: "T2 · 3F",
            displayLocation: null,
            locationFromKoreanFallback: false,
            categoryLabel: null,
            hoursText: null,
            hoursAmbiguousEqual: false,
            arrivalOrDeparture: "D",
            dutyFreeFlag: "N",
            record,
          }}
          detailEn={{
            kind: "found",
            displayName: "Test Cafe",
            nameFromKoreanFallback: false,
            placeLine: "T2 · Level 3",
            displayLocation: null,
            locationFromKoreanFallback: false,
            categoryLabel: null,
            hoursText: null,
            hoursAmbiguousEqual: false,
            arrivalOrDeparture: "D",
            dutyFreeFlag: "N",
            record,
          }}
          goodsServicesKo={{ sectionVisible: false }}
          goodsServicesEn={{ sectionVisible: false }}
        />
      </MivvuPreviewLocaleProvider>,
    );
  }

  it("toggles aria-pressed, unsaves, and re-localizes success notice on locale change", async () => {
    const koFixture = loadIcnFacilitiesKoFixture();
    const enFixture = loadIcnFacilitiesEnFixture();
    const catalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
    const ser = serializeIcnFacilityRef(createIcnFacilityRef(catalogs.K[0]!, catalogs));
    renderDetail(ser);
    await waitFor(() => screen.getByRole("button", { name: "Save" }));
    const saveBtn = screen.getByRole("button", { name: "Save" });
    assert.equal(saveBtn.getAttribute("aria-pressed"), "false");
    fireEvent.click(saveBtn);
    await waitFor(() => {
      assert.equal(screen.getByRole("button", { name: "Saved" }).getAttribute("aria-pressed"), "true");
    });
    assert.ok(screen.getByText("Saved to this device."));
    fireEvent.click(screen.getByRole("button", { name: "Saved" }));
    await waitFor(() => {
      assert.equal(screen.getByRole("button", { name: "Save" }).getAttribute("aria-pressed"), "false");
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => screen.getByText("Saved to this device."));
    fireEvent.click(screen.getByRole("button", { name: "한국어" }));
    await waitFor(() => screen.getByText("저장했습니다."));
    assert.equal(screen.queryByText("Saved to this device."), null);
  });

  it("keeps save unsaved and shows alert when localStorage write fails", async () => {
    const koFixture = loadIcnFacilitiesKoFixture();
    const enFixture = loadIcnFacilitiesEnFixture();
    const catalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
    const ser = serializeIcnFacilityRef(createIcnFacilityRef(catalogs.K[0]!, catalogs));
    const failing = {
      ...storage,
      setItem() {
        throw new Error("blocked");
      },
    } as Storage;
    setIcnSavedFacilitiesStorageBackend(failing);
    renderDetail(ser);
    await waitFor(() => screen.getByRole("button", { name: "Save" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => screen.getByRole("alert"));
    assert.equal(screen.getByRole("button", { name: "Save" }).getAttribute("aria-pressed"), "false");
    assert.ok(screen.getByText("Could not save. Check browser storage settings."));
  });
});
