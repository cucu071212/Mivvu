import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  ICN_GOODS_SERVICES_FIELD_CODE_POINT_CAP,
  classifyIcnGoodsServicesCompanionSchema,
  validateIcnGoodsServicesCompanion,
} from "./icn-goods-services-companion-validate";
import { loadIcnFacilitiesEnFixture, loadIcnFacilitiesKoFixture } from "./load-icn-facilities-fixture";
import { computeIcnGoodsServicesTargetCoreDigest } from "./icn-goods-services-target-digest";
import { icnFacilityContentFingerprint } from "./icn-snapshot-matching";

describe("validateIcnGoodsServicesCompanion", () => {
  const ko = loadIcnFacilitiesKoFixture();
  const en = loadIcnFacilitiesEnFixture();
  const row = ko.facilities[0];

  const validBase = {
    schemaVersion: 1,
    source: { datasetId: "15095064", apiOperation: "B551177/FacilitiesInformation/getFacilitesInfo" },
    targetCoreDigests: {
      K: computeIcnGoodsServicesTargetCoreDigest(ko),
      E: computeIcnGoodsServicesTargetCoreDigest(en),
    },
    captures: {
      K: {
        startedAt: "2026-10-01T00:00:00+09:00",
        completedAt: "2026-10-01T01:00:00+09:00",
        coverage: "retrievable_catalog",
        apiReportedTotalCount: 1,
        recordCount: 1,
        syncIntegrity: "complete" as const,
        observations: [
          {
            coreFingerprint: icnFacilityContentFingerprint(row),
            fields: {
              facilityitem: { present: true, value: "ok" },
              goods: { present: false },
              GOODS: { present: false },
            },
          },
        ],
      },
      E: null,
    },
  };

  it("rejects entire candidate when a field exceeds the code point cap", () => {
    const over = "가".repeat(ICN_GOODS_SERVICES_FIELD_CODE_POINT_CAP + 1);
    const result = validateIcnGoodsServicesCompanion({
      ...validBase,
      captures: {
        ...validBase.captures,
        K: {
          ...validBase.captures.K!,
          observations: [
            {
              coreFingerprint: icnFacilityContentFingerprint(row),
              fields: {
                facilityitem: { present: true, value: over },
                goods: { present: false },
                GOODS: { present: false },
              },
            },
          ],
        },
      },
    });
    assert.equal(result.valid, false);
  });

  it("rejects invalid bare core fingerprints on observations", () => {
    const result = validateIcnGoodsServicesCompanion({
      ...validBase,
      captures: {
        ...validBase.captures,
        K: {
          ...validBase.captures.K!,
          observations: [{ coreFingerprint: "not-json", fields: validBase.captures.K!.observations[0].fields }],
        },
      },
    });
    assert.equal(result.valid, false);
  });

  it("accepts a minimal bound companion", () => {
    const result = validateIcnGoodsServicesCompanion(validBase);
    assert.equal(result.valid, true);
  });

  it("rejects reviewer invalid candidates (whole-artifact boundary)", () => {
    const reject = (mutate: (base: typeof validBase) => void) => {
      const candidate = structuredClone(validBase);
      mutate(candidate);
      assert.equal(validateIcnGoodsServicesCompanion(candidate).valid, false);
    };

    reject((c) => {
      (c as Record<string, unknown>).extra = "unreviewed";
    });
    reject((c) => {
      (c.captures.K!.observations[0].fields as Record<string, unknown>).Goods = {
        present: true,
        value: "unreviewed",
      };
    });
    reject((c) => {
      (c.captures.K!.observations[0].fields.goods as Record<string, unknown>).extra = "unreviewed";
    });
    reject((c) => {
      (c.captures.K as Record<string, unknown>).recordCount = "1";
    });
    reject((c) => {
      c.captures.K!.recordCount = 50;
    });
    reject((c) => {
      c.captures.K!.completedAt = "not-a-date";
    });
    reject((c) => {
      c.captures.K!.completedAt = "2026-09-01T00:00:00.000Z";
    });
    reject((c) => {
      c.captures.K!.apiReportedTotalCount = 99;
    });
    reject((c) => {
      (c.captures.K as Record<string, unknown>).syncIntegrity = "unrecognized";
    });
    reject((c) => {
      c.captures.K!.observations[0] = {
        coreFingerprint: icnFacilityContentFingerprint(en.facilities[0]),
        fields: validBase.captures.K!.observations[0].fields,
      };
    });
    reject((c) => {
      c.captures.K!.completedAt = "INVALID-PROVENANCE";
    });
  });

  it("classifies schema version 2 as unsupported at association layer", () => {
    const candidate = {
      ...validBase,
      schemaVersion: 2,
    };
    assert.equal(classifyIcnGoodsServicesCompanionSchema(candidate), "unsupported_version");
    assert.equal(validateIcnGoodsServicesCompanion(candidate).valid, false);
  });

  it("rejects impossible calendar dates and non-ISO capture timestamps", () => {
    const reject = (mutate: (base: typeof validBase) => void) => {
      const candidate = structuredClone(validBase);
      mutate(candidate);
      assert.equal(validateIcnGoodsServicesCompanion(candidate).valid, false);
    };

    reject((c) => {
      c.captures.K!.startedAt = "2026-02-30T00:00:00Z";
      c.captures.K!.completedAt = "2026-03-03T00:00:00Z";
    });
    reject((c) => {
      c.captures.K!.startedAt = "2026-04-31T00:00:00+09:00";
      c.captures.K!.completedAt = "2026-05-03T00:00:00+09:00";
    });
    reject((c) => {
      c.captures.K!.startedAt = "Thu, 01 Oct 2026 00:00:00 Z";
    });
    reject((c) => {
      c.captures.K!.startedAt = "2026-02-28T00:00:00Z";
      c.captures.K!.completedAt = "2026-02-30T00:00:00Z";
    });
  });

  it("accepts valid leap-day instants and equal times with different offsets", () => {
    const candidate = structuredClone(validBase);
    candidate.captures.K!.startedAt = "2024-02-29T23:00:00+09:00";
    candidate.captures.K!.completedAt = "2024-02-29T14:00:00Z";
    const result = validateIcnGoodsServicesCompanion(candidate);
    assert.equal(result.valid, true);
  });
});
