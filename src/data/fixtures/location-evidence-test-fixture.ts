/**
 * TEST-ONLY location-evidence fixture for GW-B Location Guidance UI.
 *
 * This is not Codex's production evidence dataset and must not be imported
 * by production UI, recommendation code, or travel-time modules. Rows are
 * synthetic contract samples so the UI can be tested before Codex merges
 * getFacilityLocationEvidence / listFacilityLocationEvidence.
 */

import type { FacilityLocationEvidence } from "@/types/facility-location";

/** 테스트 전용: 검증된 구역 행. 실제 SFO 증거가 아니다. */
export const TEST_VERIFIED_AREA_EVIDENCE: FacilityLocationEvidence = {
  facilityId: "test-ui-verified-area",
  locationConfidence: "verified_area",
  terminalLabel: "Terminal 2",
  gateAreaLabel: "D Gates",
  areaLabel: "Near Gate D7",
  sourceUrl: "https://www.flysfo.com/test-ui-verified-area",
  evidenceNotes:
    "Synthetic UI fixture only. Official listing names Gate D7. This is not Codex production evidence.",
  nearGate: "D7",
};

/** 테스트 전용: 대략 구역 행. Retail Street는 게이트 ID가 아니다. */
export const TEST_APPROXIMATE_AREA_EVIDENCE: FacilityLocationEvidence = {
  facilityId: "test-ui-approximate-area",
  locationConfidence: "approximate_area",
  terminalLabel: "Terminal 2",
  gateAreaLabel: "D Gates",
  areaLabel: "Retail Street",
  sourceUrl: "https://www.flysfo.com/test-ui-approximate-area",
  evidenceNotes:
    "Synthetic UI fixture only. Coarse Retail Street area; not a precise gate or coordinate.",
};

/** 테스트 전용: 지도 셀이 있는 검증 행. 셀은 게이트가 아니다. */
export const TEST_VERIFIED_AREA_WITH_MAP_CELL: FacilityLocationEvidence = {
  facilityId: "test-ui-verified-map-cell",
  locationConfidence: "verified_area",
  terminalLabel: "Terminal 2",
  gateAreaLabel: "D Gates",
  areaLabel: "Near Gate D1",
  sourceUrl: "https://www.flysfo.com/test-ui-verified-map-cell",
  evidenceNotes:
    "Synthetic UI fixture only. Map directory cell is an index, not a measured coordinate.",
  nearGate: "D1",
  mapGridCell: "E2",
  mapSourceUrl:
    "https://www.flysfo.com/sites/default/files/2025-11/251027_SFO_Tabloid_Face%20A_T2_Web.pdf",
};

/** 테스트 전용: Unknown. 구역을 추론하지 않는다. */
export const TEST_UNKNOWN_LOCATION_EVIDENCE: FacilityLocationEvidence = {
  facilityId: "test-ui-unknown",
  locationConfidence: "unknown",
  terminalLabel: null,
  gateAreaLabel: null,
  areaLabel: null,
  sourceUrl: null,
  evidenceNotes: "No supported location evidence for this facility ID.",
};

/** 테스트 전용 목록. 프로덕션 listFacilityLocationEvidence가 아니다. */
export const TEST_LOCATION_EVIDENCE_FIXTURES: readonly FacilityLocationEvidence[] =
  Object.freeze([
    TEST_VERIFIED_AREA_EVIDENCE,
    TEST_APPROXIMATE_AREA_EVIDENCE,
    TEST_VERIFIED_AREA_WITH_MAP_CELL,
    TEST_UNKNOWN_LOCATION_EVIDENCE,
  ]);
