"use client";

import { useMemo } from "react";
import type {
  Facility,
  FacilityDurationOverrideMap,
  FacilityFilterQuery,
  ProductionRecommendation,
  UserContext,
} from "@/types/airport";
import {
  productionTravelMatrixMetadata,
  productionTravelMinutes,
} from "@/data/travel-times";
import { buildRankedRecommendations } from "@/lib/recommendation-page-integration";
import { RecommendationStatusBadge } from "@/components/RecommendationStatusBadge";
import { formatSignedMinutes } from "@/lib/recommendation-present";
import {
  buildWhatIfInputSummary,
  compareRecommendationRuns,
  recommendationMarginMinutes,
  recommendationOutcomeLabel,
} from "@/lib/what-if-compare";
import { validateContext } from "@/lib/validate-context";
import { buildFlightContextInput } from "@/lib/browse-integration";
import {
  WHAT_IF_DEMO_MODE_OFF_NOTE,
  WHAT_IF_DEMO_MODE_ON_NOTE,
  WHAT_IF_DURATION_PRECEDENCE,
} from "@/lib/what-if-duration-copy";

export type WhatIfSimulatorProps = {
  enabled: boolean;
  baselineContext: UserContext;
  facilities: readonly Facility[];
  filter: FacilityFilterQuery;
  useDemoTimeEstimates: boolean;
  durationOverrides: FacilityDurationOverrideMap;
  baselineUsesLiveCountdown?: boolean;
  scenarioMinutesInput: string;
  scenarioQueueInput: string;
  bufferInput: string;
  onScenarioMinutesChange: (value: string) => void;
  onScenarioQueueChange: (value: string) => void;
};

function OutcomeChip({ recommendation }: { recommendation: ProductionRecommendation }) {
  return <RecommendationStatusBadge recommendation={recommendation} />;
}

function MarginLine({ recommendation }: { recommendation: ProductionRecommendation }) {
  const margin = recommendationMarginMinutes(recommendation);
  return (
    <p className="font-mono text-sm text-muted-foreground">
      {margin === null ? "Margin not modeled" : `Model margin: ${margin > 0 ? "+" : ""}${margin} min`}
    </p>
  );
}

export function WhatIfSimulator({
  enabled,
  baselineContext,
  facilities,
  filter,
  useDemoTimeEstimates,
  durationOverrides,
  baselineUsesLiveCountdown = false,
  scenarioMinutesInput,
  scenarioQueueInput,
  bufferInput,
  onScenarioMinutesChange,
  onScenarioQueueChange,
}: WhatIfSimulatorProps) {
  const scenarioContextResult = useMemo(
    () =>
      validateContext({
        ...buildFlightContextInput(scenarioMinutesInput, bufferInput),
        queueAdjustmentMinutes: scenarioQueueInput,
      }),
    [scenarioMinutesInput, scenarioQueueInput, bufferInput],
  );

  const scenarioValid = scenarioContextResult.context !== null;

  const baselineRecommendations = useMemo(() => {
    if (!enabled) return [];
    return buildRankedRecommendations({
      context: baselineContext,
      facilities,
      filter,
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates,
      durationOverrides,
    });
  }, [
    enabled,
    baselineContext,
    facilities,
    filter,
    useDemoTimeEstimates,
    durationOverrides,
  ]);

  const scenarioRecommendations = useMemo(() => {
    if (!enabled || !scenarioValid || !scenarioContextResult.context) {
      return [];
    }
    return buildRankedRecommendations({
      context: scenarioContextResult.context,
      facilities,
      filter,
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates,
      durationOverrides,
    });
  }, [
    enabled,
    scenarioValid,
    scenarioContextResult.context,
    facilities,
    filter,
    useDemoTimeEstimates,
    durationOverrides,
  ]);

  const comparisons = useMemo(() => {
    if (!scenarioValid || !scenarioContextResult.context) {
      return [];
    }
    if (baselineRecommendations.length === 0) {
      return [];
    }
    const inputSummary = buildWhatIfInputSummary(
      baselineContext,
      scenarioContextResult.context,
    );
    return compareRecommendationRuns(
      baselineRecommendations,
      scenarioRecommendations,
      inputSummary,
    );
  }, [
    baselineRecommendations,
    scenarioRecommendations,
    baselineContext,
    scenarioContextResult.context,
    scenarioValid,
  ]);

  if (!enabled) {
    return null;
  }

  const scenarioMinutesError = scenarioContextResult.errors.find(
    (error) => error.field === "minutesUntilBoarding",
  );
  const scenarioQueueError = scenarioContextResult.errors.find(
    (error) => error.field === "queueAdjustmentMinutes",
  );

  const baselineMinutes = baselineContext.minutesUntilBoarding;
  const scenarioMinutes = scenarioContextResult.context?.minutesUntilBoarding;

  return (
    <section
      className="gw-surface-card flex flex-col gap-4 p-4 sm:p-5"
      aria-label="What-if simulator"
      aria-labelledby="what-if-heading"
    >
      <header className="flex flex-col gap-2">
        <h2 id="what-if-heading" className="text-lg font-semibold text-card-foreground">
          What-if simulator
        </h2>
        <p className="text-sm text-muted-foreground">
          Compare baseline flight context with a fixed scenario. Both sides call
          the same{" "}
          <strong className="font-medium text-card-foreground">
            recommendFacilities
          </strong>{" "}
          engine with the same facility list and{" "}
          <strong className="font-medium text-card-foreground">
            personal time overrides
          </strong>{" "}
          (when valid). Per facility, durations resolve as:{" "}
          {WHAT_IF_DURATION_PRECEDENCE} (never zero-filled). Scenario controls
          change minutes until boarding and queue adjustment only — not your
          saved overrides.
        </p>
        {baselineUsesLiveCountdown ? (
          <p className="text-xs text-muted-foreground" role="note">
            Baseline minutes follow the live boarding countdown; scenario minutes
            use the fixed field below (not the clock).
          </p>
        ) : null}
        {useDemoTimeEstimates ? (
          <p className="text-xs text-muted-foreground" role="note">
            {WHAT_IF_DEMO_MODE_ON_NOTE}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground" role="note">
            {WHAT_IF_DEMO_MODE_OFF_NOTE}
          </p>
        )}
      </header>

      {scenarioValid && scenarioMinutes !== undefined ? (
        <div
          className="grid gap-3 rounded-lg border border-border bg-muted/20 p-3 sm:grid-cols-2"
          role="group"
          aria-label="Baseline versus scenario time budget"
        >
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Baseline
            </p>
            <p className="text-2xl font-bold tabular-nums text-card-foreground">
              {baselineMinutes}
              <span className="ml-1 text-sm font-semibold text-muted-foreground">
                min
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              {baselineUsesLiveCountdown
                ? "Live countdown (device clock)"
                : "Manual entry"}
            </p>
          </div>
          <div className="flex flex-col gap-1 border-t border-border pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Scenario
            </p>
            <p className="text-2xl font-bold tabular-nums text-card-foreground">
              {scenarioMinutes}
              <span className="ml-1 text-sm font-semibold text-muted-foreground">
                min
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Fixed what-if field (not the clock)
            </p>
            {scenarioMinutes !== baselineMinutes ? (
              <p className="text-sm font-medium text-card-foreground">
                Δ{" "}
                {formatSignedMinutes(scenarioMinutes - baselineMinutes)}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label
          className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground"
          htmlFor="whatif-scenario-minutes"
        >
          Scenario: minutes until boarding starts
          <input
            id="whatif-scenario-minutes"
            type="text"
            inputMode="numeric"
            className="gw-input gw-focus-ring"
            value={scenarioMinutesInput}
            onChange={(event) => onScenarioMinutesChange(event.target.value)}
            aria-invalid={Boolean(scenarioMinutesError)}
          />
          {scenarioMinutesError ? (
            <span className="text-sm text-destructive" role="alert">
              {scenarioMinutesError.message}
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground">
          Scenario: simulated queue adjustment (minutes)
          <input
            type="text"
            inputMode="numeric"
            className="gw-input gw-focus-ring"
            value={scenarioQueueInput}
            onChange={(event) => onScenarioQueueChange(event.target.value)}
            aria-invalid={Boolean(scenarioQueueError)}
          />
          <span className="text-xs font-normal text-muted-foreground">
            Added to modeled queue time (can be negative). Baseline keeps 0.
          </span>
          {scenarioQueueError ? (
            <span className="text-sm text-destructive" role="alert">
              {scenarioQueueError.message}
            </span>
          ) : null}
        </label>
      </div>

      <p className="rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
        <span className="font-medium text-card-foreground">Baseline inputs:</span>{" "}
        {baselineContext.minutesUntilBoarding} min until boarding, queue adjustment 0.
        {productionTravelMatrixMetadata.sameZoneLegNote}
      </p>

      {!scenarioValid ? (
        <p className="text-sm text-destructive" role="alert">
          Fix scenario inputs to compare results.
        </p>
      ) : null}

      {scenarioValid && comparisons.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No facilities match the current filters.
        </p>
      ) : null}

      <ul className="flex flex-col gap-4">
        {comparisons.map((comparison) => (
          <li
            key={comparison.facilityId}
            className="rounded-lg border border-border bg-card/50 p-4"
          >
            <h3 className="text-base font-semibold text-card-foreground">
              {comparison.facilityName}
            </h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Baseline
                </p>
                <OutcomeChip recommendation={comparison.baseline} />
                <MarginLine recommendation={comparison.baseline} />
                <p className="text-xs text-muted-foreground">
                  {recommendationOutcomeLabel(comparison.baseline).replaceAll("_", " ")}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Scenario
                </p>
                <OutcomeChip recommendation={comparison.scenario} />
                <MarginLine recommendation={comparison.scenario} />
                <p className="text-xs text-muted-foreground">
                  {recommendationOutcomeLabel(comparison.scenario).replaceAll("_", " ")}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-card-foreground">{comparison.explanation}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
