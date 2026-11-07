"use client";

import { useSyncExternalStore } from "react";
import { useMivvuPreviewLocale } from "@/components/mivvu/MivvuPreviewLocaleProvider";
import type { MivvuIcnHeaderSavedLinkEntry } from "@/components/mivvu/MivvuIcnHeader";
import { MIVVU_ICN_SAVED_FACILITIES_PATH } from "@/lib/mivvu-entry-routes";
import {
  getIcnSavedFacilitiesClientSnapshot,
  getIcnSavedFacilitiesServerSnapshot,
  icnSavedFacilitiesCount,
  subscribeIcnSavedFacilities,
} from "@/lib/icn-facilities/icn-saved-facilities-client-store";

/** ICN browse/detail/saved 헤더용 활성 저장 링크 엔트리를 구독합니다. */
export function useMivvuIcnSavedHeaderEntry(isCurrentPage: boolean): MivvuIcnHeaderSavedLinkEntry {
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
