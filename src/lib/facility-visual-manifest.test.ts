import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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
      assert.ok(asset.imagePath.startsWith("/facility-visual/approved/"));
      assert.ok(asset.rightsEvidence.trim().length > 0);
      assert.ok(asset.sourceUrl.startsWith("http"));
      assert.ok(
        asset.imageRole === "venue" || asset.imageRole === "illustrative",
      );
      if (asset.imageRole === "venue") {
        assert.equal(asset.depictsSfoLocation, true);
      }
      const diskPath = join(
        process.cwd(),
        "public",
        asset.imagePath.replace(/^\//, ""),
      );
      assert.ok(
        readFileSync(diskPath).byteLength > 0,
        `missing file: ${asset.imagePath}`,
      );
    }
  });
});
