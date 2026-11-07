"use client";

import Link from "next/link";
import { MivvuWordmark } from "@/components/mivvu/MivvuWordmark";
import { MivvuLanguageToggle } from "@/components/mivvu/MivvuLanguageToggle";

function BackIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type MivvuIcnHeaderSavedEntry = {
  href: string;
  label: string;
  count: number;
  isCurrentPage: boolean;
};

export type MivvuIcnHeaderProps = {
  backLabel: string;
  onBack: () => void;
  savedEntry?: MivvuIcnHeaderSavedEntry;
};

/** Accepted GW-ICN-019 two-row header with GW-ICN-016 saved entry on row 2. */
export function MivvuIcnHeader({ backLabel, onBack, savedEntry }: MivvuIcnHeaderProps) {
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
        {savedEntry ? (
          <Link
            href={savedEntry.href}
            className="mivvu-icn-saved-link gw-focus-ring"
            aria-current={savedEntry.isCurrentPage ? "page" : undefined}
          >
            <span className="mivvu-icn-saved-icon" aria-hidden="true">
              ★
            </span>
            <span>{savedEntry.label}</span>
            {savedEntry.count > 0 ? (
              <span className="mivvu-icn-badge-inline">{savedEntry.count}</span>
            ) : null}
          </Link>
        ) : (
          <span className="mivvu-icn-header-row2-spacer" aria-hidden="true" />
        )}
        <MivvuLanguageToggle />
      </div>
    </header>
  );
}
