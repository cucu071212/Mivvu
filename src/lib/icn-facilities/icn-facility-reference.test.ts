import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { IcnFacilityBrowseRecord } from "@/types/icn-facility-browse";
import { ICN_FACILITIES_API_OPERATION, ICN_FACILITIES_DATASET_ID } from "@/types/icn-facility-browse";
import { icnFacilityContentFingerprint } from "./icn-snapshot-matching";
import { buildIcnBrowseCatalog, filterIcnBrowseItems } from "./icn-browse-view-model";
import { loadIcnFacilitiesKoFixture, loadIcnFacilitiesEnFixture } from "./load-icn-facilities-fixture";
import {
  createIcnFacilityRef, parseIcnFacilityRef, serializeIcnFacilityRef, resolveIcnFacilityRef,
  type IcnFacilityReferenceCatalogs,
} from "./icn-facility-reference";

// Synthetic normalized directory records, not airport facts.
function row(overrides: Partial<IcnFacilityBrowseRecord> = {}): IcnFacilityBrowseRecord {
  return {
    sourceId: "duplicate-id", airportIata: "ICN", language: "K", listingIndex: 0,
    name: "테스트 카페", categories: { large: "테스트", medium: null, small: null },
    terminalId: "P01", floor: "F3", locationDescription: "테스트 위치", hoursText: "09:00~17:00",
    arrivalOrDeparture: "D", dutyFreeFlag: "N",
    source: { apiOperation: ICN_FACILITIES_API_OPERATION, datasetId: ICN_FACILITIES_DATASET_ID },
    ...overrides,
  };
}
const ko = row();
const en = row({ language: "E", name: "Test cafe", locationDescription: "Test location" });
const catalogs = (K = [ko], E = [en]): IcnFacilityReferenceCatalogs => ({ K, E });

function found(input: unknown, data = catalogs(), language: "K" | "E" = "K") {
  const result = resolveIcnFacilityRef(input, data, language);
  assert.equal(result.status, "found");
  if (result.status !== "found") throw new Error("Expected found");
  return result.record;
}

const exactRef = (record = ko) => ({ version: 1, contentFingerprint: icnFacilityContentFingerprint(record) });

describe("ICN facility references", () => {
  it("creates an exact versioned reference with the captured unambiguous counterpart", () => {
    assert.deepEqual(createIcnFacilityRef(ko, catalogs()), {
      ...exactRef(), pairedContentFingerprint: icnFacilityContentFingerprint(en),
    });
  });

  it("accepts the frozen v1 wire schema independently of shared fingerprint generation", () => {
    const contentFingerprint = '{"sourceId":"duplicate-id","airportIata":"ICN","language":"K","name":"테스트 카페","categories.large":"테스트","categories.medium":null,"categories.small":null,"terminalId":"P01","floor":"F3","locationDescription":"테스트 위치","hoursText":"09:00~17:00","arrivalOrDeparture":"D","dutyFreeFlag":"N","source.apiOperation":"B551177/FacilitiesInformation/getFacilitesInfo","source.datasetId":"15095064"}';
    const ref = { version: 1 as const, contentFingerprint };
    assert.deepEqual(createIcnFacilityRef(ko, catalogs([ko], [])), ref);
    assert.deepEqual(parseIcnFacilityRef(ref), { status: "valid", ref });
    assert.equal(found(ref), ko);
    const paired = createIcnFacilityRef(ko, catalogs());
    assert.deepEqual(parseIcnFacilityRef(serializeIcnFacilityRef(paired)), { status: "valid", ref: paired });
    assert.equal(found(serializeIcnFacilityRef(paired), catalogs(), "E"), en);
  });

  it("preserves explicit nulls and blank names without inventing identity or display values", () => {
    const incomplete = row({ name: "", categories: { large: null, medium: null, small: null },
      terminalId: null, floor: null, locationDescription: null, hoursText: null,
      arrivalOrDeparture: null, dutyFreeFlag: null });
    const data = catalogs([incomplete], []);
    const ref = createIcnFacilityRef(incomplete, data);
    assert.equal(found(serializeIcnFacilityRef(ref), data), incomplete);
    assert.deepEqual(resolveIcnFacilityRef(ref, data, "E"), { status: "missing", reason: "locale_not_captured" });
  });

  it("round trips JSON and URL-component transport without changing Unicode or punctuation", () => {
    const special = row({ name: '테스트 / % ? # & " \\ 😀' });
    const ref = createIcnFacilityRef(special, catalogs([special], []));
    const serialized = serializeIcnFacilityRef(ref);
    assert.equal(serialized, JSON.stringify(exactRef(special)));
    const parsed = parseIcnFacilityRef(decodeURIComponent(encodeURIComponent(serialized)));
    assert.deepEqual(parsed, { status: "valid", ref });
    assert.equal(found(serialized, catalogs([special], [])), special);
  });

  it("resolves only exact content among duplicate IDs, including invisible flag differences", () => {
    const other = row({ listingIndex: 1, dutyFreeFlag: "Y" });
    const data = catalogs([ko, other]);
    assert.equal(found(createIcnFacilityRef(other, data), data), other);
    assert.equal(found(exactRef(), data), ko);
  });

  it("survives reorder and ordinal reassignment without following the old ordinal", () => {
    const other = row({ sourceId: "other", name: "Other", listingIndex: 1 });
    const ref = createIcnFacilityRef(ko, catalogs([ko, other]));
    const moved = { ...ko, listingIndex: 91 };
    assert.equal(found(ref, catalogs([{ ...other, listingIndex: 0 }, moved])), moved);
    assert.equal(found(ref, catalogs([moved, { ...other, listingIndex: 0 }])), moved);
  });

  it("collapses identical copies with the existing earliest-index policy without mutating input", () => {
    const early = { ...ko, listingIndex: 2 };
    const data = catalogs([{ ...ko, listingIndex: 99 }, early], [en, { ...en, listingIndex: 10 }]);
    const before = JSON.stringify(data);
    const ref = createIcnFacilityRef(early, data);
    assert.equal(found(ref, data), early);
    assert.equal(found(ref, data, "E"), en);
    assert.equal(JSON.stringify(data), before);
  });

  for (const change of [
    { name: "Changed name" }, { hoursText: "10:00~18:00" }, { locationDescription: "Changed location" },
    { categories: { large: "Changed category", medium: null, small: null } }, { terminalId: "P03" },
    { floor: "F1" }, { arrivalOrDeparture: "A" as const }, { dutyFreeFlag: "Y" as const },
    { sourceId: "new-id" },
  ]) {
    it(`does not reassign after content changes: ${Object.keys(change)[0]}`, () => {
      const ref = createIcnFacilityRef(ko, catalogs());
      assert.deepEqual(resolveIcnFacilityRef(ref, catalogs([row(change)]), "K"), {
        status: "missing", reason: "reference_content_not_found",
      });
      // The old translation alone must not rescue a stale origin reference.
      assert.deepEqual(resolveIcnFacilityRef(ref, catalogs([row(change)]), "E"), {
        status: "missing", reason: "reference_content_not_found",
      });
    });
  }

  it("returns missing on removal even if the old ordinal is occupied", () => {
    const unrelated = row({ sourceId: "other", name: "Unrelated" });
    assert.deepEqual(resolveIcnFacilityRef(exactRef(), catalogs([unrelated]), "K"), {
      status: "missing", reason: "reference_content_not_found",
    });
  });

  it("supports both directions of locale change without rewriting the stored reference", () => {
    const before = JSON.stringify(catalogs());
    const refK = createIcnFacilityRef(ko, catalogs());
    const refE = createIcnFacilityRef(en, catalogs());
    assert.equal(found(refK, catalogs(), "E"), en);
    assert.equal(found(refE, catalogs(), "K"), ko);
    assert.equal(found(refE, catalogs(), "E"), en);
    assert.equal(JSON.stringify(catalogs()), before);
  });

  for (const side of ["K", "E"] as const) {
    it(`flags ambiguous ${side} pairing even when search/terminal filtering hides the conflict`, () => {
      const ref = createIcnFacilityRef(ko, catalogs());
      const extra = row({ language: side, listingIndex: 1, terminalId: "P03", dutyFreeFlag: "Y" });
      const data = catalogs(side === "K" ? [ko, extra] : [ko], side === "E" ? [en, extra] : [en]);
      assert.equal(found(ref, data), ko);
      assert.deepEqual(resolveIcnFacilityRef(ref, data, "E"), { status: "ambiguous", reason: "bilingual_pairing" });
      assert.equal(createIcnFacilityRef(ko, data).pairedContentFingerprint, undefined);
    });
  }

  it("does not opportunistically attach a newly unique translation that was not captured", () => {
    const extra = row({ language: "E", name: "Other", listingIndex: 1 });
    const ref = createIcnFacilityRef(ko, catalogs([ko], [en, extra]));
    assert.deepEqual(resolveIcnFacilityRef(ref, catalogs(), "E"), {
      status: "missing", reason: "locale_not_captured",
    });
  });

  it("does not follow a reused sourceId when counterpart content changes", () => {
    const ref = createIcnFacilityRef(ko, catalogs());
    assert.deepEqual(resolveIcnFacilityRef(ref, catalogs([ko], [{ ...en, name: "Unrelated new tenant" }]), "E"), {
      status: "missing", reason: "locale_content_not_found",
    });
    assert.deepEqual(resolveIcnFacilityRef(ref, catalogs([ko], []), "E"), {
      status: "missing", reason: "locale_content_not_found",
    });
  });

  it("keeps raw empty EN fields: display fallback remains a separate consumer concern", () => {
    const blank = { ...en, name: " ", locationDescription: null };
    const data = catalogs([ko], [blank]);
    assert.equal(found(createIcnFacilityRef(ko, data), data, "E"), blank);
  });

  it("resolves complete normalized catalogs independently of browse query and terminal state", () => {
    const fixtureK = loadIcnFacilitiesKoFixture();
    const fixtureE = loadIcnFacilitiesEnFixture();
    const data = catalogs(fixtureK.facilities, fixtureE.facilities);
    const selected = fixtureK.facilities[0];
    const ref = createIcnFacilityRef(selected, data);
    const browse = buildIcnBrowseCatalog(fixtureK, "ko");
    assert.equal(filterIcnBrowseItems(browse.items, "no-such-facility-zzzz", "absent-terminal").length, 0);
    assert.equal(found(ref, data), selected);
    assert.equal(found(ref, data, "E").sourceId, selected.sourceId);
  });

  it("rejects malformed envelopes, fingerprints, and inconsistent captured pairs", () => {
    const fingerprint = JSON.parse(exactRef().contentFingerprint);
    const invalid = [
      null, undefined, [], 1, "", "{", "null", "[]", {}, { version: "1" },
      { version: 0 }, { version: 1.5 }, { version: 1, contentFingerprint: 1 },
      { ...exactRef(), listingIndex: 0 }, { ...exactRef(), contentFingerprint: "{}" },
      { ...exactRef(), contentFingerprint: "null" },
      { ...exactRef(), contentFingerprint: JSON.stringify({ ...fingerprint, name: null }) },
      { ...exactRef(), contentFingerprint: JSON.stringify({ ...fingerprint, hoursText: 0 }) },
      { ...exactRef(), contentFingerprint: JSON.stringify({ ...fingerprint, airportIata: "SFO" }) },
      { ...exactRef(), contentFingerprint: JSON.stringify({ ...fingerprint, language: "ko" }) },
      { ...exactRef(), contentFingerprint: JSON.stringify({ ...fingerprint, sourceId: " " }) },
      { ...exactRef(), contentFingerprint: JSON.stringify({ ...fingerprint, arrivalOrDeparture: "X" }) },
      { ...exactRef(), contentFingerprint: JSON.stringify({ ...fingerprint, dutyFreeFlag: "X" }) },
      { ...exactRef(), contentFingerprint: JSON.stringify({ ...fingerprint, "source.datasetId": "other" }) },
      { ...exactRef(), contentFingerprint: JSON.stringify({ ...fingerprint, "source.apiOperation": "other" }) },
      { ...exactRef(), contentFingerprint: JSON.stringify({ ...fingerprint, extra: null }) },
      { ...exactRef(), contentFingerprint: JSON.stringify({ ...fingerprint, floor: undefined }) },
      { ...exactRef(), pairedContentFingerprint: null },
      { ...exactRef(), pairedContentFingerprint: exactRef().contentFingerprint },
      { ...exactRef(), pairedContentFingerprint: icnFacilityContentFingerprint({ ...en, sourceId: "other" }) },
    ];
    for (const input of invalid) {
      assert.deepEqual(parseIcnFacilityRef(input), { status: "invalid_reference" });
      assert.deepEqual(resolveIcnFacilityRef(input, catalogs(), "K"), { status: "invalid_reference" });
    }
  });

  it("reports unsupported positive integer versions without applying v1 interpretation", () => {
    for (const input of [{ version: 2 }, JSON.stringify({ version: 999, future: true })]) {
      const version = typeof input === "string" ? 999 : 2;
      assert.deepEqual(parseIcnFacilityRef(input), { status: "unsupported_version", version });
      assert.deepEqual(resolveIcnFacilityRef(input, catalogs(), "K"), { status: "unsupported_version", version });
    }
  });
});
