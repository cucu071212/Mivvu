"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clearCountdown,
  parseBoardingStartAt,
  type BoardingCountdownState,
} from "@/lib/boarding-countdown";
import type { CountdownManualExitPayload } from "@/lib/countdown-baseline-recovery";
import {
  manualMinutesAfterClear,
  safePauseCountdown,
  safeResumeCountdown,
} from "@/lib/boarding-countdown-ui";
import { runRunningCountdownTick } from "@/lib/running-countdown-tick";

export type BoardingCountdownControlsProps = {
  state: BoardingCountdownState;
  onStateChange: (next: BoardingCountdownState) => void;
  /** Syncs baseline flight-context minutes while countdown is active. */
  onBaselineMinutesChange: (minutes: number) => void;
  /** Last manual baseline minutes before countdown overwrites the field. */
  preservedManualMinutes: number;
  onCountdownExit: (payload: CountdownManualExitPayload) => void;
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
    case "countdown_pause_failed":
    case "countdown_resume_failed":
      return "Countdown could not be updated safely and was stopped.";
    default:
      return "Countdown stopped because the device clock or boarding time could not be trusted.";
  }
}

export function BoardingCountdownControls({
  state,
  onStateChange,
  onBaselineMinutesChange,
  preservedManualMinutes,
  onCountdownExit,
  disabled = false,
}: BoardingCountdownControlsProps) {
  const [datetimeLocal, setDatetimeLocal] = useState("");
  const [startError, setStartError] = useState<string | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [boardingStartedVisible, setBoardingStartedVisible] = useState(false);

  const stateRef = useRef(state);
  const lastBaselineMinutesRef = useRef(preservedManualMinutes);
  const onBaselineMinutesChangeRef = useRef(onBaselineMinutesChange);
  const onCountdownExitRef = useRef(onCountdownExit);
  const preservedManualMinutesRef = useRef(preservedManualMinutes);

  useEffect(() => {
    stateRef.current = state;
    onBaselineMinutesChangeRef.current = onBaselineMinutesChange;
    onCountdownExitRef.current = onCountdownExit;
    preservedManualMinutesRef.current = preservedManualMinutes;
  }, [state, onBaselineMinutesChange, onCountdownExit, preservedManualMinutes]);

  const failCountdown = useCallback(
    (message: string, lastBaselineMinutes: number) => {
      setRuntimeError(message);
      const manual = clearCountdown(lastBaselineMinutes);
      onStateChange(manual);
      stateRef.current = manual;
      onCountdownExitRef.current({
        reason: "countdown_failure",
        preservedManualMinutes: preservedManualMinutesRef.current,
        lastBaselineMinutes,
        message,
      });
    },
    [onStateChange],
  );

  const applyTickOutcome = useCallback((outcome: ReturnType<typeof runRunningCountdownTick>) => {
    if (outcome.kind === "noop") {
      return;
    }
    if (outcome.kind === "invalid") {
      failCountdown(errorMessage(outcome.code), outcome.lastBaselineMinutes);
      return;
    }
    lastBaselineMinutesRef.current = outcome.minutesUntilBoarding;
    onBaselineMinutesChangeRef.current(outcome.minutesUntilBoarding);
    if (outcome.boardingStarted) {
      setBoardingStartedVisible(true);
    }
  }, [failCountdown]);

  const tickNow = useCallback(() => {
    applyTickOutcome(
      runRunningCountdownTick(
        stateRef.current,
        new Date(),
        lastBaselineMinutesRef.current,
      ),
    );
  }, [applyTickOutcome]);

  const runningBoardingStartAt =
    state.mode === "countdown" && state.runState === "running"
      ? state.boardingStartAt
      : null;

  useEffect(() => {
    if (!runningBoardingStartAt) {
      return undefined;
    }
    const id = window.setInterval(tickNow, 1000);
    return () => window.clearInterval(id);
  }, [runningBoardingStartAt, tickNow]);

  const liveLabel = useMemo(() => {
    if (state.mode === "manual") {
      return "Manual minutes entry";
    }
    if (state.runState === "paused") {
      return "Countdown paused (baseline frozen)";
    }
    if (boardingStartedVisible) {
      return "Boarding has started (baseline at 0)";
    }
    return "Live device-clock countdown (baseline only)";
  }, [state, boardingStartedVisible]);

  const handleSuggestFromManualBudget = () => {
    setDatetimeLocal(defaultDatetimeLocal(new Date(), preservedManualMinutes));
    setStartError(null);
  };

  const handleStart = () => {
    if (datetimeLocal.trim() === "") {
      setStartError(
        "Select a boarding start date and time, or use “Suggest from manual budget” to fill the field, before starting the countdown.",
      );
      return;
    }
    const boardingInput = datetimeLocal;
    const parsed = parseBoardingStartAt(boardingInput, new Date());
    if ("error" in parsed) {
      setStartError(errorMessage(parsed.error));
      return;
    }
    setStartError(null);
    setRuntimeError(null);
    setBoardingStartedVisible(false);
    lastBaselineMinutesRef.current = preservedManualMinutesRef.current;
    const next: BoardingCountdownState = {
      mode: "countdown",
      runState: "running",
      boardingStartAt: parsed.boardingStartAt.toISOString(),
    };
    onStateChange(next);
    stateRef.current = next;
    applyTickOutcome(
      runRunningCountdownTick(next, new Date(), lastBaselineMinutesRef.current),
    );
  };

  const handlePause = () => {
    if (state.mode !== "countdown" || state.runState !== "running") return;
    const result = safePauseCountdown(state, new Date());
    if (!result.ok) {
      failCountdown(errorMessage(result.code), lastBaselineMinutesRef.current);
      return;
    }
    setRuntimeError(null);
    onStateChange(result.state);
    const minutes = Math.floor(result.state.pausedRemainingMs / 60_000);
    lastBaselineMinutesRef.current = minutes;
    onBaselineMinutesChange(minutes);
  };

  const handleResume = () => {
    if (state.mode !== "countdown" || state.runState !== "paused") return;
    const result = safeResumeCountdown(state, new Date());
    if (!result.ok) {
      failCountdown(errorMessage(result.code), lastBaselineMinutesRef.current);
      return;
    }
    setRuntimeError(null);
    onStateChange(result.state);
    stateRef.current = result.state;
    applyTickOutcome(
      runRunningCountdownTick(
        result.state,
        new Date(),
        lastBaselineMinutesRef.current,
      ),
    );
  };

  const handleClear = () => {
    const minutes = manualMinutesAfterClear(preservedManualMinutes);
    const manual = clearCountdown(minutes);
    onStateChange(manual);
    onCountdownExit({
      reason: "user_clear",
      preservedManualMinutes: minutes,
      lastBaselineMinutes: lastBaselineMinutesRef.current,
    });
    setStartError(null);
    setRuntimeError(null);
    setBoardingStartedVisible(false);
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

      {boardingStartedVisible ? (
        <p
          className="rounded-md border border-[var(--gw-status-tight-border)] bg-[var(--gw-status-tight-bg)] p-3 text-sm font-semibold text-[var(--gw-status-tight-fg)]"
          role="alert"
          aria-live="assertive"
        >
          Boarding has started per your device clock. Baseline minutes are at 0
          in the model — not a guarantee you can still board.
        </p>
      ) : null}

      {state.mode === "manual" ? (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground">
            Boarding starts (local date & time)
            <span className="text-xs font-normal text-muted-foreground">
              Required before Start countdown. Your manual minute budget stays
              active until a valid countdown is running.
            </span>
            <input
              type="datetime-local"
              className="gw-input gw-focus-ring min-h-11 disabled:cursor-not-allowed disabled:opacity-60"
              value={datetimeLocal}
              onChange={(event) => {
                setDatetimeLocal(event.target.value);
                setStartError(null);
              }}
              disabled={disabled}
              required
              aria-required="true"
              aria-invalid={Boolean(startError)}
            />
          </label>
          <button
            type="button"
            className="gw-focus-ring min-h-11 self-start rounded-md border border-border px-3 py-2 text-sm font-medium disabled:opacity-60"
            onClick={handleSuggestFromManualBudget}
            disabled={disabled}
          >
            Suggest from manual budget ({preservedManualMinutes} min)
          </button>
        </div>
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
      {runtimeError ? (
        <p className="text-sm text-destructive" role="alert">{runtimeError}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {state.mode === "manual" ? (
          <button
            type="button"
            className="gw-focus-ring min-h-11 rounded-md border-2 border-[var(--gw-primary)] bg-[var(--gw-primary)] px-3 py-2 text-sm font-semibold text-[var(--gw-on-primary)] shadow-sm hover:bg-[var(--gw-primary-hover)] disabled:opacity-60"
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
