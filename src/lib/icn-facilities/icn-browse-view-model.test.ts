import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { IcnFacilityBrowseRecord } from "@/types/icn-facility-browse";
import {
  buildIcnBrowseCatalog,
  filterIcnBrowseItems,
  formatIcnTerminalChipLabel,
  formatIcnTerminalFloorLine,
  icnFacilityContentFingerprint,
} from "./icn-browse-view-model";
import type { IcnFacilitiesFixture } from "@/types/icn-facility-browse";

function row(
  overrides: Partial<IcnFacilityBrowseRecord> & Pick<IcnFacilityBrowseRecord, "listingIndex" | "sourceId" | "name">,
): IcnFacilityBrowseRecord {
  return {
    airportIata: "ICN",
    language: "K",
    categories: { large: "식・음료", medium: null, small: null },
    terminalId: "P03",
    floor: "F3",
    locationDescription: "제2여객터미널",
    hoursText: "09:00 ~ 18:00",
    arrivalOrDeparture: "D",
    dutyFreeFlag: "N",
    source: { apiOperation: "B551177/FacilitiesInformation/getFacilitesInfo", datasetId: "15095064" },
    ...overrides,
  };
}

describe("icn-browse-view-model", () => {
  it("collapses identical sourceId rows and keeps distinct variants", () => {
    const fixture: IcnFacilitiesFixture = {
      meta: {
        airportIata: "ICN",
        language: "K",
        source: "B551177/FacilitiesInformation/getFacilitesInfo",
        retrievedAt: "2026-10-28T00:00:00.000Z",
        recordCount: 3,
        apiReportedTotalCount: 3,
        syncIntegrity: "complete",
      },
      facilities: [
        row({ listingIndex: 0, sourceId: "1", name: "A" }),
        row({ listingIndex: 1, sourceId: "1", name: "A" }),
        row({ listingIndex: 2, sourceId: "1", name: "B", locationDescription: "다른 위치" }),
      ],
    };

    const catalog = buildIcnBrowseCatalog(fixture, "ko");
    assert.equal(catalog.items.length, 2);
    assert.equal(catalog.snapshot.listingCount, 2);
    assert.ok(catalog.items.some((item) => item.name === "B"));
  });

  it("filters by search and terminal together", () => {
    const fixture: IcnFacilitiesFixture = {
      meta: {
        airportIata: "ICN",
        language: "K",
        source: "B551177/FacilitiesInformation/getFacilitesInfo",
        retrievedAt: "2026-10-28T00:00:00.000Z",
        recordCount: 2,
        apiReportedTotalCount: 2,
        syncIntegrity: "complete",
      },
      facilities: [
        row({ listingIndex: 0, sourceId: "10", name: "스타벅스", terminalId: "P01" }),
        row({
          listingIndex: 1,
          sourceId: "11",
          name: "라운지",
          terminalId: "P03",
          categories: { large: "안내・편의시설", medium: "라운지", small: null },
        }),
      ],
    };

    const catalog = buildIcnBrowseCatalog(fixture, "ko");
    const loungeOnly = filterIcnBrowseItems(catalog.items, "라운지", "all");
    assert.equal(loungeOnly.length, 1);
    assert.equal(loungeOnly[0]?.name, "라운지");

    const t1Coffee = filterIcnBrowseItems(catalog.items, "스타", "P01");
    assert.equal(t1Coffee.length, 1);

    const empty = filterIcnBrowseItems(catalog.items, "없는검색어", "all");
    assert.equal(empty.length, 0);
  });

  it("uses short terminal tokens on cards and chips", () => {
    assert.equal(formatIcnTerminalChipLabel("P01", "en"), "T1");
    assert.equal(formatIcnTerminalChipLabel("P03", "ko"), "T2");
    assert.equal(formatIcnTerminalChipLabel("P02", "en"), "Concourse");
    assert.equal(formatIcnTerminalFloorLine("P03", "F3", "en"), "T2 · Level 3");
    assert.equal(formatIcnTerminalFloorLine("P03", "F3", "ko"), "T2 · 3층");
  });

  it("content fingerprint ignores listingIndex", () => {
    const a = row({ listingIndex: 0, sourceId: "9", name: "X" });
    const b = row({ listingIndex: 99, sourceId: "9", name: "X" });
    assert.equal(icnFacilityContentFingerprint(a), icnFacilityContentFingerprint(b));
  });

  it("content fingerprint ignores category object key order", () => {
    const a = row({ listingIndex: 0, sourceId: "9", name: "X" });
    const b = { ...a, categories: { small: null, medium: null, large: "식・음료" } };
    assert.equal(icnFacilityContentFingerprint(a), icnFacilityContentFingerprint(b));
  });
});
