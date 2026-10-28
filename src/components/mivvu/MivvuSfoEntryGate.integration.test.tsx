// @vitest-environment jsdom
import assert from "node:assert/strict";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { AirportSelectionProvider } from "@/context/airport-selection";
import { AirportSelectionLayout } from "@/components/AirportSelectionLayout";
import { MivvuAirportSelectionScreen } from "@/components/mivvu/MivvuAirportSelectionScreen";
import { MivvuPreviewLocaleProvider } from "@/components/mivvu/MivvuPreviewLocaleProvider";
import {
  AIRPORT_SELECTION_STORAGE_KEY,
  acknowledgeAirportSelection,
  clearStoredAirportSelection,
  isAirportSelectionAcknowledged,
  readStoredAirportSelection,
} from "@/lib/airport-selection-preference";
import { clearMivvuIntroSessionForTests } from "@/lib/mivvu-entry-intro-session";
import {
  clearStoredMivvuPreviewLocaleForTests,
  writeStoredMivvuPreviewLocale,
} from "@/lib/mivvu-preview-locale";

const pushMock = vi.fn();
const replaceMock = vi.fn();

import { GateWiseSessionProvider } from "@/context/gatewise-session";
import { prepareProductionFacilities } from "@/lib/browse-integration";
import facilitiesJson from "@/data/facilities.json";

const { facilities, datasetErrors } = prepareProductionFacilities(facilitiesJson);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => "/explore",
}));

function renderExploreShell() {
  return render(
    <AirportSelectionProvider>
      <GateWiseSessionProvider facilities={facilities} datasetErrors={datasetErrors}>
        <AirportSelectionLayout>
          <h1>Browse vs recommend</h1>
        </AirportSelectionLayout>
      </GateWiseSessionProvider>
    </AirportSelectionProvider>,
  );
}

function renderMivvuAirport() {
  return render(
    <MivvuPreviewLocaleProvider>
      <MivvuAirportSelectionScreen />
    </MivvuPreviewLocaleProvider>,
  );
}

async function chooseSfoFromMivvu() {
  await screen.findByRole("heading", { name: /Choose your airport/i });
  fireEvent.click(
    screen.getByRole("radio", { name: /San Francisco International Airport/i }),
  );
  fireEvent.click(screen.getByRole("button", { name: /Explore SFO/i }));
  await waitFor(() => assert.equal(pushMock.mock.calls.at(-1)?.[0], "/explore"));
}

describe("Mivvu SFO entry and airport gate", () => {
  beforeEach(() => {
    pushMock.mockReset();
    replaceMock.mockReset();
    clearStoredAirportSelection();
    clearMivvuIntroSessionForTests();
    clearStoredMivvuPreviewLocaleForTests();
    writeStoredMivvuPreviewLocale("en");
    window.sessionStorage.setItem("mivvu.entry.introSeen.v1", "1");
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    clearStoredAirportSelection();
    clearMivvuIntroSessionForTests();
    clearStoredMivvuPreviewLocaleForTests();
  });

  it("keeps /explore open when localStorage setItem throws QuotaExceededError", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });

    renderMivvuAirport();
    await chooseSfoFromMivvu();
    assert.equal(readStoredAirportSelection(), null);
    assert.equal(isAirportSelectionAcknowledged(), true);

    cleanup();
    replaceMock.mockReset();
    renderExploreShell();
    await screen.findByRole("heading", { name: "Browse vs recommend" });
    assert.equal(replaceMock.mock.calls.some((call) => call[0] === "/"), false);
  });

  it("keeps /explore open when localStorage getItem throws SecurityError", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      if (key === AIRPORT_SELECTION_STORAGE_KEY) {
        throw new DOMException("denied", "SecurityError");
      }
      return null;
    });

    renderMivvuAirport();
    await chooseSfoFromMivvu();
    assert.equal(isAirportSelectionAcknowledged(), true);

    cleanup();
    replaceMock.mockReset();
    renderExploreShell();
    await screen.findByRole("heading", { name: "Browse vs recommend" });
    assert.equal(replaceMock.mock.calls.some((call) => call[0] === "/"), false);
  });

  it("redirects unacknowledged /explore visitors back to Mivvu entry", async () => {
    renderExploreShell();
    await waitFor(() =>
      assert.ok(replaceMock.mock.calls.some((call) => call[0] === "/")),
    );
    assert.equal(screen.queryByRole("heading", { name: "Browse vs recommend" }), null);
  });

  it("does not redirect again after acknowledgment on a retained provider", async () => {
    renderExploreShell();
    await waitFor(() =>
      assert.equal(
        replaceMock.mock.calls.filter((call) => call[0] === "/").length,
        1,
      ),
    );

    acknowledgeAirportSelection(new Date().toISOString().slice(0, 10));

    await screen.findByRole("heading", { name: "Browse vs recommend" });
    assert.equal(
      replaceMock.mock.calls.filter((call) => call[0] === "/").length,
      1,
    );
  });
});
