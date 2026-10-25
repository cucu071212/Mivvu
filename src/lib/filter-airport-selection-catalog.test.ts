import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { AIRPORT_SELECTION_CATALOG } from "@/data/airport-selection-catalog";
import { filterAirportSelectionCatalog } from "./filter-airport-selection-catalog";

describe("filterAirportSelectionCatalog", () => {
  it("returns the full catalog when the query is blank", () => {
    assert.equal(filterAirportSelectionCatalog("").length, 4);
    assert.equal(filterAirportSelectionCatalog("   ").length, 4);
  });

  it("filters by IATA code case-insensitively", () => {
    const result = filterAirportSelectionCatalog("sfo");
    assert.equal(result.length, 1);
    assert.equal(result[0]?.iata, "SFO");
  });

  it("filters by airport name", () => {
    const result = filterAirportSelectionCatalog("Kennedy");
    assert.equal(result.length, 1);
    assert.equal(result[0]?.iata, "JFK");
  });

  it("filters by city", () => {
    const result = filterAirportSelectionCatalog("chicago");
    assert.equal(result.length, 1);
    assert.equal(result[0]?.iata, "ORD");
  });

  it("returns an empty list when nothing matches", () => {
    assert.deepEqual(filterAirportSelectionCatalog("DEN"), []);
  });

  it("keeps SFO first in the source catalog order", () => {
    assert.equal(AIRPORT_SELECTION_CATALOG[0]?.iata, "SFO");
  });
});
