import { FACILITY_HOURS_TIMEZONE } from "@/types/airport";

type TimePresentationBase = { text: string; timezone: typeof FACILITY_HOURS_TIMEZONE };
export type AirportLocalTimePresentation = TimePresentationBase & (
  | { kind: "timestamp"; date: string; time: string; offsetMinutes: number; offsetLabel: string }
  | { kind: "unknown" | "invalid" | "unavailable" }
);

/** Strict Gregorian YYYY-MM-DD, years 0100–9999; no host-timezone conversion. */
export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 100 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= days[month - 1];
}

function instantMilliseconds(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.(\d{1,3}))?)?(Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.exec(value);
  if (!match || !isCalendarDate(match[1]) || match[6] === "-00:00") return null;
  const milliseconds = Date.parse(value);
  return Number.isFinite(milliseconds) ? milliseconds : null;
}

/**
 * Format an explicit instant in SFO's zone using numeric Intl parts, not locale
 * punctuation or the host timezone. ISO offset strings only; null/undefined mean
 * unknown. Local wall times, date-only values and RFC3339 unknown -00:00 offsets
 * are rejected. Never reads the current clock or evaluates facility status.
 * Requires runtime Intl/IANA support; missing support fails without a fallback.
 */
export function presentAirportLocalTime(value: unknown): AirportLocalTimePresentation {
  const timezone = FACILITY_HOURS_TIMEZONE;
  if (value == null) return { kind: "unknown", text: "Time unknown", timezone };
  const milliseconds = instantMilliseconds(value);
  if (milliseconds === null) return { kind: "invalid", text: "Invalid timestamp", timezone };

  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone, calendar: "gregory", numberingSystem: "latn", hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).formatToParts(new Date(milliseconds));
    const part = (type: Intl.DateTimeFormatPartTypes) => {
      const value = parts.find((item) => item.type === type)?.value;
      if (value === undefined || !/^\d+$/.test(value)) throw new RangeError("Missing numeric time part");
      return value;
    };
    const year = part("year").padStart(4, "0");
    const month = part("month");
    const day = part("day");
    const hour = part("hour");
    const minute = part("minute");
    const second = part("second");
    const date = `${year}-${month}-${day}`;
    const time = `${hour}:${minute}:${second}`;
    if (!isCalendarDate(date)) throw new RangeError("Local date outside supported calendar range");
    // Date.parse avoids Date.UTC's special treatment of years 0–99.
    const localAsUTC = Date.parse(`${date}T${time}Z`);
    const offsetMinutes = (localAsUTC - Math.floor(milliseconds / 1000) * 1000) / 60_000;
    const offsetSeconds = Math.round(Math.abs(offsetMinutes) * 60);
    const pad = (number: number) => String(number).padStart(2, "0");
    // Historical IANA offsets may contain seconds; retain them rather than round.
    const offsetLabel = `UTC${offsetMinutes < 0 ? "-" : "+"}${pad(Math.floor(offsetSeconds / 3600))}:${pad(Math.floor(offsetSeconds / 60) % 60)}${offsetSeconds % 60 ? `:${pad(offsetSeconds % 60)}` : ""}`;
    return { kind: "timestamp", date, time, offsetMinutes, offsetLabel, timezone,
      text: `${date} ${time} Pacific Time (${offsetLabel})` };
  } catch {
    return { kind: "unavailable", text: "Airport timezone unavailable", timezone };
  }
}
