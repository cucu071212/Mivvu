import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { APPROVED_LEGACY_RECOMMEND_FACILITY_IDS } from "@/data/approved-recommend-facility-ids";
import {
  getFacilityLocationEvidence,
  listFacilityLocationEvidence,
} from "@/lib/location-guidance-evidence";

describe("location-guidance-evidence adapter (Codex seam)", () => {
  it("exposes Codex verified_area rows for the 12 authorized IDs", () => {
    const rows = listFacilityLocationEvidence();
    assert.equal(rows.length, 12);
    assert.deepEqual(
      rows.map((row) => row.facilityId),
      [...APPROVED_LEGACY_RECOMMEND_FACILITY_IDS],
    );
    const brookstone = getFacilityLocationEvidence("sfo-t2-d-brookstone");
    assert.equal(brookstone.locationConfidence, "verified_area");
    assert.equal(brookstone.areaLabel, "Near Gate D1");
    assert.equal(
      Object.prototype.hasOwnProperty.call(brookstone, "walkingMinutes"),
      false,
    );
  });

  it("returns Unknown without an invented area for IDs outside the evidence package", () => {
    const row = getFacilityLocationEvidence("sfo-t2-d-vino-volo");
    assert.equal(row.locationConfidence, "unknown");
    assert.equal(row.terminalLabel, null);
    assert.equal(row.gateAreaLabel, null);
    assert.equal(row.areaLabel, null);
    assert.equal(row.sourceUrl, null);
    assert.match(row.evidenceNotes, /no supported location evidence/i);
  });
});
