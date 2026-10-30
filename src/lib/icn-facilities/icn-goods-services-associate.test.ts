import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { IcnFacilitiesFixture } from "@/types/icn-facility-browse";
import type { IcnGoodsServicesCompanion, IcnGoodsServicesObservation } from "@/types/icn-goods-services-companion";
import { icnFacilityContentFingerprint } from "./icn-snapshot-matching";
import { computeIcnGoodsServicesTargetCoreDigest } from "./icn-goods-services-target-digest";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "./load-icn-facilities-fixture";
import { buildIcnFacilityReferenceCatalogs } from "./icn-browse-detail-refs";
import {
  createIcnFacilityRef,
  resolveIcnFacilityRef,
  serializeIcnFacilityRef,
} from "./icn-facility-reference";
import {
  ICN_GOODS_SERVICES_LONG_TEXT_COLLAPSE_THRESHOLD,
  projectIcnGoodsServicesForDetail,
} from "./icn-goods-services-associate";
import { buildIcnBrowseCatalog } from "./icn-browse-view-model";
import { buildIcnSearchIndex, searchIcnIndex } from "./icn-facility-search";

function captureMeta(observationCount: number) {
  return {
    startedAt: "2026-10-01T00:00:00+09:00",
    completedAt: "2026-10-01T01:00:00+09:00",
    coverage: "retrievable_catalog" as const,
    apiReportedTotalCount: observationCount,
    recordCount: observationCount,
    syncIntegrity: "complete" as const,
    observations: [] as IcnGoodsServicesObservation[],
  };
}

function buildCompanion(
  koFixture: IcnFacilitiesFixture,
  enFixture: IcnFacilitiesFixture,
  observations: { K?: IcnGoodsServicesObservation[]; E?: IcnGoodsServicesObservation[] },
): IcnGoodsServicesCompanion {
  const K = observations.K ?? [];
  const E = observations.E ?? [];
  return {
    schemaVersion: 1,
    source: { datasetId: "15095064", apiOperation: "B551177/FacilitiesInformation/getFacilitesInfo" },
    targetCoreDigests: {
      K: computeIcnGoodsServicesTargetCoreDigest(koFixture),
      E: computeIcnGoodsServicesTargetCoreDigest(enFixture),
    },
    captures: {
      K: { ...captureMeta(K.length), observations: K },
      E: { ...captureMeta(E.length), observations: E },
    },
  };
}

function obs(
  record: Parameters<typeof icnFacilityContentFingerprint>[0],
  fields: IcnGoodsServicesObservation["fields"],
): IcnGoodsServicesObservation {
  return { coreFingerprint: icnFacilityContentFingerprint(record), fields };
}

describe("projectIcnGoodsServicesForDetail", () => {
  const koFixture = loadIcnFacilitiesKoFixture();
  const enFixture = loadIcnFacilitiesEnFixture();
  const catalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
  const ko3289 = koFixture.facilities.find((r) => r.sourceId === "3289")!;
  const en3289 = enFixture.facilities.find((r) => r.sourceId === "3289")!;
  const ref = createIcnFacilityRef(ko3289, catalogs);
  const serialized = serializeIcnFacilityRef(ref);
  const resolutionKo = resolveIcnFacilityRef(serialized, catalogs, "K");
  const resolutionEn = resolveIcnFacilityRef(serialized, catalogs, "E");
  const refEn = createIcnFacilityRef(en3289, catalogs);
  const serializedEn = serializeIcnFacilityRef(refEn);
  const resolutionEnFromEnRef = resolveIcnFacilityRef(serializedEn, catalogs, "E");
  assert.equal(resolutionKo.status, "found");
  assert.equal(resolutionEn.status, "found");
  assert.equal(resolutionEnFromEnRef.status, "found");

  const base = {
    koFixture,
    enFixture,
    referenceCatalogs: catalogs,
    koSourceLabel: "Korean listing only",
  };
  const baseKoRef = { ...base, serializedRef: serialized };
  const baseEnRef = { ...base, serializedRef: serializedEn };

  it("hides the section when companion is absent (shipped default)", () => {
    const out = projectIcnGoodsServicesForDetail({
      ...baseKoRef,
      rawCompanion: null,
      previewLocale: "en",
      resolution: resolutionEn,
    });
    assert.equal(out.sectionVisible, false);
    assert.equal(out.internal?.unavailable?.reason, "not_captured");
  });

  it("shows requested-language text when an exact observation exists", () => {
    const companion = buildCompanion(koFixture, enFixture, {
      K: [obs(ko3289, { facilityitem: { present: true, value: "한국어 설명" }, goods: { present: false }, GOODS: { present: false } })],
    });
    const out = projectIcnGoodsServicesForDetail({
      ...baseKoRef,
      rawCompanion: companion,
      previewLocale: "ko",
      resolution: resolutionKo,
    });
    assert.equal(out.sectionVisible, true);
    assert.equal(out.available?.language, "K");
    assert.equal(out.available?.fallbackUsed, false);
    assert.equal(out.available?.paragraphs[0].text, "한국어 설명");
  });

  it("merges equal same-row fields into one paragraph", () => {
    const text = "동일 본문";
    const companion = buildCompanion(koFixture, enFixture, {
      E: [
        obs(en3289, {
          facilityitem: { present: true, value: text },
          goods: { present: true, value: text },
          GOODS: { present: false },
        }),
      ],
    });
    const out = projectIcnGoodsServicesForDetail({
      ...baseEnRef,
      rawCompanion: companion,
      previewLocale: "en",
      resolution: resolutionEnFromEnRef,
    });
    assert.equal(out.available?.fieldAgreement, "equal");
    assert.equal(out.available?.paragraphs.length, 1);
  });

  it("keeps distinct same-row descriptions separate with neutral agreement", () => {
    const companion = buildCompanion(koFixture, enFixture, {
      E: [
        obs(en3289, {
          facilityitem: { present: true, value: "Alpha" },
          goods: { present: true, value: "Beta" },
          GOODS: { present: false },
        }),
      ],
    });
    const out = projectIcnGoodsServicesForDetail({
      ...baseEnRef,
      rawCompanion: companion,
      previewLocale: "en",
      resolution: resolutionEnFromEnRef,
    });
    assert.equal(out.available?.fieldAgreement, "different");
    assert.equal(out.available?.paragraphs.length, 2);
  });

  it("uses not_captured before cross-locale gate when requested capture is missing (REV2 step 5)", () => {
    const companion = buildCompanion(koFixture, enFixture, {
      K: [obs(ko3289, { facilityitem: { present: true, value: "KO only" }, goods: { present: false }, GOODS: { present: false } })],
      E: [],
    });
    (companion.captures.E as null) = null;
    const out = projectIcnGoodsServicesForDetail({
      ...baseKoRef,
      rawCompanion: companion,
      previewLocale: "en",
      resolution: resolutionEn,
    });
    assert.equal(out.sectionVisible, false);
    assert.equal(out.internal?.unavailable?.reason, "not_captured");
    assert.equal(out.internal?.koreanFallbackAttempted, undefined);
  });

  it("allows labeled KO fallback on EN when E is empty and gates pass", () => {
    const companion = buildCompanion(koFixture, enFixture, {
      E: [
        obs(en3289, {
          facilityitem: { present: true, value: null },
          goods: { present: true, value: " " },
          GOODS: { present: true, value: "-" },
        }),
      ],
      K: [obs(ko3289, { facilityitem: { present: true, value: "한국어 대체 설명" }, goods: { present: false }, GOODS: { present: false } })],
    });
    const out = projectIcnGoodsServicesForDetail({
      ...baseKoRef,
      rawCompanion: companion,
      previewLocale: "en",
      resolution: resolutionEn,
    });
    assert.equal(out.sectionVisible, true);
    assert.equal(out.available?.fallbackUsed, true);
    assert.equal(out.available?.language, "K");
    assert.equal(out.available?.sourceLabel, "Korean listing only");
    assert.equal(out.internal?.englishOutcome, "empty");
  });

  it("blocks KO fallback when English capture is missing (not empty)", () => {
    const companion = buildCompanion(koFixture, enFixture, {
      K: [obs(ko3289, { facilityitem: { present: true, value: "KO" }, goods: { present: false }, GOODS: { present: false } })],
    });
    (companion.captures.E as null) = null;
    const out = projectIcnGoodsServicesForDetail({
      ...baseKoRef,
      rawCompanion: companion,
      previewLocale: "en",
      resolution: resolutionEn,
    });
    assert.equal(out.sectionVisible, false);
    assert.notEqual(out.internal?.englishOutcome, "empty");
  });

  it("marks long text for collapsed-by-default UI", () => {
    const long = "x".repeat(ICN_GOODS_SERVICES_LONG_TEXT_COLLAPSE_THRESHOLD + 1);
    const companion = buildCompanion(koFixture, enFixture, {
      E: [obs(en3289, { facilityitem: { present: true, value: long }, goods: { present: false }, GOODS: { present: false } })],
    });
    const out = projectIcnGoodsServicesForDetail({
      ...baseEnRef,
      rawCompanion: companion,
      previewLocale: "en",
      resolution: resolutionEnFromEnRef,
    });
    assert.equal(out.available?.longTextCollapsedByDefault, true);
  });

  it("deduplicates partially equal same-row fields (A/B/A)", () => {
    const companion = buildCompanion(koFixture, enFixture, {
      E: [
        obs(en3289, {
          facilityitem: { present: true, value: "Coffee" },
          goods: { present: true, value: "Tea" },
          GOODS: { present: true, value: "Coffee" },
        }),
      ],
    });
    const out = projectIcnGoodsServicesForDetail({
      ...baseEnRef,
      rawCompanion: companion,
      previewLocale: "en",
      resolution: resolutionEnFromEnRef,
    });
    assert.equal(out.available?.fieldAgreement, "different");
    assert.deepEqual(
      out.available?.paragraphs.map((paragraph) => paragraph.text),
      ["Coffee", "Tea"],
    );
    assert.deepEqual(out.available?.paragraphs[0].sourceFields, ["facilityitem", "GOODS"]);
    assert.deepEqual(out.available?.paragraphs[1].sourceFields, ["goods"]);
  });

  it("maps unsupported companion schema to unsupported_version", () => {
    const companion = buildCompanion(koFixture, enFixture, {
      K: [obs(ko3289, { facilityitem: { present: true, value: "x" }, goods: { present: false }, GOODS: { present: false } })],
    });
    (companion as { schemaVersion: number }).schemaVersion = 2;
    const out = projectIcnGoodsServicesForDetail({
      ...baseKoRef,
      rawCompanion: companion,
      previewLocale: "ko",
      resolution: resolutionKo,
    });
    assert.equal(out.sectionVisible, false);
    assert.equal(out.internal?.unavailable?.reason, "unsupported_version");
  });

  it("does not show goods when companion validation fails", () => {
    const companion = buildCompanion(koFixture, enFixture, {
      K: [obs(ko3289, { facilityitem: { present: true, value: "x" }, goods: { present: false }, GOODS: { present: false } })],
    });
    companion.captures.K!.completedAt = "INVALID-PROVENANCE";
    const out = projectIcnGoodsServicesForDetail({
      ...baseKoRef,
      rawCompanion: companion,
      previewLocale: "ko",
      resolution: resolutionKo,
    });
    assert.equal(out.sectionVisible, false);
    assert.equal(out.internal?.unavailable?.reason, "invalid_artifact");
  });

  it("does not show goods when completedAt is a calendar-invalid ISO date", () => {
    const companion = buildCompanion(koFixture, enFixture, {
      K: [obs(ko3289, { facilityitem: { present: true, value: "x" }, goods: { present: false }, GOODS: { present: false } })],
    });
    companion.captures.K!.startedAt = "2026-02-28T00:00:00Z";
    companion.captures.K!.completedAt = "2026-02-30T00:00:00Z";
    const out = projectIcnGoodsServicesForDetail({
      ...baseKoRef,
      rawCompanion: companion,
      previewLocale: "ko",
      resolution: resolutionKo,
    });
    assert.equal(out.sectionVisible, false);
    assert.equal(out.internal?.unavailable?.reason, "invalid_artifact");
  });

  it("does not change browse catalog or search membership when companion exists", () => {
    const companion = buildCompanion(koFixture, enFixture, {
      K: [obs(ko3289, { facilityitem: { present: true, value: "설명" }, goods: { present: false }, GOODS: { present: false } })],
    });
    void companion;
    const catalogKo = buildIcnBrowseCatalog(koFixture, "ko");
    const catalogEn = buildIcnBrowseCatalog(enFixture, "en");
    const searchKo = searchIcnIndex(buildIcnSearchIndex(catalogKo.items, "ko"), "아라비카");
    const searchEn = searchIcnIndex(buildIcnSearchIndex(catalogEn.items, "en"), "ARABICA");
    assert.ok(searchKo.length > 0);
    assert.ok(searchEn.length > 0);
  });
});
