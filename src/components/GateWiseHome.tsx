"use client";

import { useMemo, useState } from "react";
import type {
  Facility,
  FacilityValidationError,
  GateLandmark,
} from "@/types/airport";
import {
  DEFAULT_BUFFER_MINUTES,
  SUPPORTED_AIRPORT_IATA,
  SUPPORTED_BOARDING_AREA_LABEL,
  SUPPORTED_TERMINAL_LABEL,
} from "@/types/airport";
import { AmenityFilter, type AmenityFilterValue } from "@/components/AmenityFilter";
import { FacilityBrowseCard } from "@/components/FacilityBrowseCard";
import {
  buildFacilityFilterQuery,
  buildFlightContextInput,
} from "@/lib/browse-integration";
import { filterFacilities } from "@/lib/filter-facilities";
import { validateContext } from "@/lib/validate-context";

const GATE_LANDMARKS: GateLandmark[] = [
  "D1",
  "D4",
  "D7",
  "D9",
  "D15",
  "D16",
];

const DEFAULT_MINUTES_UNTIL_BOARDING = 50;

export type GateWiseHomeProps = {
  facilities: Facility[];
  datasetErrors: FacilityValidationError[];
};

function contextErrorMessage(
  field: "minutesUntilBoarding" | "bufferMinutes",
  errors: { field: string; message: string }[],
): string | undefined {
  return errors.find((error) => error.field === field)?.message;
}

export function GateWiseHome({ facilities, datasetErrors }: GateWiseHomeProps) {
  const [minutesInput, setMinutesInput] = useState(
    String(DEFAULT_MINUTES_UNTIL_BOARDING),
  );
  const [bufferInput, setBufferInput] = useState(String(DEFAULT_BUFFER_MINUTES));
  const [gateLandmark, setGateLandmark] = useState<GateLandmark>("D1");
  const [filter, setFilter] = useState<AmenityFilterValue>({
    text: "",
    category: "",
  });

  const datasetValid = datasetErrors.length === 0;

  const contextResult = useMemo(
    () =>
      validateContext(buildFlightContextInput(minutesInput, bufferInput)),
    [minutesInput, bufferInput],
  );

  const contextValid = contextResult.context !== null;
  const minutesError = contextErrorMessage(
    "minutesUntilBoarding",
    contextResult.errors,
  );
  const bufferError = contextErrorMessage("bufferMinutes", contextResult.errors);

  const visibleFacilities = useMemo(() => {
    if (!datasetValid || !contextValid) {
      return [];
    }
    return filterFacilities(
      facilities,
      buildFacilityFilterQuery(filter.text, filter.category),
    );
  }, [datasetValid, contextValid, facilities, filter]);

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-4 py-8 pb-16 sm:px-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {SUPPORTED_AIRPORT_IATA} · {SUPPORTED_TERMINAL_LABEL} ·{" "}
          {SUPPORTED_BOARDING_AREA_LABEL}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          GateWise
        </h1>
        <p className="text-base text-muted-foreground">
          Browse verified Terminal 2 D Gates amenities. Boarding-time
          recommendations arrive in a later milestone.
        </p>
      </header>

      {!datasetValid ? (
        <p
          className="gw-surface-card border-destructive/40 p-4 text-sm text-destructive"
          role="alert"
        >
          Facility data failed validation ({datasetErrors.length} issue
          {datasetErrors.length === 1 ? "" : "s"}). Browsing is unavailable until
          the dataset is repaired.
        </p>
      ) : null}

      <section
        className="gw-surface-card flex flex-col gap-4 p-4"
        aria-labelledby="flight-context-heading"
      >
        <h2
          id="flight-context-heading"
          className="text-base font-semibold text-card-foreground"
        >
          Flight context
        </h2>
        <p className="text-sm text-muted-foreground">
          Minutes until <strong className="font-semibold text-card-foreground">boarding begins</strong> — not gate closure.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground sm:col-span-2">
            Boarding area
            <input
              className="gw-input bg-muted text-muted-foreground"
              value={`Zone D — ${SUPPORTED_BOARDING_AREA_LABEL}`}
              readOnly
              aria-readonly="true"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground">
            Your gate area (landmark)
            <select
              className="gw-input gw-focus-ring"
              value={gateLandmark}
              onChange={(event) =>
                setGateLandmark(event.target.value as GateLandmark)
              }
            >
              {GATE_LANDMARKS.map((gate) => (
                <option key={gate} value={gate}>
                  Near Gate {gate}
                </option>
              ))}
            </select>
            <span className="text-xs font-normal text-muted-foreground">
              Landmark for orientation only; not used for filtering yet.
            </span>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground">
            Minutes until boarding starts
            <input
              type="text"
              inputMode="numeric"
              className="gw-input gw-focus-ring"
              value={minutesInput}
              onChange={(event) => setMinutesInput(event.target.value)}
              aria-invalid={Boolean(minutesError)}
              aria-describedby={minutesError ? "minutes-error" : undefined}
            />
            {minutesError ? (
              <span id="minutes-error" className="text-sm text-destructive" role="alert">
                {minutesError}
              </span>
            ) : null}
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground">
            Safety buffer (minutes)
            <input
              type="text"
              inputMode="numeric"
              className="gw-input gw-focus-ring"
              value={bufferInput}
              onChange={(event) => setBufferInput(event.target.value)}
              aria-invalid={Boolean(bufferError)}
              aria-describedby={bufferError ? "buffer-error" : undefined}
            />
            {bufferError ? (
              <span id="buffer-error" className="text-sm text-destructive" role="alert">
                {bufferError}
              </span>
            ) : null}
          </label>
        </div>
      </section>

      <AmenityFilter
        value={filter}
        onChange={setFilter}
        resultCount={datasetValid && contextValid ? visibleFacilities.length : 0}
        disabled={!datasetValid || !contextValid}
      />

      <section aria-labelledby="browse-heading" className="flex flex-col gap-3">
        <h2 id="browse-heading" className="text-base font-semibold text-foreground">
          Places in D Gates
        </h2>

        {datasetValid && !contextValid ? (
          <p
            className="gw-surface-card border-destructive/40 p-4 text-sm text-destructive"
            role="alert"
          >
            Fix flight context errors above to browse amenities.
          </p>
        ) : null}

        {datasetValid && contextValid && visibleFacilities.length === 0 ? (
          <p className="gw-surface-card p-4 text-sm text-muted-foreground">
            No places match your filters. Search matches{" "}
            <strong className="font-medium text-foreground">facility names only</strong>
            — try another name or clear the category filter.
          </p>
        ) : null}

        <ul className="flex flex-col gap-3">
          {visibleFacilities.map((facility) => (
            <li key={facility.id}>
              <FacilityBrowseCard facility={facility} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
