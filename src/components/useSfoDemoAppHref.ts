"use client";

import { usePathname } from "next/navigation";
import { withSfoDemoHarnessPrefix } from "@/lib/sfo-demo-harness";

/** Resolve an absolute GateWise app href, staying inside the SFO demo harness when active. */
export function useSfoDemoAppHref(href: string): string {
  const pathname = usePathname() || "/";
  return withSfoDemoHarnessPrefix(pathname, href);
}
