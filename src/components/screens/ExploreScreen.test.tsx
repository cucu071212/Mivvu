// @vitest-environment jsdom
import assert from "node:assert/strict";
import { render, screen } from "@testing-library/react";
import { describe, it } from "vitest";
import facilitiesJson from "@/data/facilities.json";
import { GateWiseSessionProvider } from "@/context/gatewise-session";
import { ExploreScreen } from "@/components/screens/ExploreScreen";
import { prepareProductionFacilities } from "@/lib/browse-integration";

const raw = facilitiesJson;

describe("ExploreScreen (GW-X-003)", () => {
  it("shows SFO-wide directory scope and HM1 facility when unfiltered", () => {
    const { facilities, datasetErrors } = prepareProductionFacilities(raw);
    render(
      <GateWiseSessionProvider facilities={facilities} datasetErrors={datasetErrors}>
        <ExploreScreen />
      </GateWiseSessionProvider>,
    );
    assert.ok(screen.getByRole("heading", { name: "Browse vs recommend" }));
    assert.ok(screen.getByText(/23 of 23 facilities/i));
    assert.ok(screen.getByRole("heading", { name: "Bun Mee" }));
    assert.ok(screen.getAllByText(/Harvey Milk Terminal 1 · B Gates/i).length >= 1);
    assert.ok(screen.getAllByText(/Browse only — not in recommend scope/i).length >= 1);
  });

  it("explains T2-only recommendation scope", () => {
    const { facilities, datasetErrors } = prepareProductionFacilities(raw);
    render(
      <GateWiseSessionProvider facilities={facilities} datasetErrors={datasetErrors}>
        <ExploreScreen />
      </GateWiseSessionProvider>,
    );
    assert.ok(
      screen.getAllByText(/facilities participate in ranked time-based recommendations/i)
        .length >= 1,
    );
  });
});
