export const MIVVU_ENTRY_INTRO_SESSION_KEY = "mivvu.entry.introSeen.v1";

export function readMivvuIntroSeenThisSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(MIVVU_ENTRY_INTRO_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function markMivvuIntroSeenThisSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(MIVVU_ENTRY_INTRO_SESSION_KEY, "1");
  } catch {
    // sessionStorage unavailable — intro may replay on refresh.
  }
}

export function clearMivvuIntroSessionForTests(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(MIVVU_ENTRY_INTRO_SESSION_KEY);
  } catch {
    // no-op
  }
}
