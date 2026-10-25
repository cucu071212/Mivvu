import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  buildFacilityFilterQuery,
  buildFlightContextInput,
  prepareProductionFacilities,
} from "./browse-integration";
import { filterFacilities } from "./filter-facilities";
import { validateContext } from "./validate-context";

describe("browse integration (GW-010)", () => {
  it("loads all approved production facilities with no dataset errors", () => {
    const raw = JSON.parse(
      readFileSync(new URL("../data/facilities.json", import.meta.url), "utf8"),
    );
    const { facilities, datasetErrors } = prepareProductionFacilities(raw);
    assert.equal(datasetErrors.length, 0);
    assert.equal(facilities.length, 23);
  });

  it("validates flight context from string form fields with frozen defaults", () => {
    const result = validateContext(buildFlightContextInput("50", "10"));
    assert.deepEqual(result.errors, []);
    assert.equal(result.context?.gateZone, "D");
    assert.equal(result.context?.minutesUntilBoarding, 50);
    assert.equal(result.context?.bufferMinutes, 10);
    assert.equal(result.context?.passengerSecurityArea, "post");
  });

  it("rejects invalid boarding-start input through validateContext", () => {
    const result = validateContext(buildFlightContextInput("", "10"));
    assert.equal(result.context, null);
    assert.ok(
      result.errors.some((error) => error.field === "minutesUntilBoarding"),
    );
  });

  it("filters by facility name only, not location description", () => {
    const raw = JSON.parse(
      readFileSync(new URL("../data/facilities.json", import.meta.url), "utf8"),
    );
    const { facilities } = prepareProductionFacilities(raw);
    const retailStreetMatches = filterFacilities(
      facilities,
      buildFacilityFilterQuery("Retail Street", ""),
    );
    assert.equal(retailStreetMatches.length, 0);
    const peetsMatches = filterFacilities(
      facilities,
      buildFacilityFilterQuery("peet", ""),
    );
    assert.equal(peetsMatches.length, 2);
    assert.ok(peetsMatches.every((row) => row.name.includes("Peet")));
  });

  it("omits empty category from the filter query", () => {
    assert.deepEqual(buildFacilityFilterQuery("napa", ""), { text: "napa" });
    assert.deepEqual(buildFacilityFilterQuery("", "food"), { category: "food" });
  });

  it("combines category and name filters with AND", () => {
    const raw = JSON.parse(
      readFileSync(new URL("../data/facilities.json", import.meta.url), "utf8"),
    );
    const { facilities } = prepareProductionFacilities(raw);
    const query = buildFacilityFilterQuery("a", "shop");
    const matches = filterFacilities(facilities, query);
    assert.ok(matches.every((row) => row.category === "shop"));
    assert.ok(matches.every((row) => row.name.toLowerCase().includes("a")));
  });
});
