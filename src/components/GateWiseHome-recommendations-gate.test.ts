import { describe, expect, it } from "vitest";

/** Mirrors GateWiseHome recommendation gating for countdown recovery. */
export function showRankedRecommendations(input: {
  datasetValid: boolean;
  contextValid: boolean;
  personalizationDraftsValid: boolean;
  baselineRecoveryRequired: boolean;
}): boolean {
  return (
    input.datasetValid &&
    input.contextValid &&
    input.personalizationDraftsValid &&
    !input.baselineRecoveryRequired
  );
}

describe("GateWiseHome recommendations gate", () => {
  it("suppresses recommendations while baseline recovery is required", () => {
    expect(
      showRankedRecommendations({
        datasetValid: true,
        contextValid: true,
        personalizationDraftsValid: true,
        baselineRecoveryRequired: true,
      }),
    ).toBe(false);
  });

  it("allows recommendations after recovery cleared", () => {
    expect(
      showRankedRecommendations({
        datasetValid: true,
        contextValid: true,
        personalizationDraftsValid: true,
        baselineRecoveryRequired: false,
      }),
    ).toBe(true);
  });
});
