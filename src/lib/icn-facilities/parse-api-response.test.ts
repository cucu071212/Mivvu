import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { parseIcnFacilitiesApiResponse } from "./parse-api-response";

describe("parseIcnFacilitiesApiResponse", () => {
  it("accepts resultCode 00 with body pagination", () => {
    const parsed = parseIcnFacilitiesApiResponse({
      response: {
        header: { resultCode: "00", resultMsg: "NORMAL SERVICE." },
        body: {
          pageNo: 1,
          numOfRows: 10,
          totalCount: 1175,
          items: { "0": { sn: "1", facilitynm: "테스트" } },
        },
      },
    });
    assert.equal(parsed.header.resultCode, "00");
    assert.equal(parsed.body.totalCount, 1175);
    assert.equal(parsed.items.length, 1);
  });

  it("surfaces gateway service key errors", () => {
    assert.throws(
      () =>
        parseIcnFacilitiesApiResponse({
          OpenAPI_ServiceResponse: {
            cmmMsgHeader: {
              errMsg: "SERVICE_KEY_IS_NULL",
              returnReasonCode: "20",
            },
          },
        }),
      /SERVICE_KEY_IS_NULL/i,
    );
  });

  it("surfaces non-00 API result codes", () => {
    assert.throws(
      () =>
        parseIcnFacilitiesApiResponse({
          response: {
            header: { resultCode: "03", resultMsg: "ERROR" },
            body: { totalCount: 0, items: {} },
          },
        }),
      /resultCode 03/i,
    );
  });

  it("rejects unexpected root shape", () => {
    assert.throws(() => parseIcnFacilitiesApiResponse({ foo: 1 }), /unexpected response/i);
  });
});
