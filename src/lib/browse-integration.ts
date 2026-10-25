import type {
  Facility,
  FacilityCategory,
  FacilityFilterQuery,
  FacilityValidationError,
  TerminalCode,
  UserContextInput,
  Zone,
} from "@/types/airport";
import { validateFacilities } from "@/lib/validate-facilities";

export function prepareProductionFacilities(raw: unknown): {
  facilities: Facility[];
  datasetErrors: FacilityValidationError[];
} {
  const result = validateFacilities(raw);
  return {
    facilities: result.facilities,
    datasetErrors: result.errors,
  };
}

export function buildFlightContextInput(
  minutesUntilBoarding: string,
  bufferMinutes: string,
): UserContextInput {
  return {
    gateZone: "D",
    minutesUntilBoarding,
    bufferMinutes,
  };
}

export function buildFacilityFilterQuery(
  text: string,
  category: FacilityCategory | "",
  terminalCode: TerminalCode | "" = "",
  boardingArea: Zone | "" = "",
): FacilityFilterQuery {
  const trimmed = text.trim();
  return {
    ...(trimmed ? { text: trimmed } : {}),
    ...(category ? { category } : {}),
    ...(terminalCode ? { terminalCode } : {}),
    ...(boardingArea ? { zone: boardingArea } : {}),
  };
}
