"use client";

import Link from "next/link";
import { AmenityFilter } from "@/components/AmenityFilter";
import { TerminalSchematic } from "@/components/TerminalSchematic";
import { useGateWiseSession } from "@/context/gatewise-session";

export function ExploreScreen() {
  const session = useGateWiseSession();
  const canRank =
    session.datasetValid &&
    session.contextValid &&
    session.personalizationUsable &&
    !session.baselineRecoveryRequired;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground sm:text-xl">
          Explore
        </h1>
        <p className="text-sm text-muted-foreground">
          Search and filter verified Terminal 2 D Gates amenities. The schematic
          is orientation only — ranked timing lives on Results.
        </p>
      </header>

      <AmenityFilter
        value={session.filter}
        onChange={session.setFilter}
        resultCount={canRank ? session.recommendations.length : 0}
        disabled={!session.datasetValid || !session.contextValid}
      />

      {!session.contextValid ? (
        <p
          className="gw-surface-card border-destructive/40 p-4 text-sm text-destructive"
          role="alert"
        >
          Fix flight context on{" "}
          <Link href="/" className="font-semibold underline">
            Flight
          </Link>{" "}
          before ranking places by time budget.
        </p>
      ) : null}

      <details
        id="gw-section-map"
        className="gw-surface-card gw-premium-card group"
        open
      >
        <summary
          id="terminal-schematic-summary"
          className="gw-focus-ring cursor-pointer list-none px-4 py-4 text-base font-semibold text-card-foreground marker:content-none [&::-webkit-details-marker]:hidden"
        >
          <span className="flex min-h-11 items-center justify-between gap-2">
            <span>D Gates schematic (full directory)</span>
            <span
              className="text-sm font-normal text-muted-foreground group-open:hidden"
              aria-hidden="true"
            >
              Expand
            </span>
            <span
              className="hidden text-sm font-normal text-muted-foreground group-open:inline"
              aria-hidden="true"
            >
              Collapse
            </span>
          </span>
        </summary>
        <div className="border-t border-border px-4 pb-4 pt-3">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground" role="note">
              Orientation only — lists all verified facilities from source
              records. This directory is{" "}
              <strong className="font-medium text-card-foreground">
                not filtered
              </strong>{" "}
              by search or category above and is{" "}
              <strong className="font-medium text-card-foreground">not</strong>{" "}
              the ranked recommendation list.
            </p>
            {session.demoEstimatesEnabled ? (
              <p className="text-sm text-muted-foreground" role="note">
                Demo wait/activity estimates affect recommendation cards only.
                Schematic timing badges still reflect official dataset confidence.
              </p>
            ) : null}
            {!session.datasetValid ? (
              <p className="text-sm text-destructive" role="alert">
                Recommendations are disabled because facility validation failed.
                The schematic may still show valid rows alongside its own
                validation notice.
              </p>
            ) : null}
            <TerminalSchematic className="border-0 bg-transparent p-0 shadow-none sm:p-0" />
          </div>
        </div>
      </details>

      <Link
        href="/recommendations"
        className="gw-btn-primary self-start no-underline"
      >
        Open ranked results
      </Link>
    </div>
  );
}
