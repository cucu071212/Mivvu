import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  parseValidIcnFacilityContentFingerprint,
  validateIcnFacilityContentFingerprint,
} from "./icn-facility-content-fingerprint-validate";
import { icnFacilityContentFingerprint } from "./icn-snapshot-matching";
import { loadIcnFacilitiesKoFixture } from "./load-icn-facilities-fixture";

describe("bare canonical content fingerprint validation", () => {
  it("accepts fingerprints produced by the shipped generator", () => {
    const row = loadIcnFacilitiesKoFixture().facilities[0];
    const fp = icnFacilityContentFingerprint(row);
    assert.equal(validateIcnFacilityContentFingerprint(fp), true);
    assert.equal(parseValidIcnFacilityContentFingerprint(fp)?.sourceId, row.sourceId);
  });

  it("rejects reordered JSON keys even when values match", () => {
    const row = loadIcnFacilitiesKoFixture().facilities[0];
    const parsed = JSON.parse(icnFacilityContentFingerprint(row)) as Record<string, unknown>;
    const keys = Object.keys(parsed);
    const reversed = keys.reverse().reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = parsed[key];
      return acc;
    }, {});
    const tampered = JSON.stringify(reversed);
    assert.equal(validateIcnFacilityContentFingerprint(tampered), false);
  });
});
