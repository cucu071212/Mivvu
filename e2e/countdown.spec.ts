import { test, expect } from "./fixtures";
import { sfoDemo } from "./sfo-demo-harness";

// UTC timezone in config makes datetime-local input independent of the host.
const now = new Date("2026-10-25T16:00:00Z");
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now);
  await page.goto(sfoDemo("/flight"));
});

test("Countdown rejects empty and more-than-24-hour targets without replacing manual budget", async ({ page }) => {
  const start = page.getByRole("button", { name: "Start countdown", exact: true });
  await start.click();
  await expect(page.getByRole("alert").filter({ hasText: /Select a boarding start/ })).toBeVisible();
  await page.getByLabel(/Boarding starts \(local date & time\)/).fill("2026-10-26T16:01");
  await start.click();
  await expect(page.getByRole("alert").filter({ hasText: "Boarding start must be within the next 24 hours." })).toBeVisible();
  await expect(page.getByLabel("Baseline: minutes until boarding starts")).toHaveValue("50");
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toHaveCount(0);
});

test("Countdown floors sub-minute time and reaches boarding start at zero", async ({ page }) => {
  const minutes = page.getByLabel("Baseline: minutes until boarding starts");
  await page.getByLabel(/Boarding starts \(local date & time\)/).fill("2026-10-25T16:02");
  await page.getByRole("button", { name: "Start countdown", exact: true }).click();
  await expect(minutes).toHaveValue("2");
  await expect(minutes).toHaveAttribute("readonly", "");
  await page.clock.runFor(61_000);
  await expect(minutes).toHaveValue("0");
  await expect(page.getByRole("alert").filter({ hasText: /Boarding has started per your device clock/ })).toHaveCount(0);
  await page.clock.runFor(59_000);
  await expect(page.getByRole("alert").filter({ hasText: /Boarding has started per your device clock/ })).toBeVisible();
  await expect(minutes).toHaveValue("0");
  await page.clock.runFor(1_000);
  await expect(minutes).toHaveValue("0");
});

test("Pause freezes the budget; resume ticks; clear restores manual minutes", async ({ page }) => {
  const minutes = page.getByLabel("Baseline: minutes until boarding starts");
  await page.getByLabel(/Boarding starts \(local date & time\)/).fill("2026-10-25T16:10");
  await page.getByRole("button", { name: "Start countdown", exact: true }).click();
  await expect(minutes).toHaveValue("10");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.clock.runFor(5 * 60_000);
  await expect(minutes).toHaveValue("10");
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.clock.runFor(60_000);
  await expect(minutes).toHaveValue("9");
  await page.getByRole("button", { name: "Clear countdown", exact: true }).click();
  await expect(minutes).toHaveValue("50");
  await expect(minutes).toBeEditable();
});
