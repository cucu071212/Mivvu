import { describe, expect, it } from "vitest";
import { parseStrictInteger, safeIntegerSum } from "@/lib/strict-integer";

describe("parseStrictInteger", () => {
  it("rejects scientific and hex strings", () => {
    expect(parseStrictInteger("1e2", { allowNegative: false })).toBeUndefined();
    expect(parseStrictInteger("0x32", { allowNegative: false })).toBeUndefined();
    expect(parseStrictInteger("50.0", { allowNegative: false })).toBeUndefined();
  });

  it("accepts trimmed decimal strings with signs and leading zeros", () => {
    expect(
      parseStrictInteger(" +01440 ", {
        allowNegative: false,
        max: 1440,
      }),
    ).toBe(1440);
    expect(
      parseStrictInteger(" -1440 ", {
        allowNegative: true,
        min: -1440,
        max: 1440,
      }),
    ).toBe(-1440);
  });
});

describe("safeIntegerSum", () => {
  it("returns null on overflow", () => {
    expect(
      safeIntegerSum([Number.MAX_SAFE_INTEGER, 1]),
    ).toBeNull();
  });
});
