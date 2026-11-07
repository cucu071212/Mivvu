import { expect, test } from "@playwright/test";
import {
  buildIcnBrowseCatalogWithDetailRefs,
  buildIcnFacilityReferenceCatalogs,
} from "../src/lib/icn-facilities/icn-browse-detail-refs";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "../src/lib/icn-facilities/load-icn-facilities-fixture";

/**
 * Regression for shared MivvuIcnHeader after SFO disabled-saved support:
 * ICN browse/detail must still expose an active Saved link with count badge.
 */
test.describe.configure({ timeout: 90_000 });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("mivvu.preview.locale.v1", "en");
    localStorage.removeItem("mivvu.icn.savedFacilities.v1");
  });
});

test("ICN header Saved link opens list; save from detail shows count badge", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/icn");
  const savedHeader = page.getByRole("link", { name: /^Saved$/i });
  await expect(savedHeader).toBeVisible();
  await expect(savedHeader).toHaveAttribute("href", "/icn/saved");
  await expect(page.locator(".mivvu-icn-badge-inline")).toHaveCount(0);

  await savedHeader.click();
  await expect(page).toHaveURL(/\/icn\/saved$/);
  await expect(page.getByRole("heading", { name: /Saved facilities/i })).toBeVisible();
  await expect(page.getByText(/Nothing saved yet/i)).toBeVisible();

  const ko = loadIcnFacilitiesKoFixture();
  const en = loadIcnFacilitiesEnFixture();
  const catalogs = buildIcnFacilityReferenceCatalogs(ko, en);
  const catalog = buildIcnBrowseCatalogWithDetailRefs(ko, "ko", catalogs);
  const item = catalog.items.find((row) => row.sourceId === "3289");
  if (!item?.detailRefTransport) throw new Error("missing 3289 transport");

  await page.goto(`/icn/f/${item.detailRefTransport}`);
  await expect(page.locator(".mivvu-icn-detail-name")).toBeVisible({ timeout: 45_000 });
  await page.getByRole("button", { name: /^Save$/i }).click();
  await expect(page.locator(".mivvu-icn-badge-inline")).toHaveText("1");
  await page.getByRole("link", { name: /Saved/i }).click();
  await expect(page).toHaveURL(/\/icn\/saved$/);
  await expect(page.locator(".mivvu-icn-facility-list > li")).toHaveCount(1);
});
