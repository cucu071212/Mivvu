import { test as base, expect } from "@playwright/test";
import { test as acknowledgedTest } from "./fixtures";

const firstVisit = base;

function primeFirstVisit(page: import("@playwright/test").Page) {
  return page.addInitScript(() => {
    window.sessionStorage.setItem("mivvu.entry.introSeen.v1", "1");
    window.localStorage.removeItem("gatewise.airport-selection.v1");
  });
}

function skipMivvuIntro(page: import("@playwright/test").Page) {
  return page.addInitScript(() => {
    window.sessionStorage.setItem("mivvu.entry.introSeen.v1", "1");
  });
}

async function chooseSfoAndExplore(page: import("@playwright/test").Page) {
  await page.locator('input[type="radio"][value="SFO"]').click({ force: true });
  await expect(page.getByRole("button", { name: /Explore SFO/i })).toBeVisible();
  await page.getByRole("button", { name: /Explore SFO/i }).click();
  await page.waitForFunction(() => {
    const raw = window.localStorage.getItem("gatewise.airport-selection.v1");
    if (!raw) return false;
    try {
      return JSON.parse(raw).airportIata === "SFO";
    } catch {
      return false;
    }
  });
  await expect(page).toHaveURL(/\/explore$/, { timeout: 15_000 });
}

firstVisit("First visit shows Mivvu airport selection then reaches Explore via SFO", async ({
  page,
}) => {
  await primeFirstVisit(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Choose your airport/i })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: /Search airports/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Browse vs recommend" })).toHaveCount(0);
  await chooseSfoAndExplore(page);
  await expect(page).toHaveURL(/\/explore$/);
  await expect(page.getByRole("heading", { name: "Browse vs recommend" })).toBeVisible();
});

firstVisit("Search filters the Mivvu airport directory and empty state appears", async ({
  page,
}) => {
  await primeFirstVisit(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Choose your airport/i })).toBeVisible();
  const directory = page.getByRole("radiogroup", { name: "Airports" });
  await page.getByRole("searchbox", { name: /Search airports/i }).fill("incheon");
  await expect(directory.getByRole("radio", { name: /Incheon International Airport/i })).toHaveCount(1);
  await page.getByRole("searchbox", { name: /Search airports/i }).fill("no-match-xyz");
  await expect(page.getByText(/No airports match your search/i)).toBeVisible();
});

firstVisit("Explore ICN opens the ICN facility directory", async ({ page }) => {
  await skipMivvuIntro(page);
  await page.goto("/");
  await page.getByRole("button", { name: /Explore ICN/i }).click();
  await expect(page).toHaveURL(/\/icn$/);
  await expect(page.getByRole("heading", { name: /Incheon Airport facilities/i })).toBeVisible();
});

firstVisit("Deep link to Explore redirects to Mivvu entry", async ({ page }) => {
  await primeFirstVisit(page);
  await page.goto("/explore");
  await expect(page.getByRole("heading", { name: /Choose your airport/i })).toBeVisible();
});

acknowledgedTest("Change airport opens Mivvu entry without losing SFO session route", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await skipMivvuIntro(page);
  await page.goto("/explore");
  await page.getByRole("button", { name: "Change airport" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: /Choose your airport/i })).toBeVisible();
  await chooseSfoAndExplore(page);
  await expect(page).toHaveURL(/\/explore$/);
  await expect(page.getByRole("heading", { name: "Browse vs recommend" })).toBeVisible();
});

acknowledgedTest("Mivvu airport directory is usable at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await primeFirstVisit(page);
  await page.goto("/");
  await expect(page.getByRole("searchbox", { name: /Search airports/i })).toBeVisible();
  await page.getByRole("searchbox", { name: /Search airports/i }).fill("sfo");
  const directory = page.getByRole("radiogroup", { name: "Airports" });
  await expect(directory.getByRole("radio", { name: /San Francisco International Airport/i })).toHaveCount(1);
  await chooseSfoAndExplore(page);
  await expect(page).toHaveURL(/\/explore$/);
});

acknowledgedTest("Legacy preview entry URL redirects to canonical root", async ({ page }) => {
  await skipMivvuIntro(page);
  await page.goto("/preview/mivvu-entry");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: /Choose your airport/i })).toBeVisible();
});
