import type { MivvuPreviewLocale } from "@/lib/mivvu-preview-locale";
import type { IcnBrowseListItem } from "./icn-browse-view-model";

export type IcnBrowseDisplayItem = IcnBrowseListItem & {
  displayName: string;
  displayLocation: string | null;
  nameFromKoreanFallback: boolean;
  locationFromKoreanFallback: boolean;
};

function isBlank(text: string | null | undefined): boolean {
  return !text || text.trim().length === 0;
}

export function buildKoreanFallbackIndex(
  koreanItems: IcnBrowseListItem[],
): Map<string, IcnBrowseListItem> {
  const map = new Map<string, IcnBrowseListItem>();
  for (const item of koreanItems) {
    if (!map.has(item.sourceId)) {
      map.set(item.sourceId, item);
    }
  }
  return map;
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
