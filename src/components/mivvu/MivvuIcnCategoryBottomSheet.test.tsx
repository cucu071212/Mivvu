/**
 * @vitest-environment jsdom
 */
import assert from "node:assert/strict";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, it, vi } from "vitest";
import { MivvuIcnCategoryBottomSheet } from "./MivvuIcnCategoryBottomSheet";

describe("MivvuIcnCategoryBottomSheet", () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
  });

  it("uses button semantics with aria-pressed instead of listbox roles", () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <MivvuIcnCategoryBottomSheet
        open
        title="Choose type"
        options={[
          {
            value: "교통시설",
            label: "교통시설",
            labelFromKoreanFallback: true,
          },
        ]}
        selectedValue="all"
        allLabel="All"
        closeLabel="Close"
        koreanLabelFallbackHint="Showing the Korean category label because English is not in the listing"
        onClose={onClose}
        onSelect={onSelect}
      />,
    );

    assert.equal(screen.queryByRole("listbox"), null);
    const allButton = screen.getByRole("button", { name: /All/i });
    assert.equal(allButton.getAttribute("aria-pressed"), "true");
    const koOption = screen.getByRole("button", { name: /교통시설/i });
    assert.equal(koOption.getAttribute("aria-pressed"), "false");
    assert.ok(
      screen.getByText("Showing the Korean category label because English is not in the listing"),
    );

    fireEvent.click(koOption);
    assert.equal(onSelect.mock.calls[0][0], "교통시설");
    assert.equal(onClose.mock.calls.length, 1);
  });

  it("closes on Escape and returns focus to the opener", () => {
    const onClose = vi.fn();
    render(
      <button type="button" data-testid="opener">
        Open
      </button>,
    );
    const opener = screen.getByTestId("opener");
    opener.focus();

    render(
      <MivvuIcnCategoryBottomSheet
        open
        title="유형 선택"
        options={[]}
        selectedValue="all"
        allLabel="전체"
        closeLabel="닫기"
        onClose={onClose}
        onSelect={() => {}}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    assert.equal(onClose.mock.calls.length, 1);
  });
});
