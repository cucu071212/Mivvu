"use client";

import {
  GATE_LANDMARKS,
  useGateWiseSession,
} from "@/context/gatewise-session";
import { FlightHeroPass } from "@/components/FlightHeroPass";
import {
  SUPPORTED_AIRPORT_IATA,
  SUPPORTED_BOARDING_AREA_LABEL,
  SUPPORTED_TERMINAL_LABEL,
  type GateLandmark,
} from "@/types/airport";
import { productionTravelMatrixMetadata } from "@/data/travel-times";
import Link from "next/link";
import { useSfoDemoAppHref } from "@/components/useSfoDemoAppHref";

export function FlightScreen() {
  const session = useGateWiseSession();
  const exploreHref = useSfoDemoAppHref("/explore");
  const recommendationsHref = useSfoDemoAppHref("/recommendations");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground sm:text-xl">
        Flight context
      </h1>

      {!session.datasetValid ? (
        <p
          className="gw-surface-card border-destructive/40 p-4 text-sm text-destructive"
          role="alert"
        >
          Facility data failed validation ({session.datasetErrors.length} issue
          {session.datasetErrors.length === 1 ? "" : "s"}). Recommendations are
          unavailable until the dataset is repaired.
        </p>
      ) : null}

      <FlightHeroPass
        minutesUntilBoarding={
          session.contextResult.context?.minutesUntilBoarding ?? null
        }
        bufferMinutes={session.contextResult.context?.bufferMinutes ?? null}
        gateLandmark={session.gateLandmark}
        demoEstimatesEnabled={session.demoEstimatesEnabled}
        baselineUsesLiveCountdown={session.baselineUsesLiveCountdown}
        countdownPaused={session.countdownPaused}
        boardingStarted={session.boardingStartedForStrip}
        contextValid={session.contextValid}
        airportLabel={SUPPORTED_AIRPORT_IATA}
        terminalLabel={SUPPORTED_TERMINAL_LABEL}
        zoneLabel={SUPPORTED_BOARDING_AREA_LABEL}
        actions={[
          { href: exploreHref, label: "Explore amenities", variant: "secondary" },
          {
            href: recommendationsHref,
            label: "View recommendations",
            variant: "primary",
          },
        ]}
      />

      <div className="gw-surface-card grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
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
            value={session.gateLandmark}
            onChange={(event) =>
              session.setGateLandmark(event.target.value as GateLandmark)
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

        {session.baselineRecoveryRequired ? (
          <div
            className="gw-surface-card flex flex-col gap-3 border-destructive/40 p-4 sm:col-span-2"
            role="alert"
          >
            <p className="text-sm text-destructive">
              {session.baselineRecoveryMessage}
            </p>
            <p className="text-sm text-muted-foreground">
              Your last manual budget ({session.preservedManualMinutes} min) was
              not restored automatically. Confirm below to use it again for
              recommendations.
            </p>
            <button
              type="button"
              className="gw-focus-ring min-h-11 self-start rounded-md border-2 border-[var(--gw-primary)] bg-[var(--gw-primary)] px-3 py-2 text-sm font-semibold text-[var(--gw-on-primary)] hover:bg-[var(--gw-primary-hover)]"
              onClick={session.handleRestoreManualBaseline}
            >
              Restore last manual minutes ({session.preservedManualMinutes})
            </button>
          </div>
        ) : null}

        <p className="text-sm text-muted-foreground sm:col-span-2" role="note">
          Boarding countdown controls are above this form and stay active when you
          leave this page.
        </p>

        <label
          className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground"
          htmlFor="baseline-minutes-until-boarding"
        >
          Baseline: minutes until boarding starts
          {session.baselineUsesLiveCountdown ? (
            <span
              id="baseline-countdown-hint"
              className="text-xs font-normal text-muted-foreground"
            >
              Updated from device-clock countdown (baseline). What-if scenario
              minutes stay separate on Results.
            </span>
          ) : null}
          <input
            id="baseline-minutes-until-boarding"
            type="text"
            inputMode="numeric"
            className="gw-input gw-focus-ring disabled:cursor-not-allowed disabled:bg-muted/50"
            value={session.minutesInput}
            onChange={(event) => {
              const nextMinutes = event.target.value;
              session.setMinutesInput(nextMinutes);
              session.syncPreservedManualFromDrafts(
                nextMinutes,
                session.bufferInput,
              );
            }}
            readOnly={session.baselineUsesLiveCountdown}
            aria-readonly={session.baselineUsesLiveCountdown}
            aria-invalid={Boolean(session.minutesError)}
            aria-describedby={
              [
                session.baselineUsesLiveCountdown
                  ? "baseline-countdown-hint"
                  : null,
                session.minutesError ? "minutes-error" : null,
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
          />
          {session.minutesError ? (
            <span
              id="minutes-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {session.minutesError}
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground">
          Safety buffer (minutes)
          <input
            type="text"
            inputMode="numeric"
            className="gw-input gw-focus-ring"
            value={session.bufferInput}
            onChange={(event) => {
              const nextBuffer = event.target.value;
              session.setBufferInput(nextBuffer);
              session.syncPreservedManualFromDrafts(
                session.minutesInput,
                nextBuffer,
              );
            }}
            aria-invalid={Boolean(session.bufferError)}
            aria-describedby={
              session.bufferError ? "buffer-error" : undefined
            }
          />
          {session.bufferError ? (
            <span
              id="buffer-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {session.bufferError}
            </span>
          ) : null}
        </label>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-border bg-muted/30 p-3 gw-focus-ring">
            <input
              type="checkbox"
              className="mt-1 size-4 shrink-0 accent-primary"
              checked={session.demoEstimatesEnabled}
              onChange={(event) =>
                session.setDemoEstimatesEnabled(event.target.checked)
              }
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
          {session.demoEstimatesEnabled ? (
            <p
              className="rounded-md border border-[var(--gw-status-tight-border)] bg-[var(--gw-status-tight-bg)] p-3 text-sm text-[var(--gw-status-tight-fg)]"
              role="status"
            >
              Demo mode is on: queue, activity, and D→D walk legs use labeled demo
              estimates so you can explore feasible / tight / over-budget
              outcomes. These are simulated scenarios, not measured SFO times.
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={exploreHref} className="gw-btn-primary no-underline">
          Explore amenities
        </Link>
        <Link
          href={recommendationsHref}
          className="gw-focus-ring inline-flex min-h-11 items-center rounded-md border border-border bg-card px-4 text-sm font-semibold text-card-foreground no-underline hover:border-primary"
        >
          View results
        </Link>
      </div>
    </div>
  );
}
