import type {
  Facility,
  GateLandmark,
  ProductionRecommendation,
  ResolvedFacilityDurations,
} from "@/types/airport";
import { FacilityInformation } from "@/components/FacilityInformation";
import {
  durationModelBadgeClass,
  durationModelLabel,
} from "@/lib/duration-model-label";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { AmenityDetail } from "@/components/AmenityDetail";
import {
  RecommendationStatusBadge,
  recommendationCardAccentClass,
} from "@/components/RecommendationStatusBadge";

export type AmenityCardProps = {
  recommendation: ProductionRecommendation;
  /** Full facility record for published hours and amenities (GW-A-003). */
  facility?: Facility;
  locationDescription?: string;
  nearestGateLandmark?: GateLandmark | null;
  sourceUrl?: string;
  lastCheckedAt?: string;
  /** GW-F1 model inputs for queue/activity (separate from dataset timeConfidence). */
  resolvedDurations?: Pick<
    ResolvedFacilityDurations,
    "queueSource" | "activitySource"
  >;
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
  const { recommendation, facility, sourceUrl, lastCheckedAt } = props;
  const titleId = `amenity-${recommendation.facilityId}-title`;
  const accent = recommendationCardAccentClass(recommendation);

  return (
    <article
      className={`gw-surface-card gw-premium-card flex flex-col gap-4 p-4 sm:p-5 ${accent}`}
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
          <RecommendationStatusBadge recommendation={recommendation} />
          <span className="text-xs text-muted-foreground" role="note">
            Model only — not a boarding guarantee
          </span>
        </div>
      </header>

      {facility ? (
        <div className="rounded-lg border border-border/80 bg-muted/20 p-3 sm:p-4">
          <FacilityInformation
            facility={facility}
            idPrefix={`amenity-${recommendation.facilityId}`}
          />
        </div>
      ) : null}

      <AmenityDetail recommendation={recommendation} />

      <div className="flex flex-wrap gap-2">
        <ConfidenceBadge confidence={recommendation.locationConfidence} />
        {recommendation.timeConfidence !== "unknown" ? (
          <ConfidenceBadge confidence={recommendation.timeConfidence} />
        ) : null}
        {props.resolvedDurations ? (
          <span className="flex flex-wrap gap-1" role="note">
            <span
              className={durationModelBadgeClass(
                props.resolvedDurations.queueSource,
              )}
            >
              Queue: {durationModelLabel(props.resolvedDurations.queueSource)}
            </span>
            <span
              className={durationModelBadgeClass(
                props.resolvedDurations.activitySource,
              )}
            >
              Activity:{" "}
              {durationModelLabel(props.resolvedDurations.activitySource)}
            </span>
          </span>
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

      {!facility && sourceUrl ? (
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
