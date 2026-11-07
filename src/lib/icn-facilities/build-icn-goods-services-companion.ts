import type { IcnFacilitiesLanguage } from "@/types/icn-facility-browse";
import {
  ICN_FACILITIES_DATASET_ID,
  ICN_FACILITIES_API_OPERATION,
} from "@/types/icn-facility-browse";
import type { IcnFacilitiesFixture } from "@/types/icn-facility-browse";
import type {
  IcnGoodsServicesCapture,
  IcnGoodsServicesCompanion,
  IcnGoodsServicesObservation,
} from "@/types/icn-goods-services-companion";
import { computeIcnGoodsServicesTargetCoreDigest } from "./icn-goods-services-target-digest";
import { evaluateSyncIntegrity } from "./validate-sync";

export type IcnGoodsServicesLanguageCaptureInput = {
  language: IcnFacilitiesLanguage;
  startedAt: string;
  completedAt: string;
  apiReportedTotalCount: number;
  observations: IcnGoodsServicesObservation[];
  rowCaptureFailures: Array<{ listingIndex: number; detail: string }>;
  paginationIdentityErrors?: string[];
};

export type BuildIcnGoodsServicesCompanionResult =
  | { ok: true; companion: IcnGoodsServicesCompanion }
  | { ok: false; reason: string };

function formatCaptureInstant(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "longOffset",
  }).formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const offsetRaw = pick("timeZoneName").replace("GMT", "");
  const offset = offsetRaw === "" ? "Z" : offsetRaw;
  return `${pick("year")}-${pick("month")}-${pick("day")}T${pick("hour")}:${pick("minute")}:${pick("second")}${offset}`;
}

export function buildIcnGoodsServicesCaptureBlock(
  input: IcnGoodsServicesLanguageCaptureInput,
): IcnGoodsServicesCapture | { error: string } {
  if (input.rowCaptureFailures.length > 0) {
    return {
      error: `Row capture failures (${input.rowCaptureFailures.length}); first: ${input.rowCaptureFailures[0]?.detail}`,
    };
  }

  if (input.paginationIdentityErrors && input.paginationIdentityErrors.length > 0) {
    return {
      error: `Pagination identity errors (${input.paginationIdentityErrors.length}); first: ${input.paginationIdentityErrors[0]}`,
    };
  }

  const recordCount = input.observations.length;
  const syncIntegrity = evaluateSyncIntegrity(input.apiReportedTotalCount, recordCount);
  if (recordCount !== input.apiReportedTotalCount && syncIntegrity !== "api_total_mismatch") {
    return { error: "Unexpected sync integrity classification" };
  }

  return {
    startedAt: input.startedAt,
    completedAt: input.completedAt,
    coverage: "retrievable_catalog",
    apiReportedTotalCount: input.apiReportedTotalCount,
    recordCount,
    syncIntegrity,
    observations: input.observations,
  };
}

export function buildIcnGoodsServicesCompanionArtifact(options: {
  koFixture: IcnFacilitiesFixture;
  enFixture: IcnFacilitiesFixture;
  captures: { K: IcnGoodsServicesLanguageCaptureInput; E: IcnGoodsServicesLanguageCaptureInput };
  captureStartedAt?: Date;
  captureCompletedAt?: Date;
}): BuildIcnGoodsServicesCompanionResult {
  const started = options.captureStartedAt ?? new Date();
  const completed = options.captureCompletedAt ?? started;
  const timeZone = "Asia/Seoul";

  const K = buildIcnGoodsServicesCaptureBlock({
    ...options.captures.K,
    startedAt: options.captures.K.startedAt || formatCaptureInstant(started, timeZone),
    completedAt: options.captures.K.completedAt || formatCaptureInstant(completed, timeZone),
  });
  if ("error" in K) return { ok: false, reason: K.error };

  const E = buildIcnGoodsServicesCaptureBlock({
    ...options.captures.E,
    startedAt: options.captures.E.startedAt || formatCaptureInstant(started, timeZone),
    completedAt: options.captures.E.completedAt || formatCaptureInstant(completed, timeZone),
  });
  if ("error" in E) return { ok: false, reason: E.error };

  return {
    ok: true,
    companion: {
      schemaVersion: 1,
      source: {
        datasetId: ICN_FACILITIES_DATASET_ID,
        apiOperation: ICN_FACILITIES_API_OPERATION,
      },
      targetCoreDigests: {
        K: computeIcnGoodsServicesTargetCoreDigest(options.koFixture),
        E: computeIcnGoodsServicesTargetCoreDigest(options.enFixture),
      },
      captures: { K, E },
    },
  };
}
