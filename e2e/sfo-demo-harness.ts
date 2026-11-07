/** Shared e2e helper for the env-gated SFO demo browser harness. */
export const SFO_DEMO_HARNESS_PREFIX = "/preview/sfo-demo" as const;

export type SfoDemoHarnessRoute =
  | "/flight"
  | "/explore"
  | "/recommendations"
  | "/plan";

/** Map a logical demo route onto the closed-by-default harness URL. */
export function sfoDemo(path: SfoDemoHarnessRoute): string {
  return `${SFO_DEMO_HARNESS_PREFIX}${path}`;
}
