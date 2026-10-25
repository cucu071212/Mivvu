// @vitest-environment jsdom
import assert from "node:assert/strict";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, it } from "vitest";
import facilitiesJson from "@/data/facilities.json";
import { GateWiseSessionProvider } from "@/context/gatewise-session";
import { ExploreScreen } from "@/components/screens/ExploreScreen";
import { prepareProductionFacilities } from "@/lib/browse-integration";

const raw = facilitiesJson;

describe("ExploreScreen (GW-X-003)", () => {
  afterEach(() => cleanup());

  it("shows SFO-wide directory scope and HM1 facility when unfiltered", () => {
    const { facilities, datasetErrors } = prepareProductionFacilities(raw);
    render(
      <GateWiseSessionProvider facilities={facilities} datasetErrors={datasetErrors}>
        <ExploreScreen />
      </GateWiseSessionProvider>,
    );
    assert.ok(screen.getByRole("heading", { name: "Browse vs recommend" }));
    assert.ok(screen.getByText(/26 of 26 facilities/i));
    assert.ok(screen.getByRole("heading", { name: "Bun Mee" }));
    assert.ok(screen.getAllByText(/Harvey Milk Terminal 1 · B Gates/i).length >= 1);
    assert.ok(screen.getAllByText(/Browse only — not in recommend scope/i).length >= 1);
  });

  it("opens a detail dialog with provenance from the directory card", () => {
    const { facilities, datasetErrors } = prepareProductionFacilities(raw);
    render(
      <GateWiseSessionProvider facilities={facilities} datasetErrors={datasetErrors}>
        <ExploreScreen />
      </GateWiseSessionProvider>,
    );
    const directory = screen.getAllByTestId("explore-facility-directory")[0];
    assert.ok(directory);
    const bunMeeCard = within(directory).getByRole("article", { name: "Bun Mee" });
    fireEvent.click(
      within(bunMeeCard).getByRole("button", { name: "View facility details" }),
    );
    const dialog = screen.getByRole("dialog", { name: /Bun Mee/i });
    assert.ok(dialog);
    assert.ok(within(dialog).getByRole("link", { name: /Official SFO listing/i }));
    assert.ok(within(dialog).getByText(/discovery only/i));
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
