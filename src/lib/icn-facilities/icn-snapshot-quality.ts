import type { IcnFacilitiesFixtureMeta, IcnFacilitiesLanguage, IcnFacilityBrowseRecord } from "@/types/icn-facility-browse";
import { validateIcnSnapshot, type SnapshotIssue } from "./validate-icn-snapshot";
import { findDuplicateSourceIds } from "./validate-sync";
import {
  collapseDuplicateListings, groupIcnRecordsBySourceId, icnFacilityContent,
  icnFacilityContentFingerprint, matchUnambiguousIcnRecords,
} from "./icn-snapshot-matching";

type Content = ReturnType<typeof icnFacilityContent>;
type MissingCount = { rawRows: number; collapsedListings: number; sourceIds: string[] };
type RecordGroup = { sourceId: string; records: Content[] };
type FieldChange = { field: string; before: unknown; after: unknown };
const missingSelectors = {
  name: (r: IcnFacilityBrowseRecord) => r.name,
  locationDescription: (r: IcnFacilityBrowseRecord) => r.locationDescription,
  terminalId: (r: IcnFacilityBrowseRecord) => r.terminalId,
  floor: (r: IcnFacilityBrowseRecord) => r.floor,
  hoursText: (r: IcnFacilityBrowseRecord) => r.hoursText,
  "categories.large": (r: IcnFacilityBrowseRecord) => r.categories.large,
  "categories.medium": (r: IcnFacilityBrowseRecord) => r.categories.medium,
  "categories.small": (r: IcnFacilityBrowseRecord) => r.categories.small,
  category: (r: IcnFacilityBrowseRecord) => Object.values(r.categories).find((v) => v?.trim()) ?? null,
};
type MissingFields = Record<keyof typeof missingSelectors, MissingCount>;

export type SnapshotAnalysis = {
  valid: boolean;
  errors: SnapshotIssue[];
  warnings: { code: string; message: string }[];
  metadata: IcnFacilitiesFixtureMeta | null;
  counts: {
    rawRows: number; collapsedListings: number; identicalDuplicatesCollapsed: number;
    distinctSourceIds: number; duplicateSourceIdGroups: number; conflictingSourceIdGroups: number;
  } | null;
  duplicateSourceIds: string[];
  conflicts: RecordGroup[];
  missingFields: MissingFields | null;
};
export type SnapshotAlignment = {
  sharedSourceIds: string[];
  matchedSourceIds: string[];
  koreanOnlySourceIds: string[];
  englishOnlySourceIds: string[];
  ambiguousSourceIds: { sourceId: string; koreanRecords: number; englishRecords: number }[];
};
export type SnapshotComparison = {
  added: RecordGroup[];
  removed: RecordGroup[];
  changed: { sourceId: string; fields: FieldChange[] }[];
  ambiguousMatches: { sourceId: string; baselineRecords: Content[]; candidateRecords: Content[]; contentChanged: boolean }[];
  unchangedSourceIds: number;
  metadataChanges: FieldChange[];
};
export type IcnSnapshotQualityReport = {
  schemaVersion: 1;
  valid: boolean;
  reviewNeeded: boolean;
  publicationDecision: "not_assessed";
  coverageNote: string;
  baseline: { ko: SnapshotAnalysis; en: SnapshotAnalysis; alignment: SnapshotAlignment | null };
  candidate: { ko: SnapshotAnalysis; en: SnapshotAnalysis; alignment: SnapshotAlignment | null };
  comparison: { ko: SnapshotComparison | null; en: SnapshotComparison | null };
};
type Analyzed = { report: SnapshotAnalysis; records: IcnFacilityBrowseRecord[] | null };

function contentSet(records: IcnFacilityBrowseRecord[]): Content[] {
  return [...records].sort((a, b) => {
    const x = icnFacilityContentFingerprint(a), y = icnFacilityContentFingerprint(b);
    return x < y ? -1 : x > y ? 1 : 0;
  }).map(icnFacilityContent);
}

function analyze(input: unknown, language: IcnFacilitiesLanguage): Analyzed {
  const validation = validateIcnSnapshot(input, language);
  if (!validation.valid) return {
    records: null,
    report: { valid: false, errors: validation.errors, warnings: [], metadata: null, counts: null, duplicateSourceIds: [], conflicts: [], missingFields: null },
  };
  const fixture = validation.fixture;
  const raw = fixture.facilities;
  const records = collapseDuplicateListings(raw);
  const groups = groupIcnRecordsBySourceId(records);
  const duplicateSourceIds = findDuplicateSourceIds(raw.map((r) => r.sourceId)).sort();
  const conflicts = [...groups.keys()].sort().filter((id) => groups.get(id)!.length > 1)
    .map((sourceId) => ({ sourceId, records: contentSet(groups.get(sourceId)!) }));
  const missingFields = Object.fromEntries(Object.entries(missingSelectors).map(([field, select]) => {
    const missing = (r: IcnFacilityBrowseRecord) => !select(r)?.trim();
    const collapsed = records.filter(missing);
    return [field, { rawRows: raw.filter(missing).length, collapsedListings: collapsed.length, sourceIds: [...new Set(collapsed.map((r) => r.sourceId))].sort() }];
  })) as MissingFields;
  const warnings: SnapshotAnalysis["warnings"] = [];
  if (fixture.meta.syncIntegrity === "api_total_mismatch") warnings.push({ code: "API_TOTAL_MISMATCH", message: `API reports ${fixture.meta.apiReportedTotalCount}; snapshot contains ${raw.length} raw rows. Discrepancy remains unresolved.` });
  if (raw.length !== records.length) warnings.push({ code: "IDENTICAL_DUPLICATES", message: `${raw.length - records.length} identical rows collapse; distinct content is retained.` });
  if (conflicts.length) warnings.push({ code: "CONFLICTING_SOURCE_IDS", message: `${conflicts.length} IDs have distinct records; no confident one-to-one match.` });
  if (Object.values(missingFields).some((v) => v.rawRows > 0)) warnings.push({ code: "MISSING_FIELDS", message: "Some fields are blank/null; see missingFields for raw and collapsed counts." });
  if (!raw.length) warnings.push({ code: "EMPTY_SNAPSHOT", message: "No listings; inspect coverage and any removals." });
  return {
    records,
    report: {
      valid: true, errors: [], warnings,
      metadata: { ...fixture.meta, ...(fixture.meta.duplicateSourceIds !== undefined ? { duplicateSourceIds: [...fixture.meta.duplicateSourceIds].sort() } : {}) },
      counts: { rawRows: raw.length, collapsedListings: records.length, identicalDuplicatesCollapsed: raw.length - records.length, distinctSourceIds: groups.size, duplicateSourceIdGroups: duplicateSourceIds.length, conflictingSourceIdGroups: conflicts.length },
      duplicateSourceIds, conflicts, missingFields,
    },
  };
}

function alignment(ko: Analyzed, en: Analyzed): SnapshotAlignment | null {
  if (!ko.records || !en.records) return null;
  const k = groupIcnRecordsBySourceId(ko.records), e = groupIcnRecordsBySourceId(en.records);
  const shared = [...k.keys()].filter((id) => e.has(id)).sort();
  const matched = matchUnambiguousIcnRecords(ko.records, en.records);
  return {
    sharedSourceIds: shared,
    matchedSourceIds: [...matched.keys()].sort(),
    koreanOnlySourceIds: [...k.keys()].filter((id) => !e.has(id)).sort(),
    englishOnlySourceIds: [...e.keys()].filter((id) => !k.has(id)).sort(),
    ambiguousSourceIds: shared.filter((id) => !matched.has(id)).map((sourceId) => ({ sourceId, koreanRecords: k.get(sourceId)!.length, englishRecords: e.get(sourceId)!.length })),
  };
}

function fieldsChanged(before: Record<string, unknown>, after: Record<string, unknown>): FieldChange[] {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].sort()
    .filter((field) => JSON.stringify(before[field]) !== JSON.stringify(after[field]))
    .map((field) => ({ field, before: before[field] ?? null, after: after[field] ?? null }));
}

function compare(baseline: Analyzed, candidate: Analyzed): SnapshotComparison | null {
  if (!baseline.records || !candidate.records) return null;
  const b = groupIcnRecordsBySourceId(baseline.records), c = groupIcnRecordsBySourceId(candidate.records);
  const matches = matchUnambiguousIcnRecords(baseline.records, candidate.records);
  const result: SnapshotComparison = {
    added: [], removed: [], changed: [], ambiguousMatches: [], unchangedSourceIds: 0,
    metadataChanges: fieldsChanged({ ...baseline.report.metadata }, { ...candidate.report.metadata }),
  };
  for (const sourceId of [...new Set([...b.keys(), ...c.keys()])].sort()) {
    const before = b.get(sourceId), after = c.get(sourceId);
    if (!before) result.added.push({ sourceId, records: contentSet(after!) });
    else if (!after) result.removed.push({ sourceId, records: contentSet(before) });
    else {
      const match = matches.get(sourceId);
      if (!match) {
        const baselineRecords = contentSet(before), candidateRecords = contentSet(after);
        result.ambiguousMatches.push({ sourceId, baselineRecords, candidateRecords, contentChanged: JSON.stringify(baselineRecords) !== JSON.stringify(candidateRecords) });
      } else {
        const fields = fieldsChanged(icnFacilityContent(match.left), icnFacilityContent(match.right));
        if (fields.length) result.changed.push({ sourceId, fields });
        else result.unchangedSourceIds += 1;
      }
    }
  }
  return result;
}

/** Pure, deterministic, offline analysis. Untrusted values cross validation before any typed use. */
export function analyzeIcnSnapshots(
  baseline: { ko: unknown; en: unknown }, candidate: { ko: unknown; en: unknown },
): IcnSnapshotQualityReport {
  const b = { ko: analyze(baseline.ko, "K"), en: analyze(baseline.en, "E") };
  const c = { ko: analyze(candidate.ko, "K"), en: analyze(candidate.en, "E") };
  const baselineReport = { ko: b.ko.report, en: b.en.report, alignment: alignment(b.ko, b.en) };
  const candidateReport = { ko: c.ko.report, en: c.en.report, alignment: alignment(c.ko, c.en) };
  const comparison = { ko: compare(b.ko, c.ko), en: compare(b.en, c.en) };
  const valid = [b.ko, b.en, c.ko, c.en].every((r) => r.report.valid);
  const reviewNeeded = !valid || [b.ko, b.en, c.ko, c.en].some((r) => r.report.warnings.length > 0)
    || [baselineReport.alignment, candidateReport.alignment].some((a) => a && (a.koreanOnlySourceIds.length > 0 || a.englishOnlySourceIds.length > 0 || a.ambiguousSourceIds.length > 0))
    || Object.values(comparison).some((d) => d && (d.added.length > 0 || d.removed.length > 0 || d.changed.length > 0 || d.ambiguousMatches.length > 0 || d.metadataChanges.length > 0));
  return {
    schemaVersion: 1, valid, reviewNeeded, publicationDecision: "not_assessed",
    coverageNote: "Matching totals do not prove complete airport coverage. Source IDs are not guaranteed stable across refreshes. No publication approval is inferred.",
    baseline: baselineReport, candidate: candidateReport, comparison,
  };
}
