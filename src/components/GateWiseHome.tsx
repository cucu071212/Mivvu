"use client";

/**
 * Test / legacy harness: shared session with in-memory route switching.
 * Production navigation uses Next.js App Router pages under `src/app/(app)`.
 */
import { useMemo, useState } from "react";
import type { Facility, FacilityValidationError } from "@/types/airport";
import { GateWiseSessionProvider } from "@/context/gatewise-session";
import { BoardingCountdownControls } from "@/components/BoardingCountdownControls";
import { FlightScreen } from "@/components/screens/FlightScreen";
import { ExploreScreen } from "@/components/screens/ExploreScreen";
import { RecommendationsScreen } from "@/components/screens/RecommendationsScreen";
import { PlanScreen } from "@/components/screens/PlanScreen";
import { PersonalizedTimeControls } from "@/components/PersonalizedTimeControls";
import { APP_ROUTES, type AppRouteHref, isAppRouteActive } from "@/lib/app-routes";
import { useGateWiseSession } from "@/context/gatewise-session";

export type GateWiseHomeProps = {
  facilities: Facility[];
  datasetErrors: FacilityValidationError[];
  /** Initial harness route for tests (defaults to Flight). */
  initialPath?: AppRouteHref;
};

function HarnessShell({ initialPath }: { initialPath: AppRouteHref }) {
  const [path, setPath] = useState<AppRouteHref>(initialPath);
  const session = useGateWiseSession();

  const screen = useMemo(() => {
    switch (path) {
      case "/explore":
        return <ExploreScreen />;
      case "/recommendations":
        return <RecommendationsScreen />;
      case "/plan":
        return <PlanScreen />;
      default:
        return <FlightScreen />;
    }
  }, [path]);

  return (
    <div className="gw-app-shell">
      <nav aria-label="Primary" className="px-4 pt-4">
        <ul className="flex flex-wrap gap-2">
          {APP_ROUTES.map((route) => {
            const active = isAppRouteActive(path, route.href);
            return (
              <li key={route.href}>
                <button
                  type="button"
                  className={`gw-app-nav-link ${active ? "gw-app-nav-link-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setPath(route.href)}
                >
                  {route.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className={
          path === "/"
            ? "gw-countdown-host gw-countdown-host-flight"
            : "gw-countdown-host gw-countdown-host-dock"
        }
      >
        <BoardingCountdownControls
          state={session.countdownState}
          onStateChange={session.setCountdownState}
          onBaselineMinutesChange={session.handleBaselineMinutesFromCountdown}
          preservedManualMinutes={session.preservedManualMinutes}
          onCountdownExit={session.handleCountdownExit}
          disabled={!session.datasetValid}
        />
        {path !== "/" && session.baselineUsesLiveCountdown ? (
          <p className="gw-countdown-dock-note" role="status">
            Live countdown continues while you browse. Open Flight to pause or
            clear.
          </p>
        ) : null}
      </div>

      <main className="gw-app-main">
        {session.datasetValid ? (
          <div
            className={path === "/recommendations" ? "mb-6" : undefined}
            hidden={path !== "/recommendations"}
            aria-hidden={path !== "/recommendations"}
          >
            <PersonalizedTimeControls
              facilities={session.facilities}
              overrides={session.durationOverrides}
              onChange={session.handleDurationOverridesChange}
              onDraftValidityChange={session.setPersonalizationDraftsValid}
              disabled={!session.contextValid}
            />
          </div>
        ) : null}
        {screen}
      </main>
    </div>
  );
}

export function GateWiseHome({
  facilities,
  datasetErrors,
  initialPath = "/",
}: GateWiseHomeProps) {
  return (
    <GateWiseSessionProvider
      facilities={facilities}
      datasetErrors={datasetErrors}
    >
      <HarnessShell initialPath={initialPath} />
    </GateWiseSessionProvider>
  );
}
