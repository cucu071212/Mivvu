"use client";

import { useEffect, useMemo, useState } from "react";
import type { Facility, GateLandmark } from "@/types/airport";
import {
  DEFAULT_BUFFER_MINUTES,
  SUPPORTED_AIRPORT_IATA,
  SUPPORTED_BOARDING_AREA_LABEL,
  SUPPORTED_TERMINAL_LABEL,
} from "@/types/airport";
import { AmenityFilter, type AmenityFilterValue } from "@/components/AmenityFilter";
import { FacilityBrowseCard } from "@/components/FacilityBrowseCard";
import { demoFacilities } from "@/data/fixtures/demo-facilities";
import {
  DEFAULT_DEMO_GATE_LANDMARK,
  DEFAULT_DEMO_MINUTES_UNTIL_BOARDING,
} from "@/data/fixtures/demo-context";

const GATE_LANDMARKS: GateLandmark[] = [
  "D1",
  "D4",
  "D7",
  "D9",
  "D15",
  "D16",
];

type FieldErrors = {
  minutesUntilBoarding?: string;
  bufferMinutes?: string;
};

function parseNonNegativeInt(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return null;
  }
  if (!/^-?\d+$/.test(trimmed)) {
    return null;
  }
  const value = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }
  return value;
}

function filterFacilitiesClient(
  facilities: Facility[],
  query: AmenityFilterValue,
): Facility[] {
  const text = query.text.trim().toLowerCase();
  const filtered = facilities.filter((facility) => {
    if (query.category && facility.category !== query.category) {
      return false;
    }
    if (text && !facility.name.toLowerCase().includes(text)) {
      const haystack = `${facility.locationDescription ?? ""} ${facility.nearestGateLandmark ?? ""}`.toLowerCase();
      if (!haystack.includes(text)) {
        return false;
      }
    }
    return true;
  });

  return [...filtered].sort((a, b) =>
    a.name.localeCompare(b.name, "en-US", { sensitivity: "base" }),
  );
}

export function GateWiseHome() {
  const [fixturesReady, setFixturesReady] = useState(false);
  const [minutesInput, setMinutesInput] = useState(
    String(DEFAULT_DEMO_MINUTES_UNTIL_BOARDING),
  );
  const [bufferInput, setBufferInput] = useState(String(DEFAULT_BUFFER_MINUTES));
  const [gateLandmark, setGateLandmark] = useState<GateLandmark>(
    DEFAULT_DEMO_GATE_LANDMARK,
  );
  const [filter, setFilter] = useState<AmenityFilterValue>({
    text: "",
    category: "",
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setFixturesReady(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  const validation = useMemo(() => {
    const nextErrors: FieldErrors = {};
    const minutes = parseNonNegativeInt(minutesInput);
    const buffer = parseNonNegativeInt(bufferInput);

    if (minutes === null) {
      nextErrors.minutesUntilBoarding =
        "Enter whole minutes until boarding starts (0 or more).";
    }
    if (buffer === null) {
      nextErrors.bufferMinutes =
        "Enter a whole-number safety buffer (0 or more).";
    }

    return {
      valid: Object.keys(nextErrors).length === 0,
      errors: nextErrors,
    };
  }, [minutesInput, bufferInput]);

  const contextValid = validation.valid;
  const errors = validation.errors;

  const visibleFacilities = useMemo(() => {
    if (!fixturesReady || !contextValid) {
      return [];
    }
    return filterFacilitiesClient(demoFacilities, filter);
  }, [fixturesReady, contextValid, filter]);

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
          Boarding-aware amenity browse (fixture data). Recommendations arrive in
          a later milestone.
        </p>
      </header>

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
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground">
            Minutes until boarding starts
            <input
              type="text"
              inputMode="numeric"
              className="gw-input gw-focus-ring"
              value={minutesInput}
              onChange={(event) => setMinutesInput(event.target.value)}
              aria-invalid={Boolean(errors.minutesUntilBoarding)}
              aria-describedby={
                errors.minutesUntilBoarding ? "minutes-error" : undefined
              }
            />
            {errors.minutesUntilBoarding ? (
              <span id="minutes-error" className="text-sm text-destructive" role="alert">
                {errors.minutesUntilBoarding}
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
              aria-invalid={Boolean(errors.bufferMinutes)}
              aria-describedby={
                errors.bufferMinutes ? "buffer-error" : undefined
              }
            />
            {errors.bufferMinutes ? (
              <span id="buffer-error" className="text-sm text-destructive" role="alert">
                {errors.bufferMinutes}
              </span>
            ) : null}
          </label>

        </div>
      </section>

      <AmenityFilter
        value={filter}
        onChange={setFilter}
        resultCount={contextValid && fixturesReady ? visibleFacilities.length : 0}
      />

      <section aria-labelledby="browse-heading" className="flex flex-col gap-3">
        <h2 id="browse-heading" className="text-base font-semibold text-foreground">
          Places in D Gates
        </h2>

        {!fixturesReady ? (
          <p className="gw-surface-card p-4 text-sm text-muted-foreground">
            Loading fixture amenities…
          </p>
        ) : null}

        {fixturesReady && !contextValid ? (
          <p className="gw-surface-card border-destructive/40 p-4 text-sm text-destructive" role="alert">
            Fix flight context errors above to browse amenities.
          </p>
        ) : null}

        {fixturesReady && contextValid && visibleFacilities.length === 0 ? (
          <p className="gw-surface-card p-4 text-sm text-muted-foreground">
            No fixtures match your filters. Try clearing search or choosing another
            category.
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
