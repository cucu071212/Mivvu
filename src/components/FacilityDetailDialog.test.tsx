// @vitest-environment jsdom
import assert from "node:assert/strict";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach } from "vitest";
import { describe, it, vi } from "vitest";
import { PRODUCTION_T2_D_FACILITY_LOCATION } from "@/data/fixtures/production-facility-defaults";
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
});
