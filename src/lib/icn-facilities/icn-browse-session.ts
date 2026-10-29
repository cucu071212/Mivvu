import {
  MIVVU_ICN_ACTIVE_DETAIL_VISIT_KEY,
  MIVVU_ICN_BROWSE_CONTEXT_SESSION_KEY,
  MIVVU_ICN_BROWSE_ORIGIN_INTENT_KEY,
} from "@/lib/mivvu-entry-routes";

/** Scoped browse→detail→hub restore payload (not GW-ICN-017 URL sync). */
export type IcnBrowseDetailSession = {
  query: string;
  terminalFilter: string;
  /** Encoded `[ref]` path segment for the detail opened from browse. */
  refPathSegment: string;
  /** When true, the next hub mount may apply filters once, then storage is cleared. */
  restoreOnNextHubVisit: boolean;
  /** Per navigation instance; paired with one-shot browse intent and active token. */
  visitToken?: string;
};

export type IcnBrowseSessionContext = Pick<IcnBrowseDetailSession, "query" | "terminalFilter">;

const SESSION_CHANGE_EVENT = "mivvu:icn-browse-session";

let detailMountCount = 0;
let registeredDetailVisitToken: string | null = null;
/** Token this document instance claimed as browse-origin (survives BFCache; not tab storage). */
let documentBrowseOriginVisitToken: string | null = null;

function notifySessionChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

function createVisitToken(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `visit-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Safe sessionStorage acquisition (property getter may throw under privacy policy). */
export function getIcnSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function safeIcnSessionGetItem(key: string): string | null {
  const storage = getIcnSessionStorage();
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeIcnSessionSetItem(key: string, value: string): boolean {
  const storage = getIcnSessionStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeIcnSessionRemoveItem(key: string): void {
  const storage = getIcnSessionStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function parseSession(raw: string | null): IcnBrowseDetailSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<IcnBrowseDetailSession>;
    if (
      typeof parsed.query !== "string"
      || typeof parsed.terminalFilter !== "string"
      || typeof parsed.refPathSegment !== "string"
      || typeof parsed.restoreOnNextHubVisit !== "boolean"
    ) {
      return null;
    }
    return {
      query: parsed.query,
      terminalFilter: parsed.terminalFilter,
      refPathSegment: parsed.refPathSegment,
      restoreOnNextHubVisit: parsed.restoreOnNextHubVisit,
      visitToken: typeof parsed.visitToken === "string" ? parsed.visitToken : undefined,
    };
  } catch {
    return null;
  }
}

export function readIcnBrowseDetailSession(): IcnBrowseDetailSession | null {
  return parseSession(safeIcnSessionGetItem(MIVVU_ICN_BROWSE_CONTEXT_SESSION_KEY));
}

export function saveIcnBrowseDetailNavigation(
  context: IcnBrowseSessionContext & { refPathSegment: string },
): void {
  const visitToken = createVisitToken();
  const payload: IcnBrowseDetailSession = {
    ...context,
    restoreOnNextHubVisit: false,
    visitToken,
  };
  if (
    safeIcnSessionSetItem(MIVVU_ICN_BROWSE_CONTEXT_SESSION_KEY, JSON.stringify(payload))
    && safeIcnSessionSetItem(MIVVU_ICN_ACTIVE_DETAIL_VISIT_KEY, visitToken)
    && safeIcnSessionSetItem(MIVVU_ICN_BROWSE_ORIGIN_INTENT_KEY, visitToken)
  ) {
    notifySessionChange();
  }
}

/** One-shot browse-card intent consumed on the matching detail surface mount. */
export function consumeBrowseOriginIntent(refPathSegment: string): string | null {
  const intent = safeIcnSessionGetItem(MIVVU_ICN_BROWSE_ORIGIN_INTENT_KEY);
  safeIcnSessionRemoveItem(MIVVU_ICN_BROWSE_ORIGIN_INTENT_KEY);
  const session = readIcnBrowseDetailSession();
  if (!intent || !session?.visitToken || session.refPathSegment !== refPathSegment) {
    return null;
  }
  if (session.visitToken !== intent) return null;
  documentBrowseOriginVisitToken = intent;
  return intent;
}

/** Re-attach browse origin on Strict Mode replay after intent was already consumed. */
export function reattachCommittedBrowseOriginVisit(refPathSegment: string): string | null {
  const session = readIcnBrowseDetailSession();
  if (!session?.visitToken || session.refPathSegment !== refPathSegment) return null;
  if (session.restoreOnNextHubVisit) return null;
  if (session.visitToken !== documentBrowseOriginVisitToken) return null;
  if (session.visitToken !== safeIcnSessionGetItem(MIVVU_ICN_ACTIVE_DETAIL_VISIT_KEY)) return null;
  return session.visitToken;
}

/** Test/helper: arm intent after save without a browse-card navigation. */
export function armBrowseOriginIntentForRef(refPathSegment: string): void {
  const session = readIcnBrowseDetailSession();
  if (!session?.visitToken || session.refPathSegment !== refPathSegment) return;
  safeIcnSessionSetItem(MIVVU_ICN_BROWSE_ORIGIN_INTENT_KEY, session.visitToken);
}

/**
 * Detail surface registration (Strict Mode safe). Notifies session subscribers when origin becomes observable.
 */
export function registerActiveDetailVisit(visitToken: string): () => void {
  const becameActive = registeredDetailVisitToken !== visitToken;
  registeredDetailVisitToken = visitToken;
  detailMountCount += 1;
  if (becameActive) {
    notifySessionChange();
  }
  return () => {
    detailMountCount -= 1;
    queueMicrotask(() => {
      if (detailMountCount > 0) return;
      if (registeredDetailVisitToken === visitToken) {
        registeredDetailVisitToken = null;
        notifySessionChange();
      }
      abandonIcnBrowseDetailSessionIfPending();
    });
  };
}

/** BFCache resume only when this document previously claimed the visit token. */
export function resumeBrowseOriginAfterBfcache(refPathSegment: string): boolean {
  const session = readIcnBrowseDetailSession();
  if (!session?.visitToken || session.refPathSegment !== refPathSegment) return false;
  if (session.restoreOnNextHubVisit) return false;
  if (documentBrowseOriginVisitToken !== session.visitToken) return false;
  safeIcnSessionSetItem(MIVVU_ICN_ACTIVE_DETAIL_VISIT_KEY, session.visitToken);
  registerActiveDetailVisit(session.visitToken);
  return true;
}

/** Persisted pagehide: keep payload for BFCache but suspend authorization for new document entries. */
export function suspendDetailVisitAuthorizationOnCachedDeparture(): void {
  safeIcnSessionRemoveItem(MIVVU_ICN_ACTIVE_DETAIL_VISIT_KEY);
  if (registeredDetailVisitToken !== null) {
    registeredDetailVisitToken = null;
    notifySessionChange();
  }
}

export function detailOpenedFromBrowse(refPathSegment: string): boolean {
  const session = readIcnBrowseDetailSession();
  if (!session || session.restoreOnNextHubVisit) return false;
  if (session.refPathSegment !== refPathSegment) return false;
  if (!session.visitToken) return false;
  if (session.visitToken !== safeIcnSessionGetItem(MIVVU_ICN_ACTIVE_DETAIL_VISIT_KEY)) {
    return false;
  }
  return registeredDetailVisitToken === session.visitToken;
}

/** Call before navigating to `/icn` from detail after a browse-origin visit. */
export function scheduleHubRestoreFromDetail(): boolean {
  const session = readIcnBrowseDetailSession();
  if (!session) return false;
  const next: IcnBrowseDetailSession = { ...session, restoreOnNextHubVisit: true };
  safeIcnSessionRemoveItem(MIVVU_ICN_ACTIVE_DETAIL_VISIT_KEY);
  registeredDetailVisitToken = null;
  if (!safeIcnSessionSetItem(MIVVU_ICN_BROWSE_CONTEXT_SESSION_KEY, JSON.stringify(next))) {
    return false;
  }
  notifySessionChange();
  return true;
}

/** Read pending restore without clearing storage. */
export function peekHubRestoreFilters(): IcnBrowseSessionContext | null {
  const session = readIcnBrowseDetailSession();
  if (!session?.restoreOnNextHubVisit) return null;
  return { query: session.query, terminalFilter: session.terminalFilter };
}

/** One-time hub filter restore after an explicit detail→list return. */
export function consumeHubRestoreFilters(): IcnBrowseSessionContext | null {
  const session = readIcnBrowseDetailSession();
  if (!session?.restoreOnNextHubVisit) return null;
  const restored = { query: session.query, terminalFilter: session.terminalFilter };
  clearIcnBrowseSessionContext();
  return restored;
}

export function clearIcnBrowseSessionContextSilently(): void {
  safeIcnSessionRemoveItem(MIVVU_ICN_BROWSE_CONTEXT_SESSION_KEY);
  safeIcnSessionRemoveItem(MIVVU_ICN_ACTIVE_DETAIL_VISIT_KEY);
  safeIcnSessionRemoveItem(MIVVU_ICN_BROWSE_ORIGIN_INTENT_KEY);
  registeredDetailVisitToken = null;
}

export function clearIcnBrowseSessionContext(): void {
  clearIcnBrowseSessionContextSilently();
  documentBrowseOriginVisitToken = null;
  notifySessionChange();
}

/** Drop pending browse association when leaving detail without an explicit list return. */
export function abandonIcnBrowseDetailSessionIfPending(): void {
  const session = readIcnBrowseDetailSession();
  if (session && !session.restoreOnNextHubVisit) {
    clearIcnBrowseSessionContext();
  }
}

export function subscribeIcnBrowseSession(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(SESSION_CHANGE_EVENT, handler);
  return () => window.removeEventListener(SESSION_CHANGE_EVENT, handler);
}
