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
import { productionTravelMatrixMetadata } from "@/data/travel-times";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const session = useGateWiseSession();
  const onFlight = pathname === "/";
  const onResults = pathname === "/recommendations";

  return (
    <div className="gw-app-shell">
      <header className="gw-app-header">
        <div className="gw-app-header-inner">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {SUPPORTED_AIRPORT_IATA} · {SUPPORTED_TERMINAL_LABEL} ·{" "}
            {SUPPORTED_BOARDING_AREA_LABEL}
          </p>
          <div className="gw-brand-mark">
            <span className="gw-brand-icon" aria-hidden="true">
              GW
            </span>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                GateWise
              </p>
              <p className="max-w-xl text-sm text-muted-foreground">
                Model-only boarding-start recommendations for verified Terminal 2
                D Gates — not a guarantee you will board on time.
              </p>
            </div>
          </div>
          <AppNav />
        </div>
      </header>

      {/* Countdown stays mounted across routes so device-clock ticks never stop. */}
      <div
        className={
          onFlight
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
        {!onFlight && session.baselineUsesLiveCountdown ? (
          <p className="gw-countdown-dock-note" role="status">
            Live countdown continues while you browse. Open Flight to pause or
            clear. {productionTravelMatrixMetadata.sameZoneLegNote}
          </p>
        ) : null}
      </div>

      <main className="gw-app-main">
        {/* Personalization stays mounted so invalid drafts cannot remount as “valid”. */}
        {session.datasetValid ? (
          <div
            className={onResults ? "mb-6" : undefined}
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
      </main>
    </div>
  );
}
