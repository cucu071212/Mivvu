import { describe, expect, it } from "vitest";
import rawFacilities from "@/data/facilities.json";
import type { DataConfidence, FacilityHours } from "@/types/airport";
import { validateFacilities } from "./validate-facilities";
import { presentFacilityHours } from "./format-facility-hours";
import { presentPublishedHours } from "./published-hours";

const weekly: FacilityHours = {
  kind: "weekly_same_all_days", rawText: "Sunday - Saturday 4:30 am-8:30 pm",
  openLocal: "04:30", closeLocal: "20:30", timezone: "America/Los_Angeles",
};

describe("published hours presentation", () => {
  it("preserves the existing public display fields for all 26 records", () => {
    const { facilities, errors } = validateFacilities(rawFacilities);
    expect(errors).toEqual([]);
    expect(facilities).toHaveLength(26);
    for (const facility of facilities) {
      const result = presentPublishedHours(facility.hours, facility.hoursConfidence);
      expect(result).toMatchObject(presentFacilityHours(facility.hours, facility.hoursConfidence));
      expect(result.liveStatus).toBe("unknown");
      expect(result.disclaimer).toContain("not live open/closed status");
    }
  });

  it.each([
    ["sfo-t3-e-ag1", "Sunday - Saturday Open 24 hours"],
    ["sfo-t2-d-vino-volo", "Sunday- Friday 9:00 am-9:00 pm Saturday 9:00 am-7:00 pm"],
  ])("preserves %s without turning text into a structured schedule", (id, text) => {
    const facility = validateFacilities(rawFacilities).facilities.find((row) => row.id === id)!;
    expect(presentPublishedHours(facility.hours, facility.hoursConfidence)).toMatchObject({
      kind: "raw_text", scheduleLine: text, rawText: text,
      confidence: "unknown", isUnknown: true, spansMidnight: false,
    });
  });

  it("keeps raw text whitespace, punctuation and Unicode verbatim", () => {
    const rawText = "  Sunday–Friday 9 am–9 pm\n Saturday 9 am–7 pm  ";
    const hours = Object.freeze({ kind: "unknown" as const, rawText });
    expect(presentPublishedHours(hours)).toMatchObject({ kind: "raw_text", rawText, scheduleLine: rawText });
  });

  it.each([undefined, null, { kind: "unknown" } as const, { kind: "unknown", rawText: "  " } as const])(
    "does not invent missing hours: %j", (hours) => {
      expect(presentPublishedHours(hours)).toMatchObject({
        kind: "unknown", scheduleLine: "Hours not published on the official listing we checked.",
        confidence: "unknown", isUnknown: true, liveStatus: "unknown",
      });
    },
  );

  it("formats official weekly times and carries typed metadata", () => {
    expect(presentPublishedHours(weekly, "official_verified")).toMatchObject({
      kind: "weekly", scheduleLine: "4:30 AM – 8:30 PM Pacific Time, daily",
      rawText: weekly.rawText, confidence: "official_verified", timezone: "America/Los_Angeles",
      isUnknown: false, spansMidnight: false, liveStatus: "unknown",
    });
  });

  it.each(["unknown", "third_party", "demo_estimate", undefined] as const)(
    "keeps the existing non-official weekly suppression policy: %s", (confidence) => {
      expect(presentPublishedHours(weekly, confidence)).toMatchObject({
        kind: "withheld", scheduleLine: "Hours confidence is not official — not shown.",
        confidence: confidence ?? "unknown", isUnknown: true,
      });
    },
  );

  it.each([
    ["00:00", "12:00", "12 AM – 12 PM Pacific Time, daily", false],
    ["22:00", "06:00", "10 PM – 6 AM Pacific Time, daily (spans midnight — verify on the official listing)", true],
    ["09:00", "09:00", "9 AM – 9 AM Pacific Time, daily", false],
  ])("formats %s to %s without interpreting equal endpoints as 24 hours", (openLocal, closeLocal, scheduleLine, spansMidnight) => {
    expect(presentPublishedHours({ ...weekly, openLocal, closeLocal }, "official_verified"))
      .toMatchObject({ scheduleLine, spansMidnight, liveStatus: "unknown" });
  });

  it("uses exact raw text for an official unparsed weekly schedule", () => {
    expect(presentPublishedHours({ ...weekly, openLocal: null, closeLocal: null }, "official_verified"))
      .toMatchObject({ kind: "raw_text", scheduleLine: weekly.rawText, isUnknown: false });
  });

  it.each([
    { ...weekly, openLocal: "24:00" }, { ...weekly, closeLocal: "12:60" },
    { ...weekly, openLocal: "9:00" }, { ...weekly, openLocal: " 09:00" },
    { ...weekly, openLocal: null }, { ...weekly, closeLocal: undefined },
    { ...weekly, timezone: "UTC" }, { ...weekly, rawText: "" },
    { kind: "unknown", rawText: 123 }, { kind: "daily" }, [], "hours",
  ])("fails closed for malformed runtime hours %j", (hours) => {
    const result = presentPublishedHours(hours as FacilityHours, "official_verified");
    expect(result).toMatchObject({ kind: "invalid", isUnknown: true, liveStatus: "unknown", confidence: "unknown" });
    expect(result.scheduleLine).not.toMatch(/AM|PM/);
  });

  it("does not upgrade unknown hours even when confidence contradicts them", () => {
    expect(presentPublishedHours({ kind: "unknown", rawText: "Open 24 hours" }, "official_verified"))
      .toMatchObject({ kind: "raw_text", confidence: "unknown", isUnknown: true });
    expect(presentPublishedHours(weekly, "bad" as DataConfidence).kind).toBe("invalid");
  });

  it("is deterministic, immutable, and JSON-safe across every minute of the day", () => {
    for (let minute = 0; minute < 1440; minute++) {
      const openLocal = `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
      const hours = Object.freeze({ ...weekly, openLocal });
      const result = presentPublishedHours(hours, "official_verified");
      const hour12 = Math.floor(minute / 60) % 12 || 12;
      const suffix = minute < 720 ? "AM" : "PM";
      const minuteText = minute % 60 ? `:${String(minute % 60).padStart(2, "0")}` : "";
      expect(result.scheduleLine.startsWith(`${hour12}${minuteText} ${suffix} – `)).toBe(true);
      expect(result.liveStatus).toBe("unknown");
      expect(JSON.parse(JSON.stringify(result))).toEqual(presentPublishedHours(hours, "official_verified"));
    }
  });
});
