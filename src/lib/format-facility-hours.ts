import type { Facility, FacilityHours } from "@/types/airport";
import { FACILITY_HOURS_TIMEZONE } from "@/types/airport";

export type FacilityHoursPresentation = {
  /** Primary line for UI (published schedule, not live status). */
  scheduleLine: string;
  /** Short disclaimer required on all hours surfaces. */
  disclaimer: string;
  /** True when close is before open on the clock (overnight span). */
  spansMidnight: boolean;
  isUnknown: boolean;
};

const HOURS_DISCLAIMER =
  "Published hours from SFO — not live open/closed status. Subject to change without notice.";

function formatLocalTime(hhmm: string): string {
  const [hourPart, minutePart] = hhmm.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return hhmm;
  }
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const minuteText = minute === 0 ? "" : `:${String(minute).padStart(2, "0")}`;
  return `${hour12}${minuteText} ${period}`;
}

function spansMidnight(openLocal: string, closeLocal: string): boolean {
  return openLocal > closeLocal;
}

export function presentFacilityHours(
  hours: FacilityHours | undefined,
  hoursConfidence: Facility["hoursConfidence"],
): FacilityHoursPresentation {
  if (!hours || hours.kind === "unknown") {
    const rawText = hours?.rawText?.trim();
    if (rawText) {
      return {
        scheduleLine: rawText,
        disclaimer: HOURS_DISCLAIMER,
        spansMidnight: false,
        isUnknown: true,
      };
    }
    return {
      scheduleLine: "Hours not published on the official listing we checked.",
      disclaimer: HOURS_DISCLAIMER,
      spansMidnight: false,
      isUnknown: true,
    };
  }

  if (hoursConfidence !== "official_verified") {
    return {
      scheduleLine: "Hours confidence is not official — not shown.",
      disclaimer: HOURS_DISCLAIMER,
      spansMidnight: false,
      isUnknown: true,
    };
  }

  const timezoneLabel =
    hours.timezone === FACILITY_HOURS_TIMEZONE ? "Pacific Time" : hours.timezone;

  if (hours.openLocal && hours.closeLocal) {
    const midnight = spansMidnight(hours.openLocal, hours.closeLocal);
    const range = `${formatLocalTime(hours.openLocal)} – ${formatLocalTime(hours.closeLocal)} ${timezoneLabel}, daily`;
    return {
      scheduleLine: midnight
        ? `${range} (spans midnight — verify on the official listing)`
        : range,
      disclaimer: HOURS_DISCLAIMER,
      spansMidnight: midnight,
      isUnknown: false,
    };
  }

  return {
    scheduleLine: hours.rawText,
    disclaimer: HOURS_DISCLAIMER,
    spansMidnight: false,
    isUnknown: false,
  };
}

export function facilityVerificationDate(facility: Facility): string | undefined {
  return facility.hoursLastCheckedAt ?? facility.lastCheckedAt;
}

export function facilityOfficialListingUrl(facility: Facility): string | undefined {
  return facility.hoursSourceUrl ?? facility.sourceUrl;
}
