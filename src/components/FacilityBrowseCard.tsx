import type { Facility } from "@/types/airport";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { FacilityInformation } from "@/components/FacilityInformation";

function securityLabel(securityZone: Facility["securityZone"]): string {
  if (securityZone === "post" || securityZone === "both") {
    return "Post-security (sourced)";
  }
  if (securityZone === "pre") {
    return "Pre-security";
  }
  return "Security side unverified";
}

export function FacilityBrowseCard({ facility }: { facility: Facility }) {
  const securityUnverified =
    facility.securityZone === "unknown" || facility.securityZone === "pre";

  return (
    <article
      className="gw-surface-card flex flex-col gap-3 p-4 transition-shadow duration-200 hover:shadow-md"
      aria-labelledby={`facility-${facility.id}-title`}
    >
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

      <FacilityInformation facility={facility} idPrefix={`facility-${facility.id}`} />

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
    </article>
  );
}
