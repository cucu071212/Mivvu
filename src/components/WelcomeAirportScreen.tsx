"use client";

import { SUPPORTED_AIRPORT_IATA } from "@/types/airport";
import { useAirportSelection } from "@/context/airport-selection";

export function WelcomeAirportScreen() {
  const { storageAvailable, completeSelection } = useAirportSelection();

  return (
    <div className="gw-welcome-airport">
      <main
        className="gw-welcome-airport-inner"
        aria-labelledby="gw-welcome-airport-title"
        aria-describedby="gw-welcome-airport-desc"
      >
        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            GateWise · Welcome
          </p>
          <div className="gw-brand-mark">
            <span className="gw-brand-icon" aria-hidden="true">GW</span>
            <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              GateWise
            </p>
          </div>
        </header>

        <h1
          id="gw-welcome-airport-title"
          className="text-2xl font-bold tracking-tight text-card-foreground sm:text-3xl"
        >
          Where are you flying from?
        </h1>
        <p id="gw-welcome-airport-desc" className="text-sm leading-relaxed text-muted-foreground">
          GateWise currently models one verified airport. Select your departure
          airport to continue. This demo does not use live flight feeds.
        </p>

        <fieldset className="gw-airport-selection-fieldset">
          <legend className="sr-only">Departure airport</legend>
          <label className="gw-airport-selection-option gw-airport-selection-option-active">
            <input
              type="radio"
              name="departure-airport"
              value={SUPPORTED_AIRPORT_IATA}
              checked
              readOnly
              className="gw-focus-ring"
            />
            <span className="flex min-w-0 flex-col gap-1">
              <span className="font-semibold text-card-foreground">
                San Francisco International Airport ({SUPPORTED_AIRPORT_IATA})
              </span>
              <span className="text-sm text-muted-foreground">
                Terminal 2 D Gates time-based recommendations · 26-facility SFO
                directory
              </span>
            </span>
          </label>
          <p
            className="text-sm text-muted-foreground"
            role="note"
          >
            Other airports are not supported yet. Multi-airport routing and live
            operations data are out of scope for this release.
          </p>
        </fieldset>

        <ul className="gw-airport-selection-orientation text-sm text-muted-foreground">
          <li>12 facilities participate in ranked recommendations (T2 D Gates).</li>
          <li>26 facilities are available for browse-only discovery across SFO.</li>
          <li>Walking times and queues are demo estimates — not navigation.</li>
        </ul>

        {!storageAvailable ? (
          <p className="text-sm text-muted-foreground" role="note">
            Browser storage is unavailable. You can continue now; this screen may
            appear again on your next visit.
          </p>
        ) : null}

        <button
          type="button"
          className="gw-focus-ring gw-btn-primary min-h-11 w-full sm:w-auto"
          onClick={completeSelection}
        >
          Continue to Flight dashboard
        </button>
      </main>
    </div>
  );
}
