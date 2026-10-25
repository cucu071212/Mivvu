/**
 * UI 계약 재수출 — Codex 타입 `@/types/facility-location`이 원본이다.
 * 데이터셋을 복제하지 않고, Lead UI가 같은 이름을 쓰도록 얇게 감싼다.
 */

export type {
  FacilityLocationConfidence as FacilityLocationEvidenceConfidence,
  FacilityLocationEvidence,
  KnownFacilityLocationEvidence,
  UnknownFacilityLocationEvidence,
} from "@/types/facility-location";

import type { FacilityLocationEvidence } from "@/types/facility-location";

/** Codex getFacilityLocationEvidence와 같은 시그니처. */
export type GetFacilityLocationEvidence = (
  facilityId: string,
) => FacilityLocationEvidence;

/** Codex listFacilityLocationEvidence와 같은 시그니처. */
export type ListFacilityLocationEvidence = () => readonly FacilityLocationEvidence[];
