import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  createIcnFacilityRef,
  serializeIcnFacilityRef,
} from "./icn-facility-reference";
import {
  icnSavedFacilityRefsRepresentSameEntry,
  icnSavedFacilitySerializedRefsRepresentSameEntry,
  parseIcnSavedFacilityRefEnvelope,
} from "./icn-saved-facility-identity";
import { loadIcnFacilitiesEnFixture, loadIcnFacilitiesKoFixture } from "./load-icn-facilities-fixture";
import { collapseDuplicateListings } from "./icn-snapshot-matching";

function catalogs() {
  const ko = loadIcnFacilitiesKoFixture();
  const en = loadIcnFacilitiesEnFixture();
  return {
    K: collapseDuplicateListings(ko.facilities),
    E: collapseDuplicateListings(en.facilities),
  };
}

describe("icnSavedFacilityRefsRepresentSameEntry", () => {
  it("treats validated KO and EN refs to the same listing as one saved identity", () => {
    const data = catalogs();
    const ko3289 = data.K.find((r) => r.sourceId === "3289");
    const en3289 = data.E.find((r) => r.sourceId === "3289");
    assert.ok(ko3289 && en3289);
    const refKo = createIcnFacilityRef(ko3289, data);
    const refEn = createIcnFacilityRef(en3289, data);
    assert.equal(icnSavedFacilityRefsRepresentSameEntry(refKo, refEn), true);
    const serKo = serializeIcnFacilityRef(refKo);
    const serEn = serializeIcnFacilityRef(refEn);
    assert.equal(icnSavedFacilitySerializedRefsRepresentSameEntry(serKo, serEn), true);
  });

  it("does not merge duplicate sourceId rows with different content fingerprints", () => {
    const data = catalogs();
    const sharedId = "gw-icn-016-dup-test";
    const first = { ...data.K[0]!, sourceId: sharedId, name: "Alpha" };
    const second = { ...data.K[1]!, sourceId: sharedId, name: "Beta" };
    const scoped = { K: [first, second], E: data.E };
    const refA = createIcnFacilityRef(first, scoped);
    const refB = createIcnFacilityRef(second, scoped);
    assert.equal(icnSavedFacilityRefsRepresentSameEntry(refA, refB), false);
  });

  it("does not merge unpaired refs that only share sourceId via substring collision", () => {
    const data = catalogs();
    const ko = data.K.find((r) => r.sourceId === "3289");
    const other = data.K.find((r) => r.sourceId !== "3289");
    assert.ok(ko && other);
    const unpairedKo = createIcnFacilityRef(ko, { K: data.K, E: [] });
    const unpairedOther = createIcnFacilityRef(other, { K: data.K, E: [] });
    assert.equal(unpairedKo.pairedContentFingerprint, undefined);
    assert.equal(icnSavedFacilityRefsRepresentSameEntry(unpairedKo, unpairedOther), false);
  });

  it("returns null envelope for invalid serialized refs", () => {
    assert.equal(parseIcnSavedFacilityRefEnvelope("{"), null);
    assert.equal(icnSavedFacilitySerializedRefsRepresentSameEntry("{", "{}"), false);
  });
});
