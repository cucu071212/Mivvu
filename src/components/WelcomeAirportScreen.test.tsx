// @vitest-environment jsdom
import assert from "node:assert/strict";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, it } from "vitest";
import { AirportSelectionProvider } from "@/context/airport-selection";
import { WelcomeAirportScreen } from "@/components/WelcomeAirportScreen";
import { clearStoredAirportSelection, readStoredAirportSelection } from "@/lib/airport-selection-preference";

function WelcomeFixture() {
  return (
    <AirportSelectionProvider>
      <WelcomeAirportScreen />
    </AirportSelectionProvider>
  );
}

describe("WelcomeAirportScreen (searchable directory)", () => {
  afterEach(() => {
    cleanup();
    clearStoredAirportSelection();
  });

  it("shows searchable directory and enters app only with SFO", async () => {
    render(<WelcomeFixture />);
    await screen.findByRole("heading", { name: /Where are you flying from/i });
    assert.ok(screen.getByLabelText(/Search airports/i));
    assert.ok(screen.getByText(/Starting with San Francisco/i));
    fireEvent.click(screen.getByRole("button", { name: /Continue to Flight dashboard/i }));
    assert.ok(readStoredAirportSelection() !== null);
  });

  it("filters airports by city and blocks continue for coming-soon selection", async () => {
    render(<WelcomeFixture />);
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
    render(<WelcomeFixture />);
    await screen.findByRole("heading", { name: /Where are you flying from/i });
    fireEvent.change(screen.getByLabelText(/Search airports/i), {
      target: { value: "zzz-no-match" },
    });
    assert.ok(screen.getByText(/No airports match your search/i));
  });
});
