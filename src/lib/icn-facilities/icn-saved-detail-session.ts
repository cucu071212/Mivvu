import {
  MIVVU_ICN_ACTIVE_SAVED_DETAIL_VISIT_KEY,
  MIVVU_ICN_SAVED_DETAIL_CONTEXT_SESSION_KEY,
  MIVVU_ICN_SAVED_DETAIL_ORIGIN_INTENT_KEY,
} from "@/lib/mivvu-entry-routes";
import { getIcnSessionStorage, safeIcnSessionGetItem } from "./icn-browse-session";

export type IcnSavedDetailSession = {
  refPathSegment: string;
  visitToken: string;
};

const SESSION_CHANGE_EVENT = "mivvu:icn-saved-detail-session";

let savedDetailMountCount = 0;
let registeredSavedDetailVisitToken: string | null = null;
let documentSavedOriginVisitToken: string | null = null;

function notifySessionChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

function createVisitToken(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `saved-visit-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function safeSetItem(key: string, value: string): boolean {
  const storage = getIcnSessionStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemoveItem(key: string): void {
  const storage = getIcnSessionStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function parseSession(raw: string | null): IcnSavedDetailSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<IcnSavedDetailSession>;
    if (typeof parsed.refPathSegment !== "string" || typeof parsed.visitToken !== "string") return null;
    return { refPathSegment: parsed.refPathSegment, visitToken: parsed.visitToken };
  } catch {
    return null;
  }
}

export function readIcnSavedDetailSession(): IcnSavedDetailSession | null {
  return parseSession(safeIcnSessionGetItem(MIVVU_ICN_SAVED_DETAIL_CONTEXT_SESSION_KEY));
}

export function saveIcnSavedDetailNavigation(refPathSegment: string): void {
  const visitToken = createVisitToken();
  const payload: IcnSavedDetailSession = { refPathSegment, visitToken };
  if (
    safeSetItem(MIVVU_ICN_SAVED_DETAIL_CONTEXT_SESSION_KEY, JSON.stringify(payload))
    && safeSetItem(MIVVU_ICN_ACTIVE_SAVED_DETAIL_VISIT_KEY, visitToken)
    && safeSetItem(MIVVU_ICN_SAVED_DETAIL_ORIGIN_INTENT_KEY, visitToken)
  ) {
    notifySessionChange();
  }
}

export function consumeSavedDetailOriginIntent(refPathSegment: string): string | null {
  const intent = safeIcnSessionGetItem(MIVVU_ICN_SAVED_DETAIL_ORIGIN_INTENT_KEY);
  safeRemoveItem(MIVVU_ICN_SAVED_DETAIL_ORIGIN_INTENT_KEY);
  const session = readIcnSavedDetailSession();
  if (!intent || !session?.visitToken || session.refPathSegment !== refPathSegment) return null;
  if (session.visitToken !== intent) return null;
  documentSavedOriginVisitToken = intent;
  return intent;
}

export function reattachCommittedSavedOriginVisit(refPathSegment: string): string | null {
  const session = readIcnSavedDetailSession();
  if (!session?.visitToken || session.refPathSegment !== refPathSegment) return null;
  if (session.visitToken !== documentSavedOriginVisitToken) return null;
  if (session.visitToken !== safeIcnSessionGetItem(MIVVU_ICN_ACTIVE_SAVED_DETAIL_VISIT_KEY)) return null;
  return session.visitToken;
}

export function registerActiveSavedDetailVisit(visitToken: string): () => void {
  const becameActive = registeredSavedDetailVisitToken !== visitToken;
  registeredSavedDetailVisitToken = visitToken;
  savedDetailMountCount += 1;
  if (becameActive) notifySessionChange();
  return () => {
    savedDetailMountCount -= 1;
    queueMicrotask(() => {
      if (savedDetailMountCount > 0) return;
      if (registeredSavedDetailVisitToken === visitToken) {
        registeredSavedDetailVisitToken = null;
        notifySessionChange();
      }
    });
  };
}

export function detailOpenedFromSaved(refPathSegment: string): boolean {
  const session = readIcnSavedDetailSession();
  if (!session || session.refPathSegment !== refPathSegment) return false;
  if (session.visitToken !== safeIcnSessionGetItem(MIVVU_ICN_ACTIVE_SAVED_DETAIL_VISIT_KEY)) return false;
  return registeredSavedDetailVisitToken === session.visitToken;
}

export function clearIcnSavedDetailSessionSilently(): void {
  safeRemoveItem(MIVVU_ICN_SAVED_DETAIL_CONTEXT_SESSION_KEY);
  safeRemoveItem(MIVVU_ICN_ACTIVE_SAVED_DETAIL_VISIT_KEY);
  safeRemoveItem(MIVVU_ICN_SAVED_DETAIL_ORIGIN_INTENT_KEY);
  registeredSavedDetailVisitToken = null;
}

export function clearIcnSavedDetailSession(): void {
  clearIcnSavedDetailSessionSilently();
  documentSavedOriginVisitToken = null;
  notifySessionChange();
}

export function subscribeIcnSavedDetailSession(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(SESSION_CHANGE_EVENT, handler);
  return () => window.removeEventListener(SESSION_CHANGE_EVENT, handler);
}
