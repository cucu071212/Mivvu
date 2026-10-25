"use client";

import { SUPPORTED_AIRPORT_IATA } from "@/types/airport";
import { useAirportSelection } from "@/context/airport-selection";

export function AirportSelectionGate() {
  const { gateOpen, hydrated, storageAvailable, completeSelection } =
    useAirportSelection();

  if (!hydrated || !gateOpen) return null;

  return (
    <div
      className="gw-airport-selection-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Where are you flying from?"
      aria-labelledby="gw-airport-selection-title"
      aria-describedby="gw-airport-selection-desc"
    >
      <div className="gw-airport-selection-panel gw-surface-card">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          GateWise · First visit
        </p>
        <h1
          id="gw-airport-selection-title"
          className="text-2xl font-bold tracking-tight text-card-foreground sm:text-3xl"
        >
          Where are you flying from?
        </h1>
        <p id="gw-airport-selection-desc" className="text-sm text-muted-foreground">
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
            className="gw-airport-selection-unavailable text-sm text-muted-foreground"
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
      </div>
    </div>
  );
}
