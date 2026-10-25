"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AmenityFilter } from "@/components/AmenityFilter";
import { FacilityBrowseCard } from "@/components/FacilityBrowseCard";
import { FacilityDetailDialog } from "@/components/FacilityDetailDialog";
import { TerminalSchematic } from "@/components/TerminalSchematic";
import { useGateWiseSession } from "@/context/gatewise-session";
import {
  countBrowseEligible,
  filterBrowseDirectory,
} from "@/lib/filter-browse-directory";

export function ExploreScreen() {
  const session = useGateWiseSession();
  const [detailFacilityId, setDetailFacilityId] = useState<string | null>(null);

  const browseTotal = useMemo(
    () => countBrowseEligible(session.facilities),
    [session.facilities],
  );

  const directoryFacilities = useMemo(
    () => filterBrowseDirectory(session.facilities, session.filterQuery),
    [session.facilities, session.filterQuery],
  );

  const recommendEligibleCount = useMemo(
    () =>
      session.facilities.filter((facility) => facility.recommendEligible).length,
    [session.facilities],
  );

  const detailFacility = useMemo(
    () =>
      detailFacilityId
        ? session.facilities.find((row) => row.id === detailFacilityId) ?? null
        : null,
    [detailFacilityId, session.facilities],
  );

  const showT3ConstructionNotice = useMemo(
    () =>
      directoryFacilities.some(
        (facility) => facility.terminalCode === "terminal_3",
      ),
    [directoryFacilities],
  );

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground sm:text-xl">
          Explore
        </h1>
        <p className="text-sm text-muted-foreground">
          SFO-wide facility directory from verified official listings. Browse
          any terminal here; time-based recommendations remain limited to your
          Terminal 2 D Gates flight context.
        </p>
      </header>

      <section
        className="gw-surface-card border-[var(--gw-cyan-muted)] bg-[color-mix(in_srgb,var(--gw-cyan)_8%,var(--gw-card))] p-4"
        aria-labelledby="explore-scope-heading"
        role="note"
      >
        <h2
          id="explore-scope-heading"
          className="text-sm font-semibold text-card-foreground"
        >
          Browse vs recommend
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            <strong className="font-medium text-card-foreground">
              {browseTotal} facilities
            </strong>{" "}
            are available to browse across terminals in this dataset.
          </li>
          <li>
            Only{" "}
            <strong className="font-medium text-card-foreground">
              {recommendEligibleCount} Terminal 2 D Gates
            </strong>{" "}
            facilities participate in ranked time-based recommendations today.
          </li>
          <li>
            Browsing a facility in another terminal does{" "}
            <strong className="font-medium text-card-foreground">not</strong>{" "}
            mean you can reach it from your gate before boarding — no
            cross-terminal walking times are modeled.
          </li>
        </ul>
      </section>

      {showT3ConstructionNotice ? (
        <p
          className="text-sm text-muted-foreground"
          role="note"
          data-testid="t3-construction-notice"
        >
          Terminal 3 is under renovation; official SFO guidance describes
          check-in, walkway, and curbside changes that may affect how you reach
          E and F Gates.{" "}
          <a
            href="https://www.flysfo.com/about/construction/terminal-3-construction"
            className="font-semibold underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            SFO Terminal 3 construction
          </a>{" "}
          — orientation only; GateWise does not model paths, transfer times, or
          live construction status.
        </p>
      ) : null}

      <AmenityFilter
        value={session.filter}
        onChange={session.setFilter}
        directoryCount={directoryFacilities.length}
        browseTotal={browseTotal}
        disabled={!session.datasetValid}
      />

      {!session.contextValid ? (
        <p className="text-sm text-muted-foreground" role="status">
          Flight context is incomplete — you can still browse facilities. Fix
          minutes and buffer on{" "}
          <Link href="/" className="font-semibold underline">
            Flight
          </Link>{" "}
          to open ranked recommendations.
        </p>
      ) : null}

      <section
        className="flex flex-col gap-3"
        role="region"
        aria-labelledby="explore-directory-heading"
        data-testid="explore-facility-directory"
      >
        <div className="flex flex-col gap-1">
          <h2
            id="explore-directory-heading"
            className="text-lg font-semibold text-foreground"
          >
            Facility directory
          </h2>
          <p className="text-sm text-muted-foreground">
            Published hours and amenities from official SFO listings — not live
            open/closed status. Filters apply here and to ranked results on
            Recommendations when your flight context is valid.
          </p>
        </div>
        {!session.datasetValid ? (
          <p className="gw-surface-card p-4 text-sm text-destructive" role="alert">
            Facility records failed validation; directory hidden.
          </p>
        ) : directoryFacilities.length === 0 ? (
          <p className="gw-surface-card p-4 text-sm text-muted-foreground">
            No facilities match your filters. Clear terminal, boarding area,
            category, or search text to see all {browseTotal} browse-eligible
            places.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {directoryFacilities.map((facility) => (
              <li key={facility.id}>
                <FacilityBrowseCard
                  facility={facility}
                  onOpenDetails={() => setDetailFacilityId(facility.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <details
        id="gw-section-map"
        className="gw-surface-card gw-premium-card group"
      >
        <summary
          id="terminal-schematic-summary"
          className="gw-focus-ring cursor-pointer list-none px-4 py-4 text-base font-semibold text-card-foreground marker:content-none [&::-webkit-details-marker]:hidden"
        >
          <span className="flex min-h-11 items-center justify-between gap-2">
            <span>Terminal 2 D Gates schematic (orientation)</span>
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
              T2 D Gates only — not filtered by search above and not a map of
              other terminals. Ranked timing lives on Recommendations.
            </p>
            {session.demoEstimatesEnabled ? (
              <p className="text-sm text-muted-foreground" role="note">
                Demo wait/activity estimates affect recommendation cards only.
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
        Open ranked results (T2 D Gates scope)
      </Link>

      <FacilityDetailDialog
        facility={detailFacility}
        open={detailFacility !== null}
        onClose={() => setDetailFacilityId(null)}
      />
    </div>
  );
}
