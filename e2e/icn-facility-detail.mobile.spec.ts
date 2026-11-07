import { expect, test } from "@playwright/test";
import {
  buildIcnBrowseCatalogWithDetailRefs,
  buildIcnFacilityReferenceCatalogs,
} from "../src/lib/icn-facilities/icn-browse-detail-refs";
import { buildIcnFacilityDetailHref } from "../src/lib/icn-facilities/icn-facility-ref-transport";
import { createIcnFacilityRef, serializeIcnFacilityRef } from "../src/lib/icn-facilities/icn-facility-reference";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "../src/lib/icn-facilities/load-icn-facilities-fixture";

function arabicaDetailHref(): string {
  const ko = loadIcnFacilitiesKoFixture();
  const en = loadIcnFacilitiesEnFixture();
  const catalogs = buildIcnFacilityReferenceCatalogs(ko, en);
  const catalog = buildIcnBrowseCatalogWithDetailRefs(ko, "ko", catalogs);
  const item = catalog.items.find((row) => row.sourceId === "3289");
  if (!item?.detailRefTransport) throw new Error("missing 3289 transport");
  return `/icn/f/${item.detailRefTransport}`;
}

test.describe.configure({ timeout: 90_000 });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mivvu.preview.locale.v1", "ko"));
});

test("browse card opens detail, back preserves search, KO/EN shows EN copy on detail", async ({ page }) => {
  await page.goto("/icn");
  const input = page.getByRole("searchbox");
  await input.fill("% 아라비카");
  const card = page.locator(".mivvu-icn-facility-card-link").first();
  await expect(card).toBeVisible();
  await card.click();
  await expect(page).toHaveURL(/\/icn\/f\//, { timeout: 15_000 });
  const title = page.locator(".mivvu-icn-detail-name");
  await expect(title).toContainText("아라비카", { timeout: 45_000 });

  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(title).toContainText("ARABICA", { timeout: 15_000 });
  await expect(page.getByText("Name available in Korean listing only")).toHaveCount(0);

  await page.getByRole("button", { name: "Facility list", exact: true }).click();
  await expect(page).toHaveURL("/icn?q=%25+%EC%95%84%EB%9D%BC%EB%B9%84%EC%B9%B4");
  await expect(input).toHaveValue("% 아라비카");
});

test("direct detail URL and invalid ref recovery", async ({ page }) => {
  const href = arabicaDetailHref();
  await page.goto(href);
  await expect(page.getByRole("status")).toContainText("목록에서 들어오지 않았습니다");
  await page.getByRole("button", { name: "목록으로", exact: true }).click();
  await expect(page).toHaveURL("/icn");

  await page.goto("/icn/f/not-a-valid-ref", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await expect(page.locator(".mivvu-icn-detail-error")).toBeVisible({ timeout: 45_000 });
  await expect(page.getByText("올바르지 않습니다")).toBeVisible();
});

test("header layout and detail content at mobile widths", async ({ page }) => {
  await page.goto(arabicaDetailHref());
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const wordmark = page.locator(".mivvu-icn-header-row1 .mivvu-wordmark-header-compact");
    const lang = page.locator(".mivvu-icn-header-row2 .mivvu-lang-toggle");
    await expect(wordmark).toBeVisible();
    await expect(lang).toBeVisible();
    const wordBox = await wordmark.boundingBox();
    const langBox = await lang.boundingBox();
    expect(wordBox).not.toBeNull();
    expect(langBox).not.toBeNull();
    expect(wordBox!.x + wordBox!.width).toBeLessThanOrEqual(width);
    expect(langBox!.x + langBox!.width).toBeLessThanOrEqual(width);
    if (width === 390) {
      await page.screenshot({ path: "docs/handoffs/GW-ICN-013-detail-ko-390px.png", fullPage: true });
    }
  }
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "docs/handoffs/GW-ICN-013-detail-en-390px.png", fullPage: true });
});

test("direct detail after unrelated navigation does not reuse browse return", async ({ page }) => {
  await page.goto("/icn");
  const input = page.getByRole("searchbox");
  await input.fill("% 아라비카");
  await page.getByRole("button", { name: "제2여객터미널", exact: true }).click();
  await page.locator(".mivvu-icn-facility-card-link").first().click();
  await expect(page.locator(".mivvu-icn-detail-name")).toContainText("아라비카", { timeout: 45_000 });
  await page.getByRole("button", { name: "시설 목록" }).click();
  await expect(page).toHaveURL("/icn?q=%25+%EC%95%84%EB%9D%BC%EB%B9%84%EC%B9%B4&terminal=P03");
  await expect(input).toHaveValue("% 아라비카");
  await expect(page.getByRole("button", { name: "제2여객터미널", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.goto("/flight");
  await page.goto(arabicaDetailHref());
  await expect(page.getByRole("status")).toContainText("목록에서 들어오지 않았습니다");
  await page.getByRole("button", { name: "목록으로", exact: true }).click();
  await expect(page).toHaveURL("/icn");
  await expect(page.getByRole("searchbox")).toHaveValue("");
});

test("detail remains usable when sessionStorage getter throws", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      get() {
        throw new DOMException("review getter blocked", "SecurityError");
      },
    });
  });
  await page.goto(arabicaDetailHref());
  await expect(page.locator(".mivvu-icn-detail-name")).toContainText("아라비카", { timeout: 45_000 });
  await page.getByRole("button", { name: "목록으로", exact: true }).click();
  await expect(page).toHaveURL("/icn");
});

test("browse two-row header evidence at 390px", async ({ page }) => {
  await page.goto("/icn");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".mivvu-icn-header-row1 .mivvu-wordmark-header-compact")).toBeVisible();
  await page.screenshot({ path: "docs/handoffs/GW-ICN-013-browse-header-ko-390px.png" });
});

test("transport round trip for verbose ref with special characters", async ({ page }) => {
  const ko = loadIcnFacilitiesKoFixture();
  const en = loadIcnFacilitiesEnFixture();
  const catalogs = buildIcnFacilityReferenceCatalogs(ko, en);
  const record = catalogs.K.find((row) => row.sourceId === "3289");
  if (!record) throw new Error("missing record");
  const href = buildIcnFacilityDetailHref(serializeIcnFacilityRef(createIcnFacilityRef(record, catalogs)));
  await page.goto(href);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("아라비카");
});
