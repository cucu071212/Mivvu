import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import type { IcnFacilitiesFixture } from "@/types/icn-facility-browse";
import type { IcnGoodsServicesCompanion } from "@/types/icn-goods-services-companion";
import {
  createIcnFacilityRef,
  resolveIcnFacilityRef,
  serializeIcnFacilityRef,
} from "./icn-facility-reference";
import { buildIcnFacilityReferenceCatalogs } from "./icn-browse-detail-refs";
import { projectIcnGoodsServicesForDetail } from "./icn-goods-services-associate";
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

function countForRecords(
  companion: IcnGoodsServicesCompanion,
  koFixture: IcnFacilitiesFixture,
  enFixture: IcnFacilitiesFixture,
  records: IcnFacilitiesFixture["facilities"],
  previewLocale: "ko" | "en",
): { visible: number; empty: number; noExact: number; koFallback: number; crossLocale: number } {
  const catalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
  const koSourceLabel = "Korean listing only";
  let visible = 0;
  let empty = 0;
  let noExact = 0;
  let koFallback = 0;
  let crossLocale = 0;
  for (const record of records) {
    const ref = createIcnFacilityRef(record, catalogs);
    const serialized = serializeIcnFacilityRef(ref);
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
      koSourceLabel,
    });
    if (out.sectionVisible) {
      visible += 1;
      if (out.available?.fallbackUsed) koFallback += 1;
    } else {
      const reason = out.internal?.unavailable?.reason;
      if (reason === "empty") empty += 1;
      else if (reason === "no_exact_observation") noExact += 1;
      else if (reason === "cross_locale_association_unverified") crossLocale += 1;
    }
  }
  return { visible, empty, noExact, koFallback, crossLocale };
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
  const koRaw = countForRecords(companion, koFixture, enFixture, koFixture.facilities, "ko");
  const enRaw = countForRecords(companion, koFixture, enFixture, enFixture.facilities, "en");
  const uniqueKo = countForRecords(
    companion,
    koFixture,
    enFixture,
    uniqueRepresentativeRecords(koFixture),
    "ko",
  );
  const crossLocaleEn = countForRecords(companion, koFixture, enFixture, koFixture.facilities, "en");
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
      visible: uniqueKo.visible,
      empty: uniqueKo.empty,
      noExact: uniqueKo.noExact,
    },
    crossLocaleUnverifiedEn: crossLocaleEn.crossLocale,
  };
}
