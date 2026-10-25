import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";
import { productionTravelMinutes } from "@/data/travel-times";
import { recommendFacilities } from "@/lib/recommend";
import { validateFacilities } from "@/lib/validate-facilities";
import type { UserContext } from "@/types/airport";

const productionJson = JSON.parse(
  readFileSync(new URL("../data/facilities.json", import.meta.url), "utf8"),
) as unknown;

const LEGACY_RECOMMEND_IDS = [
  "sfo-t2-d-16th-dolores-general-store",
  "sfo-t2-d-andale-mexican-kitchen-bar",
  "sfo-t2-d-brookstone",
  "sfo-t2-d-burger-joint",
  "sfo-t2-d-cat-cora",
  "sfo-t2-d-kiehls",
  "sfo-t2-d-lark-creek-grill",
  "sfo-t2-d-napa-farms-market",
  "sfo-t2-d-peets-coffee-d7",
  "sfo-t2-d-sunglass-hut",
  "sfo-t2-d-the-chocolate-market",
  "sfo-t2-d-wakaba",
] as const;

const BATCH_2_HM1_IDS = [
  "sfo-hm1-b-bun-mee",
  "sfo-hm1-b-bourbon-pub",
  "sfo-hm1-c-49-mile-market",
] as const;

const recommendContext: UserContext = {
  gateZone: "D",
  minutesUntilBoarding: 60,
  bufferMinutes: 10,
  queueAdjustmentMinutes: 0,
  passengerSecurityArea: "post",
};

describe("GW-X-002 batch 2 — Harvey Milk T1 B/C browse-only", () => {
  it("validates 21 facilities with zero errors", () => {
    const { facilities, errors } = validateFacilities(productionJson);
    assert.equal(errors.length, 0);
    assert.equal(facilities.length, 21);
  });

  it("adds three HM1 rows with correct terminal, zones, and browse-only eligibility", () => {
    const { facilities } = validateFacilities(productionJson);
    const hm1 = facilities.filter((row) =>
      (BATCH_2_HM1_IDS as readonly string[]).includes(row.id),
    );
    assert.equal(hm1.length, 3);
    const byId = new Map(hm1.map((row) => [row.id, row]));
    assert.equal(byId.get("sfo-hm1-b-bun-mee")?.zone, "B");
    assert.equal(byId.get("sfo-hm1-b-bourbon-pub")?.zone, "B");
    assert.equal(byId.get("sfo-hm1-c-49-mile-market")?.zone, "C");
    for (const row of hm1) {
      assert.equal(row.terminalCode, "harvey_milk_1");
      assert.equal(row.airportIata, "SFO");
      assert.equal(row.browseEligible, true);
      assert.equal(row.recommendEligible, false);
      assert.equal(row.securityZone, "post");
    }
  });

  it("does not change recommendation outcomes for the original 12 D Gates facilities", () => {
    const { facilities } = validateFacilities(productionJson);
    const legacy = facilities.filter((row) =>
      (LEGACY_RECOMMEND_IDS as readonly string[]).includes(row.id),
    );
    const outcomes = recommendFacilities(
      recommendContext,
      legacy,
      productionTravelMinutes,
    ).map((row) => ({ id: row.facilityId, kind: row.kind }));
    assert.deepEqual(outcomes, [
      { id: "sfo-t2-d-16th-dolores-general-store", kind: "unknown" },
      { id: "sfo-t2-d-andale-mexican-kitchen-bar", kind: "unknown" },
      { id: "sfo-t2-d-brookstone", kind: "unknown" },
      { id: "sfo-t2-d-burger-joint", kind: "unknown" },
      { id: "sfo-t2-d-cat-cora", kind: "unknown" },
      { id: "sfo-t2-d-kiehls", kind: "unknown" },
      { id: "sfo-t2-d-lark-creek-grill", kind: "unknown" },
      { id: "sfo-t2-d-napa-farms-market", kind: "unknown" },
      { id: "sfo-t2-d-peets-coffee-d7", kind: "unknown" },
      { id: "sfo-t2-d-sunglass-hut", kind: "unknown" },
      { id: "sfo-t2-d-the-chocolate-market", kind: "unknown" },
      { id: "sfo-t2-d-wakaba", kind: "unknown" },
    ]);
  });

  it("excludes all three HM1 facilities from the production D Gates recommend model", () => {
    const { facilities } = validateFacilities(productionJson);
    const hm1 = facilities.filter((row) =>
      (BATCH_2_HM1_IDS as readonly string[]).includes(row.id),
    );
    const outcomes = recommendFacilities(
      recommendContext,
      hm1,
      productionTravelMinutes,
    );
    assert.equal(outcomes.length, 3);
    for (const outcome of outcomes) {
      assert.equal(outcome.kind, "ineligible");
      if (outcome.kind === "ineligible") {
        assert.ok(
          outcome.ineligibilityReason === "outside_supported_zone" ||
            outcome.ineligibilityReason === "outside_recommend_eligibility",
        );
      }
    }
  });
});
