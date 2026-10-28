"use client";

import { useMivvuPreviewLocale } from "@/components/mivvu/MivvuPreviewLocaleProvider";
import type { MivvuPreviewLocale } from "@/lib/mivvu-preview-locale";

export function MivvuLanguageToggle() {
  const { locale, messages, setLocale } = useMivvuPreviewLocale();

  function select(next: MivvuPreviewLocale) {
    if (next !== locale) setLocale(next);
  }

  return (
    <div
      className="mivvu-lang-toggle"
      role="group"
      aria-label={messages.languageToggleLabel}
    >
      <button
        type="button"
        className={`mivvu-lang-toggle-btn gw-focus-ring ${locale === "ko" ? "mivvu-lang-toggle-active" : ""}`}
        aria-pressed={locale === "ko"}
        onClick={() => select("ko")}
      >
        {messages.languageKo}
      </button>
      <span className="mivvu-lang-toggle-sep" aria-hidden="true">/</span>
      <button
        type="button"
        className={`mivvu-lang-toggle-btn gw-focus-ring ${locale === "en" ? "mivvu-lang-toggle-active" : ""}`}
        aria-pressed={locale === "en"}
        onClick={() => select("en")}
      >
        {messages.languageEn}
      </button>
    </div>
  );
}
