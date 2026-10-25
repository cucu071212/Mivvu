import type { ProductionRecommendation } from "@/types/airport";
import {
  recommendationMarginMinutes,
  recommendationOutcomeLabel,
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
