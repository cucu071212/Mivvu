import assert from "node:assert/strict";
import { describe, it } from "vitest";
import rawFacilities from "@/data/facilities.json";
import { validateFacilities } from "./validate-facilities";
import { resolveFacilityVisual } from "./facility-visual";
import { loadFacilityVisualManifest } from "./facility-visual-manifest";

const MANIFEST_IDS = new Set(
  loadFacilityVisualManifest().assets.map((row) => row.facilityId),
);

describe("resolveFacilityVisual", () => {
  it("returns null for facilities without manifest assets (no SVG heroes)", () => {
    const { facilities } = validateFacilities(rawFacilities);
    const withoutAsset = facilities.filter((f) => !MANIFEST_IDS.has(f.id));
    assert.ok(withoutAsset.length > 0);
    for (const facility of withoutAsset) {
      assert.equal(resolveFacilityVisual(facility), null);
    }
  });

  it("maps manifest entries to venue or illustrative photos", () => {
    const { facilities } = validateFacilities(rawFacilities);
    for (const asset of loadFacilityVisualManifest().assets) {
      const facility = facilities.find((f) => f.id === asset.facilityId)!;
      const visual = resolveFacilityVisual(facility);
      assert.ok(visual);
      assert.equal(visual!.src, asset.imagePath);
      if (asset.imageRole === "venue" && asset.depictsSfoLocation) {
        assert.equal(visual!.kind, "venue_photo");
        assert.match(visual!.alt, /venue photograph/i);
      } else {
        assert.equal(visual!.kind, "illustrative_photo");
        assert.match(visual!.alt, /not this SFO location/i);
        assert.match(visual!.caption ?? "", /Illustrative photo/i);
      }
    }
  });
});
