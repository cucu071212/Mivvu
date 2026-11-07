import { redirect } from "next/navigation";
// 공개 SFO 브라우즈 경로 상수(레거시 /explore 북마크 대상).
import { MIVVU_SFO_BROWSE_PATH } from "@/lib/mivvu-entry-routes";

/**
 * 레거시 Explore 라우트.
 * ExploreScreen 등 데모 UI/데이터는 저장소에 유지하되 공개 URL에서는 /sfo로 보냅니다.
 */
export default function ExplorePage() {
  // next.config redirects와 함께 이중으로 공개 데모 노출을 막습니다.
  redirect(MIVVU_SFO_BROWSE_PATH);
}
