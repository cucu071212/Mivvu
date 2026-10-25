import type { Facility, GateLandmark } from "@/types/airport";
import type {
  FacilityLocationEvidence,
  KnownFacilityLocationEvidence,
} from "@/types/facility-location";

/** 배지 문구는 색과 함께 텍스트로 상태를 드러낸다. */
const BADGE_LABEL: Record<FacilityLocationEvidence["locationConfidence"], string> = {
  verified_area: "Verified area",
  approximate_area: "Approximate area",
  unknown: "Unknown",
};

/** 기존 GateWise 배지 토큰. 색만으로 의미를 전달하지 않는다. */
const BADGE_CLASS: Record<FacilityLocationEvidence["locationConfidence"], string> = {
  verified_area: "gw-badge gw-badge-verified",
  approximate_area: "gw-badge gw-badge-demo",
  unknown: "gw-badge gw-badge-unknown",
};

/** 스크린 리더용 배지 이름. */
const BADGE_ACCESSIBLE: Record<FacilityLocationEvidence["locationConfidence"], string> = {
  verified_area: "Location evidence: verified area",
  approximate_area: "Location evidence: approximate area",
  unknown: "Location evidence: unknown",
};

/** 신뢰도별 설명. 측정 좌표·도보 시간을 주장하지 않는다. */
const EXPLANATION: Record<FacilityLocationEvidence["locationConfidence"], string> = {
  verified_area:
    "This Terminal 2 / D Gates area is backed by cited listing evidence. It is not a measured indoor coordinate, walking time, or guaranteed route.",
  approximate_area:
    "The cited evidence supports a coarse area only. GateWise does not treat this as a precise gate, coordinate, or walking time.",
  unknown:
    "Location evidence is insufficient to assign a Terminal 2 / D Gates area. GateWise does not infer a location.",
};

/** data-provenance에 기록된 T2 D 게이트 랜드마크만 사용한다. */
export const T2_D_DOCUMENTED_GATE_LANDMARKS: readonly GateLandmark[] = [
  "D1",
  "D4",
  "D7",
  "D9",
  "D15",
  "D16",
];

/** 개념 안내 칩. 실측 위치가 아니라 문서화된 관계다. */
export type ConceptualAreaChip = {
  id: string;
  label: string;
  current: boolean;
};

/** UI가 증거 행을 어떻게 보여 줄지. */
export type LocationGuidancePresentation = {
  badgeLabel: string;
  badgeClass: string;
  accessibleBadgeLabel: string;
  explanation: string;
  areaHeadline: string | null;
  nearGateLabel: string | null;
  mapGridLabel: string | null;
  showSource: boolean;
  showMapSource: boolean;
  sourceUrl: string | null;
  mapSourceUrl: string | null;
};

/** null이 아닌 라벨만 · 로 이어 제목을 만든다. */
function joinAreaParts(
  evidence: FacilityLocationEvidence,
): string | null {
  if (evidence.locationConfidence === "unknown") {
    return null;
  }
  const parts = [
    evidence.terminalLabel,
    evidence.gateAreaLabel,
    evidence.areaLabel,
  ].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(" · ") : null;
}

/** Unknown 행에는 게이트/지도 셀 필드가 없다. */
function asKnown(
  evidence: FacilityLocationEvidence,
): KnownFacilityLocationEvidence | null {
  return evidence.locationConfidence === "unknown" ? null : evidence;
}

/** Codex 증거 행을 화면 복사로 변환한다. 데이터셋을 만들지 않는다. */
export function presentLocationGuidance(
  evidence: FacilityLocationEvidence,
): LocationGuidancePresentation {
  const kind = evidence.locationConfidence;
  const known = asKnown(evidence);
  const nearGate = known?.nearGate ?? null;
  const mapGridCell = known?.mapGridCell ?? null;
  const sourceUrl = known?.sourceUrl ?? null;
  const mapSourceUrl = known?.mapSourceUrl ?? null;
  return {
    badgeLabel: BADGE_LABEL[kind],
    badgeClass: BADGE_CLASS[kind],
    accessibleBadgeLabel: BADGE_ACCESSIBLE[kind],
    explanation: EXPLANATION[kind],
    areaHeadline: joinAreaParts(evidence),
    nearGateLabel: nearGate ? `Listing names Gate ${nearGate}` : null,
    mapGridLabel: mapGridCell
      ? `Map directory cell ${mapGridCell} (index on the official T2 map, not a gate or walking distance)`
      : null,
    showSource: Boolean(sourceUrl),
    showMapSource: Boolean(mapSourceUrl),
    sourceUrl,
    mapSourceUrl,
  };
}

/** T2 D Gates 시설인지 — 개념 안내는 이 범위만 다룬다. */
export function isTerminal2DGatesFacility(
  facility: Pick<Facility, "terminalCode" | "boardingAreaCode">,
): boolean {
  return (
    facility.terminalCode === "terminal_2" && facility.boardingAreaCode === "D"
  );
}

/** GW-B 증거가 구역을 지지할 때만 개념 안내를 연다. Unknown이면 숨긴다. */
export function shouldShowConceptualAreaGuide(
  evidence: FacilityLocationEvidence,
  facility: Pick<Facility, "terminalCode" | "boardingAreaCode">,
): boolean {
  if (evidence.locationConfidence === "unknown") {
    return false;
  }
  return isTerminal2DGatesFacility(facility);
}

/** 현재 칩은 Codex 증거만 사용한다. facilities.json 필드로 추론하지 않는다. */
function currentGateFromEvidence(
  evidence: FacilityLocationEvidence,
): string | null {
  return asKnown(evidence)?.nearGate ?? null;
}

/** Retail Street 현재 표시도 증거 areaLabel에서만 온다. */
function evidenceNamesRetailStreet(
  evidence: FacilityLocationEvidence,
): boolean {
  const known = asKnown(evidence);
  if (!known || known.nearGate) {
    return false;
  }
  return /retail street/i.test(known.areaLabel);
}

/**
 * 문서화된 T2 D 구역 칩.
 * 두 번째 인자가 없으면 현재 마커를 만들지 않는다 — 레거시 필드로 채우지 않는다.
 */
export function conceptualT2DAreaChips(
  _listing: Pick<Facility, "nearestGateLandmark" | "locationDescription">,
  evidence?: FacilityLocationEvidence,
): readonly ConceptualAreaChip[] {
  const currentGate = evidence ? currentGateFromEvidence(evidence) : null;
  const retailCurrent = evidence ? evidenceNamesRetailStreet(evidence) : false;
  const chips: ConceptualAreaChip[] = [
    { id: "d-gates", label: "D Gates", current: false },
  ];
  for (const landmark of T2_D_DOCUMENTED_GATE_LANDMARKS) {
    const current = currentGate === landmark;
    chips.push({
      id: landmark,
      label: current ? `Gate ${landmark}, named on this listing` : `Gate ${landmark}`,
      current,
    });
  }
  chips.push({
    id: "retail-street",
    label: retailCurrent
      ? "Retail Street, named on this listing"
      : "Retail Street",
    current: retailCurrent,
  });
  return chips;
}
