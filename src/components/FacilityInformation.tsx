import type { Facility } from "@/types/airport";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { facilityOfficialBadgeLabel } from "@/lib/facility-official-badge-label";
import {
  facilityOfficialListingUrl,
  facilityVerificationDate,
  presentFacilityHours,
} from "@/lib/format-facility-hours";
import { facilityLocationSummary } from "@/lib/facility-present";

export type FacilityInformationProps = {
  facility: Facility;
  /** Breadcrumb prefix for heading ids when nested in a card. */
  idPrefix: string;
  /** Tighter spacing inside schematic lists. */
  variant?: "default" | "compact";
};

export function FacilityInformation({
  facility,
  idPrefix,
  variant = "default",
}: FacilityInformationProps) {
  const hours = presentFacilityHours(facility.hours, facility.hoursConfidence);
  const listingUrl = facilityOfficialListingUrl(facility);
  const verifiedOn = facilityVerificationDate(facility);
  const tagline = facility.amenityDetails?.tagline ?? null;
  const about = facility.amenityDetails?.aboutExcerpt ?? null;
  const badges = facility.amenityDetails?.officialBadges ?? [];
  const phone = facility.contact?.phoneE164OrDisplay ?? null;
  const gap = variant === "compact" ? "gap-2" : "gap-3";
  const textSize = variant === "compact" ? "text-xs" : "text-sm";

  return (
    <div className={`flex flex-col ${gap}`} data-testid="facility-information">
      <section aria-labelledby={`${idPrefix}-what`}>
        <h4
          id={`${idPrefix}-what`}
          className={`font-semibold text-card-foreground ${textSize}`}
        >
          What
        </h4>
        <p className={`${textSize} text-muted-foreground`}>
          {tagline ?? "No short description on the official listing."}
        </p>
      </section>

      <section aria-labelledby={`${idPrefix}-where`}>
        <h4
          id={`${idPrefix}-where`}
          className={`font-semibold text-card-foreground ${textSize}`}
        >
          Where
        </h4>
        <p className={`${textSize} text-muted-foreground`}>
          {facilityLocationSummary(facility)}
        </p>
      </section>

      <section aria-labelledby={`${idPrefix}-when`}>
        <h4
          id={`${idPrefix}-when`}
          className={`font-semibold text-card-foreground ${textSize}`}
        >
          When (published)
        </h4>
        <p className={`${textSize} text-card-foreground`}>{hours.scheduleLine}</p>
        {!hours.isUnknown && facility.hours?.kind === "weekly_same_all_days" ? (
          <p className={`${textSize} text-muted-foreground`}>
            Source line:{" "}
            <span className="text-card-foreground">{facility.hours.rawText}</span>
          </p>
        ) : null}
        <p className={`${textSize} text-muted-foreground`} role="note">
          {hours.disclaimer}
        </p>
      </section>

      <section aria-labelledby={`${idPrefix}-offers`}>
        <h4
          id={`${idPrefix}-offers`}
          className={`font-semibold text-card-foreground ${textSize}`}
        >
          What it offers
        </h4>
        {badges.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label="Official directory badges">
            {badges.map((badge) => (
              <li key={badge}>
                <span className="gw-facility-amenity-badge">{facilityOfficialBadgeLabel(badge)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`${textSize} text-muted-foreground`}>
            No official directory badges on this listing.
          </p>
        )}
        {about ? (
          <p className={`${textSize} text-muted-foreground`}>{about}</p>
        ) : null}
      </section>

      <section aria-labelledby={`${idPrefix}-verify`}>
        <h4
          id={`${idPrefix}-verify`}
          className={`font-semibold text-card-foreground ${textSize}`}
        >
          Verify
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          {facility.hoursConfidence ? (
            <ConfidenceBadge confidence={facility.hoursConfidence} />
          ) : null}
          <ConfidenceBadge confidence={facility.locationConfidence} />
        </div>
        {phone ? (
          <p className={`${textSize}`}>
            <span className="text-muted-foreground">Phone: </span>
            <a
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              className="gw-focus-ring font-medium text-primary underline-offset-2 hover:underline"
            >
              {phone}
            </a>
            <span className="text-muted-foreground"> (published on listing)</span>
          </p>
        ) : (
          <p className={`${textSize} text-muted-foreground`}>
            Phone not published on the official listing.
          </p>
        )}
        {listingUrl ? (
          <p className={textSize}>
            <a
              href={listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gw-focus-ring font-medium text-primary underline-offset-2 hover:underline"
            >
              Official SFO listing
            </a>
            {verifiedOn ? (
              <span className="text-muted-foreground">
                {" "}
                · verified{" "}
                <time dateTime={verifiedOn}>{verifiedOn}</time>
              </span>
            ) : null}
          </p>
        ) : (
          <p className={`${textSize} text-muted-foreground`}>
            Official listing URL not available in this record.
          </p>
        )}
      </section>
    </div>
  );
}
