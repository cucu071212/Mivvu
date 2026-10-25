/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TimeBudgetTimeline } from "@/components/TimeBudgetTimeline";
import type { ProductionFeasibilityRecommendation } from "@/types/airport";

const feasible: ProductionFeasibilityRecommendation = {
  kind: "feasibility",
  facilityId: "sfo-t2-d-burger-joint",
  facilityName: "Burger Joint",
  category: "food",
  zone: "D",
  locationConfidence: "official_verified",
  timeConfidence: "demo_estimate",
  securityZone: "post",
  status: "tight_in_model",
  breakdown: {
    outboundMinutes: 4,
    returnMinutes: 4,
    queueMinutes: 8,
    activityMinutes: 10,
    bufferMinutes: 10,
    requiredMinutes: 36,
    marginMinutes: 4,
  },
};

afterEach(cleanup);

describe("TimeBudgetTimeline", () => {
  it("labels negative margin as a deficit in the legend", () => {
    render(
      <TimeBudgetTimeline
        recommendation={{
          ...feasible,
          status: "over_budget",
          breakdown: { ...feasible.breakdown, marginMinutes: -6, requiredMinutes: 41 },
        }}
      />,
    );
    expect(screen.getAllByText(/Time deficit \(model\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/−6 min/).length).toBeGreaterThan(0);
  });

  it("renders labeled segments and margin summary for feasible recommendations", () => {
    render(<TimeBudgetTimeline recommendation={feasible} />);
    expect(screen.getByRole("group", { name: /time budget breakdown/i })).toBeTruthy();
    expect(screen.getAllByText(/Walking \(out \+ return\)/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Total required \(model\):/i)).toBeTruthy();
    expect(screen.getAllByText(/\+4 min/).length).toBeGreaterThan(0);
  });
});
