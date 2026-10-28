import { redirect } from "next/navigation";
import { MIVVU_ICN_BROWSE_PATH } from "@/lib/mivvu-entry-routes";

export default function MivvuIcnBrowsePreviewRedirectPage() {
  redirect(MIVVU_ICN_BROWSE_PATH);
}
