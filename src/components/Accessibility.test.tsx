// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/AppShell";
import { GateWiseSessionProvider } from "@/context/gatewise-session";
import { BoardingCountdownControls } from "@/components/BoardingCountdownControls";
import { RecommendationStatusBadge } from "@/components/RecommendationStatusBadge";
import { prepareProductionFacilities } from "@/lib/browse-integration";
import { recommendFacilities } from "@/lib/recommend";
import { productionTravelMinutes } from "@/data/travel-times";
import facilitiesJson from "@/data/facilities.json";

vi.mock("next/navigation", () => ({ usePathname: () => "/explore" }));
afterEach(cleanup);

const { facilities, datasetErrors } = prepareProductionFacilities(facilitiesJson);

describe("targeted accessibility regressions", () => {
  it("offers a first keyboard link to a focusable main landmark", () => {
    const { container } = render(
      <GateWiseSessionProvider facilities={facilities} datasetErrors={datasetErrors}>
        <AppShell><h1>Explore</h1></AppShell>
      </GateWiseSessionProvider>,
    );
    const skip = screen.getByRole("link", { name: "Skip to main content" });
    expect(container.querySelector("a, button, input, select, summary")).toBe(skip);
    const main = screen.getByRole("main");
    expect(skip.getAttribute("href")).toBe(`#${main.id}`);
    expect(main.tabIndex).toBe(-1);
    main.focus();
    expect(document.activeElement).toBe(main);
  });

  it("exposes recommendation status and its model caveat in an accessible name", () => {
    const recommendations = recommendFacilities(
      { gateZone: "D", passengerSecurityArea: "post", queueAdjustmentMinutes: 0, minutesUntilBoarding: 50, bufferMinutes: 10 },
      facilities,
      productionTravelMinutes,
    );
    render(<RecommendationStatusBadge recommendation={recommendations[0]} />);
    const badge = screen.getByRole("img", { name: /Unknown timing data\..*does not guarantee/i });
    expect(badge.textContent).toBe("Unknown timing");
    expect(badge.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("associates countdown validation feedback with the field and clears it on correction", () => {
    render(<BoardingCountdownControls
      state={{ mode: "manual", minutesUntilBoarding: 50 }} onStateChange={vi.fn()}
      onBaselineMinutesChange={vi.fn()} preservedManualMinutes={50}
      onCountdownExit={vi.fn()}
    />);
    const input = screen.getByLabelText(/Boarding starts \(local date/);
    fireEvent.click(screen.getByRole("button", { name: "Start countdown" }));
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const errorId = input.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId!)).toBe(screen.getByRole("alert"));
    expect(screen.getByRole("alert").textContent).toMatch(/Select a boarding start date and time/);
    fireEvent.change(input, { target: { value: "2026-10-25T14:00" } });
    expect(input.getAttribute("aria-invalid")).toBe("false");
    expect(input.hasAttribute("aria-describedby")).toBe(false);
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
