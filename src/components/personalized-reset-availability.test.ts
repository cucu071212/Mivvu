import { describe, expect, it } from "vitest";

/** Mirrors PersonalizedTimeControls reset button enablement. */
export function resetAllOverridesEnabled(
  overrideCount: number,
  draftsValid: boolean,
  hasDraftEdits: boolean,
): boolean {
  return !(overrideCount === 0 && draftsValid && !hasDraftEdits);
}

describe("personalized reset availability", () => {
  it("enables reset when only invalid drafts exist (no committed overrides)", () => {
    expect(resetAllOverridesEnabled(0, false, true)).toBe(true);
  });

  it("stays disabled when there is nothing to reset", () => {
    expect(resetAllOverridesEnabled(0, true, false)).toBe(false);
  });
});
