import type { GateLandmark } from "@/types/airport";

/** Visual cap for the hero ring (model display only — not a flight schedule). */
const HERO_RING_MAX_MINUTES = 90;

export type FlightHeroPassProps = {
  minutesUntilBoarding: number | null;
  bufferMinutes: number | null;
  gateLandmark: GateLandmark;
  demoEstimatesEnabled: boolean;
  baselineUsesLiveCountdown: boolean;
  countdownPaused: boolean;
  boardingStarted: boolean;
  contextValid: boolean;
  airportLabel: string;
  terminalLabel: string;
  zoneLabel: string;
};

function TimeBudgetRing({
  minutes,
  valid,
}: {
  minutes: number | null;
  valid: boolean;
}) {
  const value = valid && minutes !== null ? minutes : 0;
  const ratio = Math.min(1, Math.max(0, value / HERO_RING_MAX_MINUTES));
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);

  return (
    <div className="gw-time-ring" aria-hidden="true">
      <svg viewBox="0 0 100 100" className="gw-time-ring-svg">
        <circle
          className="gw-time-ring-track"
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="6"
        />
        <circle
          className="gw-time-ring-progress"
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="gw-time-ring-center">
        <span className="gw-time-ring-value">
          {valid && minutes !== null ? minutes : "—"}
        </span>
        <span className="gw-time-ring-unit">min to boarding</span>
      </div>
    </div>
  );
}

export function FlightHeroPass({
  minutesUntilBoarding,
  bufferMinutes,
  gateLandmark,
  demoEstimatesEnabled,
  baselineUsesLiveCountdown,
  countdownPaused,
  boardingStarted,
  contextValid,
  airportLabel,
  terminalLabel,
  zoneLabel,
}: FlightHeroPassProps) {
  const bufferDisplay =
    contextValid && bufferMinutes !== null ? String(bufferMinutes) : "—";

  let modeLabel = "Manual baseline";
  if (boardingStarted) {
    modeLabel = "Boarding started (baseline 0)";
  } else if (baselineUsesLiveCountdown) {
    modeLabel = countdownPaused ? "Countdown paused" : "Live countdown";
  }

  return (
    <div className="gw-boarding-pass" role="group" aria-label="Boarding time budget">
      <div className="gw-boarding-pass-perforation" aria-hidden="true" />
      <div className="gw-boarding-pass-inner">
        <div className="gw-boarding-pass-header">
          <div>
            <p className="gw-boarding-pass-airline">GateWise · Model pass</p>
            <p className="gw-boarding-pass-route">
              {airportLabel} · {terminalLabel}
            </p>
          </div>
          <div className="gw-boarding-pass-gate" aria-label={`Gate landmark ${gateLandmark}`}>
            <span className="gw-boarding-pass-gate-label">Landmark</span>
            <span className="gw-boarding-pass-gate-value">{gateLandmark}</span>
          </div>
        </div>

        <div className="gw-boarding-pass-body">
          <TimeBudgetRing minutes={minutesUntilBoarding} valid={contextValid} />
          <div className="gw-boarding-pass-stats">
            <div className="gw-boarding-pass-stat">
              <span className="gw-boarding-pass-stat-label">Safety buffer</span>
              <span className="gw-boarding-pass-stat-value">
                {bufferDisplay}
                <span className="gw-boarding-pass-stat-unit">min</span>
              </span>
            </div>
            <div className="gw-boarding-pass-stat">
              <span className="gw-boarding-pass-stat-label">Zone</span>
              <span className="gw-boarding-pass-stat-value gw-boarding-pass-stat-value-sm">
                {zoneLabel}
              </span>
            </div>
            <div className="gw-boarding-pass-stat gw-boarding-pass-stat-wide">
              <span className="gw-boarding-pass-stat-label">Clock source</span>
              <span className="gw-boarding-pass-pills">
                <span className="gw-pill gw-pill-glow">{modeLabel}</span>
                {demoEstimatesEnabled ? (
                  <span className="gw-pill gw-pill-demo">Demo timing (not live)</span>
                ) : (
                  <span className="gw-pill gw-pill-muted">Official durations only</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <p className="gw-boarding-pass-footnote" role="note">
          Minutes until boarding <strong>starts</strong> in the app model — not gate
          closure or airline data.
        </p>
      </div>
    </div>
  );
}
