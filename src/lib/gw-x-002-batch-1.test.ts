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

const BATCH_1_RESERVE_IDS = [
  "sfo-t2-d-vino-volo",
  "sfo-t2-d-plant-cafe-pinkberry",
  "sfo-t2-d-peets-coffee-d15",
  "sfo-t2-d-books-inc",
  "sfo-t2-d-sfo-news-express",
  "sfo-t2-d-we-are-sfc",
] as const;

const recommendContext: UserContext = {
  gateZone: "D",
  minutesUntilBoarding: 60,
  bufferMinutes: 10,
  queueAdjustmentMinutes: 0,
  passengerSecurityArea: "post",
};

describe("GW-X-002 batch 1 — T2 D Gates browse-only reserves", () => {
  it("validates 18 facilities with zero errors", () => {
    const { facilities, errors } = validateFacilities(productionJson);
    assert.equal(errors.length, 0);
    assert.equal(facilities.length, 18);
  });

  it("keeps 12 legacy rows recommend-eligible and adds 6 browse-only reserves", () => {
    const { facilities } = validateFacilities(productionJson);
    const legacy = facilities.filter((row) =>
      (LEGACY_RECOMMEND_IDS as readonly string[]).includes(row.id),
    );
    const reserves = facilities.filter((row) =>
      (BATCH_1_RESERVE_IDS as readonly string[]).includes(row.id),
    );
    assert.equal(legacy.length, 12);
    assert.equal(reserves.length, 6);
    for (const row of legacy) {
      assert.equal(row.recommendEligible, true);
      assert.equal(row.browseEligible, true);
    }
    for (const row of reserves) {
      assert.equal(row.recommendEligible, false);
      assert.equal(row.browseEligible, true);
      assert.equal(row.zone, "D");
      assert.equal(row.terminalCode, "terminal_2");
    }
  });

  it("does not change recommendation outcomes for the original 12 facilities", () => {
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

  it("blocks time-based recommendations for all six reserves", () => {
    const { facilities } = validateFacilities(productionJson);
    const reserves = facilities.filter((row) =>
      (BATCH_1_RESERVE_IDS as readonly string[]).includes(row.id),
    );
    const outcomes = recommendFacilities(
      recommendContext,
      reserves,
      productionTravelMinutes,
    );
    assert.equal(outcomes.length, 6);
    for (const outcome of outcomes) {
      assert.equal(outcome.kind, "ineligible");
      if (outcome.kind === "ineligible") {
        assert.equal(outcome.ineligibilityReason, "outside_recommend_eligibility");
      }
    }
  });
});
