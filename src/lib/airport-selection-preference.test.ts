// @vitest-environment jsdom
import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import {
  AIRPORT_SELECTION_STORAGE_KEY,
  clearStoredAirportSelection,
  parseStoredAirportSelection,
  persistAirportSelection,
} from "./airport-selection-preference";

describe("airport-selection-preference (GW-C-003)", () => {
  afterEach(() => {
    clearStoredAirportSelection();
  });

  it("accepts only SFO with a calendar acknowledged date", () => {
    assert.equal(
      parseStoredAirportSelection(
        JSON.stringify({ airportIata: "SFO", acknowledgedAt: "2026-10-25" }),
      )?.airportIata,
      "SFO",
    );
    assert.equal(parseStoredAirportSelection(JSON.stringify({ airportIata: "LAX" })), null);
    assert.equal(
      parseStoredAirportSelection(
        JSON.stringify({ airportIata: "SFO", acknowledgedAt: "not-a-date" }),
      ),
      null,
    );
  });

  it("persists and reads from localStorage when available", () => {
    persistAirportSelection("2026-10-25");
    const raw = window.localStorage.getItem(AIRPORT_SELECTION_STORAGE_KEY);
    assert.ok(raw);
    assert.equal(parseStoredAirportSelection(raw)?.acknowledgedAt, "2026-10-25");
  });
});
