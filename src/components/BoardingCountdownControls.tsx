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
import {
  advanceTickMemory,
  freshTickMemory,
  runRunningCountdownTick,
  type RunningTickOutcome,
} from "@/lib/running-countdown-tick";
import { formatBoardingStartLabel } from "@/lib/format-boarding-time";
import Link from "next/link";

export type BoardingCountdownControlsProps = {
  state: BoardingCountdownState;
  onStateChange: (next: BoardingCountdownState) => void;
  /** Syncs baseline flight-context minutes while countdown is active. */
  onBaselineMinutesChange: (minutes: number) => void;
  /** Last manual baseline minutes before countdown overwrites the field. */
  preservedManualMinutes: number;
  onCountdownExit: (payload: CountdownManualExitPayload) => void;
  disabled?: boolean;
  /**
   * `full` — Flight page editor.
   * `dock` — compact cross-route strip; keeps the tick loop mounted.
   */
  variant?: "full" | "dock";
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
    case "clock_moved_backward":
      return "Your device clock moved backward, so the countdown was stopped and can no longer be trusted.";
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
  variant = "full",
}: BoardingCountdownControlsProps) {
  const [datetimeLocal, setDatetimeLocal] = useState("");
  const [startError, setStartError] = useState<string | null>(null);
  const [boardingStartedVisible, setBoardingStartedVisible] = useState(false);

  const stateRef = useRef(state);
  const tickMemoryRef = useRef(freshTickMemory(preservedManualMinutes));
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
      setBoardingStartedVisible(false);
      tickMemoryRef.current = freshTickMemory(lastBaselineMinutes);
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

  const applyTickOutcome = useCallback(
    (outcome: RunningTickOutcome, now: Date) => {
      if (outcome.kind === "noop") {
        return;
      }
      if (outcome.kind === "invalid") {
        failCountdown(errorMessage(outcome.code), outcome.lastBaselineMinutes);
        return;
      }
      tickMemoryRef.current = advanceTickMemory(outcome, now, tickMemoryRef.current);
      onBaselineMinutesChangeRef.current(outcome.minutesUntilBoarding);
      setBoardingStartedVisible(outcome.boardingStarted);
    },
    [failCountdown],
  );

  const tickWith = useCallback(
    (running: BoardingCountdownState) => {
      const now = new Date();
      applyTickOutcome(
        runRunningCountdownTick(running, now, tickMemoryRef.current),
        now,
      );
    },
    [applyTickOutcome],
  );

  const tickNow = useCallback(() => {
    tickWith(stateRef.current);
  }, [tickWith]);

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
    setBoardingStartedVisible(false);
    tickMemoryRef.current = freshTickMemory(preservedManualMinutesRef.current);
    const next: BoardingCountdownState = {
      mode: "countdown",
      runState: "running",
      boardingStartAt: parsed.boardingStartAt.toISOString(),
    };
    onStateChange(next);
    stateRef.current = next;
    tickWith(next);
  };

  const handlePause = () => {
    if (state.mode !== "countdown" || state.runState !== "running") return;
    const now = new Date();
    const check = runRunningCountdownTick(state, now, tickMemoryRef.current);
    if (check.kind === "invalid") {
      failCountdown(errorMessage(check.code), check.lastBaselineMinutes);
      return;
    }
    const memory = tickMemoryRef.current;
    // Tolerated clock jitter must not add time to the frozen remainder:
    // resume uses those exact milliseconds to construct a new target.
    const pauseAt = new Date(Math.max(now.getTime(), memory.lastTickAtMs ?? now.getTime()));
    const result = safePauseCountdown(state, pauseAt);
    if (!result.ok) {
      failCountdown(
        errorMessage(result.code),
        tickMemoryRef.current.lastBaselineMinutes,
      );
      return;
    }
    const paused = memory.expired
      ? { ...result.state, pausedRemainingMs: 0 }
      : result.state;
    const pausedMinutes = Math.floor(paused.pausedRemainingMs / 60_000);
    const minutes =
      memory.lastTickAtMs === null
        ? pausedMinutes
        : Math.min(pausedMinutes, memory.lastBaselineMinutes);
    onStateChange(paused);
    stateRef.current = paused;
    tickMemoryRef.current = { ...memory, lastBaselineMinutes: minutes };
    onBaselineMinutesChange(minutes);
  };

  const handleResume = () => {
    if (state.mode !== "countdown" || state.runState !== "paused") return;
    const result = safeResumeCountdown(state, new Date());
    if (!result.ok) {
      failCountdown(
        errorMessage(result.code),
        tickMemoryRef.current.lastBaselineMinutes,
      );
      return;
    }
    tickMemoryRef.current = freshTickMemory(
      tickMemoryRef.current.lastBaselineMinutes,
    );
    onStateChange(result.state);
    stateRef.current = result.state;
    tickWith(result.state);
  };

  const handleClear = () => {
    const minutes = manualMinutesAfterClear(preservedManualMinutes);
    const manual = clearCountdown(minutes);
    const lastBaselineMinutes = tickMemoryRef.current.lastBaselineMinutes;
    tickMemoryRef.current = freshTickMemory(minutes);
    onStateChange(manual);
    onCountdownExit({
      reason: "user_clear",
      preservedManualMinutes: minutes,
      lastBaselineMinutes,
    });
    setStartError(null);
    setBoardingStartedVisible(false);
  };

  if (variant === "dock" && state.mode === "manual") {
    return (
      <div
        className="gw-countdown-dock-card"
        role="group"
        aria-labelledby="boarding-countdown-heading"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3
              id="boarding-countdown-heading"
              className="text-sm font-semibold text-card-foreground"
            >
              Boarding countdown
            </h3>
            <p className="text-xs text-muted-foreground">{liveLabel}</p>
          </div>
          <Link
            href="/flight"
            className="gw-focus-ring inline-flex min-h-11 items-center rounded-md border border-border bg-card px-3 text-sm font-semibold text-card-foreground no-underline hover:border-primary"
          >
            Manage on Flight
          </Link>
        </div>
      </div>
    );
  }

  if (variant === "dock" && state.mode === "countdown") {
    return (
      <div
        className="gw-countdown-dock-card"
        role="group"
        aria-labelledby="boarding-countdown-heading"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3
              id="boarding-countdown-heading"
              className="text-sm font-semibold text-card-foreground"
            >
              Live countdown
            </h3>
            <p className="text-xs text-muted-foreground">{liveLabel}</p>
            <p className="mt-1 text-sm text-card-foreground">
              Target:{" "}
              <time dateTime={state.boardingStartAt}>
                {formatBoardingStartLabel(state.boardingStartAt)}
              </time>
            </p>
          </div>
          <span className="gw-badge gw-badge-demo text-xs">Device clock</span>
        </div>
        {boardingStartedVisible ? (
          <p
            className="mt-2 rounded-md border border-[var(--gw-status-tight-border)] bg-[var(--gw-status-tight-bg)] p-2 text-sm font-semibold text-[var(--gw-status-tight-fg)]"
            role="alert"
            aria-live="assertive"
          >
            Boarding has started per your device clock. Baseline is at 0 in the
            model.
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-2">
          {state.runState === "running" ? (
            <button
              type="button"
              className="gw-focus-ring min-h-11 rounded-md border border-border px-3 py-2 text-sm font-medium disabled:opacity-60"
              onClick={handlePause}
              disabled={disabled}
            >
              Pause
            </button>
          ) : null}
          {state.runState === "paused" ? (
            <button
              type="button"
              className="gw-focus-ring min-h-11 rounded-md border border-border px-3 py-2 text-sm font-medium disabled:opacity-60"
              onClick={handleResume}
              disabled={disabled}
            >
              Resume
            </button>
          ) : null}
          <button
            type="button"
            className="gw-focus-ring min-h-11 rounded-md border border-border px-3 py-2 text-sm font-medium disabled:opacity-60"
            onClick={handleClear}
            disabled={disabled}
          >
            Clear
          </button>
          <Link
            href="/flight"
            className="gw-focus-ring inline-flex min-h-11 items-center rounded-md px-2 text-sm font-semibold text-primary no-underline hover:underline"
          >
            Open Flight
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="gw-countdown-full-card"
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
              aria-describedby={startError ? "boarding-countdown-error" : undefined}
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
            {formatBoardingStartLabel(state.boardingStartAt)}
          </time>
        </p>
      )}

      {startError ? (
        <p id="boarding-countdown-error" className="text-sm text-destructive" role="alert">
          {startError}
        </p>
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
