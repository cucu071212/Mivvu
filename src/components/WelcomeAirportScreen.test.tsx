// @vitest-environment jsdom
import assert from "node:assert/strict";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, it } from "vitest";
import { AirportSelectionProvider } from "@/context/airport-selection";
import { GateWiseSessionProvider } from "@/context/gatewise-session";
import { AirportSelectionLayout } from "@/components/AirportSelectionLayout";
import { clearStoredAirportSelection } from "@/lib/airport-selection-preference";
import { prepareProductionFacilities } from "@/lib/browse-integration";
import facilitiesJson from "@/data/facilities.json";

const { facilities, datasetErrors } = prepareProductionFacilities(facilitiesJson);

function LayoutFixture() {
  return (
    <AirportSelectionProvider>
      <GateWiseSessionProvider facilities={facilities} datasetErrors={datasetErrors}>
        <AirportSelectionLayout>
          <h1>Flight context</h1>
        </AirportSelectionLayout>
      </GateWiseSessionProvider>
    </AirportSelectionProvider>
  );
}

describe("WelcomeAirportScreen (GW-C-003 full page)", () => {
  afterEach(() => {
    cleanup();
    clearStoredAirportSelection();
  });

  it("shows a full-page welcome before the dashboard on first visit", async () => {
    render(<LayoutFixture />);
    const welcome = await screen.findByRole("heading", {
      name: /Where are you flying from/i,
    });
    assert.ok(welcome);
    assert.equal(screen.queryByRole("heading", { name: "Flight context" }), null);
    assert.equal(screen.queryByRole("navigation", { name: /Primary/i }), null);
    assert.ok(screen.getByText(/San Francisco International Airport \(SFO\)/i));
    fireEvent.click(
      screen.getByRole("button", { name: /Continue to Flight dashboard/i }),
    );
    assert.ok(screen.getByRole("heading", { name: "Flight context" }));
  });

  it("does not show a second airport option", async () => {
    render(<LayoutFixture />);
    await screen.findByRole("heading", { name: /Where are you flying from/i });
    assert.equal(screen.getAllByRole("radio").length, 1);
    assert.equal(screen.getAllByRole("radio")[0].getAttribute("value"), "SFO");
  });
});
