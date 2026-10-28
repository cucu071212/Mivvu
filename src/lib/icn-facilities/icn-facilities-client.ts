/**
 * Server-only IIAC facilities API client (GW-ICN-004).
 * Do not import from client components; keep `DATA_GO_KR_SERVICE_KEY` on the server.
 */

import type { IcnFacilitiesLanguage } from "../../types/icn-facility-browse";
import {
  ICN_FACILITIES_API_BASE,
  ICN_FACILITIES_DEFAULT_TIMEOUT_MS,
  ICN_FACILITIES_MAX_PAGE_SIZE,
} from "./constants";
import { parseIcnFacilitiesApiResponse, type ParsedIcnFacilitiesPage } from "./parse-api-response";

export type FetchIcnFacilitiesPageOptions = {
  lang: IcnFacilitiesLanguage;
  pageNo: number;
  numOfRows: number;
  facilitynm?: string;
  timeoutMs?: number;
  serviceKey?: string;
  fetchImpl?: typeof fetch;
};

function resolveServiceKey(explicit?: string): string {
  const key = (explicit ?? process.env.DATA_GO_KR_SERVICE_KEY ?? "").trim();
  if (!key) {
    throw new Error(
      "Missing DATA_GO_KR_SERVICE_KEY (set in a gitignored file such as .env.local on the server)",
    );
  }
  return key;
}

export function buildIcnFacilitiesRequestUrl(
  options: FetchIcnFacilitiesPageOptions & { serviceKey: string },
): URL {
  const { lang, pageNo, numOfRows, facilitynm, serviceKey } = options;

  if (pageNo < 1) throw new Error("pageNo must be >= 1");
  if (numOfRows < 1 || numOfRows > ICN_FACILITIES_MAX_PAGE_SIZE) {
    throw new Error(`numOfRows must be between 1 and ${ICN_FACILITIES_MAX_PAGE_SIZE}`);
  }

  const url = new URL(ICN_FACILITIES_API_BASE);
  url.searchParams.set("serviceKey", serviceKey);
  url.searchParams.set("type", "json");
  url.searchParams.set("lang", lang);
  url.searchParams.set("pageNo", String(pageNo));
  url.searchParams.set("numOfRows", String(numOfRows));
  if (facilitynm?.trim()) {
    url.searchParams.set("facilitynm", facilitynm.trim());
  }
  return url;
}

export async function fetchIcnFacilitiesPage(
  options: FetchIcnFacilitiesPageOptions,
): Promise<ParsedIcnFacilitiesPage> {
  const serviceKey = resolveServiceKey(options.serviceKey);
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? ICN_FACILITIES_DEFAULT_TIMEOUT_MS;

  const url = buildIcnFacilitiesRequestUrl({ ...options, serviceKey });

  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: "GET",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new Error(`IIAC facilities fetch failed: ${String(error)}`);
  }

  const text = await response.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`IIAC facilities response was not JSON (HTTP ${response.status})`);
  }

  if (!response.ok) {
    const gateway = (json as { OpenAPI_ServiceResponse?: { cmmMsgHeader?: { errMsg?: string } } })
      ?.OpenAPI_ServiceResponse?.cmmMsgHeader?.errMsg;
    throw new Error(
      gateway
        ? `IIAC HTTP ${response.status}: ${gateway}`
        : `IIAC HTTP ${response.status} with API-level body`,
    );
  }

  return parseIcnFacilitiesApiResponse(json);
}
