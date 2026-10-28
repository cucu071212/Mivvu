import type { MivvuPreviewLocale } from "@/lib/mivvu-preview-locale";
import type { IcnBrowseListItem } from "./icn-browse-view-model";

import { matchUnambiguousIcnRecords } from "./icn-snapshot-matching";

export type IcnBrowseDisplayItem = IcnBrowseListItem & {
  displayName: string;
  displayLocation: string | null;
  nameFromKoreanFallback: boolean;
  locationFromKoreanFallback: boolean;
};

function isBlank(text: string | null | undefined): boolean {
  return !text || text.trim().length === 0;
}

/** Both inputs must be full catalogs after identical-row collapse, before filtering. */
export function buildKoreanFallbackIndex(
  koreanItems: IcnBrowseListItem[],
  englishItems: IcnBrowseListItem[],
): Map<string, IcnBrowseListItem> {
  const pairs = matchUnambiguousIcnRecords(koreanItems, englishItems);
  return new Map([...pairs].map(([id, pair]) => [id, pair.left]));
}

export function toBrowseDisplayItems(
  items: IcnBrowseListItem[],
  locale: MivvuPreviewLocale,
  koreanFallbackBySourceId: Map<string, IcnBrowseListItem> | null,
): IcnBrowseDisplayItem[] {
  return items.map((item) => {
    let displayName = item.name;
    let displayLocation = item.locationDescription;
    let nameFromKoreanFallback = false;
    let locationFromKoreanFallback = false;

    if (locale === "en" && koreanFallbackBySourceId) {
      const ko = koreanFallbackBySourceId.get(item.sourceId);
      if (ko) {
        if (isBlank(displayName) && !isBlank(ko.name)) {
          displayName = ko.name;
          nameFromKoreanFallback = true;
        }
        if (isBlank(displayLocation) && !isBlank(ko.locationDescription)) {
          displayLocation = ko.locationDescription;
          locationFromKoreanFallback = true;
        }
      }
    }

    return {
      ...item,
      displayName,
      displayLocation,
      nameFromKoreanFallback,
      locationFromKoreanFallback,
    };
  });
}
