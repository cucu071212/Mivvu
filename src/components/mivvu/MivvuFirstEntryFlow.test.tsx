// @vitest-environment jsdom
import assert from "node:assert/strict";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { MivvuFirstEntryFlow } from "@/components/mivvu/MivvuFirstEntryFlow";
import { MivvuPreviewLocaleProvider } from "@/components/mivvu/MivvuPreviewLocaleProvider";
import { clearMivvuIntroSessionForTests } from "@/lib/mivvu-entry-intro-session";
import { clearStoredAirportSelection } from "@/lib/airport-selection-preference";
import {
  clearStoredMivvuPreviewLocaleForTests,
  writeStoredMivvuPreviewLocale,
} from "@/lib/mivvu-preview-locale";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

function stubMatchMedia(matches = false) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

describe("MivvuFirstEntryFlow", () => {
  function renderFlow() {
    return render(
      <MivvuPreviewLocaleProvider>
        <MivvuFirstEntryFlow />
      </MivvuPreviewLocaleProvider>,
    );
  }

  beforeEach(() => {
    pushMock.mockReset();
    clearMivvuIntroSessionForTests();
    clearStoredAirportSelection();
    clearStoredMivvuPreviewLocaleForTests();
    writeStoredMivvuPreviewLocale("en");
    stubMatchMedia(false);
  });

  afterEach(() => {
    cleanup();
    clearMivvuIntroSessionForTests();
    clearStoredAirportSelection();
    clearStoredMivvuPreviewLocaleForTests();
  });

  it("skips intro when already seen this session", async () => {
    window.sessionStorage.setItem("mivvu.entry.introSeen.v1", "1");
    renderFlow();
    await screen.findByRole("heading", { name: /Choose your airport/i });
    assert.ok(!screen.queryByRole("dialog", { name: /Mivvu welcome/i }));
  });

  it("bypasses intro for reduced motion and records the session", async () => {
    stubMatchMedia(true);
    renderFlow();
    await screen.findByRole("heading", { name: /Choose your airport/i });
    assert.equal(screen.queryByRole("dialog", { name: /Mivvu welcome/i }), null);
    assert.equal(window.sessionStorage.getItem("mivvu.entry.introSeen.v1"), "1");
  });

  it("navigates to ICN browse preview and to SFO explore", async () => {
    window.sessionStorage.setItem("mivvu.entry.introSeen.v1", "1");
    renderFlow();
    await screen.findByRole("heading", { name: /Choose your airport/i });

    fireEvent.click(screen.getByRole("button", { name: /Explore ICN/i }));
    await waitFor(() =>
      assert.equal(pushMock.mock.calls[0]?.[0], "/preview/mivvu-entry/icn"),
    );

    pushMock.mockReset();
    fireEvent.click(
      screen.getByRole("radio", { name: /San Francisco International Airport/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Explore SFO/i }));
    await waitFor(() => assert.equal(pushMock.mock.calls[0]?.[0], "/explore"));
  });

  it("filters search and shows empty state", async () => {
    window.sessionStorage.setItem("mivvu.entry.introSeen.v1", "1");
    renderFlow();
    await screen.findByRole("heading", { name: /Choose your airport/i });
    fireEvent.change(screen.getByLabelText(/Search airports/i), {
      target: { value: "zzz" },
    });
    assert.ok(screen.getByText(/No airports match your search/i));
  });

  it("completes intro on tap and shows airport screen", async () => {
    renderFlow();
    const dialog = await screen.findByRole("dialog", { name: /Mivvu welcome/i });
    fireEvent.click(dialog);
    await screen.findByRole("heading", { name: /Choose your airport/i });
    assert.equal(window.sessionStorage.getItem("mivvu.entry.introSeen.v1"), "1");
  });

});
