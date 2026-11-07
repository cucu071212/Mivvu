"use client";

// React hooks: useId는 접근성용 고유 id, useRouter는 클라이언트 라우팅에 사용합니다.
import { useId } from "react";
// next/navigation의 useRouter로 공항 선택(/)로 돌아갑니다.
import { useRouter } from "next/navigation";
// ICN과 동일한 두 줄 헤더 컴포넌트를 재사용합니다.
import { MivvuIcnHeader } from "@/components/mivvu/MivvuIcnHeader";
// KO/EN 메시지와 locale 상태를 읽는 Mivvu 프리뷰 locale 훅입니다.
import { useMivvuPreviewLocale } from "@/components/mivvu/MivvuPreviewLocaleProvider";
// 공항 선택 허브로 돌아가는 경로 상수입니다.
import { MIVVU_ENTRY_PATH } from "@/lib/mivvu-entry-routes";

/** 검색 입력 왼쪽에 표시하는 돋보기 아이콘(장식용, aria-hidden). */
function SearchIcon() {
  // SVG는 시각 장식만 담당하므로 스크린리더에서 숨깁니다.
  return (
    <svg
      className="mivvu-entry-search-icon"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 카테고리 트리거 오른쪽 쉐브론(장식용). */
function ChevronIcon() {
  // 비활성 컨트롤에도 ICN과 같은 시각 구조를 유지하기 위해 동일 아이콘을 씁니다.
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * 공개 SFO 브라우즈 화면.
 * ICN 허브와 같은 레이아웃을 쓰되 시설 데이터·ICN 저장 상태를 읽지 않고
 * 검색/필터/저장 컨트롤을 비활성으로 둡니다.
 */
export function MivvuSfoFacilitiesBrowseScreen() {
  // App Router 클라이언트 네비게이션 핸들입니다.
  const router = useRouter();
  // 현재 locale과 번역 메시지 묶음입니다.
  const { messages } = useMivvuPreviewLocale();
  // 검색 input과 label을 연결할 고유 id입니다.
  const searchId = useId();
  // 검색 힌트 문구와 aria-describedby를 연결할 id입니다.
  const searchHintId = useId();
  // 터미널 필터 그룹 레이블 id입니다.
  const terminalGroupId = useId();

  // ICN 저장 목록을 구독하지 않고, 배지/카운트 없이 비활성 저장 컨트롤만 표시합니다.
  const disabledSavedEntry = {
    disabled: true as const,
    label: messages.icnSavedEntry,
  };

  return (
    // ICN browse와 같은 셸 클래스를 재사용해 시각 구조를 맞춥니다.
    <div className="mivvu-entry-airport mivvu-icn-browse mivvu-sfo-browse">
      <div className="mivvu-entry-airport-scroll">
        <MivvuIcnHeader
          // ICN과 동일하게 “공항 선택”으로 돌아가는 백 라벨을 재사용합니다.
          backLabel={messages.icnBack}
          onBack={() => {
            // SFO는 ICN hub filter/session을 건드리지 않고 진입 허브로만 이동합니다.
            router.push(MIVVU_ENTRY_PATH);
          }}
          // 저장 링크/카운트 없이 비활성 컨트롤만 전달합니다.
          savedEntry={disabledSavedEntry}
        />

        <div className="mivvu-icn-browse-hero">
          {/* 공항 이름과 IATA 코드를 제목에 함께 표시합니다. */}
          <h1 className="mivvu-icn-browse-title">{messages.sfoTitle}</h1>
        </div>

        <div className="mivvu-entry-search-wrap mivvu-icn-search-wrap">
          <label className="mivvu-entry-sr-only" htmlFor={searchId}>
            {messages.icnSearchLabel}
          </label>
          {/* 비활성 검색 래퍼: 위치는 ICN과 동일, 상호작용만 막습니다. */}
          <div className="mivvu-entry-search mivvu-icn-search mivvu-sfo-control-disabled">
            <SearchIcon />
            <input
              id={searchId}
              type="search"
              className="mivvu-entry-search-input gw-focus-ring"
              placeholder={messages.icnSearchPlaceholder}
              // 시설 데이터가 없으므로 값은 항상 비웁니다.
              value=""
              // 읽기 전용·비활성으로 입력 변경을 차단합니다.
              disabled
              readOnly
              autoComplete="off"
              aria-describedby={searchHintId}
            />
          </div>
          <p id={searchHintId} className="mivvu-icn-search-hint">
            {messages.icnSearchHint}
          </p>
        </div>

        <div className="mivvu-icn-terminal-filters" role="group" aria-labelledby={terminalGroupId}>
          <span id={terminalGroupId} className="mivvu-entry-sr-only">
            {messages.icnTerminalLabel}
          </span>
          <div className="mivvu-icn-chip-row">
            {/* ICN의 “전체” 칩 자리를 유지하되 선택/변경은 불가합니다. */}
            <button
              type="button"
              className="mivvu-icn-chip mivvu-icn-chip-active mivvu-sfo-control-disabled gw-focus-ring"
              aria-pressed="true"
              aria-label={messages.icnTerminalAll}
              disabled
            >
              {messages.icnTerminalAll}
            </button>
          </div>
        </div>

        {/* 카테고리 트리거 위치만 유지하고 시트는 열지 않습니다. */}
        <button
          type="button"
          className="mivvu-icn-category-trigger mivvu-sfo-control-disabled gw-focus-ring"
          aria-expanded={false}
          disabled
        >
          <span className="mivvu-icn-category-trigger-label">{messages.icnCategoryLabel}</span>
          <span className="mivvu-icn-category-trigger-value">
            <span className="mivvu-icn-category-trigger-primary">
              <span>{messages.icnCategoryAll}</span>
              <ChevronIcon />
            </span>
          </span>
        </button>

        {/* 첫 로드부터 결과가 없음을 명확히 알리는 로케일별 불가 메시지입니다. */}
        <p className="mivvu-entry-empty mivvu-sfo-unavailable" role="status">
          {messages.sfoFacilityUnavailable}
        </p>
      </div>
    </div>
  );
}
