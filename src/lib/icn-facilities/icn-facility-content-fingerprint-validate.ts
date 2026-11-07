import {
  ICN_AIRPORT_IATA,
  ICN_FACILITIES_API_OPERATION,
  ICN_FACILITIES_DATASET_ID,
  type IcnFacilitiesLanguage,
} from "@/types/icn-facility-browse";

/** v1 콘텐츠 지문 JSON의 고정 키 순서 — reference contract와 동일 */
export const ICN_FACILITY_V1_CONTENT_FIELD_KEYS = [
  "sourceId",
  "airportIata",
  "language",
  "name",
  "categories.large",
  "categories.medium",
  "categories.small",
  "terminalId",
  "floor",
  "locationDescription",
  "hoursText",
  "arrivalOrDeparture",
  "dutyFreeFlag",
  "source.apiOperation",
  "source.datasetId",
] as const;

const NULLABLE_TEXT_FIELDS = [
  "categories.large",
  "categories.medium",
  "categories.small",
  "terminalId",
  "floor",
  "locationDescription",
  "hoursText",
] as const;

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** companion·reference 공용: bare canonical v1 content fingerprint 문자열 검증 */
export function parseValidIcnFacilityContentFingerprint(
  value: unknown,
): { sourceId: string; language: IcnFacilitiesLanguage; fingerprint: string } | null {
  if (typeof value !== "string") return null;
  let content: unknown;
  try {
    content = JSON.parse(value);
  } catch {
    return null;
  }
  if (
    !object(content)
    || JSON.stringify(Object.keys(content)) !== JSON.stringify(ICN_FACILITY_V1_CONTENT_FIELD_KEYS)
    || JSON.stringify(content) !== value
    || typeof content.sourceId !== "string"
    || !content.sourceId.trim()
    || content.airportIata !== ICN_AIRPORT_IATA
    || (content.language !== "K" && content.language !== "E")
    || typeof content.name !== "string"
    || !NULLABLE_TEXT_FIELDS.every((key) => content[key] === null || typeof content[key] === "string")
    || (content.arrivalOrDeparture !== null
      && content.arrivalOrDeparture !== "A"
      && content.arrivalOrDeparture !== "D")
    || (content.dutyFreeFlag !== null && content.dutyFreeFlag !== "Y" && content.dutyFreeFlag !== "N")
    || content["source.apiOperation"] !== ICN_FACILITIES_API_OPERATION
    || content["source.datasetId"] !== ICN_FACILITIES_DATASET_ID
  ) {
    return null;
  }
  return {
    sourceId: content.sourceId,
    language: content.language,
    fingerprint: value,
  };
}

export function validateIcnFacilityContentFingerprint(value: unknown): boolean {
  return parseValidIcnFacilityContentFingerprint(value) !== null;
}
