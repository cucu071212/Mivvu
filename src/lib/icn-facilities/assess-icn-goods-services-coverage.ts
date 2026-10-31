import type { IcnFacilitiesFixture } from "@/types/icn-facility-browse";
import type { IcnGoodsServicesCompanion, IcnGoodsServicesObservation } from "@/types/icn-goods-services-companion";
import {
  createIcnFacilityRef,
  resolveIcnFacilityRef,
  serializeIcnFacilityRef,
} from "./icn-facility-reference";
import { buildIcnFacilityReferenceCatalogs } from "./icn-browse-detail-refs";
import {
  describeCapturedFieldState,
  type IcnGoodsServicesFieldDisplayState,
} from "./icn-goods-services-api-field-capture";
import { projectIcnGoodsServicesForDetail } from "./icn-goods-services-associate";
import { validateIcnGoodsServicesCompanion } from "./icn-goods-services-companion-validate";
import { icnFacilityContentFingerprint } from "./icn-snapshot-matching";

export type IcnGoodsServicesCaptureFieldStats = Record<
  "facilityitem" | "goods" | "GOODS",
  Record<IcnGoodsServicesFieldDisplayState, number>
>;

export type IcnGoodsServicesCoverageAssessment = {
  validation: ReturnType<typeof validateIcnGoodsServicesCompanion>;
  capture: {
    K: {
      requestsUsed: number;
      apiReportedTotalCount: number;
      recordCount: number;
      syncIntegrity: string | null;
      fieldStats: IcnGoodsServicesCaptureFieldStats;
      usableDescriptionRows: number;
      ambiguousFingerprintCount: number;
      observationsNotInShippedCore: number;
    };
    E: {
      requestsUsed: number;
      apiReportedTotalCount: number;
      recordCount: number;
      syncIntegrity: string | null;
      fieldStats: IcnGoodsServicesCaptureFieldStats;
      usableDescriptionRows: number;
      ambiguousFingerprintCount: number;
      observationsNotInShippedCore: number;
    };
  };
  association: {
    shippedKoRecords: number;
    shippedEnRecords: number;
    koLocale: {
      sectionVisible: number;
      hiddenByReason: Record<string, number>;
    };
    enLocale: {
      sectionVisible: number;
      enPrimaryVisible: number;
      koFallbackVisible: number;
      hiddenByReason: Record<string, number>;
    };
  };
  examples: {
    koVisibleText: string[];
    enVisibleText: string[];
    enFallbackText: string[];
    ambiguousFingerprintSample: string | null;
  };
};

function emptyFieldStats(): IcnGoodsServicesCaptureFieldStats {
  const states: IcnGoodsServicesFieldDisplayState[] = ["absent", "null", "blank", "placeholder", "text"];
  const base = Object.fromEntries(states.map((s) => [s, 0])) as Record<IcnGoodsServicesFieldDisplayState, number>;
  return {
    facilityitem: { ...base },
    goods: { ...base },
    GOODS: { ...base },
  };
}

function accumulateFieldStats(
  observations: IcnGoodsServicesObservation[],
): { stats: IcnGoodsServicesCaptureFieldStats; usableRows: number } {
  const stats = emptyFieldStats();
  let usableRows = 0;
  for (const obs of observations) {
    let rowUsable = false;
    for (const key of ["facilityitem", "goods", "GOODS"] as const) {
      const state = describeCapturedFieldState(obs.fields[key]);
      stats[key][state] += 1;
      if (state === "text") rowUsable = true;
    }
    if (rowUsable) usableRows += 1;
  }
  return { stats, usableRows };
}

function variantKey(observation: IcnGoodsServicesObservation): string {
  return JSON.stringify(observation.fields);
}

function analyzeCaptureLanguage(
  observations: IcnGoodsServicesObservation[],
  shippedFingerprints: Set<string>,
): {
  fieldStats: IcnGoodsServicesCaptureFieldStats;
  usableDescriptionRows: number;
  ambiguousFingerprintCount: number;
  observationsNotInShippedCore: number;
} {
  const { stats, usableRows } = accumulateFieldStats(observations);
  const byFp = new Map<string, Set<string>>();
  for (const obs of observations) {
    const variants = byFp.get(obs.coreFingerprint) ?? new Set<string>();
    variants.add(variantKey(obs));
    byFp.set(obs.coreFingerprint, variants);
  }
  let ambiguousFingerprintCount = 0;
  for (const variants of byFp.values()) {
    if (variants.size > 1) ambiguousFingerprintCount += 1;
  }

  let observationsNotInShippedCore = 0;
  for (const obs of observations) {
    if (!shippedFingerprints.has(obs.coreFingerprint)) {
      observationsNotInShippedCore += 1;
    }
  }

  return {
    fieldStats: stats,
    usableDescriptionRows: usableRows,
    ambiguousFingerprintCount,
    observationsNotInShippedCore,
  };
}

function bumpReason(map: Record<string, number>, reason: string | undefined): void {
  const key = reason ?? "unknown";
  map[key] = (map[key] ?? 0) + 1;
}

export function assessIcnGoodsServicesCoverage(options: {
  companion: IcnGoodsServicesCompanion;
  koFixture: IcnFacilitiesFixture;
  enFixture: IcnFacilitiesFixture;
  kRequestsUsed: number;
  eRequestsUsed: number;
  koSourceLabel?: string;
}): IcnGoodsServicesCoverageAssessment {
  const validation = validateIcnGoodsServicesCompanion(options.companion);
  const catalogs = buildIcnFacilityReferenceCatalogs(options.koFixture, options.enFixture);
  const koSourceLabel = options.koSourceLabel ?? "Korean listing only";

  const shippedKoFps = new Set(options.koFixture.facilities.map((r) => icnFacilityContentFingerprint(r)));
  const shippedEnFps = new Set(options.enFixture.facilities.map((r) => icnFacilityContentFingerprint(r)));
  const K = options.companion.captures.K!;
  const E = options.companion.captures.E!;
  const kAnalysis = analyzeCaptureLanguage(K.observations, shippedKoFps);
  const eAnalysis = analyzeCaptureLanguage(E.observations, shippedEnFps);

  const koHidden: Record<string, number> = {};
  const enHidden: Record<string, number> = {};
  let koVisible = 0;
  let enVisible = 0;
  let enPrimaryVisible = 0;
  let koFallbackVisible = 0;
  const koVisibleText: string[] = [];
  const enVisibleText: string[] = [];
  const enFallbackText: string[] = [];

  for (const record of options.koFixture.facilities) {
    const ref = createIcnFacilityRef(record, catalogs);
    const serialized = serializeIcnFacilityRef(ref);
    const resolution = resolveIcnFacilityRef(serialized, catalogs, "K");
    const out = projectIcnGoodsServicesForDetail({
      rawCompanion: options.companion,
      koFixture: options.koFixture,
      enFixture: options.enFixture,
      referenceCatalogs: catalogs,
      serializedRef: serialized,
      previewLocale: "ko",
      resolution,
      koSourceLabel,
    });
    if (out.sectionVisible) {
      koVisible += 1;
      const text = out.available?.paragraphs.map((p) => p.text).join(" | ") ?? "";
      if (text && koVisibleText.length < 5) koVisibleText.push(text.slice(0, 120));
    } else {
      bumpReason(koHidden, out.internal?.unavailable?.reason);
    }
  }

  for (const record of options.enFixture.facilities) {
    const ref = createIcnFacilityRef(record, catalogs);
    const serialized = serializeIcnFacilityRef(ref);
    const resolution = resolveIcnFacilityRef(serialized, catalogs, "E");
    const out = projectIcnGoodsServicesForDetail({
      rawCompanion: options.companion,
      koFixture: options.koFixture,
      enFixture: options.enFixture,
      referenceCatalogs: catalogs,
      serializedRef: serialized,
      previewLocale: "en",
      resolution,
      koSourceLabel,
    });
    if (out.sectionVisible) {
      enVisible += 1;
      const text = out.available?.paragraphs.map((p) => p.text).join(" | ") ?? "";
      if (out.available?.fallbackUsed) {
        koFallbackVisible += 1;
        if (text && enFallbackText.length < 5) enFallbackText.push(text.slice(0, 120));
      } else {
        enPrimaryVisible += 1;
        if (text && enVisibleText.length < 5) enVisibleText.push(text.slice(0, 120));
      }
    } else {
      bumpReason(enHidden, out.internal?.unavailable?.reason);
    }
  }

  let ambiguousFingerprintSample: string | null = null;
  const byFp = new Map<string, Set<string>>();
  for (const obs of K.observations) {
    const set = byFp.get(obs.coreFingerprint) ?? new Set();
    set.add(variantKey(obs));
    byFp.set(obs.coreFingerprint, set);
  }
  for (const [fp, variants] of byFp) {
    if (variants.size > 1) {
      ambiguousFingerprintSample = fp.slice(0, 80);
      break;
    }
  }

  return {
    validation,
    capture: {
      K: {
        requestsUsed: options.kRequestsUsed,
        apiReportedTotalCount: K.apiReportedTotalCount,
        recordCount: K.recordCount,
        syncIntegrity: K.syncIntegrity,
        ...kAnalysis,
      },
      E: {
        requestsUsed: options.eRequestsUsed,
        apiReportedTotalCount: E.apiReportedTotalCount,
        recordCount: E.recordCount,
        syncIntegrity: E.syncIntegrity,
        ...eAnalysis,
      },
    },
    association: {
      shippedKoRecords: options.koFixture.facilities.length,
      shippedEnRecords: options.enFixture.facilities.length,
      koLocale: { sectionVisible: koVisible, hiddenByReason: koHidden },
      enLocale: {
        sectionVisible: enVisible,
        enPrimaryVisible,
        koFallbackVisible,
        hiddenByReason: enHidden,
      },
    },
    examples: {
      koVisibleText,
      enVisibleText,
      enFallbackText,
      ambiguousFingerprintSample,
    },
  };
}
