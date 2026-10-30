import type { MivvuPreviewLocale } from "@/lib/mivvu-preview-locale";
import type { IcnFacilityBrowseRecord } from "@/types/icn-facility-browse";
import type { IcnFacilityRefResolution } from "./icn-facility-reference";
import {
  formatIcnTerminalFloorLine,
  type IcnBrowseListItem,
} from "./icn-browse-view-model";
import { toBrowseDisplayItems } from "./icn-browse-display";

export type IcnFacilityDetailFoundView = {
  kind: "found";
  displayName: string;
  nameFromKoreanFallback: boolean;
  placeLine: string | null;
  displayLocation: string | null;
  locationFromKoreanFallback: boolean;
  categoryLabel: string | null;
  hoursText: string | null;
  hoursAmbiguousEqual: boolean;
  arrivalOrDeparture: IcnFacilityBrowseRecord["arrivalOrDeparture"];
  dutyFreeFlag: IcnFacilityBrowseRecord["dutyFreeFlag"];
  record: IcnFacilityBrowseRecord;
};

export type IcnFacilityDetailErrorView = {
  kind: "error";
  status: Exclude<IcnFacilityRefResolution["status"], "found">;
  reason?: "reference_content_not_found" | "locale_content_not_found" | "locale_not_captured" | "bilingual_pairing";
  version?: number;
};

export type IcnFacilityDetailView = IcnFacilityDetailFoundView | IcnFacilityDetailErrorView;

function formatCategoryLabel(record: IcnFacilityBrowseRecord): string | null {
  const parts = [record.categories.large, record.categories.medium, record.categories.small]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
  if (parts.length === 0) return null;
  const unique: string[] = [];
  for (const part of parts) {
    if (!unique.includes(part)) unique.push(part);
  }
  return unique.join(" · ");
}

function isAmbiguousEqualHours(hours: string): boolean {
  return /^\s*(\d{1,2}:\d{2})\s*~\s*\1\s*$/.test(hours);
}

export function buildIcnFacilityDetailView(
  resolution: IcnFacilityRefResolution,
  locale: MivvuPreviewLocale,
  koreanFallbackBySourceId: Map<string, IcnBrowseListItem> | null,
): IcnFacilityDetailView {
  if (resolution.status !== "found") {
    if (resolution.status === "missing") {
      return { kind: "error", status: "missing", reason: resolution.reason };
    }
    if (resolution.status === "ambiguous") {
      return { kind: "error", status: "ambiguous", reason: resolution.reason };
    }
    if (resolution.status === "unsupported_version") {
      return { kind: "error", status: "unsupported_version", version: resolution.version };
    }
    return { kind: "error", status: "invalid_reference" };
  }

  const record = resolution.record;
  const listItem: IcnBrowseListItem = {
    id: `browse-${record.listingIndex}`,
    sourceId: record.sourceId,
    name: record.name,
    terminalId: record.terminalId,
    terminalLabel: null,
    floor: record.floor,
    locationDescription: record.locationDescription,
    categoryLabel: formatCategoryLabel(record),
    categoryLargeKey: record.categories.large?.trim() || null,
    categoryMediumKey: record.categories.medium?.trim() || null,
    hoursText: record.hoursText,
  };
  const [display] = toBrowseDisplayItems([listItem], locale, locale === "en" ? koreanFallbackBySourceId : null);
  const hoursText = record.hoursText?.trim() ? record.hoursText : null;

  return {
    kind: "found",
    displayName: display.displayName,
    nameFromKoreanFallback: display.nameFromKoreanFallback,
    placeLine: formatIcnTerminalFloorLine(record.terminalId, record.floor, locale),
    displayLocation: display.displayLocation,
    locationFromKoreanFallback: display.locationFromKoreanFallback,
    categoryLabel: formatCategoryLabel(record),
    hoursText,
    hoursAmbiguousEqual: hoursText ? isAmbiguousEqualHours(hoursText) : false,
    arrivalOrDeparture: record.arrivalOrDeparture,
    dutyFreeFlag: record.dutyFreeFlag,
    record,
  };
}

export function mivvuPreviewLocaleToIcnLanguage(locale: MivvuPreviewLocale): "K" | "E" {
  return locale === "ko" ? "K" : "E";
}
