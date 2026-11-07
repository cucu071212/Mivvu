import { redirect } from "next/navigation";
// 공개 SFO 브라우즈 경로 상수(레거시 /plan 북마크 대상).
import { MIVVU_SFO_BROWSE_PATH } from "@/lib/mivvu-entry-routes";

/**
 * 레거시 My Plan 라우트.
 * PlanScreen 데모 코드는 유지하고 공개 URL만 /sfo로 리다이렉트합니다.
 */
export default function PlanPage() {
  redirect(MIVVU_SFO_BROWSE_PATH);
}
