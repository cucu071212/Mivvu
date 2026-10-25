"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  SUPPORTED_AIRPORT_IATA,
  SUPPORTED_BOARDING_AREA_LABEL,
  SUPPORTED_TERMINAL_LABEL,
} from "@/types/airport";
import { AppNav } from "@/components/AppNav";
import { BoardingCountdownControls } from "@/components/BoardingCountdownControls";
import { PersonalizedTimeControls } from "@/components/PersonalizedTimeControls";
import { useGateWiseSession } from "@/context/gatewise-session";
import { useAirportSelection } from "@/context/airport-selection";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const session = useGateWiseSession();
  const { reopenSelection } = useAirportSelection();
  const onFlight = pathname === "/";
  const onResults = pathname === "/recommendations";
  const countdownVariant = onFlight ? "full" : "dock";

  return (
    <div className="gw-app-shell">
      <a href="#main-content" className="gw-skip-link">
        Skip to main content
      </a>
      <header className="gw-app-header">
        <div className="gw-rail">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {SUPPORTED_AIRPORT_IATA} · {SUPPORTED_TERMINAL_LABEL} ·{" "}
              {SUPPORTED_BOARDING_AREA_LABEL}
            </p>
            <button
              type="button"
              className="gw-focus-ring text-xs font-medium text-primary underline-offset-2 hover:underline"
              onClick={reopenSelection}
            >
              Change airport
            </button>
          </div>
          <div className="gw-brand-mark">
            <span className="gw-brand-icon" aria-hidden="true">
              GW
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                GateWise
              </p>
              <p className="gw-brand-tagline max-w-xl text-sm leading-relaxed text-muted-foreground">
                Model-only boarding-start recommendations for verified Terminal 2
                D Gates — not a guarantee you will board on time.
              </p>
            </div>
          </div>
          <AppNav variant="desktop" />
        </div>
      </header>

      {/* Mobile bar must not live under header backdrop-filter (fixed containing block). */}
      <AppNav variant="mobile" />

      <div
        className={
          onFlight
            ? "gw-countdown-host gw-countdown-host-flight"
            : "gw-countdown-host gw-countdown-host-dock"
        }
      >
        <div className="gw-rail gw-rail-tight">
          <BoardingCountdownControls
            state={session.countdownState}
            onStateChange={session.setCountdownState}
            onBaselineMinutesChange={session.handleBaselineMinutesFromCountdown}
            preservedManualMinutes={session.preservedManualMinutes}
            onCountdownExit={session.handleCountdownExit}
            disabled={!session.datasetValid}
            variant={countdownVariant}
          />
          {!onFlight && session.baselineUsesLiveCountdown ? (
            <p className="gw-countdown-dock-note" role="status">
              Live countdown continues while you browse. Open Flight for the full
              editor.
            </p>
          ) : null}
        </div>
      </div>

      <main id="main-content" className="gw-app-main" tabIndex={-1}>
        <div className="gw-rail gw-rail-stack">
          {session.datasetValid ? (
            <div
              className="gw-persist-host"
              data-visible={onResults ? "true" : "false"}
              hidden={!onResults}
              aria-hidden={!onResults}
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
          {children}
        </div>
      </main>
    </div>
  );
}
