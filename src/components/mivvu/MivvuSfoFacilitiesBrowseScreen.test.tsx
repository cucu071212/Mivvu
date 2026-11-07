// @vitest-environment jsdom
import assert from "node:assert/strict";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { MivvuSfoFacilitiesBrowseScreen } from "@/components/mivvu/MivvuSfoFacilitiesBrowseScreen";
import { MivvuPreviewLocaleProvider } from "@/components/mivvu/MivvuPreviewLocaleProvider";
import {
  clearStoredMivvuPreviewLocaleForTests,
  writeStoredMivvuPreviewLocale,
} from "@/lib/mivvu-preview-locale";
import { MIVVU_ICN_SAVED_FACILITIES_STORAGE_KEY } from "@/lib/mivvu-entry-routes";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

function renderSfo() {
  return render(
    <MivvuPreviewLocaleProvider>
      <MivvuSfoFacilitiesBrowseScreen />
    </MivvuPreviewLocaleProvider>,
  );
}

describe("MivvuSfoFacilitiesBrowseScreen", () => {
  beforeEach(() => {
    pushMock.mockReset();
    clearStoredMivvuPreviewLocaleForTests();
    writeStoredMivvuPreviewLocale("en");
    window.localStorage.removeItem(MIVVU_ICN_SAVED_FACILITIES_STORAGE_KEY);
  });

  afterEach(() => {
    cleanup();
    clearStoredMivvuPreviewLocaleForTests();
    window.localStorage.removeItem(MIVVU_ICN_SAVED_FACILITIES_STORAGE_KEY);
  });

  it("shows SFO title, English unavailable copy, and disabled facility controls", () => {
    renderSfo();

    assert.ok(
      screen.getByRole("heading", {
        name: /San Francisco International Airport \(SFO\)/i,
      }),
    );
    assert.equal(
      screen.getByRole("status").textContent,
      "Facility information is not available",
    );

    const search = screen.getByRole("searchbox", { name: /Search facilities/i });
    assert.equal((search as HTMLInputElement).disabled, true);

    const terminalAll = screen.getByRole("button", { name: /^All$/i });
    assert.equal((terminalAll as HTMLButtonElement).disabled, true);

    const typeTrigger = screen.getByRole("button", { name: /Type All/i });
    assert.equal((typeTrigger as HTMLButtonElement).disabled, true);

    const saved = screen.getByRole("link", { name: /Saved/i });
    assert.equal(saved.getAttribute("aria-disabled"), "true");
    assert.equal(saved.getAttribute("href"), null);
    assert.equal(screen.queryByText(/^\d+$/), null);
  });

  it("does not read ICN saved facilities storage for the header control", () => {
    window.localStorage.setItem(
      MIVVU_ICN_SAVED_FACILITIES_STORAGE_KEY,
      JSON.stringify({ version: 1, items: [{ ref: "x", savedAt: "2026-01-01T00:00:00.000Z" }] }),
    );
    const getItem = vi.spyOn(Storage.prototype, "getItem");

    renderSfo();

    const savedReads = getItem.mock.calls.filter(
      ([key]) => key === MIVVU_ICN_SAVED_FACILITIES_STORAGE_KEY,
    );
    assert.equal(savedReads.length, 0);
    assert.equal(screen.queryByText("1"), null);
    getItem.mockRestore();
  });

  it("shows Korean unavailable copy after language switch", () => {
    renderSfo();
    fireEvent.click(screen.getByRole("button", { name: /한국어/i }));
    assert.ok(
      screen.getByRole("heading", { name: /샌프란시스코 국제공항 \(SFO\)/i }),
    );
    assert.equal(screen.getByRole("status").textContent, "시설 정보를 이용할 수 없습니다");
  });

  it("navigates back to airport selection without touching ICN saved storage", () => {
    renderSfo();
    fireEvent.click(screen.getByRole("button", { name: /Airports/i }));
    assert.equal(pushMock.mock.calls.at(-1)?.[0], "/");
  });
});
