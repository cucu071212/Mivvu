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
  icnDetailBackBrowse: string;
  icnDetailBackList: string;
  icnDetailHoursDisclaimer: string;
  icnDetailFlagDisclaimer: string;
  icnDetailListingNotes: string;
  icnDetailCollectedOn: string;
  icnDetailDirectoryLabel: string;
  icnDetailDirectEntry: string;
  icnDetailMissingListing: string;
  icnDetailMissingLocale: string;
  icnDetailMissingLocaleNotCaptured: string;
  icnDetailAmbiguous: string;
  icnDetailInvalidRef: string;
  icnDetailUnsupportedVersion: (version: string) => string;
  icnDetailArrivalLabel: string;
  icnDetailDepartureLabel: string;
  icnDetailDutyFreeYes: string;
  icnDetailDutyFreeNo: string;
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
  icnDetailBackBrowse: "시설 목록",
  icnDetailBackList: "목록으로",
  icnDetailHoursDisclaimer:
    "스냅샷에 기록된 시간입니다. 지금 영업 중인지는 알 수 없습니다.",
  icnDetailFlagDisclaimer:
    "위 구분은 공항 목록에 적힌 정보뿐입니다. 출입 제한이나 보안 구역 여부를 의미하지 않습니다.",
  icnDetailListingNotes: "목록 메모 및 한계",
  icnDetailCollectedOn: "수집일",
  icnDetailDirectoryLabel: "목록 구분",
  icnDetailDirectEntry: "목록에서 들어오지 않았습니다. 아래에서 시설 목록으로 돌아갈 수 있습니다.",
  icnDetailMissingListing: "현재 스냅샷에서 이 시설을 찾을 수 없습니다. 목록에서 다시 선택해 주세요.",
  icnDetailMissingLocale: "선택한 언어의 목록에서 이 시설을 찾을 수 없습니다.",
  icnDetailMissingLocaleNotCaptured:
    "이 링크에는 다른 언어 짝이 저장되어 있지 않습니다. 원래 언어로 다시 열어 주세요.",
  icnDetailAmbiguous: "같은 번호에 여러 목록이 있어 자동으로 고를 수 없습니다.",
  icnDetailInvalidRef: "시설 링크 형식이 올바르지 않습니다.",
  icnDetailUnsupportedVersion: (version) => `지원하지 않는 링크 버전(${version})입니다.`,
  icnDetailArrivalLabel: "입국",
  icnDetailDepartureLabel: "출국",
  icnDetailDutyFreeYes: "면세 구역 표시(목록)",
  icnDetailDutyFreeNo: "일반 구역 표시(목록)",
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
  icnDetailBackBrowse: "Facility list",
  icnDetailBackList: "Back to list",
  icnDetailHoursDisclaimer:
    "Hours come from the snapshot text only. We cannot tell if it is open now.",
  icnDetailFlagDisclaimer:
    "These labels are directory metadata only. They do not describe security access or restrictions.",
  icnDetailListingNotes: "Listing notes and limits",
  icnDetailCollectedOn: "Information collected on",
  icnDetailDirectoryLabel: "Directory labels",
  icnDetailDirectEntry: "You did not arrive from the browse list. Use the control below to return to facilities.",
  icnDetailMissingListing:
    "This facility is not in the current snapshot. Please choose again from the list.",
  icnDetailMissingLocale: "This facility is not available in the listing for the selected language.",
  icnDetailMissingLocaleNotCaptured:
    "This link does not include a stored translation pair. Open it in the original language.",
  icnDetailAmbiguous: "Multiple listings share this ID, so we cannot choose one automatically.",
  icnDetailInvalidRef: "This facility link is not valid.",
  icnDetailUnsupportedVersion: (version) => `Unsupported link version (${version}).`,
  icnDetailArrivalLabel: "Arrivals (directory)",
  icnDetailDepartureLabel: "Departures (directory)",
  icnDetailDutyFreeYes: "Duty-free area flag (listing)",
  icnDetailDutyFreeNo: "Non-duty-free flag (listing)",
};

export function mivvuPreviewMessages(locale: MivvuPreviewLocale): MivvuPreviewMessages {
  return locale === "ko" ? KO : EN;
}
