import type {
  DataConfidence,
  Facility,
  FacilityCategory,
  FacilityValidationError,
  FacilityValidationErrorCode,
  GateLandmark,
  SecurityZone,
  ValidateFacilities,
} from "@/types/airport";

const categories = ["food", "coffee", "restroom", "charging", "shop"] as const satisfies readonly FacilityCategory[];
const securityZones = ["pre", "post", "both", "unknown"] as const satisfies readonly SecurityZone[];
const confidences = ["official_verified", "third_party", "demo_estimate", "unknown"] as const satisfies readonly DataConfidence[];
const landmarks = ["D1", "D4", "D7", "D9", "D15", "D16"] as const satisfies readonly GateLandmark[];
const requiredFields = [
  "id", "name", "zone", "category", "securityZone", "locationConfidence",
  "timeConfidence", "waitMinutes", "activityMinutes",
] as const;

function member<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  return allowed.find((candidate) => candidate === value);
}

/** undefined signals invalid input; null remains an explicitly unknown duration. */
function minutes(value: unknown): number | null | undefined {
  if (value === null) return null;
  if (typeof value !== "number" && typeof value !== "string") return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  const parsed = typeof value === "string" ? Number(value.trim()) : value;
  return Number.isFinite(parsed) && Number.isInteger(parsed) && parsed >= 0
    ? parsed
    : undefined;
}

function calendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/** Validates rows independently, preserving input order and the first valid ID. */
export const validateFacilities: ValidateFacilities = (raw) => {
  const facilities: Facility[] = [];
  const errors: FacilityValidationError[] = [];
  if (!Array.isArray(raw)) {
    return { facilities, errors: [{
      path: "facilities", code: "invalid_shape", message: "Facilities must be an array.",
    }] };
  }

  const seen = new Set<string>();
  for (let index = 0; index < raw.length; index += 1) {
    const input: unknown = raw[index];
    const path = `facilities[${index}]`;
    if (input === null || typeof input !== "object" || Array.isArray(input)) {
      errors.push({ path, code: "invalid_shape", message: "Facility must be an object." });
      continue;
    }
    const row = input as Record<string, unknown>;
    const start = errors.length;
    const error = (field: string, code: FacilityValidationErrorCode, message: string) => {
      errors.push({ path: `${path}.${field}`, code, message });
    };
    for (const field of requiredFields) {
      if (!Object.prototype.hasOwnProperty.call(row, field)) {
        error(field, "missing_required_field", `${field} is required.`);
      }
    }
    if (errors.length > start) continue;

    const id = typeof row.id === "string" ? row.id.trim() : undefined;
    const name = typeof row.name === "string" ? row.name.trim() : undefined;
    const zone = typeof row.zone === "string" ? row.zone.trim() : undefined;
    const category = member(row.category, categories);
    const securityZone = member(row.securityZone, securityZones);
    const locationConfidence = member(row.locationConfidence, confidences);
    const timeConfidence = member(row.timeConfidence, confidences);
    const waitMinutes = minutes(row.waitMinutes);
    const activityMinutes = minutes(row.activityMinutes);

    if (!id) error("id", "invalid_id", "ID must be a non-empty string.");
    if (!name) error("name", "missing_required_field", "Name must be a non-empty string.");
    if (zone !== "D") error("zone", "invalid_zone", "Zone must be D (Terminal 2).");
    if (category === undefined) error("category", "invalid_category", "Unsupported facility category.");
    if (securityZone === undefined) error("securityZone", "invalid_security_zone", "Unsupported security-side value.");
    if (locationConfidence === undefined) error("locationConfidence", "invalid_confidence", "Unsupported location confidence.");
    if (timeConfidence === undefined) error("timeConfidence", "invalid_confidence", "Unsupported time confidence.");
    for (const [field, value] of [["waitMinutes", waitMinutes], ["activityMinutes", activityMinutes]] as const) {
      if (value === undefined) {
        error(field, "invalid_minutes_field", `${field} must be null or a finite non-negative integer.`);
      } else if (timeConfidence === "unknown" && value !== null) {
        error(field, "confidence_field_mismatch", `${field} must be null when time confidence is unknown.`);
      } else if ((timeConfidence === "demo_estimate" || timeConfidence === "official_verified") && value === null) {
        error(field, "confidence_field_mismatch", `${field} must be known for ${timeConfidence} times.`);
      }
    }

    let sourceUrl: string | undefined;
    if (row.sourceUrl !== undefined) {
      if (typeof row.sourceUrl !== "string") {
        error("sourceUrl", "invalid_url", "Source URL must be an HTTP or HTTPS URL.");
      } else {
        sourceUrl = row.sourceUrl.trim();
        try {
          const parsed = new URL(sourceUrl);
          if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            error("sourceUrl", "invalid_url", "Source URL must use HTTP or HTTPS.");
          }
        } catch {
          error("sourceUrl", "invalid_url", "Source URL must be a valid HTTP or HTTPS URL.");
        }
      }
    } else if (locationConfidence === "official_verified") {
      error("sourceUrl", "missing_required_field", "Officially verified locations require a source URL.");
    }

    let lastCheckedAt: string | undefined;
    if (row.lastCheckedAt !== undefined) {
      if (typeof row.lastCheckedAt !== "string" || !calendarDate(row.lastCheckedAt.trim())) {
        error("lastCheckedAt", "invalid_date", "Verification date must be a real YYYY-MM-DD calendar date.");
      } else {
        lastCheckedAt = row.lastCheckedAt.trim();
      }
    } else if (locationConfidence === "official_verified") {
      error("lastCheckedAt", "missing_required_field", "Officially verified locations require a verification date.");
    }

    let locationDescription: string | undefined;
    if (row.locationDescription !== undefined) {
      if (typeof row.locationDescription !== "string") {
        error("locationDescription", "invalid_shape", "Location description must be a string.");
      } else {
        locationDescription = row.locationDescription;
      }
    }
    const nearestGateLandmark = row.nearestGateLandmark === null
      ? null
      : member(row.nearestGateLandmark, landmarks);
    if (row.nearestGateLandmark !== undefined && nearestGateLandmark === undefined) {
      error("nearestGateLandmark", "invalid_shape", "Gate landmark must be a supported D gate or null.");
    }
    if (id && seen.has(id)) error("id", "duplicate_id", `Duplicate facility ID: ${id}.`);

    // The guards also narrow unknown input to the frozen Facility contract.
    if (errors.length > start || !id || !name || zone !== "D" ||
      category === undefined || securityZone === undefined ||
      locationConfidence === undefined || timeConfidence === undefined ||
      waitMinutes === undefined || activityMinutes === undefined) continue;

    facilities.push({
      id, name, zone, category, securityZone, waitMinutes, activityMinutes,
      locationConfidence, timeConfidence,
      ...(sourceUrl !== undefined ? { sourceUrl } : {}),
      ...(lastCheckedAt !== undefined ? { lastCheckedAt } : {}),
      ...(locationDescription !== undefined ? { locationDescription } : {}),
      ...(nearestGateLandmark !== undefined ? { nearestGateLandmark } : {}),
    });
    seen.add(id);
  }
  return { facilities, errors };
};
