import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";
import {
  countBrowseEligible,
  filterBrowseDirectory,
} from "@/lib/filter-browse-directory";
import { validateFacilities } from "@/lib/validate-facilities";

const productionJson = JSON.parse(
  readFileSync(new URL("../data/facilities.json", import.meta.url), "utf8"),
) as unknown;

describe("filterBrowseDirectory", () => {
  it("returns 23 browse-eligible production facilities with no filters", () => {
    const { facilities } = validateFacilities(productionJson);
    assert.equal(countBrowseEligible(facilities), 23);
    assert.equal(filterBrowseDirectory(facilities, {}).length, 23);
  });

  it("filters Harvey Milk Terminal 1 boarding area B", () => {
    const { facilities } = validateFacilities(productionJson);
    const matches = filterBrowseDirectory(facilities, {
      terminalCode: "harvey_milk_1",
      zone: "B",
    });
    assert.equal(matches.length, 2);
    assert.ok(matches.every((row) => row.terminalCode === "harvey_milk_1"));
    assert.ok(matches.every((row) => row.zone === "B"));
  });

  it("filters Terminal 2 D Gates only", () => {
    const { facilities } = validateFacilities(productionJson);
    const matches = filterBrowseDirectory(facilities, {
      terminalCode: "terminal_2",
      zone: "D",
    });
    assert.equal(matches.length, 18);
  });
});
