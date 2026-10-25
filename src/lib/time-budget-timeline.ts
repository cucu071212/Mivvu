import type { ProductionRecommendation } from "@/types/airport";

export type TimelineSegmentTone =
  | "walk"
  | "queue"
  | "activity"
  | "buffer"
  | "margin-positive"
  | "margin-negative"
  | "margin-zero";

export type TimelineSegment = {
  id: string;
  label: string;
  minutes: number;
  tone: TimelineSegmentTone;
};

export type TimeBudgetTimelineModel = {
  segments: TimelineSegment[];
  missingLabels: string[];
  requiredMinutes: number | null;
  marginMinutes: number | null;
  /** Sum of segment minutes used for proportional widths (excludes missing). */
  scaleMinutes: number;
};

const MISSING_OUTBOUND = "Outbound walking time";
const MISSING_RETURN = "Return walking time";
const MISSING_QUEUE = "Queue / wait time";
const MISSING_ACTIVITY = "Activity time";

function walkingSegments(
  outbound: number | null,
  returnMinutes: number | null,
  missing: string[],
): TimelineSegment[] {
  if (outbound !== null && returnMinutes !== null) {
    return [
      {
        id: "walk",
        label: "Walking (out + return)",
        minutes: outbound + returnMinutes,
        tone: "walk",
      },
    ];
  }
  if (outbound !== null) {
    missing.push(MISSING_RETURN);
    return [
      { id: "walk-out", label: "Walking (outbound)", minutes: outbound, tone: "walk" },
    ];
  }
  if (returnMinutes !== null) {
    missing.push(MISSING_OUTBOUND);
    return [
      { id: "walk-return", label: "Walking (return)", minutes: returnMinutes, tone: "walk" },
    ];
  }
  missing.push(MISSING_OUTBOUND, MISSING_RETURN);
  return [];
}

function pushIfKnown(
  segments: TimelineSegment[],
  missing: string[],
  id: string,
  label: string,
  minutes: number | null,
  tone: TimelineSegmentTone,
  missingLabel: string,
): void {
  if (minutes === null) {
    missing.push(missingLabel);
    return;
  }
  segments.push({ id, label, minutes, tone });
}

function marginTone(margin: number): TimelineSegmentTone {
  if (margin > 0) return "margin-positive";
  if (margin < 0) return "margin-negative";
  return "margin-zero";
}

export function marginSegmentLabel(marginMinutes: number): string {
  if (marginMinutes < 0) return "Time deficit (model)";
  if (marginMinutes > 0) return "Remaining margin (model)";
  return "No remaining margin (model)";
}

export function buildTimeBudgetTimeline(
  recommendation: ProductionRecommendation,
): TimeBudgetTimelineModel | null {
  if (recommendation.kind === "ineligible") {
    return null;
  }

  const missingLabels: string[] = [];
  const segments: TimelineSegment[] = [];
  const breakdown = recommendation.breakdown;

  segments.push(
    ...walkingSegments(
      breakdown.outboundMinutes,
      breakdown.returnMinutes,
      missingLabels,
    ),
  );

  pushIfKnown(
    segments,
    missingLabels,
    "queue",
    "Queue / wait",
    breakdown.queueMinutes,
    "queue",
    MISSING_QUEUE,
  );
  pushIfKnown(
    segments,
    missingLabels,
    "activity",
    "Activity at facility",
    breakdown.activityMinutes,
    "activity",
    MISSING_ACTIVITY,
  );

  segments.push({
    id: "buffer",
    label: "Safety buffer",
    minutes: breakdown.bufferMinutes,
    tone: "buffer",
  });

  if (breakdown.marginMinutes !== null) {
    segments.push({
      id: "margin",
      label: marginSegmentLabel(breakdown.marginMinutes),
      minutes: Math.abs(breakdown.marginMinutes),
      tone: marginTone(breakdown.marginMinutes),
    });
  } else {
    missingLabels.push("Remaining margin (incomplete model inputs)");
  }

  const scaleMinutes = segments.reduce((sum, row) => sum + row.minutes, 0);

  return {
    segments,
    missingLabels: [...new Set(missingLabels)],
    requiredMinutes: breakdown.requiredMinutes,
    marginMinutes: breakdown.marginMinutes,
    scaleMinutes: scaleMinutes > 0 ? scaleMinutes : 1,
  };
}
