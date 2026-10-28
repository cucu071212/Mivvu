export type MivvuPreviewLocale = "ko" | "en";

export const MIVVU_PREVIEW_LOCALE_STORAGE_KEY = "mivvu.preview.locale.v1";

export function isMivvuPreviewLocale(value: string): value is MivvuPreviewLocale {
  return value === "ko" || value === "en";
}

export function resolveBrowserDefaultMivvuLocale(): MivvuPreviewLocale {
  if (typeof navigator === "undefined") return "en";
  const candidates = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  for (const tag of candidates) {
    if (tag.toLowerCase().startsWith("ko")) return "ko";
  }
  return "en";
}

export function readStoredMivvuPreviewLocale(): MivvuPreviewLocale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MIVVU_PREVIEW_LOCALE_STORAGE_KEY);
    if (raw && isMivvuPreviewLocale(raw)) return raw;
  } catch {
    return null;
  }
  return null;
}

export function writeStoredMivvuPreviewLocale(locale: MivvuPreviewLocale): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MIVVU_PREVIEW_LOCALE_STORAGE_KEY, locale);
  } catch {
    // ignore quota / privacy mode
  }
}

export function resolveMivvuPreviewLocale(
  stored: MivvuPreviewLocale | null,
  browserDefault: MivvuPreviewLocale,
): MivvuPreviewLocale {
  return stored ?? browserDefault;
}

export function clearStoredMivvuPreviewLocaleForTests(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(MIVVU_PREVIEW_LOCALE_STORAGE_KEY);
  } catch {
    // no-op
  }
}
