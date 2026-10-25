import { describe, expect, it } from "vitest";
import { APPROVED_LEGACY_RECOMMEND_FACILITY_IDS } from "@/data/approved-recommend-facility-ids";
import facilities from "@/data/facilities.json";
import {
  getFacilityLocationEvidence,
  listFacilityLocationEvidence,
} from "@/lib/facility-location";

const expected = [
  ["sfo-t2-d-16th-dolores-general-store", "Near Gate D16", "D16", null],
  ["sfo-t2-d-andale-mexican-kitchen-bar", "Near Gate D16", "D16", "D2"],
  ["sfo-t2-d-brookstone", "Near Gate D1", "D1", "E2"],
  ["sfo-t2-d-burger-joint", "Near Gate D15", "D15", "D2"],
  ["sfo-t2-d-cat-cora", "Near Gate D9", "D9", null],
  ["sfo-t2-d-kiehls", "Retail Street", null, "D3"],
  ["sfo-t2-d-lark-creek-grill", "Near Gate D1", "D1", "E2"],
  ["sfo-t2-d-napa-farms-market", "Retail Street", null, "E3"],
  ["sfo-t2-d-peets-coffee-d7", "Near Gate D7", "D7", null],
  ["sfo-t2-d-sunglass-hut", "Retail Street", null, null],
  ["sfo-t2-d-the-chocolate-market", "Retail Street", null, null],
  ["sfo-t2-d-wakaba", "Near Gate D9", "D9", "D1"],
] as const;

const officialMapUrl =
  "https://www.flysfo.com/sites/default/files/2025-11/251027_SFO_Tabloid_Face%20A_T2_Web.pdf";

describe("SFO T2 D Gates facility location evidence", () => {
  it("covers exactly the 12 authorized recommendation IDs once", () => {
    const rows = listFacilityLocationEvidence();
    expect(rows).toHaveLength(12);
    expect(rows.map((row) => row.facilityId)).toEqual(
      APPROVED_LEGACY_RECOMMEND_FACILITY_IDS,
    );
    expect(new Set(rows.map((row) => row.facilityId)).size).toBe(12);
  });

  it.each(expected)("preserves official broad-area evidence for %s", (id, area, gate, grid) => {
    const row = getFacilityLocationEvidence(id);
    expect(row).toMatchObject({
      facilityId: id,
      terminalLabel: "Terminal 2",
      gateAreaLabel: "D Gates",
      areaLabel: area,
      locationConfidence: "verified_area",
    });
    if (row.locationConfidence !== "verified_area") throw new Error(`Missing ${id}`);
    expect(row.nearGate ?? null).toBe(gate);
    expect(row.mapGridCell ?? null).toBe(grid);
    expect(row.mapSourceUrl ?? null).toBe(grid ? officialMapUrl : null);
    const facility = facilities.find((candidate) => candidate.id === id);
    expect(row.sourceUrl).toBe(facility?.sourceUrl);
    expect(row.sourceUrl).toMatch(/^https:\/\/www\.flysfo\.com\//);
    expect(row.evidenceNotes.length).toBeGreaterThan(20);
    expect(row).not.toHaveProperty("walkingMinutes");
    expect(row).not.toHaveProperty("coordinates");
  });

  it("keeps unresolved multi-entry map bindings absent", () => {
    for (const id of [
      "sfo-t2-d-peets-coffee-d7",
      "sfo-t2-d-sunglass-hut",
      "sfo-t2-d-the-chocolate-market",
    ]) {
      const row = getFacilityLocationEvidence(id);
      expect(row).not.toHaveProperty("mapGridCell");
      expect(row.evidenceNotes).toMatch(/unresolved|multiple/i);
    }
  });

  it("returns Unknown without a source or invented area for IDs lacking evidence", () => {
    for (const id of ["missing-facility", "__proto__", "toString"]) {
      expect(getFacilityLocationEvidence(id)).toEqual({
        facilityId: id,
        locationConfidence: "unknown",
        terminalLabel: null,
        gateAreaLabel: null,
        areaLabel: null,
        sourceUrl: null,
        evidenceNotes: "No supported location evidence for this facility ID.",
      });
    }
  });

  it("does not include browse-only records and returns a stable read-only list", () => {
    const rows = listFacilityLocationEvidence();
    expect(rows).toEqual(listFacilityLocationEvidence());
    expect(rows.every((row) => Object.isFrozen(row))).toBe(true);
    expect(Object.isFrozen(rows)).toBe(true);
    expect(getFacilityLocationEvidence("sfo-t2-d-vino-volo").locationConfidence).toBe("unknown");
  });
});
