"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AirportCatalogEntry } from "@/data/airport-selection-catalog";
import {
  isMivvuEntryBrowsable,
  MIVVU_ENTRY_AIRPORT_CATALOG,
  MIVVU_ENTRY_DEFAULT_IATA,
  type MivvuEntryAirportIata,
} from "@/data/mivvu-entry-airport-catalog";
import { filterAirportSelectionCatalog } from "@/lib/filter-airport-selection-catalog";
import { persistAirportSelection } from "@/lib/airport-selection-preference";
import { MivvuWordmark } from "@/components/mivvu/MivvuWordmark";
import { MivvuLanguageToggle } from "@/components/mivvu/MivvuLanguageToggle";
import { useMivvuPreviewLocale } from "@/components/mivvu/MivvuPreviewLocaleProvider";

function splitAirportName(name: string): { line1: string; line2: string | null } {
  const international = name.replace(
    / International Airport$/i,
    " International",
  );
  if (international.endsWith(" International")) {
    const base = international.slice(0, -" International".length);
    return { line1: `${base} International`, line2: "Airport" };
  }
  return { line1: name, line2: null };
}

function CheckIcon() {
  return (
    <svg
      className="mivvu-entry-check"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
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

export function MivvuAirportSelectionScreen() {
  const router = useRouter();
  const { messages } = useMivvuPreviewLocale();
  const searchId = useId();
  const listId = useId();
  const feedbackId = useId();
  const feedbackRef = useRef<HTMLParagraphElement>(null);

  const [query, setQuery] = useState("");
  const [selectedIata, setSelectedIata] =
    useState<MivvuEntryAirportIata>(MIVVU_ENTRY_DEFAULT_IATA);
  const [feedback, setFeedback] = useState<string | null>(null);

  const results = useMemo(
    () =>
      filterAirportSelectionCatalog(query, MIVVU_ENTRY_AIRPORT_CATALOG),
    [query],
  );

  const ctaLabel = selectedIata === "ICN" ? messages.exploreIcn : messages.exploreSfo;

  function handleSelect(entry: AirportCatalogEntry) {
    setSelectedIata(entry.iata as MivvuEntryAirportIata);
    setFeedback(null);
  }

  function handleExplore() {
    if (selectedIata === "ICN") {
      router.push("/preview/mivvu-entry/icn");
      return;
    }

    if (!isMivvuEntryBrowsable(selectedIata)) {
      setFeedback(messages.airportUnavailable);
      feedbackRef.current?.focus();
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    persistAirportSelection(today);
    router.push("/explore");
  }

  return (
    <div className="mivvu-entry-airport">
      <div className="mivvu-entry-airport-scroll">
        <header className="mivvu-entry-airport-header mivvu-entry-airport-header-row">
          <MivvuWordmark variant="header" />
          <MivvuLanguageToggle />
        </header>

        <div className="mivvu-entry-airport-hero">
          <h1 className="mivvu-entry-airport-title">{messages.airportTitle}</h1>
          <p className="mivvu-entry-airport-lead">{messages.airportLead}</p>
        </div>

        <div className="mivvu-entry-search-wrap">
          <label className="mivvu-entry-sr-only" htmlFor={searchId}>
            {messages.airportSearchLabel}
          </label>
          <div className="mivvu-entry-search">
            <SearchIcon />
            <input
              id={searchId}
              type="search"
              className="mivvu-entry-search-input gw-focus-ring"
              placeholder={messages.airportSearchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
              aria-controls={listId}
            />
          </div>
        </div>

        {results.length === 0 ? (
          <p className="mivvu-entry-empty" role="status">
            {messages.airportEmpty}
          </p>
        ) : (
          <ul
            id={listId}
            className="mivvu-entry-airport-list"
            role="radiogroup"
            aria-label={messages.airportRadiogroup}
          >
            {results.map((entry) => {
              const selected = selectedIata === entry.iata;
              const inputId = `mivvu-airport-${entry.iata}`;
              const { line1, line2 } = splitAirportName(entry.name);
              return (
                <li key={entry.iata}>
                  <label
                    htmlFor={inputId}
                    className={`mivvu-entry-airport-card gw-focus-ring ${
                      selected ? "mivvu-entry-airport-card-selected" : ""
                    }`}
                  >
                    <input
                      id={inputId}
                      type="radio"
                      name="mivvu-departure-airport"
                      className="mivvu-entry-radio"
                      value={entry.iata}
                      checked={selected}
                      onChange={() => handleSelect(entry)}
                    />
                    <span className="mivvu-entry-iata" aria-hidden="true">
                      {entry.iata}
                    </span>
                    <span className="mivvu-entry-airport-copy">
                      <span className="mivvu-entry-airport-name">
                        {line1}
                        {line2 ? (
                          <>
                            <br />
                            {line2}
                          </>
                        ) : null}
                      </span>
                      <span className="mivvu-entry-airport-city">{entry.city}</span>
                    </span>
                    {selected ? <CheckIcon /> : null}
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        {feedback ? (
          <p
            id={feedbackId}
            ref={feedbackRef}
            className="mivvu-entry-feedback"
            role="alert"
            tabIndex={-1}
          >
            {feedback}
          </p>
        ) : null}
      </div>

      <div className="mivvu-entry-cta-bar">
        <button
          type="button"
          className="mivvu-entry-cta gw-focus-ring"
          onClick={handleExplore}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
