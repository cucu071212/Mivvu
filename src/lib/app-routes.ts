export const APP_ROUTES = [
  { href: "/", label: "Flight", description: "Time budget and countdown" },
  { href: "/explore", label: "Explore", description: "Find amenities and map" },
  {
    href: "/recommendations",
    label: "Results",
    description: "Ranked places and what-if",
  },
  { href: "/plan", label: "My Plan", description: "Two-stop planner (soon)" },
] as const;

export type AppRouteHref = (typeof APP_ROUTES)[number]["href"];

export function isAppRouteActive(pathname: string, href: AppRouteHref): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
