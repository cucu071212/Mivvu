import {
  twoStopIneligibilityLabel,
  twoStopLedgerBreakdownRows,
} from "@/lib/two-stop-present";
import { unknownReasonLabel } from "@/lib/recommendation-present";
import type { TwoStopOrderResult } from "@/types/two-stop-plan";
import { TwoStopItineraryStrip } from "@/components/TwoStopItineraryStrip";
import { TwoStopStatusBadge } from "@/components/TwoStopStatusBadge";

export type TwoStopOrderPanelProps = {
  orderLabel: string;
  firstStopName: string;
  secondStopName: string;
  result: TwoStopOrderResult;
  isBestOrder: boolean;
  idPrefix: string;
};

export function TwoStopOrderPanel({
  orderLabel,
  firstStopName,
  secondStopName,
  result,
  isBestOrder,
  idPrefix,
}: TwoStopOrderPanelProps) {
  const accent =
    result.kind === "feasibility"
      ? result.status === "feasible_in_model"
        ? "gw-card-accent-feasible"
        : result.status === "tight_in_model"
          ? "gw-card-accent-tight"
          : "gw-card-accent-over"
      : result.kind === "unknown"
        ? "gw-card-accent-unknown"
        : "gw-card-accent-ineligible";

  return (
    <article
      className={`gw-surface-card flex flex-col gap-3 p-4 sm:p-5 ${accent}`}
      aria-labelledby={`${idPrefix}-title`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h3 id={`${idPrefix}-title`} className="text-base font-semibold text-card-foreground">
            {orderLabel}
          </h3>
          {isBestOrder ? (
            <p className="text-xs font-medium text-primary" role="status">
              Lower modeled time among comparable orders
            </p>
          ) : null}
        </div>
        <TwoStopStatusBadge result={result} />
      </div>

      <div>
        <p
          id={`${idPrefix}-itinerary-heading`}
          className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          Itinerary
        </p>
        <TwoStopItineraryStrip
          firstStopName={firstStopName}
          secondStopName={secondStopName}
          idPrefix={idPrefix}
        />
      </div>

      {result.kind === "ineligible" ? (
        <p className="text-sm text-muted-foreground">
          {twoStopIneligibilityLabel(result.reason)}
        </p>
      ) : null}

      {result.kind === "unknown" ? (
        <p className="text-sm text-muted-foreground" role="note">
          {unknownReasonLabel(result.unknownReason)} Totals and margin stay unshown
          until every required duration is known.
        </p>
      ) : null}

      {result.kind === "feasibility" && result.status === "over_budget" ? (
        <p className="text-sm text-muted-foreground" role="note">
          This order needs more minutes than your baseline until boarding starts. Try
          more time, fewer stops, or adjust demo assumptions — still not a boarding
          guarantee.
        </p>
      ) : null}

      {result.kind !== "ineligible" ? (
        <dl className="grid gap-2 font-mono text-sm">
          {twoStopLedgerBreakdownRows(result).map((row) => (
            <div
              key={row.label}
              className="flex items-start justify-between gap-3 border-b border-border/60 pb-2 last:border-0"
            >
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-right text-card-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  );
}
