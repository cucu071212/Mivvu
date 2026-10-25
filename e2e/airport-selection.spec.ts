import { test as base, expect } from "@playwright/test";
import { test as acknowledgedTest } from "./fixtures";

const firstVisit = base;

firstVisit("First visit shows searchable welcome then reaches Flight with SFO", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem("gatewise.airport-selection.v1");
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Where are you flying from/i })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: /Search airports/i })).toBeVisible();
  await expect(page.getByText(/Starting with San Francisco/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Flight context" })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(0);
  await expect(page.getByText("JFK")).toBeVisible();
  await page.getByRole("button", { name: /Continue to Flight dashboard/i }).click();
  await expect(page.getByRole("heading", { name: "Flight context" })).toBeVisible();
});

firstVisit("Search filters by city and empty state appears", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem("gatewise.airport-selection.v1");
  });
  await page.goto("/");
  const directory = page.getByRole("radiogroup", { name: "Airports" });
  await page.getByRole("searchbox", { name: /Search airports/i }).fill("los angeles");
  await expect(directory.getByText(/Los Angeles International Airport/i)).toBeVisible();
  await expect(directory.getByRole("radio")).toHaveCount(1);
  await page.getByRole("searchbox", { name: /Search airports/i }).fill("no-match-xyz");
  await expect(page.getByText(/No airports match your search/i)).toBeVisible();
});

firstVisit("Coming-soon airport cannot continue into the app", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem("gatewise.airport-selection.v1");
  });
  await page.goto("/");
  await page.getByRole("searchbox", { name: /Search airports/i }).fill("JFK");
  await page.getByRole("radio", { name: /JFK/i }).check();
  await expect(page.getByText(/not available in GateWise yet/i)).toBeVisible();
  const continueBtn = page.getByRole("button", { name: /Continue to Flight dashboard/i });
  await expect(continueBtn).toBeDisabled();
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
  await expect(page.getByRole("heading", { name: /Where are you flying from/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Browse vs recommend" })).toHaveCount(0);
  await page.getByRole("button", { name: /Continue to Flight dashboard/i }).click();
  await expect(page.getByRole("heading", { name: "Browse vs recommend" })).toBeVisible();
});

acknowledgedTest("Welcome directory is usable at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.localStorage.removeItem("gatewise.airport-selection.v1");
  });
  await page.goto("/");
  await expect(page.getByRole("searchbox", { name: /Search airports/i })).toBeVisible();
  await page.getByRole("searchbox", { name: /Search airports/i }).fill("sfo");
  const directory = page.getByRole("radiogroup", { name: "Airports" });
  await expect(directory.getByText("San Francisco International Airport", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Continue to Flight dashboard/i }).click();
  await expect(page.getByRole("heading", { name: "Flight context" })).toBeVisible();
});
