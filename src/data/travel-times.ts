import type { DataConfidence, ProductionTravelMatrix } from "@/types/airport";
import {
  SUPPORTED_AIRPORT_IATA,
  SUPPORTED_BOARDING_AREA_LABEL,
  SUPPORTED_TERMINAL_LABEL,
} from "@/types/airport";

/**
 * Directed leg minutes for D→D within Terminal 2 D Gates.
 * Demo assumption only — not a verified walk time (see metadata below).
 */
export const PRODUCTION_D_TO_D_DEMO_MINUTES_PER_LEG = 3;

/** Confidence label for every value in {@link productionTravelMinutes}. */
export const productionTravelMatrixTimeConfidence: DataConfidence =
  "demo_estimate";

export type ProductionTravelMatrixMetadata = {
  airportIata: typeof SUPPORTED_AIRPORT_IATA;
  terminalLabel: typeof SUPPORTED_TERMINAL_LABEL;
  boardingAreaLabel: typeof SUPPORTED_BOARDING_AREA_LABEL;
  timeConfidence: DataConfidence;
  disclaimer: string;
  /**
   * Explains PLAN §3 same-zone rule: matrix D→D is a representative
   * between-location estimate inside D Gates, used for outbound and return
   * when gate and facility share zone `D`.
   */
  sameZoneLegNote: string;
};

export const productionTravelMatrixMetadata: ProductionTravelMatrixMetadata = {
  airportIata: SUPPORTED_AIRPORT_IATA,
  terminalLabel: SUPPORTED_TERMINAL_LABEL,
  boardingAreaLabel: SUPPORTED_BOARDING_AREA_LABEL,
  timeConfidence: productionTravelMatrixTimeConfidence,
  disclaimer:
    "Zone travel minutes are unverified demo estimates for the GateWise time model. They are not official SFO walking measurements and do not guarantee you will reach a facility before boarding.",
  sameZoneLegNote:
    "D→D = 3 minutes per directed leg models typical between-location movement within D Gates (e.g. gate area to Retail Street). Outbound and return each use this edge separately when both ends are zone D.",
};

/**
 * Production directed travel matrix (1×1). Keys are production {@link Zone} values only.
 * Illustrative multi-zone matrices for GW-012 regression belong in test fixtures, not here.
 */
export const productionTravelMinutes: ProductionTravelMatrix = {
  D: {
    D: PRODUCTION_D_TO_D_DEMO_MINUTES_PER_LEG,
  },
};
