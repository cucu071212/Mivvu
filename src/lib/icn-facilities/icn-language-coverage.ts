import type { IcnFacilitiesFixture, IcnFacilityBrowseRecord } from "@/types/icn-facility-browse";
import { buildIcnBrowseCatalog } from "./icn-browse-view-model";
import { findDuplicateSourceIds } from "./validate-sync";

export type LanguageFixtureStats = {
  language: string;
  rawRowCount: number;
  apiReportedTotalCount: number;
  syncIntegrity: string;
  distinctSourceIdCount: number;
  duplicateSourceIdGroups: number;
  deduplicatedListingCount: number;
};

export type CrossLanguageIdSets = {
  sharedSourceIds: number;
  koreanOnlySourceIds: number;
  englishOnlySourceIds: number;
  koreanOnlySample: string[];
  englishOnlySample: string[];
};

export type SourceIdCardinality = {
  sourceId: string;
  koreanRows: number;
  englishRows: number;
  ambiguous: boolean;
};

export type FieldNullRates = {
  missingName: number;
  missingLocation: number;
  missingHours: number;
  missingTerminal: number;
  missingFloor: number;
  missingLargeCategory: number;
};

export type IcnLanguageCoverageReport = {
  korean: LanguageFixtureStats;
  english: LanguageFixtureStats;
  ids: CrossLanguageIdSets;
  ambiguousSourceIds: SourceIdCardinality[];
  koreanNullRates: FieldNullRates;
  englishNullRates: FieldNullRates;
  duplicateContentGroups: {
    korean: { groups: number; differingContentWithinDuplicateSn: number };
    english: { groups: number; differingContentWithinDuplicateSn: number };
  };
  representatives: {
    dining: { sourceId: string; koreanName: string | null; englishName: string | null } | null;
    restroom: { sourceId: string; koreanName: string | null; englishName: string | null } | null;
    lounge: { sourceId: string; koreanName: string | null; englishName: string | null } | null;
    restArea: { sourceId: string; koreanName: string | null; englishName: string | null } | null;
  };
};

function localeForFixtureLanguage(language: string): "ko" | "en" {
  return language === "E" ? "en" : "ko";
}

function statsForFixture(fixture: IcnFacilitiesFixture): LanguageFixtureStats {
  const catalog = buildIcnBrowseCatalog(fixture, localeForFixtureLanguage(fixture.meta.language));
  const dupes = findDuplicateSourceIds(fixture.facilities.map((r) => r.sourceId));
  return {
    language: fixture.meta.language,
    rawRowCount: fixture.meta.recordCount,
    apiReportedTotalCount: fixture.meta.apiReportedTotalCount,
    syncIntegrity: fixture.meta.syncIntegrity,
    distinctSourceIdCount: new Set(fixture.facilities.map((r) => r.sourceId)).size,
    duplicateSourceIdGroups: dupes.length,
    deduplicatedListingCount: catalog.snapshot.listingCount,
  };
}

function nullRates(records: IcnFacilityBrowseRecord[]): FieldNullRates {
  const missing = (pick: (r: IcnFacilityBrowseRecord) => boolean) =>
    records.filter(pick).length;
  return {
    missingName: missing((r) => !r.name.trim()),
    missingLocation: missing((r) => !r.locationDescription),
    missingHours: missing((r) => !r.hoursText),
    missingTerminal: missing((r) => !r.terminalId),
    missingFloor: missing((r) => !r.floor),
    missingLargeCategory: missing((r) => !r.categories.large),
  };
}

function rowsBySourceId(records: IcnFacilityBrowseRecord[]): Map<string, IcnFacilityBrowseRecord[]> {
  const map = new Map<string, IcnFacilityBrowseRecord[]>();
  for (const row of records) {
    const list = map.get(row.sourceId) ?? [];
    list.push(row);
    map.set(row.sourceId, list);
  }
  return map;
}

function duplicateSnContentVariance(records: IcnFacilityBrowseRecord[]): {
  groups: number;
  differingContentWithinDuplicateSn: number;
} {
  const bySn = rowsBySourceId(records);
  let groups = 0;
  let differing = 0;
  for (const [, rows] of bySn) {
    if (rows.length < 2) continue;
    groups += 1;
    const fingerprints = new Set(
      rows.map((r) =>
        JSON.stringify({
          name: r.name,
          locationDescription: r.locationDescription,
          categories: r.categories,
          terminalId: r.terminalId,
          floor: r.floor,
          hoursText: r.hoursText,
        }),
      ),
    );
    if (fingerprints.size > 1) differing += 1;
  }
  return { groups, differingContentWithinDuplicateSn: differing };
}

function pickRepresentative(
  koMap: Map<string, IcnFacilityBrowseRecord[]>,
  enMap: Map<string, IcnFacilityBrowseRecord[]>,
  predicate: (row: IcnFacilityBrowseRecord) => boolean,
): { sourceId: string; koreanName: string | null; englishName: string | null } | null {
  for (const [sourceId, koRows] of koMap) {
    const row = koRows.find(predicate);
    if (!row) continue;
    const enRow = enMap.get(sourceId)?.[0];
    return {
      sourceId,
      koreanName: row.name,
      englishName: enRow?.name ?? null,
    };
  }
  return null;
}

export function compareIcnLanguageFixtures(
  korean: IcnFacilitiesFixture,
  english: IcnFacilitiesFixture,
): IcnLanguageCoverageReport {
  const koMap = rowsBySourceId(korean.facilities);
  const enMap = rowsBySourceId(english.facilities);
  const koIds = new Set(koMap.keys());
  const enIds = new Set(enMap.keys());

  const shared: string[] = [];
  const koOnly: string[] = [];
  const enOnly: string[] = [];

  for (const id of koIds) {
    if (enIds.has(id)) shared.push(id);
    else koOnly.push(id);
  }
  for (const id of enIds) {
    if (!koIds.has(id)) enOnly.push(id);
  }

  const ambiguousSourceIds: SourceIdCardinality[] = [];
  for (const sourceId of shared) {
    const kRows = koMap.get(sourceId)?.length ?? 0;
    const eRows = enMap.get(sourceId)?.length ?? 0;
    if (kRows !== 1 || eRows !== 1) {
      ambiguousSourceIds.push({
        sourceId,
        koreanRows: kRows,
        englishRows: eRows,
        ambiguous: true,
      });
    }
  }

  return {
    korean: statsForFixture(korean),
    english: statsForFixture(english),
    ids: {
      sharedSourceIds: shared.length,
      koreanOnlySourceIds: koOnly.length,
      englishOnlySourceIds: enOnly.length,
      koreanOnlySample: koOnly.slice(0, 8),
      englishOnlySample: enOnly.slice(0, 8),
    },
    ambiguousSourceIds: ambiguousSourceIds.slice(0, 20),
    koreanNullRates: nullRates(korean.facilities),
    englishNullRates: nullRates(english.facilities),
    duplicateContentGroups: {
      korean: duplicateSnContentVariance(korean.facilities),
      english: duplicateSnContentVariance(english.facilities),
    },
    representatives: {
      dining: pickRepresentative(
        koMap,
        enMap,
        (r) => r.categories.large?.includes("식") || r.name.includes("커피") || r.name.includes("아라비카"),
      ),
      restroom: pickRepresentative(koMap, enMap, (r) => r.name.includes("화장실")),
      lounge: pickRepresentative(koMap, enMap, (r) => r.name.includes("라운지")),
      restArea: pickRepresentative(koMap, enMap, (r) => r.name.includes("휴게") || r.name.includes("수유")),
    },
  };
}
