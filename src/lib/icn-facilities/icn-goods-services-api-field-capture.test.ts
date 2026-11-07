import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  captureGoodsServicesObservationFromApiRow,
  findUnknownDescriptionFieldKeys,
} from "./icn-goods-services-api-field-capture";
import {
  captureIcnGoodsServicesLanguageCatalog,
  capturePaginationBlocksPromotion,
  verifyGoodsServicesPageIdentity,
} from "./capture-icn-goods-services-catalog";
import { buildIcnGoodsServicesCompanionArtifact } from "./build-icn-goods-services-companion";
import { estimateUnfilteredCatalogCaptureRequests, IcnFacilitiesRequestBudget } from "./icn-goods-services-request-budget";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "./load-icn-facilities-fixture";

describe("icn-goods-services-api-field-capture", () => {
  it("rejects invalid object-valued GOODS without weakening string acceptance", () => {
    const result = captureGoodsServicesObservationFromApiRow(
      {
        sn: "1",
        facilitynm: "Test",
        facilityitem: " menu ",
        goods: "menu",
        GOODS: { bad: true },
      } as never,
      "K",
      0,
    );
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.detail, /GOODS|string/);
  });

  it("accepts uppercase GOODS alone", () => {
    const result = captureGoodsServicesObservationFromApiRow(
      { sn: "REVIEW-SYNTHETIC", facilitynm: "Synthetic", GOODS: "Tea" } as never,
      "K",
      0,
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.observation.fields.GOODS.present, true);
    if (result.observation.fields.GOODS.present) {
      assert.equal(result.observation.fields.GOODS.value, "Tea");
    }
    assert.equal(result.observation.fields.goods.present, false);
  });

  it("accepts GOODS alongside lowercase goods with differing text", () => {
    const result = captureGoodsServicesObservationFromApiRow(
      {
        sn: "3",
        facilitynm: "Shop",
        goods: "latte",
        GOODS: "LATTE",
      } as never,
      "E",
      1,
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.observation.fields.goods.present, true);
    if (result.observation.fields.goods.present) {
      assert.equal(result.observation.fields.goods.value, "latte");
    }
    assert.equal(result.observation.fields.GOODS.present, true);
    if (result.observation.fields.GOODS.present) {
      assert.equal(result.observation.fields.GOODS.value, "LATTE");
    }
  });

  it("rejects unknown Goods capitalization without aliasing", () => {
    const keys = findUnknownDescriptionFieldKeys({ Goods: "x", sn: "1", facilitynm: "n" } as never);
    assert.deepEqual(keys, ["Goods"]);
  });

  it("captures explicit null and absent separately", () => {
    const result = captureGoodsServicesObservationFromApiRow(
      {
        sn: "2",
        facilitynm: "Cafe",
        goods: null,
      } as never,
      "E",
      3,
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.observation.fields.facilityitem.present, false);
    assert.equal(result.observation.fields.goods.present, true);
    assert.equal(result.observation.fields.goods.value, null);
    assert.equal(result.observation.fields.GOODS.present, false);
  });
});

describe("capture-icn-goods-services-catalog pagination identity", () => {
  it("flags echoed pageNo mismatch on a later page", async () => {
    const budget = new IcnFacilitiesRequestBudget(5);
    const rows = Array.from({ length: 10 }, (_, i) => ({ sn: String(i + 1), facilitynm: `F${i}` }));
    const capture = await captureIcnGoodsServicesLanguageCatalog({
      lang: "K",
      pageSize: 10,
      budget,
      serviceKey: "test-service-key",
      fetchImpl: async (input) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        const pageNo = Number(new URL(url).searchParams.get("pageNo"));
        const body =
          pageNo === 1
            ? { pageNo: 1, numOfRows: 10, totalCount: 11, items: Object.fromEntries(rows.map((r, i) => [String(i), r])) }
            : { pageNo: 1, numOfRows: 10, totalCount: 11, items: { "0": { sn: "99", facilitynm: "Tail" } } };
        return new Response(
          JSON.stringify({ response: { header: { resultCode: "00", resultMsg: "OK" }, body } }),
          { status: 200 },
        );
      },
    });

    assert.ok(capturePaginationBlocksPromotion(capture));
    assert.match(capture.paginationIdentityErrors.join("; "), /Page 2 echoed pageNo 1/);
    assert.equal(capture.pages[1]?.requestedPageNo, 2);
    assert.equal(capture.pages[1]?.echoedPageNo, 1);

    const built = buildIcnGoodsServicesCompanionArtifact({
      koFixture: loadIcnFacilitiesKoFixture(),
      enFixture: loadIcnFacilitiesEnFixture(),
      captures: {
        K: {
          language: "K",
          startedAt: capture.startedAt,
          completedAt: capture.completedAt,
          apiReportedTotalCount: capture.apiReportedTotalCount,
          observations: capture.observations,
          rowCaptureFailures: capture.rowCaptureFailures,
          paginationIdentityErrors: capture.paginationIdentityErrors,
        },
        E: {
          language: "E",
          startedAt: capture.startedAt,
          completedAt: capture.completedAt,
          apiReportedTotalCount: 0,
          observations: [],
          rowCaptureFailures: [],
          paginationIdentityErrors: [],
        },
      },
    });
    assert.equal(built.ok, false);
  });

  it("flags echoed numOfRows mismatch", () => {
    const errors = verifyGoodsServicesPageIdentity(2, 100, {
      pageNo: 2,
      numOfRows: 50,
      totalCount: 200,
    });
    assert.deepEqual(errors, ["Page 2 echoed numOfRows 50 (requested 100)"]);
  });
});

describe("icn-goods-services-request-budget", () => {
  it("estimates dual-language capture within 30 requests at page size 100 and totalCount 1175", () => {
    const estimate = estimateUnfilteredCatalogCaptureRequests(1175, 100);
    assert.equal(estimate.pagesPerLanguage, 12);
    assert.equal(estimate.totalBothLanguages, 24);
    assert.ok(estimate.totalBothLanguages <= 30);
  });
});
