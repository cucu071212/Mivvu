import { describe, expect, it } from "vitest";
import {
  applyOverrideField,
  filterPersonalizationFacilities,
  formatPersonalizedMinutesValue,
  parsePersonalizedMinutesInput,
  personalizationDraftsAreValid,
} from "./PersonalizedTimeControls";

describe("parsePersonalizedMinutesInput", () => {
  it("treats blank as empty override", () => {
    expect(parsePersonalizedMinutesInput("")).toEqual({ kind: "empty" });
    expect(parsePersonalizedMinutesInput("   ")).toEqual({ kind: "empty" });
  });

  it("shows no focused rows when search is blank and no overrides exist", () => {
    const facilities = [
      { id: "a", name: "Alpha Cafe", category: "coffee" as const },
    ];
    expect(
      filterPersonalizationFacilities(facilities, {
        search: "",
        overrides: {},
        fieldErrors: {},
        drafts: {},
        showAll: false,
      }),
    ).toEqual([]);
  });

  it("filters personalization rows by search and overrides", () => {
    const facilities = [
      { id: "a", name: "Alpha Cafe", category: "coffee" as const },
      { id: "b", name: "Beta Shop", category: "shop" as const },
    ];
    expect(
      filterPersonalizationFacilities(facilities, {
        search: "alpha",
        overrides: {},
        fieldErrors: {},
        drafts: {},
        showAll: false,
      }).map((f) => f.id),
    ).toEqual(["a"]);
    expect(
      filterPersonalizationFacilities(facilities, {
        search: "",
        overrides: { b: { facilityId: "b", queueMinutes: 5 } },
        fieldErrors: {},
        drafts: {},
        showAll: false,
      }).map((f) => f.id),
    ).toEqual(["b"]);
  });

  it("shares the 0–1440 range with validateDurationOverrides", () => {
    expect(parsePersonalizedMinutesInput("1440")).toEqual({
      kind: "value",
      value: 1440,
    });
    expect(parsePersonalizedMinutesInput("1441")).toMatchObject({
      kind: "error",
    });
  });

  it("accepts explicit zero", () => {
    expect(parsePersonalizedMinutesInput("0")).toEqual({
      kind: "value",
      value: 0,
    });
  });

  it("accepts positive integers", () => {
    expect(parsePersonalizedMinutesInput("12")).toEqual({
      kind: "value",
      value: 12,
    });
  });

  it("rejects negative and fractional input", () => {
    expect(parsePersonalizedMinutesInput("-1").kind).toBe("error");
    expect(parsePersonalizedMinutesInput("3.5").kind).toBe("error");
    expect(parsePersonalizedMinutesInput("1e2").kind).toBe("error");
  });
});

describe("applyOverrideField", () => {
  it("sets queue only and leaves activity unset", () => {
    const next = applyOverrideField(
      {},
      "brookstone",
      "queueMinutes",
      { kind: "value", value: 5 },
    );
    expect(next).toEqual({
      brookstone: { facilityId: "brookstone", queueMinutes: 5 },
    });
  });

  it("removes facility entry when both fields cleared", () => {
    const start = {
      brookstone: {
        facilityId: "brookstone",
        queueMinutes: 5,
      },
    };
    const next = applyOverrideField(
      start,
      "brookstone",
      "queueMinutes",
      { kind: "empty" },
    );
    expect(next).toEqual({});
  });
});

describe("personalizationDraftsAreValid", () => {
  it("blocks recommendations when any field error exists", () => {
    expect(personalizationDraftsAreValid({})).toBe(true);
    expect(
      personalizationDraftsAreValid({
        "sfo-t2-d-brookstone:queue": "bad",
      }),
    ).toBe(false);
  });
});

describe("applyOverrideField on invalid parse", () => {
  it("does not mutate the override map", () => {
    const map = {
      cafe: { facilityId: "cafe", queueMinutes: 5 },
    };
    const next = applyOverrideField(map, "cafe", "queueMinutes", {
      kind: "error",
      message: "nope",
    });
    expect(next).toEqual(map);
  });
});

describe("formatPersonalizedMinutesValue", () => {
  it("formats zero and omits undefined", () => {
    expect(formatPersonalizedMinutesValue(0)).toBe("0");
    expect(formatPersonalizedMinutesValue(undefined)).toBe("");
  });
});
