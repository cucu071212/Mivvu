import type { ProductionRecommendation } from "@/types/airport";
import {
  formatMinuteValue,
  formatSignedMinutes,
  ineligibilityReasonLabel,
  unknownReasonLabel,
} from "@/lib/recommendation-present";

type BreakdownRow = {
  label: string;
  value: string;
};

function feasibilityRows(
  recommendation: ProductionRecommendation & { kind: "feasibility" },
): BreakdownRow[] {
  const { breakdown } = recommendation;
  return [
    { label: "Outbound travel", value: `${breakdown.outboundMinutes} min` },
    { label: "Return travel", value: `${breakdown.returnMinutes} min` },
    { label: "Queue / wait", value: `${breakdown.queueMinutes} min` },
    { label: "Activity at facility", value: `${breakdown.activityMinutes} min` },
    { label: "Safety buffer", value: `${breakdown.bufferMinutes} min` },
    { label: "Total required (model)", value: `${breakdown.requiredMinutes} min` },
    {
      label: "Remaining margin (model)",
      value: formatSignedMinutes(breakdown.marginMinutes),
    },
  ];
}

function unknownRows(
  recommendation: ProductionRecommendation & { kind: "unknown" },
): BreakdownRow[] {
  const { breakdown } = recommendation;
  return [
    { label: "Outbound travel", value: formatMinuteValue(breakdown.outboundMinutes) },
    { label: "Return travel", value: formatMinuteValue(breakdown.returnMinutes) },
    { label: "Queue / wait", value: formatMinuteValue(breakdown.queueMinutes) },
    {
      label: "Activity at facility",
      value: formatMinuteValue(breakdown.activityMinutes),
    },
    { label: "Safety buffer", value: `${breakdown.bufferMinutes} min` },
    { label: "Total required (model)", value: formatMinuteValue(breakdown.requiredMinutes) },
    {
      label: "Remaining margin (model)",
      value: formatSignedMinutes(breakdown.marginMinutes),
    },
  ];
}

export type AmenityDetailProps = {
  recommendation: ProductionRecommendation;
};

export function AmenityDetail({ recommendation }: AmenityDetailProps) {
  if (recommendation.kind === "ineligible") {
    return (
      <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
        <p className="font-medium text-card-foreground">Why this is ineligible</p>
        <p className="mt-1">
          {ineligibilityReasonLabel(recommendation.ineligibilityReason)}
        </p>
      </div>
    );
  }

  if (recommendation.kind === "unknown") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground" role="note">
          {unknownReasonLabel(recommendation.unknownReason)} Totals and margin stay
          unshown until every required duration is known.
        </p>
        <dl className="grid gap-2 font-mono text-sm">
          {unknownRows(recommendation).map((row) => (
            <div
              key={row.label}
              className="flex items-start justify-between gap-3 border-b border-border/60 pb-2 last:border-0"
            >
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-right text-card-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  return (
    <dl className="grid gap-2 font-mono text-sm">
      {feasibilityRows(recommendation).map((row) => (
        <div
          key={row.label}
          className="flex items-start justify-between gap-3 border-b border-border/60 pb-2 last:border-0"
        >
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="text-right font-medium text-card-foreground">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
