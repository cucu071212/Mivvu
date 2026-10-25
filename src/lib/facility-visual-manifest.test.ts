import assert from "node:assert/strict";
import { describe, it } from "vitest";
import rawFacilities from "@/data/facilities.json";
import { validateFacilities } from "./validate-facilities";
import { loadFacilityVisualManifest } from "./facility-visual-manifest";

describe("facility-visual-manifest", () => {
  it("only references known facility IDs when assets are present", () => {
    const { facilities } = validateFacilities(rawFacilities);
    const ids = new Set(facilities.map((row) => row.id));
    const manifest = loadFacilityVisualManifest();
    for (const asset of manifest.assets) {
      assert.ok(ids.has(asset.facilityId), `unknown facilityId: ${asset.facilityId}`);
      assert.equal(asset.rightsStatus, "approved");
      assert.ok(asset.imagePath.startsWith("/facility-visual/"));
      assert.ok(asset.rightsEvidence.trim().length > 0);
    }
  });
});
