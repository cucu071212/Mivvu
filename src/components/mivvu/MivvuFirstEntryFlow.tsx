"use client";

import { useCallback, useEffect, useState } from "react";
import {
  markMivvuIntroSeenThisSession,
  readMivvuIntroSeenThisSession,
} from "@/lib/mivvu-entry-intro-session";
import { MivvuBrandIntroScreen } from "@/components/mivvu/MivvuBrandIntroScreen";
import { MivvuAirportSelectionScreen } from "@/components/mivvu/MivvuAirportSelectionScreen";

type EntryPhase = "intro" | "airport";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function MivvuFirstEntryFlow() {
  const [phase, setPhase] = useState<EntryPhase | null>(null);

  useEffect(() => {
    const seen = readMivvuIntroSeenThisSession();
    const reduced = prefersReducedMotion();
    queueMicrotask(() => {
      if (seen || reduced) {
        if (!seen) {
          markMivvuIntroSeenThisSession();
        }
        setPhase("airport");
        return;
      }
      setPhase("intro");
    });
  }, []);

  const completeIntro = useCallback(() => {
    markMivvuIntroSeenThisSession();
    setPhase("airport");
  }, []);

  if (phase === null) {
    return (
      <div
        className="mivvu-entry-intro mivvu-entry-intro-boot"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading"
      />
    );
  }

  if (phase === "intro") {
    return <MivvuBrandIntroScreen onComplete={completeIntro} />;
  }

  return <MivvuAirportSelectionScreen />;
}
