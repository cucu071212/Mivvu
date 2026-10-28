import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { parseIcnApiItems } from "./parse-api-items";

describe("parseIcnApiItems", () => {
  it("returns empty array for null/undefined items", () => {
    assert.deepEqual(parseIcnApiItems(undefined), []);
    assert.deepEqual(parseIcnApiItems(null), []);
  });

  it("parses numeric-key object shape from live API", () => {
    const raw = {
      "0": { sn: "3289", facilitynm: "카페" },
      "1": { sn: "2030", facilitynm: "식당" },
    };
    const list = parseIcnApiItems(raw);
    assert.equal(list.length, 2);
    assert.equal(list[0]?.sn, "3289");
    assert.equal(list[1]?.facilitynm, "식당");
  });

  it("parses item array wrapper when present", () => {
    const raw = { item: [{ sn: "1" }, { sn: "2" }] };
    assert.equal(parseIcnApiItems(raw).length, 2);
  });

  it("parses single item object wrapper", () => {
    const raw = { item: { sn: "99" } };
    assert.deepEqual(parseIcnApiItems(raw), [{ sn: "99" }]);
  });

  it("rejects non-object items container", () => {
    assert.throws(() => parseIcnApiItems("bad"), /unexpected items shape/i);
  });

  it("matches live partial-page shape (28 numeric keys → 28 rows)", () => {
    const raw: Record<string, { sn: string }> = {};
    for (let i = 0; i < 28; i += 1) {
      raw[String(i)] = { sn: String(9000 + i) };
    }
    assert.equal(Object.keys(raw).length, 28);
    assert.equal(parseIcnApiItems(raw).length, 28);
  });
});
