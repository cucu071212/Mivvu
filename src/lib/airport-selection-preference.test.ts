// @vitest-environment jsdom
import assert from "node:assert/strict";
import { afterEach, describe, it, vi } from "vitest";
import {
  AIRPORT_SELECTION_STORAGE_KEY,
  acknowledgeAirportSelection,
  clearStoredAirportSelection,
  isAirportSelectionAcknowledged,
  parseStoredAirportSelection,
  persistAirportSelection,
  readStoredAirportSelection,
} from "./airport-selection-preference";

describe("airport-selection-preference (GW-C-003)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
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

  it("records session acknowledgment when persistence fails", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });
    acknowledgeAirportSelection("2026-10-25");
    assert.equal(readStoredAirportSelection(), null);
    assert.equal(isAirportSelectionAcknowledged(), true);
  });

  it("records session acknowledgment when the localStorage property getter throws", () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("denied", "SecurityError");
      },
    });
    try {
      acknowledgeAirportSelection("2026-10-25");
      assert.equal(isAirportSelectionAcknowledged(), true);
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(window, "localStorage", originalDescriptor);
      }
    }
  });
});
