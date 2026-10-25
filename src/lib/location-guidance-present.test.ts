import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  TEST_APPROXIMATE_AREA_EVIDENCE,
  TEST_UNKNOWN_LOCATION_EVIDENCE,
  TEST_VERIFIED_AREA_EVIDENCE,
  TEST_VERIFIED_AREA_WITH_MAP_CELL,
} from "@/data/fixtures/location-evidence-test-fixture";
import { presentLocationGuidance } from "@/lib/location-guidance-present";

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
