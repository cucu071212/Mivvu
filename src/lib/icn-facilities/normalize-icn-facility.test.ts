import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { normalizeIcnFacilityRow } from "./normalize-icn-facility";
import { ICN_AIRPORT_IATA, ICN_FACILITIES_API_OPERATION } from "@/types/icn-facility-browse";

describe("normalizeIcnFacilityRow", () => {
  it("maps a verified live-style dining row (K)", () => {
    const base = normalizeIcnFacilityRow(
      {
        sn: "3289",
        facilitynm: "% 아라비카",
        lcategorynm: "식・음료",
        mcategorynm: "스낵/카페/디저트 ",
        scategorynm: null,
        terminalid: "P03",
        floorinfo: "F3",
        lcnm: "제2여객터미널 3층 면세지역",
        servicetime: "06:00 ~ 22:00",
        lcduty: "Y",
        arrordep: "D",
      },
      "K",
    );

    assert.equal(base.sourceId, "3289");
    assert.equal(base.airportIata, ICN_AIRPORT_IATA);
    assert.equal(base.language, "K");
    assert.equal(base.name, "% 아라비카");
    assert.equal(base.categories.large, "식・음료");
    assert.equal(base.categories.medium, "스낵/카페/디저트");
    assert.equal(base.categories.small, null);
    assert.equal(base.terminalId, "P03");
    assert.equal(base.floor, "F3");
    assert.equal(base.hoursText, "06:00 ~ 22:00");
    assert.equal(base.dutyFreeFlag, "Y");
    assert.equal(base.arrivalOrDeparture, "D");
    assert.equal(base.source.apiOperation, ICN_FACILITIES_API_OPERATION);
  });

  it("preserves unknown terminal and category text without mapping to SFO categories", () => {
    const base = normalizeIcnFacilityRow(
      {
        sn: 42,
        facilitynm: "미분류",
        lcategorynm: "새로운대분류코드",
        terminalid: "X99",
        floorinfo: "B2",
      },
      "K",
    );
    assert.equal(base.sourceId, "42");
    assert.equal(base.categories.large, "새로운대분류코드");
    assert.equal(base.terminalId, "X99");
    assert.equal(base.floor, "B2");
  });

  it("normalizes missing optional fields to null", () => {
    const base = normalizeIcnFacilityRow({ sn: "1", facilitynm: "이름만" }, "E");
    assert.equal(base.locationDescription, null);
    assert.equal(base.hoursText, null);
    assert.equal(base.arrivalOrDeparture, null);
    assert.equal(base.dutyFreeFlag, null);
  });

  it("requires sn and non-empty name", () => {
    assert.throws(() => normalizeIcnFacilityRow({ facilitynm: "x" }, "K"), /missing sn/i);
    assert.throws(() => normalizeIcnFacilityRow({ sn: "1" }, "K"), /missing facility name/i);
  });
});
