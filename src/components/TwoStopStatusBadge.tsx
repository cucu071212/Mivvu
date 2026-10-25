import {
  twoStopOrderStatusPresentation,
} from "@/lib/two-stop-present";
import type { TwoStopOrderResult } from "@/types/two-stop-plan";
type StatusKind = "feasible" | "tight" | "over" | "unknown" | "ineligible";

function statusKind(result: TwoStopOrderResult): StatusKind {
  if (result.kind === "feasibility") {
    if (result.status === "feasible_in_model") return "feasible";
    if (result.status === "tight_in_model") return "tight";
    return "over";
  }
  if (result.kind === "unknown") return "unknown";
  return "ineligible";
}

function StatusIcon({ kind }: { kind: StatusKind }) {
  const shared = "size-4 shrink-0";
  switch (kind) {
    case "feasible":
      return (
        <svg className={shared} viewBox="0 0 16 16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M6.2 11.2 3.4 8.4l1.1-1.1 1.7 1.7 4.3-4.3 1.1 1.1-5.4 5.4z"
          />
        </svg>
      );
    case "tight":
      return (
        <svg className={shared} viewBox="0 0 16 16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 2a1 1 0 0 1 1 1v3.25l1.5 1.5-1.06 1.06L7.5 8.31V4.5a1 1 0 0 1 1-1Z"
          />
        </svg>
      );
    case "over":
      return (
        <svg className={shared} viewBox="0 0 16 16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM5.1 5.1l5.8 5.8 1.1-1.1-5.8-5.8-1.1 1.1Zm5.8 0-1.1-1.1-5.8 5.8 1.1 1.1 5.8-5.8Z"
          />
        </svg>
      );
    case "unknown":
      return (
        <svg className={shared} viewBox="0 0 16 16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 2.25a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM7 7h2v5H7V7Z"
          />
        </svg>
      );
    default:
      return (
        <svg className={shared} viewBox="0 0 16 16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M3 3.5h10v1H3v-1Zm0 4h10v1H3v-1Zm0 4h6v1H3v-1Z"
          />
        </svg>
      );
  }
}

export function TwoStopStatusBadge({ result }: { result: TwoStopOrderResult }) {
  const status = twoStopOrderStatusPresentation(result);
  const kind = statusKind(result);
  return (
    <span
      role="img"
      className={`${status.chipClass} gap-1.5`}
      aria-label={status.accessibleLabel}
    >
      <StatusIcon kind={kind} />
      <span aria-hidden="true">{status.shortLabel}</span>
    </span>
  );
}
