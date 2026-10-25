import { test, expect } from "./fixtures";

test("Explore facility detail modal closes and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
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

test("Explore facility details include Location guidance without inferred walks", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/explore");
  await page.getByRole("searchbox", { name: /Search by facility name/ }).fill(
    "16th & Dolores",
  );

  const trigger = page
    .getByRole("region", { name: "Facility directory", exact: true })
    .getByRole("button", { name: "View facility details" })
    .first();
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const guidance = dialog.getByRole("region", { name: /Location guidance/i });
  await expect(guidance).toBeVisible();
  await expect(guidance.getByText("Verified area", { exact: true })).toBeVisible();
  await expect(
    guidance.getByText("Terminal 2 · D Gates · Near Gate D16"),
  ).toBeVisible();
  await expect(guidance.getByText(/\d+\s*min walk/i)).toHaveCount(0);
  await expect(
    dialog.getByRole("region", { name: /T2 D Gates area guide \(conceptual\)/i }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Close facility details" }).click();

  await page.getByRole("searchbox", { name: /Search by facility name/ }).fill("Bun Mee");
  await page
    .getByRole("region", { name: "Facility directory", exact: true })
    .getByRole("button", { name: "View facility details" })
    .click();
  const unknownDialog = page.getByRole("dialog");
  await expect(unknownDialog).toBeVisible();
  const unknownGuidance = unknownDialog.getByRole("region", {
    name: /Location guidance/i,
  });
  await expect(unknownGuidance.getByText("Unknown", { exact: true })).toBeVisible();
  await expect(
    unknownGuidance.getByText(/does not infer a location/i),
  ).toBeVisible();
});
