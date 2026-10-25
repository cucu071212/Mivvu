// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TwoStopPlannerDemo } from "@/components/TwoStopPlannerDemo";
import { GateWiseSessionProvider } from "@/context/gatewise-session";
import { AirportSelectionProvider } from "@/context/airport-selection";
import { persistAirportSelection } from "@/lib/airport-selection-preference";
import { prepareProductionFacilities } from "@/lib/browse-integration";
import { recommendFacilities } from "@/lib/recommend";
import { productionTravelMinutes } from "@/data/travel-times";
import { PRODUCTION_T2_D_FACILITY_LOCATION } from "@/data/fixtures/production-facility-defaults";
import facilitiesJson from "@/data/facilities.json";
import type { Facility } from "@/types/airport";

vi.mock("next/navigation", () => ({ usePathname: () => "/plan" }));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

afterEach(cleanup);

const { facilities, datasetErrors } = prepareProductionFacilities(facilitiesJson);

function renderPlanner() {
  persistAirportSelection("2026-10-25");
  return render(
    <AirportSelectionProvider>
      <GateWiseSessionProvider facilities={facilities} datasetErrors={datasetErrors}>
        <TwoStopPlannerDemo />
      </GateWiseSessionProvider>
    </AirportSelectionProvider>,
  );
}

describe("TwoStopPlannerDemo", () => {
  it("defaults travel policy to strict with explanatory note", () => {
    renderPlanner();
    const travelCheckbox = screen.getByRole("checkbox", {
      name: /Use illustrative D-Gates travel times \(demo only\)/i,
    }) as HTMLInputElement;
    expect(travelCheckbox.checked).toBe(false);
    expect(
      screen.getByText(/Strict travel policy: walking between two facilities/i),
    ).toBeTruthy();
  });

  it("selects two facilities and shows both order panels under demo travel", () => {
    renderPlanner();
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /Use illustrative D-Gates travel times \(demo only\)/i,
      }),
    );
    fireEvent.change(screen.getByLabelText("First facility (picker)"), {
      target: { value: "sfo-t2-d-burger-joint" },
    });
    fireEvent.change(screen.getByLabelText("Second facility (picker)"), {
      target: { value: "sfo-t2-d-peets-coffee-d7" },
    });
    expect(screen.getByRole("heading", { name: /Compare visit orders/i })).toBeTruthy();
    expect(screen.getAllByRole("article").length).toBeGreaterThanOrEqual(2);
  });

  it("strict mode keeps unknown timing until demo travel opt-in", () => {
    renderPlanner();
    fireEvent.change(screen.getByLabelText("First facility (picker)"), {
      target: { value: "sfo-t2-d-burger-joint" },
    });
    fireEvent.change(screen.getByLabelText("Second facility (picker)"), {
      target: { value: "sfo-t2-d-peets-coffee-d7" },
    });
    const unknownBadges = screen.getAllByRole("img", {
      name: /Unknown timing data/i,
    });
    expect(unknownBadges.length).toBeGreaterThanOrEqual(2);
  });

  it("facility pickers are keyboard-focusable selects", () => {
    renderPlanner();
    const first = screen.getByLabelText("First facility (picker)");
    first.focus();
    expect(document.activeElement).toBe(first);
  });

  it("single-stop recommend regression unchanged (model cafe)", () => {
    const modelCafe: Facility = {
      ...PRODUCTION_T2_D_FACILITY_LOCATION,
      id: "model-cafe",
      name: "Model Cafe",
      zone: "D",
      category: "food",
      securityZone: "post",
      waitMinutes: 8,
      activityMinutes: 10,
      locationConfidence: "demo_estimate",
      timeConfidence: "demo_estimate",
    };
    const [result] = recommendFacilities(
      {
        gateZone: "D",
        minutesUntilBoarding: 50,
        bufferMinutes: 10,
        queueAdjustmentMinutes: 0,
        passengerSecurityArea: "post",
      },
      [modelCafe],
      productionTravelMinutes,
    );
    expect(result.kind).toBe("feasibility");
    if (result.kind === "feasibility") {
      expect(result.breakdown.requiredMinutes).toBe(34);
    }
  });
});
