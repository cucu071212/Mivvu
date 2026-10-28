import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { buildKoreanFallbackIndex, toBrowseDisplayItems } from "./icn-browse-display";
import type { IcnBrowseListItem } from "./icn-browse-view-model";

function item(overrides: Partial<IcnBrowseListItem> & Pick<IcnBrowseListItem, "sourceId">): IcnBrowseListItem {
  return {
    id: `browse-${overrides.sourceId}`,
    name: "English name",
    terminalId: "P01",
    terminalLabel: "T1",
    floor: "F3",
    locationDescription: "Gate area",
    categoryLabel: "Food",
    hoursText: null,
    ...overrides,
  };
}

describe("icn-browse-display", () => {
  it("uses Korean fallback for missing English name when sourceId is unambiguous", () => {
    const en = item({ sourceId: "1", name: "", locationDescription: null });
    const ko = item({ sourceId: "1", name: "한글 이름", locationDescription: "한글 위치" });
    const map = buildKoreanFallbackIndex([ko]);

    const [display] = toBrowseDisplayItems([en], "en", map);
    assert.equal(display.displayName, "한글 이름");
    assert.equal(display.displayLocation, "한글 위치");
    assert.equal(display.nameFromKoreanFallback, true);
    assert.equal(display.locationFromKoreanFallback, true);
  });

  it("keeps English fields when present", () => {
    const en = item({ sourceId: "2", name: "Cafe" });
    const ko = item({ sourceId: "2", name: "카페" });
    const [display] = toBrowseDisplayItems([en], "en", buildKoreanFallbackIndex([ko]));
    assert.equal(display.displayName, "Cafe");
    assert.equal(display.nameFromKoreanFallback, false);
  });
});
