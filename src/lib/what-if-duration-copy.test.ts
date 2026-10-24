import { describe, expect, it } from "vitest";
import {
  WHAT_IF_DEMO_MODE_OFF_NOTE,
  WHAT_IF_DEMO_MODE_ON_NOTE,
  WHAT_IF_DURATION_PRECEDENCE,
} from "@/lib/what-if-duration-copy";

describe("What-if duration explanation copy", () => {
  it("states the implemented precedence order", () => {
    expect(WHAT_IF_DURATION_PRECEDENCE).toBe(
      "Personal override → Demo estimate → Official record → Unknown",
    );
  });

  it("demo-on note does not claim demo applies only when official times are missing", () => {
    expect(WHAT_IF_DEMO_MODE_ON_NOTE).not.toMatch(/official record has no time/i);
    expect(WHAT_IF_DEMO_MODE_ON_NOTE).toMatch(/precedence over official records/i);
  });

  it("demo-off note follows override then official then unknown", () => {
    expect(WHAT_IF_DEMO_MODE_OFF_NOTE).toMatch(/personal override/i);
    expect(WHAT_IF_DEMO_MODE_OFF_NOTE).toMatch(/official dataset/i);
    expect(WHAT_IF_DEMO_MODE_OFF_NOTE).toMatch(/unknown/i);
  });
});
