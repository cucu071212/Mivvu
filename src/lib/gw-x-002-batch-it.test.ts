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

const BATCH_IT_IDS = [
  "sfo-it-a-boudin-bakery",
  "sfo-it-g-1300-on-fillmore",
] as const;

const recommendContext: UserContext = {
  gateZone: "D",
  minutesUntilBoarding: 60,
  bufferMinutes: 10,
  queueAdjustmentMinutes: 0,
  passengerSecurityArea: "post",
};

describe("GW-X-002 International Terminal pilot — browse-only A/G", () => {
  it("validates 23 facilities with zero errors", () => {
    const { facilities, errors } = validateFacilities(productionJson);
    assert.equal(errors.length, 0);
    assert.equal(facilities.length, 23);
  });

  it("keeps exactly 12 recommend-eligible facilities (legacy T2 D Gates)", () => {
    const { facilities } = validateFacilities(productionJson);
    const recommendEligible = facilities.filter((row) => row.recommendEligible);
    assert.equal(recommendEligible.length, 12);
    const ids = new Set(recommendEligible.map((row) => row.id));
    for (const id of LEGACY_RECOMMEND_IDS) {
      assert.ok(ids.has(id));
    }
  });

  it("adds two IT rows with correct terminal, zones, and browse-only eligibility", () => {
    const { facilities } = validateFacilities(productionJson);
    const itRows = facilities.filter((row) =>
      (BATCH_IT_IDS as readonly string[]).includes(row.id),
    );
    assert.equal(itRows.length, 2);
    const byId = new Map(itRows.map((row) => [row.id, row]));
    assert.equal(byId.get("sfo-it-a-boudin-bakery")?.zone, "A");
    assert.equal(byId.get("sfo-it-a-boudin-bakery")?.boardingAreaCode, "A");
    assert.equal(byId.get("sfo-it-g-1300-on-fillmore")?.zone, "G");
    assert.equal(byId.get("sfo-it-g-1300-on-fillmore")?.boardingAreaCode, "G");
    for (const row of itRows) {
      assert.equal(row.terminalCode, "international");
      assert.equal(row.airportIata, "SFO");
      assert.equal(row.browseEligible, true);
      assert.equal(row.recommendEligible, false);
      assert.equal(row.securityZone, "post");
      assert.equal(row.waitMinutes, null);
      assert.equal(row.activityMinutes, null);
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

  it("excludes both IT facilities from the production D Gates recommend model", () => {
    const { facilities } = validateFacilities(productionJson);
    const itRows = facilities.filter((row) =>
      (BATCH_IT_IDS as readonly string[]).includes(row.id),
    );
    const outcomes = recommendFacilities(
      recommendContext,
      itRows,
      productionTravelMinutes,
    );
    assert.equal(outcomes.length, 2);
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
