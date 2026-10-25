import type { ProductionRecommendation } from "@/types/airport";
import { buildTimeBudgetTimeline } from "@/lib/time-budget-timeline";
import { formatSignedMinutes } from "@/lib/recommendation-present";

export type TimeBudgetTimelineProps = {
  recommendation: ProductionRecommendation;
  compact?: boolean;
};

export function TimeBudgetTimeline({
  recommendation,
  compact = false,
}: TimeBudgetTimelineProps) {
  const model = buildTimeBudgetTimeline(recommendation);
  if (!model) {
    return null;
  }

  const { segments, missingLabels, requiredMinutes, marginMinutes, scaleMinutes } =
    model;

  return (
    <div
      className={`gw-time-budget ${compact ? "gw-time-budget-compact" : ""}`}
      role="group"
      aria-label="Time budget breakdown"
    >
      <div
        className="gw-time-budget-track"
        role="img"
        aria-label={`Model time segments totaling ${scaleMinutes} minutes in this view`}
      >
        <ul className="gw-time-budget-bar">
          {segments.map((segment) => {
            const widthPct = (segment.minutes / scaleMinutes) * 100;
            const signedMargin =
              segment.id === "margin" && marginMinutes !== null
                ? formatSignedMinutes(marginMinutes)
                : null;
            return (
              <li
                key={segment.id}
                className={`gw-time-budget-segment gw-time-budget-segment-${segment.tone}`}
                style={{ flexBasis: `${widthPct}%` }}
                title={`${segment.label}: ${signedMargin ?? `${segment.minutes} min`}`}
              >
                <span className="gw-time-budget-segment-label">
                  {segment.label}
                </span>
                <span className="gw-time-budget-segment-value">
                  {signedMargin ?? `${segment.minutes} min`}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <dl className="gw-time-budget-legend">
        {segments.map((segment) => (
          <div key={`legend-${segment.id}`} className="gw-time-budget-legend-row">
            <dt>{segment.label}</dt>
            <dd>
              {segment.id === "margin" && marginMinutes !== null
                ? formatSignedMinutes(marginMinutes)
                : `${segment.minutes} min`}
            </dd>
          </div>
        ))}
      </dl>

      {requiredMinutes !== null ? (
        <p className="gw-time-budget-summary text-sm text-muted-foreground">
          <span className="font-medium text-card-foreground">
            Total required (model):
          </span>{" "}
          {requiredMinutes} min
          {marginMinutes !== null ? (
            <>
              {" "}
              ·{" "}
              <span className="font-medium text-card-foreground">Margin:</span>{" "}
              {formatSignedMinutes(marginMinutes)}
            </>
          ) : null}
        </p>
      ) : (
        <p className="gw-time-budget-summary text-sm text-muted-foreground" role="note">
          Total required and margin stay hidden until every essential duration is
          known.
        </p>
      )}

      {missingLabels.length > 0 ? (
        <p className="text-xs text-muted-foreground" role="note">
          Not modeled yet: {missingLabels.join("; ")}.
        </p>
      ) : null}
    </div>
  );
}
