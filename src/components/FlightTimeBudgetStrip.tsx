import type { GateLandmark } from "@/types/airport";

export type FlightTimeBudgetStripProps = {
  minutesUntilBoarding: number | null;
  bufferMinutes: number | null;
  gateLandmark: GateLandmark;
  demoEstimatesEnabled: boolean;
  baselineUsesLiveCountdown: boolean;
  countdownPaused: boolean;
  boardingStarted: boolean;
  contextValid: boolean;
};

export function FlightTimeBudgetStrip({
  minutesUntilBoarding,
  bufferMinutes,
  gateLandmark,
  demoEstimatesEnabled,
  baselineUsesLiveCountdown,
  countdownPaused,
  boardingStarted,
  contextValid,
}: FlightTimeBudgetStripProps) {
  const minutesDisplay =
    contextValid && minutesUntilBoarding !== null
      ? String(minutesUntilBoarding)
      : "—";
  const bufferDisplay =
    contextValid && bufferMinutes !== null ? String(bufferMinutes) : "—";

  let modeLabel = "Manual baseline";
  if (boardingStarted) {
    modeLabel = "Boarding started (baseline 0)";
  } else if (baselineUsesLiveCountdown) {
    modeLabel = countdownPaused ? "Countdown paused" : "Live countdown";
  }

  return (
    <div
      className="gw-kpi-strip"
      role="group"
      aria-label="Time budget summary"
    >
      <div className="gw-kpi-tile">
        <p className="gw-kpi-label">Until boarding</p>
        <p className="gw-kpi-value" aria-live="polite">
          {minutesDisplay}
          <span className="gw-kpi-unit">min</span>
        </p>
      </div>
      <div className="gw-kpi-tile">
        <p className="gw-kpi-label">Safety buffer</p>
        <p className="gw-kpi-value">
          {bufferDisplay}
          <span className="gw-kpi-unit">min</span>
        </p>
      </div>
      <div className="gw-kpi-tile">
        <p className="gw-kpi-label">Gate landmark</p>
        <p className="gw-kpi-value gw-kpi-value-sm">Near {gateLandmark}</p>
      </div>
      <div className="gw-kpi-tile gw-kpi-tile-wide">
        <p className="gw-kpi-label">Model mode</p>
        <p className="gw-kpi-meta">
          <span className="gw-pill">{modeLabel}</span>
          {demoEstimatesEnabled ? (
            <span className="gw-pill gw-pill-demo">Demo timing on</span>
          ) : (
            <span className="gw-pill gw-pill-muted">Official durations only</span>
          )}
        </p>
      </div>
    </div>
  );
}
