import { test as base, expect } from "@playwright/test";
import { test as acknowledgedTest } from "./fixtures";

const firstVisit = base;

firstVisit("First visit shows full-page welcome then reaches Flight", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem("gatewise.airport-selection.v1");
  });
  await page.goto("/");
  const welcome = page.getByRole("main", { name: /Where are you flying from/i });
  await expect(welcome).toBeVisible();
  await expect(page.getByRole("heading", { name: "Flight context" })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(0);
  await expect(welcome.getByText(/San Francisco International Airport \(SFO\)/i)).toBeVisible();
  await expect(welcome.getByText(/Other airports are not supported yet/i)).toBeVisible();
  await expect(welcome.getByRole("radio")).toHaveCount(1);
  await welcome.getByRole("button", { name: /Continue to Flight dashboard/i }).click();
  await expect(welcome).toBeHidden();
  await expect(page.getByRole("heading", { name: "Flight context" })).toBeVisible();
});

firstVisit("Deep link to Explore shows welcome then lands on Explore", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem("gatewise.airport-selection.v1");
  });
  await page.goto("/explore");
  await page.getByRole("button", { name: /Continue to Flight dashboard/i }).click();
  await expect(page.getByRole("heading", { name: "Browse vs recommend" })).toBeVisible();
});

acknowledgedTest("Change airport reopens full-page welcome without losing route", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/explore");
  await page.getByRole("button", { name: "Change airport" }).click();
  await expect(
    page.getByRole("main", { name: /Where are you flying from/i }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Browse vs recommend" })).toHaveCount(0);
  await page.getByRole("button", { name: /Continue to Flight dashboard/i }).click();
  await expect(page.getByRole("heading", { name: "Browse vs recommend" })).toBeVisible();
});
