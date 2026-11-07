import type { IcnFacilitiesFixture, IcnFacilityBrowseRecord } from "@/types/icn-facility-browse";
import {
  createIcnFacilityRef,
  serializeIcnFacilityRef,
  type IcnFacilityReferenceCatalogs,
} from "./icn-facility-reference";
import { encodeIcnFacilityRefForUrlPath } from "./icn-facility-ref-transport";
import { collapseDuplicateListings } from "./icn-snapshot-matching";
import type { IcnBrowseCatalog } from "./icn-browse-view-model";
import { buildIcnBrowseCatalog } from "./icn-browse-view-model";
import type { MivvuPreviewLocale } from "@/lib/mivvu-preview-locale";

/** Full normalized catalogs for reference creation and resolution (server boundary). */
export function buildIcnFacilityReferenceCatalogs(
  koFixture: IcnFacilitiesFixture,
  enFixture: IcnFacilitiesFixture,
): IcnFacilityReferenceCatalogs {
  return {
    K: collapseDuplicateListings(koFixture.facilities),
    E: collapseDuplicateListings(enFixture.facilities),
  };
}

function transportForRecord(record: IcnFacilityBrowseRecord, catalogs: IcnFacilityReferenceCatalogs): string {
  const ref = createIcnFacilityRef(record, catalogs);
  return encodeIcnFacilityRefForUrlPath(serializeIcnFacilityRef(ref));
}

/** Attach encoded path segments from normalized rows — never from browse index alone. */
export function buildIcnBrowseCatalogWithDetailRefs(
  fixture: IcnFacilitiesFixture,
  locale: MivvuPreviewLocale,
  referenceCatalogs: IcnFacilityReferenceCatalogs,
): IcnBrowseCatalog {
  const collapsed = collapseDuplicateListings(fixture.facilities);
  const base = buildIcnBrowseCatalog(fixture, locale);
  const transportById = new Map<string, string>();
  for (const record of collapsed) {
    const listId = `browse-${record.listingIndex}`;
    transportById.set(listId, transportForRecord(record, referenceCatalogs));
  }
  return {
    ...base,
    items: base.items.map((item) => ({
      ...item,
      detailRefTransport: transportById.get(item.id) ?? "",
    })),
  };
}
