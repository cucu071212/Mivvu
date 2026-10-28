import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { IcnFacilitiesFixture, IcnFacilityBrowseRecord, IcnFacilitiesLanguage } from "@/types/icn-facility-browse";
import { loadIcnFacilitiesFixture } from "./load-icn-facilities-fixture";
import { analyzeIcnSnapshots } from "./icn-snapshot-quality";

function row(sourceId: string, overrides: Partial<IcnFacilityBrowseRecord> = {}): IcnFacilityBrowseRecord {
  return {
    sourceId, listingIndex: 0, airportIata: "ICN", language: "K", name: `Facility ${sourceId}`,
    categories: { large: "Food", medium: "Cafe", small: "Coffee" }, terminalId: "P01", floor: "F3",
    locationDescription: "Gate area", hoursText: "09:00–18:00", arrivalOrDeparture: "D", dutyFreeFlag: "N",
    source: { apiOperation: "B551177/FacilitiesInformation/getFacilitesInfo", datasetId: "15095064" },
    ...overrides,
  };
}
function fixture(language: IcnFacilitiesLanguage, records = [row("1")]): IcnFacilitiesFixture {
  return {
    meta: {
      airportIata: "ICN", language, source: "B551177/FacilitiesInformation/getFacilitesInfo",
      retrievedAt: "2026-10-28T00:00:00.000Z", recordCount: records.length,
      apiReportedTotalCount: records.length, syncIntegrity: "complete",
    },
    facilities: records.map((r, listingIndex) => ({ ...r, language, listingIndex })),
  };
}
function pair(records = [row("1")]) { return { ko: fixture("K", records), en: fixture("E", records) }; }
function report(candidate = pair(), baseline = pair()) { return analyzeIcnSnapshots(baseline, candidate); }

describe("ICN offline snapshot quality", () => {
  it("retains real counts and the known API mismatch without declaring complete coverage", () => {
    const current = { ko: loadIcnFacilitiesFixture("ko"), en: loadIcnFacilitiesFixture("en") };
    const result = report(current, current);
    assert.equal(result.valid, true);
    assert.equal(result.publicationDecision, "not_assessed");
    for (const lang of ["ko", "en"] as const) {
      const analysis = result.candidate[lang];
      assert.deepEqual(analysis.counts, {
        rawRows: 1028, collapsedListings: 1011, identicalDuplicatesCollapsed: 17,
        distinctSourceIds: 1011, duplicateSourceIdGroups: 17, conflictingSourceIdGroups: 0,
      });
      assert.equal(analysis.metadata?.apiReportedTotalCount, 1175);
      assert.equal(analysis.metadata?.syncIntegrity, "api_total_mismatch");
      assert.ok(analysis.warnings.some((w) => w.code === "API_TOTAL_MISMATCH"));
      const delta = result.comparison[lang]!;
      assert.deepEqual([delta.added, delta.removed, delta.changed, delta.ambiguousMatches, delta.metadataChanges], [[], [], [], [], []]);
      assert.equal(delta.unchangedSourceIds, 1011);
      assert.equal(analysis.missingFields?.hoursText.rawRows, 84);
    }
    assert.equal(result.candidate.en.missingFields?.["categories.large"].rawRows, 164);
    assert.equal(result.candidate.alignment?.matchedSourceIds.length, 1011);
    assert.deepEqual(result.candidate.alignment?.koreanOnlySourceIds, []);
    assert.deepEqual(result.candidate.alignment?.englishOnlySourceIds, []);
    const reordered = structuredClone(current);
    for (const f of [reordered.ko, reordered.en]) {
      f.facilities.reverse();
      f.facilities.forEach((r, i) => { r.listingIndex = i; });
    }
    assert.deepEqual(report(reordered, current), result);
  });

  it("is deterministic and insensitive to row, listingIndex and object-key order", () => {
    const baseline = pair([row("a"), row("b"), row("a")]);
    const candidate = pair([row("a"), row("b"), row("a")]);
    for (const f of [candidate.ko, candidate.en]) {
      f.facilities.reverse();
      f.facilities.forEach((r, i) => {
        r.listingIndex = i;
        r.categories = { small: "Coffee", medium: "Cafe", large: "Food" };
      });
    }
    assert.deepEqual(report(candidate, baseline), report(baseline, baseline));
    assert.deepEqual(report(candidate, baseline), report(candidate, baseline));
  });

  it("reports added/removed IDs and exact changed fields without pairing a reused ambiguous ID", () => {
    const baseline = pair([row("removed"), row("change"), row("reused")]);
    const candidate = pair([
      row("added"), row("change", { hoursText: "10:00–17:00", categories: { large: "Shop", medium: "Cafe", small: "Coffee" } }),
      row("reused"), row("reused", { terminalId: "P03", dutyFreeFlag: "Y" }),
    ]);
    const result = report(candidate, baseline);
    const delta = result.comparison.ko!;
    assert.deepEqual(delta.added.map((r) => r.sourceId), ["added"]);
    assert.deepEqual(delta.removed.map((r) => r.sourceId), ["removed"]);
    assert.deepEqual(delta.changed, [{ sourceId: "change", fields: [
      { field: "categories.large", before: "Food", after: "Shop" },
      { field: "hoursText", before: "09:00–18:00", after: "10:00–17:00" },
    ] }]);
    assert.equal(delta.ambiguousMatches.length, 1);
    assert.equal(delta.ambiguousMatches[0].sourceId, "reused");
    assert.equal(delta.ambiguousMatches[0].baselineRecords.length, 1);
    assert.equal(delta.ambiguousMatches[0].candidateRecords.length, 2);
    assert.equal(delta.ambiguousMatches[0].contentChanged, true);
    assert.equal(result.reviewNeeded, true);
    const reverse = report(baseline, candidate).comparison.ko!;
    assert.equal(reverse.ambiguousMatches.length, 1);
    assert.equal(reverse.changed.length, 1);
  });

  it("keeps unchanged ambiguous groups explicit while comparing their content sets", () => {
    const input = pair([row("a"), row("a", { arrivalOrDeparture: "A" }), row("a")]);
    const result = report(input, input);
    assert.equal(result.candidate.ko.counts?.identicalDuplicatesCollapsed, 1);
    assert.equal(result.candidate.ko.conflicts[0].records.length, 2);
    assert.equal(result.comparison.ko?.changed.length, 0);
    assert.equal(result.comparison.ko?.ambiguousMatches[0].contentChanged, false);
  });

  it("separates incomplete nullable/blank fields from invalid structures and preserves raw text", () => {
    const input = pair([row("gap", {
      name: "  ", locationDescription: null, terminalId: null, hoursText: "", floor: null,
      categories: { large: null, medium: null, small: null },
    }), row("gap", {
      name: "  ", locationDescription: null, terminalId: null, hoursText: "", floor: null,
      categories: { large: null, medium: null, small: null },
    })]);
    const result = report(input);
    assert.equal(result.valid, true);
    for (const field of ["name", "locationDescription", "terminalId", "hoursText", "category"] as const) {
      assert.deepEqual(result.candidate.ko.missingFields?.[field], { rawRows: 2, collapsedListings: 1, sourceIds: ["gap"] });
    }
    assert.equal(result.comparison.ko?.added[0].records[0].name, "  ");
    assert.equal(result.candidate.ko.warnings.some((w) => w.code === "MISSING_FIELDS"), true);
  });

  it("counts asymmetric coverage and excludes either-side conflicts after duplicate collapse", () => {
    const input = {
      ko: fixture("K", [row("ok"), row("ok"), row("ko-only"), row("ko-conflict"), row("ko-conflict", { name: "Other" }), row("en-conflict")]),
      en: fixture("E", [row("ok"), row("en-only"), row("ko-conflict"), row("en-conflict"), row("en-conflict", { dutyFreeFlag: "Y" })]),
    };
    const alignment = report(input).candidate.alignment!;
    assert.deepEqual(alignment.matchedSourceIds, ["ok"]);
    assert.deepEqual(alignment.koreanOnlySourceIds, ["ko-only"]);
    assert.deepEqual(alignment.englishOnlySourceIds, ["en-only"]);
    assert.deepEqual(alignment.ambiguousSourceIds, [
      { sourceId: "en-conflict", koreanRecords: 1, englishRecords: 2 },
      { sourceId: "ko-conflict", koreanRecords: 2, englishRecords: 1 },
    ]);
  });

  it("reports metadata changes separately and treats equal totals only as count consistency", () => {
    const candidate = pair();
    candidate.ko.meta.retrievedAt = "2026-10-29T00:00:00.000Z";
    const result = report(candidate);
    assert.equal(result.valid, true);
    assert.equal(result.comparison.ko?.changed.length, 0);
    assert.deepEqual(result.comparison.ko?.metadataChanges, [{ field: "retrievedAt", before: "2026-10-28T00:00:00.000Z", after: "2026-10-29T00:00:00.000Z" }]);
    assert.match(result.coverageNote, /not.*complete airport coverage/i);
    assert.equal(result.publicationDecision, "not_assessed");
  });

  it("allows empty snapshots but flags them for review and reports removals", () => {
    const result = report(pair([]));
    assert.equal(result.valid, true);
    assert.ok(result.candidate.ko.warnings.some((w) => w.code === "EMPTY_SNAPSHOT"));
    assert.equal(result.comparison.ko?.removed.length, 1);
  });

  it.each([
    ["null envelope", () => null],
    ["array envelope", () => []],
    ["missing meta", (f: IcnFacilitiesFixture) => ({ facilities: f.facilities })],
    ["missing facilities", (f: IcnFacilitiesFixture) => ({ meta: f.meta })],
    ["wrong airport", (f: IcnFacilitiesFixture) => ({ ...f, meta: { ...f.meta, airportIata: "SFO" } })],
    ["wrong expected language", (f: IcnFacilitiesFixture) => ({ ...f, meta: { ...f.meta, language: "E" } })],
    ["wrong operation", (f: IcnFacilitiesFixture) => ({ ...f, meta: { ...f.meta, source: "other" } })],
    ["bad timestamp", (f: IcnFacilitiesFixture) => ({ ...f, meta: { ...f.meta, retrievedAt: "2026-02-30T00:00:00.000Z" } })],
    ["wrong count", (f: IcnFacilitiesFixture) => ({ ...f, meta: { ...f.meta, recordCount: 100 } })],
    ["negative total", (f: IcnFacilitiesFixture) => ({ ...f, meta: { ...f.meta, apiReportedTotalCount: -1 } })],
    ["fractional total", (f: IcnFacilitiesFixture) => ({ ...f, meta: { ...f.meta, apiReportedTotalCount: 1.2 } })],
    ["string count", (f: IcnFacilitiesFixture) => ({ ...f, meta: { ...f.meta, recordCount: "1" } })],
    ["wrong integrity", (f: IcnFacilitiesFixture) => ({ ...f, meta: { ...f.meta, syncIntegrity: "api_total_mismatch" } })],
    ["hidden mismatch", (f: IcnFacilitiesFixture) => ({ ...f, meta: { ...f.meta, apiReportedTotalCount: 9 } })],
    ["wrong distinct count", (f: IcnFacilitiesFixture) => ({ ...f, meta: { ...f.meta, distinctSourceIdCount: 0 } })],
    ["wrong duplicates", (f: IcnFacilitiesFixture) => ({ ...f, meta: { ...f.meta, duplicateSourceIds: ["1"] } })],
    ["unexpected envelope field", (f: IcnFacilitiesFixture) => ({ ...f, extra: "not silently dropped" })],
    ["unexpected record field", (f: IcnFacilitiesFixture) => ({ ...f, facilities: [{ ...f.facilities[0], extra: "not silently dropped" }] })],
    ["missing normalized field", (f: IcnFacilitiesFixture) => ({ ...f, facilities: [{ ...f.facilities[0], hoursText: undefined }] })],
    ["null row", (f: IcnFacilitiesFixture) => ({ ...f, facilities: [null] })],
    ...[
      ["sourceId", "  "], ["name", 9], ["categories", null], ["source", { datasetId: "wrong" }],
      ["language", "E"], ["airportIata", "SFO"], ["listingIndex", -1], ["terminalId", {}],
      ["arrivalOrDeparture", "X"], ["dutyFreeFlag", "Maybe"], ["categories", { large: 9, medium: null, small: null }],
    ].map(([field, value]) => [String(field), (f: IcnFacilitiesFixture) => ({ ...f, facilities: [{ ...f.facilities[0], [String(field)]: value }] })]),
  ] as [string, (f: IcnFacilitiesFixture) => unknown][])("rejects %s without throwing or comparing invalid data", (_, mutate) => {
    const result = analyzeIcnSnapshots(pair(), { ko: mutate(fixture("K")), en: fixture("E") });
    assert.equal(result.valid, false);
    assert.ok(result.candidate.ko.errors.length > 0);
    assert.equal(result.candidate.ko.counts, null);
    assert.equal(result.candidate.alignment, null);
    assert.equal(result.comparison.ko, null);
    assert.notEqual(result.comparison.en, null);
  });

  it("rejects duplicate listing keys and inconsistent duplicate metadata", () => {
    const input = pair([row("1"), row("2")]);
    input.ko.facilities[1].listingIndex = 0;
    assert.equal(report(input).valid, false);
    const duplicates = pair([row("1"), row("1")]);
    duplicates.ko.meta.duplicateSourceIds = [];
    assert.equal(report(duplicates).valid, false);
    duplicates.ko.meta.duplicateSourceIds = ["1"];
    duplicates.ko.meta.distinctSourceIdCount = 1;
    assert.equal(report(duplicates).valid, true);
  });

  it("validates baseline as well as candidate and never mutates supplied inputs", () => {
    const baseline = pair();
    const candidate = pair([row("2")]);
    const before = JSON.stringify({ baseline, candidate });
    report(candidate, baseline);
    assert.equal(JSON.stringify({ baseline, candidate }), before);
    baseline.en.meta.language = "K";
    const result = report(candidate, baseline);
    assert.equal(result.valid, false);
    assert.equal(result.comparison.en, null);
  });
});
