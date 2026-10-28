import { readFileSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { IcnFacilitiesFixture } from "@/types/icn-facility-browse";
import { compareIcnLanguageFixtures } from "./icn-language-coverage";

function loadFixture(name: string): IcnFacilitiesFixture {
  const file = path.join(process.cwd(), "src/data/fixtures", name);
  return JSON.parse(readFileSync(file, "utf8")) as IcnFacilitiesFixture;
}

describe("ICN KO/EN language coverage", () => {
  it("compares fixtures and logs report for handoff", () => {
    const korean = loadFixture("icn-facilities-ko.json");
    const english = loadFixture("icn-facilities-en.json");

    const report = compareIcnLanguageFixtures(korean, english);
    console.log(JSON.stringify(report, null, 2));

    assert.equal(korean.meta.language, "K");
    assert.equal(english.meta.language, "E");
    assert.ok(report.ids.sharedSourceIds > 0);
    assert.equal(report.korean.deduplicatedListingCount, 1011);
  });
});
