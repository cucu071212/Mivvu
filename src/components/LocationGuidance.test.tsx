// @vitest-environment jsdom
import assert from "node:assert/strict";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, it } from "vitest";
import { PRODUCTION_T2_D_FACILITY_LOCATION } from "@/data/fixtures/production-facility-defaults";
import {
  TEST_APPROXIMATE_AREA_EVIDENCE,
  TEST_UNKNOWN_LOCATION_EVIDENCE,
  TEST_VERIFIED_AREA_EVIDENCE,
  TEST_VERIFIED_AREA_WITH_MAP_CELL,
} from "@/data/fixtures/location-evidence-test-fixture";
import type { Facility } from "@/types/airport";
import { LocationGuidance } from "./LocationGuidance";

const t2Facility: Facility = {
  ...PRODUCTION_T2_D_FACILITY_LOCATION,
  id: "sfo-t2-d-peets-coffee-d7",
  name: "Peet's Coffee",
  zone: "D",
  category: "coffee",
  securityZone: "post",
  waitMinutes: null,
  activityMinutes: null,
  locationConfidence: "official_verified",
  timeConfidence: "unknown",
  locationDescription: "Near Gate D7",
  nearestGateLandmark: "D7",
};

const browseOnly: Facility = {
  ...t2Facility,
  id: "sfo-hm1-b-bun-mee",
  name: "Bun Mee",
  zone: "B",
  terminalCode: "harvey_milk_1",
  boardingAreaCode: "B",
  recommendEligible: false,
  locationDescription: "near Gate B3, Harvey Milk Terminal 1",
  nearestGateLandmark: null,
};

describe("LocationGuidance", () => {
  afterEach(() => cleanup());

  it("shows verified Terminal 2 / D Gates labels, source, and no walking minutes", () => {
    render(
      <LocationGuidance facility={t2Facility} evidence={TEST_VERIFIED_AREA_EVIDENCE} />,
    );
    const section = screen.getByRole("region", { name: /Location guidance/i });
    assert.ok(within(section).getByText("Verified area"));
    assert.ok(within(section).getByText("Terminal 2 · D Gates · Near Gate D7"));
    assert.ok(
      within(section).getByRole("link", {
        name: /Evidence source \(opens in a new tab\)/i,
      }),
    );
    assert.equal(within(section).queryByText(/\d+\s*min walk/i), null);
    assert.ok(within(section).getByText("Listing names Gate D7"));
  });

  it("explains approximate Retail Street without treating it as a gate", () => {
    render(
      <LocationGuidance
        facility={{ ...t2Facility, nearestGateLandmark: null }}
        evidence={TEST_APPROXIMATE_AREA_EVIDENCE}
      />,
    );
    const section = screen.getByRole("region", { name: /Location guidance/i });
    assert.ok(within(section).getByText("Approximate area"));
    assert.ok(within(section).getByText("Terminal 2 · D Gates · Retail Street"));
    assert.ok(within(section).getByText(/coarse area/i));
  });

  it("keeps Unknown free of invented area labels", () => {
    render(
      <LocationGuidance facility={t2Facility} evidence={TEST_UNKNOWN_LOCATION_EVIDENCE} />,
    );
    const section = screen.getByRole("region", { name: /Location guidance/i });
    assert.ok(within(section).getByText("Unknown"));
    assert.ok(within(section).getByText(/does not infer a location/i));
    assert.equal(within(section).queryByText("Near Gate D7"), null);
    assert.equal(
      within(section).queryByRole("link", { name: /Evidence source/i }),
      null,
    );
  });

  it("does not treat Vino Volo listing Retail Street as a current GW-B area when evidence is Unknown", () => {
    const vinoVolo: Facility = {
      ...t2Facility,
      id: "sfo-t2-d-vino-volo",
      name: "Vino Volo",
      recommendEligible: false,
      locationDescription: "D Gates, Retail Street",
      nearestGateLandmark: null,
    };
    render(
      <LocationGuidance facility={vinoVolo} evidence={TEST_UNKNOWN_LOCATION_EVIDENCE} />,
    );
    const section = screen.getByRole("region", { name: /Location guidance/i });
    assert.ok(within(section).getByText("Unknown"));
    assert.ok(within(section).getByText(/does not infer a location/i));
    assert.equal(
      within(section).queryByRole("region", {
        name: /T2 D Gates area guide \(conceptual\)/i,
      }),
      null,
    );
    assert.equal(within(section).queryByText(/named on this listing/i), null);
    assert.equal(within(section).queryByText("Retail Street", { exact: true }), null);
  });

  it("discloses official map cells as directory indexes and links the map PDF", () => {
    render(
      <LocationGuidance
        facility={t2Facility}
        evidence={TEST_VERIFIED_AREA_WITH_MAP_CELL}
      />,
    );
    const section = screen.getByRole("region", { name: /Location guidance/i });
    assert.ok(within(section).getByText(/Map directory cell E2/i));
    assert.ok(
      within(section).getByRole("link", {
        name: /Official T2 map \(PDF\), opens in a new tab/i,
      }),
    );
  });

  it("shows the conceptual T2 D area guide only when GW-B evidence supports it", () => {
    render(
      <LocationGuidance facility={t2Facility} evidence={TEST_VERIFIED_AREA_EVIDENCE} />,
    );
    const guide = screen.getByRole("region", {
      name: /T2 D Gates area guide \(conceptual\)/i,
    });
    assert.ok(within(guide).getByText("Retail Street"));
    assert.ok(within(guide).getByText(/not a floor plan/i));
    assert.ok(within(guide).getByText("Gate D7, named on this listing"));
    assert.equal(within(guide).queryByText(/\d+\s*min walk/i), null);
  });

  it("does not apply the T2 D conceptual guide to other terminals", () => {
    render(
      <LocationGuidance facility={browseOnly} evidence={TEST_UNKNOWN_LOCATION_EVIDENCE} />,
    );
    assert.equal(
      screen.queryByRole("region", {
        name: /T2 D Gates area guide \(conceptual\)/i,
      }),
      null,
    );
    assert.ok(
      screen.getByText(/conceptual area guide covers SFO Terminal 2 D Gates only/i),
    );
  });
});
