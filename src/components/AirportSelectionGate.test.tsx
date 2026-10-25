// @vitest-environment jsdom
import assert from "node:assert/strict";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, it } from "vitest";
import { AirportSelectionHost } from "@/components/AirportSelectionHost";
import { clearStoredAirportSelection } from "@/lib/airport-selection-preference";

function HostFixture() {
  return (
    <AirportSelectionHost>
      <main>
        <h1>Flight context</h1>
      </main>
    </AirportSelectionHost>
  );
}

describe("AirportSelectionGate (GW-C-003)", () => {
  afterEach(() => {
    cleanup();
    clearStoredAirportSelection();
  });

  it("shows SFO selection on first visit and dismisses on continue", async () => {
    render(<HostFixture />);
    assert.ok(await screen.findByRole("dialog", { name: /Where are you flying from/i }));
    assert.ok(screen.getByText(/San Francisco International Airport \(SFO\)/i));
    assert.ok(screen.getByText(/Other airports are not supported yet/i));
    fireEvent.click(
      screen.getByRole("button", { name: /Continue to Flight dashboard/i }),
    );
    assert.equal(screen.queryByRole("dialog"), null);
    assert.ok(screen.getByRole("heading", { name: "Flight context" }));
  });

  it("does not show a second airport option", async () => {
    render(<HostFixture />);
    await screen.findByRole("dialog");
    assert.equal(screen.getAllByRole("radio").length, 1);
    assert.equal(screen.getAllByRole("radio")[0].getAttribute("value"), "SFO");
  });
});
