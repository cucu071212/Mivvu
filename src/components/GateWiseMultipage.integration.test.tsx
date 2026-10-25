// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GateWiseHome } from "@/components/GateWiseHome";
import { prepareProductionFacilities } from "@/lib/browse-integration";
import facilitiesJson from "@/data/facilities.json";

const { facilities, datasetErrors } = prepareProductionFacilities(facilitiesJson);
const DOLORES_ID = "sfo-t2-d-16th-dolores-general-store";

function renderApp(initialPath: "/" | "/explore" | "/recommendations" | "/plan" = "/") {
  return render(
    <GateWiseHome
      facilities={facilities}
      datasetErrors={datasetErrors}
      initialPath={initialPath}
    />,
  );
}

function goTo(label: string) {
  fireEvent.click(screen.getByRole("button", { name: label }));
}

afterEach(() => {
  cleanup();
});

describe("GateWise multipage session (mounted)", () => {
  it("keeps demo mode and invalid personalization across Flight → Results", () => {
    renderApp("/");
    fireEvent.click(screen.getByRole("checkbox", { name: /Demo estimates/ }));

    goTo("Results");
    expect(screen.getByText(/Demo: on/)).toBeTruthy();

    const search = screen.getByPlaceholderText(/Search by name or category/);
    fireEvent.change(search, { target: { value: "Dolores" } });
    const queue = screen.getByLabelText(/Queue \/ wait/, {
      selector: `#${DOLORES_ID}-queue`,
    });
    fireEvent.change(queue, { target: { value: "1441" } });

    expect(queue.getAttribute("aria-invalid")).toBe("true");
    expect(
      within(screen.getByRole("region", { name: "Ranked recommendations" })).queryByText(
        /Feasible in model/,
      ),
    ).toBeNull();
    expect(screen.queryByRole("region", { name: "What-if simulator" })).toBeNull();

    goTo("Flight");
    expect(
      (screen.getByRole("checkbox", { name: /Demo estimates/ }) as HTMLInputElement)
        .checked,
    ).toBe(true);

    goTo("Results");
    expect(screen.getByText(/0 to 1440/)).toBeTruthy();
    expect(
      within(screen.getByRole("region", { name: "Ranked recommendations" })).queryAllByRole(
        "article",
      ),
    ).toHaveLength(0);
  });

  it("keeps countdown baseline ticking host mounted when leaving Flight", () => {
    renderApp("/");
    const suggest = screen.getByRole("button", {
      name: /Suggest from manual budget/,
    });
    fireEvent.click(suggest);
    fireEvent.click(screen.getByRole("button", { name: "Start countdown" }));

    const baseline = screen.getByLabelText(/Baseline: minutes until boarding/);
    expect((baseline as HTMLInputElement).readOnly).toBe(true);

    goTo("Explore");
    expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();
    expect(screen.getByText(/Live countdown continues/i)).toBeTruthy();
    expect(screen.queryByLabelText(/Boarding starts \(local date/)).toBeNull();

    goTo("Results");
    expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();
  });

  it("shows a compact Manage on Flight dock when countdown is idle off Flight", () => {
    renderApp("/explore");
    expect(screen.getByRole("link", { name: "Manage on Flight" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Start countdown" })).toBeNull();
  });

  it("exposes My Plan as a GW-E coming-soon screen without planner logic", () => {
    renderApp("/plan");
    expect(screen.getByRole("heading", { name: "My Plan" })).toBeTruthy();
    expect(screen.getByText(/GW-E — not in this release/)).toBeTruthy();
    expect(screen.queryByRole("region", { name: "What-if simulator" })).toBeNull();
  });
});
