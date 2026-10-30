import {
  clearIcnBrowseSessionContextSilently,
  peekHubRestoreFilters,
  readIcnBrowseDetailSession,
  subscribeIcnBrowseSession,
} from "./icn-browse-session";

export type IcnBrowseHubFilters = {
  query: string;
  terminalFilter: string;
  categoryLarge: string;
  categoryMedium: string;
};

const DEFAULT_FILTERS: IcnBrowseHubFilters = {
  query: "",
  terminalFilter: "all",
  categoryLarge: "all",
  categoryMedium: "all",
};

const SERVER_SNAPSHOT: Readonly<IcnBrowseHubFilters> = Object.freeze({
  query: "",
  terminalFilter: "all",
  categoryLarge: "all",
  categoryMedium: "all",
});

const HUB_FILTERS_CHANGE_EVENT = "mivvu:icn-browse-hub-filters";

let filtersSnapshot: IcnBrowseHubFilters = { ...DEFAULT_FILTERS };
let hubFiltersDirtyFromUser = false;
let hubSessionBridgeRegistered = false;
let hubRestoreCommitInProgress = false;

function emitHubFiltersChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(HUB_FILTERS_CHANGE_EVENT));
}

function publishFilters(next: IcnBrowseHubFilters): void {
  if (
    filtersSnapshot.query === next.query
    && filtersSnapshot.terminalFilter === next.terminalFilter
    && filtersSnapshot.categoryLarge === next.categoryLarge
    && filtersSnapshot.categoryMedium === next.categoryMedium
  ) {
    return;
  }
  filtersSnapshot = {
    query: next.query,
    terminalFilter: next.terminalFilter,
    categoryLarge: next.categoryLarge,
    categoryMedium: next.categoryMedium,
  };
  emitHubFiltersChange();
}

/** Committed restore: silent session clear, publish, then no spurious session reset. */
export function commitScheduledHubRestoreIfIdle(): boolean {
  if (hubFiltersDirtyFromUser || hubRestoreCommitInProgress) return false;
  const session = readIcnBrowseDetailSession();
  if (!session?.restoreOnNextHubVisit) return false;
  const restored = {
    query: session.query,
    terminalFilter: session.terminalFilter,
    categoryLarge: session.categoryLarge,
    categoryMedium: session.categoryMedium,
  };
  hubRestoreCommitInProgress = true;
  try {
    clearIcnBrowseSessionContextSilently();
    publishFilters(restored);
    return true;
  } finally {
    hubRestoreCommitInProgress = false;
  }
}

function ensureHubSessionBridge(): void {
  if (hubSessionBridgeRegistered) return;
  hubSessionBridgeRegistered = true;
  subscribeIcnBrowseSession(() => {
    if (hubRestoreCommitInProgress) return;
    if (peekHubRestoreFilters()) {
      commitScheduledHubRestoreIfIdle();
      return;
    }
    if (!readIcnBrowseDetailSession()) {
      hubFiltersDirtyFromUser = false;
      publishFilters(DEFAULT_FILTERS);
    }
  });
}

/** Reset in-memory hub filters (e.g. leaving ICN to airport selection). */
export function resetIcnBrowseHubFilters(): void {
  filtersSnapshot = { ...DEFAULT_FILTERS };
  hubFiltersDirtyFromUser = false;
  emitHubFiltersChange();
}

export function subscribeIcnBrowseHubFilters(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  ensureHubSessionBridge();
  if (peekHubRestoreFilters()) {
    commitScheduledHubRestoreIfIdle();
  }

  const onHubChange = () => onStoreChange();
  window.addEventListener(HUB_FILTERS_CHANGE_EVENT, onHubChange);
  const unsubSession = subscribeIcnBrowseSession(onStoreChange);
  onStoreChange();

  return () => {
    unsubSession();
    window.removeEventListener(HUB_FILTERS_CHANGE_EVENT, onHubChange);
  };
}

export function getIcnBrowseHubFiltersSnapshot(): IcnBrowseHubFilters {
  if (typeof window === "undefined") {
    return SERVER_SNAPSHOT;
  }
  return filtersSnapshot;
}

export function getIcnBrowseHubFiltersServerSnapshot(): IcnBrowseHubFilters {
  return SERVER_SNAPSHOT;
}

export function setIcnBrowseHubQuery(query: string): void {
  hubFiltersDirtyFromUser = true;
  filtersSnapshot = { ...filtersSnapshot, query };
  emitHubFiltersChange();
}

export function setIcnBrowseHubTerminalFilter(terminalFilter: string): void {
  hubFiltersDirtyFromUser = true;
  filtersSnapshot = { ...filtersSnapshot, terminalFilter };
  emitHubFiltersChange();
}

export function setIcnBrowseHubCategoryLarge(categoryLarge: string): void {
  hubFiltersDirtyFromUser = true;
  filtersSnapshot = {
    ...filtersSnapshot,
    categoryLarge,
    categoryMedium: "all",
  };
  emitHubFiltersChange();
}

export function setIcnBrowseHubCategoryMedium(categoryMedium: string): void {
  hubFiltersDirtyFromUser = true;
  filtersSnapshot = { ...filtersSnapshot, categoryMedium };
  emitHubFiltersChange();
}
