import assert from "node:assert/strict";
import { describe, it } from "vitest";
import rawFacilities from "@/data/facilities.json";
import { validateFacilities } from "./validate-facilities";
import { resolveFacilityVisual } from "./facility-visual";
import { loadFacilityVisualManifest } from "./facility-visual-manifest";

describe("resolveFacilityVisual", () => {
  it("uses category fallbacks for all 26 production facilities when manifest is empty", () => {
    const { facilities } = validateFacilities(rawFacilities);
    assert.equal(facilities.length, 26);
    assert.equal(loadFacilityVisualManifest().assets.length, 0);
    for (const facility of facilities) {
      const visual = resolveFacilityVisual(facility);
      assert.equal(visual.kind, "category_fallback");
      assert.match(visual.src, /^\/facility-visual\/fallback-/);
      assert.match(visual.alt, /not a photograph/i);
    }
  });

  it("maps coffee and shop categories to distinct fallback assets", () => {
    const { facilities } = validateFacilities(rawFacilities);
    const peets = facilities.find((f) => f.id === "sfo-t2-d-peets-coffee-d7")!;
    const brookstone = facilities.find((f) => f.id === "sfo-t2-d-brookstone")!;
    assert.match(resolveFacilityVisual(peets).src, /coffee/);
    assert.match(resolveFacilityVisual(brookstone).src, /shop/);
  });
});
