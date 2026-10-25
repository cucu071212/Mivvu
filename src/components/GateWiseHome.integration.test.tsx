// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GateWiseHome } from "@/components/GateWiseHome";
import { prepareProductionFacilities } from "@/lib/browse-integration";
import facilitiesJson from "@/data/facilities.json";

const { facilities, datasetErrors } = prepareProductionFacilities(facilitiesJson);
const DOLORES_ID = "sfo-t2-d-16th-dolores-general-store";
const DOLORES_NAME = "16th & Dolores General Store";

function renderHome() {
  return render(
    <GateWiseHome facilities={facilities} datasetErrors={datasetErrors} />,
  );
}

function goTo(label: "Flight" | "Explore" | "Results" | "My Plan") {
  fireEvent.click(screen.getByRole("button", { name: label }));
}

function enableDemo() {
  goTo("Flight");
  fireEvent.click(screen.getByRole("checkbox", { name: /Demo estimates/ }));
}

function focusDoloresQueue() {
  goTo("Results");
  const search = screen.getByPlaceholderText(/Search by name or category/);
  fireEvent.change(search, { target: { value: "Dolores" } });
  return screen.getByLabelText(/Queue \/ wait/, {
    selector: `#${DOLORES_ID}-queue`,
  });
}

function focusDoloresActivity() {
  goTo("Results");
  const search = screen.getByPlaceholderText(/Search by name or category/);
  fireEvent.change(search, { target: { value: "Dolores" } });
  return screen.getByLabelText(/Activity/, {
    selector: `#${DOLORES_ID}-activity`,
  });
}

function rankedList() {
  goTo("Results");
  return screen.getByRole("region", { name: "Ranked recommendations" });
}

function rankedCard(name: string) {
  return within(rankedList()).queryByRole("article", { name: new RegExp(name) });
}

function whatIfSection() {
  goTo("Results");
  return screen.queryByRole("region", { name: "What-if simulator" });
}

function localDatetime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("GateWiseHome personalization boundaries (mounted)", () => {
  it("keeps 1440 queue over budget and rejects 1441 visibly without a favorable fallback", () => {
    renderHome();
    enableDemo();
    const queue = focusDoloresQueue();

    fireEvent.change(queue, { target: { value: "1440" } });
    const card1440 = rankedCard(DOLORES_NAME);
    expect(card1440).not.toBeNull();
    expect(card1440!.textContent).toMatch(/Over budget in model/);

    fireEvent.change(queue, { target: { value: "1441" } });
    expect((queue as HTMLInputElement).value).toBe("1441");
    expect(queue.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText(/0 to 1440/)).toBeTruthy();
    expect(rankedCard(DOLORES_NAME)).toBeNull();
    expect(within(rankedList()).queryByText(/Feasible in model/)).toBeNull();
    expect(whatIfSection()).toBeNull();
  });

  it("applies the same 1440 limit to activity minutes", () => {
    renderHome();
    enableDemo();
    const activity = focusDoloresActivity();
    fireEvent.change(activity, { target: { value: "1441" } });
    expect(activity.getAttribute("aria-invalid")).toBe("true");
    expect(rankedCard(DOLORES_NAME)).toBeNull();
    expect(whatIfSection()).toBeNull();
  });

  it("accepts zero and restores recommendations after Reset all overrides", () => {
    renderHome();
    enableDemo();
    const queue = focusDoloresQueue();
    fireEvent.change(queue, { target: { value: "0" } });
    expect(queue.getAttribute("aria-invalid")).not.toBe("true");
    expect(rankedCard(DOLORES_NAME)).not.toBeNull();

    fireEvent.change(queue, { target: { value: "1441" } });
    expect(rankedCard(DOLORES_NAME)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Reset all overrides" }));
    const queueAfterReset = focusDoloresQueue();
    expect((queueAfterReset as HTMLInputElement).value).toBe("");
    expect(queueAfterReset.getAttribute("aria-invalid")).not.toBe("true");
    expect(rankedCard(DOLORES_NAME)).not.toBeNull();
    expect(whatIfSection()).not.toBeNull();
  });
});

describe("GateWiseHome countdown expiry and clock rollback (mounted)", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["setInterval", "clearInterval", "setTimeout", "clearTimeout", "Date"],
    });
    vi.setSystemTime(new Date(2026, 9, 24, 18, 0, 0));
  });

  function startCountdownInMinutes(minutes: number) {
    goTo("Flight");
    const target = new Date(Date.now() + minutes * 60_000);
    fireEvent.change(
      screen.getByLabelText(/Boarding starts \(local date & time\)/),
      { target: { value: localDatetime(target) } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Start countdown" }));
  }

  function baselineInput() {
    goTo("Flight");
    return screen.getByLabelText(/Baseline: minutes until boarding starts/, {
      selector: "input",
    }) as HTMLInputElement;
  }

  it("keeps What-if scenario minutes fixed while the baseline counts down", () => {
    renderHome();
    enableDemo();
    startCountdownInMinutes(30);
    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(baselineInput().value).toBe("29");
    goTo("Results");
    const scenario = screen.getByLabelText(
      /Scenario: minutes until boarding starts/,
    ) as HTMLInputElement;
    expect(scenario.value).toBe("50");
    expect(whatIfSection()!.textContent).toMatch(/29 → 50/);
  });

  it("stops the countdown and pauses results when the clock rolls back after expiry", () => {
    renderHome();
    enableDemo();
    startCountdownInMinutes(1);
    act(() => {
      vi.advanceTimersByTime(2 * 60_000);
    });
    expect(baselineInput().value).toBe("0");
    expect(
      screen.getByText(/Boarding has started per your device clock/),
    ).toBeTruthy();

    act(() => {
      vi.setSystemTime(new Date(Date.now() - 50 * 60_000));
      vi.advanceTimersByTime(1_000);
    });

    expect(
      screen.queryByText(/Boarding has started per your device clock/),
    ).toBeNull();
    expect(screen.getByText(/device clock moved backward/i)).toBeTruthy();
    expect(baselineInput().value).toBe("0");
    expect(baselineInput().readOnly).toBe(false);
    expect(within(rankedList()).queryByText(/Feasible in model/)).toBeNull();
    expect(within(rankedList()).queryAllByRole("article")).toHaveLength(0);
    expect(whatIfSection()).toBeNull();
    goTo("Flight");
    expect(
      screen.getByRole("button", { name: /Restore last manual minutes \(50\)/ }),
    ).toBeTruthy();
  });

  it("keeps baseline at 0 after expiry even if ticks continue without rollback", () => {
    renderHome();
    startCountdownInMinutes(1);
    act(() => {
      vi.advanceTimersByTime(5 * 60_000);
    });
    expect(baselineInput().value).toBe("0");
    expect(
      screen.getByText(/Boarding has started per your device clock/),
    ).toBeTruthy();
  });
});
