import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  assertCompleteSync,
  findDuplicateSourceIds,
} from "./validate-sync";

describe("validate-sync", () => {
  it("detects duplicate source IDs", () => {
    const dupes = findDuplicateSourceIds(["1", "2", "1", "3", "2"]);
    assert.deepEqual(dupes.sort(), ["1", "2"]);
  });

  it("passes when record count matches api total and IDs are unique", () => {
    assertCompleteSync({
      apiReportedTotalCount: 3,
      records: [{ sourceId: "a" }, { sourceId: "b" }, { sourceId: "c" }],
    });
  });

  it("fails incomplete pagination vs totalCount", () => {
    assert.throws(
      () =>
        assertCompleteSync({
          apiReportedTotalCount: 1175,
          records: [{ sourceId: "1" }],
        }),
      /incomplete sync/i,
    );
  });

  it("allows duplicate sourceId when row count matches totalCount (API sn not unique)", () => {
    assertCompleteSync({
      apiReportedTotalCount: 2,
      records: [{ sourceId: "1" }, { sourceId: "1" }],
    });
  });
});
