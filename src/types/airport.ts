/**
 * GateWise shared contracts (GW-001 freeze).
 *
 * Production scope: SFO Terminal 2, D Gates only (`Zone = 'D'`).
 * Walking, queue, and activity times are never verified here unless a record
 * explicitly carries `demo_estimate` confidence; otherwise use `null`.
 *
 * `minutesUntilBoarding` is minutes until **boarding starts**, not gate closure.
 *
 * Same-zone rule (PLAN §3): for production, `travelTimes['D']['D']` is a single
 * representative between-location estimate within D Gates (demo), applied for
 * outbound and return legs when gate and facility share zone `D`. It is not a
 * measured walk and does not encode gate-to-gate distance.
 *
 * Illustrative multi-zone types (`IllustrativeZone`, `IllustrativeTravelMatrix`)
 * exist only for GW-012 synthetic regression fixtures (e.g. 42-minute arithmetic).
 * They must not be used as official Terminal 2 zones or relabeled as verified SFO walks.
 */

// ---------------------------------------------------------------------------
// Supported airport scope (official labels; not a facility record)
// ---------------------------------------------------------------------------

/** IATA airport code for the supported MVP airport. */
export const SUPPORTED_AIRPORT_IATA = "SFO";

/** Human-readable terminal label backed by GW-003 provenance. */
export const SUPPORTED_TERMINAL_LABEL = "Terminal 2";

/** Official boarding / gate area for the MVP (`Zone` maps to this area). */
export const SUPPORTED_BOARDING_AREA_LABEL = "D Gates";

/** All production boarding zones in scope (Terminal 2 D Gates only). */
export const PRODUCTION_ZONES: readonly Zone[] = ["D"];

// ---------------------------------------------------------------------------
// Zones and illustrative regression-only zones
// ---------------------------------------------------------------------------

/**
 * Production boarding zone for SFO Terminal 2.
 * E and F are Terminal 3 gate areas and are not in scope.
 */
export type Zone = "D";

/**
 * Synthetic multi-zone keys for unit-test fixtures only (GW-012).
 * Not valid production `Facility.zone` or Terminal 2 official zones.
 */
export type IllustrativeZone = "D" | "E" | "F";

// ---------------------------------------------------------------------------
// Confidence, categories, security
// ---------------------------------------------------------------------------

export type DataConfidence =
  | "official_verified"
  | "third_party"
  | "demo_estimate"
  | "unknown";

export type FacilityCategory =
  | "food"
  | "coffee"
  | "restroom"
  | "charging"
  | "shop";

/**
 * Security side of a facility relative to the checkpoint.
 * `unknown` must not be treated as post-security eligible.
 */
export type SecurityZone = "pre" | "post" | "both" | "unknown";

/**
 * MVP passenger context: recommendations assume the traveler is already airside.
 * Pre-security browsing is out of P0 scope.
 */
export type PassengerSecurityArea = "post";

/**
 * Gate numbers cited on official SFO facility listings (landmarks only).
 * Not a `Zone` and not used as travel-matrix keys.
 */
export type GateLandmark = "D1" | "D4" | "D7" | "D9" | "D15" | "D16";

// ---------------------------------------------------------------------------
// Travel matrices (minutes; directed edges; null = unknown / not modeled)
// ---------------------------------------------------------------------------

/** Directed travel times between production zones (currently 1×1: D→D only). */
export type ProductionTravelMatrix = Record<Zone, Record<Zone, number | null>>;

/**
 * Directed travel times for GW-012 illustrative regression fixtures only.
 * Example: PLAN §5 hero arithmetic uses cross-zone legs that are not verified T2 walks.
 */
export type IllustrativeTravelMatrix = Record<
  IllustrativeZone,
  Record<IllustrativeZone, number | null>
>;

/** @deprecated Use `ProductionTravelMatrix` in application code. */
export type TravelMatrix = ProductionTravelMatrix;

// ---------------------------------------------------------------------------
// Facilities
// ---------------------------------------------------------------------------

export type Facility = {
  /** Stable unique id (slug or uuid); assigned at dataset authoring time. */
  id: string;
  name: string;
  /** Coarse boarding area; production records use `'D'` only. */
  zone: Zone;
  category: FacilityCategory;
  securityZone: SecurityZone;
  /**
   * Queue / wait time in minutes, or `null` if unknown.
   * Never coerce `null` to `0` for calculations.
   */
  waitMinutes: number | null;
  /**
   * Typical visit / service time in minutes, or `null` if unknown.
   * Never coerce `null` to `0` for calculations.
   */
  activityMinutes: number | null;
  /** Official listing URL when location/name facts are sourced. */
  sourceUrl?: string;
  /** ISO date (YYYY-MM-DD) when source fields were last checked. */
  lastCheckedAt?: string;
  /** Confidence for name, terminal, zone, and location description fields. */
  locationConfidence: DataConfidence;
  /** Confidence for wait/activity/time-related fields. */
  timeConfidence: DataConfidence;
  /**
   * Free-text location from the official listing (e.g. "Retail Street").
   * Not a substitute for `zone`.
   */
  locationDescription?: string;
  /**
   * Nearest published gate landmark when the source names one.
   * Omitted or `null` when not stated (e.g. some Retail Street entries).
   */
  nearestGateLandmark?: GateLandmark | null;
};

// ---------------------------------------------------------------------------
// User / boarding context
// ---------------------------------------------------------------------------

export type UserContext = {
  /** Gate area where the passenger is waiting (production: `'D'`). */
  gateZone: Zone;
  /**
   * Minutes until boarding **starts** (integer ≥ 0 after validation).
   */
  minutesUntilBoarding: number;
  /**
   * Safety buffer included in required minutes (integer ≥ 0).
   * Default at validation: {@link DEFAULT_BUFFER_MINUTES}.
   */
  bufferMinutes: number;
  /** Optional filter for category-focused views; does not change time math. */
  category?: FacilityCategory;
  /**
   * What-if delta added to each facility's `waitMinutes` (integer).
   * Default at validation: {@link DEFAULT_QUEUE_ADJUSTMENT_MINUTES}.
   */
  queueAdjustmentMinutes?: number;
  /**
   * MVP assumes post-security recommendations only.
   * Default at validation: `'post'`.
   */
  passengerSecurityArea?: PassengerSecurityArea;
};

/** Default `bufferMinutes` applied by `validateContext` when omitted. */
export const DEFAULT_BUFFER_MINUTES = 10;

/** Default `queueAdjustmentMinutes` applied by `validateContext` when omitted. */
export const DEFAULT_QUEUE_ADJUSTMENT_MINUTES = 0;

// ---------------------------------------------------------------------------
// Recommendation outcomes
// ---------------------------------------------------------------------------

export type RecommendationStatus =
  | "feasible_in_model"
  | "tight_in_model"
  | "over_budget"
  | "unknown";

/**
 * Policy exclusion (security, scope, etc.).
 * Distinct from `RecommendationStatus.unknown`, which applies when the facility
 * is otherwise eligible but required time inputs are missing.
 */
export type IneligibilityReason =
  | "security_zone_unknown"
  | "security_zone_pre_only"
  | "passenger_not_airside"
  | "outside_supported_zone";

/**
 * Why an eligible facility could not receive a numeric feasibility status.
 */
export type UnknownReason =
  | "missing_travel_outbound"
  | "missing_travel_return"
  | "missing_queue_estimate"
  | "missing_activity_estimate";

export type RecommendationTimeBreakdown = {
  /** Outbound leg minutes, or `null` if unknown. */
  outboundMinutes: number | null;
  /** Return leg minutes, or `null` if unknown. */
  returnMinutes: number | null;
  /** Queue minutes used in the model (`max(0, wait + adjustment)`), or `null`. */
  queueMinutes: number | null;
  /** Activity minutes, or `null` if unknown. */
  activityMinutes: number | null;
  /** Buffer from context (always a number when breakdown is present). */
  bufferMinutes: number;
  /** Sum of known legs + queue + activity + buffer, or `null` if any required part is unknown. */
  requiredMinutes: number | null;
  /** `minutesUntilBoarding - requiredMinutes`, or `null` if requiredMinutes is unknown. */
  marginMinutes: number | null;
};

export type Recommendation = {
  facilityId: string;
  facilityName: string;
  /**
   * Facility zone echoed from input. Production results use `'D'` only;
   * illustrative regression may use `IllustrativeZone`.
   */
  zone: Zone | IllustrativeZone;
  category: FacilityCategory;
  locationConfidence: DataConfidence;
  timeConfidence: DataConfidence;
  securityZone: SecurityZone;
  /**
   * `false` when excluded by policy (e.g. security side not post-eligible).
   * When `false`, do not present as a ranked feasible option.
   */
  eligible: boolean;
  /** Set when `eligible` is `false` (policy). */
  ineligibilityReason?: IneligibilityReason;
  /**
   * Feasibility status when `eligible` is `true`.
   * When `eligible` is `false`, must be `null`.
   */
  status: RecommendationStatus | null;
  /** Set when `eligible` is `true` and `status` is `unknown`. */
  unknownReason?: UnknownReason;
  /** Populated when `eligible` is `true` and status is not blocked by missing inputs. */
  breakdown?: RecommendationTimeBreakdown;
};

// ---------------------------------------------------------------------------
// Filtering (GW-006) — pure list operations; no security reclassification
// ---------------------------------------------------------------------------

export type FacilityFilterQuery = {
  /** Case-insensitive substring match on facility name; omit for no text filter. */
  text?: string;
  category?: FacilityCategory;
  zone?: Zone;
};

// ---------------------------------------------------------------------------
// Validation — facilities (GW-007)
// ---------------------------------------------------------------------------

export type FacilityValidationErrorCode =
  | "invalid_shape"
  | "missing_required_field"
  | "invalid_zone"
  | "invalid_category"
  | "invalid_security_zone"
  | "invalid_confidence"
  | "invalid_id"
  | "invalid_url"
  | "invalid_date"
  | "invalid_minutes_field"
  | "duplicate_id";

export type FacilityValidationError = {
  /** JSON path or index (e.g. `[3].securityZone`). */
  path: string;
  code: FacilityValidationErrorCode;
  message: string;
};

export type ValidateFacilitiesResult = {
  /** Successfully normalized facilities (may be empty). */
  facilities: Facility[];
  /** Non-fatal and fatal issues; callers must not silently ignore errors. */
  errors: FacilityValidationError[];
};

// ---------------------------------------------------------------------------
// Validation — user context (GW-008)
// ---------------------------------------------------------------------------

/** Raw form / JSON input before normalization. */
export type UserContextInput = {
  gateZone?: unknown;
  minutesUntilBoarding?: unknown;
  bufferMinutes?: unknown;
  category?: unknown;
  queueAdjustmentMinutes?: unknown;
  passengerSecurityArea?: unknown;
};

export type ContextValidationErrorCode =
  | "missing_required_field"
  | "invalid_gate_zone"
  | "invalid_minutes_until_boarding"
  | "invalid_buffer_minutes"
  | "invalid_category"
  | "invalid_queue_adjustment"
  | "invalid_passenger_security_area";

export type ContextValidationError = {
  field: keyof UserContextInput | "form";
  code: ContextValidationErrorCode;
  message: string;
};

export type ValidateContextResult = {
  /** Normalized context, or `null` when validation fails. */
  context: UserContext | null;
  errors: ContextValidationError[];
};

// ---------------------------------------------------------------------------
// Illustrative regression fixtures (GW-012) — types only
// ---------------------------------------------------------------------------

export type IllustrativeRegressionContext = {
  gateZone: IllustrativeZone;
  minutesUntilBoarding: number;
  bufferMinutes: number;
  category?: FacilityCategory;
  queueAdjustmentMinutes?: number;
};

export type IllustrativeRegressionFacility = Omit<Facility, "zone"> & {
  zone: IllustrativeZone;
};

// ---------------------------------------------------------------------------
// Pure function contracts (implementations in later tasks)
// ---------------------------------------------------------------------------

/**
 * Boarding-aware ranking and time feasibility (GW-011).
 *
 * Eligibility: `securityZone` must be `'post'` or `'both'` for `eligible: true`.
 * `'unknown'` and `'pre'` yield `eligible: false` with `ineligibilityReason`.
 *
 * Status thresholds when eligible: margin ≥ 10 → `feasible_in_model`;
 * 0–9 → `tight_in_model`; &lt; 0 → `over_budget`; missing required durations → `unknown`.
 */
export declare function recommendFacilities(
  context: UserContext,
  facilities: readonly Facility[],
  travelTimes: ProductionTravelMatrix,
): Recommendation[];
export declare function recommendFacilities(
  context: IllustrativeRegressionContext,
  facilities: readonly IllustrativeRegressionFacility[],
  travelTimes: IllustrativeTravelMatrix,
): Recommendation[];

/**
 * Deterministic filter/search (GW-006). Does not modify security fields or eligibility.
 * Ordering: stable sort by `name` ascending (locale `en-US`, sensitivity `base`).
 */
export declare function filterFacilities(
  facilities: readonly Facility[],
  query: FacilityFilterQuery,
): Facility[];

/**
 * Parse and normalize facility dataset records (GW-007).
 * Invalid entries are reported in `errors` and omitted from `facilities`.
 */
export declare function validateFacilities(
  raw: unknown,
): ValidateFacilitiesResult;

/**
 * Parse flight-context form values (GW-008).
 * Applies {@link DEFAULT_BUFFER_MINUTES} and {@link DEFAULT_QUEUE_ADJUSTMENT_MINUTES}.
 * `gateZone` must be a supported production zone (`'D'`).
 */
export declare function validateContext(
  input: UserContextInput,
): ValidateContextResult;

// ---------------------------------------------------------------------------
// Type-only signatures (for satisfies / tests without runtime declare)
// ---------------------------------------------------------------------------

export type RecommendFacilitiesFn = typeof recommendFacilities;
export type FilterFacilitiesFn = typeof filterFacilities;
export type ValidateFacilitiesFn = typeof validateFacilities;
export type ValidateContextFn = typeof validateContext;
