import { readFileSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { describe, it } from "vitest";

type FixtureRow = {
  sourceId: string;
  listingIndex: number;
  name: string;
  terminalId: string | null;
  floor: string | null;
  locationDescription: string | null;
  categories: { large: string | null; medium: string | null; small: string | null };
};

function contentFingerprint(row: FixtureRow): string {
  return JSON.stringify({
    name: row.name,
    terminalId: row.terminalId,
    floor: row.floor,
    locationDescription: row.locationDescription,
    categories: row.categories,
  });
}

describe("icn-facilities-ko fixture duplicate sn", () => {
  it("documents API duplicate sn as repeated rows (not parser dedupe)", () => {
    const fixturePath = path.join(process.cwd(), "src/data/fixtures/icn-facilities-ko.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as {
      meta: { recordCount: number; distinctSourceIdCount?: number };
      facilities: FixtureRow[];
    };

    const groups = new Map<string, FixtureRow[]>();
    for (const row of fixture.facilities) {
      const list = groups.get(row.sourceId) ?? [];
      list.push(row);
      groups.set(row.sourceId, list);
    }

    const duplicateGroups = [...groups.entries()].filter(([, rows]) => rows.length > 1);
    assert.equal(fixture.facilities.length, 1028);
    assert.equal(groups.size, 1011);
    assert.equal(duplicateGroups.length, 17);

    for (const [, rows] of duplicateGroups) {
      const fingerprints = new Set(rows.map(contentFingerprint));
      assert.equal(
        fingerprints.size,
        1,
        "duplicate sn rows in fixture share identical normalized content (API repeats)",
      );
      for (let i = 1; i < rows.length; i += 1) {
        assert.equal(rows[i].listingIndex, rows[i - 1].listingIndex + 1);
      }
    }
  });
});
