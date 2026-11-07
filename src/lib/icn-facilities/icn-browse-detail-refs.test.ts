import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  buildIcnBrowseCatalogWithDetailRefs,
  buildIcnFacilityReferenceCatalogs,
} from "./icn-browse-detail-refs";
import {
  createIcnFacilityRef,
  parseIcnFacilityRef,
  resolveIcnFacilityRef,
  serializeIcnFacilityRef,
} from "./icn-facility-reference";
import { decodeIcnFacilityRefPathSegment } from "./icn-facility-ref-transport";
import { loadIcnFacilitiesEnFixture, loadIcnFacilitiesKoFixture } from "./load-icn-facilities-fixture";
import { collapseDuplicateListings } from "./icn-snapshot-matching";
import type { IcnFacilityBrowseRecord } from "@/types/icn-facility-browse";
import { ICN_FACILITIES_API_OPERATION, ICN_FACILITIES_DATASET_ID } from "@/types/icn-facility-browse";

describe("icn-browse-detail-refs", () => {
  it("associates each browse row with a resolver-valid ref from its normalized record", () => {
    const ko = loadIcnFacilitiesKoFixture();
    const en = loadIcnFacilitiesEnFixture();
    const catalogs = buildIcnFacilityReferenceCatalogs(ko, en);
    const catalog = buildIcnBrowseCatalogWithDetailRefs(ko, "ko", catalogs);
    assert.equal(catalog.items.length, 1011);
    const arabica = catalog.items.find((item) => item.sourceId === "3289");
    assert.ok(arabica?.detailRefTransport);
    const serialized = decodeIcnFacilityRefPathSegment(arabica!.detailRefTransport!);
    const parsed = parseIcnFacilityRef(serialized);
    assert.equal(parsed.status, "valid");
    if (parsed.status !== "valid") throw new Error("expected valid ref");
    const resolved = resolveIcnFacilityRef(serialized, catalogs, "K");
    assert.equal(resolved.status, "found");
    if (resolved.status !== "found") throw new Error("expected found");
    assert.equal(resolved.record.sourceId, "3289");
    assert.equal(resolved.record.name, "% 아라비카");
  });

  it("uses distinct refs for duplicate sourceIds with different content", () => {
    const rowA = (idx: number): IcnFacilityBrowseRecord => ({
      sourceId: "dup",
      airportIata: "ICN",
      language: "K",
      listingIndex: idx,
      name: `A-${idx}`,
      categories: { large: "식・음료", medium: null, small: null },
      terminalId: "P01",
      floor: "F1",
      locationDescription: "loc",
      hoursText: "09:00~10:00",
      arrivalOrDeparture: "D",
      dutyFreeFlag: "N",
      source: { apiOperation: ICN_FACILITIES_API_OPERATION, datasetId: ICN_FACILITIES_DATASET_ID },
    });
    const ko = {
      meta: loadIcnFacilitiesKoFixture().meta,
      facilities: [rowA(0), rowA(1)],
    };
    const en = { meta: loadIcnFacilitiesEnFixture().meta, facilities: [] };
    const catalogs = buildIcnFacilityReferenceCatalogs(ko, en);
    const catalog = buildIcnBrowseCatalogWithDetailRefs(ko, "ko", catalogs);
    assert.equal(catalog.items.length, 2);
    const transports = catalog.items.map((item) => item.detailRefTransport);
    assert.notEqual(transports[0], transports[1]);
    for (const transport of transports) {
      const serialized = decodeIcnFacilityRefPathSegment(transport!);
      assert.equal(resolveIcnFacilityRef(serialized, catalogs, "K").status, "found");
    }
  });

  it("does not recreate identity from browse id without matching normalized row", () => {
    const ko = loadIcnFacilitiesKoFixture();
    const en = loadIcnFacilitiesEnFixture();
    const catalogs = buildIcnFacilityReferenceCatalogs(ko, en);
    const record = collapseDuplicateListings(ko.facilities)[0]!;
    const ref = createIcnFacilityRef(record, catalogs);
    const bogusBrowseIdRef = serializeIcnFacilityRef({
      version: 1,
      contentFingerprint: ref.contentFingerprint,
    });
    assert.equal(resolveIcnFacilityRef(bogusBrowseIdRef, catalogs, "K").status, "found");
    assert.equal(parseIcnFacilityRef(`browse-${record.listingIndex}`).status, "invalid_reference");
  });
});
