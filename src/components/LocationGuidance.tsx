import type { Facility } from "@/types/airport";
import type { FacilityLocationEvidence } from "@/types/facility-location";
import {
  conceptualT2DAreaChips,
  isTerminal2DGatesFacility,
  presentLocationGuidance,
} from "@/lib/location-guidance-present";

export type LocationGuidanceProps = {
  facility: Facility;
  evidence: FacilityLocationEvidence;
};

/** 장식용 위치 아이콘. 배지 텍스트가 의미를 담당하므로 aria-hidden. */
function LocationIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 1.5A4.5 4.5 0 0 0 3.5 6c0 2.6 2.4 5.4 4.1 7.1l.4.4.4-.4C10.1 11.4 12.5 8.6 12.5 6A4.5 4.5 0 0 0 8 1.5Zm0 6.2A1.7 1.7 0 1 1 8 4.3a1.7 1.7 0 0 1 0 3.4Z"
      />
    </svg>
  );
}

/** 외부 링크: 새 탭 + 충분한 터치 영역 + 보이는 포커스. */
function EvidenceLink({
  href,
  accessibleName,
  children,
}: {
  href: string;
  accessibleName: string;
  children: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={accessibleName}
      className="gw-focus-ring inline-flex min-h-11 items-center font-medium text-primary underline-offset-2 hover:underline"
    >
      {children}
    </a>
  );
}

/**
 * Facility Details 안의 짧은 Location guidance.
 * Codex 증거를 표시하고, T2 D만 문서화된 개념 안내를 붙인다.
 * 경로선·도보 분·좌표는 그리지 않는다.
 */
export function LocationGuidance({
  facility,
  evidence,
}: LocationGuidanceProps) {
  const view = presentLocationGuidance(evidence);
  const headingId = `location-guidance-${facility.id}-heading`;
  const t2d = isTerminal2DGatesFacility(facility);
  const chips = t2d ? conceptualT2DAreaChips(facility) : [];

  return (
    <section
      className="mt-4 flex flex-col gap-3 border-t border-border pt-3"
      role="region"
      aria-labelledby={headingId}
      data-testid="location-guidance"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3
          id={headingId}
          className="text-sm font-semibold text-balance text-card-foreground"
        >
          Location guidance
        </h3>
        <span
          className={`${view.badgeClass} whitespace-nowrap`}
          aria-label={view.accessibleBadgeLabel}
        >
          <span className="inline-flex items-center gap-1">
            <LocationIcon />
            <span>{view.badgeLabel}</span>
          </span>
        </span>
      </div>

      {view.areaHeadline ? (
        <p className="min-w-0 text-sm font-medium wrap-anywhere text-card-foreground">
          {view.areaHeadline}
        </p>
      ) : null}

      <p className="text-sm text-muted-foreground" role="note">
        {view.explanation}
      </p>

      {view.nearGateLabel ? (
        <p className="text-sm text-card-foreground">{view.nearGateLabel}</p>
      ) : null}

      {view.mapGridLabel ? (
        <p className="text-sm text-muted-foreground">{view.mapGridLabel}</p>
      ) : null}

      {evidence.evidenceNotes ? (
        <p className="min-w-0 text-sm wrap-anywhere text-muted-foreground">
          {evidence.evidenceNotes}
        </p>
      ) : null}

      <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-1">
        {view.showSource && view.sourceUrl ? (
          <EvidenceLink
            href={view.sourceUrl}
            accessibleName="Evidence source (opens in a new tab)"
          >
            Evidence source
          </EvidenceLink>
        ) : null}
        {view.showMapSource && view.mapSourceUrl ? (
          <EvidenceLink
            href={view.mapSourceUrl}
            accessibleName="Official T2 map (PDF), opens in a new tab"
          >
            Official T2 map (PDF)
          </EvidenceLink>
        ) : null}
      </div>

      {t2d ? (
        <div
          className="rounded-md border border-border bg-muted/30 p-3"
          role="region"
          aria-labelledby={`location-guidance-${facility.id}-area-guide`}
        >
          <h4
            id={`location-guidance-${facility.id}-area-guide`}
            className="text-sm font-semibold text-balance text-card-foreground"
          >
            T2 D Gates area guide (conceptual)
          </h4>
          <p className="mt-1 text-sm text-muted-foreground" role="note">
            These groupings come from published listing relationships (named
            D-gate landmarks vs Retail Street). They are not a floor plan,
            measured coordinates, or walking directions. No route is drawn.
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li key={chip.id}>
                <span
                  className={`${
                    chip.current
                      ? "gw-badge gw-badge-verified"
                      : "gw-badge gw-badge-unknown"
                  } whitespace-nowrap`}
                  aria-current={chip.current ? "true" : undefined}
                >
                  {chip.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground" role="note">
          This conceptual area guide covers SFO Terminal 2 D Gates only.
        </p>
      )}
    </section>
  );
}
