import facilityData from "@/data/facilities.json";
import { validateFacilities } from "@/lib/validate-facilities";
import type { Facility } from "@/types/airport";
import { FacilityInformation } from "@/components/FacilityInformation";

export type TerminalSchematicProps = {
  className?: string;
};

const dataset = validateFacilities(facilityData);

/** T2 D Gates only — not airport-wide geography (GW-X-003). */
const t2DGatesFacilities = dataset.facilities.filter(
  (facility) =>
    facility.terminalCode === "terminal_2" && facility.zone === "D",
);

const landmarkGroups = Array.from(
  new Set(t2DGatesFacilities.flatMap((facility) =>
    facility.nearestGateLandmark ? [facility.nearestGateLandmark] : [],
  )),
).sort((left, right) => Number(left.slice(1)) - Number(right.slice(1)));

function FacilityList({ facilities }: { facilities: readonly Facility[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {facilities.map((facility) => (
        <li key={facility.id} className="min-w-0 border-t border-border pt-3">
          <p className="break-words text-base font-semibold text-card-foreground">
            {facility.name}
          </p>
          <div className="mt-2">
            <FacilityInformation
              facility={facility}
              idPrefix={`schematic-${facility.id}`}
              variant="compact"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Source-backed landmark associations, not geographic placement or routing.
 * Standalone: importing this component does not integrate it into the home page.
 */
export function TerminalSchematic({ className = "" }: TerminalSchematicProps) {
  const withoutLandmark = t2DGatesFacilities.filter(
    (facility) => !facility.nearestGateLandmark,
  );

  return (
    <section
      aria-label="SFO Terminal 2 D Gates schematic (T2 only)"
      className={`gw-surface-card min-w-0 p-4 sm:p-6 ${className}`}
    >
      <header className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          SFO · Terminal 2 · Post-security
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-card-foreground">
          D Gates at a glance
        </h2>
        <p className="text-sm text-muted-foreground" role="note">
          Schematic only — covers{" "}
          <strong className="font-medium text-card-foreground">
            Terminal 2 D Gates
          </strong>{" "}
          facilities in this dataset. It does not map Harvey Milk Terminal 1,
          Terminal 3, or International terminals and is not an official floor plan,
          walking guide, or proof that terminals are connected.
        </p>
      </header>

      {dataset.errors.length > 0 ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          Some facility records could not be validated and are not shown.
        </p>
      ) : null}

      <figure className="mt-5 min-w-0 rounded-lg border border-border bg-muted/30 p-3 sm:p-4">
        <figcaption className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-card-foreground">D Gates</span>
          <span className="text-sm text-muted-foreground">
            {t2DGatesFacilities.length} T2 D facilities · grouped by source location
          </span>
        </figcaption>

        <p className="mb-4 text-sm text-muted-foreground">
          Gate landmarks are listed in numeric order, not walking order. Only
          landmarks named in this facility dataset are shown.
        </p>

        <div className="grid min-w-0 grid-cols-1 items-start gap-4 md:grid-cols-2">
          {landmarkGroups.map((landmark) => (
            <section
              key={landmark}
              aria-label={`Facilities near Gate ${landmark}`}
              className="min-w-0 rounded-lg border border-border bg-card p-4"
            >
              <h3 className="mb-3 flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-lg font-semibold text-primary">{landmark}</span>
                <span className="text-sm font-medium text-muted-foreground">Published gate landmark</span>
              </h3>
              <FacilityList facilities={t2DGatesFacilities.filter(
                (facility) => facility.nearestGateLandmark === landmark,
              )} />
            </section>
          ))}

          {withoutLandmark.length > 0 ? (
            <section
              aria-label="Facilities without a published nearest gate"
              className="min-w-0 rounded-lg border border-dashed border-border bg-card p-4"
            >
              <h3 className="mb-2 text-base font-semibold text-card-foreground">
                Retail Street
              </h3>
              <p className="mb-3 text-sm text-muted-foreground">
                These listings do not name a nearest gate. No gate assignment is inferred.
              </p>
              <FacilityList facilities={withoutLandmark} />
            </section>
          ) : null}
        </div>
      </figure>

      <p className="mt-4 text-sm text-muted-foreground" role="note">
        Official source badges describe published location facts. Queue and activity
        times are unknown in this dataset; walking times are unverified demo estimates
        in the separate time model. This schematic makes no boarding-time recommendation.
      </p>
    </section>
  );
}
