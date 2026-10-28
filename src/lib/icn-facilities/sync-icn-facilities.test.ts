import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { syncIcnFacilities } from "./sync-icn-facilities";

function pageBody(pageNo: number, rows: Array<{ sn: string; facilitynm: string }>, totalCount: number) {
  const items: Record<string, { sn: string; facilitynm: string }> = {};
  rows.forEach((row, index) => {
    items[String(index)] = row;
  });
  return {
    response: {
      header: { resultCode: "00", resultMsg: "NORMAL SERVICE." },
      body: { pageNo, numOfRows: rows.length, totalCount, items },
    },
  };
}

describe("syncIcnFacilities", () => {
  it("fetches pages sequentially until totalCount is satisfied", async () => {
    const calls: number[] = [];
    const fetchImpl = async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      const pageNo = Number(url.searchParams.get("pageNo"));
      calls.push(pageNo);
      if (pageNo === 1) {
        return new Response(
          JSON.stringify(
            pageBody(1, [{ sn: "1", facilitynm: "A" }, { sn: "2", facilitynm: "B" }], 3),
          ),
          { status: 200 },
        );
      }
      return new Response(
        JSON.stringify(pageBody(2, [{ sn: "3", facilitynm: "C" }], 3)),
        { status: 200 },
      );
    };

    const result = await syncIcnFacilities({
      lang: "K",
      pageSize: 2,
      serviceKey: "k",
      fetchImpl,
    });

    assert.deepEqual(calls, [1, 2]);
    assert.equal(result.fixture.meta.recordCount, 3);
    assert.equal(result.fixture.meta.apiReportedTotalCount, 3);
    assert.equal(result.fixture.facilities[2]?.name, "C");
    assert.equal(result.fixture.facilities[2]?.listingIndex, 2);
  });

  it("stops after a short final page without requesting trailing empty pages", async () => {
    const calls: number[] = [];
    const fetchImpl = async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      const pageNo = Number(url.searchParams.get("pageNo"));
      calls.push(pageNo);
      if (pageNo === 1) {
        return new Response(
          JSON.stringify(
            pageBody(1, [{ sn: "1", facilitynm: "A" }, { sn: "2", facilitynm: "B" }], 3),
          ),
          { status: 200 },
        );
      }
      if (pageNo === 2) {
        return new Response(JSON.stringify(pageBody(2, [{ sn: "3", facilitynm: "C" }], 3)), {
          status: 200,
        });
      }
      return new Response(
        JSON.stringify(pageBody(pageNo, [], 3)),
        { status: 200 },
      );
    };

    const result = await syncIcnFacilities({
      lang: "K",
      pageSize: 2,
      serviceKey: "k",
      fetchImpl,
    });

    assert.deepEqual(calls, [1, 2]);
    assert.equal(result.fixture.meta.recordCount, 3);
  });

  it("refuses partial sync when totalCount is not met", async () => {
    const fetchImpl = async () =>
      new Response(
        JSON.stringify(pageBody(1, [{ sn: "1", facilitynm: "A" }], 5)),
        { status: 200 },
      );

    await assert.rejects(
      () =>
        syncIcnFacilities({
          lang: "K",
          pageSize: 100,
          serviceKey: "k",
          fetchImpl,
        }),
      /incomplete sync/i,
    );
  });
});
