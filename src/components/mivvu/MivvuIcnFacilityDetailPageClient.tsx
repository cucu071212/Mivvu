"use client";

import { useCallback, useLayoutEffect, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { MivvuIcnHeader } from "@/components/mivvu/MivvuIcnHeader";
import { useMivvuIcnSavedHeaderEntry } from "@/components/mivvu/useMivvuIcnSavedHeaderEntry";
import { useMivvuPreviewLocale } from "@/components/mivvu/MivvuPreviewLocaleProvider";
import type { IcnFacilityDetailView } from "@/lib/icn-facilities/icn-facility-detail-present";
import type { IcnBrowseCatalogSnapshot } from "@/lib/icn-facilities/icn-browse-view-model";
import type { IcnGoodsServicesDetailProjection } from "@/types/icn-goods-services-companion";
import { MivvuIcnGoodsServicesSection } from "@/components/mivvu/MivvuIcnGoodsServicesSection";
import {
  abandonIcnBrowseDetailSessionIfPending,
  consumeBrowseOriginIntent,
  detailOpenedFromBrowse,
  registerActiveDetailVisit,
  reattachCommittedBrowseOriginVisit,
  resumeBrowseOriginAfterBfcache,
  scheduleHubRestoreFromDetail,
  subscribeIcnBrowseSession,
  suspendDetailVisitAuthorizationOnCachedDeparture,
} from "@/lib/icn-facilities/icn-browse-session";
import {
  consumeSavedDetailOriginIntent,
  detailOpenedFromSaved,
  reattachCommittedSavedOriginVisit,
  registerActiveSavedDetailVisit,
  subscribeIcnSavedDetailSession,
} from "@/lib/icn-facilities/icn-saved-detail-session";
import {
  getIcnSavedFacilitiesClientSnapshot,
  notifyIcnSavedFacilitiesChanged,
  subscribeIcnSavedFacilities,
} from "@/lib/icn-facilities/icn-saved-facilities-client-store";
import {
  isIcnSavedFacilityStored,
  toggleIcnSavedFacilityInStorage,
} from "@/lib/icn-facilities/icn-saved-facilities-persistence";
import {
  resolveIcnSavedUserNoticeMessage,
  type IcnSavedUserNoticeKind,
} from "@/lib/icn-facilities/icn-saved-user-notice";
import { MIVVU_ICN_BROWSE_PATH, MIVVU_ICN_SAVED_FACILITIES_PATH } from "@/lib/mivvu-entry-routes";

export type MivvuIcnFacilityDetailPageClientProps = {
  refPathSegment: string;
  snapshotKo: IcnBrowseCatalogSnapshot;
  snapshotEn: IcnBrowseCatalogSnapshot;
  detailKo: IcnFacilityDetailView;
  detailEn: IcnFacilityDetailView;
  goodsServicesKo: IcnGoodsServicesDetailProjection;
  goodsServicesEn: IcnGoodsServicesDetailProjection;
  serializedRef: string;
  labeledDevSyntheticCompanion?: boolean;
};

function errorMessage(
  view: Extract<IcnFacilityDetailView, { kind: "error" }>,
  messages: ReturnType<typeof useMivvuPreviewLocale>["messages"],
): string {
  if (view.status === "missing") {
    if (view.reason === "locale_content_not_found") return messages.icnDetailMissingLocale;
    if (view.reason === "locale_not_captured") return messages.icnDetailMissingLocaleNotCaptured;
    return messages.icnDetailMissingListing;
  }
  if (view.status === "ambiguous") return messages.icnDetailAmbiguous;
  if (view.status === "unsupported_version") {
    return messages.icnDetailUnsupportedVersion(String(view.version ?? ""));
  }
  return messages.icnDetailInvalidRef;
}

function readFromSavedSnapshot(refPathSegment: string): boolean {
  return detailOpenedFromSaved(refPathSegment);
}

function readIsSaved(serializedRef: string): boolean {
  const snapshot = getIcnSavedFacilitiesClientSnapshot();
  if (snapshot.read.status !== "ok") return false;
  return isIcnSavedFacilityStored(snapshot.items, serializedRef);
}

export function MivvuIcnFacilityDetailPageClient({
  refPathSegment,
  snapshotKo,
  snapshotEn,
  detailKo,
  detailEn,
  goodsServicesKo,
  goodsServicesEn,
  serializedRef,
  labeledDevSyntheticCompanion = false,
}: MivvuIcnFacilityDetailPageClientProps) {
  const router = useRouter();
  const { locale, messages } = useMivvuPreviewLocale();
  const savedEntry = useMivvuIcnSavedHeaderEntry(false);
  const [saveNoticeKind, setSaveNoticeKind] = useState<IcnSavedUserNoticeKind | null>(null);
  const saveNotice = saveNoticeKind
    ? resolveIcnSavedUserNoticeMessage(saveNoticeKind, messages)
    : null;

  const detail = locale === "ko" ? detailKo : detailEn;
  const snapshot = locale === "ko" ? snapshotKo : snapshotEn;
  const goodsServices = locale === "ko" ? goodsServicesKo : goodsServicesEn;

  const fromBrowse = useSyncExternalStore(
    subscribeIcnBrowseSession,
    () => detailOpenedFromBrowse(refPathSegment),
    () => false,
  );

  const fromSaved = useSyncExternalStore(
    subscribeIcnSavedDetailSession,
    () => readFromSavedSnapshot(refPathSegment),
    () => false,
  );

  const isSaved = useSyncExternalStore(
    subscribeIcnSavedFacilities,
    () => readIsSaved(serializedRef),
    () => false,
  );

  useLayoutEffect(() => {
    const intentToken = consumeBrowseOriginIntent(refPathSegment);
    if (intentToken) {
      return registerActiveDetailVisit(intentToken);
    }
    const replayToken = reattachCommittedBrowseOriginVisit(refPathSegment);
    if (replayToken) {
      return registerActiveDetailVisit(replayToken);
    }
    const savedIntent = consumeSavedDetailOriginIntent(refPathSegment);
    if (savedIntent) {
      return registerActiveSavedDetailVisit(savedIntent);
    }
    const savedReplay = reattachCommittedSavedOriginVisit(refPathSegment);
    if (savedReplay) {
      return registerActiveSavedDetailVisit(savedReplay);
    }
    return undefined;
  }, [refPathSegment]);

  useLayoutEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      resumeBrowseOriginAfterBfcache(refPathSegment);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [refPathSegment]);

  useEffect(() => {
    const onPageHide = (event: PageTransitionEvent) => {
      if (event.persisted) {
        suspendDetailVisitAuthorizationOnCachedDeparture();
        return;
      }
      abandonIcnBrowseDetailSessionIfPending();
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, []);

  const returnToHub = useCallback(() => {
    if (fromBrowse) {
      scheduleHubRestoreFromDetail();
    }
    router.push(MIVVU_ICN_BROWSE_PATH);
  }, [fromBrowse, router]);

  const returnToSavedList = useCallback(() => {
    router.push(MIVVU_ICN_SAVED_FACILITIES_PATH);
  }, [router]);

  const handleBack = useCallback(() => {
    if (fromBrowse) {
      returnToHub();
      return;
    }
    if (fromSaved) {
      returnToSavedList();
      return;
    }
    returnToHub();
  }, [fromBrowse, fromSaved, returnToHub, returnToSavedList]);

  const toggleSave = useCallback(() => {
    if (detail.kind !== "found") return;
    const lastKnown = {
      displayName: detail.displayName,
      placeLine: detail.placeLine,
      locale,
    };
    const result = toggleIcnSavedFacilityInStorage({
      serializedRef,
      savedAtMs: Date.now(),
      lastKnown,
    });
    if (result.status !== "ok" || result.saved === null) {
      setSaveNoticeKind("failed");
      return;
    }
    notifyIcnSavedFacilitiesChanged();
    setSaveNoticeKind(result.saved ? "saved" : "removed");
  }, [detail, locale, serializedRef]);

  return (
    <div className="mivvu-entry-airport mivvu-icn-detail">
      <div className="mivvu-entry-airport-scroll">
        <MivvuIcnHeader
          backLabel={
            fromBrowse
              ? messages.icnDetailBackBrowse
              : fromSaved
                ? messages.icnDetailBackSaved
                : messages.icnDetailBackList
          }
          onBack={handleBack}
          savedEntry={savedEntry}
        />

        {!fromBrowse && !fromSaved ? (
          <p className="mivvu-icn-detail-banner" role="status">
            {messages.icnDetailDirectEntry}
          </p>
        ) : null}

        {detail.kind === "error" ? (
          <div className="mivvu-icn-detail-error" role="alert">
            <p>{errorMessage(detail, messages)}</p>
            <button type="button" className="mivvu-icn-detail-list-cta gw-focus-ring" onClick={handleBack}>
              {messages.icnDetailBackList}
            </button>
          </div>
        ) : (
          <>
            <article className="mivvu-icn-detail-primary">
              <h1 className="mivvu-icn-detail-name">{detail.displayName}</h1>
              {detail.nameFromKoreanFallback ? (
                <p className="mivvu-icn-ko-fallback">{messages.icnKoOnlyName}</p>
              ) : null}
              {detail.placeLine ? <p className="mivvu-icn-facility-meta">{detail.placeLine}</p> : null}
              {detail.displayLocation ? (
                <p className="mivvu-icn-facility-location">{detail.displayLocation}</p>
              ) : null}
              {detail.locationFromKoreanFallback ? (
                <p className="mivvu-icn-ko-fallback">{messages.icnKoOnlyLocation}</p>
              ) : null}
              {detail.hoursText ? (
                <div className="mivvu-icn-detail-hours">
                  <p className="mivvu-icn-facility-hours">
                    <span className="mivvu-icn-hours-prefix">{messages.icnHoursLabel}</span>
                    <span className="mivvu-icn-hours-value">
                      {detail.hoursAmbiguousEqual ? messages.icnHoursUnavailable : detail.hoursText}
                    </span>
                  </p>
                  <p className="mivvu-icn-detail-hours-note">{messages.icnDetailHoursDisclaimer}</p>
                </div>
              ) : null}
              <button
                type="button"
                className="mivvu-icn-save-btn mivvu-icn-save-btn-inline gw-focus-ring"
                aria-pressed={isSaved}
                onClick={toggleSave}
              >
                {isSaved ? messages.icnSaved : messages.icnSave}
              </button>
              {saveNotice ? (
                <p
                  className={saveNotice.error ? "mivvu-icn-toast-error" : "mivvu-icn-toast"}
                  role={saveNotice.error ? "alert" : "status"}
                >
                  {saveNotice.text}
                </p>
              ) : null}
              {detail.categoryLabel ? (
                <p className="mivvu-icn-facility-category mivvu-icn-detail-category">{detail.categoryLabel}</p>
              ) : null}
            </article>

            {labeledDevSyntheticCompanion ? (
              <p className="mivvu-icn-goods-dev-banner" role="status">
                {messages.icnGoodsServicesDevVerificationBanner}
              </p>
            ) : null}

            <MivvuIcnGoodsServicesSection
              projection={goodsServices}
              locale={locale}
              messages={messages}
            />

            <details className="mivvu-icn-detail-notes">
              <summary>{messages.icnDetailListingNotes}</summary>
              <dl className="mivvu-icn-detail-notes-list">
                {detail.arrivalOrDeparture ? (
                  <div>
                    <dt>{messages.icnDetailDirectoryLabel}</dt>
                    <dd>
                      {detail.arrivalOrDeparture === "A"
                        ? messages.icnDetailArrivalLabel
                        : messages.icnDetailDepartureLabel}
                    </dd>
                  </div>
                ) : null}
                {detail.dutyFreeFlag ? (
                  <div>
                    <dt>{messages.icnDetailDirectoryLabel}</dt>
                    <dd>
                      {detail.dutyFreeFlag === "Y"
                        ? messages.icnDetailDutyFreeYes
                        : messages.icnDetailDutyFreeNo}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt>{messages.icnDetailCollectedOn}</dt>
                  <dd>{snapshot.retrievedDateLabel}</dd>
                </div>
                <div>
                  <dt>{messages.icnSnapshotSource}</dt>
                  <dd>{snapshot.sourceLabel}</dd>
                </div>
              </dl>
              <p className="mivvu-icn-detail-flag-note">{messages.icnDetailFlagDisclaimer}</p>
              <p className="mivvu-icn-snapshot-note">{snapshot.coverageNote}</p>
            </details>
          </>
        )}
      </div>
    </div>
  );
}
