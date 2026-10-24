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
import {
  productionTravelMatrixMetadata,
  productionTravelMinutes,
} from "@/data/travel-times";
import { AmenityCard } from "@/components/AmenityCard";
import { AmenityFilter, type AmenityFilterValue } from "@/components/AmenityFilter";
import {
  buildFacilityFilterQuery,
  buildFlightContextInput,
} from "@/lib/browse-integration";
import { buildRankedRecommendations } from "@/lib/recommendation-page-integration";
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
  const [demoEstimatesEnabled, setDemoEstimatesEnabled] = useState(false);
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

  const filterQuery = useMemo(
    () => buildFacilityFilterQuery(filter.text, filter.category),
    [filter],
  );

  const recommendations = useMemo(() => {
    if (!datasetValid || !contextValid || !contextResult.context) {
      return [];
    }
    return buildRankedRecommendations({
      context: contextResult.context,
      facilities,
      filter: filterQuery,
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: demoEstimatesEnabled,
    });
  }, [
    datasetValid,
    contextValid,
    contextResult.context,
    facilities,
    filterQuery,
    demoEstimatesEnabled,
  ]);

  const facilityById = useMemo(
    () => new Map(facilities.map((facility) => [facility.id, facility])),
    [facilities],
  );

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
          Boarding-start recommendations for verified Terminal 2 D Gates
          amenities. Status labels describe the in-app time model only — not a
          guarantee you will board on time.
        </p>
      </header>

      {!datasetValid ? (
        <p
          className="gw-surface-card border-destructive/40 p-4 text-sm text-destructive"
          role="alert"
        >
          Facility data failed validation ({datasetErrors.length} issue
          {datasetErrors.length === 1 ? "" : "s"}). Recommendations are unavailable
          until the dataset is repaired.
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
              Landmark for orientation only; not used in the time model yet.
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

          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-border bg-muted/30 p-3 gw-focus-ring">
              <input
                type="checkbox"
                className="mt-1 size-4 shrink-0 accent-primary"
                checked={demoEstimatesEnabled}
                onChange={(event) => setDemoEstimatesEnabled(event.target.checked)}
                aria-describedby="demo-estimates-help"
              />
              <span className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-card-foreground">
                  Demo estimates for wait &amp; activity times
                </span>
                <span id="demo-estimates-help" className="text-muted-foreground">
                  Off (default): official records keep unknown queue/activity
                  durations. On: temporary in-memory demo values (8 min queue, 10
                  min activity) labeled{" "}
                  <strong className="font-medium text-card-foreground">
                    demo_estimate
                  </strong>
                  . Does not change facilities.json.
                </span>
              </span>
            </label>
            <p className="text-xs text-muted-foreground" role="note">
              {productionTravelMatrixMetadata.disclaimer}
            </p>
            {demoEstimatesEnabled ? (
              <p
                className="rounded-md border border-[var(--gw-status-tight-border)] bg-[var(--gw-status-tight-bg)] p-3 text-sm text-[var(--gw-status-tight-fg)]"
                role="status"
              >
                Demo mode is on: queue, activity, and D→D walk legs use labeled
                demo estimates so you can explore feasible / tight / over-budget
                outcomes. These are simulated scenarios, not measured SFO times.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <AmenityFilter
        value={filter}
        onChange={setFilter}
        resultCount={datasetValid && contextValid ? recommendations.length : 0}
        disabled={!datasetValid || !contextValid}
      />

      <section
        aria-labelledby="recommendations-heading"
        className="flex flex-col gap-3"
      >
        <h2
          id="recommendations-heading"
          className="text-base font-semibold text-foreground"
        >
          Ranked recommendations
        </h2>
        <p className="text-sm text-muted-foreground">
          Sorted by model outcome (feasible → tight → over budget → unknown →
          ineligible), then margin within each group.
        </p>

        {datasetValid && !contextValid ? (
          <p
            className="gw-surface-card border-destructive/40 p-4 text-sm text-destructive"
            role="alert"
          >
            Fix flight context errors above to see recommendations.
          </p>
        ) : null}

        {datasetValid && contextValid && recommendations.length === 0 ? (
          <p className="gw-surface-card p-4 text-sm text-muted-foreground">
            No places match your filters. Search matches{" "}
            <strong className="font-medium text-foreground">facility names only</strong>
            — try another name or clear the category filter.
          </p>
        ) : null}

        <ul className="flex flex-col gap-4">
          {recommendations.map((recommendation) => {
            const facility = facilityById.get(recommendation.facilityId);
            return (
              <li key={recommendation.facilityId}>
                <AmenityCard
                  recommendation={recommendation}
                  locationDescription={facility?.locationDescription}
                  nearestGateLandmark={facility?.nearestGateLandmark}
                  sourceUrl={facility?.sourceUrl}
                  lastCheckedAt={facility?.lastCheckedAt}
                />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
