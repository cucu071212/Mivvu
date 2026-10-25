import { describe, expect, it } from "vitest";
import {
  baselineRecoveryRequiredAfterExit,
  minutesInputAfterCountdownExit,
} from "@/lib/countdown-baseline-recovery";

describe("countdown baseline recovery", () => {
  it("requires explicit recovery after countdown failure, not after user clear", () => {
    expect(baselineRecoveryRequiredAfterExit("countdown_failure")).toBe(true);
    expect(baselineRecoveryRequiredAfterExit("user_clear")).toBe(false);
  });

  it("does not promote preserved manual minutes on failure", () => {
    expect(
      minutesInputAfterCountdownExit({
        reason: "countdown_failure",
        preservedManualMinutes: 50,
        lastBaselineMinutes: 3,
      }),
    ).toBe("3");
    expect(
      minutesInputAfterCountdownExit({
        reason: "user_clear",
        preservedManualMinutes: 50,
        lastBaselineMinutes: 3,
      }),
    ).toBe("50");
  });
});
