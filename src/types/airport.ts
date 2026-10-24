/**
 * GateWise shared contracts (GW-001).
 *
 * **Import convention**
 * - Shared types, constants, and function *type* contracts: `@/types/airport`
 * - Runtime implementations (later tasks):
 *   - `recommendFacilities` → `@/lib/recommend`
 *   - `filterFacilities` → `@/lib/filter-facilities`
 *   - `validateFacilities` → `@/lib/validate-facilities`
 *   - `validateContext` → `@/lib/validate-context`
 *
 * Production scope: SFO Terminal 2, D Gates only (`Zone = 'D'`).
 *
 * **Confidence and durations**
 * - `demo_estimate` marks an unverified modeling assumption (not a measured SFO time).
 * - Genuinely unknown queue/activity/walk durations stay `null`; never substitute `0`.
 * - A numeric minute field with `timeConfidence: 'unknown'` is invalid at validation.
 *
 * `minutesUntilBoarding` is minutes until **boarding starts**, not gate closure.
 *
 * Same-zone rule (PLAN §3): `travelTimes['D']['D']` is a representative within-D
 * `demo_estimate` leg, used for outbound and return when gate and facility are in `D`.
 *
 * Illustrative types (`IllustrativeZone`, `IllustrativeRecommendation`, etc.) are for
 * GW-012 synthetic fixtures only and must not appear in production UI or datasets.
 */

// ---------------------------------------------------------------------------
// Supported airport scope
// ---------------------------------------------------------------------------

export const SUPPORTED_AIRPORT_IATA = "SFO";
export const SUPPORTED_TERMINAL_LABEL = "Terminal 2";
export const SUPPORTED_BOARDING_AREA_LABEL = "D Gates";
export const PRODUCTION_ZONES: readonly Zone[] = ["D"];

export const DEFAULT_BUFFER_MINUTES = 10;
export const DEFAULT_QUEUE_ADJUSTMENT_MINUTES = 0;

/** Post-security facility sides eligible for recommendation time modeling. */
export const POST_ELIGIBLE_SECURITY_ZONES: readonly SecurityZone[] = [
  "post",
  "both",
];

// ---------------------------------------------------------------------------
// Zones
// ---------------------------------------------------------------------------

/** Production boarding zone (Terminal 2 D Gates). */
export type Zone = "D";

/** Synthetic zones for GW-012 regression fixtures only — not production data. */
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

export type SecurityZone = "pre" | "post" | "both" | "unknown";
export type PassengerSecurityArea = "post";

export type GateLandmark = "D1" | "D4" | "D7" | "D9" | "D15" | "D16";

// ---------------------------------------------------------------------------
// Travel matrices (minutes; directed; null = unknown edge)
// ---------------------------------------------------------------------------

export type ProductionTravelMatrix = Record<Zone, Record<Zone, number | null>>;

export type IllustrativeTravelMatrix = Record<
  IllustrativeZone,
  Record<IllustrativeZone, number | null>
>;

/** @deprecated Use `ProductionTravelMatrix`. */
export type TravelMatrix = ProductionTravelMatrix;

// ---------------------------------------------------------------------------
// Facilities
// ---------------------------------------------------------------------------

export type Facility = {
  id: string;
  name: string;
  zone: Zone;
  category: FacilityCategory;
  securityZone: SecurityZone;
  waitMinutes: number | null;
  activityMinutes: number | null;
  sourceUrl?: string;
  lastCheckedAt?: string;
  locationConfidence: DataConfidence;
  timeConfidence: DataConfidence;
  locationDescription?: string;
  nearestGateLandmark?: GateLandmark | null;
};

// ---------------------------------------------------------------------------
// User context
// ---------------------------------------------------------------------------

export type UserContext = {
  gateZone: Zone;
  minutesUntilBoarding: number;
  bufferMinutes: number;
  category?: FacilityCategory;
  queueAdjustmentMinutes: number;
  passengerSecurityArea: PassengerSecurityArea;
};

export type UserContextInput = {
  gateZone?: unknown;
  minutesUntilBoarding?: unknown;
  bufferMinutes?: unknown;
  category?: unknown;
  queueAdjustmentMinutes?: unknown;
  passengerSecurityArea?: unknown;
};

// ---------------------------------------------------------------------------
// Recommendation outcomes (discriminated unions)
// ---------------------------------------------------------------------------

export type RecommendationStatus =
  | "feasible_in_model"
  | "tight_in_model"
  | "over_budget"
  | "unknown";

export type IneligibilityReason =
  | "security_zone_unknown"
  | "security_zone_pre_only"
  | "passenger_not_airside"
  | "outside_supported_zone";

export type UnknownReason =
  | "missing_travel_outbound"
  | "missing_travel_return"
  | "missing_queue_estimate"
  | "missing_activity_estimate";

/** Partial breakdown when status is `unknown` (some legs may be null). */
export type RecommendationTimeBreakdownPartial = {
  outboundMinutes: number | null;
  returnMinutes: number | null;
  queueMinutes: number | null;
  activityMinutes: number | null;
  bufferMinutes: number;
  requiredMinutes: number | null;
  marginMinutes: number | null;
};

/** Required when status is feasible, tight, or over_budget — all model inputs resolved. */
export type RecommendationTimeBreakdownComplete = {
  outboundMinutes: number;
  returnMinutes: number;
  queueMinutes: number;
  activityMinutes: number;
  bufferMinutes: number;
  requiredMinutes: number;
  marginMinutes: number;
};

type RecommendationIdentity = {
  facilityId: string;
  facilityName: string;
  category: FacilityCategory;
  locationConfidence: DataConfidence;
  timeConfidence: DataConfidence;
  securityZone: SecurityZone;
};

/** Production recommendation — `zone` is always `'D'`. */
export type ProductionIneligibleRecommendation = RecommendationIdentity & {
  kind: "ineligible";
  zone: Zone;
  ineligibilityReason: IneligibilityReason;
};

export type ProductionUnknownRecommendation = RecommendationIdentity & {
  kind: "unknown";
  zone: Zone;
  unknownReason: UnknownReason;
  breakdown: RecommendationTimeBreakdownPartial;
};

export type ProductionFeasibilityRecommendation = RecommendationIdentity & {
  kind: "feasibility";
  zone: Zone;
  status: "feasible_in_model" | "tight_in_model" | "over_budget";
  breakdown: RecommendationTimeBreakdownComplete;
};

export type ProductionRecommendation =
  | ProductionIneligibleRecommendation
  | ProductionUnknownRecommendation
  | ProductionFeasibilityRecommendation;

/** GW-012 fixtures only — may use `IllustrativeZone`; never use in production UI. */
export type IllustrativeIneligibleRecommendation = RecommendationIdentity & {
  kind: "ineligible";
  zone: IllustrativeZone;
  ineligibilityReason: IneligibilityReason;
};

export type IllustrativeUnknownRecommendation = RecommendationIdentity & {
  kind: "unknown";
  zone: IllustrativeZone;
  unknownReason: UnknownReason;
  breakdown: RecommendationTimeBreakdownPartial;
};

export type IllustrativeFeasibilityRecommendation = RecommendationIdentity & {
  kind: "feasibility";
  zone: IllustrativeZone;
  status: "feasible_in_model" | "tight_in_model" | "over_budget";
  breakdown: RecommendationTimeBreakdownComplete;
};

export type IllustrativeRecommendation =
  | IllustrativeIneligibleRecommendation
  | IllustrativeUnknownRecommendation
  | IllustrativeFeasibilityRecommendation;

/** Production app surfaces use this alias only. */
export type Recommendation = ProductionRecommendation;

// ---------------------------------------------------------------------------
// Filtering (GW-006)
// ---------------------------------------------------------------------------

export type FacilityFilterQuery = {
  text?: string;
  category?: FacilityCategory;
  zone?: Zone;
};

// ---------------------------------------------------------------------------
// Validation results (GW-007 / GW-008)
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
  | "duplicate_id"
  | "confidence_field_mismatch";

export type FacilityValidationError = {
  path: string;
  code: FacilityValidationErrorCode;
  message: string;
};

export type ValidateFacilitiesResult = {
  facilities: Facility[];
  errors: FacilityValidationError[];
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
  context: UserContext | null;
  errors: ContextValidationError[];
};

// ---------------------------------------------------------------------------
// Illustrative regression fixtures (GW-012)
// ---------------------------------------------------------------------------

export type IllustrativeRegressionContext = {
  gateZone: IllustrativeZone;
  minutesUntilBoarding: number;
  bufferMinutes: number;
  category?: FacilityCategory;
  queueAdjustmentMinutes: number;
};

export type IllustrativeRegressionFacility = Omit<Facility, "zone"> & {
  zone: IllustrativeZone;
};

// ---------------------------------------------------------------------------
// Function type contracts (implementations in src/lib/*)
// ---------------------------------------------------------------------------

/**
 * Boarding-aware recommendations (GW-011).
 * Post-eligible: `securityZone` is `post` | `both`. Others → `kind: 'ineligible'`.
 * Thresholds: margin ≥ 10 feasible; 0–9 tight; < 0 over_budget.
 */
export type RecommendFacilities = (
  context: UserContext,
  facilities: readonly Facility[],
  travelTimes: ProductionTravelMatrix,
) => ProductionRecommendation[];

/** Same algorithm as production; illustrative zones/matrix for GW-012 only. */
export type RecommendFacilitiesIllustrative = (
  context: IllustrativeRegressionContext,
  facilities: readonly IllustrativeRegressionFacility[],
  travelTimes: IllustrativeTravelMatrix,
) => IllustrativeRecommendation[];

export type FilterFacilities = (
  facilities: readonly Facility[],
  query: FacilityFilterQuery,
) => Facility[];

export type ValidateFacilities = (raw: unknown) => ValidateFacilitiesResult;

export type ValidateContext = (input: UserContextInput) => ValidateContextResult;

// ---------------------------------------------------------------------------
// GW-007 / GW-008 normalization policy (deterministic; implement exactly)
// ---------------------------------------------------------------------------

/**
 * ## Shared numeric parsing (`parseRequiredNonNegativeInt`, `parseOptionalInt`)
 *
 * Applies to `validateContext` and integer minute fields in `validateFacilities`.
 *
 * **Accepted**
 * - Finite integers ≥ 0: `42`, `"42"` (string trimmed first)
 * - Optional fields omitted, `null`, or `""` → use documented default (context only)
 *
 * **Rejected** (field error; do not coerce)
 * - `undefined` on required fields
 * - `""`, whitespace-only strings, `"  "` on required fields
 * - `null` on required fields
 * - `NaN`, `Infinity`, `-Infinity`
 * - Fractions: `8.5`, `"8.5"`
 * - Negative values where non-negative required
 * - Non-numeric strings: `"abc"`, `"12px"`
 * - Booleans, objects, arrays
 *
 * **Queue adjustment** (`queueAdjustmentMinutes`): any finite integer (negative allowed for what-if).
 * Default when omitted/null/"" : {@link DEFAULT_QUEUE_ADJUSTMENT_MINUTES}.
 *
 * ### `validateContext` examples
 * - Valid: `{ gateZone: "D", minutesUntilBoarding: 50 }` → buffer 10, queue adj 0, passenger post
 * - Valid: `{ gateZone: "D", minutesUntilBoarding: "35", bufferMinutes: "15" }`
 * - Invalid: `{ minutesUntilBoarding: 50 }` → missing gateZone
 * - Invalid: `{ gateZone: "E", minutesUntilBoarding: 50 }` → invalid_gate_zone
 * - Invalid: `{ gateZone: "D", minutesUntilBoarding: "" }` → invalid_minutes_until_boarding
 * - Invalid: `{ gateZone: "D", minutesUntilBoarding: 8.5 }` → invalid_minutes_until_boarding
 *
 * **Defaults** (only when optional field omitted, null, or blank string)
 * - `bufferMinutes` → {@link DEFAULT_BUFFER_MINUTES}
 * - `queueAdjustmentMinutes` → {@link DEFAULT_QUEUE_ADJUSTMENT_MINUTES}
 * - `passengerSecurityArea` → `"post"`; any other value → error
 * - `gateZone` → required; must normalize to `"D"` (trim; case-sensitive)
 * - `category` → omit when absent/blank; otherwise must be a {@link FacilityCategory}
 *
 * ## `validateFacilities` policy
 *
 * **Input shape**: `raw` must be a JSON array. Otherwise one `invalid_shape` error; empty facilities.
 *
 * **Required per record** (missing → error, row skipped): `id`, `name`, `zone`, `category`,
 * `securityZone`, `locationConfidence`, `timeConfidence`. `waitMinutes` and `activityMinutes`
 * keys must be present; value may be `null`.
 *
 * **ID normalization**
 * - Trim `id` and `name`; reject empty after trim (`invalid_id` / `missing_required_field`)
 * - IDs are case-sensitive after trim; no slug rewriting
 * - Duplicate `id` after normalization: first row kept; later rows skipped with `duplicate_id`
 *
 * **Zone**: must be exactly `"D"` after trim (`invalid_zone` otherwise).
 *
 * **Security zone**: must be one of {@link SecurityZone}; stored as-is (including `unknown`).
 * Validation does not upgrade `unknown` to `post`.
 *
 * **Minute fields** (`waitMinutes`, `activityMinutes`)
 * - `null` → unknown duration (valid)
 * - Integer ≥ 0 per shared numeric rules (numeric strings allowed)
 * - `timeConfidence: 'demo_estimate'` requires non-null minute value
 * - `timeConfidence: 'unknown'` requires `null` minutes (`confidence_field_mismatch` otherwise)
 *
 * **Officially verified location** (`locationConfidence: 'official_verified'`)
 * - `sourceUrl` required, `http:` or `https:` URL after trim
 * - `lastCheckedAt` required, `YYYY-MM-DD` calendar date
 *
 * **Officially verified times** (`timeConfidence: 'official_verified'`)
 * - Both minute fields must be non-null integers (rare for MVP; policy still enforced)
 *
 * ### Facility examples
 * - Valid: `{ id: "napa-farms", name: "Napa Farms Market", zone: "D", category: "food",
 *   securityZone: "post", waitMinutes: null, activityMinutes: null,
 *   locationConfidence: "official_verified", timeConfidence: "unknown",
 *   sourceUrl: "https://www.flysfo.com/...", lastCheckedAt: "2026-10-24" }`
 * - Valid demo times: `waitMinutes: 8, activityMinutes: 10, timeConfidence: "demo_estimate"`
 * - Invalid: `zone: "E"` → invalid_zone
 * - Invalid: `waitMinutes: 0` with `timeConfidence: "unknown"` → confidence_field_mismatch
 * - Invalid: `locationConfidence: "official_verified"` without `sourceUrl` → missing_required_field
 * - Invalid: duplicate `id` on second row → duplicate_id, second row omitted
 */
