import type { IcnApiFacilityRow, IcnFacilitiesLanguage } from "@/types/icn-facility-browse";
import type { IcnCapturedSourceText, IcnGoodsServicesObservation } from "@/types/icn-goods-services-companion";
import { ICN_GOODS_SERVICES_FIELD_CODE_POINT_CAP } from "./icn-goods-services-companion-validate";
import { icnFacilityContentFingerprint } from "./icn-snapshot-matching";
import { normalizeIcnFacilityRow } from "./normalize-icn-facility";

export const ICN_GOODS_SERVICES_DESCRIPTION_FIELD_KEYS = ["facilityitem", "goods", "GOODS"] as const;

export type IcnGoodsServicesDescriptionFieldKey = (typeof ICN_GOODS_SERVICES_DESCRIPTION_FIELD_KEYS)[number];

const ACCEPTED_DESCRIPTION_FIELD_KEYS = new Set<string>(ICN_GOODS_SERVICES_DESCRIPTION_FIELD_KEYS);

function rowRecord(row: IcnApiFacilityRow): Record<string, unknown> {
  return row as Record<string, unknown>;
}

/** Unknown spellings such as `Goods` require review — not silently aliased. */
export function findUnknownDescriptionFieldKeys(row: IcnApiFacilityRow): string[] {
  const unknown: string[] = [];
  for (const key of Object.keys(rowRecord(row))) {
    if (ACCEPTED_DESCRIPTION_FIELD_KEYS.has(key)) {
      continue;
    }
    const lower = key.toLowerCase();
    if (lower === "facilityitem" || lower === "goods") {
      unknown.push(key);
    }
  }
  return unknown;
}

function captureOneField(row: Record<string, unknown>, key: IcnGoodsServicesDescriptionFieldKey): IcnCapturedSourceText | { invalid: string } {
  if (!Object.hasOwn(row, key)) {
    return { present: false };
  }
  const value = row[key];
  if (value === null) {
    return { present: true, value: null };
  }
  if (typeof value !== "string") {
    return { invalid: `${key}: expected string or null when present` };
  }
  if ([...value].length > ICN_GOODS_SERVICES_FIELD_CODE_POINT_CAP) {
    return { invalid: `${key}: exceeds code point cap` };
  }
  return { present: true, value };
}

export type IcnGoodsServicesRowCaptureResult =
  | { ok: true; observation: IcnGoodsServicesObservation }
  | { ok: false; reason: "unknown_field_keys" | "invalid_field"; detail: string };

export function captureGoodsServicesObservationFromApiRow(
  row: IcnApiFacilityRow,
  language: IcnFacilitiesLanguage,
  listingIndex: number,
): IcnGoodsServicesRowCaptureResult {
  const unknownKeys = findUnknownDescriptionFieldKeys(row);
  if (unknownKeys.length > 0) {
    return {
      ok: false,
      reason: "unknown_field_keys",
      detail: `Unknown description key spellings: ${unknownKeys.join(", ")}`,
    };
  }

  const record = rowRecord(row);
  const fields: Partial<IcnGoodsServicesObservation["fields"]> = {};
  for (const key of ICN_GOODS_SERVICES_DESCRIPTION_FIELD_KEYS) {
    const captured = captureOneField(record, key);
    if ("invalid" in captured) {
      return { ok: false, reason: "invalid_field", detail: captured.invalid };
    }
    fields[key] = captured;
  }

  let normalized;
  try {
    normalized = normalizeIcnFacilityRow(row, language);
  } catch (error) {
    return {
      ok: false,
      reason: "invalid_field",
      detail: error instanceof Error ? error.message : "normalize failed",
    };
  }

  const coreRecord = { ...normalized, listingIndex };
  return {
    ok: true,
    observation: {
      coreFingerprint: icnFacilityContentFingerprint(coreRecord),
      fields: fields as IcnGoodsServicesObservation["fields"],
    },
  };
}

export type IcnGoodsServicesFieldDisplayState = "absent" | "null" | "blank" | "placeholder" | "text";

export function describeCapturedFieldState(field: IcnCapturedSourceText): IcnGoodsServicesFieldDisplayState {
  if (!field.present) return "absent";
  if (field.value === null) return "null";
  if (!field.value.trim()) return "blank";
  if (field.value.trim() === "-") return "placeholder";
  return "text";
}
