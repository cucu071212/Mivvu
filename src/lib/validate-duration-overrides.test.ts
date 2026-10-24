import { describe, expect, it } from "vitest";
import { validateDurationOverrides } from "./validate-duration-overrides";

const ids = ["cafe", "shop"] as const;
const fields = ["queueMinutes", "activityMinutes"] as const;

describe("validateDurationOverrides", () => {
  it.each([
    { queueMinutes: 5 }, { activityMinutes: 7 },
    { queueMinutes: 0, activityMinutes: 7 },
  ])("accepts independent numeric overrides %j", (minutes) => {
    const entry = { facilityId: "cafe", ...minutes };
    expect(validateDurationOverrides({ cafe: entry }, ids)).toEqual({
      overrides: { cafe: entry }, errors: [],
    });
  });

  it("accepts an empty map as no overrides", () => {
    expect(validateDurationOverrides({}, ids)).toEqual({ overrides: {}, errors: [] });
  });

  it.each([undefined, null, [], [{ facilityId: "cafe", queueMinutes: 2 }], "", 3, true, new Date()])(
    "rejects malformed top-level input %j", (input) => {
      expect(validateDurationOverrides(input, ids)).toEqual({ overrides: {}, errors:
        fields.map((field) => ({ facilityId: "", field, code: "invalid_input" })),
      });
    },
  );

  for (const field of fields) {
    it.each([-1, 2.5, NaN, Infinity, -Infinity, "", " ", "5", "5px", null, undefined, true, {}, []])(
      `rejects invalid ${field} %j without retaining a partial entry`, (value) => {
        const other = field === "queueMinutes" ? "activityMinutes" : "queueMinutes";
        expect(validateDurationOverrides({ cafe: {
          facilityId: "cafe", [field]: value, [other]: 4,
        } }, ids)).toEqual({ overrides: {}, errors: [
          { facilityId: "cafe", field, code: "invalid_minutes" },
        ] });
      },
    );
  }

  it.each([
    ["ghost", { facilityId: "ghost", queueMinutes: 3 }, "unknown_facility_id"],
    ["cafe", { facilityId: "shop", queueMinutes: 3 }, "facility_id_mismatch"],
    ["cafe", { queueMinutes: 3 }, "facility_id_mismatch"],
    ["cafe", null, "invalid_override"],
    ["cafe", [], "invalid_override"],
    ["cafe", { facilityId: "cafe" }, "missing_duration"],
  ])("rejects invalid entry %s %j", (id, entry, code) => {
    expect(validateDurationOverrides({ [id]: entry }, ids)).toEqual({ overrides: {},
      errors: fields.map((field) => ({ facilityId: id, field, code })),
    });
  });

  it("copies accepted fields, ignores unrelated properties, and preserves frozen input", () => {
    const entry = Object.freeze({ facilityId: "cafe", queueMinutes: 0, extra: "ignored" });
    const input = Object.freeze({ cafe: entry, shop: Object.freeze({ facilityId: "shop", activityMinutes: 6 }) });
    const result = validateDurationOverrides(input, Object.freeze([...ids]));
    expect(result).toEqual({ overrides: {
      cafe: { facilityId: "cafe", queueMinutes: 0 },
      shop: { facilityId: "shop", activityMinutes: 6 },
    }, errors: [] });
    expect(result.overrides.cafe).not.toBe(entry);
    expect(input.cafe).toEqual(entry);
  });

  it("retains valid facilities when a different facility fails", () => {
    const result = validateDurationOverrides({
      cafe: { facilityId: "cafe", queueMinutes: -1 },
      shop: { facilityId: "shop", activityMinutes: 6 },
    }, ids);
    expect(result.overrides).toEqual({ shop: { facilityId: "shop", activityMinutes: 6 } });
    expect(result.errors).toEqual([{ facilityId: "cafe", field: "queueMinutes", code: "invalid_minutes" }]);
  });

  it("ignores inherited entries and handles prototype-like IDs as ordinary own keys", () => {
    const input = JSON.parse('{"__proto__":{"facilityId":"__proto__","queueMinutes":0}}');
    const result = validateDurationOverrides(input, ["__proto__"]);
    expect(Object.keys(result.overrides)).toEqual(["__proto__"]);
    expect(result.overrides["__proto__"]).toEqual({ facilityId: "__proto__", queueMinutes: 0 });
    expect(Object.getPrototypeOf(result.overrides)).toBe(Object.prototype);
  });
});
