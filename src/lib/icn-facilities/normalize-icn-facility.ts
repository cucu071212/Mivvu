import type {
  IcnApiFacilityRow,
  IcnFacilitiesLanguage,
  IcnFacilityBrowseRecordCore,
} from "../../types/icn-facility-browse";
import {
  ICN_AIRPORT_IATA,
  ICN_FACILITIES_API_OPERATION,
  ICN_FACILITIES_DATASET_ID,
} from "../../types/icn-facility-browse";

function trimOrNull(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function parseArrivalOrDeparture(value: unknown): "A" | "D" | null {
  const text = trimOrNull(value);
  if (text === "A" || text === "D") return text;
  return null;
}

function parseDutyFreeFlag(value: unknown): "Y" | "N" | null {
  const text = trimOrNull(value);
  if (text === "Y" || text === "N") return text;
  return null;
}

export function normalizeIcnFacilityRow(
  row: IcnApiFacilityRow,
  language: IcnFacilitiesLanguage,
): IcnFacilityBrowseRecordCore {
  const sourceIdRaw = row.sn;
  if (sourceIdRaw == null || String(sourceIdRaw).trim() === "") {
    throw new Error("Missing sn on facility row");
  }

  const name = trimOrNull(row.facilitynm);
  if (!name) {
    throw new Error("Missing facility name on facility row");
  }

  return {
    sourceId: String(sourceIdRaw).trim(),
    airportIata: ICN_AIRPORT_IATA,
    language,
    name,
    categories: {
      large: trimOrNull(row.lcategorynm),
      medium: trimOrNull(row.mcategorynm),
      small: trimOrNull(row.scategorynm),
    },
    terminalId: trimOrNull(row.terminalid),
    floor: trimOrNull(row.floorinfo),
    locationDescription: trimOrNull(row.lcnm),
    hoursText: trimOrNull(row.servicetime),
    arrivalOrDeparture: parseArrivalOrDeparture(row.arrordep),
    dutyFreeFlag: parseDutyFreeFlag(row.lcduty),
    source: {
      apiOperation: ICN_FACILITIES_API_OPERATION,
      datasetId: ICN_FACILITIES_DATASET_ID,
    },
  };
}
