import type { Metadata } from "next"; // Next.js 메타데이터 타입 (next 패키지)
import type { ReactNode } from "react"; // React 자식 노드 타입 (react 패키지)
import { notFound } from "next/navigation"; // 환경이 닫혀 있으면 404로 응답 (next/navigation)
import { prepareProductionFacilities } from "@/lib/browse-integration"; // facilities.json을 데모용 Facility 배열로 정규화
import facilitiesJson from "@/data/facilities.json"; // 보존된 SFO 데모 시설 데이터
import { GateWiseProviders } from "@/components/GateWiseProviders"; // 세션+공항선택+AppShell을 이미 감싸는 프로바이더
import { isSfoDemoHarnessEnabled } from "@/lib/sfo-demo-harness"; // GATEWISE_SFO_DEMO_HARNESS===1 여부

export const metadata: Metadata = {
  // 브라우저 탭 제목 — 공개 제품 표면이 아님을 문서화
  title: "GateWise",
  // 검색/디버그에 노출되는 설명 — 테스트 전용 하네스임을 명시
  description:
    "Test-only SFO demo harness. Closed unless GATEWISE_SFO_DEMO_HARNESS=1.",
};

/**
 * Cache Components: 요청/환경 게이트이므로 instant 정적 미리보기를 끈다.
 */
export const instant = false;

// 빌드 시 한 번 시설 목록과 검증 오류를 준비한다 (기존 (app) 레이아웃과 동일).
const { facilities, datasetErrors } = prepareProductionFacilities(facilitiesJson);

/**
 * 보존된 SFO 데모 화면을 e2e용으로만 마운트한다.
 * GateWiseProviders가 이미 AirportSelectionLayout/AppShell을 포함하므로
 * 여기서 레이아웃을 한 번 더 감싸면 네비/카운트다운이 이중 렌더된다.
 * 플래그가 없으면 notFound()로 데모 UI를 제공하지 않는다.
 */
export default function SfoDemoHarnessLayout({ children }: { children: ReactNode }) {
  // 환경 변수가 명시적으로 "1"이 아니면 공개 start와 동일하게 404
  if (!isSfoDemoHarnessEnabled()) {
    notFound();
  }

  // (app)/layout.tsx와 동일: Providers만 감싸고 children은 화면 페이지만 전달
  return (
    <GateWiseProviders facilities={facilities} datasetErrors={datasetErrors}>
      {children}
    </GateWiseProviders>
  );
}
