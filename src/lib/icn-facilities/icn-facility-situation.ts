import type { IcnFacilityDetailFoundView } from "./icn-facility-detail-present";
import type { MivvuPreviewMessages } from "@/lib/mivvu-preview-messages";

/** Situation 패널에 표시할 세 그룹(목록에 있는 사실 / 없는 항목 / 앱이 주장하지 않는 것) */
export type IcnFacilitySituationContent = {
  known: string[];
  unknown: string[];
  notClaimed: readonly string[];
};

/**
 * 스냅샷 필드만으로 Situation 문구를 구성한다.
 * 시계 비교, 영업 중 추론, 보안·동선·적합성 판정은 포함하지 않는다.
 */
export function buildIcnFacilitySituationContent(
  detail: IcnFacilityDetailFoundView,
  messages: MivvuPreviewMessages,
): IcnFacilitySituationContent {
  const known: string[] = [];
  const unknown: string[] = [];
  const record = detail.record;

  const terminalAndFloorRecorded =
    Boolean(record.terminalId?.trim()) && Boolean(record.floor?.trim());
  if (terminalAndFloorRecorded) {
    known.push(messages.icnSituationKnownPlaceLine);
  } else {
    unknown.push(messages.icnSituationUnknownPlaceLine);
  }

  const locationFromListing =
    Boolean(detail.displayLocation?.trim()) && !detail.locationFromKoreanFallback;
  if (locationFromListing) {
    known.push(messages.icnSituationKnownLocation);
  } else {
    unknown.push(messages.icnSituationUnknownLocation);
  }

  if (detail.hoursText?.trim()) {
    if (detail.hoursAmbiguousEqual) {
      unknown.push(messages.icnSituationUnknownHoursAmbiguous);
    } else {
      known.push(messages.icnSituationKnownHours);
    }
  } else {
    unknown.push(messages.icnSituationUnknownHours);
  }

  if (detail.arrivalOrDeparture === "A" || detail.arrivalOrDeparture === "D") {
    known.push(messages.icnSituationKnownDirectoryAd);
  } else {
    unknown.push(messages.icnSituationUnknownDirectoryAd);
  }

  if (detail.dutyFreeFlag === "Y" || detail.dutyFreeFlag === "N") {
    known.push(messages.icnSituationKnownDirectoryDuty);
  } else {
    unknown.push(messages.icnSituationUnknownDirectoryDuty);
  }

  if (detail.categoryLabel?.trim()) {
    known.push(messages.icnSituationKnownCategory);
  } else {
    unknown.push(messages.icnSituationUnknownCategory);
  }

  return {
    known,
    unknown,
    notClaimed: messages.icnSituationNotClaimedItems,
  };
}

/** 리뷰·테스트용: Situation 영역에 금지된 적합성/실시간 표현이 없는지 검사 */
export const ICN_SITUATION_FORBIDDEN_ASSERTION_PATTERNS: RegExp[] = [
  /open now/i,
  /closed now/i,
  /available now/i,
  /can visit/i,
  /you can use/i,
  /지금\s*영업\s*중/,
  /지금\s*문\s*닫/,
  /지금\s*이용\s*가능/,
  /탑승\s*시간\s*대비\s*방문/,
  /적합\s*점수/,
  /suitability\s*score/i,
  /near\s*(your\s*)?gate/i,
  /boarding[- ]time/i,
  /walk(ing)?\s*time/i,
  /도보\s*\d+\s*분/,
  /live\s*queue/i,
  /실시간\s*대기/,
];

export function icnSituationTextViolatesPolicy(text: string): boolean {
  return ICN_SITUATION_FORBIDDEN_ASSERTION_PATTERNS.some((pattern) => pattern.test(text));
}
