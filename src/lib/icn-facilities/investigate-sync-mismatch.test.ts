import assert from "node:assert/strict";
import process from "node:process";
import { describe, it } from "vitest";
import { fetchIcnFacilitiesPage } from "./icn-facilities-client";
import { parseIcnApiItems } from "./parse-api-items";

const runInvestigation = process.env.ICN_INVESTIGATE === "1";

function rawItemStats(itemsRaw: unknown) {
  if (itemsRaw == null) {
    return { kind: "null", keyCount: 0, hasItemArray: false, parsedCount: 0 };
  }
  const obj = itemsRaw as Record<string, unknown>;
  const keys = Object.keys(obj);
  const hasItemArray = Array.isArray(obj.item);
  const hasSingleItem = Boolean(obj.item && typeof obj.item === "object" && !Array.isArray(obj.item));
  const numericKeys = keys.filter((k) => k !== "item");
  let parsedCount = 0;
  try {
    parsedCount = parseIcnApiItems(itemsRaw).length;
  } catch {
    parsedCount = -1;
  }
  return {
    kind: typeof itemsRaw,
    keyCount: keys.length,
    numericKeyCount: numericKeys.length,
    hasItemArray,
    hasSingleItem,
    parsedCount,
    sampleKeys: keys.slice(0, 5),
  };
}

describe.skipIf(!runInvestigation)("ICN sync mismatch investigation (live API)", () => {
  it(
    "records per-page metadata and compares page sizes on an overlapping range",
    async () => {
      const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY?.trim() ?? "";
      assert.notEqual(serviceKey, "", "DATA_GO_KR_SERVICE_KEY required");

      const pageSizeA = 100;
      const firstA = await fetchIcnFacilitiesPage({
        lang: "K",
        pageNo: 1,
        numOfRows: pageSizeA,
        serviceKey,
      });
      const totalA = firstA.body.totalCount;

      const pagesA = Math.ceil(totalA / pageSizeA);
      const perPageA: Array<Record<string, unknown>> = [];

      async function fetchRawPage(pageNo: number, numOfRows: number) {
        const parsed = await fetchIcnFacilitiesPage({
          lang: "K",
          pageNo,
          numOfRows,
          serviceKey,
        });
        const url = new URL("https://apis.data.go.kr/B551177/FacilitiesInformation/getFacilitesInfo");
        url.searchParams.set("serviceKey", serviceKey);
        url.searchParams.set("type", "json");
        url.searchParams.set("lang", "K");
        url.searchParams.set("pageNo", String(pageNo));
        url.searchParams.set("numOfRows", String(numOfRows));
        const res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(30_000) });
        const json = (await res.json()) as { response?: { body?: { items?: unknown } } };
        const itemsRaw = json.response?.body?.items;
        return { parsed, itemsRaw };
      }

      let sumA = 0;
      const snsByPage: string[][] = [];
      for (let pageNo = 1; pageNo <= pagesA; pageNo += 1) {
        const { parsed, itemsRaw } = await fetchRawPage(pageNo, pageSizeA);
        sumA += parsed.items.length;
        snsByPage.push(parsed.items.map((r) => String(r.sn ?? "")));
        perPageA.push({
          pageNo,
          requestedRows: pageSizeA,
          echoedPageNo: parsed.body.pageNo,
          echoedNumOfRows: parsed.body.numOfRows,
          totalCount: parsed.body.totalCount,
          parsedItemCount: parsed.items.length,
          raw: rawItemStats(itemsRaw),
        });
      }

      const pageSizeB = 50;
      const firstB = await fetchIcnFacilitiesPage({
        lang: "K",
        pageNo: 1,
        numOfRows: pageSizeB,
        serviceKey,
      });
      const totalB = firstB.body.totalCount;

      const overlapStartIndex = 990;
      const pageForA = Math.floor(overlapStartIndex / pageSizeA) + 1;
      const offsetInA = overlapStartIndex % pageSizeA;
      const pageForB = Math.floor(overlapStartIndex / pageSizeB) + 1;
      const offsetInB = overlapStartIndex % pageSizeB;

      const { parsed: overlapPageA } = await fetchRawPage(pageForA, pageSizeA);
      const { parsed: overlapPageB } = await fetchRawPage(pageForB, pageSizeB);

      const sliceA = overlapPageA.items
        .slice(offsetInA, offsetInA + 5)
        .map((r) => String(r.sn ?? ""));
      const sliceB = overlapPageB.items
        .slice(offsetInB, offsetInB + 5)
        .map((r) => String(r.sn ?? ""));

      const totalCountStability = {
        totalCount_page1_size100: totalA,
        totalCount_page1_size50: totalB,
        totalCount_match: totalA === totalB,
      };

      const beyondPages: Array<Record<string, unknown>> = [];
      for (const pageNo of [13, 14]) {
        const { parsed, itemsRaw } = await fetchRawPage(pageNo, pageSizeA);
        beyondPages.push({
          pageNo,
          parsedItemCount: parsed.items.length,
          totalCount: parsed.body.totalCount,
          raw: rawItemStats(itemsRaw),
        });
      }

      console.log(
        JSON.stringify(
          {
            paginationA: { pageSize: pageSizeA, pages: pagesA, sumParsedItems: sumA, perPage: perPageA },
            totalCountStability,
            overlapProbe: {
              overlapStartIndex,
              pageForA,
              offsetInA,
              pageForB,
              offsetInB,
              snSlice_size100: sliceA,
              snSlice_size50: sliceB,
              slicesMatch: JSON.stringify(sliceA) === JSON.stringify(sliceB),
            },
            beyondCalculatedPages: beyondPages,
          },
          null,
          2,
        ),
      );

      assert.equal(totalA, totalB, "totalCount should be stable across page sizes on page 1");
      assert.equal(sumA, 1028);
      assert.equal(beyondPages[0]?.parsedItemCount, 0);
      assert.equal(beyondPages[1]?.parsedItemCount, 0);
    },
    180_000,
  );
});
