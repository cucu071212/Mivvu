import type { MivvuPreviewLocale } from "@/lib/mivvu-preview-locale";
import { MIVVU_ICN_SAVED_FACILITIES_STORAGE_KEY } from "@/lib/mivvu-entry-routes";
import {
  icnSavedFacilitySerializedRefsRepresentSameEntry,
  parseIcnSavedFacilityRefEnvelope,
} from "./icn-saved-facility-identity";

/** Persisted last-known display metadata (labeled in UI — not current resolver output). */
export type IcnSavedFacilityLastKnown = {
  displayName: string;
  placeLine: string | null;
  locale: MivvuPreviewLocale;
};

/** One saved row in the v1 local store. */
export type IcnSavedFacilityPersistedItem = {
  serializedRef: string;
  savedAtMs: number;
  lastKnown?: IcnSavedFacilityLastKnown;
};

/** Versioned on-disk envelope for `localStorage`. */
export type IcnSavedFacilitiesPersistedV1 = {
  version: 1;
  items: IcnSavedFacilityPersistedItem[];
};

export type IcnSavedFacilitiesReadResult =
  | { status: "ok"; items: readonly IcnSavedFacilityPersistedItem[] }
  | { status: "unavailable" }
  | { status: "corrupt" }
  | { status: "unsupported_version"; version: number };

export type IcnSavedFacilitiesWriteResult = { status: "ok" } | { status: "failed" };

export type IcnSavedFacilitiesMutationResult =
  | { status: "ok"; items: readonly IcnSavedFacilityPersistedItem[]; changed: boolean }
  | { status: "read_failed"; read: Exclude<IcnSavedFacilitiesReadResult, { status: "ok" }> }
  | { status: "write_failed"; items: readonly IcnSavedFacilityPersistedItem[] };

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

let storageBackend: StorageLike | null | undefined;

function resolveDefaultStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Test hook — inject memory storage; pass null to simulate unavailable storage. */
export function setIcnSavedFacilitiesStorageBackend(backend: StorageLike | null | undefined): void {
  storageBackend = backend;
}

function activeStorage(): StorageLike | null {
  if (storageBackend !== undefined) return storageBackend;
  return resolveDefaultStorage();
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseLastKnown(value: unknown): IcnSavedFacilityLastKnown | undefined {
  if (!isPlainObject(value)) return undefined;
  const displayName = value.displayName;
  const locale = value.locale;
  if (typeof displayName !== "string" || (locale !== "ko" && locale !== "en")) return undefined;
  const placeLine = value.placeLine;
  if (placeLine !== undefined && typeof placeLine !== "string" && placeLine !== null) return undefined;
  return {
    displayName,
    placeLine: typeof placeLine === "string" ? placeLine : null,
    locale,
  };
}

function parsePersistedItem(value: unknown): IcnSavedFacilityPersistedItem | null {
  if (!isPlainObject(value)) return null;
  const serializedRef = value.serializedRef;
  const savedAtMs = value.savedAtMs;
  if (typeof serializedRef !== "string" || typeof savedAtMs !== "number" || !Number.isFinite(savedAtMs)) {
    return null;
  }
  if (!parseIcnSavedFacilityRefEnvelope(serializedRef)) return null;
  const lastKnown = parseLastKnown(value.lastKnown);
  return lastKnown
    ? { serializedRef, savedAtMs, lastKnown }
    : { serializedRef, savedAtMs };
}

export function parseIcnSavedFacilitiesPersisted(raw: string): IcnSavedFacilitiesReadResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: "corrupt" };
  }
  if (!isPlainObject(parsed)) return { status: "corrupt" };
  const version = parsed.version;
  if (version === 1) {
    if (!Array.isArray(parsed.items)) return { status: "corrupt" };
    const items: IcnSavedFacilityPersistedItem[] = [];
    for (const entry of parsed.items) {
      const item = parsePersistedItem(entry);
      if (!item) return { status: "corrupt" };
      items.push(item);
    }
    return { status: "ok", items };
  }
  if (typeof version === "number" && Number.isInteger(version) && version > 0) {
    return { status: "unsupported_version", version };
  }
  return { status: "corrupt" };
}

export function serializeIcnSavedFacilitiesPersisted(items: readonly IcnSavedFacilityPersistedItem[]): string {
  const payload: IcnSavedFacilitiesPersistedV1 = { version: 1, items: [...items] };
  return JSON.stringify(payload);
}

export function readIcnSavedFacilitiesFromStorage(
  storage: StorageLike | null = activeStorage(),
): IcnSavedFacilitiesReadResult {
  if (!storage) return { status: "unavailable" };
  let raw: string | null;
  try {
    raw = storage.getItem(MIVVU_ICN_SAVED_FACILITIES_STORAGE_KEY);
  } catch {
    return { status: "unavailable" };
  }
  if (raw === null) return { status: "ok", items: [] };
  return parseIcnSavedFacilitiesPersisted(raw);
}

export function writeIcnSavedFacilitiesToStorage(
  items: readonly IcnSavedFacilityPersistedItem[],
  storage: StorageLike | null = activeStorage(),
): IcnSavedFacilitiesWriteResult {
  if (!storage) return { status: "failed" };
  try {
    storage.setItem(MIVVU_ICN_SAVED_FACILITIES_STORAGE_KEY, serializeIcnSavedFacilitiesPersisted(items));
    return { status: "ok" };
  } catch {
    return { status: "failed" };
  }
}

function sortRecentFirst(items: readonly IcnSavedFacilityPersistedItem[]): IcnSavedFacilityPersistedItem[] {
  return [...items].sort((a, b) => b.savedAtMs - a.savedAtMs);
}

export function isIcnSavedFacilityStored(
  items: readonly IcnSavedFacilityPersistedItem[],
  serializedRef: string,
): boolean {
  return items.some((item) => icnSavedFacilitySerializedRefsRepresentSameEntry(item.serializedRef, serializedRef));
}

export function addIcnSavedFacilityItem(
  items: readonly IcnSavedFacilityPersistedItem[],
  next: IcnSavedFacilityPersistedItem,
): readonly IcnSavedFacilityPersistedItem[] {
  const withoutDuplicate = items.filter(
    (item) => !icnSavedFacilitySerializedRefsRepresentSameEntry(item.serializedRef, next.serializedRef),
  );
  return sortRecentFirst([next, ...withoutDuplicate]);
}

export function removeIcnSavedFacilityItem(
  items: readonly IcnSavedFacilityPersistedItem[],
  serializedRef: string,
): readonly IcnSavedFacilityPersistedItem[] {
  return items.filter(
    (item) => !icnSavedFacilitySerializedRefsRepresentSameEntry(item.serializedRef, serializedRef),
  );
}

export function saveIcnSavedFacilityToStorage(input: {
  serializedRef: string;
  savedAtMs: number;
  lastKnown?: IcnSavedFacilityLastKnown;
}): IcnSavedFacilitiesMutationResult {
  const read = readIcnSavedFacilitiesFromStorage();
  if (read.status !== "ok") return { status: "read_failed", read };
  if (isIcnSavedFacilityStored(read.items, input.serializedRef)) {
    return { status: "ok", items: read.items, changed: false };
  }
  const nextItems = addIcnSavedFacilityItem(read.items, {
    serializedRef: input.serializedRef,
    savedAtMs: input.savedAtMs,
    lastKnown: input.lastKnown,
  });
  const write = writeIcnSavedFacilitiesToStorage(nextItems);
  if (write.status !== "ok") return { status: "write_failed", items: read.items };
  return { status: "ok", items: nextItems, changed: true };
}

export function removeIcnSavedFacilityFromStorage(serializedRef: string): IcnSavedFacilitiesMutationResult {
  const read = readIcnSavedFacilitiesFromStorage();
  if (read.status !== "ok") return { status: "read_failed", read };
  const nextItems = removeIcnSavedFacilityItem(read.items, serializedRef);
  if (nextItems.length === read.items.length) {
    return { status: "ok", items: read.items, changed: false };
  }
  const write = writeIcnSavedFacilitiesToStorage(nextItems);
  if (write.status !== "ok") return { status: "write_failed", items: read.items };
  return { status: "ok", items: nextItems, changed: true };
}

export function toggleIcnSavedFacilityInStorage(input: {
  serializedRef: string;
  savedAtMs: number;
  lastKnown?: IcnSavedFacilityLastKnown;
}): IcnSavedFacilitiesMutationResult & { saved: boolean | null } {
  const read = readIcnSavedFacilitiesFromStorage();
  if (read.status !== "ok") return { status: "read_failed", read, saved: null };
  if (isIcnSavedFacilityStored(read.items, input.serializedRef)) {
    const removed = removeIcnSavedFacilityFromStorage(input.serializedRef);
    if (removed.status !== "ok") return { ...removed, saved: null };
    return { ...removed, saved: false };
  }
  const added = saveIcnSavedFacilityToStorage(input);
  if (added.status !== "ok") return { ...added, saved: null };
  return { ...added, saved: true };
}
