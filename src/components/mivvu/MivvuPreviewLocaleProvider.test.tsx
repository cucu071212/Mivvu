// @vitest-environment jsdom
import assert from "node:assert/strict";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, it } from "vitest";
import { MivvuPreviewLocaleProvider } from "@/components/mivvu/MivvuPreviewLocaleProvider";
import { MivvuLanguageToggle } from "@/components/mivvu/MivvuLanguageToggle";
import {
  clearStoredMivvuPreviewLocaleForTests,
  writeStoredMivvuPreviewLocale,
} from "@/lib/mivvu-preview-locale";

function LocaleProbe() {
  return <p>Korean probe</p>;
}

describe("MivvuPreviewLocaleProvider lang", () => {
  afterEach(() => {
    cleanup();
    clearStoredMivvuPreviewLocaleForTests();
  });

  it("declares lang=ko on the Mivvu content wrapper when locale is Korean", async () => {
    writeStoredMivvuPreviewLocale("ko");
    const { container } = render(
      <MivvuPreviewLocaleProvider>
        <MivvuLanguageToggle />
        <LocaleProbe />
      </MivvuPreviewLocaleProvider>,
    );
    await screen.findByText("Korean probe");
    const localeRoot = container.querySelector(".mivvu-entry-locale-root");
    assert.equal(localeRoot?.getAttribute("lang"), "ko");
    assert.notEqual(document.documentElement.getAttribute("lang"), "ko");
  });

  it("updates the wrapper to lang=en when the user switches language", async () => {
    writeStoredMivvuPreviewLocale("ko");
    const { container } = render(
      <MivvuPreviewLocaleProvider>
        <MivvuLanguageToggle />
        <LocaleProbe />
      </MivvuPreviewLocaleProvider>,
    );
    await screen.findByText("Korean probe");
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    const localeRoot = container.querySelector(".mivvu-entry-locale-root");
    assert.equal(localeRoot?.getAttribute("lang"), "en");
  });
});
