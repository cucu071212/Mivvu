// @vitest-environment jsdom
import assert from "node:assert/strict";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, it, vi } from "vitest";
import { MivvuIcnFacilitiesBrowseScreen } from "@/components/mivvu/MivvuIcnFacilitiesBrowseScreen";
import { MivvuPreviewLocaleProvider } from "@/components/mivvu/MivvuPreviewLocaleProvider";
import type { IcnBrowseCatalog } from "@/lib/icn-facilities/icn-browse-view-model";
import {
  clearStoredMivvuPreviewLocaleForTests,
  writeStoredMivvuPreviewLocale,
} from "@/lib/mivvu-preview-locale";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const catalogKo: IcnBrowseCatalog = {
  items: [
    {
      id: "browse-0",
      sourceId: "1",
      name: "스타벅스",
      terminalId: "P01",
      terminalLabel: "제1여객터미널",
      floor: "F3",
      locationDescription: "1층 중앙",
      categoryLabel: "식・음료",
      hoursText: "07:00 ~ 22:00",
    },
    {
      id: "browse-1",
      sourceId: "2",
      name: "라운지 A",
      terminalId: "P03",
      terminalLabel: "제2여객터미널",
      floor: null,
      locationDescription: "면세 구역",
      categoryLabel: "안내・편의시설 · 라운지",
      hoursText: null,
    },
  ],
  terminals: [
    { value: "P01", label: "제1여객터미널", chipLabel: "T1" },
    { value: "P03", label: "제2여객터미널", chipLabel: "T2" },
  ],
  snapshot: {
    retrievedDateLabel: "2026년 10월 28일",
    sourceLabel: "테스트 출처",
    coverageNote: "테스트 한계 문구",
    listingCount: 2,
  },
};

const catalogEn: IcnBrowseCatalog = {
  items: [
    {
      id: "browse-0",
      sourceId: "1",
      name: "Starbucks",
      terminalId: "P01",
      terminalLabel: "Terminal 1",
      floor: "F3",
      locationDescription: "Central hall",
      categoryLabel: null,
      hoursText: "07:00 ~ 22:00",
    },
    {
      id: "browse-1",
      sourceId: "2",
      name: "Lounge A",
      terminalId: "P03",
      terminalLabel: "Terminal 2",
      floor: null,
      locationDescription: "Duty-free zone",
      categoryLabel: "Lounges",
      hoursText: null,
    },
  ],
  terminals: [
    { value: "P01", label: "Terminal 1", chipLabel: "T1" },
    { value: "P03", label: "Terminal 2", chipLabel: "T2" },
  ],
  snapshot: {
    retrievedDateLabel: "October 28, 2026",
    sourceLabel: "Test source",
    coverageNote: "Test coverage",
    listingCount: 2,
  },
};

function renderBrowse(ko = catalogKo, en = catalogEn) {
  return render(
    <MivvuPreviewLocaleProvider>
      <MivvuIcnFacilitiesBrowseScreen catalogKo={ko} catalogEn={en} />
    </MivvuPreviewLocaleProvider>,
  );
}

describe("MivvuIcnFacilitiesBrowseScreen", () => {
  afterEach(() => {
    cleanup();
    pushMock.mockReset();
    clearStoredMivvuPreviewLocaleForTests();
  });

  it("filters list and navigates back to airport selection", async () => {
    clearStoredMivvuPreviewLocaleForTests();
    writeStoredMivvuPreviewLocale("ko");
    renderBrowse();
    await screen.findByRole("heading", { name: /인천공항 시설/i });

    fireEvent.change(screen.getByLabelText(/시설 검색/i), {
      target: { value: "라운지" },
    });
    assert.ok(screen.getByText("라운지 A"));

    fireEvent.click(screen.getByRole("button", { name: /공항 선택/i }));
    assert.equal(pushMock.mock.calls[0]?.[0], "/preview/mivvu-entry");
  });

  it("switches to English catalog while preserving terminal filter", async () => {
    clearStoredMivvuPreviewLocaleForTests();
    writeStoredMivvuPreviewLocale("ko");
    renderBrowse();
    await screen.findByRole("heading", { name: /인천공항 시설/i });

    fireEvent.click(screen.getByRole("button", { name: /제2여객터미널/i }));
    fireEvent.click(screen.getByRole("button", { name: "English" }));

    await screen.findByRole("heading", { name: /Incheon Airport facilities/i });
    assert.ok(screen.getByText("Lounge A"));
    assert.ok(!screen.queryByText("Starbucks"));
  });

  it("shows English row without category line", async () => {
    clearStoredMivvuPreviewLocaleForTests();
    writeStoredMivvuPreviewLocale("en");
    renderBrowse();
    await screen.findByRole("heading", { name: /Incheon Airport facilities/i });
    assert.ok(screen.getByText("Starbucks"));
    assert.ok(!screen.queryByText("Restaurants"));
  });

  it("shows ambiguous equal hours as unavailable in both languages while retaining explicit 00:00 to 24:00", async () => {
    writeStoredMivvuPreviewLocale("ko");
    const ko = {
      ...catalogKo,
      items: catalogKo.items.map((item, index) => ({
        ...item,
        hoursText: index === 0 ? "00:00 ~ 00:00" : "00:00 ~ 24:00",
      })),
    };
    const en = {
      ...catalogEn,
      items: catalogEn.items.map((item, index) => ({
        ...item,
        hoursText: index === 0 ? "00:00 ~ 00:00" : "00:00 ~ 24:00",
      })),
    };
    renderBrowse(ko, en);
    await screen.findByRole("heading", { name: /인천공항 시설/i });
    assert.ok(screen.getByText("운영시간 확인 필요"));
    assert.ok(screen.getByText("00:00 ~ 24:00"));
    assert.equal(screen.queryByText("00:00 ~ 00:00"), null);

    fireEvent.click(screen.getByRole("button", { name: "English" }));
    await screen.findByRole("heading", { name: /Incheon Airport facilities/i });
    assert.ok(screen.getByText("Hours unavailable"));
    assert.ok(screen.getByText("00:00 ~ 24:00"));
    assert.equal(screen.queryByText("00:00 ~ 00:00"), null);
  });
});
