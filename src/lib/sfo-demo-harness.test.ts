import { describe, expect, it } from "vitest";
import {
  SFO_DEMO_HARNESS_PREFIX,
  isSfoDemoHarnessEnabled,
  isSfoDemoHarnessPath,
  sfoDemoHarnessPath,
  stripSfoDemoHarnessPrefix,
  withSfoDemoHarnessPrefix,
} from "./sfo-demo-harness";

describe("sfo-demo-harness", () => {
  it("is closed by default in the vitest process", () => {
    expect(isSfoDemoHarnessEnabled()).toBe(false);
  });

  it("strips and detects harness prefixes", () => {
    expect(stripSfoDemoHarnessPrefix("/preview/sfo-demo/flight")).toBe("/flight");
    expect(stripSfoDemoHarnessPrefix("/flight")).toBe("/flight");
    expect(isSfoDemoHarnessPath("/preview/sfo-demo/explore")).toBe(true);
    expect(isSfoDemoHarnessPath("/explore")).toBe(false);
  });

  it("rewrites absolute app hrefs only while under the harness", () => {
    expect(withSfoDemoHarnessPrefix("/flight", "/explore")).toBe("/explore");
    expect(withSfoDemoHarnessPrefix("/preview/sfo-demo/flight", "/explore")).toBe(
      `${SFO_DEMO_HARNESS_PREFIX}/explore`,
    );
    expect(
      withSfoDemoHarnessPrefix("/preview/sfo-demo/flight", "/preview/sfo-demo/plan"),
    ).toBe("/preview/sfo-demo/plan");
  });

  it("builds harness segment paths", () => {
    expect(sfoDemoHarnessPath("recommendations")).toBe(
      "/preview/sfo-demo/recommendations",
    );
  });
});
