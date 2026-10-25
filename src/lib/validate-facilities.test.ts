import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type {
  Facility,
  FacilityValidationErrorCode,
  ValidateFacilities,
} from "@/types/airport";
import { validateFacilities } from "./validate-facilities";

// Synthetic complete fixture; no airport facts or time measurements asserted.
const gwX001Defaults = {
  airportIata: "SFO" as const,
  terminalCode: "terminal_2" as const,
  boardingAreaCode: "D" as const,
  browseEligible: true,
  recommendEligible: true,
};

const valid: Facility = {
  ...gwX001Defaults,
  id: "sample",
  name: "Sample Cafe",
  zone: "D",
  category: "coffee",
  securityZone: "post",
  waitMinutes: null,
  activityMinutes: null,
  locationConfidence: "official_verified",
  timeConfidence: "unknown",
  sourceUrl: "https://www.flysfo.com/example",
  lastCheckedAt: "2026-10-24",
};
const validate: ValidateFacilities = validateFacilities;

function rejected(row: unknown, field: string, code: FacilityValidationErrorCode) {
  const result = validate([row]);
  assert.deepEqual(result.facilities, []);
  assert.ok(result.errors.some((error) =>
    error.path === `facilities[0].${field}` && error.code === code));
  assert.ok(result.errors.every((error) => error.message.trim().length > 0));
}

describe("validateFacilities", () => {
  it("accepts an empty array", () => {
    assert.deepEqual(validate([]), { facilities: [], errors: [] });
  });

  for (const raw of [undefined, null, false, 42, "[]", {}]) {
    it(`rejects non-array input ${JSON.stringify(raw)} with one shape error`, () => {
      const result = validate(raw);
      assert.deepEqual(result.facilities, []);
      assert.equal(result.errors.length, 1);
      assert.equal(result.errors[0].code, "invalid_shape");
      assert.ok(result.errors[0].path && result.errors[0].message);
    });
  }

  it("omits malformed rows while retaining valid rows and reporting original indices", () => {
    const result = validate([null, valid, [], "bad", 4]);
    assert.deepEqual(result.facilities, [valid]);
    assert.deepEqual(result.errors.map(({ path, code }) => ({ path, code })), [
      { path: "facilities[0]", code: "invalid_shape" },
      { path: "facilities[2]", code: "invalid_shape" },
      { path: "facilities[3]", code: "invalid_shape" },
      { path: "facilities[4]", code: "invalid_shape" },
    ]);
  });

  it("does not silently skip sparse-array rows", () => {
    const result = validate(new Array(1));
    assert.deepEqual(result.facilities, []);
    assert.equal(result.errors[0].code, "invalid_shape");
  });

  for (const field of ["id", "name", "zone", "category", "securityZone",
    "locationConfidence", "timeConfidence", "waitMinutes", "activityMinutes"]) {
    it(`rejects a missing required ${field}`, () => {
      const row: Record<string, unknown> = { ...valid };
      delete row[field];
      rejected(row, field, "missing_required_field");
    });
  }

  it("normalizes safe strings and numeric minutes without rewriting ID case or punctuation", () => {
    const result = validate([{
      ...valid, id: "  Mixed ID/1  ", name: "  Cafe Name  ", zone: " D ",
      waitMinutes: " 8 ", activityMinutes: "10", timeConfidence: "demo_estimate",
      sourceUrl: " https://www.flysfo.com/example ", lastCheckedAt: " 2026-10-24 ",
      locationDescription: "D Gates, Retail Street", nearestGateLandmark: null,
    }]);
    assert.deepEqual(result, { facilities: [{
      ...gwX001Defaults,
      id: "Mixed ID/1", name: "Cafe Name", zone: "D", category: "coffee",
      securityZone: "post", waitMinutes: 8, activityMinutes: 10,
      locationConfidence: "official_verified", timeConfidence: "demo_estimate",
      sourceUrl: "https://www.flysfo.com/example", lastCheckedAt: "2026-10-24",
      locationDescription: "D Gates, Retail Street", nearestGateLandmark: null,
    }], errors: [] });
  });

  for (const value of ["", "  ", null, 1, false, {}, []]) {
    it(`rejects invalid ID ${JSON.stringify(value)}`, () => {
      rejected({ ...valid, id: value }, "id", "invalid_id");
    });
    it(`rejects invalid name ${JSON.stringify(value)}`, () => {
      rejected({ ...valid, name: value }, "name", "missing_required_field");
    });
  }

  for (const value of ["X", "d", "", null, 1]) {
    it(`rejects unsupported zone ${JSON.stringify(value)}`, () => {
      rejected({ ...valid, zone: value }, "zone", "invalid_zone");
    });
  }

  it("accepts boarding area E as a location zone without implying recommend scope", () => {
    const row = {
      id: "t3-e-sample",
      name: "T3 E Sample",
      zone: "E",
      category: "food",
      securityZone: "unknown",
      waitMinutes: null,
      activityMinutes: null,
      locationConfidence: "unknown",
      timeConfidence: "unknown",
    };
    const result = validate([row]);
    assert.equal(result.errors.length, 0);
    assert.equal(result.facilities[0]?.terminalCode, "terminal_3");
    assert.equal(result.facilities[0]?.boardingAreaCode, "E");
    assert.equal(result.facilities[0]?.recommendEligible, false);
  });

  for (const category of ["food", "coffee", "restroom", "charging", "shop"] as const) {
    it(`accepts category ${category}`, () => {
      assert.deepEqual(validate([{ ...valid, category }]), {
        facilities: [{ ...valid, category }], errors: [],
      });
    });
  }
  for (const category of ["lounge", "FOOD", " food ", null, 1]) {
    it(`rejects invalid category ${JSON.stringify(category)}`, () => {
      rejected({ ...valid, category }, "category", "invalid_category");
    });
  }

  for (const securityZone of ["pre", "post", "both", "unknown"] as const) {
    it(`preserves security status ${securityZone} without upgrading it`, () => {
      const { recommendEligible: _eligibility, ...withoutEligibility } = valid;
      void _eligibility;
      const recommendEligible =
        securityZone === "post" || securityZone === "both";
      assert.deepEqual(validate([{ ...withoutEligibility, securityZone }]), {
        facilities: [{ ...valid, securityZone, recommendEligible }], errors: [],
      });
    });
  }
  for (const securityZone of ["airside", "POST", " post ", null, false]) {
    it(`rejects invalid security status ${JSON.stringify(securityZone)}`, () => {
      rejected({ ...valid, securityZone }, "securityZone", "invalid_security_zone");
    });
  }

  for (const field of ["locationConfidence", "timeConfidence"] as const) {
    for (const value of ["verified", "UNKNOWN", " unknown ", null, 1]) {
      it(`rejects invalid ${field} ${JSON.stringify(value)}`, () => {
        rejected({ ...valid, [field]: value }, field, "invalid_confidence");
      });
    }
  }
  for (const locationConfidence of ["official_verified", "third_party", "demo_estimate", "unknown"] as const) {
    it(`accepts location confidence ${locationConfidence}`, () => {
      assert.equal(validate([{ ...valid, locationConfidence }]).errors.length, 0);
    });
  }

  it("preserves explicit null durations and unknown confidence", () => {
    assert.deepEqual(validate([valid]), { facilities: [valid], errors: [] });
  });

  const invalidMinutes = [undefined, "", "  ", NaN, Infinity, -Infinity,
    -1, 8.5, "8.5", "12px", "abc", true, false, {}, []];
  for (const field of ["waitMinutes", "activityMinutes"] as const) {
    for (const [index, value] of invalidMinutes.entries()) {
      it(`rejects invalid ${field} input #${index}`, () => {
        rejected({ ...valid, [field]: value }, field, "invalid_minutes_field");
      });
    }
    it(`rejects numeric ${field} when time confidence is unknown`, () => {
      rejected({ ...valid, [field]: 0 }, field, "confidence_field_mismatch");
    });
    for (const timeConfidence of ["demo_estimate", "official_verified"] as const) {
      it(`rejects null ${field} when time confidence is ${timeConfidence}`, () => {
        rejected({ ...valid, waitMinutes: 8, activityMinutes: 10,
          timeConfidence, [field]: null }, field, "confidence_field_mismatch");
      });
    }
  }
  for (const timeConfidence of ["demo_estimate", "official_verified", "third_party"] as const) {
    it(`accepts zero and numeric-string durations with ${timeConfidence}`, () => {
      assert.deepEqual(validate([{ ...valid, waitMinutes: 0, activityMinutes: "10", timeConfidence }]), {
        facilities: [{ ...valid, waitMinutes: 0, activityMinutes: 10, timeConfidence }], errors: [],
      });
    });
  }
  it("permits partial unknown durations with third-party confidence", () => {
    assert.deepEqual(validate([{ ...valid, waitMinutes: 8, timeConfidence: "third_party" }]), {
      facilities: [{ ...valid, waitMinutes: 8, timeConfidence: "third_party" }], errors: [],
    });
  });

  for (const field of ["sourceUrl", "lastCheckedAt"] as const) {
    it(`requires ${field} for officially verified locations`, () => {
      const row: Record<string, unknown> = { ...valid };
      delete row[field];
      rejected(row, field, "missing_required_field");
    });
  }
  it("allows absent provenance for an unknown location", () => {
    const row = { id: "unknown", name: "Unknown location", zone: "D", category: "food",
      securityZone: "unknown", waitMinutes: null, activityMinutes: null,
      locationConfidence: "unknown", timeConfidence: "unknown" };
    assert.deepEqual(validate([row]), {
      facilities: [{
        ...row,
        ...gwX001Defaults,
        recommendEligible: false,
      }],
      errors: [],
    });
  });
  for (const sourceUrl of [null, 42, "", "not a url", "ftp://example.com", "javascript:alert(1)"]) {
    it(`rejects invalid provided source URL ${JSON.stringify(sourceUrl)} even for non-official locations`, () => {
      rejected({ ...valid, locationConfidence: "unknown", sourceUrl }, "sourceUrl", "invalid_url");
    });
  }
  it("accepts an HTTP provenance URL", () => {
    assert.equal(validate([{ ...valid, sourceUrl: "http://example.com/source" }]).errors.length, 0);
  });
  for (const lastCheckedAt of [null, 42, "", "2026-2-01", "2026-02-29", "2026-04-31",
    "2026-13-01", "2026-10-24T00:00:00Z"]) {
    it(`rejects invalid provided calendar date ${JSON.stringify(lastCheckedAt)}`, () => {
      rejected({ ...valid, lastCheckedAt }, "lastCheckedAt", "invalid_date");
    });
  }
  it("accepts a real leap day", () => {
    assert.equal(validate([{ ...valid, lastCheckedAt: "2024-02-29" }]).errors.length, 0);
  });

  it("keeps the first valid normalized duplicate ID, not the first invalid occurrence", () => {
    const result = validate([
      { ...valid, id: " same ", zone: "Z" },
      { ...valid, id: "same", name: "First valid" },
      { ...valid, id: " same ", name: "Later duplicate" },
      { ...valid, id: "Same", name: "Case-distinct" },
    ]);
    assert.deepEqual(result.facilities.map(({ id, name }) => ({ id, name })), [
      { id: "same", name: "First valid" }, { id: "Same", name: "Case-distinct" },
    ]);
    assert.ok(result.errors.some((error) => error.path === "facilities[0].zone"));
    assert.ok(result.errors.some((error) =>
      error.path === "facilities[2].id" && error.code === "duplicate_id"));
  });

  it("rejects invalid optional location metadata instead of returning a mistyped Facility", () => {
    rejected({ ...valid, locationDescription: 42 }, "locationDescription", "invalid_shape");
    rejected({ ...valid, nearestGateLandmark: "E1" }, "nearestGateLandmark", "invalid_shape");
  });
  for (const nearestGateLandmark of ["D1", "D4", "D7", "D9", "D15", "D16", null] as const) {
    it(`preserves supported gate landmark ${nearestGateLandmark}`, () => {
      const row = { ...valid, nearestGateLandmark, locationDescription: "Near gate" };
      assert.deepEqual(validate([row]), { facilities: [row], errors: [] });
    });
  }

  it("reports multiple invalid fields and excludes the entire row", () => {
    const result = validate([{ ...valid, zone: "Z", category: "lounge", waitMinutes: -1 }]);
    assert.deepEqual(result.facilities, []);
    assert.ok(result.errors.some((error) => error.code === "invalid_zone"));
    assert.ok(result.errors.some((error) => error.code === "invalid_category"));
    assert.ok(result.errors.some((error) => error.code === "invalid_minutes_field"));
  });

  const enrichedHours: Facility = {
    ...valid,
    id: "enriched-hours",
    hours: {
      kind: "weekly_same_all_days",
      rawText: "Sunday- Saturday 4:30 am-8:30 pm",
      openLocal: "04:30",
      closeLocal: "20:30",
      timezone: "America/Los_Angeles",
    },
    hoursConfidence: "official_verified",
    hoursLastCheckedAt: "2026-10-25",
    hoursSourceUrl: "https://www.flysfo.com/passengers/shop-dine-relax/peets-coffee-0",
    contact: { phoneE164OrDisplay: "650-821-9196", phoneSource: "official_listing" },
    amenityDetails: {
      tagline: "Specialty coffee and tea",
      officialBadges: ["sfo_green_business"],
      aboutExcerpt: "Pastries and salads",
    },
  };

  it("accepts optional GW-A-001 hours, contact, and amenity fields on a valid row", () => {
    assert.deepEqual(validate([enrichedHours]), { facilities: [enrichedHours], errors: [] });
  });

  it("accepts weekly hours with null open and close when raw text is preserved", () => {
    const row = {
      ...enrichedHours,
      id: "partial-parse",
      hours: {
        kind: "weekly_same_all_days",
        rawText: "Sunday - Saturday 6:00 am-10:00 pm",
        openLocal: null,
        closeLocal: null,
        timezone: "America/Los_Angeles",
      },
    };
    assert.deepEqual(validate([row]), { facilities: [row], errors: [] });
  });

  it("rejects weekly hours without provenance fields", () => {
    const row: Record<string, unknown> = { ...enrichedHours, id: "no-prov" };
    delete row.hoursLastCheckedAt;
    rejected(row, "hoursLastCheckedAt", "missing_required_field");
  });

  it("rejects unknown hours with official_verified confidence", () => {
    rejected({
      ...enrichedHours,
      id: "bad-hours-confidence",
      hours: { kind: "unknown" },
      hoursConfidence: "official_verified",
    }, "hoursConfidence", "confidence_field_mismatch");
  });

  it("rejects asymmetric open and close local times", () => {
    rejected({
      ...enrichedHours,
      id: "partial-times",
      hours: {
        kind: "weekly_same_all_days",
        rawText: "Sunday - Saturday 6:00 am-10:00 pm",
        openLocal: "06:00",
        closeLocal: null,
        timezone: "America/Los_Angeles",
      },
    }, "hours", "hours_parse_partial");
  });

  it("rejects invalid official badges and oversized about excerpts", () => {
    rejected({
      ...enrichedHours,
      id: "bad-badge",
      amenityDetails: { tagline: "x", officialBadges: ["priority_pass"], aboutExcerpt: null },
    }, "amenityDetails.officialBadges[0]", "invalid_amenity_details");
    rejected({
      ...enrichedHours,
      id: "long-about",
      amenityDetails: {
        tagline: null,
        officialBadges: [],
        aboutExcerpt: "x".repeat(2001),
      },
    }, "amenityDetails.aboutExcerpt", "invalid_amenity_details");
  });

  it("does not mutate inputs, returns fresh records, and is deterministic", () => {
    const row = Object.freeze({ ...valid, id: " sample ", extra: "not a Facility field" });
    const input = Object.freeze([row]);
    const result = validate(input);
    assert.deepEqual(result, { facilities: [valid], errors: [] });
    assert.notEqual(result.facilities[0], row);
    assert.equal(row.id, " sample ");
    assert.equal(row.extra, "not a Facility field");
    assert.deepEqual(validate(input), result);
  });
});
