import { describe, expect, it } from "vitest";
import {
  MIVVU_ENTRY_PATH,
  MIVVU_ICN_BROWSE_PATH,
  MIVVU_PREVIEW_ENTRY_PATH,
  MIVVU_PREVIEW_ICN_BROWSE_PATH,
} from "./mivvu-entry-routes";

describe("mivvu entry routes", () => {
  it("uses root and /icn as canonical integrated paths", () => {
    expect(MIVVU_ENTRY_PATH).toBe("/");
    expect(MIVVU_ICN_BROWSE_PATH).toBe("/icn");
  });

  it("keeps preview paths distinct for redirects", () => {
    expect(MIVVU_PREVIEW_ENTRY_PATH).toBe("/preview/mivvu-entry");
    expect(MIVVU_PREVIEW_ICN_BROWSE_PATH).toBe("/preview/mivvu-entry/icn");
  });
});
