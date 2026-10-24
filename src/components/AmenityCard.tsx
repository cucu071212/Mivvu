import type { GateLandmark, ProductionRecommendation } from "@/types/airport";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { AmenityDetail } from "@/components/AmenityDetail";
import { recommendationStatusPresentation } from "@/lib/recommendation-present";

export type AmenityCardProps = {
  recommendation: ProductionRecommendation;
  locationDescription?: string;
  nearestGateLandmark?: GateLandmark | null;
  sourceUrl?: string;
  lastCheckedAt?: string;
};

function locationLine(props: AmenityCardProps): string {
  if (props.locationDescription) {
    return props.locationDescription;
  }
  if (props.nearestGateLandmark) {
    return `Near Gate ${props.nearestGateLandmark}`;
  }
  return "Terminal 2 D Gates";
}

function securityLabel(
  securityZone: ProductionRecommendation["securityZone"],
): string {
  if (securityZone === "post" || securityZone === "both") {
    return "Post-security (sourced)";
  }
  if (securityZone === "pre") {
    return "Pre-security";
  }
  return "Security side unverified";
}

export function AmenityCard(props: AmenityCardProps) {
  const { recommendation, sourceUrl, lastCheckedAt } = props;
  const status = recommendationStatusPresentation(recommendation);
  const titleId = `amenity-${recommendation.facilityId}-title`;

  return (
    <article
      className="gw-surface-card flex flex-col gap-4 p-4 sm:p-5"
      aria-labelledby={titleId}
    >
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3
              id={titleId}
              className="text-lg font-semibold tracking-tight text-card-foreground"
            >
              {recommendation.facilityName}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{locationLine(props)}</p>
          </div>
          <span className="gw-badge gw-badge-unknown capitalize">
            {recommendation.category}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={status.chipClass} aria-label={status.accessibleLabel}>
            <span aria-hidden="true">{status.shortLabel}</span>
          </span>
          <span className="text-xs text-muted-foreground" role="note">
            Model only — not a boarding guarantee
          </span>
        </div>
      </header>

      <AmenityDetail recommendation={recommendation} />

      <div className="flex flex-wrap gap-2">
        <ConfidenceBadge confidence={recommendation.locationConfidence} />
        {recommendation.timeConfidence !== "unknown" ? (
          <ConfidenceBadge confidence={recommendation.timeConfidence} />
        ) : null}
        <span
          className={`gw-status-chip text-xs ${
            recommendation.securityZone === "post" ||
            recommendation.securityZone === "both"
              ? "gw-status-feasible"
              : "gw-status-ineligible"
          }`}
        >
          {securityLabel(recommendation.securityZone)}
        </span>
      </div>

      {sourceUrl ? (
        <p className="text-sm">
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            View official listing
          </a>
          {lastCheckedAt ? (
            <span className="text-muted-foreground"> · checked {lastCheckedAt}</span>
          ) : null}
        </p>
      ) : null}
    </article>
  );
}
