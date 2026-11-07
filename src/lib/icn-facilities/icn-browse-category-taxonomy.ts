import type { MivvuPreviewLocale } from "@/lib/mivvu-preview-locale";
import type { IcnBrowseListItem } from "./icn-browse-view-model";
import { matchUnambiguousIcnRecords } from "./icn-snapshot-matching";

/** Human-approved KO top-level taxonomy (GW-ICN-014); order is browse UI order. */
export const ICN_BROWSE_TOP_LEVEL_CATEGORY_KEYS = [
  "식・음료",
  "공항즐기기",
  "안내・편의시설",
  "일반쇼핑",
  "면세점쇼핑",
  "출입국시설",
  "기타시설",
  "교통시설",
] as const;

export type IcnBrowseCategoryLargeKey = (typeof ICN_BROWSE_TOP_LEVEL_CATEGORY_KEYS)[number];

export const ICN_BROWSE_CATEGORY_ALL = "all" as const;

export type IcnBrowseCategoryFilter = {
  categoryLarge: string;
  categoryMedium: string;
};

export type IcnBrowseCategoryTaxonomyEntry = {
  key: IcnBrowseCategoryLargeKey;
  labelKo: string;
  labelEn: string;
  /** True when EN fixture has no `large` label and KO string is shown in EN UI. */
  labelEnFromKoreanFallback: boolean;
  subcategories: ReadonlyArray<{
    key: string;
    labelKo: string;
    labelEn: string;
    labelEnFromKoreanFallback: boolean;
  }>;
};

export type IcnBrowseCategoryDisplay = {
  label: string;
  labelFromKoreanFallback: boolean;
};

export type IcnBrowseCategoryTaxonomy = {
  topLevel: ReadonlyArray<IcnBrowseCategoryTaxonomyEntry>;
};

function trimCategoryPart(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Stable KO keys carried in hub state and session restore (not array index). */
export function categoryKeysFromBrowseItem(item: IcnBrowseListItem): {
  categoryLargeKey: string | null;
  categoryMediumKey: string | null;
} {
  return {
    categoryLargeKey: trimCategoryPart(item.categoryLargeKey),
    categoryMediumKey: trimCategoryPart(item.categoryMediumKey),
  };
}

function enItemForKoItem(
  koItem: IcnBrowseListItem,
  englishBySourceId: Map<string, IcnBrowseListItem>,
): IcnBrowseListItem | undefined {
  return englishBySourceId.get(koItem.sourceId);
}

function pickEnLargeLabel(
  koLarge: string,
  koItems: readonly IcnBrowseListItem[],
  englishBySourceId: Map<string, IcnBrowseListItem>,
): { labelEn: string; labelEnFromKoreanFallback: boolean } {
  const sample = koItems.find((item) => item.categoryLargeKey === koLarge);
  if (!sample) return { labelEn: koLarge, labelEnFromKoreanFallback: true };
  const en = enItemForKoItem(sample, englishBySourceId);
  const enLarge = trimCategoryPart(en?.categoryLargeKey);
  if (enLarge) return { labelEn: enLarge, labelEnFromKoreanFallback: false };
  return { labelEn: koLarge, labelEnFromKoreanFallback: true };
}

function pickEnMediumLabel(
  koLarge: string,
  koMedium: string,
  koItems: readonly IcnBrowseListItem[],
  englishBySourceId: Map<string, IcnBrowseListItem>,
): { labelEn: string; labelEnFromKoreanFallback: boolean } {
  const sample = koItems.find(
    (item) => item.categoryLargeKey === koLarge && item.categoryMediumKey === koMedium,
  );
  if (!sample) return { labelEn: koMedium, labelEnFromKoreanFallback: true };
  const en = enItemForKoItem(sample, englishBySourceId);
  const enMedium = trimCategoryPart(en?.categoryMediumKey);
  if (enMedium) return { labelEn: enMedium, labelEnFromKoreanFallback: false };
  return { labelEn: koMedium, labelEnFromKoreanFallback: true };
}

/**
 * Build category choices from the full collapsed browse catalogs (not the filtered list).
 * Labels for EN come from paired EN rows via unambiguous sourceId matching only.
 */
export function buildIcnBrowseCategoryTaxonomy(
  koreanItems: readonly IcnBrowseListItem[],
  englishItems: readonly IcnBrowseListItem[],
): IcnBrowseCategoryTaxonomy {
  const pairs = matchUnambiguousIcnRecords(koreanItems, englishItems);
  const englishBySourceId = new Map(
    [...pairs.values()].map(({ left, right }) => [left.sourceId, right]),
  );

  const topLevel: IcnBrowseCategoryTaxonomyEntry[] = [];
  for (const key of ICN_BROWSE_TOP_LEVEL_CATEGORY_KEYS) {
    const mediumKeys = new Set<string>();
    for (const item of koreanItems) {
      if (item.categoryLargeKey !== key) continue;
      const medium = trimCategoryPart(item.categoryMediumKey);
      if (medium) mediumKeys.add(medium);
    }
    const subcategories = [...mediumKeys]
      .sort((a, b) => a.localeCompare(b, "ko"))
      .map((mediumKey) => {
        const enMedium = pickEnMediumLabel(key, mediumKey, koreanItems, englishBySourceId);
        return {
          key: mediumKey,
          labelKo: mediumKey,
          labelEn: enMedium.labelEn,
          labelEnFromKoreanFallback: enMedium.labelEnFromKoreanFallback,
        };
      });

    const enLarge = pickEnLargeLabel(key, koreanItems, englishBySourceId);
    topLevel.push({
      key,
      labelKo: key,
      labelEn: enLarge.labelEn,
      labelEnFromKoreanFallback: enLarge.labelEnFromKoreanFallback,
      subcategories,
    });
  }

  return { topLevel };
}

export function largeCategoryLabel(
  taxonomy: IcnBrowseCategoryTaxonomy,
  largeKey: string,
  locale: MivvuPreviewLocale,
): string | null {
  return resolveLargeCategoryDisplay(taxonomy, largeKey, locale)?.label ?? null;
}

export function mediumCategoryLabel(
  taxonomy: IcnBrowseCategoryTaxonomy,
  largeKey: string,
  mediumKey: string,
  locale: MivvuPreviewLocale,
): string | null {
  return resolveMediumCategoryDisplay(taxonomy, largeKey, mediumKey, locale)?.label ?? null;
}

export function resolveLargeCategoryDisplay(
  taxonomy: IcnBrowseCategoryTaxonomy,
  largeKey: string,
  locale: MivvuPreviewLocale,
): IcnBrowseCategoryDisplay | null {
  if (largeKey === ICN_BROWSE_CATEGORY_ALL) return null;
  const entry = taxonomy.topLevel.find((row) => row.key === largeKey);
  if (!entry) return { label: largeKey, labelFromKoreanFallback: locale === "en" };
  if (locale === "ko") {
    return { label: entry.labelKo, labelFromKoreanFallback: false };
  }
  return {
    label: entry.labelEn,
    labelFromKoreanFallback: entry.labelEnFromKoreanFallback,
  };
}

export function resolveMediumCategoryDisplay(
  taxonomy: IcnBrowseCategoryTaxonomy,
  largeKey: string,
  mediumKey: string,
  locale: MivvuPreviewLocale,
): IcnBrowseCategoryDisplay | null {
  if (mediumKey === ICN_BROWSE_CATEGORY_ALL) return null;
  const entry = taxonomy.topLevel.find((row) => row.key === largeKey);
  const sub = entry?.subcategories.find((row) => row.key === mediumKey);
  if (!sub) return { label: mediumKey, labelFromKoreanFallback: locale === "en" };
  if (locale === "ko") {
    return { label: sub.labelKo, labelFromKoreanFallback: false };
  }
  return {
    label: sub.labelEn,
    labelFromKoreanFallback: sub.labelEnFromKoreanFallback,
  };
}

export function applyIcnBrowseCategoryFilter(
  items: readonly IcnBrowseListItem[],
  filter: IcnBrowseCategoryFilter,
): IcnBrowseListItem[] {
  if (filter.categoryLarge === ICN_BROWSE_CATEGORY_ALL) {
    return [...items];
  }
  const byLarge = items.filter((item) => item.categoryLargeKey === filter.categoryLarge);
  if (filter.categoryMedium === ICN_BROWSE_CATEGORY_ALL) {
    return byLarge;
  }
  return byLarge.filter((item) => item.categoryMediumKey === filter.categoryMedium);
}

export function inheritKoreanCategoryKeysForFilter(
  koreanItems: readonly IcnBrowseListItem[],
  localeItems: readonly IcnBrowseListItem[],
): IcnBrowseListItem[] {
  const pairs = matchUnambiguousIcnRecords(koreanItems, localeItems);
  const koByEnglishSourceId = new Map(
    [...pairs.values()].map(({ left, right }) => [right.sourceId, left]),
  );
  return localeItems.map((item) => {
    const ko = koByEnglishSourceId.get(item.sourceId);
    if (!ko) return item;
    return {
      ...item,
      categoryLargeKey: ko.categoryLargeKey,
      categoryMediumKey: ko.categoryMediumKey,
    };
  });
}

export function defaultIcnBrowseCategoryFilter(): IcnBrowseCategoryFilter {
  return { categoryLarge: ICN_BROWSE_CATEGORY_ALL, categoryMedium: ICN_BROWSE_CATEGORY_ALL };
}
