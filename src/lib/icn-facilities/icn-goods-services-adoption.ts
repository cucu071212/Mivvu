import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import type { IcnFacilitiesFixture } from "@/types/icn-facility-browse";
import type {
  IcnGoodsServicesCompanion,
  IcnGoodsServicesDetailProjection,
} from "@/types/icn-goods-services-companion";
import {
  createIcnFacilityRef,
  resolveIcnFacilityRef,
  serializeIcnFacilityRef,
  type IcnFacilityReferenceCatalogs,
} from "./icn-facility-reference";
import { buildIcnFacilityReferenceCatalogs } from "./icn-browse-detail-refs";
import {
  bindValidatedGoodsServicesCompanion,
  projectIcnGoodsServicesForDetail,
} from "./icn-goods-services-associate";
import { validateIcnGoodsServicesCompanion } from "./icn-goods-services-companion-validate";
import { companionTargetDigestsMatch } from "./icn-goods-services-target-digest";
import { icnFacilityContentFingerprint } from "./icn-snapshot-matching";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "./load-icn-facilities-fixture";

/** SHA-256 of the human-adopted October 31 companion artifact (exact file bytes). */
export const REVIEWED_ICN_GOODS_SERVICES_COMPANION_SHA256 =
  "45f52bc64da4493f94e2daf02ec319586d983a77cb6df2995a367cd747c36802";

export const REVIEWED_ICN_GOODS_SERVICES_COMPANION_PATH = path.join(
  process.cwd(),
  "src/data/fixtures/icn-goods-services-companion-v1.json",
);

export function sha256FileBytes(filePath: string): string {
  const text = readFileSync(filePath, "utf8");
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export function readReviewedGoodsServicesCompanionRaw(): unknown {
  const text = readFileSync(REVIEWED_ICN_GOODS_SERVICES_COMPANION_PATH, "utf8");
  if (sha256FileBytes(REVIEWED_ICN_GOODS_SERVICES_COMPANION_PATH) !== REVIEWED_ICN_GOODS_SERVICES_COMPANION_SHA256) {
    throw new Error("Reviewed companion fixture bytes do not match adopted SHA-256");
  }
  return JSON.parse(text) as unknown;
}

export type ReviewedCompanionLoadResult =
  | { ok: true; companion: IcnGoodsServicesCompanion }
  | { ok: false; reason: string };

export function loadAndValidateReviewedGoodsServicesCompanion(
  koFixture: IcnFacilitiesFixture,
  enFixture: IcnFacilitiesFixture,
): ReviewedCompanionLoadResult {
  let raw: unknown;
  try {
    raw = readReviewedGoodsServicesCompanionRaw();
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "companion read failed",
    };
  }
  const validated = validateIcnGoodsServicesCompanion(raw);
  if (!validated.valid) {
    return { ok: false, reason: validated.errors.join("; ") };
  }
  if (!companionTargetDigestsMatch(validated.companion, koFixture, enFixture)) {
    return { ok: false, reason: "targetCoreDigests mismatch vs shipped fixtures" };
  }
  return { ok: true, companion: validated.companion };
}

export type GoodsServicesAdoptionCoverageCounts = {
  rawWeightedKo: { visible: number; empty: number; noExact: number };
  rawWeightedEn: { visible: number; empty: number; noExact: number; koFallback: number };
  uniqueReferenceKo: { visible: number; empty: number; noExact: number };
  crossLocaleUnverifiedEn: number;
};

type CoverageBucket = {
  visible: number;
  empty: number;
  noExact: number;
  koFallback: number;
  crossLocale: number;
};

function emptyBucket(): CoverageBucket {
  return { visible: 0, empty: 0, noExact: 0, koFallback: 0, crossLocale: 0 };
}

function accumulate(bucket: CoverageBucket, out: IcnGoodsServicesDetailProjection): void {
  if (out.sectionVisible) {
    bucket.visible += 1;
    if (out.available?.fallbackUsed) bucket.koFallback += 1;
    return;
  }
  const reason = out.internal?.unavailable?.reason;
  if (reason === "empty") bucket.empty += 1;
  else if (reason === "no_exact_observation") bucket.noExact += 1;
  else if (reason === "cross_locale_association_unverified") bucket.crossLocale += 1;
}

function zeroCoverageCounts(): GoodsServicesAdoptionCoverageCounts {
  return {
    rawWeightedKo: { visible: 0, empty: 0, noExact: 0 },
    rawWeightedEn: { visible: 0, empty: 0, noExact: 0, koFallback: 0 },
    uniqueReferenceKo: { visible: 0, empty: 0, noExact: 0 },
    crossLocaleUnverifiedEn: 0,
  };
}

function projectForCoverage(
  companion: IcnGoodsServicesCompanion,
  koFixture: IcnFacilitiesFixture,
  enFixture: IcnFacilitiesFixture,
  catalogs: IcnFacilityReferenceCatalogs,
  serialized: string,
  previewLocale: "ko" | "en",
  cache: Map<string, IcnGoodsServicesDetailProjection>,
): IcnGoodsServicesDetailProjection {
  const key = `${previewLocale}:${serialized}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const resolution = resolveIcnFacilityRef(
    serialized,
    catalogs,
    previewLocale === "ko" ? "K" : "E",
  );
  const out = projectIcnGoodsServicesForDetail({
    rawCompanion: companion,
    koFixture,
    enFixture,
    referenceCatalogs: catalogs,
    serializedRef: serialized,
    previewLocale,
    resolution,
    koSourceLabel: "Korean listing only",
  });
  cache.set(key, out);
  return out;
}

export function uniqueRepresentativeRecords(
  fixture: IcnFacilitiesFixture,
): IcnFacilitiesFixture["facilities"] {
  const seen = new Set<string>();
  const out: IcnFacilitiesFixture["facilities"] = [];
  for (const record of fixture.facilities) {
    const fp = icnFacilityContentFingerprint(record);
    if (seen.has(fp)) continue;
    seen.add(fp);
    out.push(record);
  }
  return out;
}

export function measureGoodsServicesAdoptionCoverage(
  companion: IcnGoodsServicesCompanion,
): GoodsServicesAdoptionCoverageCounts {
  const koFixture = loadIcnFacilitiesKoFixture();
  const enFixture = loadIcnFacilitiesEnFixture();
  const boundCompanion = bindValidatedGoodsServicesCompanion(companion, koFixture, enFixture);
  if (!boundCompanion) {
    return zeroCoverageCounts();
  }
  const catalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
  const projectionCache = new Map<string, IcnGoodsServicesDetailProjection>();

  const koRaw = emptyBucket();
  const uniqueReferenceKo = emptyBucket();
  const seenKoFingerprint = new Set<string>();
  const koSerializedRefs: string[] = [];

  for (const record of koFixture.facilities) {
    const serialized = serializeIcnFacilityRef(createIcnFacilityRef(record, catalogs));
    koSerializedRefs.push(serialized);
    const out = projectForCoverage(
      boundCompanion,
      koFixture,
      enFixture,
      catalogs,
      serialized,
      "ko",
      projectionCache,
    );
    accumulate(koRaw, out);
    const fingerprint = icnFacilityContentFingerprint(record);
    if (!seenKoFingerprint.has(fingerprint)) {
      seenKoFingerprint.add(fingerprint);
      accumulate(uniqueReferenceKo, out);
    }
  }

  const enRaw = emptyBucket();
  for (const record of enFixture.facilities) {
    const serialized = serializeIcnFacilityRef(createIcnFacilityRef(record, catalogs));
    const out = projectForCoverage(
      boundCompanion,
      koFixture,
      enFixture,
      catalogs,
      serialized,
      "en",
      projectionCache,
    );
    accumulate(enRaw, out);
  }

  const crossLocale = emptyBucket();
  for (const serialized of koSerializedRefs) {
    const out = projectForCoverage(
      boundCompanion,
      koFixture,
      enFixture,
      catalogs,
      serialized,
      "en",
      projectionCache,
    );
    accumulate(crossLocale, out);
  }

  return {
    rawWeightedKo: {
      visible: koRaw.visible,
      empty: koRaw.empty,
      noExact: koRaw.noExact,
    },
    rawWeightedEn: {
      visible: enRaw.visible,
      empty: enRaw.empty,
      noExact: enRaw.noExact,
      koFallback: enRaw.koFallback,
    },
    uniqueReferenceKo: {
      visible: uniqueReferenceKo.visible,
      empty: uniqueReferenceKo.empty,
      noExact: uniqueReferenceKo.noExact,
    },
    crossLocaleUnverifiedEn: crossLocale.crossLocale,
  };
}
