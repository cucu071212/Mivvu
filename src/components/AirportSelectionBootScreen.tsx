"use client";

/** Full-viewport placeholder until client localStorage preference is read (no dashboard flash). */
export function AirportSelectionBootScreen() {
  return (
    <div
      className="gw-welcome-airport gw-welcome-airport-boot"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading GateWise"
    >
      <div className="gw-welcome-airport-inner">
        <span className="gw-brand-icon" aria-hidden="true">GW</span>
        <p className="text-sm font-medium text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
