import {
  BOARDING_AREA_TO_TERMINAL,
  defaultAirportIata,
  defaultBoardingAreaFromZone,
  defaultBrowseEligible,
  defaultRecommendEligible,
  defaultTerminalCode,
  isBoardingAreaCode,
  recommendEligibilityViolations,
} from "@/lib/facility-location";
import { parseStrictInteger } from "@/lib/strict-integer";
import {
  FACILITY_ABOUT_EXCERPT_MAX_LENGTH,
  FACILITY_HOURS_TIMEZONE,
  FACILITY_OFFICIAL_BADGES,
  SUPPORTED_AIRPORT_IATA,
  type BoardingAreaCode,
  type DataConfidence,
  type Facility,
  type FacilityAmenityDetails,
  type FacilityCategory,
  type FacilityContact,
  type FacilityHours,
  type FacilityOfficialBadge,
  type FacilityPhoneSource,
  type FacilityValidationError,
  type FacilityValidationErrorCode,
  type GateLandmark,
  type SecurityZone,
  type TerminalCode,
  type ValidateFacilities,
} from "@/types/airport";

const terminalCodes = [
  "harvey_milk_1",
  "terminal_2",
  "terminal_3",
  "international",
] as const satisfies readonly TerminalCode[];

const categories = ["food", "coffee", "restroom", "charging", "shop"] as const satisfies readonly FacilityCategory[];
const securityZones = ["pre", "post", "both", "unknown"] as const satisfies readonly SecurityZone[];
const confidences = ["official_verified", "third_party", "demo_estimate", "unknown"] as const satisfies readonly DataConfidence[];
const landmarks = ["D1", "D4", "D7", "D9", "D15", "D16"] as const satisfies readonly GateLandmark[];
const phoneSources = ["official_listing", "unknown"] as const satisfies readonly FacilityPhoneSource[];
const hoursTimezones = [FACILITY_HOURS_TIMEZONE] as const;
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
  const parsed = parseStrictInteger(value, { allowNegative: false });
  return parsed === undefined ? undefined : parsed;
}

function calendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function parseBooleanField(
  value: unknown,
): boolean | undefined | "invalid" {
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  return "invalid";
}

function httpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function localTimeHHmm(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!/^\d{2}:\d{2}$/.test(trimmed)) return undefined;
  const [hourPart, minutePart] = trimmed.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return undefined;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return undefined;
  return trimmed;
}

type HoursParseResult = { hours?: FacilityHours; hoursConfidence?: DataConfidence };

function parseHoursBlock(
  row: Record<string, unknown>,
  error: (field: string, code: FacilityValidationErrorCode, message: string) => void,
): HoursParseResult {
  const result: HoursParseResult = {};
  const hasHours = Object.prototype.hasOwnProperty.call(row, "hours");
  const hasHoursConfidence = Object.prototype.hasOwnProperty.call(row, "hoursConfidence");

  if (!hasHours && !hasHoursConfidence) return result;

  if (hasHoursConfidence) {
    const hoursConfidence = member(row.hoursConfidence, confidences);
    if (hoursConfidence === undefined) {
      error("hoursConfidence", "invalid_confidence", "Unsupported hours confidence.");
      return result;
    }
    result.hoursConfidence = hoursConfidence;
  }

  if (!hasHours) {
    if (result.hoursConfidence === "official_verified") {
      error("hours", "missing_required_field", "Officially verified hours require an hours object.");
    }
    return result;
  }

  if (row.hours === null || typeof row.hours !== "object" || Array.isArray(row.hours)) {
    error("hours", "invalid_hours", "Hours must be an object.");
    return result;
  }
  const hoursRow = row.hours as Record<string, unknown>;
  const kind = hoursRow.kind;

  if (kind === "unknown") {
    let rawText: string | undefined;
    if (hoursRow.rawText !== undefined) {
      if (typeof hoursRow.rawText !== "string" || hoursRow.rawText.trim().length === 0) {
        error("hours.rawText", "invalid_hours", "Hours raw text must be a non-empty string when provided.");
      } else {
        rawText = hoursRow.rawText;
      }
    }
    result.hours = rawText !== undefined ? { kind: "unknown", rawText } : { kind: "unknown" };
    if (result.hoursConfidence === "official_verified") {
      error("hoursConfidence", "confidence_field_mismatch", "Unknown hours cannot use official_verified confidence.");
    }
    return result;
  }

  if (kind !== "weekly_same_all_days") {
    error("hours.kind", "invalid_hours", "Hours kind must be weekly_same_all_days or unknown.");
    return result;
  }

  const rawText = typeof hoursRow.rawText === "string" ? hoursRow.rawText.trim() : "";
  if (!rawText) {
    error("hours.rawText", "missing_required_field", "Weekly hours require verbatim rawText from the listing.");
  }
  const timezone = member(hoursRow.timezone, hoursTimezones);
  if (timezone === undefined) {
    error("hours.timezone", "invalid_hours", `Hours timezone must be ${FACILITY_HOURS_TIMEZONE}.`);
  }
  const openParsed = localTimeHHmm(hoursRow.openLocal);
  const closeParsed = localTimeHHmm(hoursRow.closeLocal);
  if (hoursRow.openLocal !== undefined && hoursRow.openLocal !== null && openParsed === undefined) {
    error("hours.openLocal", "invalid_hours", "openLocal must be null or HH:mm (00:00–23:59).");
  }
  if (hoursRow.closeLocal !== undefined && hoursRow.closeLocal !== null && closeParsed === undefined) {
    error("hours.closeLocal", "invalid_hours", "closeLocal must be null or HH:mm (00:00–23:59).");
  }
  const openLocal = hoursRow.openLocal === undefined ? null : openParsed;
  const closeLocal = hoursRow.closeLocal === undefined ? null : closeParsed;
  if (openLocal !== null && closeLocal === null) {
    error("hours", "hours_parse_partial", "closeLocal is required when openLocal is set.");
  }
  if (closeLocal !== null && openLocal === null) {
    error("hours", "hours_parse_partial", "openLocal is required when closeLocal is set.");
  }

  if (!rawText || !timezone) {
    return result;
  }

  result.hours = {
    kind: "weekly_same_all_days",
    rawText,
    openLocal: openLocal ?? null,
    closeLocal: closeLocal ?? null,
    timezone,
  };

  if (result.hoursConfidence === undefined) {
    result.hoursConfidence = "official_verified";
  } else if (result.hoursConfidence !== "official_verified") {
    error("hoursConfidence", "confidence_field_mismatch", "Weekly published hours must use official_verified confidence.");
  }

  return result;
}

function parseHoursProvenance(
  row: Record<string, unknown>,
  error: (field: string, code: FacilityValidationErrorCode, message: string) => void,
  hours?: FacilityHours,
  hoursConfidence?: DataConfidence,
): { hoursLastCheckedAt?: string; hoursSourceUrl?: string } {
  const provenance: { hoursLastCheckedAt?: string; hoursSourceUrl?: string } = {};
  const weeklyVerified =
    hours?.kind === "weekly_same_all_days" && hoursConfidence === "official_verified";

  if (row.hoursLastCheckedAt !== undefined) {
    if (typeof row.hoursLastCheckedAt !== "string" || !calendarDate(row.hoursLastCheckedAt.trim())) {
      error("hoursLastCheckedAt", "invalid_date", "Hours verification date must be a real YYYY-MM-DD calendar date.");
    } else {
      provenance.hoursLastCheckedAt = row.hoursLastCheckedAt.trim();
    }
  } else if (weeklyVerified) {
    error("hoursLastCheckedAt", "missing_required_field", "Officially verified hours require hoursLastCheckedAt.");
  }

  if (row.hoursSourceUrl !== undefined) {
    if (typeof row.hoursSourceUrl !== "string") {
      error("hoursSourceUrl", "invalid_url", "Hours source URL must be an HTTP or HTTPS URL.");
    } else {
      const trimmed = row.hoursSourceUrl.trim();
      if (!httpUrl(trimmed)) {
        error("hoursSourceUrl", "invalid_url", "Hours source URL must be a valid HTTP or HTTPS URL.");
      } else {
        provenance.hoursSourceUrl = trimmed;
      }
    }
  } else if (weeklyVerified) {
    error("hoursSourceUrl", "missing_required_field", "Officially verified hours require hoursSourceUrl.");
  }

  return provenance;
}

function parseContact(
  row: Record<string, unknown>,
  error: (field: string, code: FacilityValidationErrorCode, message: string) => void,
): FacilityContact | undefined {
  if (row.contact === undefined) return undefined;
  if (row.contact === null || typeof row.contact !== "object" || Array.isArray(row.contact)) {
    error("contact", "invalid_contact", "Contact must be an object.");
    return undefined;
  }
  const contactRow = row.contact as Record<string, unknown>;
  let phoneE164OrDisplay: string | null | undefined;
  if (contactRow.phoneE164OrDisplay === null) {
    phoneE164OrDisplay = null;
  } else if (typeof contactRow.phoneE164OrDisplay === "string") {
    const trimmed = contactRow.phoneE164OrDisplay.trim();
    phoneE164OrDisplay = trimmed.length === 0 ? undefined : trimmed;
  } else if (contactRow.phoneE164OrDisplay !== undefined) {
    error("contact.phoneE164OrDisplay", "invalid_contact", "Phone must be a string or null.");
    return undefined;
  }
  const phoneSource = member(contactRow.phoneSource, phoneSources);
  if (phoneSource === undefined) {
    error("contact.phoneSource", "invalid_contact", "Phone source must be official_listing or unknown.");
    return undefined;
  }
  if (phoneE164OrDisplay === undefined) {
    error("contact.phoneE164OrDisplay", "missing_required_field", "Contact requires phoneE164OrDisplay (string or null).");
    return undefined;
  }
  if (phoneSource === "official_listing" && phoneE164OrDisplay === null) {
    error("contact.phoneE164OrDisplay", "confidence_field_mismatch", "official_listing contact requires a phone string.");
  }
  return { phoneE164OrDisplay, phoneSource };
}

function parseAmenityDetails(
  row: Record<string, unknown>,
  error: (field: string, code: FacilityValidationErrorCode, message: string) => void,
): FacilityAmenityDetails | undefined {
  if (row.amenityDetails === undefined) return undefined;
  if (row.amenityDetails === null || typeof row.amenityDetails !== "object" || Array.isArray(row.amenityDetails)) {
    error("amenityDetails", "invalid_amenity_details", "Amenity details must be an object.");
    return undefined;
  }
  const detailsRow = row.amenityDetails as Record<string, unknown>;
  let tagline: string | null | undefined;
  if (detailsRow.tagline === null) {
    tagline = null;
  } else if (typeof detailsRow.tagline === "string") {
    tagline = detailsRow.tagline;
  } else if (detailsRow.tagline !== undefined) {
    error("amenityDetails.tagline", "invalid_amenity_details", "Tagline must be a string or null.");
    return undefined;
  } else {
    error("amenityDetails.tagline", "missing_required_field", "Amenity details require tagline (string or null).");
    return undefined;
  }

  if (!Array.isArray(detailsRow.officialBadges)) {
    error("amenityDetails.officialBadges", "invalid_amenity_details", "officialBadges must be an array.");
    return undefined;
  }
  const officialBadges: FacilityOfficialBadge[] = [];
  for (let badgeIndex = 0; badgeIndex < detailsRow.officialBadges.length; badgeIndex += 1) {
    const badge = member(detailsRow.officialBadges[badgeIndex], FACILITY_OFFICIAL_BADGES);
    if (badge === undefined) {
      error(
        `amenityDetails.officialBadges[${badgeIndex}]`,
        "invalid_amenity_details",
        "Unsupported official badge value.",
      );
      return undefined;
    }
    officialBadges.push(badge);
  }

  let aboutExcerpt: string | null | undefined;
  if (detailsRow.aboutExcerpt === null) {
    aboutExcerpt = null;
  } else if (typeof detailsRow.aboutExcerpt === "string") {
    if (detailsRow.aboutExcerpt.length > FACILITY_ABOUT_EXCERPT_MAX_LENGTH) {
      error(
        "amenityDetails.aboutExcerpt",
        "invalid_amenity_details",
        `aboutExcerpt must be at most ${FACILITY_ABOUT_EXCERPT_MAX_LENGTH} characters.`,
      );
      return undefined;
    }
    aboutExcerpt = detailsRow.aboutExcerpt;
  } else if (detailsRow.aboutExcerpt !== undefined) {
    error("amenityDetails.aboutExcerpt", "invalid_amenity_details", "aboutExcerpt must be a string or null.");
    return undefined;
  } else {
    aboutExcerpt = null;
  }

  return { tagline, officialBadges, aboutExcerpt };
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
    if (zone === undefined || !isBoardingAreaCode(zone)) {
      error("zone", "invalid_zone", "Zone must be a supported SFO boarding area code (A–G).");
    }
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

    let airportIata: typeof SUPPORTED_AIRPORT_IATA | undefined;
    if (row.airportIata !== undefined) {
      if (typeof row.airportIata !== "string" || row.airportIata.trim() !== SUPPORTED_AIRPORT_IATA) {
        error("airportIata", "invalid_shape", `airportIata must be ${SUPPORTED_AIRPORT_IATA}.`);
      } else {
        airportIata = SUPPORTED_AIRPORT_IATA;
      }
    }

    let terminalCode: TerminalCode | undefined;
    if (row.terminalCode !== undefined) {
      const parsedTerminal = member(row.terminalCode, terminalCodes);
      if (parsedTerminal === undefined) {
        error("terminalCode", "invalid_terminal", "Unsupported terminal code.");
      } else {
        terminalCode = parsedTerminal;
      }
    }

    let boardingAreaCode: BoardingAreaCode | undefined;
    if (row.boardingAreaCode !== undefined) {
      const trimmed =
        typeof row.boardingAreaCode === "string" ? row.boardingAreaCode.trim() : undefined;
      if (trimmed === undefined || !isBoardingAreaCode(trimmed)) {
        error("boardingAreaCode", "invalid_boarding_area", "Unsupported boarding area code.");
      } else {
        boardingAreaCode = trimmed;
      }
    }

    let browseEligible: boolean | undefined;
    if (row.browseEligible !== undefined) {
      const parsed = parseBooleanField(row.browseEligible);
      if (parsed === "invalid") {
        error("browseEligible", "invalid_eligibility_flag", "browseEligible must be a boolean.");
      } else {
        browseEligible = parsed;
      }
    }

    let recommendEligible: boolean | undefined;
    if (row.recommendEligible !== undefined) {
      const parsed = parseBooleanField(row.recommendEligible);
      if (parsed === "invalid") {
        error("recommendEligible", "invalid_eligibility_flag", "recommendEligible must be a boolean.");
      } else {
        recommendEligible = parsed;
      }
    }

    const resolvedZone = zone as BoardingAreaCode | undefined;
    if (
      resolvedZone &&
      boardingAreaCode !== undefined &&
      boardingAreaCode !== resolvedZone
    ) {
      error(
        "boardingAreaCode",
        "terminal_boarding_mismatch",
        "boardingAreaCode must match zone when both are provided.",
      );
    }

    const effectiveBoarding =
      boardingAreaCode ?? (resolvedZone ? defaultBoardingAreaFromZone(resolvedZone) : undefined);
    const expectedTerminal =
      effectiveBoarding !== undefined
        ? BOARDING_AREA_TO_TERMINAL[effectiveBoarding]
        : undefined;
    if (
      terminalCode !== undefined &&
      expectedTerminal !== undefined &&
      terminalCode !== expectedTerminal
    ) {
      error(
        "terminalCode",
        "terminal_boarding_mismatch",
        "terminalCode does not match the boarding area mapping.",
      );
    }

    if (
      resolvedZone &&
      securityZone !== undefined &&
      errors.length === start
    ) {
      const eligibilityMessage = recommendEligibilityViolations({
        zone: resolvedZone,
        securityZone,
        browseEligible,
        recommendEligible,
      });
      if (eligibilityMessage !== null) {
        error("recommendEligible", "recommend_eligibility_mismatch", eligibilityMessage);
      }
    }

    const { hours, hoursConfidence } = parseHoursBlock(row, error);
    const { hoursLastCheckedAt, hoursSourceUrl } = parseHoursProvenance(row, error, hours, hoursConfidence);
    const contact = parseContact(row, error);
    const amenityDetails = parseAmenityDetails(row, error);

    if (id && seen.has(id)) error("id", "duplicate_id", `Duplicate facility ID: ${id}.`);

    // The guards also narrow unknown input to the frozen Facility contract.
    if (errors.length > start || !id || !name || resolvedZone === undefined ||
      !isBoardingAreaCode(resolvedZone) ||
      category === undefined || securityZone === undefined ||
      locationConfidence === undefined || timeConfidence === undefined ||
      waitMinutes === undefined || activityMinutes === undefined) continue;

    const normalizedLocation = {
      airportIata: defaultAirportIata(airportIata),
      terminalCode: defaultTerminalCode(
        boardingAreaCode ?? defaultBoardingAreaFromZone(resolvedZone),
        terminalCode,
      ),
      boardingAreaCode:
        boardingAreaCode ?? defaultBoardingAreaFromZone(resolvedZone),
      browseEligible: defaultBrowseEligible(browseEligible),
      recommendEligible: defaultRecommendEligible(
        resolvedZone,
        securityZone,
        recommendEligible,
      ),
    };

    facilities.push({
      id,
      name,
      zone: resolvedZone,
      ...normalizedLocation,
      category,
      securityZone,
      waitMinutes,
      activityMinutes,
      locationConfidence,
      timeConfidence,
      ...(sourceUrl !== undefined ? { sourceUrl } : {}),
      ...(lastCheckedAt !== undefined ? { lastCheckedAt } : {}),
      ...(locationDescription !== undefined ? { locationDescription } : {}),
      ...(nearestGateLandmark !== undefined ? { nearestGateLandmark } : {}),
      ...(hours !== undefined ? { hours } : {}),
      ...(hoursConfidence !== undefined ? { hoursConfidence } : {}),
      ...(hoursLastCheckedAt !== undefined ? { hoursLastCheckedAt } : {}),
      ...(hoursSourceUrl !== undefined ? { hoursSourceUrl } : {}),
      ...(contact !== undefined ? { contact } : {}),
      ...(amenityDetails !== undefined ? { amenityDetails } : {}),
    });
    seen.add(id);
  }
  return { facilities, errors };
};
