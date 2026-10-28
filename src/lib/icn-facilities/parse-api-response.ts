import { ICN_API_SUCCESS_RESULT_CODE } from "./constants";
import { parseIcnApiItems } from "./parse-api-items";
import type { IcnApiFacilityRow } from "../../types/icn-facility-browse";

export type ParsedIcnFacilitiesPage = {
  header: { resultCode: string; resultMsg: string };
  body: {
    pageNo: number;
    numOfRows: number;
    totalCount: number;
  };
  items: IcnApiFacilityRow[];
};

function readGatewayError(body: unknown): string | null {
  const header = (body as { OpenAPI_ServiceResponse?: { cmmMsgHeader?: unknown } })
    ?.OpenAPI_ServiceResponse?.cmmMsgHeader;
  if (!header || typeof header !== "object") return null;
  const errMsg = (header as { errMsg?: unknown }).errMsg;
  return errMsg ? String(errMsg) : null;
}

export function parseIcnFacilitiesApiResponse(body: unknown): ParsedIcnFacilitiesPage {
  const gatewayError = readGatewayError(body);
  if (gatewayError) {
    throw new Error(`IIAC gateway error: ${gatewayError}`);
  }

  const response = (body as { response?: unknown })?.response;
  if (!response || typeof response !== "object") {
    throw new Error("Unexpected response shape: missing response root");
  }

  const header = (response as { header?: unknown }).header;
  if (!header || typeof header !== "object") {
    throw new Error("Unexpected response shape: missing header");
  }

  const resultCode = String((header as { resultCode?: unknown }).resultCode ?? "");
  const resultMsg = String((header as { resultMsg?: unknown }).resultMsg ?? "");

  if (resultCode !== ICN_API_SUCCESS_RESULT_CODE) {
    throw new Error(`IIAC API resultCode ${resultCode}: ${resultMsg}`);
  }

  const responseBody = (response as { body?: unknown }).body;
  if (!responseBody || typeof responseBody !== "object") {
    throw new Error("Unexpected response shape: missing body");
  }

  const pageNo = Number((responseBody as { pageNo?: unknown }).pageNo);
  const numOfRows = Number((responseBody as { numOfRows?: unknown }).numOfRows);
  const totalCount = Number((responseBody as { totalCount?: unknown }).totalCount);

  if (!Number.isFinite(pageNo) || !Number.isFinite(numOfRows) || !Number.isFinite(totalCount)) {
    throw new Error("Unexpected response shape: invalid pagination fields");
  }

  const items = parseIcnApiItems((responseBody as { items?: unknown }).items);

  return {
    header: { resultCode, resultMsg },
    body: { pageNo, numOfRows, totalCount },
    items,
  };
}
