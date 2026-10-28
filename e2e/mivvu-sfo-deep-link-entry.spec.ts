import { test as base, expect } from "@playwright/test";

const deepLinkEntry = base;

function primeDeepLinkVisit(page: import("@playwright/test").Page) {
  return page.addInitScript(() => {
    window.sessionStorage.setItem("mivvu.entry.introSeen.v1", "1");
    window.localStorage.removeItem("gatewise.airport-selection.v1");
  });
}

async function completeDeepLinkSfoRoundTrip(page: import("@playwright/test").Page) {
  await page.goto("/explore");
  await expect(page.getByRole("heading", { name: /Choose your airport/i })).toBeVisible();
  await page.locator('input[type="radio"][value="SFO"]').click({ force: true });
  await page.getByRole("button", { name: /Explore SFO/i }).click();
  await expect(page).toHaveURL(/\/explore$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Browse vs recommend" })).toBeVisible();
  await page.waitForTimeout(300);
  await expect(page).toHaveURL(/\/explore$/);
}

deepLinkEntry("normal localStorage: /explore deep link reaches and stays on SFO explore", async ({
  page,
}) => {
  await primeDeepLinkVisit(page);
  await completeDeepLinkSfoRoundTrip(page);
});

deepLinkEntry("QuotaExceededError on setItem: deep link round trip stays on explore", async ({
  page,
}) => {
  await primeDeepLinkVisit(page);
  await page.addInitScript(() => {
    const storage = window.localStorage;
    storage.setItem = () => {
      throw new DOMException("quota", "QuotaExceededError");
    };
  });
  await completeDeepLinkSfoRoundTrip(page);
});

deepLinkEntry(
  "SecurityError on localStorage getter: deep link round trip stays on explore",
  async ({ page }) => {
    await primeDeepLinkVisit(page);
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        get() {
          throw new DOMException("denied", "SecurityError");
        },
      });
    });
    await completeDeepLinkSfoRoundTrip(page);
  },
);
