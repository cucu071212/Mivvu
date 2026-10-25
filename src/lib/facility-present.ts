import type {
  BoardingAreaCode,
  Facility,
  TerminalCode,
} from "@/types/airport";

export const TERMINAL_DISPLAY_LABELS: Record<TerminalCode, string> = {
  harvey_milk_1: "Harvey Milk Terminal 1",
  terminal_2: "Terminal 2",
  terminal_3: "Terminal 3",
  international: "International Terminal",
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

export function terminalDisplayLabel(code: TerminalCode): string {
  return TERMINAL_DISPLAY_LABELS[code];
}

export function boardingAreaDisplayLabel(code: BoardingAreaCode): string {
  return `${code} Gates`;
}

export function facilityTerminalBoardingLabel(facility: Facility): string {
  return `${terminalDisplayLabel(facility.terminalCode)} · ${boardingAreaDisplayLabel(facility.boardingAreaCode)}`;
}

export function recommendEligibilityLabel(facility: Facility): string {
  return facility.recommendEligible
    ? "Time-based recommendations (T2 D Gates)"
    : "Browse only — not in recommend scope";
}

export function facilityLocationSummary(facility: Facility): string {
  if (facility.locationDescription) {
    return facility.locationDescription;
  }
  if (facility.nearestGateLandmark) {
    return `Near Gate ${facility.nearestGateLandmark}`;
  }
  return facilityTerminalBoardingLabel(facility);
}

export function facilityTaglineSummary(facility: Facility): string | null {
  return facility.amenityDetails?.tagline ?? null;
}
