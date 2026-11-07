import { peekHubRestoreFilters, clearIcnBrowseSessionContextSilently } from "./icn-browse-session";
import {
  commitScheduledHubRestoreIfIdle,
  getIcnBrowseHubFiltersSnapshot,
  replaceIcnBrowseHubFilters,
} from "./icn-browse-hub-filters";
import {
  buildIcnBrowseUrlSearchString,
  icnBrowseUrlHasExplicitBrowseParams,
  icnBrowseUrlSearchStringsEquivalent,
  parseIcnBrowseUrlState,
  type IcnBrowseUrlValidationContext,
} from "./icn-browse-url-state";
import { MIVVU_ICN_BROWSE_PATH } from "@/lib/mivvu-entry-routes";

let registeredContext: IcnBrowseUrlValidationContext | null = null;
let lastAppliedLocationSearch: string | null = null;

export function registerIcnBrowseUrlValidationContext(
  context: IcnBrowseUrlValidationContext,
): void {
  registeredContext = context;
}

export function resetIcnBrowseUrlLocationBootstrapForTests(): void {
  registeredContext = null;
  lastAppliedLocationSearch = null;
}

export function invalidateIcnBrowseUrlLocationBootstrapCache(): void {
  lastAppliedLocationSearch = null;
}

export function markIcnBrowseUrlLocationSearchApplied(search: string): void {
  lastAppliedLocationSearch = search;
}

function applyParsedLocationSearch(search: string): void {
  if (!registeredContext) return;
  const { filters } = parseIcnBrowseUrlState(search, registeredContext);
  replaceIcnBrowseHubFilters(filters);
  lastAppliedLocationSearch = search;
}

/** Align the address bar with committed hub filters (detail return before URL sync). */
export function normalizeIcnBrowseUrlToCurrentHubFilters(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname !== MIVVU_ICN_BROWSE_PATH) return;
  const nextSearch = buildIcnBrowseUrlSearchString(getIcnBrowseHubFiltersSnapshot());
  if (!icnBrowseUrlSearchStringsEquivalent(window.location.search, nextSearch)) {
    window.history.replaceState(window.history.state, "", `${MIVVU_ICN_BROWSE_PATH}${nextSearch}`);
  }
  markIcnBrowseUrlLocationSearchApplied(window.location.search);
}

/**
 * Cold-load bootstrap: explicit URL params win; pending detail restore defers to hub commit;
 * otherwise reconcile hub filters to the address bar (defaults when bare).
 */
export function ensureIcnBrowseHubLocationBootstrap(force = false): void {
  if (typeof window === "undefined" || !registeredContext) return;
  const search = window.location.search;
  if (!force && lastAppliedLocationSearch === search) return;

  if (icnBrowseUrlHasExplicitBrowseParams(search)) {
    clearIcnBrowseSessionContextSilently();
    applyParsedLocationSearch(search);
    return;
  }

  if (peekHubRestoreFilters()) {
    lastAppliedLocationSearch = search;
    return;
  }

  clearIcnBrowseSessionContextSilently();
  applyParsedLocationSearch(search);
}

/** Browser Back/Forward: reconcile hub filters to the address bar (including bare `/icn` defaults). */
export function notifyIcnBrowseUrlLocationSearchChanged(): void {
  if (typeof window === "undefined" || !registeredContext) return;
  const search = window.location.search;
  lastAppliedLocationSearch = null;

  if (peekHubRestoreFilters()) {
    if (commitScheduledHubRestoreIfIdle()) {
      normalizeIcnBrowseUrlToCurrentHubFilters();
    }
    lastAppliedLocationSearch = search;
    return;
  }

  clearIcnBrowseSessionContextSilently();
  applyParsedLocationSearch(search);
}
