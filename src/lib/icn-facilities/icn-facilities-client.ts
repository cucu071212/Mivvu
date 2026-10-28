/**
 * Server-only IIAC facilities API client (GW-ICN-004).
 * Do not import from client components; keep `DATA_GO_KR_SERVICE_KEY` on the server.
 */

import "server-only";

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

const ERROR_MESSAGES = {
  MISSING_SERVICE_KEY: "Missing DATA_GO_KR_SERVICE_KEY on the server.",
  INVALID_REQUEST: "Invalid IIAC facilities request parameters.",
  TIMEOUT: "IIAC facilities request timed out.",
  NETWORK_FAILURE: "IIAC facilities request or response read failed.",
  HTTP_FAILURE: "IIAC facilities HTTP request failed.",
  INVALID_RESPONSE: "IIAC facilities response was not valid JSON.",
  API_FAILURE: "IIAC facilities API response failed validation.",
} as const;

export type IcnFacilitiesClientErrorCode = keyof typeof ERROR_MESSAGES;

/** Only controlled diagnostics: never retain a request, upstream error, body, or cause. */
export class IcnFacilitiesClientError extends Error {
  readonly code: IcnFacilitiesClientErrorCode;
  readonly httpStatus?: number;

  constructor(code: IcnFacilitiesClientErrorCode, httpStatus?: number) {
    super(ERROR_MESSAGES[code]);
    this.name = "IcnFacilitiesClientError";
    this.code = code;
    if (httpStatus !== undefined) this.httpStatus = httpStatus;
  }
}

function resolveServiceKey(explicit?: string): string {
  const key = (explicit ?? process.env.DATA_GO_KR_SERVICE_KEY ?? "").trim();
  if (!key) {
    throw new IcnFacilitiesClientError("MISSING_SERVICE_KEY");
  }
  return key;
}

export function buildIcnFacilitiesRequestUrl(
  options: FetchIcnFacilitiesPageOptions & { serviceKey: string },
): URL {
  const { lang, pageNo, numOfRows, facilitynm, serviceKey } = options;

  if (pageNo < 1) throw new IcnFacilitiesClientError("INVALID_REQUEST");
  if (numOfRows < 1 || numOfRows > ICN_FACILITIES_MAX_PAGE_SIZE) {
    throw new IcnFacilitiesClientError("INVALID_REQUEST");
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

  let url: URL;
  let signal: AbortSignal;
  try {
    url = buildIcnFacilitiesRequestUrl({ ...options, serviceKey });
    signal = AbortSignal.timeout(timeoutMs);
  } catch {
    throw new IcnFacilitiesClientError("INVALID_REQUEST");
  }

  let response: Response;
  let text: string;
  try {
    response = await fetchImpl(url, {
      method: "GET",
      signal,
    });
    text = await response.text();
  } catch {
    // Classify from our deadline signal, never from untrusted error text/name/cause.
    throw new IcnFacilitiesClientError(signal.aborted ? "TIMEOUT" : "NETWORK_FAILURE");
  }

  if (!response.ok) {
    throw new IcnFacilitiesClientError("HTTP_FAILURE", response.status);
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new IcnFacilitiesClientError("INVALID_RESPONSE");
  }

  try {
    return parseIcnFacilitiesApiResponse(json);
  } catch {
    // Parser diagnostics can contain API-supplied messages or codes. Do not forward them.
    throw new IcnFacilitiesClientError("API_FAILURE");
  }
}
