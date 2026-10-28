// @vitest-environment jsdom
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  clearStoredMivvuPreviewLocaleForTests,
  readStoredMivvuPreviewLocale,
  resolveBrowserDefaultMivvuLocale,
  resolveMivvuPreviewLocale,
  writeStoredMivvuPreviewLocale,
} from "./mivvu-preview-locale";

describe("mivvu-preview-locale", () => {
  it("prefers stored locale over browser default", () => {
    assert.equal(resolveMivvuPreviewLocale("en", "ko"), "en");
    assert.equal(resolveMivvuPreviewLocale(null, "ko"), "ko");
  });

  it("persists explicit user choice", () => {
    clearStoredMivvuPreviewLocaleForTests();
    writeStoredMivvuPreviewLocale("en");
    assert.equal(readStoredMivvuPreviewLocale(), "en");
    clearStoredMivvuPreviewLocaleForTests();
  });

  it("detects Korean browser preference", () => {
    const originalLanguage = navigator.language;
    const originalLanguages = navigator.languages;
    Object.defineProperty(navigator, "language", {
      configurable: true,
      value: "ko-KR",
    });
    Object.defineProperty(navigator, "languages", {
      configurable: true,
      value: ["ko-KR"],
    });
    assert.equal(resolveBrowserDefaultMivvuLocale(), "ko");
    Object.defineProperty(navigator, "language", {
      configurable: true,
      value: originalLanguage,
    });
    Object.defineProperty(navigator, "languages", {
      configurable: true,
      value: originalLanguages,
    });
  });
});
