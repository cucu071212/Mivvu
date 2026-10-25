import { describe, expect, it } from "vitest";
import production from "@/data/facilities.json";
import { auditFacilityData, type RecommendationEligibilityBaseline } from "./audit-facility-data";
import { RECOMMENDATION_BASELINE_V1 as baseline } from "./fixtures/recommendation-baseline-v1";

function rows(): Record<string, unknown>[] { return structuredClone(production); }
function audit(input: unknown = rows()) { return auditFacilityData(input, baseline); }
function changed(field: string, value: unknown, index = 0) {
  const input = rows();
  input[index][field] = value;
  return audit(input);
}
function issue(result: ReturnType<typeof audit>, code: string, path?: string) {
  expect(result.issues).toEqual(expect.arrayContaining([expect.objectContaining({ code, ...(path ? { path } : {}) })]));
}

describe("independent facility release audit", () => {
  it("audits all 26 rows with the frozen exact 12-ID baseline", () => {
    const result = audit();
    expect(result.ok).toBe(true);
    expect(result.policyVersion).toBe("gw-c-facility-audit-v1");
    expect(result.baselineVersion).toBe("sfo-t2-d-approved-12-v1");
    expect(result.counts).toEqual({ input: 26, valid: 26, browseEligible: 26, recommendEligible: 12 });
    expect(result.recommendationIds).toEqual(baseline.approvedFacilityIds);
    expect(result.issues.filter((item) => item.severity === "error")).toEqual([]);
    expect(result.issues.filter((item) => item.code === "legacy_location_defaults")).toHaveLength(12);
    expect(result.issues.filter((item) => item.code === "unknown_durations")).toHaveLength(26);
    expect(result.issues.filter((item) => item.code === "unparsed_hours")).toHaveLength(2);
  });

  it.each([null, {}, "facilities", 42])("rejects malformed root %j", (input) => {
    const result = audit(input);
    expect(result.ok).toBe(false);
    issue(result, "invalid_shape", "facilities");
  });

  it("reports malformed rows without dropping the evidence from the report", () => {
    const result = audit([null, 42, [], {}, ...rows()]);
    expect(result.counts).toEqual({ input: 30, valid: 26, browseEligible: 26, recommendEligible: 12 });
    expect(result.ok).toBe(false);
    issue(result, "invalid_shape", "facilities[0]");
    issue(result, "missing_required_field", "facilities[3].id");
  });

  it.each([" SFO-T2-D-NEW ", "sfo--t2-new", "sfo_t2_new", "sfo-t2-déjà", "ｓｆｏ-t2-new", "", 123])(
    "requires a canonical lowercase ASCII kebab ID: %j", (id) => {
      const result = changed("id", id);
      expect(result.ok).toBe(false);
      issue(result, "noncanonical_id", "facilities[0].id");
    },
  );

  it("detects normalized duplicate IDs even when the first row is otherwise invalid", () => {
    const input = rows();
    const first = { ...input[0], category: "invalid" };
    const duplicate = { ...input[0], id: ` ${String(input[0].id).toUpperCase()} ` };
    const result = audit([first, duplicate, ...input.slice(1)]);
    issue(result, "normalized_duplicate_id", "facilities[1].id");
    expect(result.ok).toBe(false);
  });

  it.each([
    ["terminalCode", "terminal_3", "terminal_boarding_mismatch"],
    ["boardingAreaCode", "A", "terminal_boarding_mismatch"],
    ["airportIata", "JFK", "invalid_shape"],
    ["securityZone", "airside", "invalid_security_zone"],
    ["securityZone", null, "invalid_security_zone"],
    ["browseEligible", "true", "invalid_eligibility_flag"],
    ["recommendEligible", 1, "invalid_eligibility_flag"],
  ])("reports malformed %s", (field, value, code) => {
    const result = changed(field, value);
    expect(result.ok).toBe(false);
    issue(result, code);
  });

  it("keeps explicit unknown security for browse-only rows", () => {
    const result = changed("securityZone", "unknown", 12);
    expect(result.ok).toBe(true);
    issue(result, "unknown_security", "facilities[12].securityZone");
    expect(result.counts.recommendEligible).toBe(12);
  });

  it.each(["pre", "unknown"])("cannot recommend a %s-security approved row", (securityZone) => {
    const input = rows();
    input[0].securityZone = securityZone;
    input[0].recommendEligible = true;
    const result = audit(input);
    expect(result.ok).toBe(false);
    issue(result, "recommend_eligibility_mismatch");
    issue(result, "approved_recommendation_missing");
  });

  it.each([null, "", "javascript:alert(1)", "https://www.flysfo.com.evil.test/listing",
    "https://www.flysfo.com@evil.test/listing", "https://flysfo.com:444/listing",
    "http://www.flysfo.com/listing", "https://user:pass@www.flysfo.com/listing"])(
    "rejects official provenance that is not a plain SFO HTTPS source: %j", (source) => {
      const result = changed("sourceUrl", source);
      expect(result.ok).toBe(false);
      issue(result, "invalid_provenance", "facilities[0].sourceUrl");
    },
  );

  it.each(["sourceUrl", "lastCheckedAt", "hoursSourceUrl", "hoursLastCheckedAt"])(
    "detects removal of %s from every published record", (field) => {
      for (let index = 0; index < production.length; index++) {
        const input = rows();
        delete input[index][field];
        const result = audit(input);
        expect(result.ok).toBe(false);
        issue(result, "missing_provenance", `facilities[${index}].${field}`);
      }
    },
  );

  it.each(["2026-02-29", "2026-04-31", "2026-10-25T00:00:00Z", " 2026-10-25", null])(
    "rejects malformed provenance dates: %j", (date) => {
      issue(changed("lastCheckedAt", date), "invalid_provenance", "facilities[0].lastCheckedAt");
    },
  );

  it("requires third-party attribution without claiming it is official", () => {
    const input = rows();
    input[12].locationConfidence = "third_party";
    input[12].sourceUrl = "https://example.org/source";
    // This fixture represents only third-party location/security evidence.
    // Remove the original official contact claim, which needs an SFO source.
    delete input[12].contact;
    expect(audit(input).ok).toBe(true);
    delete input[12].sourceUrl;
    issue(audit(input), "missing_provenance", "facilities[12].sourceUrl");
  });

  it("requires provenance for known security and official contact/amenity claims independently of location confidence", () => {
    for (const claim of [
      { securityZone: "post" },
      { contact: { phoneSource: "official_listing", phoneE164OrDisplay: "test phone" } },
      { amenityDetails: { tagline: null, officialBadges: ["military_discount"], aboutExcerpt: null } },
    ]) {
      const input = rows();
      input[12] = { ...input[12], securityZone: "unknown", locationConfidence: "unknown",
        contact: undefined, amenityDetails: undefined, ...claim };
      delete input[12].sourceUrl;
      delete input[12].lastCheckedAt;
      const result = audit(input);
      expect(result.ok).toBe(false);
      issue(result, "missing_provenance", "facilities[12].sourceUrl");
      issue(result, "missing_provenance", "facilities[12].lastCheckedAt");
    }
  });

  it("accepts explicit unknown hours and reports an honest data gap", () => {
    const input = rows();
    input[12].hours = { kind: "unknown" };
    delete input[12].hoursSourceUrl;
    delete input[12].hoursLastCheckedAt;
    expect(audit(input).ok).toBe(true);
    issue(audit(input), "unknown_hours", "facilities[12].hours");
  });

  it.each([
    { kind: "weekly_same_all_days", rawText: "Daily", openLocal: "24:00", closeLocal: "09:00", timezone: "America/Los_Angeles" },
    { kind: "weekly_same_all_days", rawText: "Daily", openLocal: null, closeLocal: "09:00", timezone: "America/Los_Angeles" },
    { kind: "weekly_same_all_days", rawText: "Daily", openLocal: "09:00", closeLocal: "10:00", timezone: "UTC" },
    { kind: "unknown", rawText: 12 }, null, [],
  ])("reports malformed hours without silently recovering %j", (hours) => {
    const result = changed("hours", hours);
    expect(result.ok).toBe(false);
    issue(result, "invalid_hours_representation", "facilities[0].hours");
  });

  it("does not let the normalizer invent confidence for weekly schedules", () => {
    const input = rows();
    delete input[0].hoursConfidence;
    issue(audit(input), "missing_hours_confidence", "facilities[0].hoursConfidence");
    expect(audit(input).ok).toBe(false);
  });

  it("does not allow unknown hours to contain structured clock claims", () => {
    const result = changed("hours", { kind: "unknown", rawText: "Hours vary", openLocal: "09:00", closeLocal: "17:00" }, 12);
    issue(result, "unknown_hours_with_times", "facilities[12].hours");
    expect(result.ok).toBe(false);
  });

  it.each([undefined, "0", -1, NaN, Infinity, 1.5])("rejects noncanonical raw duration %j", (duration) => {
    const result = changed("waitMinutes", duration);
    expect(result.ok).toBe(false);
    issue(result, "invalid_duration_representation", "facilities[0].waitMinutes");
  });

  it("preserves explicit unknown durations rather than zero-filling them", () => {
    const input = rows();
    const before = JSON.stringify(input);
    const result = audit(input);
    expect(result.ok).toBe(true);
    expect(JSON.stringify(input)).toBe(before);
    expect(input.every((row) => row.waitMinutes === null && row.activityMinutes === null)).toBe(true);
  });

  it("rejects each browse-only row being added to recommendations", () => {
    for (let index = 12; index < 26; index++) {
      const result = changed("recommendEligible", true, index);
      expect(result.ok).toBe(false);
      // D rows are valid by schema but outside the independently approved ID set.
      if (index < 18) issue(result, "unapproved_recommendation");
      else issue(result, "recommend_eligibility_mismatch");
    }
  });

  it("catches implicit expansion caused by removing a D browse-only exclusion", () => {
    const input = rows();
    delete input[12].recommendEligible;
    const result = audit(input);
    issue(result, "unapproved_recommendation");
    expect(result.ok).toBe(false);
  });

  it("catches same-count replacement, removal and disabling of every approved ID", () => {
    for (let index = 0; index < 12; index++) {
      const input = rows();
      input[index].recommendEligible = false;
      input[12].recommendEligible = true;
      const result = audit(input);
      expect(result.counts.recommendEligible).toBe(12);
      issue(result, "unapproved_recommendation");
      issue(result, "approved_recommendation_missing");
      expect(result.ok).toBe(false);
      issue(audit(rows().filter((_, rowIndex) => rowIndex !== index)), "approved_recommendation_missing");
    }
  });

  it("allows separately sourced browse-only expansion without changing the baseline", () => {
    const input = rows();
    input.push({ ...input[12], id: "sfo-t2-d-synthetic-test-only" });
    const result = audit(input);
    expect(result.ok).toBe(true);
    expect(result.counts).toMatchObject({ input: 27, browseEligible: 27, recommendEligible: 12 });
  });

  it.each([undefined, null, {}, { version: "", approvedFacilityIds: ["one"] },
    { version: "v1", approvedFacilityIds: [] }, { version: "v1", approvedFacilityIds: ["one", "one"] },
    { version: "v1", approvedFacilityIds: [" ONE "] }, { version: "v1", approvedFacilityIds: "one" }])(
    "requires a valid caller-supplied versioned baseline %j", (policy) => {
      const result = auditFacilityData(rows(), policy as RecommendationEligibilityBaseline);
      expect(result.ok).toBe(false);
      issue(result, "invalid_baseline", "baseline");
    },
  );

  it("is deterministic across JSON round trips and leaves frozen inputs untouched", () => {
    const input = rows();
    const freeze = (value: unknown): void => {
      if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); }
    };
    freeze(input);
    const result = audit(input);
    expect(audit(JSON.parse(JSON.stringify(input)))).toEqual(result);
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
    expect(audit(input).recommendationIds).toEqual(audit([...input].reverse()).recommendationIds);
  });
});
