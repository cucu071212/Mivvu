"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useGateWiseSession } from "@/context/gatewise-session";
import {
  listTwoStopEligibleFacilities,
  runTwoStopPlannerEvaluation,
  travelPolicyFromDemoOptIn,
} from "@/lib/two-stop-planner-integration";
import {
  guidanceForUnknownPair,
  pairHasUnknownItinerary,
} from "@/lib/two-stop-unknown-guidance";
import {
  TWO_STOP_DEMO_TRAVEL_DISCLAIMER,
  twoStopIneligibilityLabel,
} from "@/lib/two-stop-present";
import type { TwoStopIneligibilityReason } from "@/types/two-stop-plan";
import { TwoStopDemoSetupPanel } from "@/components/TwoStopDemoSetupPanel";
import { TwoStopUnknownGuidanceBanner } from "@/components/TwoStopUnknownGuidanceBanner";
import { TwoStopOrderPanel } from "@/components/TwoStopOrderPanel";

const DEMO_TRAVEL_CHECKBOX_ID = "two-stop-demo-travel";

export function TwoStopPlannerDemo() {
  const session = useGateWiseSession();
  const [stopAId, setStopAId] = useState("");
  const [stopBId, setStopBId] = useState("");
  const [demoLegacyTravelEnabled, setDemoLegacyTravelEnabled] = useState(false);

  const eligible = useMemo(
    () => listTwoStopEligibleFacilities(session.facilities),
    [session.facilities],
  );

  const travelPolicy = travelPolicyFromDemoOptIn(demoLegacyTravelEnabled);

  const plannerState = useMemo(() => {
    if (!session.contextValid || !session.baselineContext) {
      return { phase: "context-invalid" as const };
    }
    return runTwoStopPlannerEvaluation({
      context: session.baselineContext,
      stopAId,
      stopBId,
      facilitiesById: session.facilityById,
      resolvedByFacilityId: session.resolvedDurationsByFacilityId,
      travelPolicy,
    });
  }, [
    session.contextValid,
    session.baselineContext,
    stopAId,
    stopBId,
    session.facilityById,
    session.resolvedDurationsByFacilityId,
    travelPolicy,
  ]);

  const unknownGuidance = useMemo(() => {
    if (plannerState.phase !== "ready") return [];
    if (!pairHasUnknownItinerary(plannerState.evaluation)) return [];
    return guidanceForUnknownPair(
      plannerState.evaluation,
      session.demoEstimatesEnabled,
    );
  }, [plannerState, session.demoEstimatesEnabled]);

  const facilityName = (id: string) =>
    session.facilityById.get(id)?.name ?? id;

  const stopAName = stopAId ? facilityName(stopAId) : "Stop A";
  const stopBName = stopBId ? facilityName(stopBId) : "Stop B";

  return (
    <div className="flex flex-col gap-4">
      <TwoStopDemoSetupPanel
        demoQueueActivityEnabled={session.demoEstimatesEnabled}
        illustrativeTravelEnabled={demoLegacyTravelEnabled}
      />

      <section
        className="gw-surface-card flex flex-col gap-3 p-4 sm:p-5"
        aria-labelledby="two-stop-context-heading"
      >
        <h2 id="two-stop-context-heading" className="text-base font-semibold">
          Flight context (shared)
        </h2>
        <p className="text-sm text-muted-foreground">
          Minutes until boarding starts and safety buffer come from{" "}
          <Link href="/flight" className="font-medium text-primary underline">
            Flight
          </Link>
          . Personal overrides on Results apply here too.
        </p>
        {session.contextValid && session.baselineContext ? (
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Until boarding starts</dt>
              <dd className="font-medium">
                {session.baselineContext.minutesUntilBoarding} min
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Safety buffer</dt>
              <dd className="font-medium">
                {session.baselineContext.bufferMinutes} min (once per itinerary)
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-destructive" role="alert">
            Fix time inputs on Flight before planning two stops.
          </p>
        )}
      </section>

      <section
        className="gw-surface-card flex flex-col gap-4 p-4 sm:p-5"
        aria-labelledby="two-stop-select-heading"
      >
        <h2 id="two-stop-select-heading" className="text-base font-semibold">
          Choose two stops
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="two-stop-a" className="text-sm font-medium">
              First facility (picker)
            </label>
            <select
              id="two-stop-a"
              className="min-h-11 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={stopAId}
              onChange={(event) => setStopAId(event.target.value)}
            >
              <option value="">Select…</option>
              {eligible.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="two-stop-b" className="text-sm font-medium">
              Second facility (picker)
            </label>
            <select
              id="two-stop-b"
              className="min-h-11 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={stopBId}
              onChange={(event) => setStopBId(event.target.value)}
            >
              <option value="">Select…</option>
              {eligible.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
          <div className="flex items-start gap-3 text-sm">
            <input
              id={DEMO_TRAVEL_CHECKBOX_ID}
              type="checkbox"
              className="mt-1 size-4 shrink-0 rounded border-input"
              checked={demoLegacyTravelEnabled}
              onChange={(event) => setDemoLegacyTravelEnabled(event.target.checked)}
              aria-describedby="two-stop-travel-disclaimer"
            />
            <div className="flex flex-col gap-1">
              <label
                htmlFor={DEMO_TRAVEL_CHECKBOX_ID}
                className="cursor-pointer font-medium text-card-foreground"
              >
                Use illustrative D-Gates travel times (demo only)
              </label>
              <p
                id="two-stop-travel-disclaimer"
                className="text-muted-foreground"
              >
                {TWO_STOP_DEMO_TRAVEL_DISCLAIMER}
              </p>
            </div>
          </div>
        </div>

        {!demoLegacyTravelEnabled ? (
          <p className="text-sm text-muted-foreground" role="note">
            Strict travel policy: walking between two facilities is not modeled, so
            results stay Unknown until you opt in to illustrative D→D demo legs.
          </p>
        ) : null}
      </section>

      {plannerState.phase === "incomplete" ? (
        <p className="text-sm text-muted-foreground">{plannerState.message}</p>
      ) : null}

      {plannerState.phase === "ready" ? (
        <section
          className="flex flex-col gap-4"
          aria-labelledby="two-stop-compare-heading"
        >
          <h2 id="two-stop-compare-heading" className="text-base font-semibold">
            Compare visit orders
          </h2>
          {plannerState.validation ? (
            <p className="text-sm text-destructive" role="alert">
              Selection cannot be modeled:{" "}
              {twoStopIneligibilityLabel(
                plannerState.validation as TwoStopIneligibilityReason,
              )}
            </p>
          ) : null}
          <TwoStopUnknownGuidanceBanner items={unknownGuidance} />
          <div className="grid gap-4 lg:grid-cols-2">
            <TwoStopOrderPanel
              orderLabel={`${stopAName} → ${stopBName}`}
              firstStopName={stopAName}
              secondStopName={stopBName}
              result={plannerState.evaluation.orderAB}
              travelPolicy={plannerState.evaluation.travelPolicy}
              isBestOrder={plannerState.evaluation.bestModeledOrder === "AB"}
              idPrefix="two-stop-ab"
            />
            <TwoStopOrderPanel
              orderLabel={`${stopBName} → ${stopAName}`}
              firstStopName={stopBName}
              secondStopName={stopAName}
              result={plannerState.evaluation.orderBA}
              travelPolicy={plannerState.evaluation.travelPolicy}
              isBestOrder={plannerState.evaluation.bestModeledOrder === "BA"}
              idPrefix="two-stop-ba"
            />
          </div>
          {plannerState.evaluation.bestModeledOrder === null ? (
            <p className="text-sm text-muted-foreground" role="note">
              No modeled “better” order — both itineraries lack complete timing or are
              ineligible.
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground" role="note">
            {plannerState.evaluation.modelDisclaimer}
          </p>
        </section>
      ) : null}
    </div>
  );
}
