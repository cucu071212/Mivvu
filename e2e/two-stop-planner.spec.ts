import { test, expect } from "./fixtures";
import path from "node:path";

const screenshotDir = path.join("docs", "gw-e2-preview");

test.describe("Two-stop planner demo", () => {
  test("strict unknown, demo opt-in, and both orders", async ({ page }) => {
    await page.goto("/plan");
    await expect(page.getByRole("heading", { name: "Two-stop planner" })).toBeVisible();
    await expect(page.getByText("Demo — not in production release")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Complete demo setup" })).toBeVisible();

    const demoTravel = page.getByRole("checkbox", {
      name: /^Use illustrative D-Gates travel times \(demo only\)$/i,
    });
    await expect(demoTravel).not.toBeChecked();
    await expect(
      page.getByText(/Walking times are illustrative assumptions/i),
    ).toBeVisible();

    await page.getByLabel("First facility (picker)").selectOption({
      label: "Burger Joint",
    });
    await page.getByLabel("Second facility (picker)").selectOption({
      label: "Peet's Coffee",
    });
    await expect(page.getByLabel(/^Unknown timing data/)).toHaveCount(2);
    await expect(page.getByRole("heading", { name: "Why timing is Unknown" })).toBeVisible();

    const nav = page.getByRole("navigation", { name: "Primary", exact: true });
    await nav.getByRole("link", { name: "Flight", exact: true }).click();
    await page
      .getByRole("checkbox", { name: /Demo estimates for wait/i })
      .check();
    await nav.getByRole("link", { name: "My Plan", exact: true }).click();
    await expect(page).toHaveURL(/\/plan$/);
    await page
      .getByRole("checkbox", {
        name: /^Use illustrative D-Gates travel times \(demo only\)$/i,
      })
      .check();
    await page.getByLabel("First facility (picker)").selectOption({
      label: "Burger Joint",
    });
    await page.getByLabel("Second facility (picker)").selectOption({
      label: "Peet's Coffee",
    });

    await expect(page.getByRole("heading", { name: "Compare visit orders" })).toBeVisible();
    await expect(page.getByText("Burger Joint → Peet's Coffee")).toBeVisible();
    await expect(page.getByText("Peet's Coffee → Burger Joint")).toBeVisible();
    await expect(page.getByText("Safety buffer (once per itinerary)", { exact: true })).toHaveCount(2);
    await expect(
      page.getByRole("img", { name: /Over budget in model/i }).first(),
    ).toBeVisible();
  });

  test("desktop and mobile screenshots for review", async ({ page }) => {
    await page.goto("/flight");
    await page
      .getByRole("checkbox", { name: /Demo estimates for wait/i })
      .check();
    await page
      .getByRole("navigation", { name: "Primary", exact: true })
      .getByRole("link", { name: "My Plan", exact: true })
      .click();
    await page.getByRole("checkbox", {
      name: /^Use illustrative D-Gates travel times \(demo only\)$/i,
    }).check();
    await page.getByLabel("First facility (picker)").selectOption({
      label: "Burger Joint",
    });
    await page.getByLabel("Second facility (picker)").selectOption({
      label: "Peet's Coffee",
    });
    await expect(page.getByRole("heading", { name: "Compare visit orders" })).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.screenshot({
      path: path.join(screenshotDir, "two-stop-planner-desktop.png"),
      fullPage: true,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: path.join(screenshotDir, "two-stop-planner-mobile.png"),
      fullPage: true,
    });
  });

  test("mobile nav reaches planner with focusable controls", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/flight");
    await page.getByRole("navigation", { name: "Primary mobile" }).getByRole("link", {
      name: "My Plan",
    }).click();
    await expect(page).toHaveURL(/\/plan$/);
    const firstPicker = page.getByLabel("First facility (picker)");
    await firstPicker.focus();
    await expect(firstPicker).toBeFocused();
  });
});
