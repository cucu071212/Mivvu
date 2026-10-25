// @vitest-environment jsdom
import assert from "node:assert/strict";
import { render, screen } from "@testing-library/react";
import { describe, it } from "vitest";
import type { Facility } from "@/types/airport";
import { FacilityInformation } from "./FacilityInformation";

const base: Facility = {
  id: "sample",
  name: "Sample",
  zone: "D",
  category: "coffee",
  securityZone: "post",
  waitMinutes: null,
  activityMinutes: null,
  locationConfidence: "official_verified",
  timeConfidence: "unknown",
  sourceUrl: "https://www.flysfo.com/example",
  lastCheckedAt: "2026-10-25",
  locationDescription: "Near Gate D7",
  nearestGateLandmark: "D7",
};

describe("FacilityInformation", () => {
  it("shows published hours disclaimer and unknown phone when omitted", () => {
    render(
      <FacilityInformation
        facility={{
          ...base,
          hours: {
            kind: "weekly_same_all_days",
            rawText: "Sunday- Saturday 4:30 am-8:30 pm",
            openLocal: "04:30",
            closeLocal: "20:30",
            timezone: "America/Los_Angeles",
          },
          hoursConfidence: "official_verified",
          hoursLastCheckedAt: "2026-10-25",
          hoursSourceUrl: "https://www.flysfo.com/example",
        }}
        idPrefix="test"
      />,
    );
    assert.match(
      screen.getByText(/not live open\/closed/i).textContent ?? "",
      /not live/i,
    );
    assert.match(
      screen.getByText(/Phone not published/i).textContent ?? "",
      /not published/i,
    );
  });

  it("renders official badges and contact when present", () => {
    render(
      <FacilityInformation
        facility={{
          ...base,
          contact: {
            phoneE164OrDisplay: "650-821-9196",
            phoneSource: "official_listing",
          },
          amenityDetails: {
            tagline: "Specialty coffee and tea",
            officialBadges: ["sfo_green_business"],
            aboutExcerpt: null,
          },
        }}
        idPrefix="test-rich"
      />,
    );
    assert.ok(screen.getByText("SFO Green Business"));
    assert.ok(screen.getByRole("link", { name: "650-821-9196" }));
  });
});
