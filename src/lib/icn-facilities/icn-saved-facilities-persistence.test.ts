import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "vitest";
import {
  createIcnFacilityRef,
  serializeIcnFacilityRef,
} from "./icn-facility-reference";
import {
  addIcnSavedFacilityItem,
  parseIcnSavedFacilitiesPersisted,
  readIcnSavedFacilitiesFromStorage,
  removeIcnSavedFacilityFromStorage,
  saveIcnSavedFacilityToStorage,
  setIcnSavedFacilitiesStorageBackend,
  toggleIcnSavedFacilityInStorage,
  writeIcnSavedFacilitiesToStorage,
} from "./icn-saved-facilities-persistence";
import { loadIcnFacilitiesEnFixture, loadIcnFacilitiesKoFixture } from "./load-icn-facilities-fixture";
import { collapseDuplicateListings } from "./icn-snapshot-matching";
import { MIVVU_ICN_SAVED_FACILITIES_STORAGE_KEY } from "@/lib/mivvu-entry-routes";

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

function catalogs() {
  const ko = loadIcnFacilitiesKoFixture();
  const en = loadIcnFacilitiesEnFixture();
  return {
    K: collapseDuplicateListings(ko.facilities),
    E: collapseDuplicateListings(en.facilities),
  };
}

describe("icn-saved-facilities-persistence", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = memoryStorage();
    setIcnSavedFacilitiesStorageBackend(storage);
  });

  afterEach(() => {
    setIcnSavedFacilitiesStorageBackend(undefined);
  });

  it("orders by most recently saved and preserves order on duplicate bilingual save", () => {
    const data = catalogs();
    const ko = data.K.find((r) => r.sourceId === "3289")!;
    const en = data.E.find((r) => r.sourceId === "3289")!;
    const serKo = serializeIcnFacilityRef(createIcnFacilityRef(ko, data));
    const serEn = serializeIcnFacilityRef(createIcnFacilityRef(en, data));
    assert.equal(saveIcnSavedFacilityToStorage({ serializedRef: serKo, savedAtMs: 100 }).status, "ok");
    assert.equal(saveIcnSavedFacilityToStorage({ serializedRef: serEn, savedAtMs: 200 }).status, "ok");
    const read = readIcnSavedFacilitiesFromStorage(storage);
    assert.equal(read.status, "ok");
    if (read.status !== "ok") return;
    assert.equal(read.items.length, 1);
    assert.equal(read.items[0]?.savedAtMs, 100);
  });

  it("restores items after reload simulation", () => {
    const data = catalogs();
    const row = data.K[0]!;
    const ser = serializeIcnFacilityRef(createIcnFacilityRef(row, data));
    saveIcnSavedFacilityToStorage({ serializedRef: ser, savedAtMs: 50, lastKnown: { displayName: "A", placeLine: null, locale: "ko" } });
    const reloaded = readIcnSavedFacilitiesFromStorage(memoryStorage());
    assert.equal(reloaded.status, "ok");
    if (reloaded.status !== "ok") return;
    assert.equal(reloaded.items.length, 0);
    const again = readIcnSavedFacilitiesFromStorage(storage);
    assert.equal(again.status, "ok");
    if (again.status !== "ok") return;
    assert.equal(again.items[0]?.lastKnown?.displayName, "A");
  });

  it("toggle unsave removes without claiming success on write failure", () => {
    const data = catalogs();
    const ser = serializeIcnFacilityRef(createIcnFacilityRef(data.K[0]!, data));
    saveIcnSavedFacilityToStorage({ serializedRef: ser, savedAtMs: 1 });
    const failing: Storage = {
      ...storage,
      setItem() {
        throw new Error("blocked");
      },
    };
    setIcnSavedFacilitiesStorageBackend(failing);
    const removed = removeIcnSavedFacilityFromStorage(ser);
    assert.equal(removed.status, "write_failed");
    setIcnSavedFacilitiesStorageBackend(storage);
    const still = readIcnSavedFacilitiesFromStorage(storage);
    assert.equal(still.status, "ok");
    if (still.status !== "ok") return;
    assert.equal(still.items.length, 1);
  });

  it("reports corrupt and unsupported persisted payloads without overwriting", () => {
    storage.setItem(MIVVU_ICN_SAVED_FACILITIES_STORAGE_KEY, "{");
    assert.equal(readIcnSavedFacilitiesFromStorage(storage).status, "corrupt");
    storage.setItem(MIVVU_ICN_SAVED_FACILITIES_STORAGE_KEY, JSON.stringify({ version: 2, items: [] }));
    assert.equal(readIcnSavedFacilitiesFromStorage(storage).status, "unsupported_version");
    assert.equal(parseIcnSavedFacilitiesPersisted(JSON.stringify({ version: 2, items: [] })).status, "unsupported_version");
  });

  it("sorts recent-first when merging new saves", () => {
    const data = catalogs();
    const a = serializeIcnFacilityRef(createIcnFacilityRef(data.K[0]!, data));
    const b = serializeIcnFacilityRef(createIcnFacilityRef(data.K[1]!, data));
    const merged = addIcnSavedFacilityItem([], { serializedRef: a, savedAtMs: 10 });
    const merged2 = addIcnSavedFacilityItem(merged, { serializedRef: b, savedAtMs: 20 });
    assert.equal(merged2[0]?.serializedRef, b);
    assert.equal(merged2[1]?.serializedRef, a);
  });

  it("toggle returns saved null when storage cannot be read", () => {
    setIcnSavedFacilitiesStorageBackend(null);
    const result = toggleIcnSavedFacilityInStorage({ serializedRef: "{}", savedAtMs: 1 });
    assert.equal(result.status, "read_failed");
    assert.equal(result.saved, null);
  });

  it("does not write when toggle remove fails", () => {
    const data = catalogs();
    const ser = serializeIcnFacilityRef(createIcnFacilityRef(data.K[0]!, data));
    saveIcnSavedFacilityToStorage({ serializedRef: ser, savedAtMs: 1 });
    const failing = {
      ...storage,
      setItem() {
        throw new Error("blocked");
      },
    } as Storage;
    setIcnSavedFacilitiesStorageBackend(failing);
    const toggled = toggleIcnSavedFacilityInStorage({ serializedRef: ser, savedAtMs: 2 });
    assert.equal(toggled.status, "write_failed");
    assert.equal(toggled.saved, null);
  });

  it("write helper persists valid envelope", () => {
    const data = catalogs();
    const ser = serializeIcnFacilityRef(createIcnFacilityRef(data.K[0]!, data));
    assert.equal(writeIcnSavedFacilitiesToStorage([{ serializedRef: ser, savedAtMs: 3 }], storage).status, "ok");
    const raw = storage.getItem(MIVVU_ICN_SAVED_FACILITIES_STORAGE_KEY);
    assert.ok(raw?.includes("\"version\":1"));
  });
});
