import { describe, expect, it } from "vitest";
import {
  applyOverrideField,
  formatPersonalizedMinutesValue,
  parsePersonalizedMinutesInput,
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

describe("formatPersonalizedMinutesValue", () => {
  it("formats zero and omits undefined", () => {
    expect(formatPersonalizedMinutesValue(0)).toBe("0");
    expect(formatPersonalizedMinutesValue(undefined)).toBe("");
  });
});
