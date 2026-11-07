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

async function chooseSfoAndBrowse(page: import("@playwright/test").Page) {
  await page.locator('input[type="radio"][value="SFO"]').click({ force: true });
  await expect(page.getByRole("button", { name: /Explore SFO/i })).toBeVisible();
  await page.getByRole("button", { name: /Explore SFO/i }).click();
  await expect(page).toHaveURL(/\/sfo$/, { timeout: 15_000 });
}

firstVisit("First visit shows Mivvu airport selection then reaches public SFO browse", async ({
  page,
}) => {
  await primeFirstVisit(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Choose your airport/i })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: /Search airports/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Browse vs recommend" })).toHaveCount(0);
  await chooseSfoAndBrowse(page);
  await expect(page).toHaveURL(/\/sfo$/);
  await expect(
    page.getByRole("heading", { name: /San Francisco International Airport \(SFO\)/i }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toHaveText(/Facility information is not available/i);
  await expect(page.getByRole("searchbox", { name: /Search facilities/i })).toBeDisabled();
  await expect(page.getByRole("button", { name: /^All$/i })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Type All/i })).toBeDisabled();
  const saved = page.getByRole("link", { name: /^Saved$/i });
  await expect(saved).toHaveAttribute("aria-disabled", "true");
  await expect(saved).not.toHaveAttribute("href", /.+/);
  await expect(page.locator(".mivvu-icn-badge-inline")).toHaveCount(0);
  await page.getByRole("button", { name: /한국어/i }).click();
  await expect(
    page.getByRole("heading", { name: /샌프란시스코 국제공항 \(SFO\)/i }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toHaveText(/시설 정보를 이용할 수 없습니다/i);
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
  await expect(page.getByText(/No airports match your search/i )).toBeVisible();
});

firstVisit("Explore ICN opens the ICN facility directory", async ({ page }) => {
  await skipMivvuIntro(page);
  await page.goto("/");
  await page.getByRole("button", { name: /Explore ICN/i }).click();
  await expect(page).toHaveURL(/\/icn$/);
  await expect(page.getByRole("heading", { name: /Incheon Airport facilities/i })).toBeVisible();
});

firstVisit("Deep link to legacy Explore redirects to public SFO browse", async ({ page }) => {
  await primeFirstVisit(page);
  await page.goto("/explore");
  await expect(page).toHaveURL(/\/sfo$/);
  await expect(
    page.getByRole("heading", { name: /San Francisco International Airport \(SFO\)/i }),
  ).toBeVisible();
});

acknowledgedTest("Back from SFO browse returns to airport selection then ICN", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await skipMivvuIntro(page);
  await page.goto("/");
  await chooseSfoAndBrowse(page);
  await page.getByRole("button", { name: /Airports/i }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: /Choose your airport/i })).toBeVisible();
  // Returning from SFO keeps SFO selected; reselect ICN before opening the ICN directory.
  await page.locator('input[type="radio"][value="ICN"]').click({ force: true });
  await page.getByRole("button", { name: /Explore ICN/i }).click();
  await expect(page).toHaveURL(/\/icn$/);
  await expect(page.getByRole("heading", { name: /Incheon Airport facilities/i })).toBeVisible();
});

acknowledgedTest("Mivvu airport directory is usable at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await primeFirstVisit(page);
  await page.goto("/");
  await expect(page.getByRole("searchbox", { name: /Search airports/i })).toBeVisible();
  await page.getByRole("searchbox", { name: /Search airports/i }).fill("sfo");
  const directory = page.getByRole("radiogroup", { name: "Airports" });
  await expect(directory.getByRole("radio", { name: /San Francisco International Airport/i })).toHaveCount(1);
  await chooseSfoAndBrowse(page);
  await expect(page).toHaveURL(/\/sfo$/);
});

acknowledgedTest("Legacy preview entry URL redirects to canonical root", async ({ page }) => {
  await skipMivvuIntro(page);
  await page.goto("/preview/mivvu-entry");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: /Choose your airport/i })).toBeVisible();
});
