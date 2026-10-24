"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearCountdown,
  minutesUntilBoardingFromTimestamp,
  parseBoardingStartAt,
  pauseCountdown,
  resumeCountdown,
  type BoardingCountdownState,
} from "@/lib/boarding-countdown";

export type BoardingCountdownControlsProps = {
  state: BoardingCountdownState;
  onStateChange: (next: BoardingCountdownState) => void;
  /** Syncs baseline flight-context minutes (countdown updates baseline only). */
  onBaselineMinutesChange: (minutes: number) => void;
  /** Used when clearing countdown back to manual mode. */
  manualFallbackMinutes: number;
  disabled?: boolean;
};

function defaultDatetimeLocal(now: Date, offsetMinutes: number): string {
  const target = new Date(now.getTime() + offsetMinutes * 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(target.getHours())}:${pad(target.getMinutes())}`;
}

function errorMessage(code: string): string {
  switch (code) {
    case "boarding_start_too_far":
      return "Boarding start must be within the next 24 hours.";
    case "ambiguous_local_time":
      return "This local time is ambiguous (timezone). Add an explicit offset or pick another minute.";
    case "invalid_boarding_start":
      return "Enter a valid boarding date and time.";
    default:
      return "Could not start countdown with that time.";
  }
}

export function BoardingCountdownControls({
  state,
  onStateChange,
  onBaselineMinutesChange,
  manualFallbackMinutes,
  disabled = false,
}: BoardingCountdownControlsProps) {
  const [datetimeLocal, setDatetimeLocal] = useState("");
  useEffect(() => {
    setDatetimeLocal(defaultDatetimeLocal(new Date(), 50));
  }, []);
  const [startError, setStartError] = useState<string | null>(null);

  const tickAndSync = useCallback(
    (nextState: BoardingCountdownState) => {
      if (nextState.mode !== "countdown") {
        return;
      }
      if (nextState.runState === "paused") {
        const minutes = Math.floor(nextState.pausedRemainingMs / 60_000);
        onBaselineMinutesChange(minutes);
        return;
      }
      const tick = minutesUntilBoardingFromTimestamp(
        new Date(nextState.boardingStartAt),
        new Date(),
      );
      if (!tick.invalid) {
        onBaselineMinutesChange(tick.minutesUntilBoarding);
      }
    },
    [onBaselineMinutesChange],
  );

  useEffect(() => {
    if (state.mode !== "countdown" || state.runState !== "running") {
      return undefined;
    }
    tickAndSync(state);
    const id = window.setInterval(() => tickAndSync(state), 1000);
    return () => window.clearInterval(id);
  }, [state, tickAndSync]);

  const liveLabel = useMemo(() => {
    if (state.mode === "manual") {
      return "Manual minutes entry";
    }
    if (state.runState === "paused") {
      return "Countdown paused (baseline frozen)";
    }
    return "Live device-clock countdown (baseline only)";
  }, [state]);

  const handleStart = () => {
    const parsed = parseBoardingStartAt(datetimeLocal, new Date());
    if ("error" in parsed) {
      setStartError(errorMessage(parsed.error));
      return;
    }
    setStartError(null);
    const next: BoardingCountdownState = {
      mode: "countdown",
      runState: "running",
      boardingStartAt: parsed.boardingStartAt.toISOString(),
    };
    onStateChange(next);
    tickAndSync(next);
  };

  const handlePause = () => {
    if (state.mode !== "countdown" || state.runState !== "running") return;
    const paused = pauseCountdown(state, new Date());
    onStateChange(paused);
    tickAndSync(paused);
  };

  const handleResume = () => {
    if (state.mode !== "countdown" || state.runState !== "paused") return;
    const running = resumeCountdown(state, new Date());
    onStateChange(running);
    tickAndSync(running);
  };

  const handleClear = () => {
    const manual = clearCountdown(manualFallbackMinutes);
    onStateChange(manual);
    onBaselineMinutesChange(manual.minutesUntilBoarding);
    setStartError(null);
  };

  return (
    <div
      className="flex flex-col gap-3 rounded-lg border border-border bg-card/40 p-3"
      role="group"
      aria-labelledby="boarding-countdown-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3
          id="boarding-countdown-heading"
          className="text-sm font-semibold text-card-foreground"
        >
          Boarding countdown (optional)
        </h3>
        <span className="gw-badge gw-badge-unknown text-xs">{liveLabel}</span>
      </div>
      <p className="text-xs text-muted-foreground" role="note">
        Uses your device clock only — not airline or airport live data. Updates{" "}
        <strong className="font-medium text-card-foreground">baseline</strong>{" "}
        minutes until boarding; What-if scenario minutes stay a separate fixed
        field.
      </p>

      {state.mode === "manual" ? (
        <label className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground">
          Boarding starts (local date & time)
          <input
            type="datetime-local"
            className="gw-input gw-focus-ring min-h-11 disabled:cursor-not-allowed disabled:opacity-60"
            value={datetimeLocal}
            onChange={(event) => setDatetimeLocal(event.target.value)}
            disabled={disabled}
          />
        </label>
      ) : (
        <p className="text-sm text-muted-foreground">
          Target:{" "}
          <time dateTime={state.boardingStartAt}>
            {new Date(state.boardingStartAt).toLocaleString()}
          </time>
        </p>
      )}

      {startError ? (
        <p className="text-sm text-destructive" role="alert">{startError}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {state.mode === "manual" ? (
          <button
            type="button"
            className="gw-focus-ring min-h-11 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            onClick={handleStart}
            disabled={disabled}
          >
            Start countdown
          </button>
        ) : null}
        {state.mode === "countdown" && state.runState === "running" ? (
          <button
            type="button"
            className="gw-focus-ring min-h-11 rounded-md border border-border px-3 py-2 text-sm font-medium disabled:opacity-60"
            onClick={handlePause}
            disabled={disabled}
          >
            Pause
          </button>
        ) : null}
        {state.mode === "countdown" && state.runState === "paused" ? (
          <button
            type="button"
            className="gw-focus-ring min-h-11 rounded-md border border-border px-3 py-2 text-sm font-medium disabled:opacity-60"
            onClick={handleResume}
            disabled={disabled}
          >
            Resume
          </button>
        ) : null}
        {state.mode === "countdown" ? (
          <button
            type="button"
            className="gw-focus-ring min-h-11 rounded-md border border-border px-3 py-2 text-sm font-medium disabled:opacity-60"
            onClick={handleClear}
            disabled={disabled}
          >
            Clear countdown
          </button>
        ) : null}
      </div>
    </div>
  );
}
