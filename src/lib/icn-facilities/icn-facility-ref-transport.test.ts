import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  buildIcnFacilityDetailHref,
  decodeIcnFacilityRefPathSegment,
  encodeIcnFacilityRefForUrlPath,
} from "./icn-facility-ref-transport";
import { parseIcnFacilityRef, serializeIcnFacilityRef } from "./icn-facility-reference";
import { createIcnFacilityRef } from "./icn-facility-reference";
import type { IcnFacilityBrowseRecord } from "@/types/icn-facility-browse";
import { ICN_FACILITIES_API_OPERATION, ICN_FACILITIES_DATASET_ID } from "@/types/icn-facility-browse";

function row(overrides: Partial<IcnFacilityBrowseRecord> = {}): IcnFacilityBrowseRecord {
  return {
    sourceId: "1",
    airportIata: "ICN",
    language: "K",
    listingIndex: 0,
    name: '테스트 / % ? # & " \\ 😀',
    categories: { large: "테스트", medium: null, small: null },
    terminalId: "P01",
    floor: "F3",
    locationDescription: "위치",
    hoursText: "09:00~17:00",
    arrivalOrDeparture: "D",
    dutyFreeFlag: "N",
    source: { apiOperation: ICN_FACILITIES_API_OPERATION, datasetId: ICN_FACILITIES_DATASET_ID },
    ...overrides,
  };
}

describe("icn-facility-ref-transport", () => {
  it("round-trips through a single encode at the URL boundary", () => {
    const ref = createIcnFacilityRef(row(), { K: [row()], E: [] });
    const serialized = serializeIcnFacilityRef(ref);
    const segment = encodeIcnFacilityRefForUrlPath(serialized);
    const href = buildIcnFacilityDetailHref(serialized);
    assert.equal(href, `/icn/f/${segment}`);
    const decoded = decodeIcnFacilityRefPathSegment(segment);
    assert.deepEqual(parseIcnFacilityRef(decoded), { status: "valid", ref });
  });

  it("does not double-decode an already decoded segment", () => {
    const serialized = serializeIcnFacilityRef(createIcnFacilityRef(row(), { K: [row()], E: [] }));
    assert.equal(decodeIcnFacilityRefPathSegment(serialized), serialized);
  });

  it("decodes once when percent escapes remain", () => {
    const serialized = serializeIcnFacilityRef(createIcnFacilityRef(row(), { K: [row()], E: [] }));
    const encoded = encodeURIComponent(serialized);
    assert.equal(decodeIcnFacilityRefPathSegment(encoded), serialized);
  });
});
