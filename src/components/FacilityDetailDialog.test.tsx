// @vitest-environment jsdom
import assert from "node:assert/strict";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach } from "vitest";
import { describe, it, vi } from "vitest";
import { PRODUCTION_T2_D_FACILITY_LOCATION } from "@/data/fixtures/production-facility-defaults";
import { TEST_VERIFIED_AREA_EVIDENCE } from "@/data/fixtures/location-evidence-test-fixture";
import type { Facility } from "@/types/airport";
import { FacilityDetailDialog } from "./FacilityDetailDialog";

const recommendEligible: Facility = {
  ...PRODUCTION_T2_D_FACILITY_LOCATION,
  id: "sfo-t2-d-brookstone",
  name: "Brookstone",
  zone: "D",
  category: "shop",
  terminalCode: "terminal_2",
  boardingAreaCode: "D",
  browseEligible: true,
  recommendEligible: true,
  securityZone: "post",
  waitMinutes: null,
  activityMinutes: null,
  locationConfidence: "official_verified",
  timeConfidence: "unknown",
  sourceUrl: "https://www.flysfo.com/passengers/shop-dine-relax/brookstone",
  lastCheckedAt: "2026-10-25",
  locationDescription: "D Gates, near Gate D9",
};

const browseOnly: Facility = {
  ...recommendEligible,
  id: "sfo-hm1-b-bun-mee",
  name: "Bun Mee",
  zone: "B",
  terminalCode: "harvey_milk_1",
  boardingAreaCode: "B",
  recommendEligible: false,
  browseEligible: true,
  hours: { kind: "unknown", rawText: "Sunday - Saturday Open 24 hours" },
  hoursConfidence: "unknown",
};

describe("FacilityDetailDialog (GW-C-001)", () => {
  afterEach(() => cleanup());

  it("exposes a modal with full information and official listing link", () => {
    const onClose = vi.fn();
    render(
      <FacilityDetailDialog
        facility={browseOnly}
        open
        onClose={onClose}
      />,
    );
    const dialog = screen.getByRole("dialog", { name: /Bun Mee/i });
    assert.ok(dialog);
    assert.ok(
      within(dialog).getByText(/Browse only — not in recommend scope/i),
    );
    assert.ok(within(dialog).getByRole("link", { name: /Official SFO listing/i }));
    assert.ok(within(dialog).getByText(/not live open\/closed/i));
    assert.ok(within(dialog).getByText(/Harvey Milk Terminal 1 · B Gates/i));
  });

  it("closes when the user activates the close control", () => {
    const onClose = vi.fn();
    render(
      <FacilityDetailDialog facility={recommendEligible} open onClose={onClose} />,
    );
    const dialog = screen.getByRole("dialog", { name: /Brookstone/i });
    fireEvent.click(
      within(dialog).getByRole("button", { name: /Close facility details/i }),
    );
    assert.equal(onClose.mock.calls.length, 1);
  });

  it("notes recommend scope for eligible D Gates facilities", () => {
    render(
      <FacilityDetailDialog
        facility={recommendEligible}
        open
        onClose={() => {}}
      />,
    );
    const dialog = screen.getByRole("dialog", { name: /Brookstone/i });
    assert.ok(
      within(dialog).getByText(/Time-based recommendations \(T2 D Gates\)/i),
    );
    assert.ok(
      within(dialog).getByText(/Queue and activity times are unknown/i),
    );
  });

  it("shows Codex verified area evidence for Brookstone", () => {
    render(
      <FacilityDetailDialog
        facility={recommendEligible}
        open
        onClose={() => {}}
      />,
    );
    const dialog = screen.getByRole("dialog", { name: /Brookstone/i });
    const guidance = within(dialog).getByRole("region", {
      name: /Location guidance/i,
    });
    assert.ok(within(guidance).getByText("Verified area"));
    assert.ok(within(guidance).getByText("Terminal 2 · D Gates · Near Gate D1"));
    assert.ok(within(guidance).getByText(/Map directory cell E2/i));
    assert.ok(
      within(guidance).getByRole("link", {
        name: /Evidence source \(opens in a new tab\)/i,
      }),
    );
  });

  it("does not mark a current T2 D area for Vino Volo when GW-B evidence is Unknown", () => {
    const vinoVolo: Facility = {
      ...recommendEligible,
      id: "sfo-t2-d-vino-volo",
      name: "Vino Volo",
      recommendEligible: false,
      locationDescription: "D Gates, Retail Street",
      nearestGateLandmark: null,
    };
    render(
      <FacilityDetailDialog facility={vinoVolo} open onClose={() => {}} />,
    );
    const dialog = screen.getByRole("dialog", { name: /Vino Volo/i });
    const guidance = within(dialog).getByRole("region", {
      name: /Location guidance/i,
    });
    assert.ok(within(guidance).getByText("Unknown"));
    assert.ok(within(guidance).getByText(/does not infer a location/i));
    assert.equal(
      within(guidance).queryByRole("region", {
        name: /T2 D Gates area guide \(conceptual\)/i,
      }),
      null,
    );
    assert.equal(within(guidance).queryByText(/named on this listing/i), null);
    assert.ok(within(dialog).getByText("D Gates, Retail Street"));
  });

  it("keeps the dialog out of sequential tab order so focus stays on visible controls", () => {
    render(
      <FacilityDetailDialog
        facility={recommendEligible}
        open
        onClose={() => {}}
      />,
    );
    const dialog = screen.getByRole("dialog", { name: /Brookstone/i });
    assert.equal(dialog.getAttribute("tabindex"), "-1");
  });

  it("shows Unknown location evidence for facilities outside the Codex package", () => {
    render(
      <FacilityDetailDialog facility={browseOnly} open onClose={() => {}} />,
    );
    const dialog = screen.getByRole("dialog", { name: /Bun Mee/i });
    const guidance = within(dialog).getByRole("region", {
      name: /Location guidance/i,
    });
    assert.ok(within(guidance).getByText("Unknown"));
    assert.ok(within(guidance).getByText(/does not infer a location/i));
    assert.ok(
      within(guidance).getByText(
        /conceptual area guide covers SFO Terminal 2 D Gates only/i,
      ),
    );
  });

  it("renders injected verified evidence inside facility details", () => {
    render(
      <FacilityDetailDialog
        facility={recommendEligible}
        open
        onClose={() => {}}
        getLocationEvidence={() => TEST_VERIFIED_AREA_EVIDENCE}
      />,
    );
    const dialog = screen.getByRole("dialog", { name: /Brookstone/i });
    const guidance = within(dialog).getByRole("region", {
      name: /Location guidance/i,
    });
    assert.ok(within(guidance).getByText("Verified area"));
    assert.ok(within(guidance).getByText("Terminal 2 · D Gates · Near Gate D7"));
    assert.ok(
      within(guidance).getByRole("link", {
        name: /Evidence source \(opens in a new tab\)/i,
      }),
    );
  });
});
