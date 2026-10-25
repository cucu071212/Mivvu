import type {
  DataConfidence,
  ProductionTravelEdgeMetadataMatrix,
  ProductionTravelMatrix,
  ProductionTravelMode,
  ProductionTravelProvenanceRef,
} from "@/types/airport";
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

/** Active production travel mode until a separately authorized graph pilot ships. */
export const productionLegacyTravelMode: ProductionTravelMode = {
  kind: "legacy_zone",
  gateZone: "D",
  modelId: "legacy-d-demo-v1",
};

const productionTravelProvenanceRefs: readonly ProductionTravelProvenanceRef[] =
  [
    {
      kind: "policy_doc",
      path: "docs/walking-time-policy.md",
      note:
        "GW-B-R001 — no verified SFO-wide routing dataset; legacy D matrix stays demo_estimate.",
    },
    {
      kind: "plan_section",
      section: "PLAN.md §3",
      note:
        "Same-zone representative minutes per directed leg; not gate-to-gate survey data.",
    },
  ];

const productionDDirectedEdgeNote =
  "Outbound (gate area → facility vicinity) and return (facility → gate area) each charge this directed D→D leg separately in the time model, even when both legs use the same demo minute value today.";

export const productionTravelEdgeMetadata: ProductionTravelEdgeMetadataMatrix =
  {
    D: {
      D: {
        fromZone: "D",
        toZone: "D",
        minutes: PRODUCTION_D_TO_D_DEMO_MINUTES_PER_LEG,
        timeConfidence: productionTravelMatrixTimeConfidence,
        directed: true,
        reverseMinutes: PRODUCTION_D_TO_D_DEMO_MINUTES_PER_LEG,
        asymmetryNote: productionDDirectedEdgeNote,
        provenanceRefs: productionTravelProvenanceRefs,
      },
    },
  };

export type ProductionTravelMatrixMetadata = {
  airportIata: typeof SUPPORTED_AIRPORT_IATA;
  terminalLabel: typeof SUPPORTED_TERMINAL_LABEL;
  boardingAreaLabel: typeof SUPPORTED_BOARDING_AREA_LABEL;
  travelMode: ProductionTravelMode;
  timeConfidence: DataConfidence;
  disclaimer: string;
  /**
   * Explains PLAN §3 same-zone rule: matrix D→D is a representative
   * between-location estimate inside D Gates, used for outbound and return
   * when gate and facility share zone `D`.
   */
  sameZoneLegNote: string;
  edgeMetadataVersion: "gw-b-002-v1";
};

export const productionTravelMatrixMetadata: ProductionTravelMatrixMetadata = {
  airportIata: SUPPORTED_AIRPORT_IATA,
  terminalLabel: SUPPORTED_TERMINAL_LABEL,
  boardingAreaLabel: SUPPORTED_BOARDING_AREA_LABEL,
  travelMode: productionLegacyTravelMode,
  timeConfidence: productionTravelMatrixTimeConfidence,
  disclaimer:
    "Zone travel minutes are unverified demo estimates for the GateWise time model (legacy_zone / legacy-d-demo-v1). They are not official SFO walking measurements, map-grid derivations, or guarantees that you will reach a facility before boarding starts.",
  sameZoneLegNote:
    "D→D = 3 minutes per directed leg models typical between-location movement within D Gates (e.g. gate area to Retail Street). Outbound and return each use this edge separately when both ends are zone D.",
  edgeMetadataVersion: "gw-b-002-v1",
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
