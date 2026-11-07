"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  buildIcnBrowseCategoryTaxonomy,
} from "@/lib/icn-facilities/icn-browse-category-taxonomy";
import {
  getIcnBrowseHubFiltersSnapshot,
  subscribeIcnBrowseHubFilters,
  type IcnBrowseHubFilters,
} from "@/lib/icn-facilities/icn-browse-hub-filters";
import {
  isIcnBrowseUrlHistorySyncSuppressed,
  releaseIcnBrowseUrlHistorySync,
} from "@/lib/icn-facilities/icn-browse-url-history-sync-guard";
import {
  ensureIcnBrowseHubLocationBootstrap,
  invalidateIcnBrowseUrlLocationBootstrapCache,
  markIcnBrowseUrlLocationSearchApplied,
  notifyIcnBrowseUrlLocationSearchChanged,
  registerIcnBrowseUrlValidationContext,
} from "@/lib/icn-facilities/icn-browse-url-location-bootstrap";
import {
  buildIcnBrowseUrlSearchString,
  icnBrowseUrlSearchStringsEquivalent,
} from "@/lib/icn-facilities/icn-browse-url-state";
import type { IcnBrowseCatalog } from "@/lib/icn-facilities/icn-browse-view-model";
import { MIVVU_ICN_BROWSE_PATH } from "@/lib/mivvu-entry-routes";

type HistoryWriteMode = "replace" | "push" | "none";

function filtersEqual(a: IcnBrowseHubFilters, b: IcnBrowseHubFilters): boolean {
  return (
    a.query === b.query
    && a.terminalFilter === b.terminalFilter
    && a.categoryLarge === b.categoryLarge
    && a.categoryMedium === b.categoryMedium
  );
}

function chooseHistoryWriteMode(
  previous: IcnBrowseHubFilters,
  next: IcnBrowseHubFilters,
): HistoryWriteMode {
  if (filtersEqual(previous, next)) return "none";
  const queryOnly =
    previous.query !== next.query
    && previous.terminalFilter === next.terminalFilter
    && previous.categoryLarge === next.categoryLarge
    && previous.categoryMedium === next.categoryMedium;
  return queryOnly ? "replace" : "push";
}

function writeBrowseUrl(
  filters: IcnBrowseHubFilters,
  mode: HistoryWriteMode,
): void {
  if (mode === "none" || typeof window === "undefined") return;
  if (isIcnBrowseUrlHistorySyncSuppressed()) return;
  const nextSearch = buildIcnBrowseUrlSearchString(filters);
  const pathname = window.location.pathname;
  if (pathname !== MIVVU_ICN_BROWSE_PATH) return;
  const currentSearch = window.location.search;
  if (icnBrowseUrlSearchStringsEquivalent(currentSearch, nextSearch)) return;
  const url = `${MIVVU_ICN_BROWSE_PATH}${nextSearch}`;
  if (mode === "replace") {
    window.history.replaceState(window.history.state, "", url);
  } else {
    window.history.pushState(window.history.state, "", url);
  }
  markIcnBrowseUrlLocationSearchApplied(window.location.search);
}

export function useIcnBrowseUrlSync(catalogKo: IcnBrowseCatalog, catalogEn: IcnBrowseCatalog): void {
  const previousFiltersRef = useRef<IcnBrowseHubFilters | null>(null);
  const applyingFromHistoryRef = useRef(false);

  const urlValidationContext = useMemo(() => {
    const taxonomy = buildIcnBrowseCategoryTaxonomy(catalogKo.items, catalogEn.items);
    const terminalValues = new Set(catalogKo.terminals.map((row) => row.value));
    return { terminalValues, taxonomy };
  }, [catalogKo.items, catalogKo.terminals, catalogEn.items]);

  registerIcnBrowseUrlValidationContext(urlValidationContext);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const syncFromHub = (modeHint?: HistoryWriteMode) => {
      if (applyingFromHistoryRef.current) return;
      const next = getIcnBrowseHubFiltersSnapshot();
      const previous = previousFiltersRef.current ?? next;
      const mode = modeHint ?? chooseHistoryWriteMode(previous, next);
      previousFiltersRef.current = next;
      writeBrowseUrl(next, mode);
    };

    ensureIcnBrowseHubLocationBootstrap();
    previousFiltersRef.current = getIcnBrowseHubFiltersSnapshot();
    syncFromHub("replace");

    const unsub = subscribeIcnBrowseHubFilters(() => {
      syncFromHub();
    });

    const onPopState = () => {
      applyingFromHistoryRef.current = true;
      notifyIcnBrowseUrlLocationSearchChanged();
      previousFiltersRef.current = getIcnBrowseHubFiltersSnapshot();
      applyingFromHistoryRef.current = false;
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      unsub();
      window.removeEventListener("popstate", onPopState);
      invalidateIcnBrowseUrlLocationBootstrapCache();
      releaseIcnBrowseUrlHistorySync();
    };
  }, []);
}
