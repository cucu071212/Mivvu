import assert from "node:assert/strict";
import process from "node:process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "vitest";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "./load-icn-facilities-fixture";
import { buildIcnGoodsServicesCompanionArtifact } from "./build-icn-goods-services-companion";
import {
  captureIcnGoodsServicesLanguageCatalog,
  planUnfilteredGoodsServicesCapture,
} from "./capture-icn-goods-services-catalog";
import { IcnFacilitiesRequestBudget } from "./icn-goods-services-request-budget";
import { assessIcnGoodsServicesCoverage } from "./assess-icn-goods-services-coverage";
import { validateIcnGoodsServicesCompanion } from "./icn-goods-services-companion-validate";
import { computeIcnGoodsServicesTargetCoreDigest } from "./icn-goods-services-target-digest";

const shouldRun = process.env.ICN_GOODS_SERVICES_CAPTURE === "1";
const MAX_REQUESTS = 30;

describe.skipIf(!shouldRun)("ICN goods/services real capture CLI", () => {
  it(
    "captures unfiltered K/E catalogs, builds validated candidate, writes external evidence",
    async () => {
      const serviceKey = (process.env.DATA_GO_KR_SERVICE_KEY ?? "").trim();
      assert.ok(serviceKey.length > 0, "DATA_GO_KR_SERVICE_KEY required");

      const outputRoot =
        process.env.ICN_GOODS_SERVICES_CAPTURE_DIR
        ?? path.join("/private/tmp/GW-ICN-015-evidence", "gw-icn-015-enrich-data-run");
      await mkdir(outputRoot, { recursive: true });

      const budget = new IcnFacilitiesRequestBudget(MAX_REQUESTS);
      const pageSize = 100;

      const koFixture = loadIcnFacilitiesKoFixture();
      const enFixture = loadIcnFacilitiesEnFixture();
      const expectedKoDigest = computeIcnGoodsServicesTargetCoreDigest(koFixture);
      const expectedEnDigest = computeIcnGoodsServicesTargetCoreDigest(enFixture);

      const plan = planUnfilteredGoodsServicesCapture(pageSize, 1175);
      assert.ok(plan.fitsBudget(MAX_REQUESTS), "planned capture must fit budget before live calls");

      const kCapture = await captureIcnGoodsServicesLanguageCatalog({ lang: "K", pageSize, budget });
      const eCapture = await captureIcnGoodsServicesLanguageCatalog({ lang: "E", pageSize, budget });

      assert.equal(kCapture.rowCaptureFailures.length, 0, "row capture failures reject candidate");
      assert.equal(eCapture.rowCaptureFailures.length, 0);

      assert.equal(kCapture.paginationIdentityErrors.length, 0);
      assert.equal(eCapture.paginationIdentityErrors.length, 0);

      const built = buildIcnGoodsServicesCompanionArtifact({
        koFixture,
        enFixture,
        captures: {
          K: {
            language: "K",
            startedAt: kCapture.startedAt,
            completedAt: kCapture.completedAt,
            apiReportedTotalCount: kCapture.apiReportedTotalCount,
            observations: kCapture.observations,
            rowCaptureFailures: kCapture.rowCaptureFailures,
            paginationIdentityErrors: kCapture.paginationIdentityErrors,
          },
          E: {
            language: "E",
            startedAt: eCapture.startedAt,
            completedAt: eCapture.completedAt,
            apiReportedTotalCount: eCapture.apiReportedTotalCount,
            observations: eCapture.observations,
            rowCaptureFailures: eCapture.rowCaptureFailures,
            paginationIdentityErrors: eCapture.paginationIdentityErrors,
          },
        },
      });
      assert.equal(built.ok, true);
      if (!built.ok) return;

      assert.equal(built.companion.targetCoreDigests.K, expectedKoDigest);
      assert.equal(built.companion.targetCoreDigests.E, expectedEnDigest);

      const validation = validateIcnGoodsServicesCompanion(built.companion);
      if (!validation.valid) {
        assert.fail(validation.errors.join("; "));
      }

      const assessment = assessIcnGoodsServicesCoverage({
        companion: built.companion,
        koFixture,
        enFixture,
        kRequestsUsed: kCapture.requestsUsed,
        eRequestsUsed: eCapture.requestsUsed,
      });

      const manifest = {
        task: "GW-ICN-015-ENRICH-DATA",
        branch: "codex/gw-icn-015-enrich-data",
        implementationBase: "dac99bb8b89807ceda9e562aabe630c773121a69",
        requestBudgetMax: MAX_REQUESTS,
        requestBudgetUsed: budget.used,
        targetCoreDigests: built.companion.targetCoreDigests,
        kCapture: {
          apiReportedTotalCount: kCapture.apiReportedTotalCount,
          recordCount: kCapture.recordCount,
          syncIntegrity: built.companion.captures.K?.syncIntegrity,
          requestsUsed: kCapture.requestsUsed,
          anomalies: kCapture.anomalies,
        },
        eCapture: {
          apiReportedTotalCount: eCapture.apiReportedTotalCount,
          recordCount: eCapture.recordCount,
          syncIntegrity: built.companion.captures.E?.syncIntegrity,
          requestsUsed: eCapture.requestsUsed,
          anomalies: eCapture.anomalies,
        },
        validation: { valid: true as const, errors: [] as string[] },
        assessment: {
          capture: assessment.capture,
          association: assessment.association,
          examples: assessment.examples,
        },
      };

      await writeFile(
        path.join(outputRoot, "capture-manifest.json"),
        `${JSON.stringify(manifest, null, 2)}\n`,
        "utf8",
      );
      await writeFile(
        path.join(outputRoot, "companion-candidate.json"),
        `${JSON.stringify(built.companion, null, 2)}\n`,
        "utf8",
      );
      await writeFile(
        path.join(outputRoot, "raw-pages-k.json"),
        `${JSON.stringify(kCapture.pages, null, 2)}\n`,
        "utf8",
      );
      await writeFile(
        path.join(outputRoot, "raw-pages-e.json"),
        `${JSON.stringify(eCapture.pages, null, 2)}\n`,
        "utf8",
      );

      console.log(
        JSON.stringify(
          {
            ok: true,
            outputRoot,
            requestBudgetUsed: budget.used,
            validationValid: validation.valid,
            koSyncIntegrity: built.companion.captures.K?.syncIntegrity,
            enSyncIntegrity: built.companion.captures.E?.syncIntegrity,
            koVisible: assessment.association.koLocale.sectionVisible,
            enVisible: assessment.association.enLocale.sectionVisible,
          },
          null,
          2,
        ),
      );
    },
    180_000,
  );
});
