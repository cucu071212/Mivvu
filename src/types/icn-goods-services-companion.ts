import type { IcnFacilitiesLanguage } from "@/types/icn-facility-browse";

/** API 원문 필드 하나의 캡처 래퍼 — present:false면 value 없음 */
export type IcnCapturedSourceText =
  | { present: false }
  | { present: true; value: string | null };

/** companion 관측 한 행 — coreFingerprint는 v1 canonical JSON 문자열 */
export type IcnGoodsServicesObservation = {
  coreFingerprint: string;
  fields: {
    facilityitem: IcnCapturedSourceText;
    goods: IcnCapturedSourceText;
    GOODS: IcnCapturedSourceText;
  };
};

export type IcnGoodsServicesCapture = {
  startedAt: string;
  completedAt: string;
  coverage: "retrievable_catalog";
  apiReportedTotalCount: number;
  recordCount: number;
  syncIntegrity: "complete" | "api_total_mismatch";
  observations: IcnGoodsServicesObservation[];
};

export type IcnGoodsServicesCompanion = {
  schemaVersion: 1;
  source: { datasetId: string; apiOperation: string };
  targetCoreDigests: { K: string; E: string };
  captures: { K: IcnGoodsServicesCapture | null; E: IcnGoodsServicesCapture | null };
};

export type IcnGoodsServicesUnavailableReason =
  | "not_captured"
  | "no_exact_observation"
  | "empty"
  | "source_variants_ambiguous"
  | "cross_locale_association_unverified"
  | "artifact_mismatch"
  | "invalid_artifact"
  | "unsupported_version";

export type IcnGoodsServicesParagraph = {
  text: string;
  sourceFields: Array<"facilityitem" | "goods" | "GOODS">;
};

export type IcnGoodsServicesProvenance = {
  datasetId: string;
  apiOperation: string;
  captureStartedAt: string;
  captureCompletedAt: string;
};

export type IcnGoodsServicesDetailProjection = {
  sectionVisible: boolean;
  available?: {
    paragraphs: IcnGoodsServicesParagraph[];
    fieldAgreement: "single" | "equal" | "different";
    language: IcnFacilitiesLanguage;
    fallbackUsed: boolean;
    sourceLabel?: string;
    provenance: IcnGoodsServicesProvenance;
    longTextCollapsedByDefault: boolean;
  };
  internal?: {
    unavailable?: {
      reason: IcnGoodsServicesUnavailableReason;
      requestedLanguage: IcnFacilitiesLanguage;
      gateOrPrecheckSubreason?: string;
    };
    englishOutcome?: "empty" | "available" | "unavailable";
    koreanFallbackAttempted?: boolean;
    koreanFallbackEligible?: boolean;
  };
};
