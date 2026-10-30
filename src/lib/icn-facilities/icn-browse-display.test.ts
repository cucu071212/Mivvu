import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { buildKoreanFallbackIndex, toBrowseDisplayItems } from "./icn-browse-display";
import type { IcnBrowseListItem } from "./icn-browse-view-model";
import { buildIcnBrowseCatalog } from "./icn-browse-view-model";
import { loadIcnFacilitiesFixture } from "./load-icn-facilities-fixture";

function item(overrides: Partial<IcnBrowseListItem> & Pick<IcnBrowseListItem, "sourceId">): IcnBrowseListItem {
  return {
    id: `browse-${overrides.sourceId}`,
    name: "English name",
    terminalId: "P01",
    terminalLabel: "T1",
    floor: "F3",
    locationDescription: "Gate area",
    categoryLabel: "Food",
    categoryLargeKey: null,
    categoryMediumKey: null,
    hoursText: null,
    ...overrides,
  };
}

describe("icn-browse-display", () => {
  it("does not borrow from conflicting Korean records", () => {
    const en = item({ sourceId: "1", name: "", locationDescription: null });
    const korean = [
      item({ sourceId: "1", name: "시설 A", locationDescription: "위치 A" }),
      item({ sourceId: "1", name: "시설 B", locationDescription: "위치 B" }),
    ];
    const [display] = toBrowseDisplayItems([en], "en", buildKoreanFallbackIndex(korean, [en]));
    assert.equal(display.displayName, "");
    assert.equal(display.displayLocation, null);
    assert.equal(display.nameFromKoreanFallback, false);
  });

  it("does not borrow for conflicting English records even when a filter hides the other variant", () => {
    const english = [
      item({ sourceId: "1", name: "", locationDescription: null }),
      item({ sourceId: "1", name: "Different facility", terminalId: "P03" }),
    ];
    const ko = item({ sourceId: "1", name: "시설 A", locationDescription: "위치 A" });
    const [display] = toBrowseDisplayItems([english[0]], "en", buildKoreanFallbackIndex([ko], english));
    assert.equal(display.displayName, "");
    assert.equal(display.displayLocation, null);
  });

  it("uses Korean fallback for missing English name when sourceId is unambiguous", () => {
    const en = item({ sourceId: "1", name: "", locationDescription: null });
    const ko = item({ sourceId: "1", name: "한글 이름", locationDescription: "한글 위치" });
    const map = buildKoreanFallbackIndex([ko], [en]);

    const [display] = toBrowseDisplayItems([en], "en", map);
    assert.equal(display.displayName, "한글 이름");
    assert.equal(display.displayLocation, "한글 위치");
    assert.equal(display.nameFromKoreanFallback, true);
    assert.equal(display.locationFromKoreanFallback, true);
  });

  it("keeps English fields when present", () => {
    const en = item({ sourceId: "2", name: "Cafe" });
    const ko = item({ sourceId: "2", name: "카페" });
    const [display] = toBrowseDisplayItems([en], "en", buildKoreanFallbackIndex([ko], [en]));
    assert.equal(display.displayName, "Cafe");
    assert.equal(display.nameFromKoreanFallback, false);
    assert.equal(display.displayLocation, "Gate area");
    assert.equal(display.locationFromKoreanFallback, false);
  });

  it("does not fallback for unmatched IDs or Korean display", () => {
    const en = item({ sourceId: "en-only", name: "", locationDescription: null });
    const ko = item({ sourceId: "ko-only", name: "다른 시설" });
    const [display] = toBrowseDisplayItems([en], "en", buildKoreanFallbackIndex([ko], [en]));
    assert.equal(display.displayName, "");
    assert.equal(display.displayLocation, null);
    const sameId = { ...ko, sourceId: en.sourceId };
    const [korean] = toBrowseDisplayItems([en], "ko", buildKoreanFallbackIndex([sameId], [en]));
    assert.equal(korean.displayName, "");
    assert.equal(korean.nameFromKoreanFallback, false);
  });

  it("collapses identical raw duplicates before matching, preserves raw English values and fallback labels", () => {
    const koFixture = structuredClone(loadIcnFacilitiesFixture("ko"));
    const enFixture = structuredClone(loadIcnFacilitiesFixture("en"));
    const ko = { ...koFixture.facilities[0], sourceId: "test", name: "원문 이름", locationDescription: "원문 위치" };
    const en = { ...enFixture.facilities[0], sourceId: "test", name: " ", locationDescription: null };
    koFixture.facilities = [ko, { ...ko, listingIndex: 9999 }];
    enFixture.facilities = [en, { ...en, listingIndex: 9999 }];
    const korean = buildIcnBrowseCatalog(koFixture, "ko").items;
    const english = buildIcnBrowseCatalog(enFixture, "en").items;
    assert.equal(korean.length, 1);
    assert.equal(english.length, 1);
    const before = JSON.stringify({ koFixture, enFixture, korean, english });
    const [display] = toBrowseDisplayItems(english, "en", buildKoreanFallbackIndex(korean, english));
    assert.equal(display.name, " ");
    assert.equal(display.locationDescription, null);
    assert.equal(display.displayName, "원문 이름");
    assert.equal(display.displayLocation, "원문 위치");
    assert.equal(display.nameFromKoreanFallback, true);
    assert.equal(display.locationFromKoreanFallback, true);
    assert.equal(JSON.stringify({ koFixture, enFixture, korean, english }), before);

    // Distinct raw records may project to the same display fields. Never re-collapse
    // a catalog on its lossy view fields, or this arrival/departure conflict disappears.
    enFixture.facilities[1].arrivalOrDeparture = en.arrivalOrDeparture === "A" ? "D" : "A";
    const conflicted = buildIcnBrowseCatalog(enFixture, "en").items;
    assert.equal(conflicted.length, 2);
    assert.equal(buildKoreanFallbackIndex(korean, conflicted).has("test"), false);
  });
});
