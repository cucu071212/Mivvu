"use client";

import Link from "next/link";
import { AmenityCard } from "@/components/AmenityCard";
import { WhatIfSimulator } from "@/components/WhatIfSimulator";
import { useGateWiseSession } from "@/context/gatewise-session";
import { useSfoDemoAppHref } from "@/components/useSfoDemoAppHref";

export function RecommendationsScreen() {
  const session = useGateWiseSession();
  const flightHref = useSfoDemoAppHref("/flight");
  const exploreHref = useSfoDemoAppHref("/explore");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground sm:text-xl">
          Recommendations
        </h1>
        <p className="text-sm text-muted-foreground">
          Ranked by the shared time model. Each card shows how walking, queue,
          activity, and safety buffer consume your time budget — plus remaining
          margin when the model has complete inputs.
        </p>
        <p className="text-sm text-muted-foreground">
          Personal estimates and What-if use the same validation gates as baseline
          results.
        </p>
        <p className="text-xs text-muted-foreground">
          Baseline: {session.minutesInput} min · Buffer: {session.bufferInput}{" "}
          min · Demo: {session.demoEstimatesEnabled ? "on" : "off"}.{" "}
          <Link href={flightHref} className="font-medium underline">
            Edit on Flight
          </Link>
        </p>
      </header>

      <section
        aria-label="Ranked recommendations"
        aria-labelledby="recommendations-heading"
        className="flex flex-col gap-3"
      >
        <h2
          id="recommendations-heading"
          className="text-lg font-semibold text-foreground"
        >
          Ranked recommendations
        </h2>
        <p className="text-sm text-muted-foreground">
          Sorted by model outcome (feasible → tight → over budget → unknown →
          ineligible), then margin within each group.
        </p>

        {session.datasetValid && !session.contextValid ? (
          <p
            className="gw-surface-card border-destructive/40 p-4 text-sm text-destructive"
            role="alert"
          >
            Fix flight context on{" "}
            <Link href={flightHref} className="font-semibold underline">
              Flight
            </Link>{" "}
            to see recommendations.
          </p>
        ) : null}

        {session.datasetValid &&
        session.contextValid &&
        session.baselineRecoveryRequired ? (
          <p
            className="gw-surface-card border-destructive/40 p-4 text-sm text-destructive"
            role="alert"
          >
            Recommendations are paused until you restore your last manual minutes
            after the countdown stopped unexpectedly.{" "}
            <Link href={flightHref} className="font-semibold underline">
              Restore on Flight
            </Link>
          </p>
        ) : null}

        {session.datasetValid &&
        session.contextValid &&
        !session.personalizationUsable ? (
          <p
            className="gw-surface-card border-destructive/40 p-4 text-sm text-destructive"
            role="alert"
          >
            Recommendations are paused until personal estimate fields are valid
            or cleared. What-if uses the same rule so results stay consistent
            with the baseline.
          </p>
        ) : null}

        {session.datasetValid &&
        session.contextValid &&
        session.personalizationUsable &&
        !session.baselineRecoveryRequired &&
        session.recommendations.length === 0 ? (
          <p className="gw-surface-card p-4 text-sm text-muted-foreground">
            No places match your filters. Adjust search on{" "}
            <Link href={exploreHref} className="font-medium underline">
              Explore
            </Link>
            .
          </p>
        ) : null}

        <ul className="flex flex-col gap-4">
          {session.recommendations.map((recommendation) => {
            const facility = session.facilityById.get(recommendation.facilityId);
            return (
              <li key={recommendation.facilityId}>
                <AmenityCard
                  recommendation={recommendation}
                  facility={facility}
                  locationDescription={facility?.locationDescription}
                  nearestGateLandmark={facility?.nearestGateLandmark}
                  sourceUrl={facility?.sourceUrl}
                  lastCheckedAt={facility?.lastCheckedAt}
                  resolvedDurations={session.resolvedDurationsByFacilityId.get(
                    recommendation.facilityId,
                  )}
                />
              </li>
            );
          })}
        </ul>
      </section>

      {session.baselineContext ? (
        <WhatIfSimulator
          enabled={
            session.datasetValid &&
            session.contextValid &&
            session.personalizationUsable &&
            !session.baselineRecoveryRequired
          }
          baselineContext={session.baselineContext}
          facilities={session.facilities}
          filter={session.filterQuery}
          useDemoTimeEstimates={session.demoEstimatesEnabled}
          durationOverrides={session.durationOverrides}
          baselineUsesLiveCountdown={session.baselineUsesLiveCountdown}
          scenarioMinutesInput={session.scenarioMinutesInput}
          scenarioQueueInput={session.scenarioQueueInput}
          bufferInput={session.bufferInput}
          onScenarioMinutesChange={session.setScenarioMinutesInput}
          onScenarioQueueChange={session.setScenarioQueueInput}
        />
      ) : null}
    </div>
  );
}
