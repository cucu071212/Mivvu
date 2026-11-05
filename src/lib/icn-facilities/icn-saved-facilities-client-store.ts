import {
  readIcnSavedFacilitiesFromStorage,
  type IcnSavedFacilitiesReadResult,
  type IcnSavedFacilityPersistedItem,
} from "./icn-saved-facilities-persistence";

const SAVED_STORE_CHANGE_EVENT = "mivvu:icn-saved-facilities";

export type IcnSavedFacilitiesClientSnapshot = {
  read: IcnSavedFacilitiesReadResult;
  items: readonly IcnSavedFacilityPersistedItem[];
};

const SERVER_SNAPSHOT: IcnSavedFacilitiesClientSnapshot = Object.freeze({
  read: { status: "ok", items: [] },
  items: [],
});

let cachedClientSnapshot: IcnSavedFacilitiesClientSnapshot = SERVER_SNAPSHOT;
let cachedClientFingerprint: string | null = "server";

function fingerprintRead(read: IcnSavedFacilitiesReadResult): string {
  if (read.status === "ok") {
    return `ok:${read.items.map((item) => `${item.savedAtMs}:${item.serializedRef}`).join("|")}`;
  }
  return read.status === "unsupported_version" ? `uv:${read.version}` : read.status;
}

function buildSnapshot(read: IcnSavedFacilitiesReadResult): IcnSavedFacilitiesClientSnapshot {
  if (read.status === "ok") return { read, items: read.items };
  return { read, items: [] };
}

/** Test helper — reset memoized client snapshot between cases. */
export function resetIcnSavedFacilitiesClientSnapshotCacheForTests(): void {
  cachedClientSnapshot = SERVER_SNAPSHOT;
  cachedClientFingerprint = "server";
}

export function getIcnSavedFacilitiesServerSnapshot(): IcnSavedFacilitiesClientSnapshot {
  return SERVER_SNAPSHOT;
}

export function getIcnSavedFacilitiesClientSnapshot(): IcnSavedFacilitiesClientSnapshot {
  const read = readIcnSavedFacilitiesFromStorage();
  const fingerprint = fingerprintRead(read);
  if (fingerprint === cachedClientFingerprint) {
    return cachedClientSnapshot;
  }
  cachedClientFingerprint = fingerprint;
  cachedClientSnapshot = buildSnapshot(read);
  return cachedClientSnapshot;
}

export function notifyIcnSavedFacilitiesChanged(): void {
  if (typeof window === "undefined") return;
  cachedClientFingerprint = null;
  window.dispatchEvent(new Event(SAVED_STORE_CHANGE_EVENT));
}

export function subscribeIcnSavedFacilities(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(SAVED_STORE_CHANGE_EVENT, handler);
  return () => window.removeEventListener(SAVED_STORE_CHANGE_EVENT, handler);
}

export function icnSavedFacilitiesCount(snapshot: IcnSavedFacilitiesClientSnapshot): number {
  if (snapshot.read.status !== "ok") return 0;
  return snapshot.items.length;
}

export function icnSavedFacilitiesStorageHealthy(snapshot: IcnSavedFacilitiesClientSnapshot): boolean {
  return snapshot.read.status === "ok";
}
