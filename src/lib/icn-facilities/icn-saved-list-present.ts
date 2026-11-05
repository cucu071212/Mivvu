import type { MivvuPreviewLocale } from "@/lib/mivvu-preview-locale";
import { resolveIcnFacilityRef, type IcnFacilityReferenceCatalogs } from "./icn-facility-reference";
import { buildIcnFacilityDetailView, mivvuPreviewLocaleToIcnLanguage } from "./icn-facility-detail-present";
import { buildKoreanFallbackIndex } from "./icn-browse-display";
import type { IcnBrowseCatalog } from "./icn-browse-view-model";
import type { IcnSavedFacilityPersistedItem } from "./icn-saved-facilities-persistence";
import { encodeIcnFacilityRefForUrlPath } from "./icn-facility-ref-transport";
import { MIVVU_ICN_FACILITY_DETAIL_PATH_PREFIX } from "@/lib/mivvu-entry-routes";

export type IcnSavedListRowView =
  | {
      kind: "resolved";
      serializedRef: string;
      refPathSegment: string;
      detailHref: string;
      displayName: string;
      nameFromKoreanFallback: boolean;
      placeLine: string | null;
      savedAtMs: number;
    }
  | {
      kind: "last_known";
      serializedRef: string;
      refPathSegment: string;
      detailHref: string;
      displayName: string;
      placeLine: string | null;
      lastKnownLabel: true;
      savedAtMs: number;
      status: "missing" | "ambiguous" | "invalid_reference" | "unsupported_version";
    };

export function buildIcnSavedListRowViews(input: {
  items: readonly IcnSavedFacilityPersistedItem[];
  locale: MivvuPreviewLocale;
  catalogs: IcnFacilityReferenceCatalogs;
  catalogKo: IcnBrowseCatalog;
  catalogEn: IcnBrowseCatalog;
}): IcnSavedListRowView[] {
  const language = mivvuPreviewLocaleToIcnLanguage(input.locale);
  const koFallback =
    input.locale === "en"
      ? buildKoreanFallbackIndex(input.catalogKo.items, input.catalogEn.items)
      : null;

  return input.items.map((item) => {
    const resolution = resolveIcnFacilityRef(item.serializedRef, input.catalogs, language);
    const refPathSegment = encodeIcnFacilityRefForUrlPath(item.serializedRef);
    const detailHref = `${MIVVU_ICN_FACILITY_DETAIL_PATH_PREFIX}${refPathSegment}`;
    if (resolution.status === "found") {
      const view = buildIcnFacilityDetailView(resolution, input.locale, koFallback);
      if (view.kind === "found") {
        return {
          kind: "resolved",
          serializedRef: item.serializedRef,
          refPathSegment,
          detailHref,
          displayName: view.displayName,
          nameFromKoreanFallback: view.nameFromKoreanFallback,
          placeLine: view.placeLine,
          savedAtMs: item.savedAtMs,
        };
      }
    }

    const lastKnown = item.lastKnown;
    if (lastKnown) {
      return {
        kind: "last_known",
        serializedRef: item.serializedRef,
        refPathSegment,
        detailHref,
        displayName: lastKnown.displayName,
        placeLine: lastKnown.placeLine,
        lastKnownLabel: true,
        savedAtMs: item.savedAtMs,
        status:
          resolution.status === "ambiguous"
            ? "ambiguous"
            : resolution.status === "unsupported_version"
              ? "unsupported_version"
              : resolution.status === "invalid_reference"
                ? "invalid_reference"
                : "missing",
      };
    }

    return {
      kind: "last_known",
      serializedRef: item.serializedRef,
      refPathSegment,
      detailHref,
      displayName: "",
      placeLine: null,
      lastKnownLabel: true,
      savedAtMs: item.savedAtMs,
      status:
        resolution.status === "ambiguous"
          ? "ambiguous"
          : resolution.status === "unsupported_version"
            ? "unsupported_version"
            : resolution.status === "invalid_reference"
              ? "invalid_reference"
              : "missing",
    };
  });
}
