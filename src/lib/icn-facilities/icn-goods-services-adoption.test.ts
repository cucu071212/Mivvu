import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import {
  loadAndValidateReviewedGoodsServicesCompanion,
  measureGoodsServicesAdoptionCoverage,
  readReviewedGoodsServicesCompanionRaw,
  REVIEWED_ICN_GOODS_SERVICES_COMPANION_SHA256,
  sha256FileBytes,
  REVIEWED_ICN_GOODS_SERVICES_COMPANION_PATH,
  uniqueRepresentativeRecords,
} from "./icn-goods-services-adoption";
import {
  icnGoodsServicesDevCompanionLoadAllowed,
  loadIcnGoodsServicesCompanion,
} from "./load-icn-goods-services-companion";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "./load-icn-facilities-fixture";
import {
  createIcnFacilityRef,
  resolveIcnFacilityRef,
  serializeIcnFacilityRef,
} from "./icn-facility-reference";
import { buildIcnFacilityReferenceCatalogs } from "./icn-browse-detail-refs";
import { projectIcnGoodsServicesForDetail } from "./icn-goods-services-associate";
import { validateIcnGoodsServicesCompanion } from "./icn-goods-services-companion-validate";
import { companionTargetDigestsMatch } from "./icn-goods-services-target-digest";

describe("reviewed goods/services companion adoption", () => {
  it("matches adopted file SHA-256 and validates with bound fixtures", () => {
    assert.equal(sha256FileBytes(REVIEWED_ICN_GOODS_SERVICES_COMPANION_PATH), REVIEWED_ICN_GOODS_SERVICES_COMPANION_SHA256);
    const ko = loadIcnFacilitiesKoFixture();
    const en = loadIcnFacilitiesEnFixture();
    const loaded = loadAndValidateReviewedGoodsServicesCompanion(ko, en);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;
    assert.equal(loaded.companion.captures.K?.syncIntegrity, "api_total_mismatch");
    assert.equal(loaded.companion.captures.E?.syncIntegrity, "api_total_mismatch");
    assert.equal(loaded.companion.captures.K?.startedAt, "2026-10-31T04:36:14.329Z");
    assert.equal(loaded.companion.captures.K?.completedAt, "2026-10-31T04:36:25.856Z");
    assert.equal(loaded.companion.captures.E?.completedAt, "2026-10-31T04:36:34.450Z");
  });

  it(
    "meets independently reviewed coverage expectations per language",
    () => {
    const loaded = loadAndValidateReviewedGoodsServicesCompanion(
      loadIcnFacilitiesKoFixture(),
      loadIcnFacilitiesEnFixture(),
    );
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;
    const counts = measureGoodsServicesAdoptionCoverage(loaded.companion);
    assert.equal(counts.rawWeightedKo.visible, 861);
    assert.equal(counts.rawWeightedKo.empty, 162);
    assert.equal(counts.rawWeightedKo.noExact, 5);
    assert.equal(counts.rawWeightedEn.visible, 861);
    assert.equal(counts.rawWeightedEn.koFallback, 0);
    assert.equal(counts.uniqueReferenceKo.visible, 844);
    assert.equal(counts.uniqueReferenceKo.empty, 162);
    assert.equal(counts.uniqueReferenceKo.noExact, 5);
    assert.equal(uniqueRepresentativeRecords(loadIcnFacilitiesKoFixture()).length, 1011);
    assert.equal(counts.crossLocaleUnverifiedEn, 5);
    },
    120_000,
  );

  it("withholds enrichment for unmatched, empty, and visible matched rows", () => {
    const loaded = loadAndValidateReviewedGoodsServicesCompanion(
      loadIcnFacilitiesKoFixture(),
      loadIcnFacilitiesEnFixture(),
    );
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;
    const koFixture = loadIcnFacilitiesKoFixture();
    const enFixture = loadIcnFacilitiesEnFixture();
    const catalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
    const project = (sourceId: string) => {
      const record = koFixture.facilities.find((r) => r.sourceId === sourceId)!;
      const serializedRef = serializeIcnFacilityRef(createIcnFacilityRef(record, catalogs));
      return projectIcnGoodsServicesForDetail({
        rawCompanion: loaded.companion,
        koFixture,
        enFixture,
        referenceCatalogs: catalogs,
        serializedRef,
        previewLocale: "ko",
        resolution: resolveIcnFacilityRef(serializedRef, catalogs, "K"),
        koSourceLabel: "Korean listing only",
      });
    };
    const unmatched = project("2063");
    assert.equal(unmatched.sectionVisible, false);
    assert.equal(unmatched.internal?.unavailable?.reason, "no_exact_observation");
    const empty = project("3395");
    assert.equal(empty.sectionVisible, false);
    assert.equal(empty.internal?.unavailable?.reason, "empty");
    const arabica = project("3289");
    assert.equal(arabica.sectionVisible, true);
    assert.match(arabica.available?.paragraphs[0]?.text ?? "", /라테|Latte|교토/);
  });

  it("companionTargetDigestsMatch rejects tampered digest metadata", () => {
    const loaded = loadAndValidateReviewedGoodsServicesCompanion(
      loadIcnFacilitiesKoFixture(),
      loadIcnFacilitiesEnFixture(),
    );
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;
    const ko = loadIcnFacilitiesKoFixture();
    const en = loadIcnFacilitiesEnFixture();
    const tampered = {
      ...loaded.companion,
      targetCoreDigests: { ...loaded.companion.targetCoreDigests, K: "deadbeef" },
    };
    assert.equal(companionTargetDigestsMatch(tampered, ko, en), false);
    const raw = readReviewedGoodsServicesCompanionRaw();
    const validated = validateIcnGoodsServicesCompanion(raw);
    assert.equal(validated.valid, true);
    if (!validated.valid) return;
    assert.equal(companionTargetDigestsMatch(validated.companion, ko, en), true);
  });
});

describe("loadIcnGoodsServicesCompanion adoption wiring", () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
    vi.unstubAllEnvs();
  });

  it("loads reviewed companion by default without dev flag", () => {
    delete process.env.ICN_GOODS_SERVICES_DEV_COMPANION;
    const companion = loadIcnGoodsServicesCompanion();
    assert.ok(companion);
    assert.equal(companion?.captures.K?.recordCount, 1027);
  });

  it("loads labeled synthetic fixture only when dev flag is allowed", () => {
    vi.stubEnv("ICN_GOODS_SERVICES_DEV_COMPANION", "1");
    vi.stubEnv("NODE_ENV", "test");
    delete process.env.VERCEL_ENV;
    assert.equal(icnGoodsServicesDevCompanionLoadAllowed(), true);
    const companion = loadIcnGoodsServicesCompanion();
    assert.ok(companion);
    assert.equal(companion?.captures.K?.recordCount, 1);
  });

  it("still loads reviewed companion when dev flag blocked in production runtime", () => {
    vi.stubEnv("ICN_GOODS_SERVICES_DEV_COMPANION", "1");
    vi.stubEnv("NODE_ENV", "production");
    assert.equal(icnGoodsServicesDevCompanionLoadAllowed(), false);
    const companion = loadIcnGoodsServicesCompanion();
    assert.ok(companion);
    assert.equal(companion?.captures.K?.recordCount, 1027);
  });
});
