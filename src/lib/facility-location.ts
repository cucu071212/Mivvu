import { SFO_T2_LOCATION_EVIDENCE } from "@/data/sfo-t2-location-evidence";
import type {
  FacilityLocationEvidence,
  KnownFacilityLocationEvidence,
} from "@/types/facility-location";

import {
  POST_ELIGIBLE_SECURITY_ZONES,
  PRODUCTION_RECOMMEND_SCOPE_ZONES,
  SUPPORTED_AIRPORT_IATA,
  type BoardingAreaCode,
  type Facility,
  type SecurityZone,
  type TerminalCode,
} from "@/types/airport";

/** Official SFO terminal ↔ boarding-area relationships (GW-X-R002). */
export const BOARDING_AREA_TO_TERMINAL: Readonly<
  Record<BoardingAreaCode, TerminalCode>
> = {
  B: "harvey_milk_1",
  C: "harvey_milk_1",
  D: "terminal_2",
  E: "terminal_3",
  F: "terminal_3",
  A: "international",
  G: "international",
};

export const BOARDING_AREA_CODES: readonly BoardingAreaCode[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
];

export function isBoardingAreaCode(value: string): value is BoardingAreaCode {
  return Object.prototype.hasOwnProperty.call(BOARDING_AREA_TO_TERMINAL, value);
}

export function terminalForBoardingArea(
  boardingAreaCode: BoardingAreaCode,
): TerminalCode {
  return BOARDING_AREA_TO_TERMINAL[boardingAreaCode];
}

function isPostEligibleSecurity(securityZone: SecurityZone): boolean {
  return POST_ELIGIBLE_SECURITY_ZONES.includes(securityZone);
}

function isInProductionRecommendScope(zone: BoardingAreaCode): boolean {
  return PRODUCTION_RECOMMEND_SCOPE_ZONES.includes(
    zone as (typeof PRODUCTION_RECOMMEND_SCOPE_ZONES)[number],
  );
}

/** Legacy JSON omits eligibility flags; derive safe production defaults on read. */
export function defaultRecommendEligible(
  zone: BoardingAreaCode,
  securityZone: SecurityZone,
  explicit: boolean | undefined,
): boolean {
  if (explicit !== undefined) return explicit;
  return isInProductionRecommendScope(zone) && isPostEligibleSecurity(securityZone);
}

export function defaultBrowseEligible(explicit: boolean | undefined): boolean {
  if (explicit !== undefined) return explicit;
  return true;
}

export function defaultAirportIata(
  explicit: typeof SUPPORTED_AIRPORT_IATA | undefined,
): typeof SUPPORTED_AIRPORT_IATA {
  return explicit ?? SUPPORTED_AIRPORT_IATA;
}

export function defaultTerminalCode(
  boardingAreaCode: BoardingAreaCode,
  explicit: TerminalCode | undefined,
): TerminalCode {
  return explicit ?? terminalForBoardingArea(boardingAreaCode);
}

export function defaultBoardingAreaFromZone(zone: BoardingAreaCode): BoardingAreaCode {
  return zone;
}

export type FacilityEligibilityInput = {
  zone: BoardingAreaCode;
  securityZone: SecurityZone;
  browseEligible?: boolean;
  recommendEligible?: boolean;
};

/** Validator policy: explicit recommend=true must be post-eligible and in authorized scope. */
export function recommendEligibilityViolations(
  input: FacilityEligibilityInput,
): string | null {
  const recommendEligible = defaultRecommendEligible(
    input.zone,
    input.securityZone,
    input.recommendEligible,
  );
  const browseEligible = defaultBrowseEligible(input.browseEligible);

  if (recommendEligible && !browseEligible) {
    return "Recommend-eligible facilities must also be browse-eligible.";
  }
  if (recommendEligible && !isPostEligibleSecurity(input.securityZone)) {
    return "Recommend eligibility requires post-security or both-side classification.";
  }
  if (recommendEligible && !isInProductionRecommendScope(input.zone)) {
    return "Recommend eligibility is limited to the authorized production boarding scope.";
  }
  return null;
}

export function normalizeFacilityLocationFields(
  row: Pick<Facility, "zone" | "securityZone"> & {
    airportIata?: Facility["airportIata"];
    terminalCode?: Facility["terminalCode"];
    boardingAreaCode?: Facility["boardingAreaCode"];
    browseEligible?: Facility["browseEligible"];
    recommendEligible?: Facility["recommendEligible"];
  },
): Pick<
  Facility,
  | "airportIata"
  | "terminalCode"
  | "boardingAreaCode"
  | "browseEligible"
  | "recommendEligible"
> {
  const boardingAreaCode =
    row.boardingAreaCode ?? defaultBoardingAreaFromZone(row.zone);
  const terminalCode = defaultTerminalCode(boardingAreaCode, row.terminalCode);
  const airportIata = defaultAirportIata(row.airportIata);
  const browseEligible = defaultBrowseEligible(row.browseEligible);
  const recommendEligible = defaultRecommendEligible(
    row.zone,
    row.securityZone,
    row.recommendEligible,
  );

  return {
    airportIata,
    terminalCode,
    boardingAreaCode,
    browseEligible,
    recommendEligible,
  };
}

export function isFacilityRecommendEligibleForEngine(
  facility: Pick<Facility, "recommendEligible">,
): boolean {
  return facility.recommendEligible;
}

// GW-B coarse location evidence. Kept separate from eligibility normalization and
// recommendation math; these records never imply a route or travel duration.
const locationEvidenceById = new Map(
  SFO_T2_LOCATION_EVIDENCE.map((row) => [row.facilityId, row] as const),
);

/** Return sourced area evidence or an explicit Unknown result for any other ID. */
export function getFacilityLocationEvidence(
  facilityId: string,
): FacilityLocationEvidence {
  return (
    locationEvidenceById.get(facilityId) ??
    Object.freeze({
      facilityId,
      locationConfidence: "unknown" as const,
      terminalLabel: null,
      gateAreaLabel: null,
      areaLabel: null,
      sourceUrl: null,
      evidenceNotes: "No supported location evidence for this facility ID.",
    })
  );
}

/** List only the twelve sourced T2 D Gates records in stable manifest order. */
export function listFacilityLocationEvidence(): readonly KnownFacilityLocationEvidence[] {
  return SFO_T2_LOCATION_EVIDENCE;
}
