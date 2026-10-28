"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type MivvuPreviewLocale,
  readStoredMivvuPreviewLocale,
  resolveBrowserDefaultMivvuLocale,
  resolveMivvuPreviewLocale,
  writeStoredMivvuPreviewLocale,
} from "@/lib/mivvu-preview-locale";
import { mivvuPreviewMessages, type MivvuPreviewMessages } from "@/lib/mivvu-preview-messages";

type MivvuPreviewLocaleContextValue = {
  locale: MivvuPreviewLocale;
  messages: MivvuPreviewMessages;
  setLocale: (locale: MivvuPreviewLocale) => void;
  ready: boolean;
};

const MivvuPreviewLocaleContext = createContext<MivvuPreviewLocaleContextValue | null>(null);

export function MivvuPreviewLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<MivvuPreviewLocale | null>(null);

  useEffect(() => {
    const stored = readStoredMivvuPreviewLocale();
    const browser = resolveBrowserDefaultMivvuLocale();
    // Post-mount only: keep server and first client paint on the boot shell to avoid locale flash/mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration gate for localStorage + navigator
    setLocaleState(resolveMivvuPreviewLocale(stored, browser));
  }, []);

  const setLocale = useCallback((next: MivvuPreviewLocale) => {
    writeStoredMivvuPreviewLocale(next);
    setLocaleState(next);
  }, []);

  const value = useMemo(() => {
    if (!locale) return null;
    return {
      locale,
      messages: mivvuPreviewMessages(locale),
      setLocale,
      ready: true,
    };
  }, [locale, setLocale]);

  if (!value) {
    return (
      <div
        className="mivvu-entry-intro mivvu-entry-intro-boot"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading"
      />
    );
  }

  return (
    <MivvuPreviewLocaleContext.Provider value={value}>{children}</MivvuPreviewLocaleContext.Provider>
  );
}

export function useMivvuPreviewLocale(): MivvuPreviewLocaleContextValue {
  const ctx = useContext(MivvuPreviewLocaleContext);
  if (!ctx) {
    throw new Error("useMivvuPreviewLocale must be used within MivvuPreviewLocaleProvider");
  }
  return ctx;
}
