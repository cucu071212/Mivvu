"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { MivvuIcnHeader } from "@/components/mivvu/MivvuIcnHeader";
import { useMivvuIcnSavedHeaderEntry } from "@/components/mivvu/useMivvuIcnSavedHeaderEntry";
import { useMivvuPreviewLocale } from "@/components/mivvu/MivvuPreviewLocaleProvider";
import type { IcnBrowseCatalog } from "@/lib/icn-facilities/icn-browse-view-model";
import type { IcnFacilityReferenceCatalogs } from "@/lib/icn-facilities/icn-facility-reference";
import {
  getIcnSavedFacilitiesClientSnapshot,
  getIcnSavedFacilitiesServerSnapshot,
  icnSavedFacilitiesStorageHealthy,
  notifyIcnSavedFacilitiesChanged,
  subscribeIcnSavedFacilities,
} from "@/lib/icn-facilities/icn-saved-facilities-client-store";
import { buildIcnSavedListRowViews } from "@/lib/icn-facilities/icn-saved-list-present";
import {
  resolveIcnSavedUserNoticeMessage,
  type IcnSavedUserNoticeKind,
} from "@/lib/icn-facilities/icn-saved-user-notice";
import { saveIcnSavedDetailNavigation } from "@/lib/icn-facilities/icn-saved-detail-session";
import { removeIcnSavedFacilityFromStorage } from "@/lib/icn-facilities/icn-saved-facilities-persistence";
import {
  MIVVU_ICN_BROWSE_PATH,
  MIVVU_ICN_FACILITY_DETAIL_PATH_PREFIX,
} from "@/lib/mivvu-entry-routes";

function ChevronIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type MivvuIcnSavedFacilitiesPageClientProps = {
  referenceCatalogs: IcnFacilityReferenceCatalogs;
  catalogKo: IcnBrowseCatalog;
  catalogEn: IcnBrowseCatalog;
};

export function MivvuIcnSavedFacilitiesPageClient({
  referenceCatalogs,
  catalogKo,
  catalogEn,
}: MivvuIcnSavedFacilitiesPageClientProps) {
  const router = useRouter();
  const { locale, messages } = useMivvuPreviewLocale();
  const savedEntry = useMivvuIcnSavedHeaderEntry(true);
  const [actionNoticeKind, setActionNoticeKind] = useState<IcnSavedUserNoticeKind | null>(null);
  const actionNotice = actionNoticeKind
    ? resolveIcnSavedUserNoticeMessage(actionNoticeKind, messages)
    : null;

  const snapshot = useSyncExternalStore(
    subscribeIcnSavedFacilities,
    getIcnSavedFacilitiesClientSnapshot,
    getIcnSavedFacilitiesServerSnapshot,
  );

  const catalog = locale === "ko" ? catalogKo : catalogEn;

  const rows = useMemo(() => {
    if (snapshot.read.status !== "ok") return [];
    return buildIcnSavedListRowViews({
      items: snapshot.items,
      locale,
      catalogs: referenceCatalogs,
      catalogKo,
      catalogEn,
    });
  }, [snapshot, locale, referenceCatalogs, catalogKo, catalogEn]);

  const removeSaved = useCallback(
    (serializedRef: string) => {
      const result = removeIcnSavedFacilityFromStorage(serializedRef);
      if (result.status === "ok" && result.changed) {
        notifyIcnSavedFacilitiesChanged();
        setActionNoticeKind("removed");
        return;
      }
      if (result.status === "write_failed" || result.status === "read_failed") {
        setActionNoticeKind("failed");
      }
    },
    [],
  );

  const openSavedDetail = useCallback(
    (refPathSegment: string) => {
      saveIcnSavedDetailNavigation(refPathSegment);
      router.push(`${MIVVU_ICN_FACILITY_DETAIL_PATH_PREFIX}${refPathSegment}`);
    },
    [router],
  );

  return (
    <div className="mivvu-entry-airport mivvu-icn-saved">
      <div className="mivvu-entry-airport-scroll">
        <MivvuIcnHeader
          backLabel={messages.icnSavedBackBrowse}
          onBack={() => router.push(MIVVU_ICN_BROWSE_PATH)}
          savedEntry={savedEntry}
        />

        <h1 className="mivvu-icn-browse-title">{messages.icnSavedTitle}</h1>

        {!icnSavedFacilitiesStorageHealthy(snapshot) ? (
          <p className="mivvu-icn-toast-error" role="alert">
            {messages.icnSavedStorageLoadFail}
          </p>
        ) : null}

        {actionNotice ? (
          <p
            className={actionNotice.error ? "mivvu-icn-toast-error" : "mivvu-icn-toast"}
            role={actionNotice.error ? "alert" : "status"}
          >
            {actionNotice.text}
          </p>
        ) : null}

        <p className="mivvu-icn-callout">{messages.icnSavedLocalNote}</p>

        {icnSavedFacilitiesStorageHealthy(snapshot) && rows.length === 0 ? (
          <div className="mivvu-icn-saved-empty">
            <p className="mivvu-entry-empty">{messages.icnSavedEmpty}</p>
            <Link href={MIVVU_ICN_BROWSE_PATH} className="mivvu-icn-save-btn gw-focus-ring">
              {messages.icnSavedExploreCta}
            </Link>
          </div>
        ) : null}

        {rows.length > 0 ? (
          <ul className="mivvu-icn-facility-list">
            {rows.map((row) => {
              if (row.kind === "resolved") {
                return (
                  <li key={row.serializedRef}>
                    <button
                      type="button"
                      className="mivvu-icn-facility-card mivvu-icn-saved-row-button gw-focus-ring"
                      onClick={() => openSavedDetail(row.refPathSegment)}
                    >
                      <span className="mivvu-icn-facility-card-link">
                        <span className="mivvu-icn-facility-card-main">
                          <h2 className="mivvu-icn-facility-name">{row.displayName}</h2>
                          {row.nameFromKoreanFallback ? (
                            <p className="mivvu-icn-ko-fallback">{messages.icnKoOnlyName}</p>
                          ) : null}
                          {row.placeLine ? (
                            <p className="mivvu-icn-facility-meta">{row.placeLine}</p>
                          ) : null}
                        </span>
                        <span className="mivvu-icn-facility-chevron">
                          <ChevronIcon />
                        </span>
                      </span>
                    </button>
                  </li>
                );
              }

              return (
                <li key={row.serializedRef} className="mivvu-icn-saved-stale-row">
                  <p className="mivvu-icn-saved-stale-banner" role="status">
                    {row.status === "ambiguous" ? messages.icnDetailAmbiguous : messages.icnSavedStale}
                  </p>
                  {row.displayName ? (
                    <>
                      <p className="mivvu-icn-facility-name">{row.displayName}</p>
                      <p className="mivvu-icn-ko-fallback">{messages.icnSavedLastKnownNote}</p>
                      {row.placeLine ? (
                        <p className="mivvu-icn-facility-meta">{row.placeLine}</p>
                      ) : null}
                    </>
                  ) : null}
                  <div className="mivvu-icn-saved-stale-actions">
                    <button
                      type="button"
                      className="mivvu-icn-chip mivvu-icn-chip-compact gw-focus-ring"
                      onClick={() => openSavedDetail(row.refPathSegment)}
                    >
                      {messages.icnSavedOpenDetail}
                    </button>
                    <button
                      type="button"
                      className="mivvu-icn-chip mivvu-icn-chip-compact gw-focus-ring"
                      onClick={() => removeSaved(row.serializedRef)}
                    >
                      {messages.icnRemoveSaved}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}

        <aside className="mivvu-icn-snapshot-aside">
          <h2 className="mivvu-icn-snapshot-title">{messages.icnSnapshotTitle}</h2>
          <dl className="mivvu-icn-snapshot-list">
            <div>
              <dt>{messages.icnSnapshotSource}</dt>
              <dd>{catalog.snapshot.sourceLabel}</dd>
            </div>
            <div>
              <dt>{messages.icnSnapshotDate}</dt>
              <dd>{catalog.snapshot.retrievedDateLabel}</dd>
            </div>
          </dl>
          <p className="mivvu-icn-snapshot-note">{catalog.snapshot.coverageNote}</p>
        </aside>
      </div>
    </div>
  );
}
