"use client";

import { useSyncExternalStore } from "react";
import { useMivvuPreviewLocale } from "@/components/mivvu/MivvuPreviewLocaleProvider";
import type { MivvuIcnHeaderSavedEntry } from "@/components/mivvu/MivvuIcnHeader";
import { MIVVU_ICN_SAVED_FACILITIES_PATH } from "@/lib/mivvu-entry-routes";
import {
  getIcnSavedFacilitiesClientSnapshot,
  getIcnSavedFacilitiesServerSnapshot,
  icnSavedFacilitiesCount,
  subscribeIcnSavedFacilities,
} from "@/lib/icn-facilities/icn-saved-facilities-client-store";

export function useMivvuIcnSavedHeaderEntry(isCurrentPage: boolean): MivvuIcnHeaderSavedEntry {
  const { messages } = useMivvuPreviewLocale();
  const snapshot = useSyncExternalStore(
    subscribeIcnSavedFacilities,
    getIcnSavedFacilitiesClientSnapshot,
    getIcnSavedFacilitiesServerSnapshot,
  );
  return {
    href: MIVVU_ICN_SAVED_FACILITIES_PATH,
    label: messages.icnSavedEntry,
    count: icnSavedFacilitiesCount(snapshot),
    isCurrentPage,
  };
}
