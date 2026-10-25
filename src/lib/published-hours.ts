import {
  FACILITY_HOURS_TIMEZONE,
  type DataConfidence,
  type FacilityHours,
} from "@/types/airport";
import { presentFacilityHours, type FacilityHoursPresentation } from "./format-facility-hours";

export type PublishedHoursPresentation = FacilityHoursPresentation & {
  kind: "weekly" | "raw_text" | "unknown" | "withheld" | "invalid";
  /** Exact source text, including whitespace. Render as text, never as HTML. */
  rawText: string | null;
  /** Declared schedule confidence; never a claim of current availability. */
  confidence: DataConfidence;
  timezone: typeof FACILITY_HOURS_TIMEZONE;
  /** This library deliberately does not evaluate opening status. */
  liveStatus: "unknown";
};

const confidences: readonly DataConfidence[] = ["official_verified", "third_party", "demo_estimate", "unknown"];
const clockTime = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function validHours(value: unknown): value is FacilityHours {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  if (row.kind === "unknown") return row.rawText === undefined || typeof row.rawText === "string";
  if (row.kind !== "weekly_same_all_days" || typeof row.rawText !== "string" || !row.rawText.trim() ||
    row.timezone !== FACILITY_HOURS_TIMEZONE) return false;
  return (row.openLocal === null && row.closeLocal === null) ||
    (typeof row.openLocal === "string" && clockTime.test(row.openLocal) &&
      typeof row.closeLocal === "string" && clockTime.test(row.closeLocal));
}

/**
 * Additive, pure presentation API. Valid normalized records retain the existing
 * display policy. Unknown raw text is verbatim (the old formatter trims it).
 * No clock, browser, process locale, timestamp parsing, or open/closed inference.
 */
export function presentPublishedHours(
  hours: FacilityHours | null | undefined,
  hoursConfidence?: DataConfidence,
): PublishedHoursPresentation {
  const metadata = { timezone: FACILITY_HOURS_TIMEZONE, liveStatus: "unknown" as const };
  if ((hours != null && !validHours(hours)) ||
    (hoursConfidence !== undefined && !confidences.includes(hoursConfidence))) {
    return {
      ...presentFacilityHours(undefined, undefined), ...metadata,
      kind: "invalid", scheduleLine: "Published hours unavailable — invalid schedule data.",
      rawText: null, confidence: "unknown",
    };
  }

  const rawText = hours?.rawText ?? null;
  const display = presentFacilityHours(hours ?? undefined, hoursConfidence);
  if (!hours || hours.kind === "unknown") {
    const hasText = Boolean(rawText?.trim());
    return {
      ...display, ...metadata, kind: hasText ? "raw_text" : "unknown",
      scheduleLine: hasText ? rawText! : display.scheduleLine,
      rawText, confidence: "unknown",
    };
  }
  return {
    ...display, ...metadata, rawText, confidence: hoursConfidence ?? "unknown",
    kind: hoursConfidence !== "official_verified" ? "withheld"
      : hours.openLocal === null ? "raw_text" : "weekly",
  };
}
