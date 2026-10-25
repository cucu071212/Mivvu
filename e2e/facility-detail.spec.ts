import { test, expect } from "./fixtures";

test("Explore facility detail modal closes and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/explore");

  const trigger = page
    .getByRole("region", { name: "Facility directory", exact: true })
    .getByRole("button", { name: "View facility details" })
    .first();
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close facility details" })).toBeVisible();

  await dialog.getByRole("button", { name: "Close facility details" }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
