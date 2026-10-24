import { describe, expect, it } from "vitest";
import {
  applyOverrideField,
  formatPersonalizedMinutesValue,
  parsePersonalizedMinutesInput,
  personalizationDraftsAreValid,
} from "./PersonalizedTimeControls";

describe("parsePersonalizedMinutesInput", () => {
  it("treats blank as empty override", () => {
    expect(parsePersonalizedMinutesInput("")).toEqual({ kind: "empty" });
    expect(parsePersonalizedMinutesInput("   ")).toEqual({ kind: "empty" });
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
