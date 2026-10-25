import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  TEST_APPROXIMATE_AREA_EVIDENCE,
  TEST_UNKNOWN_LOCATION_EVIDENCE,
  TEST_VERIFIED_AREA_EVIDENCE,
  TEST_VERIFIED_AREA_WITH_MAP_CELL,
} from "@/data/fixtures/location-evidence-test-fixture";
import {
  conceptualT2DAreaChips,
  presentLocationGuidance,
  shouldShowConceptualAreaGuide,
} from "@/lib/location-guidance-present";

describe("presentLocationGuidance", () => {
  it("renders verified area labels without inventing walking times", () => {
    const view = presentLocationGuidance(TEST_VERIFIED_AREA_EVIDENCE);
    assert.equal(view.badgeLabel, "Verified area");
    assert.equal(view.areaHeadline, "Terminal 2 · D Gates · Near Gate D7");
    assert.equal(view.nearGateLabel, "Listing names Gate D7");
    assert.match(view.explanation, /not a measured indoor coordinate/i);
    assert.equal(view.mapGridLabel, null);
    assert.equal(view.showSource, true);
    assert.equal(view.showMapSource, false);
    assert.doesNotMatch(view.explanation, /\d+\s*min/i);
  });

  it("treats approximate areas as coarse and not precise gates", () => {
    const view = presentLocationGuidance(TEST_APPROXIMATE_AREA_EVIDENCE);
    assert.equal(view.badgeLabel, "Approximate area");
    assert.equal(view.areaHeadline, "Terminal 2 · D Gates · Retail Street");
    assert.match(view.explanation, /coarse area/i);
    assert.equal(view.nearGateLabel, null);
    assert.equal(view.showSource, true);
  });

  it("labels official map directory cells as indexes, not coordinates", () => {
    const view = presentLocationGuidance(TEST_VERIFIED_AREA_WITH_MAP_CELL);
    assert.equal(
      view.mapGridLabel,
      "Map directory cell E2 (index on the official T2 map, not a gate or walking distance)",
    );
    assert.equal(view.showMapSource, true);
  });

  it("keeps Unknown empty of invented Terminal 2 / D Gates labels", () => {
    const view = presentLocationGuidance(TEST_UNKNOWN_LOCATION_EVIDENCE);
    assert.equal(view.badgeLabel, "Unknown");
    assert.equal(view.areaHeadline, null);
    assert.equal(view.nearGateLabel, null);
    assert.equal(view.mapGridLabel, null);
    assert.equal(view.showSource, false);
    assert.equal(view.showMapSource, false);
    assert.match(view.explanation, /does not infer a location/i);
  });
});

describe("conceptual T2 D guide visibility (P1)", () => {
  const t2d = { terminalCode: "terminal_2" as const, boardingAreaCode: "D" as const };
  const hm1 = { terminalCode: "harvey_milk_1" as const, boardingAreaCode: "B" as const };
  const vinoListing = {
    nearestGateLandmark: null,
    locationDescription: "D Gates, Retail Street",
  };

  it("hides the conceptual guide when GW-B evidence is Unknown", () => {
    assert.equal(
      shouldShowConceptualAreaGuide(TEST_UNKNOWN_LOCATION_EVIDENCE, t2d),
      false,
    );
    assert.equal(
      shouldShowConceptualAreaGuide(TEST_UNKNOWN_LOCATION_EVIDENCE, hm1),
      false,
    );
  });

  it("shows the conceptual guide only for known T2 D evidence", () => {
    assert.equal(
      shouldShowConceptualAreaGuide(TEST_VERIFIED_AREA_EVIDENCE, t2d),
      true,
    );
    assert.equal(
      shouldShowConceptualAreaGuide(TEST_APPROXIMATE_AREA_EVIDENCE, t2d),
      true,
    );
    assert.equal(
      shouldShowConceptualAreaGuide(TEST_VERIFIED_AREA_EVIDENCE, hm1),
      false,
    );
  });

  it("does not mark Retail Street current from listing fields when evidence is Unknown", () => {
    const chips = conceptualT2DAreaChips(vinoListing, TEST_UNKNOWN_LOCATION_EVIDENCE);
    assert.equal(chips.some((chip) => chip.current), false);
    assert.equal(
      chips.some((chip) => /named on this listing/i.test(chip.label)),
      false,
    );
  });

  it("marks current chips from GW-B evidence, not leftover listing fields", () => {
    const chips = conceptualT2DAreaChips(
      { nearestGateLandmark: "D16", locationDescription: "D Gates, near Gate D16" },
      TEST_VERIFIED_AREA_EVIDENCE,
    );
    const d7 = chips.find((chip) => chip.id === "D7");
    const d16 = chips.find((chip) => chip.id === "D16");
    assert.equal(d7?.current, true);
    assert.equal(d7?.label, "Gate D7, named on this listing");
    assert.equal(d16?.current, false);
    assert.equal(d16?.label, "Gate D16");
  });
});
