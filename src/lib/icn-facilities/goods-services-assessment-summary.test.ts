import { readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "./load-icn-facilities-fixture";
import { assessIcnGoodsServicesCoverage } from "./assess-icn-goods-services-coverage";
import type { IcnGoodsServicesCompanion } from "@/types/icn-goods-services-companion";

const SUMMARIZE = process.env.ICN_GOODS_SERVICES_SUMMARIZE === "1";
const candidatePath =
  process.env.ICN_GOODS_SERVICES_CANDIDATE_PATH
  ?? "/private/tmp/GW-ICN-015-evidence/gw-icn-015-enrich-data-run/companion-candidate.json";

describe.skipIf(!SUMMARIZE)("summarize goods/services candidate coverage", () => {
  it(
    "writes assessment-summary.json from existing candidate",
    () => {
    const companion = JSON.parse(readFileSync(candidatePath, "utf8")) as IcnGoodsServicesCompanion;
    const koFixture = loadIcnFacilitiesKoFixture();
    const enFixture = loadIcnFacilitiesEnFixture();
    const assessment = assessIcnGoodsServicesCoverage({
      companion,
      koFixture,
      enFixture,
      kRequestsUsed: 11,
      eRequestsUsed: 11,
    });
    const slim = {
      validationValid: assessment.validation.valid,
      capture: assessment.capture,
      association: assessment.association,
      examples: assessment.examples,
    };
    const outPath = candidatePath.replace(/companion-candidate\.json$/, "assessment-summary.json");
    writeFileSync(outPath, `${JSON.stringify(slim, null, 2)}\n`, "utf8");
    assert.equal(assessment.validation.valid, true);
    },
    120_000,
  );
});
