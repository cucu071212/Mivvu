import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { icnFixtureOutputPath } from "./icn-fixture-paths";

describe("icnFixtureOutputPath", () => {
  it("maps language to separate fixture files", () => {
    assert.match(icnFixtureOutputPath("K"), /icn-facilities-ko\.json$/);
    assert.match(icnFixtureOutputPath("E"), /icn-facilities-en\.json$/);
  });
});
