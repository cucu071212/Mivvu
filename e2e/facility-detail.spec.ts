import { test, expect } from "./fixtures";
import { sfoDemo } from "./sfo-demo-harness";

test("Explore facility detail modal closes and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(sfoDemo("/explore"));

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
  await page.goto(sfoDemo("/explore"));
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

test("Unknown GW-B evidence does not mark Vino Volo Retail Street as current", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(sfoDemo("/explore"));
  await page.getByRole("searchbox", { name: /Search by facility name/ }).fill("Vino Volo");
  await page
    .getByRole("region", { name: "Facility directory", exact: true })
    .getByRole("button", { name: "View facility details" })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const guidance = dialog.getByRole("region", { name: /Location guidance/i });
  await expect(guidance.getByText("Unknown", { exact: true })).toBeVisible();
  await expect(guidance.getByText(/does not infer a location/i)).toBeVisible();
  await expect(
    guidance.getByRole("region", { name: /T2 D Gates area guide \(conceptual\)/i }),
  ).toHaveCount(0);
  await expect(guidance.getByText(/named on this listing/i)).toHaveCount(0);
  await expect(dialog.getByText("D Gates, Retail Street")).toBeVisible();
});

test("Facility detail Tab cycle stays on visible dialog controls", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(sfoDemo("/explore"));
  await page.getByRole("searchbox", { name: /Search by facility name/ }).fill(
    "16th & Dolores",
  );
  const trigger = page
    .getByRole("region", { name: "Facility directory", exact: true })
    .getByRole("button", { name: "View facility details" })
    .first();
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const close = dialog.getByRole("button", { name: "Close facility details" });
  await close.focus();
  await expect(close).toBeFocused();

  const seen: string[] = [];
  for (let step = 0; step < 12; step += 1) {
    await page.keyboard.press("Tab");
    const state = await page.evaluate(() => {
      const active = document.activeElement;
      const openDialog = document.querySelector("dialog[open]");
      return {
        tag: active?.tagName ?? "NONE",
        name:
          active?.getAttribute("aria-label") ||
          active?.textContent?.trim().slice(0, 80) ||
          "",
        insideDialog: Boolean(openDialog && active && openDialog.contains(active)),
        isBody: active === document.body,
        isDialog: active?.tagName === "DIALOG",
      };
    });
    seen.push(`${state.tag}:${state.name}`);
    expect(state.isBody, `step ${step + 1} focused body: ${seen.join(" -> ")}`).toBe(false);
    expect(state.isDialog, `step ${step + 1} focused dialog chrome: ${seen.join(" -> ")}`).toBe(false);
    expect(state.insideDialog, `step ${step + 1} left dialog: ${seen.join(" -> ")}`).toBe(true);
  }

  await page.keyboard.press("Shift+Tab");
  const afterShift = await page.evaluate(() => {
    const active = document.activeElement;
    const openDialog = document.querySelector("dialog[open]");
    return {
      insideDialog: Boolean(openDialog && active && openDialog.contains(active)),
      isBody: active === document.body,
      isDialog: active?.tagName === "DIALOG",
    };
  });
  expect(afterShift.isBody).toBe(false);
  expect(afterShift.isDialog).toBe(false);
  expect(afterShift.insideDialog).toBe(true);
});
