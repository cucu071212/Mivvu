"use client";

import { useId, useMemo, useState } from "react";
import { SUPPORTED_AIRPORT_IATA } from "@/types/airport";
import {
  isAirportCatalogSelectable,
  type AirportCatalogEntry,
} from "@/data/airport-selection-catalog";
import { useAirportSelection } from "@/context/airport-selection";
import { filterAirportSelectionCatalog } from "@/lib/filter-airport-selection-catalog";

function availabilityLabel(entry: AirportCatalogEntry): string {
  return entry.availability === "available" ? "Available" : "Coming soon";
}

export function WelcomeAirportScreen() {
  const { storageAvailable, completeSelection } = useAirportSelection();
  const searchId = useId();
  const listId = useId();
  const unavailableNoteId = useId();

  const [query, setQuery] = useState("");
  const [selectedIata, setSelectedIata] = useState(SUPPORTED_AIRPORT_IATA);
  const [unavailableMessage, setUnavailableMessage] = useState<string | null>(
    null,
  );

  const results = useMemo(
    () => filterAirportSelectionCatalog(query),
    [query],
  );

  const canContinue = selectedIata === SUPPORTED_AIRPORT_IATA;

  function handleSelect(entry: AirportCatalogEntry) {
    setSelectedIata(entry.iata);
    if (isAirportCatalogSelectable(entry)) {
      setUnavailableMessage(null);
      return;
    }
    setUnavailableMessage(
      `${entry.name} (${entry.iata}) is not available in GateWise yet. Only ${SUPPORTED_AIRPORT_IATA} has verified amenity and demo travel-time data today. Selecting Continue requires San Francisco.`,
    );
  }

  return (
    <div className="gw-welcome-airport">
      <main
        className="gw-welcome-airport-inner gw-welcome-airport-inner-wide"
        aria-labelledby="gw-welcome-airport-title"
      >
        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            GateWise · Welcome
          </p>
          <div className="gw-brand-mark">
            <span className="gw-brand-icon" aria-hidden="true">GW</span>
            <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              GateWise
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-1">
          <h1
            id="gw-welcome-airport-title"
            className="text-2xl font-bold tracking-tight text-card-foreground sm:text-3xl"
          >
            Where are you flying from?
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Choose your airport to discover amenities and make the most of your
            time before boarding.
          </p>
        </div>

        <section
          className="gw-welcome-coverage"
          aria-labelledby="gw-welcome-coverage-heading"
        >
          <h2
            id="gw-welcome-coverage-heading"
            className="text-sm font-semibold text-card-foreground"
          >
            Starting with San Francisco.
          </h2>
          <p className="text-sm text-muted-foreground">
            GateWise currently supports San Francisco International Airport (
            {SUPPORTED_AIRPORT_IATA}). More airports are planned as verified
            amenity and travel-time data becomes available. Walking times in the
            app are demo estimates — not measured indoor routing.
          </p>
        </section>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-card-foreground" htmlFor={searchId}>
            Search airports
          </label>
          <input
            id={searchId}
            type="search"
            className="gw-input gw-focus-ring min-h-11 w-full"
            placeholder="Code, name, or city — e.g. SFO, Los Angeles"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            aria-controls={listId}
          />
        </div>

        <fieldset className="gw-airport-selection-fieldset">
          <legend className="text-sm font-medium text-card-foreground">
            Airport directory
          </legend>
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground" role="status">
              No airports match your search. Try a code, city, or airport name.
            </p>
          ) : (
            <ul id={listId} className="gw-airport-catalog-list" role="radiogroup" aria-label="Airports">
              {results.map((entry) => {
                const selectable = isAirportCatalogSelectable(entry);
                const selected = selectedIata === entry.iata;
                const inputId = `gw-airport-option-${entry.iata}`;
                return (
                  <li key={entry.iata}>
                    <label
                      className={`gw-airport-catalog-item gw-focus-ring ${
                        selected ? "gw-airport-catalog-item-selected" : ""
                      } ${!selectable ? "gw-airport-catalog-item-unavailable" : ""}`}
                      htmlFor={inputId}
                    >
                      <input
                        id={inputId}
                        type="radio"
                        name="departure-airport"
                        className="gw-focus-ring mt-1 shrink-0"
                        value={entry.iata}
                        checked={selected}
                        onChange={() => handleSelect(entry)}
                        aria-describedby={
                          !selectable ? unavailableNoteId : undefined
                        }
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-card-foreground">
                            {entry.iata}
                          </span>
                          <span
                            className={
                              selectable
                                ? "gw-status-chip gw-status-feasible text-xs"
                                : "gw-status-chip gw-status-ineligible text-xs"
                            }
                          >
                            {availabilityLabel(entry)}
                          </span>
                        </span>
                        <span className="text-sm font-medium text-card-foreground">
                          {entry.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {entry.city}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </fieldset>

        {unavailableMessage ? (
          <p
            id={unavailableNoteId}
            className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground"
            role="status"
          >
            {unavailableMessage}
          </p>
        ) : null}

        <ul className="gw-airport-selection-orientation text-sm text-muted-foreground">
          <li>12 facilities participate in ranked recommendations (T2 D Gates).</li>
          <li>26 facilities are available for browse-only discovery across SFO.</li>
          <li>No live flight feeds or guaranteed future airport launch dates.</li>
        </ul>

        {!storageAvailable ? (
          <p className="text-sm text-muted-foreground" role="note">
            Browser storage is unavailable. You can continue now; this screen may
            appear again on your next visit.
          </p>
        ) : null}

        <button
          type="button"
          className="gw-focus-ring gw-btn-primary min-h-11 w-full sm:w-auto"
          onClick={completeSelection}
          disabled={!canContinue}
          aria-disabled={!canContinue}
        >
          Continue to Flight dashboard
        </button>
        {!canContinue ? (
          <p className="text-sm text-muted-foreground" role="note">
            Select San Francisco ({SUPPORTED_AIRPORT_IATA}) to enter the app.
          </p>
        ) : null}
      </main>
    </div>
  );
}
