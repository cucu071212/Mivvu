import { redirect } from "next/navigation";
import { MIVVU_ENTRY_PATH } from "@/lib/mivvu-entry-routes";

export default function MivvuEntryPreviewRedirectPage() {
  redirect(MIVVU_ENTRY_PATH);
}
