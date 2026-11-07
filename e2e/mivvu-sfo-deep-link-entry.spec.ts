import { test as base, expect } from "@playwright/test";

const deepLinkEntry = base;

function primeDeepLinkVisit(page: import("@playwright/test").Page) {
  return page.addInitScript(() => {
    window.sessionStorage.setItem("mivvu.entry.introSeen.v1", "1");
    window.localStorage.removeItem("gatewise.airport-selection.v1");
  });
}

async function expectLegacyDemoRedirectToSfo(page: import("@playwright/test").Page, path: string) {
  await page.goto(path);
  await expect(page).toHaveURL(/\/sfo$/, { timeout: 15_000 });
  await expect(
    page.getByRole("heading", { name: /San Francisco International Airport \(SFO\)/i }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toHaveText(/Facility information is not available/i);
  await expect(page.getByRole("heading", { name: "Browse vs recommend" })).toHaveCount(0);
}

deepLinkEntry("legacy /explore redirects to public SFO browse", async ({ page }) => {
  await primeDeepLinkVisit(page);
  await expectLegacyDemoRedirectToSfo(page, "/explore");
});

deepLinkEntry("legacy /flight redirects to public SFO browse", async ({ page }) => {
  await primeDeepLinkVisit(page);
  await expectLegacyDemoRedirectToSfo(page, "/flight");
});

deepLinkEntry("legacy /recommendations redirects to public SFO browse", async ({ page }) => {
  await primeDeepLinkVisit(page);
  await expectLegacyDemoRedirectToSfo(page, "/recommendations");
});

deepLinkEntry("legacy /plan redirects to public SFO browse", async ({ page }) => {
  await primeDeepLinkVisit(page);
  await expectLegacyDemoRedirectToSfo(page, "/plan");
});
