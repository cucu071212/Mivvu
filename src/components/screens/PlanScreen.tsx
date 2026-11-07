"use client";

import Link from "next/link";
import { TwoStopPlannerDemo } from "@/components/TwoStopPlannerDemo";
import { useSfoDemoAppHref } from "@/components/useSfoDemoAppHref";

export function PlanScreen() {
  const recommendationsHref = useSfoDemoAppHref("/recommendations");

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          Demo — not in production release
        </p>
        <h1 className="text-lg font-semibold text-foreground sm:text-xl">
          Two-stop planner
        </h1>
        <p className="text-sm text-muted-foreground">
          Plan two D Gates stops in one airside loop. Single-stop rankings on{" "}
          <Link href={recommendationsHref} className="font-medium text-primary underline">
            Results
          </Link>{" "}
          are unchanged.
        </p>
      </header>

      <TwoStopPlannerDemo />
    </div>
  );
}
