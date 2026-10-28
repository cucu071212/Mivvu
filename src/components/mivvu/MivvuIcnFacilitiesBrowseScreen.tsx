"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MivvuWordmark } from "@/components/mivvu/MivvuWordmark";
import { MivvuLanguageToggle } from "@/components/mivvu/MivvuLanguageToggle";
import { useMivvuPreviewLocale } from "@/components/mivvu/MivvuPreviewLocaleProvider";
import {
  buildKoreanFallbackIndex,
  toBrowseDisplayItems,
} from "@/lib/icn-facilities/icn-browse-display";
import {
  filterIcnBrowseItems,
  formatIcnTerminalFloorLine,
  type IcnBrowseCatalog,
} from "@/lib/icn-facilities/icn-browse-view-model";

function BackIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

function isAmbiguousEqualHours(hours: string): boolean {
  return /^\s*(\d{1,2}:\d{2})\s*~\s*\1\s*$/.test(hours);
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

  const [query, setQuery] = useState("");
  const [terminalFilter, setTerminalFilter] = useState("all");

  const catalog = locale === "ko" ? catalogKo : catalogEn;
  const koFallback = useMemo(() => buildKoreanFallbackIndex(catalogKo.items), [catalogKo.items]);

  const filtered = useMemo(
    () => filterIcnBrowseItems(catalog.items, query, terminalFilter, locale),
    [catalog.items, query, terminalFilter, locale],
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
        <header className="mivvu-icn-browse-top">
          <div className="mivvu-icn-browse-toolbar">
            <button
              type="button"
              className="mivvu-icn-back mivvu-icn-back-compact gw-focus-ring"
              onClick={() => router.push("/preview/mivvu-entry")}
            >
              <BackIcon />
              <span className="mivvu-icn-back-text">{messages.icnBack}</span>
            </button>
            <MivvuWordmark variant="headerCompact" className="mivvu-icn-toolbar-wordmark" />
            <MivvuLanguageToggle />
          </div>
        </header>

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
              onChange={(event) => setQuery(event.target.value)}
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
              onClick={() => setTerminalFilter("all")}
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
                onClick={() => setTerminalFilter(terminal.value)}
              >
                {terminal.chipLabel}
              </button>
            ))}
          </div>
        </div>

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
              return (
                <li key={item.id}>
                  <article className="mivvu-icn-facility-card">
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
                  </article>
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
    </div>
  );
}
