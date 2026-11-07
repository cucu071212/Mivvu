import type { Metadata } from "next";
// 공개 SFO 브라우즈 UI(시설 데이터 없음, ICN 레이아웃 재사용).
import { MivvuSfoFacilitiesBrowseScreen } from "@/components/mivvu/MivvuSfoFacilitiesBrowseScreen";

/**
 * Cache Components instant-navigation validation: mivvu-entry client shells
 * are not fully rendered during the validation pass (same class of insight as `/` / `/icn`).
 * Opt out so soft navigations from airport selection are not blocked in development.
 */
export const instant = false;

// App Router 메타데이터: 탭 제목·설명에 SFO 공개 브라우즈임을 명시합니다.
export const metadata: Metadata = {
  title: "Mivvu · San Francisco (SFO)",
  description:
    "San Francisco International Airport browse shell. Facility listings are not available in this public experience.",
};

/** `/sfo` 공개 라우트 — ICN형 레이아웃 + 시설 정보 이용 불가 상태. */
export default function MivvuSfoBrowseRoutePage() {
  // 클라이언트 스크린을 서버 페이지에서 그대로 마운트합니다.
  return <MivvuSfoFacilitiesBrowseScreen />;
}
