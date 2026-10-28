import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { IcnFacilitiesFixture, IcnFacilityBrowseRecord } from "@/types/icn-facility-browse";
import { buildKoreanFallbackIndex, toBrowseDisplayItems } from "./icn-browse-display";
import {
  buildIcnBrowseCatalog,
  filterIcnBrowseItems,
  type IcnBrowseListItem,
} from "./icn-browse-view-model";

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
    hoursText: null,
    arrivalOrDeparture: "D",
    dutyFreeFlag: "N",
    source: { apiOperation: "B551177/FacilitiesInformation/getFacilitesInfo", datasetId: "15095064" },
    ...overrides,
  };
}

function fixture(language: "K" | "E", records: IcnFacilityBrowseRecord[]): IcnFacilitiesFixture {
  return {
    meta: {
      airportIata: "ICN",
      language,
      source: "B551177/FacilitiesInformation/getFacilitesInfo",
      retrievedAt: "2026-10-28T00:00:00.000Z",
      recordCount: records.length,
      apiReportedTotalCount: records.length,
      syncIntegrity: "complete",
    },
    facilities: records.map((r) => ({ ...r, language })),
  };
}

describe("GW-ICN-009 search + 007 fallback integration", () => {
  it("does not borrow Korean display text when ambiguity is hidden by terminal filter", () => {
    const sharedId = "ambig";
    const koFixture = fixture("K", [
      row({ listingIndex: 0, sourceId: sharedId, name: "시설 A", terminalId: "P01" }),
      row({ listingIndex: 1, sourceId: sharedId, name: "시설 B", terminalId: "P03", arrivalOrDeparture: "A" }),
    ]);
    const enFixture = fixture("E", [
      row({ listingIndex: 0, sourceId: sharedId, name: " ", locationDescription: null, terminalId: "P01" }),
      row({ listingIndex: 1, sourceId: sharedId, name: " ", locationDescription: null, terminalId: "P03", arrivalOrDeparture: "A" }),
    ]);
    const catalogKo = buildIcnBrowseCatalog(koFixture, "ko");
    const catalogEn = buildIcnBrowseCatalog(enFixture, "en");
    const fallback = buildKoreanFallbackIndex(catalogKo.items, catalogEn.items);
    assert.equal(fallback.has(sharedId), false);

    const filtered = filterIcnBrowseItems(catalogEn.items, "", "P01", "en");
    assert.equal(filtered.length, 1);
    const wrongFallback = buildKoreanFallbackIndex(
      catalogKo.items.filter((item) => item.terminalId === "P01"),
      filtered,
    );
    assert.equal(
      wrongFallback.has(sharedId),
      true,
      "building fallback from terminal-filtered KO rows would wrongly allow borrow",
    );

    const [display] = toBrowseDisplayItems(filtered, "en", fallback);
    assert.equal(display.displayName, " ");
    assert.equal(display.nameFromKoreanFallback, false);
  });

  it("searches full English catalog while display fallback uses unambiguous full-catalog pairs", () => {
    const id = "ok";
    const koFixture = fixture("K", [row({ listingIndex: 0, sourceId: id, name: "한글 이름" })]);
    const enFixture = fixture("E", [
      row({ listingIndex: 0, sourceId: id, name: "", locationDescription: null, terminalId: "P01" }),
    ]);
    const catalogKo = buildIcnBrowseCatalog(koFixture, "ko");
    const catalogEn = buildIcnBrowseCatalog(enFixture, "en");
    const fallback = buildKoreanFallbackIndex(catalogKo.items, catalogEn.items);

    const searchHits = filterIcnBrowseItems(catalogEn.items, "terminal 1", "all", "en");
    assert.equal(searchHits.length, 1);

    const [display] = toBrowseDisplayItems(searchHits, "en", fallback);
    assert.equal(display.displayName, "한글 이름");
    assert.equal(display.nameFromKoreanFallback, true);
    assert.equal(display.name, "");
  });

  it("applies indexed search on filtered rows without re-deduplicating lossy list items", () => {
    const firstId = "browse-0";
    const secondId = "browse-1";
    const items: IcnBrowseListItem[] = [
      {
        id: firstId,
        sourceId: "1",
        name: "Starbucks Coffee",
        terminalId: "P03",
        terminalLabel: "Terminal 2",
        floor: null,
        locationDescription: "Gate area",
        categoryLabel: "Food",
        hoursText: null,
      },
      {
        id: secondId,
        sourceId: "1",
        name: "Starbucks Coffee",
        terminalId: "P03",
        terminalLabel: "Terminal 2",
        floor: null,
        locationDescription: "Other wing",
        categoryLabel: "Food",
        hoursText: null,
      },
    ];
    const expectedOrder = [firstId, secondId];
    assert.deepEqual(
      filterIcnBrowseItems(items, "starbucks", "P03", "en").map((row) => row.id),
      expectedOrder,
    );
    assert.deepEqual(
      filterIcnBrowseItems(items, "starbcks", "P03", "en").map((row) => row.id),
      expectedOrder,
    );
  });
});
