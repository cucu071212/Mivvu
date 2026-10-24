import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type {
  ContextValidationErrorCode,
  UserContextInput,
  ValidateContext,
} from "@/types/airport";
import { validateContext } from "./validate-context";

const validate: ValidateContext = validateContext;
const minimal = { gateZone: "D", minutesUntilBoarding: 50 };
const normalized = {
  gateZone: "D", minutesUntilBoarding: 50, bufferMinutes: 10,
  queueAdjustmentMinutes: 0, passengerSecurityArea: "post",
};

function rejected(
  input: UserContextInput,
  field: keyof UserContextInput | "form",
  code: ContextValidationErrorCode,
) {
  const result = validate(input);
  assert.equal(result.context, null);
  assert.ok(result.errors.some((error) => error.field === field && error.code === code));
  assert.ok(result.errors.every((error) => error.message.trim().length > 0));
}

describe("validateContext", () => {
  it("fills only optional defaults and returns a fully normalized context", () => {
    assert.deepEqual(validate(minimal), { context: normalized, errors: [] });
  });

  it("normalizes trimmed gate and numeric strings for boarding-start time and assumptions", () => {
    assert.deepEqual(validate({
      gateZone: " D ", minutesUntilBoarding: " 35 ", bufferMinutes: "15",
      queueAdjustmentMinutes: " -7 ", passengerSecurityArea: "post", category: "food",
    }), { context: {
      gateZone: "D", minutesUntilBoarding: 35, bufferMinutes: 15,
      queueAdjustmentMinutes: -7, passengerSecurityArea: "post", category: "food",
    }, errors: [] });
  });

  for (const value of [undefined, null, "", " \t\n "]) {
    for (const field of ["bufferMinutes", "queueAdjustmentMinutes", "passengerSecurityArea", "category"] as const) {
      it(`uses the permitted absent/blank default for ${field} = ${JSON.stringify(value)}`, () => {
        assert.deepEqual(validate({ ...minimal, [field]: value }), {
          context: normalized, errors: [],
        });
      });
    }
  }

  it("does not replace explicit zero boarding time or buffer with defaults", () => {
    assert.deepEqual(validate({ gateZone: "D", minutesUntilBoarding: 0,
      bufferMinutes: 0, queueAdjustmentMinutes: 0 }), { context: {
      gateZone: "D", minutesUntilBoarding: 0, bufferMinutes: 0,
      queueAdjustmentMinutes: 0, passengerSecurityArea: "post",
    }, errors: [] });
  });

  for (const [value, expected] of [[-7, -7], ["-7", -7], [0, 0], ["0", 0], [7, 7], ["7", 7]] as const) {
    it(`accepts signed integer queue adjustment ${JSON.stringify(value)}`, () => {
      assert.deepEqual(validate({ ...minimal, queueAdjustmentMinutes: value }), {
        context: { ...normalized, queueAdjustmentMinutes: expected },
        errors: [],
      });
    });
  }

  it("requires both gate zone and minutes until boarding rather than inventing defaults", () => {
    const result = validate({});
    assert.equal(result.context, null);
    assert.deepEqual(result.errors.map(({ field, code }) => ({ field, code })), [
      { field: "gateZone", code: "missing_required_field" },
      { field: "minutesUntilBoarding", code: "missing_required_field" },
    ]);
  });
  it("rejects explicitly undefined required values", () => {
    rejected({ ...minimal, gateZone: undefined }, "gateZone", "missing_required_field");
    rejected({ ...minimal, minutesUntilBoarding: undefined }, "minutesUntilBoarding", "missing_required_field");
  });

  for (const gateZone of ["E", "F", "d", "D7", "", "  ", null, false, 0, {}, []]) {
    it(`rejects unsupported gate input ${JSON.stringify(gateZone)}`, () => {
      rejected({ ...minimal, gateZone }, "gateZone", "invalid_gate_zone");
    });
  }

  const invalidNumbers = [NaN, Infinity, -Infinity, 8.5, "8.5", "NaN", "Infinity",
    "abc", "12px", true, false, {}, []];
  for (const [field, code] of [
    ["minutesUntilBoarding", "invalid_minutes_until_boarding"],
    ["bufferMinutes", "invalid_buffer_minutes"],
    ["queueAdjustmentMinutes", "invalid_queue_adjustment"],
  ] as const) {
    for (const [index, value] of invalidNumbers.entries()) {
      it(`rejects invalid ${field} input #${index}`, () => {
        rejected({ ...minimal, [field]: value }, field, code);
      });
    }
  }
  for (const value of [null, "", " \t "]) {
    it(`rejects blank required boarding time ${JSON.stringify(value)}`, () => {
      rejected({ ...minimal, minutesUntilBoarding: value }, "minutesUntilBoarding", "invalid_minutes_until_boarding");
    });
  }
  for (const value of [-1, "-1"]) {
    it(`rejects negative boarding time ${JSON.stringify(value)}`, () => {
      rejected({ ...minimal, minutesUntilBoarding: value }, "minutesUntilBoarding", "invalid_minutes_until_boarding");
    });
    it(`rejects negative buffer ${JSON.stringify(value)}`, () => {
      rejected({ ...minimal, bufferMinutes: value }, "bufferMinutes", "invalid_buffer_minutes");
    });
  }

  for (const category of ["food", "coffee", "restroom", "charging", "shop"] as const) {
    it(`preserves supported category ${category}`, () => {
      assert.deepEqual(validate({ ...minimal, category }), {
        context: { ...normalized, category }, errors: [],
      });
    });
  }
  for (const category of ["lounge", "FOOD", " food ", false, 42, {}, []]) {
    it(`rejects invalid nonblank category ${JSON.stringify(category)}`, () => {
      rejected({ ...minimal, category }, "category", "invalid_category");
    });
  }
  for (const passengerSecurityArea of ["pre", "both", "unknown", "POST", " post ", false, 42, {}, []]) {
    it(`does not upgrade invalid passenger security input ${JSON.stringify(passengerSecurityArea)}`, () => {
      rejected({ ...minimal, passengerSecurityArea }, "passengerSecurityArea", "invalid_passenger_security_area");
    });
  }

  for (const input of [null, undefined, "D", 42, false, []]) {
    it(`returns a form error instead of throwing for malformed runtime context ${JSON.stringify(input)}`, () => {
      rejected(input as unknown as UserContextInput, "form", "missing_required_field");
    });
  }

  it("returns null context whenever any one field is invalid, despite valid optional defaults", () => {
    const result = validate({ ...minimal, category: "lounge" });
    assert.equal(result.context, null);
    assert.deepEqual(result.errors.map(({ field, code }) => ({ field, code })), [
      { field: "category", code: "invalid_category" },
    ]);
  });
  it("reports every invalid field without returning a partially normalized context", () => {
    const result = validate({ gateZone: "E", minutesUntilBoarding: "",
      bufferMinutes: -1, category: "lounge", queueAdjustmentMinutes: 1.5,
      passengerSecurityArea: "pre" });
    assert.equal(result.context, null);
    assert.deepEqual(result.errors.map(({ field, code }) => ({ field, code })), [
      { field: "gateZone", code: "invalid_gate_zone" },
      { field: "minutesUntilBoarding", code: "invalid_minutes_until_boarding" },
      { field: "bufferMinutes", code: "invalid_buffer_minutes" },
      { field: "category", code: "invalid_category" },
      { field: "queueAdjustmentMinutes", code: "invalid_queue_adjustment" },
      { field: "passengerSecurityArea", code: "invalid_passenger_security_area" },
    ]);
  });

  it("does not mutate frozen input and returns deterministic fresh contexts", () => {
    const input = Object.freeze({ gateZone: " D ", minutesUntilBoarding: "50" });
    const result = validate(input);
    assert.deepEqual(result, { context: normalized, errors: [] });
    assert.deepEqual(input, { gateZone: " D ", minutesUntilBoarding: "50" });
    assert.deepEqual(validate(input), result);
    assert.notEqual(validate(input).context, result.context);
    assert.ok(result.context && !Object.hasOwn(result.context, "category"));
  });
});
