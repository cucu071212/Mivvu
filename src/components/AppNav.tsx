"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_ROUTES, isAppRouteActive } from "@/lib/app-routes";

type AppNavProps = {
  /** Desktop pills live in the header; mobile bar must sit outside backdrop-filter ancestors. */
  variant: "desktop" | "mobile";
};

export function AppNav({ variant }: AppNavProps) {
  const pathname = usePathname() || "/";

  if (variant === "desktop") {
    return (
      <nav className="gw-app-nav-desktop" aria-label="Primary">
        <ul className="gw-app-nav-list">
          {APP_ROUTES.map((route) => {
            const active = isAppRouteActive(pathname, route.href);
            return (
              <li key={route.href}>
                <Link
                  href={route.href}
                  className={`gw-app-nav-link ${active ? "gw-app-nav-link-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {route.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav className="gw-app-nav-mobile" aria-label="Primary mobile">
      <ul className="gw-app-nav-mobile-list">
        {APP_ROUTES.map((route) => {
          const active = isAppRouteActive(pathname, route.href);
          return (
            <li key={route.href}>
              <Link
                href={route.href}
                className={`gw-app-nav-mobile-link ${active ? "gw-app-nav-mobile-link-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="gw-app-nav-mobile-label">{route.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
