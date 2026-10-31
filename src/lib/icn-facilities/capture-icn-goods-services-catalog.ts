import type { IcnFacilitiesLanguage } from "@/types/icn-facility-browse";
import type { IcnApiFacilityRow } from "@/types/icn-facility-browse";
import { ICN_FACILITIES_DEFAULT_PAGE_SIZE } from "./constants";
import { fetchIcnFacilitiesPage } from "./icn-facilities-client";
import type { ParsedIcnFacilitiesPage } from "./parse-api-response";
import {
  captureGoodsServicesObservationFromApiRow,
  type IcnGoodsServicesRowCaptureResult,
} from "./icn-goods-services-api-field-capture";
import type { IcnGoodsServicesObservation } from "@/types/icn-goods-services-companion";
import {
  IcnFacilitiesRequestBudget,
  estimateUnfilteredCatalogCaptureRequests,
} from "./icn-goods-services-request-budget";

export type IcnGoodsServicesCatalogTerminationReason =
  | "short_final_page"
  | "empty_on_planned_last_page"
  | "planned_pages_exhausted";

export type IcnGoodsServicesRawPageEvidence = {
  requestedPageNo: number;
  echoedPageNo: number;
  requestedNumOfRows: number;
  echoedNumOfRows: number;
  apiReportedTotalCount: number;
  itemCount: number;
  items: IcnApiFacilityRow[];
};

export type IcnGoodsServicesLanguageCatalogCapture = {
  language: IcnFacilitiesLanguage;
  pageSize: number;
  apiReportedTotalCount: number;
  recordCount: number;
  pages: IcnGoodsServicesRawPageEvidence[];
  observations: IcnGoodsServicesObservation[];
  rowCaptureFailures: Array<{ listingIndex: number; detail: string }>;
  paginationIdentityErrors: string[];
  anomalies: string[];
  terminationReason: IcnGoodsServicesCatalogTerminationReason | null;
  requestsUsed: number;
  startedAt: string;
  completedAt: string;
};

export type CaptureIcnGoodsServicesCatalogOptions = {
  lang: IcnFacilitiesLanguage;
  pageSize?: number;
  budget: IcnFacilitiesRequestBudget;
  serviceKey?: string;
  fetchImpl?: typeof fetch;
  now?: () => Date;
};

function totalPages(totalCount: number, pageSize: number): number {
  return Math.ceil(totalCount / pageSize);
}

function formatInstant(date: Date): string {
  return date.toISOString();
}

export function verifyGoodsServicesPageIdentity(
  requestedPageNo: number,
  requestedNumOfRows: number,
  body: ParsedIcnFacilitiesPage["body"],
): string[] {
  const errors: string[] = [];
  if (body.pageNo !== requestedPageNo) {
    errors.push(
      `Page ${requestedPageNo} echoed pageNo ${body.pageNo} (expected ${requestedPageNo})`,
    );
  }
  if (body.numOfRows !== requestedNumOfRows) {
    errors.push(
      `Page ${requestedPageNo} echoed numOfRows ${body.numOfRows} (requested ${requestedNumOfRows})`,
    );
  }
  return errors;
}

export function capturePaginationBlocksPromotion(
  capture: Pick<IcnGoodsServicesLanguageCatalogCapture, "paginationIdentityErrors">,
): boolean {
  return capture.paginationIdentityErrors.length > 0;
}

export function planUnfilteredGoodsServicesCapture(pageSize: number, apiReportedTotalCount: number): {
  fitsBudget: (maxRequests: number) => boolean;
  estimate: ReturnType<typeof estimateUnfilteredCatalogCaptureRequests>;
} {
  const estimate = estimateUnfilteredCatalogCaptureRequests(apiReportedTotalCount, pageSize);
  return {
    estimate,
    fitsBudget: (maxRequests) => estimate.totalBothLanguages <= maxRequests,
  };
}

/**
 * Sequential unfiltered catalog capture for one language. Each page attempt consumes budget.
 */
export async function captureIcnGoodsServicesLanguageCatalog(
  options: CaptureIcnGoodsServicesCatalogOptions,
): Promise<IcnGoodsServicesLanguageCatalogCapture> {
  const pageSize = options.pageSize ?? ICN_FACILITIES_DEFAULT_PAGE_SIZE;
  const now = options.now ?? (() => new Date());
  const startedAt = formatInstant(now());
  const pages: IcnGoodsServicesRawPageEvidence[] = [];
  const observations: IcnGoodsServicesObservation[] = [];
  const rowCaptureFailures: Array<{ listingIndex: number; detail: string }> = [];
  const paginationIdentityErrors: string[] = [];
  const anomalies: string[] = [];
  let listingIndex = 0;
  const requestsBefore = options.budget.used;
  let terminationReason: IcnGoodsServicesCatalogTerminationReason | null = null;

  const fetchPage = async (pageNo: number) => {
    options.budget.assertCanAttempt();
    options.budget.recordAttempt();
    return fetchIcnFacilitiesPage({
      lang: options.lang,
      pageNo,
      numOfRows: pageSize,
      serviceKey: options.serviceKey,
      fetchImpl: options.fetchImpl,
    });
  };

  const first = await fetchPage(1);
  const apiTotal = first.body.totalCount;
  const plannedPages = totalPages(apiTotal, pageSize);

  const ingest = (requestedPageNo: number, items: IcnApiFacilityRow[], body: typeof first.body) => {
    paginationIdentityErrors.push(
      ...verifyGoodsServicesPageIdentity(requestedPageNo, pageSize, body),
    );
    pages.push({
      requestedPageNo,
      echoedPageNo: body.pageNo,
      requestedNumOfRows: pageSize,
      echoedNumOfRows: body.numOfRows,
      apiReportedTotalCount: body.totalCount,
      itemCount: items.length,
      items: items.map((item) => ({ ...item })),
    });
    if (body.totalCount !== apiTotal) {
      anomalies.push(
        `Page ${requestedPageNo} totalCount ${body.totalCount} differs from page 1 (${apiTotal})`,
      );
    }
    for (const row of items) {
      const result: IcnGoodsServicesRowCaptureResult = captureGoodsServicesObservationFromApiRow(
        row,
        options.lang,
        listingIndex,
      );
      listingIndex += 1;
      if (!result.ok) {
        rowCaptureFailures.push({ listingIndex: listingIndex - 1, detail: result.detail });
        continue;
      }
      observations.push(result.observation);
    }
  };

  ingest(1, first.items, first.body);

  const pagesNeeded = totalPages(apiTotal, pageSize);
  const additionalPages = pagesNeeded - 1;
  if (additionalPages > options.budget.remaining) {
    throw new Error(
      `Capture would exceed request budget: language ${options.lang} needs ${pagesNeeded} pages but only ${options.budget.remaining} attempts remain`,
    );
  }

  for (let pageNo = 2; pageNo <= plannedPages; pageNo += 1) {
    options.budget.assertCanAttempt();
    const page = await fetchPage(pageNo);
    if (page.items.length === 0) {
      if (pageNo < plannedPages) {
        throw new Error(`Incomplete capture: page ${pageNo} returned zero items before last planned page`);
      }
      terminationReason = "empty_on_planned_last_page";
      ingest(pageNo, page.items, page.body);
      break;
    }
    ingest(pageNo, page.items, page.body);
    if (page.items.length < pageSize) {
      terminationReason = "short_final_page";
      break;
    }
  }

  if (terminationReason === null && plannedPages >= 1) {
    terminationReason = "planned_pages_exhausted";
  }

  const completedAt = formatInstant(now());
  const requestsUsed = options.budget.used - requestsBefore;

  if (observations.length !== listingIndex - rowCaptureFailures.length) {
    anomalies.push("Observation count mismatch after row failures");
  }

  if (observations.length < apiTotal) {
    anomalies.push(
      `Retrieved ${observations.length} rows; API totalCount ${apiTotal} (pagination exhausted)`,
    );
  }

  return {
    language: options.lang,
    pageSize,
    apiReportedTotalCount: apiTotal,
    recordCount: observations.length,
    pages,
    observations,
    rowCaptureFailures,
    paginationIdentityErrors,
    anomalies,
    terminationReason,
    requestsUsed,
    startedAt,
    completedAt,
  };
}
