import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";
import { validateFacilities } from "@/lib/validate-facilities";
import { recommendFacilities } from "@/lib/recommend";
import { productionTravelMinutes } from "@/data/travel-times";
import type { Facility } from "@/types/airport";

const productionJson = JSON.parse(
  readFileSync(new URL("../data/facilities.json", import.meta.url), "utf8"),
) as unknown;

describe("GW-X-001 backward compatibility", () => {
  it("validates all 12 production facilities with normalized location defaults", () => {
    const { facilities, errors } = validateFacilities(productionJson);
    assert.equal(errors.length, 0);
    assert.equal(facilities.length, 12);
    for (const facility of facilities) {
      assert.equal(facility.airportIata, "SFO");
      assert.equal(facility.terminalCode, "terminal_2");
      assert.equal(facility.boardingAreaCode, "D");
      assert.equal(facility.zone, "D");
      assert.equal(facility.browseEligible, true);
      assert.equal(facility.recommendEligible, true);
    }
  });

  it("rejects browse-only T1 row with recommendEligible true", () => {
    const row = {
      id: "sfo-hm1-b-bun-mee",
      name: "Bun Mee",
      zone: "B",
      terminalCode: "harvey_milk_1",
      boardingAreaCode: "B",
      category: "food",
      securityZone: "unknown",
      waitMinutes: null,
      activityMinutes: null,
      locationConfidence: "official_verified",
      timeConfidence: "unknown",
      sourceUrl: "https://www.flysfo.com/passengers/shop-dine-relax/bun-mee",
      lastCheckedAt: "2026-10-25",
      browseEligible: true,
      recommendEligible: true,
    };
    const result = validateFacilities([row]);
    assert.deepEqual(result.facilities, []);
    assert.ok(
      result.errors.some((error) => error.code === "recommend_eligibility_mismatch"),
    );
  });

  it("accepts browse-only T1 row with recommendEligible false", () => {
    const row = {
      id: "sfo-hm1-b-bun-mee",
      name: "Bun Mee",
      zone: "B",
      category: "food",
      securityZone: "unknown",
      waitMinutes: null,
      activityMinutes: null,
      locationConfidence: "official_verified",
      timeConfidence: "unknown",
      sourceUrl: "https://www.flysfo.com/passengers/shop-dine-relax/bun-mee",
      lastCheckedAt: "2026-10-25",
      browseEligible: true,
      recommendEligible: false,
    };
    const result = validateFacilities([row]);
    assert.equal(result.errors.length, 0);
    assert.equal(result.facilities[0]?.terminalCode, "harvey_milk_1");
    assert.equal(result.facilities[0]?.recommendEligible, false);
  });

  it("marks explicit recommendEligible false as ineligible before security checks", () => {
    const facility: Facility = {
      id: "sfo-t2-d-vino-volo",
      name: "Vino Volo",
      zone: "D",
      airportIata: "SFO",
      terminalCode: "terminal_2",
      boardingAreaCode: "D",
      browseEligible: true,
      recommendEligible: false,
      category: "food",
      securityZone: "post",
      waitMinutes: null,
      activityMinutes: null,
      locationConfidence: "official_verified",
      timeConfidence: "unknown",
    };
    const [result] = recommendFacilities(
      {
        gateZone: "D",
        minutesUntilBoarding: 60,
        bufferMinutes: 10,
        queueAdjustmentMinutes: 0,
        passengerSecurityArea: "post",
      },
      [facility],
      productionTravelMinutes,
    );
    assert.equal(result.kind, "ineligible");
    if (result.kind === "ineligible") {
      assert.equal(result.ineligibilityReason, "outside_recommend_eligibility");
    }
  });
});
