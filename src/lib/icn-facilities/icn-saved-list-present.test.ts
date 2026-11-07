import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  createIcnFacilityRef,
  serializeIcnFacilityRef,
} from "./icn-facility-reference";
import { buildIcnSavedListRowViews } from "./icn-saved-list-present";
import { buildIcnBrowseCatalog } from "./icn-browse-view-model";
import { buildIcnFacilityReferenceCatalogs } from "./icn-browse-detail-refs";
import { loadIcnFacilitiesEnFixture, loadIcnFacilitiesKoFixture } from "./load-icn-facilities-fixture";

describe("buildIcnSavedListRowViews", () => {
  it("resolves current catalog rows and preserves last-known metadata when missing", () => {
    const koFixture = loadIcnFacilitiesKoFixture();
    const enFixture = loadIcnFacilitiesEnFixture();
    const catalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
    const ko3289 = catalogs.K.find((r) => r.sourceId === "3289")!;
    const ser = serializeIcnFacilityRef(createIcnFacilityRef(ko3289, catalogs));
    const resolved = buildIcnSavedListRowViews({
      items: [{ serializedRef: ser, savedAtMs: 1 }],
      locale: "ko",
      catalogs,
      catalogKo: buildIcnBrowseCatalog(koFixture, "ko"),
      catalogEn: buildIcnBrowseCatalog(enFixture, "en"),
    });
    assert.equal(resolved[0]?.kind, "resolved");

    const stale = buildIcnSavedListRowViews({
      items: [
        {
          serializedRef: ser,
          savedAtMs: 2,
          lastKnown: { displayName: "Old name", placeLine: "T2", locale: "ko" },
        },
      ],
      locale: "ko",
      catalogs: { K: [], E: [] },
      catalogKo: buildIcnBrowseCatalog(koFixture, "ko"),
      catalogEn: buildIcnBrowseCatalog(enFixture, "en"),
    });
    assert.equal(stale[0]?.kind, "last_known");
    if (stale[0]?.kind === "last_known") {
      assert.equal(stale[0].displayName, "Old name");
      assert.equal(stale[0].lastKnownLabel, true);
    }
  });
});
