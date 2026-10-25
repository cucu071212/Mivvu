import { describe, expect, it } from "vitest";
import { APP_ROUTES, isAppRouteActive } from "@/lib/app-routes";

describe("app routes", () => {
  it("exposes the four primary destinations", () => {
    expect(APP_ROUTES.map((route) => route.href)).toEqual([
      "/",
      "/explore",
      "/recommendations",
      "/plan",
    ]);
  });

  it("treats only exact root as Flight active", () => {
    expect(isAppRouteActive("/", "/")).toBe(true);
    expect(isAppRouteActive("/explore", "/")).toBe(false);
    expect(isAppRouteActive("/recommendations", "/recommendations")).toBe(true);
    expect(isAppRouteActive("/recommendations/extra", "/recommendations")).toBe(
      true,
    );
  });
});
