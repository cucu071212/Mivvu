import {
  ICN_FACILITIES_API_OPERATION,
  ICN_FACILITIES_DATASET_ID,
} from "@/types/icn-facility-browse";
import type { IcnFacilitiesLanguage } from "@/types/icn-facility-browse";
import type {
  IcnCapturedSourceText,
  IcnGoodsServicesCapture,
  IcnGoodsServicesCompanion,
  IcnGoodsServicesObservation,
} from "@/types/icn-goods-services-companion";
import { parseValidIcnFacilityContentFingerprint } from "./icn-facility-content-fingerprint-validate";

export const ICN_GOODS_SERVICES_FIELD_CODE_POINT_CAP = 16_384;

const COMPANION_TOP_LEVEL_KEYS = ["schemaVersion", "source", "targetCoreDigests", "captures"] as const;
const SOURCE_KEYS = ["datasetId", "apiOperation"] as const;
const TARGET_DIGEST_KEYS = ["K", "E"] as const;
const CAPTURE_KEYS = ["K", "E"] as const;
const CAPTURE_OBJECT_KEYS = [
  "startedAt",
  "completedAt",
  "coverage",
  "apiReportedTotalCount",
  "recordCount",
  "syncIntegrity",
  "observations",
] as const;
const OBSERVATION_KEYS = ["coreFingerprint", "fields"] as const;
const FIELD_KEYS = ["facilityitem", "goods", "GOODS"] as const;

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function countCodePoints(text: string): number {
  return [...text].length;
}

function rejectExtraKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  errors: string[],
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) {
      errors.push(`${path}: unknown key ${JSON.stringify(key)}`);
    }
  }
}

function parseSafeNonNegativeInt(value: unknown, path: string, errors: string[]): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || !Number.isSafeInteger(value)) {
    errors.push(`${path}: expected nonnegative safe integer`);
    return null;
  }
  return value;
}

/** ISO-8601 instant with timezone — aligned with core snapshot timestamp checks (no RFC / normalized impossible dates). */
const ISO_INSTANT_WITH_TIMEZONE =
  /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+-](\d{2}):(\d{2}))$/;

function parseIsoInstantWithTimezone(value: unknown, path: string, errors: string[]): string | null {
  if (typeof value !== "string") {
    errors.push(`${path}: expected ISO-8601 string with timezone`);
    return null;
  }
  const match = ISO_INSTANT_WITH_TIMEZONE.exec(value);
  if (!match || !Number.isFinite(Date.parse(value))) {
    errors.push(`${path}: expected ISO-8601 instant with timezone`);
    return null;
  }
  const hour = Number(match[2]);
  const minute = Number(match[3]);
  const second = Number(match[4]);
  const offsetHour = Number(match[5] ?? 0);
  const offsetMinute = Number(match[6] ?? 0);
  if (hour >= 24 || minute >= 60 || second >= 60 || offsetHour >= 24 || offsetMinute >= 60) {
    errors.push(`${path}: invalid time or offset component`);
    return null;
  }
  const datePart = match[1];
  if (new Date(`${datePart}T00:00:00.000Z`).toISOString().slice(0, 10) !== datePart) {
    errors.push(`${path}: invalid calendar date`);
    return null;
  }
  return value;
}

function parseSyncIntegrity(
  value: unknown,
  path: string,
  errors: string[],
): IcnGoodsServicesCapture["syncIntegrity"] | null {
  if (value === "complete" || value === "api_total_mismatch") {
    return value;
  }
  errors.push(`${path}: invalid syncIntegrity`);
  return null;
}

export type IcnGoodsServicesCompanionSchemaOutcome =
  | "accepted_v1"
  | "unsupported_version"
  | "invalid_artifact";

/** Classify schemaVersion before full validation (consumer unsupported_version vs invalid_artifact). */
export function classifyIcnGoodsServicesCompanionSchema(input: unknown): IcnGoodsServicesCompanionSchemaOutcome {
  if (!object(input)) return "invalid_artifact";
  const version = input.schemaVersion;
  if (typeof version !== "number" || !Number.isInteger(version) || version <= 0 || !Number.isSafeInteger(version)) {
    return "invalid_artifact";
  }
  if (version === 1) return "accepted_v1";
  return "unsupported_version";
}

function parseCapturedField(value: unknown, path: string, errors: string[]): IcnCapturedSourceText | null {
  if (!object(value)) {
    errors.push(`${path}: expected wrapper object`);
    return null;
  }
  rejectExtraKeys(value, value.present === true ? ["present", "value"] : ["present"], path, errors);
  if (!Object.hasOwn(value, "present") || typeof value.present !== "boolean") {
    errors.push(`${path}.present: required boolean`);
    return null;
  }
  if (!value.present) {
    if (Object.hasOwn(value, "value")) errors.push(`${path}: present:false must not include value`);
    return { present: false };
  }
  if (!Object.hasOwn(value, "value")) {
    errors.push(`${path}.value: required when present:true`);
    return null;
  }
  const { value: inner } = value;
  if (inner !== null && typeof inner !== "string") {
    errors.push(`${path}.value: expected string or null`);
    return null;
  }
  if (typeof inner === "string" && countCodePoints(inner) > ICN_GOODS_SERVICES_FIELD_CODE_POINT_CAP) {
    errors.push(`${path}.value: exceeds code point cap`);
    return null;
  }
  return { present: true, value: inner };
}

function parseObservation(
  value: unknown,
  index: number,
  captureLang: IcnFacilitiesLanguage,
  errors: string[],
): IcnGoodsServicesObservation | null {
  const path = `observations[${index}]`;
  if (!object(value)) {
    errors.push(`${path}: expected object`);
    return null;
  }
  rejectExtraKeys(value, OBSERVATION_KEYS, path, errors);
  const fp = parseValidIcnFacilityContentFingerprint(value.coreFingerprint);
  if (!fp) {
    errors.push(`${path}.coreFingerprint: invalid canonical fingerprint`);
    return null;
  }
  const parsedLang = (JSON.parse(fp.fingerprint) as { language: IcnFacilitiesLanguage }).language;
  if (parsedLang !== captureLang) {
    errors.push(`${path}.coreFingerprint: language must match capture ${captureLang}`);
    return null;
  }
  if (!object(value.fields)) {
    errors.push(`${path}.fields: required`);
    return null;
  }
  rejectExtraKeys(value.fields, FIELD_KEYS, `${path}.fields`, errors);
  const facilityitem = parseCapturedField(value.fields.facilityitem, `${path}.fields.facilityitem`, errors);
  const goods = parseCapturedField(value.fields.goods, `${path}.fields.goods`, errors);
  const GOODS = parseCapturedField(value.fields.GOODS, `${path}.fields.GOODS`, errors);
  if (!facilityitem || !goods || !GOODS) return null;
  return { coreFingerprint: fp.fingerprint, fields: { facilityitem, goods, GOODS } };
}

export type CompanionValidationResult =
  | { valid: true; companion: IcnGoodsServicesCompanion }
  | { valid: false; errors: string[] };

/** whole-candidate companion schema validation — invalid input rejects entire artifact */
export function validateIcnGoodsServicesCompanion(input: unknown): CompanionValidationResult {
  const errors: string[] = [];
  if (classifyIcnGoodsServicesCompanionSchema(input) !== "accepted_v1") {
    return { valid: false, errors: ["Unsupported or invalid schemaVersion"] };
  }
  if (!object(input)) return { valid: false, errors: ["Expected companion object"] };
  rejectExtraKeys(input, COMPANION_TOP_LEVEL_KEYS, "companion", errors);

  if (!object(input.source)) {
    errors.push("Invalid source constants");
  } else {
    rejectExtraKeys(input.source, SOURCE_KEYS, "source", errors);
    if (
      input.source.datasetId !== ICN_FACILITIES_DATASET_ID
      || input.source.apiOperation !== ICN_FACILITIES_API_OPERATION
    ) {
      errors.push("Invalid source constants");
    }
  }

  if (!object(input.targetCoreDigests)) {
    errors.push("Invalid targetCoreDigests");
  } else {
    rejectExtraKeys(input.targetCoreDigests, TARGET_DIGEST_KEYS, "targetCoreDigests", errors);
    if (typeof input.targetCoreDigests.K !== "string" || typeof input.targetCoreDigests.E !== "string") {
      errors.push("Invalid targetCoreDigests");
    }
  }

  if (!object(input.captures)) {
    errors.push("Missing captures");
  } else {
    rejectExtraKeys(input.captures, CAPTURE_KEYS, "captures", errors);
  }

  const captures: { K: IcnGoodsServicesCapture | null; E: IcnGoodsServicesCapture | null } = {
    K: null,
    E: null,
  };

  const parseCapture = (value: unknown, lang: IcnFacilitiesLanguage): IcnGoodsServicesCapture | null => {
    if (value === null) return null;
    if (!object(value)) {
      errors.push(`captures.${lang}: expected object or null`);
      return null;
    }
    rejectExtraKeys(value, CAPTURE_OBJECT_KEYS, `captures.${lang}`, errors);
    if (value.coverage !== "retrievable_catalog") {
      errors.push(`captures.${lang}.coverage invalid`);
    }
    const startedAt = parseIsoInstantWithTimezone(value.startedAt, `captures.${lang}.startedAt`, errors);
    const completedAt = parseIsoInstantWithTimezone(value.completedAt, `captures.${lang}.completedAt`, errors);
    const apiReportedTotalCount = parseSafeNonNegativeInt(
      value.apiReportedTotalCount,
      `captures.${lang}.apiReportedTotalCount`,
      errors,
    );
    const recordCount = parseSafeNonNegativeInt(value.recordCount, `captures.${lang}.recordCount`, errors);
    const syncIntegrity = parseSyncIntegrity(value.syncIntegrity, `captures.${lang}.syncIntegrity`, errors);

    const observations: IcnGoodsServicesObservation[] = [];
    if (Array.isArray(value.observations)) {
      value.observations.forEach((row, index) => {
        const obs = parseObservation(row, index, lang, errors);
        if (obs) observations.push(obs);
      });
    } else {
      errors.push(`captures.${lang}.observations: expected array`);
    }

    if (
      startedAt
      && completedAt
      && Date.parse(startedAt) > Date.parse(completedAt)
    ) {
      errors.push(`captures.${lang}: startedAt must not be after completedAt`);
    }

    if (recordCount !== null && observations.length !== recordCount) {
      errors.push(`captures.${lang}.recordCount: must equal observations length`);
    }

    if (
      syncIntegrity === "complete"
      && apiReportedTotalCount !== null
      && recordCount !== null
      && apiReportedTotalCount !== recordCount
    ) {
      errors.push(`captures.${lang}: complete syncIntegrity requires apiReportedTotalCount to equal recordCount`);
    }

    if (
      syncIntegrity === "api_total_mismatch"
      && apiReportedTotalCount !== null
      && recordCount !== null
      && apiReportedTotalCount === recordCount
    ) {
      errors.push(`captures.${lang}: api_total_mismatch requires apiReportedTotalCount to differ from recordCount`);
    }

    if (
      !startedAt
      || !completedAt
      || apiReportedTotalCount === null
      || recordCount === null
      || !syncIntegrity
    ) {
      return null;
    }

    return {
      startedAt,
      completedAt,
      coverage: "retrievable_catalog",
      apiReportedTotalCount,
      recordCount,
      syncIntegrity,
      observations,
    };
  };

  if (object(input.captures)) {
    captures.K = parseCapture(input.captures.K, "K");
    captures.E = parseCapture(input.captures.E, "E");
  }

  if (errors.length) return { valid: false, errors };

  const companion: IcnGoodsServicesCompanion = {
    schemaVersion: 1,
    source: input.source as IcnGoodsServicesCompanion["source"],
    targetCoreDigests: input.targetCoreDigests as IcnGoodsServicesCompanion["targetCoreDigests"],
    captures,
  };
  return { valid: true, companion };
}
