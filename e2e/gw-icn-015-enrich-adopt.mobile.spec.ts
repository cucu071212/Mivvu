import { expect, test } from "@playwright/test";
import {
  buildIcnBrowseCatalogWithDetailRefs,
  buildIcnFacilityReferenceCatalogs,
} from "../src/lib/icn-facilities/icn-browse-detail-refs";
import { createIcnFacilityRef, serializeIcnFacilityRef } from "../src/lib/icn-facilities/icn-facility-reference";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "../src/lib/icn-facilities/load-icn-facilities-fixture";

function detailPath(sourceId: string, locale: "ko" | "en"): string {
  const ko = loadIcnFacilitiesKoFixture();
  const en = loadIcnFacilitiesEnFixture();
  const catalogs = buildIcnFacilityReferenceCatalogs(ko, en);
  const browse = buildIcnBrowseCatalogWithDetailRefs(ko, locale, catalogs);
  const item = browse.items.find((row) => row.sourceId === sourceId);
  if (!item?.detailRefTransport) throw new Error(`missing transport for ${sourceId}`);
  return `/icn/f/${item.detailRefTransport}`;
}

/** E-origin detail href (EN listing record), as used in independent adopt review for sourceId 243. */
function detailPathEnOrigin(sourceId: string): string {
  const ko = loadIcnFacilitiesKoFixture();
  const en = loadIcnFacilitiesEnFixture();
  const catalogs = buildIcnFacilityReferenceCatalogs(ko, en);
  const browse = buildIcnBrowseCatalogWithDetailRefs(en, "en", catalogs);
  const item = browse.items.find((row) => row.sourceId === sourceId);
  if (!item?.detailRefTransport) throw new Error(`missing E-origin transport for ${sourceId}`);
  return `/icn/f/${item.detailRefTransport}`;
}

test.describe.configure({ timeout: 120_000 });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    delete (window as unknown as { ICN_GOODS_SERVICES_DEV?: string }).ICN_GOODS_SERVICES_DEV;
  });
});

test("real companion: KO detail shows description and observation date (390px)", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mivvu.preview.locale.v1", "ko"));
  await page.goto(detailPath("3289", "ko"));
  await expect(page.locator(".mivvu-icn-detail-name")).toContainText("아라비카", { timeout: 60_000 });
  await expect(page.locator(".mivvu-icn-goods-services")).toBeVisible();
  await expect(page.locator(".mivvu-icn-goods-meta")).toContainText("2026");
  await expect(page.locator(".mivvu-icn-goods-dev-banner")).toHaveCount(0);
  await page.screenshot({ path: "docs/handoffs/GW-ICN-015-adopt-ko-detail-390px.png", fullPage: true });
});

test("real companion: EN detail shows EN description (390px)", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mivvu.preview.locale.v1", "en"));
  await page.goto(detailPath("3289", "en"));
  await expect(page.locator(".mivvu-icn-detail-name")).toContainText("ARABICA", { timeout: 60_000 });
  await expect(page.locator(".mivvu-icn-goods-services")).toBeVisible();
  await expect(page.locator(".mivvu-icn-goods-text")).toContainText("Latte");
  await page.screenshot({ path: "docs/handoffs/GW-ICN-015-adopt-en-detail-390px.png", fullPage: true });
});

test("real companion: KO sourceId 243 shows description without expansion control (187 chars)", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mivvu.preview.locale.v1", "ko"));
  await page.goto(detailPath("243", "ko"));
  await expect(page.locator(".mivvu-icn-goods-services")).toBeVisible({ timeout: 60_000 });
  await expect(page.locator(".mivvu-icn-goods-toggle")).toHaveCount(0);
});

test("real companion: EN E-origin sourceId 243 expands long description (349 chars)", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.addInitScript(() => localStorage.setItem("mivvu.preview.locale.v1", "en"));
  await page.goto(detailPathEnOrigin("243"));
  await expect(page.locator(".mivvu-icn-goods-services")).toBeVisible({ timeout: 60_000 });
  const toggle = page.getByRole("button", { name: "Show more", exact: true });
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await page.screenshot({ path: "docs/handoffs/GW-ICN-015-adopt-en-long-360px-collapsed.png", fullPage: true });
  await toggle.click();
  const showLess = page.getByRole("button", { name: "Show less", exact: true });
  await expect(showLess).toBeVisible();
  await expect(showLess).toHaveAttribute("aria-expanded", "true");
  await page.screenshot({ path: "docs/handoffs/GW-ICN-015-adopt-en-long-360px-expanded.png", fullPage: true });
  await showLess.click();
  await expect(page.getByRole("button", { name: "Show more", exact: true })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await page.setViewportSize({ width: 430, height: 900 });
  await page.screenshot({ path: "docs/handoffs/GW-ICN-015-adopt-en-long-430px-collapsed.png", fullPage: true });
});

test("empty and unmatched records hide goods section while core detail renders", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mivvu.preview.locale.v1", "ko"));
  await page.goto(detailPath("3395", "ko"));
  await expect(page.locator(".mivvu-icn-detail-name")).toBeVisible({ timeout: 60_000 });
  await expect(page.locator(".mivvu-icn-goods-services")).toHaveCount(0);
  await page.goto(detailPath("2063", "ko"));
  await expect(page.locator(".mivvu-icn-detail-name")).toBeVisible({ timeout: 60_000 });
  await expect(page.locator(".mivvu-icn-goods-services")).toHaveCount(0);
  await page.screenshot({ path: "docs/handoffs/GW-ICN-015-adopt-hidden-section-390px.png", fullPage: true });
});

test("browse search to detail and back preserves filters", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mivvu.preview.locale.v1", "ko"));
  await page.goto("/icn");
  const input = page.getByRole("searchbox");
  await input.fill("면세");
  await page.locator(".mivvu-icn-facility-card-link").first().click();
  await expect(page.locator(".mivvu-icn-detail-name")).toBeVisible({ timeout: 60_000 });
  await page.getByRole("button", { name: "시설 목록", exact: true }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("면세");
  await page.screenshot({ path: "docs/handoffs/GW-ICN-015-adopt-browse-return-390px.png", fullPage: true });
});
