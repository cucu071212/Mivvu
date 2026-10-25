import assert from "node:assert/strict";
import { describe, it } from "vitest";
import rawFacilities from "@/data/facilities.json";
import { validateFacilities } from "./validate-facilities";
import { facilityPublishedHoursPresentation } from "./facility-hours-label";

describe("facilityPublishedHoursPresentation (GW-C-002)", () => {
  it("preserves AG1 and Vino Volo verbatim raw listing hours", () => {
    const { facilities } = validateFacilities(rawFacilities);
    const ag1 = facilities.find((row) => row.id === "sfo-t3-e-ag1")!;
    const vino = facilities.find((row) => row.id === "sfo-t2-d-vino-volo")!;
    assert.equal(
      facilityPublishedHoursPresentation(ag1).scheduleLine,
      "Sunday - Saturday Open 24 hours",
    );
    assert.equal(
      facilityPublishedHoursPresentation(vino).scheduleLine,
      "Sunday- Friday 9:00 am-9:00 pm Saturday 9:00 am-7:00 pm",
    );
  });
});
