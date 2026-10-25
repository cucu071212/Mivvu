import type { FacilityValidationErrorCode } from "@/types/airport";
import { isCalendarDate } from "./airport-local-time";
import { presentPublishedHours } from "./published-hours";
import { validateFacilities } from "./validate-facilities";

/** Caller owns approval. This library never creates or changes a routing manifest. */
export type RecommendationEligibilityBaseline = {
  readonly version: string;
  readonly approvedFacilityIds: readonly string[];
};

export type FacilityAuditCode = FacilityValidationErrorCode
  | "invalid_baseline" | "noncanonical_id" | "normalized_duplicate_id"
  | "legacy_location_defaults" | "missing_provenance" | "invalid_provenance"
  | "unknown_security" | "unknown_durations" | "invalid_duration_representation"
  | "unknown_hours" | "unparsed_hours" | "invalid_hours_representation"
  | "missing_hours_confidence" | "unknown_hours_with_times"
  | "unapproved_recommendation" | "approved_recommendation_missing";

export type FacilityAuditIssue = {
  severity: "error" | "warning";
  code: FacilityAuditCode;
  path: string;
  message: string;
};

export type FacilityDataAudit = {
  policyVersion: "gw-c-facility-audit-v1";
  baselineVersion: string | null;
  /** No errors; warnings still need review. Not a production-release approval. */
  ok: boolean;
  /** Eligibility counts are schema-valid normalized rows, not raw boolean claims. */
  counts: { input: number; valid: number; browseEligible: number; recommendEligible: number };
  recommendationIds: string[];
  issues: FacilityAuditIssue[];
};

const canonicalId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const locationFields = ["airportIata", "terminalCode", "boardingAreaCode", "browseEligible", "recommendEligible"] as const;

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validBaseline(value: unknown): value is RecommendationEligibilityBaseline {
  if (!record(value) || typeof value.version !== "string" || !value.version.trim() || value.version !== value.version.trim() ||
    !Array.isArray(value.approvedFacilityIds) || value.approvedFacilityIds.length === 0) return false;
  const ids = value.approvedFacilityIds;
  return ids.every((id) => typeof id === "string" && canonicalId.test(id)) && new Set(ids).size === ids.length;
}

function sourceUrl(value: unknown, official: boolean): boolean {
  if (typeof value !== "string" || value !== value.trim() || /\s/.test(value)) return false;
  try {
    const url = new URL(value);
    if (url.username || url.password || url.port) return false;
    if (official) return url.protocol === "https:" && ["flysfo.com", "www.flysfo.com"].includes(url.hostname);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch { return false; }
}

/**
 * Offline release audit of raw JSON-compatible records. Composes the established
 * schema validator with stricter raw-data/provenance and independent ID-set checks.
 * Never returns repaired records, fetches URLs, reads the clock or grants eligibility.
 * Legacy location defaults remain accepted with warnings, matching current data.
 */
export function auditFacilityData(raw: unknown, baseline: RecommendationEligibilityBaseline): FacilityDataAudit {
  const { facilities, errors } = validateFacilities(raw);
  const issues: FacilityAuditIssue[] = errors.map((error) => ({ severity: "error", ...error }));
  const add = (code: FacilityAuditCode, path: string, message: string, severity: FacilityAuditIssue["severity"] = "error") => {
    issues.push({ severity, code, path, message });
  };
  const baselineIsValid = validBaseline(baseline);
  if (!baselineIsValid) add("invalid_baseline", "baseline", "Provide a version and a nonempty unique canonical approved ID list from the Lead.");

  const seen = new Set<string>();
  if (Array.isArray(raw)) raw.forEach((input: unknown, index) => {
    if (!record(input)) return;
    const path = `facilities[${index}]`;
    if (typeof input.id !== "string" || !canonicalId.test(input.id)) {
      add("noncanonical_id", `${path}.id`, "IDs must be lowercase ASCII kebab-case without surrounding whitespace.");
    }
    if (typeof input.id === "string" && input.id.trim()) {
      const normalized = input.id.normalize("NFKC").trim().toLowerCase();
      if (seen.has(normalized)) add("normalized_duplicate_id", `${path}.id`, "ID collides after compatibility normalization, trimming and case folding.");
      seen.add(normalized);
    }

    if (locationFields.some((field) => input[field] === undefined)) {
      add("legacy_location_defaults", path, "Location/eligibility fields use legacy validator defaults; review before adding new records.", "warning");
    }
    if (input.securityZone === "unknown") {
      add("unknown_security", `${path}.securityZone`, "Security side is explicitly unknown; browsing does not establish access.", "warning");
    }
    for (const field of ["waitMinutes", "activityMinutes"] as const) {
      const duration = input[field];
      if (duration !== null && (typeof duration !== "number" || !Number.isSafeInteger(duration) || duration < 0)) {
        add("invalid_duration_representation", `${path}.${field}`, "Source duration must be null or a nonnegative safe integer number; no coercion.");
      }
    }
    if (input.waitMinutes === null || input.activityMinutes === null) {
      add("unknown_durations", path, "Unknown durations remain null; modeled overrides are separate from source records.", "warning");
    }

    const provenance = (urlField: string, dateField: string, required: boolean, official: boolean) => {
      for (const field of [urlField, dateField]) {
        if (input[field] === undefined) {
          if (required) add("missing_provenance", `${path}.${field}`, "Published or attributed facts require a source URL and checked date.");
        } else if (field === urlField ? !sourceUrl(input[field], official) : !isCalendarDate(input[field])) {
          add("invalid_provenance", `${path}.${field}`, field === urlField
            ? "Source must be an attributed HTTP(S) URL without credentials/ports; official SFO claims require flysfo.com HTTPS."
            : "Checked date must be a real YYYY-MM-DD date without time or surrounding whitespace.");
        }
      }
    };
    const officialLocation = input.locationConfidence === "official_verified";
    const officialTime = input.timeConfidence === "official_verified";
    const officialContact = record(input.contact) && input.contact.phoneSource === "official_listing";
    const officialBadges = record(input.amenityDetails) && Array.isArray(input.amenityDetails.officialBadges) && input.amenityDetails.officialBadges.length > 0;
    const knownSecurity = ["pre", "post", "both"].includes(input.securityZone as string);
    const official = officialLocation || officialTime || officialContact || officialBadges;
    const attributed = official || knownSecurity || input.locationConfidence === "third_party" || input.timeConfidence === "third_party";
    provenance("sourceUrl", "lastCheckedAt", attributed, official);

    const hours = input.hours;
    const hasPublishedText = record(hours) && typeof hours.rawText === "string" && hours.rawText.trim().length > 0;
    const isWeekly = record(hours) && hours.kind === "weekly_same_all_days";
    // All published hours in this contract originate in SFO listings, including
    // unknown/rawText AG1 and Vino Volo. Unknown parsing is not missing provenance.
    provenance("hoursSourceUrl", "hoursLastCheckedAt", hasPublishedText || isWeekly, hasPublishedText || isWeekly);
    if (isWeekly && input.hoursConfidence === undefined) {
      add("missing_hours_confidence", `${path}.hoursConfidence`, "Raw weekly records must explicitly declare confidence; do not rely on validator promotion.");
    }
    if (record(hours) && hours.kind === "unknown" && ("openLocal" in hours || "closeLocal" in hours)) {
      add("unknown_hours_with_times", `${path}.hours`, "Unknown hours must not carry structured opening/closing claims.");
    }
    // The presentation boundary performs additional strict runtime checks that the
    // legacy normalizer intentionally permits (e.g. whitespace around HH:mm).
    const display = presentPublishedHours(
      hours as Parameters<typeof presentPublishedHours>[0],
      input.hoursConfidence as Parameters<typeof presentPublishedHours>[1],
    );
    if (hours === null || display.kind === "invalid") {
      add("invalid_hours_representation", `${path}.hours`, "Hours do not match the strict published-hours representation.");
    } else if (!hours || (record(hours) && hours.kind === "unknown" && !hasPublishedText)) {
      add("unknown_hours", `${path}.hours`, "No published hours text available; do not infer a schedule.", "warning");
    } else if (display.kind === "raw_text") {
      add("unparsed_hours", `${path}.hours`, "Published text is preserved without interpreting it as a structured schedule.", "warning");
    }
  });

  const recommendationIds = facilities.filter((row) => row.recommendEligible).map((row) => row.id).sort();
  if (baselineIsValid) {
    const approved = new Set(baseline.approvedFacilityIds);
    const actual = new Set(recommendationIds);
    for (const id of recommendationIds) {
      if (!approved.has(id)) add("unapproved_recommendation", "recommendationIds", `Recommendation ID outside the approved baseline: ${id}`);
    }
    for (const id of [...approved].sort()) {
      if (!actual.has(id)) add("approved_recommendation_missing", "recommendationIds", `Approved recommendation ID is missing, invalid, or disabled: ${id}`);
    }
  }

  return {
    policyVersion: "gw-c-facility-audit-v1", baselineVersion: baselineIsValid ? baseline.version : null,
    ok: !issues.some((issue) => issue.severity === "error"),
    counts: { input: Array.isArray(raw) ? raw.length : 0, valid: facilities.length,
      browseEligible: facilities.filter((row) => row.browseEligible).length, recommendEligible: recommendationIds.length },
    recommendationIds, issues,
  };
}
