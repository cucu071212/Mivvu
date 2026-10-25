"use client";

import { FuturePlannerPlaceholder } from "@/components/FuturePlannerPlaceholder";
import Link from "next/link";

export function PlanScreen() {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground sm:text-xl">
          My Plan
        </h1>
        <p className="text-sm text-muted-foreground">
          Future home of the GW-E two-stop planner. Today&apos;s single-stop
          model remains on Flight, Explore, and Results.
        </p>
      </header>

      <FuturePlannerPlaceholder />

      <div className="gw-surface-card flex flex-col gap-3 p-4 sm:p-5">
        <h2 className="text-base font-semibold text-card-foreground">
          What you can do now
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            Set your boarding budget on{" "}
            <Link href="/" className="font-medium text-primary underline">
              Flight
            </Link>
            .
          </li>
          <li>
            Browse the D Gates directory on{" "}
            <Link href="/explore" className="font-medium text-primary underline">
              Explore
            </Link>
            .
          </li>
          <li>
            Compare ranked places and what-if scenarios on{" "}
            <Link
              href="/recommendations"
              className="font-medium text-primary underline"
            >
              Results
            </Link>
            .
          </li>
        </ul>
      </div>
    </div>
  );
}
