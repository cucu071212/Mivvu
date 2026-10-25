import type { ProductionRecommendation } from "@/types/airport";
import {
  recommendationMarginMinutes,
  recommendationOutcomeLabel,
  type RecommendationComparison,
} from "@/lib/what-if-compare";

export function whatIfStatusChanged(
  baseline: ProductionRecommendation,
  scenario: ProductionRecommendation,
): boolean {
  return (
    recommendationOutcomeLabel(baseline) !== recommendationOutcomeLabel(scenario)
  );
}

export function whatIfMarginDelta(
  baseline: ProductionRecommendation,
  scenario: ProductionRecommendation,
): number | null {
  const baseMargin = recommendationMarginMinutes(baseline);
  const scenarioMargin = recommendationMarginMinutes(scenario);
  if (baseMargin === null || scenarioMargin === null) {
    return null;
  }
  return scenarioMargin - baseMargin;
}

export function summarizeWhatIfComparisonAnnouncement(
  primary: readonly RecommendationComparison[],
): string {
  if (primary.length === 0) {
    return "No recommend-eligible facilities to compare in this scenario.";
  }
  let changes = 0;
  for (const row of primary) {
    if (whatIfStatusChanged(row.baseline, row.scenario)) {
      changes += 1;
    }
  }
  return `Scenario compared for ${primary.length} eligible facilities; ${changes} status change${changes === 1 ? "" : "s"}.`;
}
