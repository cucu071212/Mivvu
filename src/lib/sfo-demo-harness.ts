/**
 * Test-only SFO demo browser harness.
 * Closed unless GATEWISE_SFO_DEMO_HARNESS=1 at process start (e2e build/start).
 * Public /explore|/flight|/recommendations|/plan still redirect to /sfo.
 */

/** Process env that opens the harness (unset/closed by default). */
export const SFO_DEMO_HARNESS_ENV = "GATEWISE_SFO_DEMO_HARNESS" as const;

/** URL prefix for harness pages (not a public product surface). */
export const SFO_DEMO_HARNESS_PREFIX = "/preview/sfo-demo" as const;

/** Demo app segments mounted under the harness prefix. */
export const SFO_DEMO_HARNESS_SEGMENTS = [
  "flight",
  "explore",
  "recommendations",
  "plan",
] as const;

export type SfoDemoHarnessSegment = (typeof SFO_DEMO_HARNESS_SEGMENTS)[number];

/** True only when the e2e/local harness flag is explicitly "1". */
export function isSfoDemoHarnessEnabled(): boolean {
  // Bracket access avoids accidental NEXT_PUBLIC inlining patterns.
  return process.env[SFO_DEMO_HARNESS_ENV] === "1";
}

/** Strip harness prefix so route-active checks use logical /flight|/explore|… paths. */
export function stripSfoDemoHarnessPrefix(pathname: string): string {
  if (pathname === SFO_DEMO_HARNESS_PREFIX) {
    return "/";
  }
  if (pathname.startsWith(`${SFO_DEMO_HARNESS_PREFIX}/`)) {
    const rest = pathname.slice(SFO_DEMO_HARNESS_PREFIX.length);
    return rest.length > 0 ? rest : "/";
  }
  return pathname;
}

/** Whether the current location is inside the SFO demo harness. */
export function isSfoDemoHarnessPath(pathname: string): boolean {
  return (
    pathname === SFO_DEMO_HARNESS_PREFIX ||
    pathname.startsWith(`${SFO_DEMO_HARNESS_PREFIX}/`)
  );
}

/**
 * When already under the harness, rewrite absolute app hrefs to stay inside it.
 * Leaves external or already-prefixed hrefs unchanged.
 */
export function withSfoDemoHarnessPrefix(pathname: string, href: string): string {
  if (!isSfoDemoHarnessPath(pathname)) {
    return href;
  }
  if (!href.startsWith("/") || href.startsWith("//")) {
    return href;
  }
  if (isSfoDemoHarnessPath(href)) {
    return href;
  }
  return `${SFO_DEMO_HARNESS_PREFIX}${href}`;
}

/** Absolute harness URL for a demo segment (for e2e helpers / docs). */
export function sfoDemoHarnessPath(segment: SfoDemoHarnessSegment): string {
  return `${SFO_DEMO_HARNESS_PREFIX}/${segment}`;
}
