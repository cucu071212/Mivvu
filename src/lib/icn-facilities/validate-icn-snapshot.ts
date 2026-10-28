import {
  ICN_AIRPORT_IATA, ICN_FACILITIES_API_OPERATION, ICN_FACILITIES_DATASET_ID,
  type IcnFacilitiesFixture, type IcnFacilitiesLanguage,
} from "@/types/icn-facility-browse";
import { evaluateSyncIntegrity, findDuplicateSourceIds } from "./validate-sync";

export type SnapshotIssue = { path: string; code: string; message: string };
export type SnapshotValidation =
  | { valid: true; fixture: IcnFacilitiesFixture; errors: [] }
  | { valid: false; fixture: null; errors: SnapshotIssue[] };

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function count(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}
function text(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
function nullableText(value: unknown): boolean {
  return value === null || typeof value === "string";
}
function timestamp(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+-](\d{2}):(\d{2}))$/.exec(value);
  if (!match || !Number.isFinite(Date.parse(value))) return false;
  return new Date(`${match[1]}T00:00:00.000Z`).toISOString().slice(0, 10) === match[1]
    && Number(match[2]) < 24 && Number(match[3]) < 60 && Number(match[4]) < 60
    && Number(match[5] ?? 0) < 24 && Number(match[6] ?? 0) < 60;
}

/** Validate the normalized fixture contract, without coercion, live access, or writes. */
export function validateIcnSnapshot(input: unknown, language: IcnFacilitiesLanguage): SnapshotValidation {
  const errors: SnapshotIssue[] = [];
  const check = (ok: boolean, path: string, message: string, code = "INVALID_SCHEMA") => {
    if (!ok) errors.push({ path, code, message });
  };
  const keys = (value: Record<string, unknown>, allowed: string[], path: string) => {
    // Fail closed on schema extensions: do not silently erase new content while comparing.
    check(Object.keys(value).every((key) => allowed.includes(key)), path, "Unexpected field(s); review the fixture schema.");
  };
  if (!object(input)) return { valid: false, fixture: null, errors: [{ path: "$", code: "INVALID_SCHEMA", message: "Expected a fixture object." }] };
  keys(input, ["meta", "facilities"], "$");
  const meta = input.meta;
  check(object(meta), "meta", "Expected metadata object.");
  if (object(meta)) {
    keys(meta, ["airportIata", "language", "source", "retrievedAt", "recordCount", "apiReportedTotalCount", "distinctSourceIdCount", "duplicateSourceIds", "syncIntegrity"], "meta");
    check(meta.airportIata === ICN_AIRPORT_IATA, "meta.airportIata", "Expected ICN.");
    check(meta.language === language, "meta.language", `Expected language ${language}.`);
    check(meta.source === ICN_FACILITIES_API_OPERATION, "meta.source", "Unexpected source operation.");
    check(timestamp(meta.retrievedAt), "meta.retrievedAt", "Expected a valid ISO timestamp with timezone.");
    for (const key of ["recordCount", "apiReportedTotalCount"]) {
      check(count(meta[key]), `meta.${key}`, "Expected a nonnegative safe integer.");
    }
    if (meta.distinctSourceIdCount !== undefined) check(count(meta.distinctSourceIdCount), "meta.distinctSourceIdCount", "Expected a nonnegative safe integer.");
    if (meta.duplicateSourceIds !== undefined) check(Array.isArray(meta.duplicateSourceIds) && meta.duplicateSourceIds.every(text), "meta.duplicateSourceIds", "Expected an array of nonblank source IDs.");
    check(meta.syncIntegrity === "complete" || meta.syncIntegrity === "api_total_mismatch", "meta.syncIntegrity", "Unexpected integrity label.");
  }
  const rows = input.facilities;
  check(Array.isArray(rows), "facilities", "Expected an array of normalized records.");
  if (Array.isArray(rows)) {
    const indices = new Set<number>();
    rows.forEach((row: unknown, index) => {
      const path = `facilities[${index}]`;
      check(object(row), path, "Expected a record object.");
      if (!object(row)) return;
      keys(row, ["sourceId", "airportIata", "language", "listingIndex", "name", "categories", "terminalId", "floor", "locationDescription", "hoursText", "arrivalOrDeparture", "dutyFreeFlag", "source"], path);
      check(text(row.sourceId), `${path}.sourceId`, "Expected a nonblank source ID.");
      check(row.airportIata === ICN_AIRPORT_IATA, `${path}.airportIata`, "Expected ICN.");
      check(row.language === language, `${path}.language`, `Expected language ${language}.`);
      check(count(row.listingIndex), `${path}.listingIndex`, "Expected a nonnegative safe integer.");
      if (count(row.listingIndex)) {
        check(!indices.has(row.listingIndex), `${path}.listingIndex`, "Duplicate listing key.", "DUPLICATE_LISTING_INDEX");
        indices.add(row.listingIndex);
      }
      // Blank names are incomplete data; a non-string name violates the browse contract.
      check(typeof row.name === "string", `${path}.name`, "Expected a string (blank is reported as missing).");
      for (const key of ["terminalId", "floor", "locationDescription", "hoursText"]) {
        check(nullableText(row[key]), `${path}.${key}`, "Expected a string or explicit null for missing data.");
      }
      check(object(row.categories), `${path}.categories`, "Expected category object.");
      if (object(row.categories)) {
        keys(row.categories, ["large", "medium", "small"], `${path}.categories`);
        for (const key of ["large", "medium", "small"]) check(nullableText(row.categories[key]), `${path}.categories.${key}`, "Expected a string or explicit null for missing data.");
      }
      check(row.arrivalOrDeparture === null || row.arrivalOrDeparture === "A" || row.arrivalOrDeparture === "D", `${path}.arrivalOrDeparture`, "Expected A, D or null.");
      check(row.dutyFreeFlag === null || row.dutyFreeFlag === "Y" || row.dutyFreeFlag === "N", `${path}.dutyFreeFlag`, "Expected Y, N or null.");
      check(object(row.source), `${path}.source`, "Expected source object.");
      if (object(row.source)) {
        keys(row.source, ["apiOperation", "datasetId"], `${path}.source`);
        check(row.source.apiOperation === ICN_FACILITIES_API_OPERATION, `${path}.source.apiOperation`, "Unexpected source operation.");
        check(row.source.datasetId === ICN_FACILITIES_DATASET_ID, `${path}.source.datasetId`, "Unexpected dataset.");
      }
    });
  }
  if (errors.length) return { valid: false, fixture: null, errors };
  // The assertion is confined to the boundary after every schema field has been checked.
  const fixture = input as IcnFacilitiesFixture;
  const ids = fixture.facilities.map((row) => row.sourceId);
  const duplicates = findDuplicateSourceIds(ids).sort();
  const m = fixture.meta;
  check(m.recordCount === fixture.facilities.length, "meta.recordCount", "Declared count differs from actual raw rows.", "METADATA_INCONSISTENCY");
  check(m.syncIntegrity === evaluateSyncIntegrity(m.apiReportedTotalCount, fixture.facilities.length), "meta.syncIntegrity", "Integrity label disagrees with actual rows and API total.", "METADATA_INCONSISTENCY");
  if (m.distinctSourceIdCount !== undefined) check(m.distinctSourceIdCount === new Set(ids).size, "meta.distinctSourceIdCount", "Declared distinct count disagrees with actual IDs.", "METADATA_INCONSISTENCY");
  if (m.duplicateSourceIds !== undefined) check(JSON.stringify([...m.duplicateSourceIds].sort()) === JSON.stringify(duplicates), "meta.duplicateSourceIds", "Declared duplicate IDs disagree with actual raw rows.", "METADATA_INCONSISTENCY");
  return errors.length ? { valid: false, fixture: null, errors } : { valid: true, fixture, errors: [] };
}
