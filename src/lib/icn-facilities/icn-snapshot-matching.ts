import type { IcnFacilityBrowseRecord, IcnFacilityBrowseRecordCore } from "@/types/icn-facility-browse";

/** All normalized content, in fixed key order. Only listingIndex is incidental. */
export function icnFacilityContent(record: IcnFacilityBrowseRecordCore) {
  return {
    sourceId: record.sourceId,
    airportIata: record.airportIata,
    language: record.language,
    name: record.name,
    "categories.large": record.categories.large,
    "categories.medium": record.categories.medium,
    "categories.small": record.categories.small,
    terminalId: record.terminalId,
    floor: record.floor,
    locationDescription: record.locationDescription,
    hoursText: record.hoursText,
    arrivalOrDeparture: record.arrivalOrDeparture,
    dutyFreeFlag: record.dutyFreeFlag,
    "source.apiOperation": record.source.apiOperation,
    "source.datasetId": record.source.datasetId,
  };
}

export function icnFacilityContentFingerprint(record: IcnFacilityBrowseRecordCore): string {
  return JSON.stringify(icnFacilityContent(record));
}

/** Preserve distinct variants and the earliest listingIndex for each identical row. */
export function collapseDuplicateListings(records: readonly IcnFacilityBrowseRecord[]): IcnFacilityBrowseRecord[] {
  const kept = new Map<string, IcnFacilityBrowseRecord>();
  for (const record of [...records].sort((a, b) => a.listingIndex - b.listingIndex)) {
    const key = icnFacilityContentFingerprint(record);
    if (!kept.has(key)) kept.set(key, record);
  }
  return [...kept.values()];
}

export function groupIcnRecordsBySourceId<T extends { sourceId: string }>(records: readonly T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const record of records) {
    const group = groups.get(record.sourceId) ?? [];
    group.push(record);
    groups.set(record.sourceId, group);
  }
  return groups;
}

/** Call after per-language content collapse, BEFORE UI filtering or lossy re-deduplication. */
export function matchUnambiguousIcnRecords<L extends { sourceId: string }, R extends { sourceId: string }>(
  left: readonly L[],
  right: readonly R[],
): Map<string, { left: L; right: R }> {
  const leftGroups = groupIcnRecordsBySourceId(left);
  const rightGroups = groupIcnRecordsBySourceId(right);
  const pairs = new Map<string, { left: L; right: R }>();
  for (const [id, rows] of leftGroups) {
    const other = rightGroups.get(id);
    if (rows.length === 1 && other?.length === 1) {
      pairs.set(id, { left: rows[0], right: other[0] });
    }
  }
  return pairs;
}
