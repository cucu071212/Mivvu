"use client";

// Next.js Link로 ICN 저장 목록 등 내부 경로를 이동합니다.
import Link from "next/link";
// 헤더 행1 오른쪽 Mivvu 워드마크입니다.
import { MivvuWordmark } from "@/components/mivvu/MivvuWordmark";
// 헤더 행2 언어 전환 토글입니다.
import { MivvuLanguageToggle } from "@/components/mivvu/MivvuLanguageToggle";

/** 뒤로가기 화살표 아이콘(장식용). */
function BackIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** ICN 저장 목록으로 이동하는 활성 헤더 엔트리(카운트 포함). */
export type MivvuIcnHeaderSavedLinkEntry = {
  // 저장 목록 경로(예: /icn/saved).
  href: string;
  // 버튼/링크에 보이는 라벨.
  label: string;
  // 저장된 시설 개수(0이면 배지 숨김).
  count: number;
  // 현재 페이지가 저장 목록이면 aria-current="page".
  isCurrentPage: boolean;
};

/** SFO 등에서 시설 저장을 쓸 수 없을 때 보이는 비활성 엔트리(카운트 없음). */
export type MivvuIcnHeaderSavedDisabledEntry = {
  // 비활성 모드 판별용 플래그입니다.
  disabled: true;
  // 시각적으로만 유지하는 라벨(링크/카운트 없음).
  label: string;
};

/** 헤더 저장 컨트롤 — 링크 또는 비활성 표시. */
export type MivvuIcnHeaderSavedEntry =
  | MivvuIcnHeaderSavedLinkEntry
  | MivvuIcnHeaderSavedDisabledEntry;

export type MivvuIcnHeaderProps = {
  // 뒤로가기 버튼 접근성/표시 라벨.
  backLabel: string;
  // 뒤로가기 클릭 핸들러(라우팅은 호출측 책임).
  onBack: () => void;
  // 선택적 저장 컨트롤(없으면 행2 왼쪽 스페이서).
  savedEntry?: MivvuIcnHeaderSavedEntry;
};

/** 저장 엔트리가 비활성 모드인지 좁히는 타입 가드입니다. */
function isDisabledSavedEntry(
  entry: MivvuIcnHeaderSavedEntry,
): entry is MivvuIcnHeaderSavedDisabledEntry {
  // disabled: true 리터럴이 있으면 비활성 엔트리입니다.
  return "disabled" in entry && entry.disabled === true;
}

/** Accepted GW-ICN-019 two-row header with GW-ICN-016 saved entry on row 2. */
export function MivvuIcnHeader({ backLabel, onBack, savedEntry }: MivvuIcnHeaderProps) {
  return (
    <header className="mivvu-icn-header">
      <div className="mivvu-icn-header-row1">
        <button type="button" className="mivvu-icn-back mivvu-icn-back-compact gw-focus-ring" onClick={onBack}>
          <BackIcon />
          <span className="mivvu-icn-back-text mivvu-icn-back-label">{backLabel}</span>
        </button>
        <MivvuWordmark variant="headerCompact" className="mivvu-wordmark-header-compact" />
      </div>
      <div className="mivvu-icn-header-row2">
        {savedEntry ? (
          isDisabledSavedEntry(savedEntry) ? (
            // SFO 등: 자리만 유지하고 클릭·카운트·ICN 저장 상태 연동을 막습니다.
            <span
              className="mivvu-icn-saved-link mivvu-sfo-control-disabled"
              aria-disabled="true"
              role="link"
            >
              <span className="mivvu-icn-saved-icon" aria-hidden="true">
                ★
              </span>
              <span>{savedEntry.label}</span>
            </span>
          ) : (
            <Link
              href={savedEntry.href}
              className="mivvu-icn-saved-link gw-focus-ring"
              aria-current={savedEntry.isCurrentPage ? "page" : undefined}
            >
              <span className="mivvu-icn-saved-icon" aria-hidden="true">
                ★
              </span>
              <span>{savedEntry.label}</span>
              {savedEntry.count > 0 ? (
                <span className="mivvu-icn-badge-inline">{savedEntry.count}</span>
              ) : null}
            </Link>
          )
        ) : (
          <span className="mivvu-icn-header-row2-spacer" aria-hidden="true" />
        )}
        <MivvuLanguageToggle />
      </div>
    </header>
  );
}
