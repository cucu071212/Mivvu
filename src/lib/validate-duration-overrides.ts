import { MAX_BOARDING_WINDOW_MINUTES } from "@/lib/strict-integer";
import type {
  FacilityDurationOverride,
  FacilityDurationOverrideMap,
} from "@/types/airport";

type DurationField = "queueMinutes" | "activityMinutes";

const fields = ["queueMinutes", "activityMinutes"] as const;
const owns = (value: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

function isRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * Accepts a plain map keyed by facility ID, with matching facilityId in each entry.
 * Only own fields count. Numeric strings (including blanks) are never coerced.
 * Rejects an entire invalid entry, retaining independent valid entries.
 * Structural errors use both duration fields; top-level errors use facilityId "".
 * Unknown properties are ignored. Arrays/duplicate-entry lists are rejected;
 * duplicate object keys have already been collapsed by JS before this boundary.
 */
export function validateDurationOverrides(
  input: unknown,
  knownFacilityIds: readonly string[],
): {
  overrides: FacilityDurationOverrideMap;
  errors: Array<{ facilityId: string; field: DurationField; code: string }>;
} {
  const overrides: Record<string, FacilityDurationOverride> = {};
  const errors: Array<{ facilityId: string; field: DurationField; code: string }> = [];
  const rejectEntry = (facilityId: string, code: string) => {
    for (const field of fields) errors.push({ facilityId, field, code });
  };
  if (!isRecord(input)) {
    rejectEntry("", "invalid_input");
    return { overrides, errors };
  }

  const known = new Set(knownFacilityIds);
  for (const [facilityId, entry] of Object.entries(input)) {
    if (!known.has(facilityId)) {
      rejectEntry(facilityId, "unknown_facility_id");
      continue;
    }
    if (!isRecord(entry)) {
      rejectEntry(facilityId, "invalid_override");
      continue;
    }
    if (!owns(entry, "facilityId") || entry.facilityId !== facilityId) {
      rejectEntry(facilityId, "facility_id_mismatch");
      continue;
    }
    const present = fields.filter((field) => owns(entry, field));
    if (present.length === 0) {
      rejectEntry(facilityId, "missing_duration");
      continue;
    }
    const normalized: FacilityDurationOverride = { facilityId };
    let valid = true;
    for (const field of present) {
      const value = entry[field];
      if (
        typeof value !== "number" ||
        !Number.isSafeInteger(value) ||
        value < 0 ||
        value > MAX_BOARDING_WINDOW_MINUTES
      ) {
        errors.push({ facilityId, field, code: "invalid_minutes" });
        valid = false;
      } else {
        normalized[field] = value;
      }
    }
    if (valid) {
      Object.defineProperty(overrides, facilityId, {
        value: normalized,
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
  }
  return { overrides, errors };
}
