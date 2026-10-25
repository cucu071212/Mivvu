import { test, expect } from "./fixtures";

test("390px mobile navigation is usable and preserves flight inputs", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Baseline: minutes until boarding starts").fill("40");
  const nav = page.getByRole("navigation", { name: "Primary mobile", exact: true });
  for (const [link, path, heading] of [
    ["Explore", "/explore", "Explore"],
    ["Results", "/recommendations", "Recommendations"],
    ["Flight", "/", "Flight context"],
  ]) {
    const target = nav.getByRole("link", { name: link, exact: true });
    await expect(target).toBeInViewport();
    await target.tap();
    await expect(page).toHaveURL(`http://127.0.0.1:3100${path}`);
    await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    await expect(target).toHaveAttribute("aria-current", "page");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await expect(page.getByLabel("Baseline: minutes until boarding starts")).toHaveValue("40");
});

test("390px Explore facility details show Location guidance", async ({ page }) => {
  await page.goto("/explore");
  const trigger = page
    .getByRole("region", { name: "Facility directory", exact: true })
    .getByRole("button", { name: "View facility details" })
    .first();
  await trigger.scrollIntoViewIfNeeded();
  await trigger.tap();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("region", { name: /Location guidance/i }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
});
