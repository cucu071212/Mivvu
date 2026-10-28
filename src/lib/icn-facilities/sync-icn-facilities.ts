import type {
  IcnFacilitiesFixture,
  IcnFacilitiesLanguage,
  IcnFacilityBrowseRecord,
} from "../../types/icn-facility-browse";
import { ICN_FACILITIES_API_OPERATION, ICN_AIRPORT_IATA } from "../../types/icn-facility-browse";
import { ICN_FACILITIES_DEFAULT_PAGE_SIZE } from "./constants";
import { fetchIcnFacilitiesPage } from "./icn-facilities-client";
import type { ParsedIcnFacilitiesPage } from "./parse-api-response";
import { normalizeIcnFacilityRow } from "./normalize-icn-facility";
import {
  assertCompleteSync,
  evaluateSyncIntegrity,
  findDuplicateSourceIds,
} from "./validate-sync";

export type SyncIcnFacilitiesOptions = {
  lang: IcnFacilitiesLanguage;
  pageSize?: number;
  serviceKey?: string;
  fetchImpl?: typeof fetch;
  /**
   * When false, allow fewer rows than `totalCount` after all pages are fetched
   * (API `totalCount` can exceed retrievable rows; fixture meta records mismatch).
   */
  requireFullTotalCount?: boolean;
};

export type SyncIcnFacilitiesResult = {
  fixture: IcnFacilitiesFixture;
  pageCount: number;
  anomalies: string[];
  integrity: "complete" | "api_total_mismatch";
};

function totalPages(totalCount: number, pageSize: number): number {
  return Math.ceil(totalCount / pageSize);
}

/**
 * Fetches all pages sequentially, validates completeness, and returns a fixture envelope.
 * Does not write to disk; use {@link writeIcnFacilitiesFixtureFile} after success.
 */
export async function syncIcnFacilities(
  options: SyncIcnFacilitiesOptions,
): Promise<SyncIcnFacilitiesResult> {
  const pageSize = options.pageSize ?? ICN_FACILITIES_DEFAULT_PAGE_SIZE;
  const anomalies: string[] = [];
  const records: IcnFacilityBrowseRecord[] = [];
  let listingIndex = 0;

  const first = await fetchIcnFacilitiesPage({
    lang: options.lang,
    pageNo: 1,
    numOfRows: pageSize,
    serviceKey: options.serviceKey,
    fetchImpl: options.fetchImpl,
  });

  const apiTotal = first.body.totalCount;
  const pages = totalPages(apiTotal, pageSize);

  if (first.body.pageNo !== 1) {
    anomalies.push(`Page 1 echoed pageNo ${first.body.pageNo} (expected 1)`);
  }

  const ingestPage = (pageNo: number, items: ParsedIcnFacilitiesPage) => {
    if (items.body.pageNo !== pageNo) {
      anomalies.push(`Page ${pageNo} echoed pageNo ${items.body.pageNo}`);
    }
    if (items.body.totalCount !== apiTotal) {
      anomalies.push(
        `Page ${pageNo} totalCount ${items.body.totalCount} differs from first page ${apiTotal}`,
      );
    }
    for (const row of items.items) {
      const normalized = normalizeIcnFacilityRow(row, options.lang);
      records.push({ ...normalized, listingIndex });
      listingIndex += 1;
    }
  };

  ingestPage(1, first);

  for (let pageNo = 2; pageNo <= pages; pageNo += 1) {
    const page = await fetchIcnFacilitiesPage({
      lang: options.lang,
      pageNo,
      numOfRows: pageSize,
      serviceKey: options.serviceKey,
      fetchImpl: options.fetchImpl,
    });

    if (page.items.length === 0) {
      if (pageNo < pages) {
        throw new Error(`Incomplete sync: page ${pageNo} returned zero items before last page`);
      }
      break;
    }

    ingestPage(pageNo, page);

    if (page.items.length < pageSize) {
      break;
    }
  }

  const integrity = evaluateSyncIntegrity(apiTotal, records.length);
  const requireFullTotalCount = options.requireFullTotalCount ?? true;

  if (integrity === "api_total_mismatch") {
    anomalies.push(
      `Fetched ${records.length} rows but API totalCount is ${apiTotal} (pagination exhausted)`,
    );
    if (requireFullTotalCount) {
      throw new Error(
        `Incomplete sync: fetched ${records.length} records but API totalCount is ${apiTotal}`,
      );
    }
  } else {
    assertCompleteSync({ apiReportedTotalCount: apiTotal, records });
  }

  const duplicateSourceIds = findDuplicateSourceIds(records.map((r) => r.sourceId));
  if (duplicateSourceIds.length > 0) {
    anomalies.push(
      `API returned ${duplicateSourceIds.length} duplicate sn sourceId values (e.g. ${duplicateSourceIds.slice(0, 5).join(", ")})`,
    );
  }

  const retrievedAt = new Date().toISOString();
  const fixture: IcnFacilitiesFixture = {
    meta: {
      airportIata: ICN_AIRPORT_IATA,
      language: options.lang,
      source: ICN_FACILITIES_API_OPERATION,
      retrievedAt,
      recordCount: records.length,
      apiReportedTotalCount: apiTotal,
      distinctSourceIdCount: new Set(records.map((r) => r.sourceId)).size,
      duplicateSourceIds: duplicateSourceIds.length > 0 ? duplicateSourceIds : undefined,
      syncIntegrity: integrity,
    },
    facilities: records,
  };

  return { fixture, pageCount: pages, anomalies, integrity };
}

export type WriteFixtureOptions = {
  outputPath: string;
  fixture: IcnFacilitiesFixture;
  fs?: Pick<typeof import("node:fs/promises"), "writeFile" | "rename" | "unlink">;
};

/** Atomically replace fixture only after a validated sync object is ready. */
export async function writeIcnFacilitiesFixtureFile(
  options: WriteFixtureOptions,
): Promise<void> {
  const fs = options.fs ?? (await import("node:fs/promises"));
  const payload = `${JSON.stringify(options.fixture, null, 2)}\n`;
  const tempPath = `${options.outputPath}.tmp`;
  await fs.writeFile(tempPath, payload, "utf8");
  await fs.rename(tempPath, options.outputPath);
}
