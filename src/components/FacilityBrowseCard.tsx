import type { Facility } from "@/types/airport";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import {
  facilityLocationSummary,
  facilityTaglineSummary,
  facilityTerminalBoardingLabel,
  recommendEligibilityLabel,
} from "@/lib/facility-present";

function securityLabel(securityZone: Facility["securityZone"]): string {
  if (securityZone === "post" || securityZone === "both") {
    return "Post-security (sourced)";
  }
  if (securityZone === "pre") {
    return "Pre-security";
  }
  return "Security side unverified";
}

export type FacilityBrowseCardProps = {
  facility: Facility;
  onOpenDetails: () => void;
};

export function FacilityBrowseCard({
  facility,
  onOpenDetails,
}: FacilityBrowseCardProps) {
  const securityUnverified =
    facility.securityZone === "unknown" || facility.securityZone === "pre";
  const tagline = facilityTaglineSummary(facility);

  return (
    <article
      className="gw-surface-card flex flex-col gap-3 p-4 transition-shadow duration-200 hover:shadow-md"
      aria-labelledby={`facility-${facility.id}-title`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3
            id={`facility-${facility.id}-title`}
            className="text-lg font-semibold text-card-foreground"
          >
            {facility.name}
          </h3>
          <span className="gw-badge gw-badge-unknown capitalize">
            {facility.category}
          </span>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {facilityTerminalBoardingLabel(facility)}
        </p>
        <span
          className={
            facility.recommendEligible
              ? "gw-status-chip gw-status-feasible w-fit text-xs"
              : "gw-status-chip gw-status-ineligible w-fit text-xs"
          }
        >
          {recommendEligibilityLabel(facility)}
        </span>
        <p className="text-sm text-muted-foreground">
          {tagline ?? facilityLocationSummary(facility)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-3">
        <ConfidenceBadge confidence={facility.locationConfidence} />
        {facility.timeConfidence !== "unknown" && (
          <ConfidenceBadge confidence={facility.timeConfidence} />
        )}
        {securityUnverified ? (
          <span className="gw-status-chip gw-status-ineligible text-xs">
            {securityLabel(facility.securityZone)}
          </span>
        ) : (
          <span className="gw-status-chip gw-status-feasible text-xs">
            {securityLabel(facility.securityZone)}
          </span>
        )}
      </div>

      <button
        type="button"
        className="gw-focus-ring gw-btn-secondary min-h-11 w-full sm:w-auto"
        onClick={onOpenDetails}
        aria-describedby={`facility-${facility.id}-title`}
      >
        View facility details
      </button>
    </article>
  );
}
