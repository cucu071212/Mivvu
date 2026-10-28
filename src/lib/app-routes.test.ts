import { describe, expect, it } from "vitest";
import { APP_ROUTES, isAppRouteActive } from "@/lib/app-routes";

describe("app routes", () => {
  it("exposes the four primary destinations", () => {
    expect(APP_ROUTES.map((route) => route.href)).toEqual([
      "/flight",
      "/explore",
      "/recommendations",
      "/plan",
    ]);
  });

  it("treats only exact flight path as Flight active", () => {
    expect(isAppRouteActive("/flight", "/flight")).toBe(true);
    expect(isAppRouteActive("/", "/flight")).toBe(false);
    expect(isAppRouteActive("/recommendations", "/recommendations")).toBe(true);
    expect(isAppRouteActive("/recommendations/extra", "/recommendations")).toBe(
      true,
    );
  });
});
