import type {
  DataConfidence,
  RecommendationStatus,
  ResolvedFacilityDurations,
  UnknownReason,
} from "@/types/airport";

/** Exactly two distinct facility IDs selected for two-stop planning. */
export type TwoStopSelection = readonly [string, string];

/**
 * Travel policy for legacy D-Gates demo planning.
 * - strict: gate↔facility uses matrix; inter-facility leg is Unknown.
 * - demo_legacy_d: P-E-LEG-001 — reuse D→D demo minutes for all three legs.
 */
export type TwoStopTravelPolicy = "strict" | "demo_legacy_d";

export type TwoStopTravelLegKind =
  | "gate_to_stop"
  | "stop_to_stop"
  | "stop_to_gate";

export type TwoStopTravelLeg = {
  kind: TwoStopTravelLegKind;
  fromFacilityId: string | "gate";
  toFacilityId: string | "gate";
  minutes: number | null;
  timeConfidence: DataConfidence;
  provenanceNote: string;
  /** True when this leg uses the synthetic D→D demo assumption (including P-E-LEG-001). */
  isDemoTravelAssumption: boolean;
};

export type TwoStopVisitStop = {
  facilityId: string;
  facilityName: string;
  queueMinutes: number | null;
  activityMinutes: number | null;
  queueSource: ResolvedFacilityDurations["queueSource"];
  activitySource: ResolvedFacilityDurations["activitySource"];
};

export type TwoStopOrderLedger = {
  /** Ordered visit sequence [first stop, second stop]. */
  order: TwoStopSelection;
  legs: readonly [TwoStopTravelLeg, TwoStopTravelLeg, TwoStopTravelLeg];
  stops: readonly [TwoStopVisitStop, TwoStopVisitStop];
  bufferMinutes: number;
  requiredMinutes: number | null;
  marginMinutes: number | null;
};

export type TwoStopIneligibilityReason =
  | "duplicate_selection"
  | "outside_recommend_eligibility"
  | "outside_supported_zone"
  | "passenger_not_airside"
  | "security_zone_unknown"
  | "security_zone_pre_only"
  | "unknown_facility_id";

export type TwoStopOrderResult =
  | {
      kind: "feasibility";
      status: Exclude<
        RecommendationStatus,
        "unknown"
      >;
      ledger: TwoStopOrderLedger & {
        requiredMinutes: number;
        marginMinutes: number;
      };
    }
  | {
      kind: "unknown";
      unknownReason: UnknownReason;
      ledger: TwoStopOrderLedger;
    }
  | {
      kind: "ineligible";
      reason: TwoStopIneligibilityReason;
    };

export type TwoStopPairEvaluation = {
  /** Canonical sorted pair key (stable JSON order). */
  facilityIds: TwoStopSelection;
  orderAB: TwoStopOrderResult;
  orderBA: TwoStopOrderResult;
  bestModeledOrder: "AB" | "BA" | null;
  travelMode: "legacy_zone";
  travelPolicy: TwoStopTravelPolicy;
  /** True when any leg used demo_legacy_d / P-E-LEG-001 synthetic travel. */
  usesDemoTravelAssumption: boolean;
  modelDisclaimer: string;
};
