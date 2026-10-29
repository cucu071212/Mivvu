"use client";

import { MivvuWordmark } from "@/components/mivvu/MivvuWordmark";
import { MivvuLanguageToggle } from "@/components/mivvu/MivvuLanguageToggle";

function BackIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type MivvuIcnHeaderProps = {
  backLabel: string;
  onBack: () => void;
};

/** Accepted GW-ICN-019 two-row header (Save entry deferred to GW-ICN-016). */
export function MivvuIcnHeader({ backLabel, onBack }: MivvuIcnHeaderProps) {
  return (
    <header className="mivvu-icn-header">
      <div className="mivvu-icn-header-row1">
        <button type="button" className="mivvu-icn-back mivvu-icn-back-compact gw-focus-ring" onClick={onBack}>
          <BackIcon />
          <span className="mivvu-icn-back-text mivvu-icn-back-label">{backLabel}</span>
        </button>
        <MivvuWordmark variant="headerCompact" className="mivvu-wordmark-header-compact" />
      </div>
      <div className="mivvu-icn-header-row2">
        <span className="mivvu-icn-header-row2-spacer" aria-hidden="true" />
        <MivvuLanguageToggle />
      </div>
    </header>
  );
}
