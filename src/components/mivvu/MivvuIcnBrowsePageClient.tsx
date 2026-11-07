"use client";

import { MivvuIcnFacilitiesBrowseScreen } from "@/components/mivvu/MivvuIcnFacilitiesBrowseScreen";
import { useIcnBrowseUrlSync } from "@/components/mivvu/useIcnBrowseUrlSync";
import type { IcnBrowseCatalog } from "@/lib/icn-facilities/icn-browse-view-model";

export type MivvuIcnBrowsePageClientProps = {
  catalogKo: IcnBrowseCatalog;
  catalogEn: IcnBrowseCatalog;
};

export function MivvuIcnBrowsePageClient({ catalogKo, catalogEn }: MivvuIcnBrowsePageClientProps) {
  useIcnBrowseUrlSync(catalogKo, catalogEn);
  return <MivvuIcnFacilitiesBrowseScreen catalogKo={catalogKo} catalogEn={catalogEn} />;
}
