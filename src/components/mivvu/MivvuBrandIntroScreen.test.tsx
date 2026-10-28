// @vitest-environment jsdom
import assert from "node:assert/strict";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, it, vi } from "vitest";
import { MivvuBrandIntroScreen } from "@/components/mivvu/MivvuBrandIntroScreen";
import {
  MIVVU_INTRO_EXIT_START_MS,
  MIVVU_INTRO_TOTAL_MS,
} from "@/lib/mivvu-entry-intro-timing";

describe("MivvuBrandIntroScreen timing", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("calls onComplete after 3.2s and applies exit phase before completion", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<MivvuBrandIntroScreen onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(MIVVU_INTRO_TOTAL_MS - 1);
    });
    assert.equal(onComplete.mock.calls.length, 0);
    assert.ok(screen.getByRole("dialog", { name: /Mivvu welcome/i }));

    act(() => {
      vi.advanceTimersByTime(1);
    });
    assert.equal(onComplete.mock.calls.length, 1);
    assert.equal(MIVVU_INTRO_TOTAL_MS, 3200);
    assert.equal(MIVVU_INTRO_EXIT_START_MS, 2900);
  });

  it("clears both timers after keyboard dismissal", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<MivvuBrandIntroScreen onComplete={onComplete} />);
    assert.equal(vi.getTimerCount(), 2);
    fireEvent.keyDown(screen.getByRole("dialog", { name: /Mivvu welcome/i }), { key: "Enter" });
    assert.equal(onComplete.mock.calls.length, 1);
    assert.equal(vi.getTimerCount(), 0);
    act(() => vi.advanceTimersByTime(MIVVU_INTRO_TOTAL_MS + 1));
    assert.equal(onComplete.mock.calls.length, 1);
  });

  it("clears timers on unmount", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const view = render(<MivvuBrandIntroScreen onComplete={onComplete} />);
    assert.equal(vi.getTimerCount(), 2);
    view.unmount();
    assert.equal(vi.getTimerCount(), 0);
    act(() => vi.advanceTimersByTime(MIVVU_INTRO_TOTAL_MS + 1));
    assert.equal(onComplete.mock.calls.length, 0);
  });
});
