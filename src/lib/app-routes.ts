import { stripSfoDemoHarnessPrefix } from "@/lib/sfo-demo-harness";

export const APP_ROUTES = [
  { href: "/flight", label: "Flight", description: "Time budget and countdown" },
  { href: "/explore", label: "Explore", description: "Find amenities and map" },
  {
    href: "/recommendations",
    label: "Results",
    description: "Ranked places and what-if",
  },
  { href: "/plan", label: "My Plan", description: "Two-stop planner (demo)" },
] as const;

export type AppRouteHref = (typeof APP_ROUTES)[number]["href"];

/** Active-route check uses the logical path (harness prefix stripped when present). */
export function isAppRouteActive(pathname: string, href: AppRouteHref): boolean {
  const logical = stripSfoDemoHarnessPrefix(pathname);
  if (href === "/flight") {
    return logical === "/flight";
  }
  return logical === href || logical.startsWith(`${href}/`);
}
