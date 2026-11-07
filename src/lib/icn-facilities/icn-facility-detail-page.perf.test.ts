import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { buildIcnBrowseCatalogWithDetailRefs, buildIcnFacilityReferenceCatalogs } from "./icn-browse-detail-refs";
import { buildIcnBrowseCatalog } from "./icn-browse-view-model";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "./load-icn-facilities-fixture";

describe("MivvuIcnFacilityDetailPage catalog path", () => {
  it(
    "avoids building browse reference transports on the detail projection path",
    { timeout: 120_000 },
    () => {
    const ko = loadIcnFacilitiesKoFixture();
    const en = loadIcnFacilitiesEnFixture();
    const catalogs = buildIcnFacilityReferenceCatalogs(ko, en);

    const warmOrdinary = () => {
      buildIcnBrowseCatalog(ko, "ko");
      buildIcnBrowseCatalog(en, "en");
    };
    warmOrdinary();

    const warmRefs = () => {
      buildIcnBrowseCatalogWithDetailRefs(ko, "ko", catalogs);
      buildIcnBrowseCatalogWithDetailRefs(en, "en", catalogs);
    };
    warmRefs();

    const timeOrdinaryMs = () => {
      const start = performance.now();
      buildIcnBrowseCatalog(ko, "ko");
      buildIcnBrowseCatalog(en, "en");
      return performance.now() - start;
    };

    const timeRefBearingMs = () => {
      const start = performance.now();
      buildIcnBrowseCatalogWithDetailRefs(ko, "ko", catalogs);
      buildIcnBrowseCatalogWithDetailRefs(en, "en", catalogs);
      return performance.now() - start;
    };

    const ordinarySamples = [timeOrdinaryMs(), timeOrdinaryMs(), timeOrdinaryMs()];
    const refSamples = [timeRefBearingMs(), timeRefBearingMs(), timeRefBearingMs()];

    const ordinaryMedian = ordinarySamples.sort((a, b) => a - b)[1]!;
    const refMedian = refSamples.sort((a, b) => a - b)[1]!;

    console.info(
      `[GW-ICN-013 detail-path probe] ordinary median=${ordinaryMedian.toFixed(1)}ms ref-bearing median=${refMedian.toFixed(1)}ms (warm fixtures, local Node)`,
    );

    assert.ok(
      refMedian > ordinaryMedian * 5,
      `expected ref-bearing path to be much slower (ordinary=${ordinaryMedian.toFixed(1)}ms ref=${refMedian.toFixed(1)}ms)`,
    );
    assert.ok(ordinaryMedian < 500, `ordinary path unexpectedly slow: ${ordinaryMedian}ms`);
  },
  );
});
