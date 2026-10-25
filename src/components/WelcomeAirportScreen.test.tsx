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

describe("WelcomeAirportScreen (searchable directory)", () => {
  afterEach(() => {
    cleanup();
    clearStoredAirportSelection();
  });

  it("shows searchable directory and enters app only with SFO", async () => {
    render(<LayoutFixture />);
    await screen.findByRole("heading", { name: /Where are you flying from/i });
    assert.ok(screen.getByLabelText(/Search airports/i));
    assert.ok(screen.getByText(/Starting with San Francisco/i));
    fireEvent.click(screen.getByRole("button", { name: /Continue to Flight dashboard/i }));
    assert.ok(screen.getByRole("heading", { name: "Flight context" }));
  });

  it("filters airports by city and blocks continue for coming-soon selection", async () => {
    render(<LayoutFixture />);
    await screen.findByRole("heading", { name: /Where are you flying from/i });
    fireEvent.change(screen.getByLabelText(/Search airports/i), {
      target: { value: "chicago" },
    });
    assert.ok(screen.getByText(/O'Hare International Airport/i));
    assert.equal(screen.getAllByRole("radio").length, 1);
    fireEvent.click(screen.getByRole("radio", { name: /ORD/i }));
    const continueBtn = screen.getByRole("button", {
      name: /Continue to Flight dashboard/i,
    });
    assert.equal((continueBtn as HTMLButtonElement).disabled, true);
    assert.ok(screen.getByText(/not available in GateWise yet/i));
  });

  it("shows empty state when search has no matches", async () => {
    render(<LayoutFixture />);
    await screen.findByRole("heading", { name: /Where are you flying from/i });
    fireEvent.change(screen.getByLabelText(/Search airports/i), {
      target: { value: "zzz-no-match" },
    });
    assert.ok(screen.getByText(/No airports match your search/i));
  });
});
