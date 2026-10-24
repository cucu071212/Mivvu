import type {
  Facility,
  FacilityCategory,
  FacilityFilterQuery,
  FacilityValidationError,
  UserContextInput,
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
): FacilityFilterQuery {
  const trimmed = text.trim();
  return {
    ...(trimmed ? { text: trimmed } : {}),
    ...(category ? { category } : {}),
  };
}
