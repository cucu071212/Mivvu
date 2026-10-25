import type { Facility } from "@/types/airport";

/** Normalized location defaults for legacy T2 D Gates production rows (GW-X-001). */
export const PRODUCTION_T2_D_FACILITY_LOCATION: Pick<
  Facility,
  | "airportIata"
  | "terminalCode"
  | "boardingAreaCode"
  | "browseEligible"
  | "recommendEligible"
> = {
  airportIata: "SFO",
  terminalCode: "terminal_2",
  boardingAreaCode: "D",
  browseEligible: true,
  recommendEligible: true,
};

/** GW-012 illustrative fixtures only — not valid production `validateFacilities` rows. */
export const ILLUSTRATIVE_T3_E_FACILITY_LOCATION: Pick<
  Facility,
  | "airportIata"
  | "terminalCode"
  | "boardingAreaCode"
  | "browseEligible"
  | "recommendEligible"
> = {
  airportIata: "SFO",
  terminalCode: "terminal_3",
  boardingAreaCode: "E",
  browseEligible: true,
  recommendEligible: true,
};

/** GW-012 illustrative fixtures only — not valid production `validateFacilities` rows. */
export const ILLUSTRATIVE_T3_F_FACILITY_LOCATION: Pick<
  Facility,
  | "airportIata"
  | "terminalCode"
  | "boardingAreaCode"
  | "browseEligible"
  | "recommendEligible"
> = {
  airportIata: "SFO",
  terminalCode: "terminal_3",
  boardingAreaCode: "F",
  browseEligible: true,
  recommendEligible: true,
};
