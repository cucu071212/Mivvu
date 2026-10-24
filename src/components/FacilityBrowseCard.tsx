import type { Facility } from "@/types/airport";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";

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
  const locationLine =
    facility.locationDescription ??
    (facility.nearestGateLandmark
      ? `Near Gate ${facility.nearestGateLandmark}`
      : "D Gates");

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

      <p className="text-sm text-muted-foreground">{locationLine}</p>

      <div className="flex flex-wrap gap-2">
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

      {facility.sourceUrl ? (
        <a
          href={facility.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium"
        >
          View official listing
        </a>
      ) : null}
    </article>
  );
}
