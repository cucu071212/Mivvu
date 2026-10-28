import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { fetchIcnFacilitiesPage } from "./icn-facilities-client";

describe("fetchIcnFacilitiesPage", () => {
  it("parses a successful page without exposing the service key in errors", async () => {
    const fetchImpl = async () =>
      new Response(
        JSON.stringify({
          response: {
            header: { resultCode: "00", resultMsg: "NORMAL SERVICE." },
            body: {
              pageNo: 1,
              numOfRows: 2,
              totalCount: 2,
              items: {
                "0": { sn: "1", facilitynm: "A" },
                "1": { sn: "2", facilitynm: "B" },
              },
            },
          },
        }),
        { status: 200 },
      );

    const page = await fetchIcnFacilitiesPage({
      lang: "K",
      pageNo: 1,
      numOfRows: 2,
      serviceKey: "test-key-not-logged",
      fetchImpl,
    });

    assert.equal(page.items.length, 2);
    assert.equal(page.body.totalCount, 2);
  });

  it("maps gateway key errors", async () => {
    const fetchImpl = async () =>
      new Response(
        JSON.stringify({
          OpenAPI_ServiceResponse: {
            cmmMsgHeader: { errMsg: "SERVICE_KEY_IS_NOT_REGISTERED_ERROR" },
          },
        }),
        { status: 200 },
      );

    await assert.rejects(
      () =>
        fetchIcnFacilitiesPage({
          lang: "K",
          pageNo: 1,
          numOfRows: 1,
          serviceKey: "bad",
          fetchImpl,
        }),
      /SERVICE_KEY_IS_NOT_REGISTERED_ERROR/i,
    );
  });
});
