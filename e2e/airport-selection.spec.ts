import { test as base, expect } from "@playwright/test";
import { test as acknowledgedTest } from "./fixtures";

const firstVisit = base;

firstVisit("First visit shows SFO airport selection then reaches Flight", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem("gatewise.airport-selection.v1");
  });
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: /Where are you flying from/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/San Francisco International Airport \(SFO\)/i)).toBeVisible();
  await expect(dialog.getByText(/Other airports are not supported yet/i)).toBeVisible();
  await expect(dialog.getByRole("radio")).toHaveCount(1);
  await dialog.getByRole("button", { name: /Continue to Flight dashboard/i }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { name: "Flight context" })).toBeVisible();
});

firstVisit("Deep link to Explore waits for airport selection then lands on Explore", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem("gatewise.airport-selection.v1");
  });
  await page.goto("/explore");
  await page.getByRole("button", { name: /Continue to Flight dashboard/i }).click();
  await expect(page.getByRole("heading", { name: "Browse vs recommend" })).toBeVisible();
});

acknowledgedTest("Change airport reopens selection without losing route", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/explore");
  await page.getByRole("button", { name: "Change airport" }).click();
  await expect(
    page.getByRole("dialog", { name: /Where are you flying from/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Continue to Flight dashboard/i }).click();
  await expect(page.getByRole("heading", { name: "Browse vs recommend" })).toBeVisible();
});
