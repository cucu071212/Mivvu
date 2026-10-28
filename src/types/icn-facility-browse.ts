/**
 * ICN terminal facilities — browse-only records (GW-ICN-004).
 * Intentionally separate from {@link Facility}: no fabricated walk/queue minutes or SFO zones.
 */

export const ICN_AIRPORT_IATA = "ICN" as const;

export type IcnFacilitiesLanguage = "K" | "E";

/** IIAC data.go.kr dataset identifier (portal metadata). */
export const ICN_FACILITIES_DATASET_ID = "15095064" as const;

export const ICN_FACILITIES_API_OPERATION =
  "B551177/FacilitiesInformation/getFacilitesInfo" as const;

export type IcnFacilityBrowseRecordCore = {
  /** API `sn` (stringified; stability across refreshes not guaranteed; not always unique). */
  sourceId: string;
  airportIata: typeof ICN_AIRPORT_IATA;
  language: IcnFacilitiesLanguage;
  name: string;
  categories: {
    large: string | null;
    medium: string | null;
    small: string | null;
  };
  /** Raw `terminalid` (e.g. P01, P03); unknown codes preserved as-is. */
  terminalId: string | null;
  /** Raw `floorinfo` (e.g. F3); not normalized to a graph. */
  floor: string | null;
  locationDescription: string | null;
  /** Verbatim `servicetime`; not interpreted as live open/closed. */
  hoursText: string | null;
  /** `arrordep` when A or D; otherwise null. */
  arrivalOrDeparture: "A" | "D" | null;
  /** `lcduty` Y/N when present; otherwise null. */
  dutyFreeFlag: "Y" | "N" | null;
  source: {
    apiOperation: typeof ICN_FACILITIES_API_OPERATION;
    datasetId: typeof ICN_FACILITIES_DATASET_ID;
  };
};

export type IcnFacilityBrowseRecord = IcnFacilityBrowseRecordCore & {
  /** Zero-based order in the validated full sync (stable key within the fixture file). */
  listingIndex: number;
};

export type IcnFacilitiesFixtureMeta = {
  airportIata: typeof ICN_AIRPORT_IATA;
  language: IcnFacilitiesLanguage;
  source: typeof ICN_FACILITIES_API_OPERATION;
  /** ISO-8601 timestamp when the full sync completed successfully. */
  retrievedAt: string;
  /** Number of normalized records written. */
  recordCount: number;
  /** `totalCount` from the API on the first page of the sync. */
  apiReportedTotalCount: number;
  /** Distinct `sourceId` (`sn`) count when duplicates exist in the API corpus. */
  distinctSourceIdCount?: number;
  /** Duplicate `sn` values observed (not unique row keys). */
  duplicateSourceIds?: string[];
  /**
   * `complete` when fetched rows equal `apiReportedTotalCount`.
   * `api_total_mismatch` when pagination is exhausted but counts differ (honest partial).
   */
  syncIntegrity: "complete" | "api_total_mismatch";
};

export type IcnFacilitiesFixture = {
  meta: IcnFacilitiesFixtureMeta;
  facilities: IcnFacilityBrowseRecord[];
};

/** Loose shape of one row from `getFacilitesInfo` before normalization. */
export type IcnApiFacilityRow = {
  sn?: unknown;
  facilitynm?: unknown;
  lcategorynm?: unknown;
  mcategorynm?: unknown;
  scategorynm?: unknown;
  terminalid?: unknown;
  floorinfo?: unknown;
  lcnm?: unknown;
  servicetime?: unknown;
  arrordep?: unknown;
  lcduty?: unknown;
};
