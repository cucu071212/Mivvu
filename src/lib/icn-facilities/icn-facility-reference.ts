import {
  type IcnFacilitiesLanguage, type IcnFacilityBrowseRecord,
} from "@/types/icn-facility-browse";
import {
  collapseDuplicateListings, icnFacilityContentFingerprint, matchUnambiguousIcnRecords,
} from "./icn-snapshot-matching";
import { parseValidIcnFacilityContentFingerprint } from "./icn-facility-content-fingerprint-validate";

/** Content evidence, not a persistent real-world facility ID. */
export type IcnFacilityRef = {
  version: 1;
  contentFingerprint: string;
  /** Captured only when both complete catalogs permit a conservative 1:1 pair. */
  pairedContentFingerprint?: string;
};

/** Complete normalized records for each language, before search/terminal filters. */
export type IcnFacilityReferenceCatalogs = Readonly<
  Record<IcnFacilitiesLanguage, readonly IcnFacilityBrowseRecord[]>
>;

type InvalidReference =
  | { status: "invalid_reference" }
  | { status: "unsupported_version"; version: number };

export type IcnFacilityRefParseResult = { status: "valid"; ref: IcnFacilityRef } | InvalidReference;

export type IcnFacilityRefResolution =
  | { status: "found"; record: IcnFacilityBrowseRecord }
  | { status: "missing"; reason: "reference_content_not_found" | "locale_content_not_found" | "locale_not_captured" }
  | { status: "ambiguous"; reason: "bilingual_pairing" }
  | InvalidReference;

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readFingerprint(value: unknown): { sourceId: string; language: IcnFacilitiesLanguage } | null {
  const parsed = parseValidIcnFacilityContentFingerprint(value);
  if (!parsed) return null;
  return { sourceId: parsed.sourceId, language: parsed.language };
}

/** Accept a JSON-compatible object or its serialized JSON; no URI decoding is performed. */
export function parseIcnFacilityRef(input: unknown): IcnFacilityRefParseResult {
  let value: unknown = input;
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch { return { status: "invalid_reference" }; }
  }
  if (!object(value) || !Object.hasOwn(value, "version")
    || typeof value.version !== "number" || !Number.isSafeInteger(value.version) || value.version < 1) {
    return { status: "invalid_reference" };
  }
  if (value.version !== 1) return { status: "unsupported_version", version: value.version };
  if (!Object.keys(value).every((key) => ["version", "contentFingerprint", "pairedContentFingerprint"].includes(key))
    || !Object.hasOwn(value, "contentFingerprint")) return { status: "invalid_reference" };
  const origin = readFingerprint(value.contentFingerprint);
  if (!origin) return { status: "invalid_reference" };
  const ref: IcnFacilityRef = { version: 1, contentFingerprint: value.contentFingerprint as string };
  if (Object.hasOwn(value, "pairedContentFingerprint")) {
    const pair = readFingerprint(value.pairedContentFingerprint);
    if (!pair || pair.language === origin.language || pair.sourceId !== origin.sourceId) {
      return { status: "invalid_reference" };
    }
    ref.pairedContentFingerprint = value.pairedContentFingerprint as string;
  }
  return { status: "valid", ref };
}

/** Input is a normalized catalog member. Never create refs from lossy display projections. */
export function createIcnFacilityRef(
  record: IcnFacilityBrowseRecord,
  catalogs: IcnFacilityReferenceCatalogs,
): IcnFacilityRef {
  const ref: IcnFacilityRef = { version: 1, contentFingerprint: icnFacilityContentFingerprint(record) };
  const otherLanguage = record.language === "K" ? "E" : "K";
  const pairs = matchUnambiguousIcnRecords(
    collapseDuplicateListings(catalogs[record.language]),
    collapseDuplicateListings(catalogs[otherLanguage]),
  );
  const pair = pairs.get(record.sourceId);
  if (pair && icnFacilityContentFingerprint(pair.left) === ref.contentFingerprint) {
    ref.pairedContentFingerprint = icnFacilityContentFingerprint(pair.right);
  }
  return ref;
}

/** Serialize a valid typed ref; parse untrusted stored/link values before using them. */
export function serializeIcnFacilityRef(ref: IcnFacilityRef): string {
  return JSON.stringify({
    version: ref.version,
    contentFingerprint: ref.contentFingerprint,
    ...(ref.pairedContentFingerprint !== undefined ? { pairedContentFingerprint: ref.pairedContentFingerprint } : {}),
  });
}

/** No failure returns a fallback record. Catalog completeness is a caller precondition. */
export function resolveIcnFacilityRef(
  input: unknown,
  catalogs: IcnFacilityReferenceCatalogs,
  language: IcnFacilitiesLanguage,
): IcnFacilityRefResolution {
  const parsed = parseIcnFacilityRef(input);
  if (parsed.status !== "valid") return parsed;
  const { ref } = parsed;
  // Parsing has already validated the canonical fingerprint and language.
  const originLanguage = (JSON.parse(ref.contentFingerprint) as { language: IcnFacilitiesLanguage }).language;
  const originRows = collapseDuplicateListings(catalogs[originLanguage]);
  const origin = originRows.find((record) => icnFacilityContentFingerprint(record) === ref.contentFingerprint);
  if (!origin) return { status: "missing", reason: "reference_content_not_found" };
  if (language === originLanguage) return { status: "found", record: origin };

  const targetRows = collapseDuplicateListings(catalogs[language]);
  const pairs = matchUnambiguousIcnRecords(originRows, targetRows);
  const originCount = originRows.filter((record) => record.sourceId === origin.sourceId).length;
  const targetCount = targetRows.filter((record) => record.sourceId === origin.sourceId).length;
  if (originCount > 1 || targetCount > 1) return { status: "ambiguous", reason: "bilingual_pairing" };
  if (!ref.pairedContentFingerprint) return { status: "missing", reason: "locale_not_captured" };
  const pair = pairs.get(origin.sourceId);
  // Capturing both fingerprints prevents ID reuse in a later translation snapshot.
  if (!pair || icnFacilityContentFingerprint(pair.right) !== ref.pairedContentFingerprint) {
    return { status: "missing", reason: "locale_content_not_found" };
  }
  return { status: "found", record: pair.right };
}
