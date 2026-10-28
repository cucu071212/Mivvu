import type { MivvuPreviewLocale } from "./mivvu-preview-locale";

export type MivvuPreviewMessages = {
  languageToggleLabel: string;
  languageKo: string;
  languageEn: string;
  airportTitle: string;
  airportLead: string;
  airportSearchLabel: string;
  airportSearchPlaceholder: string;
  airportEmpty: string;
  airportRadiogroup: string;
  exploreIcn: string;
  exploreSfo: string;
  airportUnavailable: string;
  icnBack: string;
  icnTitle: string;
  icnLead: string;
  icnSearchLabel: string;
  icnSearchPlaceholder: string;
  icnSearchHint: string;
  icnTerminalLabel: string;
  icnTerminalAll: string;
  icnEmpty: string;
  icnHoursLabel: string;
  icnHoursUnavailable: string;
  icnSnapshotTitle: string;
  icnSnapshotSource: string;
  icnSnapshotDate: string;
  icnCountAll: string;
  icnCountFiltered: (shown: string, total: string) => string;
  icnKoOnlyName: string;
  icnKoOnlyLocation: string;
};

const KO: MivvuPreviewMessages = {
  languageToggleLabel: "언어 선택",
  languageKo: "한국어",
  languageEn: "English",
  airportTitle: "공항을 선택하세요",
  airportLead: "터미널의 라운지, 휴식 공간, 식음료를 찾아보세요.",
  airportSearchLabel: "공항 검색",
  airportSearchPlaceholder: "공항, 도시, 코드",
  airportEmpty: "검색 결과가 없습니다. 코드, 도시, 공항 이름을 바꿔 보세요.",
  airportRadiogroup: "공항",
  exploreIcn: "인천공항 탐색",
  exploreSfo: "SFO 탐색",
  airportUnavailable:
    "이 공항은 아직 프리뷰에서 사용할 수 없습니다. 샌프란시스코(SFO)만 전체 데모를 제공합니다.",
  icnBack: "공항 선택",
  icnTitle: "인천공항 시설",
  icnLead: "터미널별 식음료, 편의시설, 라운지 등 공항 시설 목록입니다.",
  icnSearchLabel: "시설 검색",
  icnSearchPlaceholder: "시설명, 위치, 카테고리",
  icnSearchHint: "한국어로 검색",
  icnTerminalLabel: "터미널",
  icnTerminalAll: "전체",
  icnEmpty: "조건에 맞는 시설이 없습니다. 검색어 또는 터미널 필터를 바꿔 보세요.",
  icnHoursLabel: "운영 시간",
  icnHoursUnavailable: "운영시간 확인 필요",
  icnSnapshotTitle: "목록 정보",
  icnSnapshotSource: "출처",
  icnSnapshotDate: "스냅샷",
  icnCountAll: "개 시설",
  icnCountFiltered: (shown, total) => `개 표시 (${total}개 중)`,
  icnKoOnlyName: "한국어 목록에만 이름이 있습니다",
  icnKoOnlyLocation: "한국어 목록에만 위치가 있습니다",
};

const EN: MivvuPreviewMessages = {
  languageToggleLabel: "Language",
  languageKo: "한국어",
  languageEn: "English",
  airportTitle: "Choose your airport",
  airportLead: "Discover lounges, quiet zones, and dining at your terminal.",
  airportSearchLabel: "Search airports",
  airportSearchPlaceholder: "Airport, city, or code",
  airportEmpty: "No airports match your search. Try a code, city, or airport name.",
  airportRadiogroup: "Airports",
  exploreIcn: "Explore ICN",
  exploreSfo: "Explore SFO",
  airportUnavailable:
    "This airport is not available in the preview yet. San Francisco (SFO) has the full demo experience.",
  icnBack: "Airports",
  icnTitle: "Incheon Airport facilities",
  icnLead: "Directory of dining, services, lounges, and amenities by terminal.",
  icnSearchLabel: "Search facilities",
  icnSearchPlaceholder: "Name, location, or category",
  icnSearchHint: "Search in English",
  icnTerminalLabel: "Terminal",
  icnTerminalAll: "All",
  icnEmpty: "No facilities match. Try a different search or terminal filter.",
  icnHoursLabel: "Hours",
  icnHoursUnavailable: "Hours unavailable",
  icnSnapshotTitle: "About this listing",
  icnSnapshotSource: "Source",
  icnSnapshotDate: "Snapshot",
  icnCountAll: " facilities",
  icnCountFiltered: (shown, total) => ` shown (of ${total})`,
  icnKoOnlyName: "Name available in Korean listing only",
  icnKoOnlyLocation: "Location available in Korean listing only",
};

export function mivvuPreviewMessages(locale: MivvuPreviewLocale): MivvuPreviewMessages {
  return locale === "ko" ? KO : EN;
}
