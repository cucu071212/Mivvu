"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { MivvuWordmark } from "@/components/mivvu/MivvuWordmark";
import {
  MIVVU_INTRO_EXIT_MS,
  MIVVU_INTRO_EXIT_START_MS,
  MIVVU_INTRO_TOTAL_MS,
} from "@/lib/mivvu-entry-intro-timing";

export type MivvuBrandIntroScreenProps = {
  onComplete: () => void;
};

export function MivvuBrandIntroScreen({
  onComplete,
}: MivvuBrandIntroScreenProps) {
  const [exiting, setExiting] = useState(false);
  const timerIdsRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const id of timerIdsRef.current) {
      window.clearTimeout(id);
    }
    timerIdsRef.current = [];
  }, []);

  const finish = useCallback(() => {
    clearTimers();
    onComplete();
  }, [clearTimers, onComplete]);

  useEffect(() => {
    const exitStartId = window.setTimeout(() => {
      setExiting(true);
    }, MIVVU_INTRO_EXIT_START_MS);

    const completeId = window.setTimeout(finish, MIVVU_INTRO_TOTAL_MS);

    timerIdsRef.current = [exitStartId, completeId];
    return clearTimers;
  }, [clearTimers, finish]);

  const handleDismiss = useCallback(() => {
    finish();
  }, [finish]);

  return (
    <div
      className={`mivvu-entry-intro${exiting ? " mivvu-entry-intro-exiting" : ""}`}
      role="dialog"
      aria-label="Mivvu welcome"
      aria-modal="true"
      onClick={handleDismiss}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " " || event.key === "Escape") {
          event.preventDefault();
          handleDismiss();
        }
      }}
      tabIndex={0}
      style={
        exiting
          ? ({ animationDuration: `${MIVVU_INTRO_EXIT_MS}ms` } satisfies CSSProperties)
          : undefined
      }
    >
      <div className="mivvu-entry-intro-inner">
        <MivvuWordmark variant="intro" />
      </div>
      <p className="mivvu-entry-intro-sr" id="mivvu-intro-hint">
        Tap or press Enter to continue to airport selection.
      </p>
    </div>
  );
}
