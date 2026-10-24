import type { ProductionRecommendation, UserContext } from "@/types/airport";

export type RecommendationComparison = {
  facilityId: string;
  facilityName: string;
  baseline: ProductionRecommendation;
  scenario: ProductionRecommendation;
  explanation: string;
};

export function recommendationOutcomeLabel(
  recommendation: ProductionRecommendation,
): string {
  if (recommendation.kind === "feasibility") {
    return recommendation.status;
  }
  if (recommendation.kind === "unknown") {
    return "unknown";
  }
  return "ineligible";
}

export function recommendationMarginMinutes(
  recommendation: ProductionRecommendation,
): number | null {
  if (recommendation.kind === "feasibility") {
    return recommendation.breakdown.marginMinutes;
  }
  if (recommendation.kind === "unknown") {
    return recommendation.breakdown.marginMinutes;
  }
  return null;
}

function formatMargin(margin: number | null): string {
  if (margin === null) {
    return "margin not modeled";
  }
  const prefix = margin > 0 ? "+" : "";
  return `${prefix}${margin} min margin`;
}

function explainPairDelta(
  baseline: ProductionRecommendation,
  scenario: ProductionRecommendation,
): string {
  const baselineLabel = recommendationOutcomeLabel(baseline);
  const scenarioLabel = recommendationOutcomeLabel(scenario);
  const baselineMargin = recommendationMarginMinutes(baseline);
  const scenarioMargin = recommendationMarginMinutes(scenario);

  if (baselineLabel === scenarioLabel && baselineMargin === scenarioMargin) {
    return "Model outcome unchanged for this facility.";
  }

  if (baselineLabel !== scenarioLabel) {
    return `Status moves from ${baselineLabel.replaceAll("_", " ")} to ${scenarioLabel.replaceAll("_", " ")} (${formatMargin(baselineMargin)} → ${formatMargin(scenarioMargin)}).`;
  }

  return `Status stays ${scenarioLabel.replaceAll("_", " ")} but margin shifts (${formatMargin(baselineMargin)} → ${formatMargin(scenarioMargin)}).`;
}

export function buildWhatIfInputSummary(
  baseline: UserContext,
  scenario: UserContext,
): string {
  const parts: string[] = [];
  if (baseline.minutesUntilBoarding !== scenario.minutesUntilBoarding) {
    parts.push(
      `Minutes until boarding starts: ${baseline.minutesUntilBoarding} → ${scenario.minutesUntilBoarding}`,
    );
  }
  if (baseline.queueAdjustmentMinutes !== scenario.queueAdjustmentMinutes) {
    parts.push(
      `Simulated queue adjustment: ${baseline.queueAdjustmentMinutes} → ${scenario.queueAdjustmentMinutes} min`,
    );
  }
  if (parts.length === 0) {
    return "Scenario matches baseline inputs.";
  }
  return parts.join(". ");
}

export function compareRecommendationRuns(
  baseline: readonly ProductionRecommendation[],
  scenario: readonly ProductionRecommendation[],
  inputSummary?: string,
): RecommendationComparison[] {
  const scenarioById = new Map(
    scenario.map((row) => [row.facilityId, row]),
  );

  return baseline.map((baseRow) => {
    const scenarioRow = scenarioById.get(baseRow.facilityId);
    if (!scenarioRow) {
      throw new Error(`Missing scenario recommendation for ${baseRow.facilityId}`);
    }
    const delta = explainPairDelta(baseRow, scenarioRow);
    const explanation =
      inputSummary && inputSummary !== "Scenario matches baseline inputs."
        ? `${inputSummary} ${delta}`
        : delta;
    return {
      facilityId: baseRow.facilityId,
      facilityName: baseRow.facilityName,
      baseline: baseRow,
      scenario: scenarioRow,
      explanation,
    };
  });
}
