"use client";

import { useCallback, useEffect, useId, useRef } from "react";

export type MivvuIcnCategorySheetOption = {
  value: string;
  label: string;
  labelFromKoreanFallback?: boolean;
};

export type MivvuIcnCategoryBottomSheetProps = {
  open: boolean;
  title: string;
  options: readonly MivvuIcnCategorySheetOption[];
  selectedValue: string;
  allLabel: string;
  allValue?: string;
  closeLabel: string;
  /** Shown under options when `labelFromKoreanFallback` is true (English locale). */
  koreanLabelFallbackHint?: string | null;
  onClose: () => void;
  onSelect: (value: string) => void;
};

function focusableControls(root: HTMLElement): HTMLElement[] {
  const nodes = root.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  return Array.from(nodes).filter((node) => node.tabIndex >= 0);
}

export function MivvuIcnCategoryBottomSheet({
  open,
  title,
  options,
  selectedValue,
  allLabel,
  allValue = "all",
  closeLabel,
  koreanLabelFallbackHint = null,
  onClose,
  onSelect,
}: MivvuIcnCategoryBottomSheetProps) {
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const requestClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const sheet = sheetRef.current;
    const closeButton = sheet?.querySelector<HTMLElement>("[data-icn-sheet-close]");
    closeButton?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus?.();
      restoreFocusRef.current = null;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key !== "Tab") return;
      const sheet = sheetRef.current;
      if (!sheet) return;
      const controls = focusableControls(sheet);
      if (controls.length === 0) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === sheet)) {
        event.preventDefault();
        last.focus();
        return;
      }
      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, requestClose]);

  if (!open) return null;

  const allOptions: MivvuIcnCategorySheetOption[] = [
    { value: allValue, label: allLabel },
    ...options,
  ];

  return (
    <div className="mivvu-icn-sheet-root">
      <button
        type="button"
        className="mivvu-icn-sheet-backdrop gw-focus-ring"
        aria-label={closeLabel}
        onClick={requestClose}
      />
      <div
        ref={sheetRef}
        className="mivvu-icn-sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="mivvu-icn-sheet-header">
          <h2 id={titleId} className="mivvu-icn-sheet-title">
            {title}
          </h2>
          <button
            type="button"
            className="mivvu-icn-sheet-close gw-focus-ring"
            data-icn-sheet-close
            onClick={requestClose}
          >
            {closeLabel}
          </button>
        </div>
        <ul className="mivvu-icn-sheet-options">
          {allOptions.map((option) => {
            const selected = option.value === selectedValue;
            const showFallbackHint =
              Boolean(koreanLabelFallbackHint) && Boolean(option.labelFromKoreanFallback);
            return (
              <li key={option.value}>
                <button
                  type="button"
                  aria-pressed={selected}
                  className={`mivvu-icn-sheet-option gw-focus-ring ${selected ? "mivvu-icn-sheet-option-active" : ""}`}
                  onClick={() => {
                    onSelect(option.value);
                    requestClose();
                  }}
                >
                  <span className="mivvu-icn-sheet-option-label">{option.label}</span>
                  {showFallbackHint ? (
                    <span className="mivvu-icn-ko-fallback">{koreanLabelFallbackHint}</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
