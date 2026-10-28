import process from "node:process";
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { icnFixtureOutputPath } from "./icn-fixture-paths";
import { syncIcnFacilities, writeIcnFacilitiesFixtureFile } from "./sync-icn-facilities";

const shouldRun = process.env.ICN_SYNC === "1";

describe.skipIf(!shouldRun)("ICN facilities sync CLI", () => {
  it(
    "writes language-specific development fixture when ICN_SYNC=1",
    async () => {
      const lang = process.env.ICN_SYNC_LANG === "E" ? "E" : "K";
      const allowTotalMismatch = process.env.ICN_SYNC_ALLOW_MISMATCH === "1";

      const result = await syncIcnFacilities({
        lang,
        requireFullTotalCount: !allowTotalMismatch,
      });

      if (result.integrity !== "complete" && !allowTotalMismatch) {
        throw new Error(
          "Sync integrity is not complete; set ICN_SYNC_ALLOW_MISMATCH=1 to write a labeled dev fixture",
        );
      }

      const outputPath = icnFixtureOutputPath(lang);
      await writeIcnFacilitiesFixtureFile({ outputPath, fixture: result.fixture });

      console.log(
        JSON.stringify(
          {
            ok: true,
            outputPath,
            language: lang,
            pageCount: result.pageCount,
            recordCount: result.fixture.meta.recordCount,
            apiReportedTotalCount: result.fixture.meta.apiReportedTotalCount,
            retrievedAt: result.fixture.meta.retrievedAt,
            syncIntegrity: result.integrity,
            anomalies: result.anomalies,
          },
          null,
          2,
        ),
      );

      assert.ok(result.fixture.meta.recordCount > 0);
    },
    120_000,
  );
});
