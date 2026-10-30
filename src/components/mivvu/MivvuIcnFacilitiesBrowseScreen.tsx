"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { MivvuIcnHeader } from "@/components/mivvu/MivvuIcnHeader";
import { MivvuIcnCategoryBottomSheet } from "@/components/mivvu/MivvuIcnCategoryBottomSheet";
import { useMivvuPreviewLocale } from "@/components/mivvu/MivvuPreviewLocaleProvider";
import {
  buildKoreanFallbackIndex,
  toBrowseDisplayItems,
} from "@/lib/icn-facilities/icn-browse-display";
import {
  buildIcnBrowseCategoryTaxonomy,
  ICN_BROWSE_CATEGORY_ALL,
  inheritKoreanCategoryKeysForFilter,
  resolveLargeCategoryDisplay,
  resolveMediumCategoryDisplay,
} from "@/lib/icn-facilities/icn-browse-category-taxonomy";
import {
  getIcnBrowseHubFiltersServerSnapshot,
  getIcnBrowseHubFiltersSnapshot,
  resetIcnBrowseHubFilters,
  setIcnBrowseHubCategoryLarge,
  setIcnBrowseHubCategoryMedium,
  setIcnBrowseHubQuery,
  setIcnBrowseHubTerminalFilter,
  subscribeIcnBrowseHubFilters,
} from "@/lib/icn-facilities/icn-browse-hub-filters";
import {
  filterIcnBrowseItems,
  formatIcnTerminalFloorLine,
  type IcnBrowseCatalog,
} from "@/lib/icn-facilities/icn-browse-view-model";
import {
  MIVVU_ICN_FACILITY_DETAIL_PATH_PREFIX,
  MIVVU_ENTRY_PATH,
} from "@/lib/mivvu-entry-routes";
import {
  clearIcnBrowseSessionContext,
  saveIcnBrowseDetailNavigation,
} from "@/lib/icn-facilities/icn-browse-session";

function SearchIcon() {
  return (
    <svg
      className="mivvu-entry-search-icon"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function isAmbiguousEqualHours(hours: string): boolean {
  return /^\s*(\d{1,2}:\d{2})\s*~\s*\1\s*$/.test(hours);
}

function markIcnBrowseDetailNavigation(
  query: string,
  terminalFilter: string,
  categoryLarge: string,
  categoryMedium: string,
  refPathSegment: string,
) {
  saveIcnBrowseDetailNavigation({
    query,
    terminalFilter,
    categoryLarge,
    categoryMedium,
    refPathSegment,
  });
}

type CategorySheetMode = "top" | "sub" | null;

function CategoryTriggerValue({
  label,
  showKoreanLabelFallback,
  fallbackMessage,
}: {
  label: string;
  showKoreanLabelFallback: boolean;
  fallbackMessage: string;
}) {
  return (
    <span className="mivvu-icn-category-trigger-value">
      <span className="mivvu-icn-category-trigger-primary">
        <span>{label}</span>
        <ChevronIcon />
      </span>
      {showKoreanLabelFallback ? (
        <span className="mivvu-icn-ko-fallback">{fallbackMessage}</span>
      ) : null}
    </span>
  );
}

export type MivvuIcnFacilitiesBrowseScreenProps = {
  catalogKo: IcnBrowseCatalog;
  catalogEn: IcnBrowseCatalog;
};

export function MivvuIcnFacilitiesBrowseScreen({
  catalogKo,
  catalogEn,
}: MivvuIcnFacilitiesBrowseScreenProps) {
  const router = useRouter();
  const { locale, messages } = useMivvuPreviewLocale();
  const searchId = useId();
  const searchHintId = useId();
  const listId = useId();
  const terminalGroupId = useId();
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [categorySheet, setCategorySheet] = useState<CategorySheetMode>(null);

  const { query, terminalFilter, categoryLarge, categoryMedium } = useSyncExternalStore(
    subscribeIcnBrowseHubFilters,
    getIcnBrowseHubFiltersSnapshot,
    getIcnBrowseHubFiltersServerSnapshot,
  );

  const categoryFilter = useMemo(
    () => ({ categoryLarge, categoryMedium }),
    [categoryLarge, categoryMedium],
  );

  const taxonomy = useMemo(
    () => buildIcnBrowseCategoryTaxonomy(catalogKo.items, catalogEn.items),
    [catalogKo.items, catalogEn.items],
  );

  const catalog = useMemo(() => {
    const base = locale === "ko" ? catalogKo : catalogEn;
    if (locale === "ko") return base;
    return {
      ...base,
      items: inheritKoreanCategoryKeysForFilter(catalogKo.items, base.items),
    };
  }, [catalogEn, catalogKo, locale]);
  const koFallback = useMemo(
    () => buildKoreanFallbackIndex(catalogKo.items, catalogEn.items),
    [catalogKo.items, catalogEn.items],
  );

  const filtered = useMemo(
    () => filterIcnBrowseItems(catalog.items, query, terminalFilter, locale, categoryFilter),
    [catalog.items, query, terminalFilter, locale, categoryFilter],
  );

  const activeTopLevel = taxonomy.topLevel.find((row) => row.key === categoryLarge);
  const subcategoryOptions = useMemo(
    () => activeTopLevel?.subcategories ?? [],
    [activeTopLevel],
  );
  const showSubcategoryRow =
    categoryLarge !== ICN_BROWSE_CATEGORY_ALL && subcategoryOptions.length > 0;

  const topLevelPresentation = useMemo(() => {
    if (categoryLarge === ICN_BROWSE_CATEGORY_ALL) {
      return { label: messages.icnCategoryAll, labelFromKoreanFallback: false };
    }
    return (
      resolveLargeCategoryDisplay(taxonomy, categoryLarge, locale) ?? {
        label: categoryLarge,
        labelFromKoreanFallback: locale === "en",
      }
    );
  }, [categoryLarge, locale, messages.icnCategoryAll, taxonomy]);

  const subcategoryPresentation = useMemo(() => {
    if (categoryMedium === ICN_BROWSE_CATEGORY_ALL) {
      return { label: messages.icnCategoryAll, labelFromKoreanFallback: false };
    }
    return (
      resolveMediumCategoryDisplay(taxonomy, categoryLarge, categoryMedium, locale) ?? {
        label: categoryMedium,
        labelFromKoreanFallback: locale === "en",
      }
    );
  }, [categoryLarge, categoryMedium, locale, messages.icnCategoryAll, taxonomy]);

  const topSheetOptions = useMemo(
    () =>
      taxonomy.topLevel.map((row) => ({
        value: row.key,
        label: locale === "ko" ? row.labelKo : row.labelEn,
        labelFromKoreanFallback: locale === "en" && row.labelEnFromKoreanFallback,
      })),
    [locale, taxonomy.topLevel],
  );

  const subSheetOptions = useMemo(
    () =>
      subcategoryOptions.map((row) => ({
        value: row.key,
        label: locale === "ko" ? row.labelKo : row.labelEn,
        labelFromKoreanFallback: locale === "en" && row.labelEnFromKoreanFallback,
      })),
    [locale, subcategoryOptions],
  );

  const displayItems = useMemo(
    () =>
      toBrowseDisplayItems(
        filtered,
        locale,
        locale === "en" ? koFallback : null,
      ),
    [filtered, locale, koFallback],
  );

  const numberLocale = locale === "ko" ? "ko-KR" : "en-US";

  const countLabel =
    filtered.length === catalog.snapshot.listingCount
      ? messages.icnCountAll
      : messages.icnCountFiltered(
          filtered.length.toLocaleString(numberLocale),
          catalog.snapshot.listingCount.toLocaleString(numberLocale),
        );

  useEffect(() => {
    const chip = chipRefs.current.get(terminalFilter);
    chip?.scrollIntoView?.({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [terminalFilter]);

  const setChipRef = (key: string, node: HTMLButtonElement | null) => {
    if (node) chipRefs.current.set(key, node);
    else chipRefs.current.delete(key);
  };

  return (
    <div className="mivvu-entry-airport mivvu-icn-browse">
      <div className="mivvu-entry-airport-scroll">
        <MivvuIcnHeader
          backLabel={messages.icnBack}
          onBack={() => {
            clearIcnBrowseSessionContext();
            resetIcnBrowseHubFilters();
            router.push(MIVVU_ENTRY_PATH);
          }}
        />

        <div className="mivvu-icn-browse-hero">
          <h1 className="mivvu-icn-browse-title">{messages.icnTitle}</h1>
        </div>

        <div className="mivvu-entry-search-wrap mivvu-icn-search-wrap">
          <label className="mivvu-entry-sr-only" htmlFor={searchId}>
            {messages.icnSearchLabel}
          </label>
          <div className="mivvu-entry-search mivvu-icn-search">
            <SearchIcon />
            <input
              id={searchId}
              type="search"
              className="mivvu-entry-search-input gw-focus-ring"
              placeholder={messages.icnSearchPlaceholder}
              value={query}
              onChange={(event) => setIcnBrowseHubQuery(event.target.value)}
              autoComplete="off"
              aria-controls={listId}
              aria-describedby={searchHintId}
            />
          </div>
          <p id={searchHintId} className="mivvu-icn-search-hint">
            {messages.icnSearchHint}
          </p>
        </div>

        <div className="mivvu-icn-terminal-filters" role="group" aria-labelledby={terminalGroupId}>
          <span id={terminalGroupId} className="mivvu-entry-sr-only">
            {messages.icnTerminalLabel}
          </span>
          <div className="mivvu-icn-chip-row">
            <button
              ref={(node) => setChipRef("all", node)}
              type="button"
              className={`mivvu-icn-chip gw-focus-ring ${terminalFilter === "all" ? "mivvu-icn-chip-active" : ""}`}
              aria-pressed={terminalFilter === "all"}
              aria-label={messages.icnTerminalAll}
              onClick={() => setIcnBrowseHubTerminalFilter("all")}
            >
              {messages.icnTerminalAll}
            </button>
            {catalog.terminals.map((terminal) => (
              <button
                key={terminal.value}
                ref={(node) => setChipRef(terminal.value, node)}
                type="button"
                className={`mivvu-icn-chip gw-focus-ring ${
                  terminalFilter === terminal.value ? "mivvu-icn-chip-active" : ""
                }`}
                aria-pressed={terminalFilter === terminal.value}
                aria-label={terminal.label}
                onClick={() => setIcnBrowseHubTerminalFilter(terminal.value)}
              >
                {terminal.chipLabel}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="mivvu-icn-category-trigger gw-focus-ring"
          aria-expanded={categorySheet === "top"}
          onClick={() => setCategorySheet("top")}
        >
          <span className="mivvu-icn-category-trigger-label">{messages.icnCategoryLabel}</span>
          <CategoryTriggerValue
            label={topLevelPresentation.label}
            showKoreanLabelFallback={
              locale === "en" && topLevelPresentation.labelFromKoreanFallback
            }
            fallbackMessage={messages.icnKoOnlyCategory}
          />
        </button>

        {showSubcategoryRow ? (
          <button
            type="button"
            className="mivvu-icn-category-trigger gw-focus-ring"
            aria-expanded={categorySheet === "sub"}
            onClick={() => setCategorySheet("sub")}
          >
            <span className="mivvu-icn-category-trigger-label">{messages.icnSubcategoryLabel}</span>
            <CategoryTriggerValue
              label={subcategoryPresentation.label}
              showKoreanLabelFallback={
                locale === "en" && subcategoryPresentation.labelFromKoreanFallback
              }
              fallbackMessage={messages.icnKoOnlyCategory}
            />
          </button>
        ) : null}

        <p className="mivvu-icn-result-count" aria-live="polite">
          <span className="mivvu-icn-count-number">
            {filtered.length.toLocaleString(numberLocale)}
          </span>
          <span className="mivvu-icn-count-label">{countLabel}</span>
        </p>

        {displayItems.length === 0 ? (
          <p className="mivvu-entry-empty" role="status">
            {messages.icnEmpty}
          </p>
        ) : (
          <ul id={listId} className="mivvu-icn-facility-list">
            {displayItems.map((item) => {
              const placeLine = formatIcnTerminalFloorLine(
                item.terminalId,
                item.floor,
                locale,
              );
              const detailHref =
                item.detailRefTransport && item.detailRefTransport.length > 0
                  ? `${MIVVU_ICN_FACILITY_DETAIL_PATH_PREFIX}${item.detailRefTransport}`
                  : null;
              const cardBody = (
                <>
                  <div className="mivvu-icn-facility-card-main">
                    <h2 className="mivvu-icn-facility-name">{item.displayName}</h2>
                    {item.nameFromKoreanFallback ? (
                      <p className="mivvu-icn-ko-fallback">{messages.icnKoOnlyName}</p>
                    ) : null}
                    {placeLine ? (
                      <p className="mivvu-icn-facility-meta">{placeLine}</p>
                    ) : null}
                    {item.displayLocation ? (
                      <p className="mivvu-icn-facility-location">{item.displayLocation}</p>
                    ) : null}
                    {item.locationFromKoreanFallback ? (
                      <p className="mivvu-icn-ko-fallback">{messages.icnKoOnlyLocation}</p>
                    ) : null}
                    {item.categoryLabel ? (
                      <p className="mivvu-icn-facility-category">{item.categoryLabel}</p>
                    ) : null}
                    {item.hoursText ? (
                      <p className="mivvu-icn-facility-hours">
                        <span className="mivvu-icn-hours-prefix">{messages.icnHoursLabel}</span>
                        <span className="mivvu-icn-hours-value">
                          {isAmbiguousEqualHours(item.hoursText)
                            ? messages.icnHoursUnavailable
                            : item.hoursText}
                        </span>
                      </p>
                    ) : null}
                  </div>
                  {detailHref ? (
                    <span className="mivvu-icn-facility-chevron" aria-hidden="true">
                      <ChevronIcon />
                    </span>
                  ) : null}
                </>
              );

              return (
                <li key={item.id}>
                  {detailHref ? (
                    <a
                      href={detailHref}
                      className="mivvu-icn-facility-card mivvu-icn-facility-card-link gw-focus-ring"
                      onClick={() =>
                        markIcnBrowseDetailNavigation(
                          query,
                          terminalFilter,
                          categoryLarge,
                          categoryMedium,
                          item.detailRefTransport!,
                        )
                      }
                    >
                      {cardBody}
                    </a>
                  ) : (
                    <article className="mivvu-icn-facility-card">{cardBody}</article>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <aside className="mivvu-icn-snapshot" aria-label={messages.icnSnapshotTitle}>
          <h2 className="mivvu-icn-snapshot-title">{messages.icnSnapshotTitle}</h2>
          <dl className="mivvu-icn-snapshot-list">
            <div>
              <dt>{messages.icnSnapshotSource}</dt>
              <dd>{catalog.snapshot.sourceLabel}</dd>
            </div>
            <div>
              <dt>{messages.icnSnapshotDate}</dt>
              <dd>{catalog.snapshot.retrievedDateLabel}</dd>
            </div>
          </dl>
          <p className="mivvu-icn-snapshot-note">{catalog.snapshot.coverageNote}</p>
        </aside>
      </div>

      <MivvuIcnCategoryBottomSheet
        open={categorySheet === "top"}
        title={messages.icnCategorySheetTopTitle}
        options={topSheetOptions}
        selectedValue={categoryLarge}
        allLabel={messages.icnCategoryAll}
        closeLabel={messages.icnCategorySheetClose}
        koreanLabelFallbackHint={locale === "en" ? messages.icnKoOnlyCategory : null}
        onClose={() => setCategorySheet(null)}
        onSelect={(value) => setIcnBrowseHubCategoryLarge(value)}
      />
      <MivvuIcnCategoryBottomSheet
        open={categorySheet === "sub"}
        title={messages.icnCategorySheetSubTitle}
        options={subSheetOptions}
        selectedValue={categoryMedium}
        allLabel={messages.icnCategoryAll}
        closeLabel={messages.icnCategorySheetClose}
        koreanLabelFallbackHint={locale === "en" ? messages.icnKoOnlyCategory : null}
        onClose={() => setCategorySheet(null)}
        onSelect={(value) => setIcnBrowseHubCategoryMedium(value)}
      />
    </div>
  );
}
