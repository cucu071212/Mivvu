import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mivvu.preview.locale.v1", "ko"));
  await page.goto("/icn");
  await expect(page.getByRole("searchbox")).toBeVisible();
});

test("Korean composition, raw text, locale/filter state, counts and keyboard focus", async ({ page }) => {
  const input = page.getByRole("searchbox");
  await input.focus();
  const cdp = await page.context().newCDPSession(page);
  for (const text of ["ㅎ", "화", "화장", "화장실"]) {
    await cdp.send("Input.imeSetComposition", { text, selectionStart: text.length, selectionEnd: text.length });
    await expect(input).toHaveValue(text);
    await expect(input).toBeFocused();
  }
  await cdp.send("Input.insertText", { text: "화장실" });
  await cdp.detach();
  const cards = page.locator(".mivvu-icn-facility-list > li");
  await expect(cards.first()).toBeVisible();
  await page.getByRole("button", { name: "제2여객터미널", exact: true }).click();
  await input.fill("  ㅎㅈㅅ  ");
  await expect(input).toHaveValue("  ㅎㅈㅅ  ");
  await expect(input).toBeFocused();
  await expect(page.locator(".mivvu-icn-count-number")).toHaveText(String(await cards.count()));
  for (const meta of await page.locator(".mivvu-icn-facility-meta").allTextContents()) expect(meta).toMatch(/^T2/);
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(input).toHaveValue("  ㅎㅈㅅ  ");
  await expect(page.getByRole("button", { name: "Terminal 2", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("status")).toContainText("No facilities match");
  await expect(page.locator(".mivvu-icn-count-number")).toHaveText("0");
  await input.fill("starbcks");
  await expect(cards.first()).toBeVisible();
  const typoNames = await page.locator(".mivvu-icn-facility-name").allTextContents();
  await input.fill("starbucks");
  expect(await page.locator(".mivvu-icn-facility-name").allTextContents()).toEqual(typoNames);
  await expect(input).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "All", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "All", exact: true })).toHaveAttribute("aria-pressed", "true");
  await input.fill("");
  await expect(page.locator(".mivvu-icn-count-number")).toHaveText("1,011");
  await expect(cards).toHaveCount(1011);
});

test("literal hostile-looking queries and mobile layout retain accessibility and honest copy", async ({ page }) => {
  const input = page.getByRole("searchbox");
  for (const query of ["^.*$", '<img src=x onerror="alert(1)">']) {
    await input.fill(query);
    await expect(input).toHaveValue(query);
    await expect(page.getByRole("status")).toBeVisible();
    await expect(page.locator(".mivvu-icn-count-number")).toHaveText("0");
  }
  // Real saved listings contain bracketed text; an unmatched regex bracket is valid literal search data.
  await input.fill("[");
  const bracketCards = page.locator(".mivvu-icn-facility-list > li");
  await expect(bracketCards.first()).toBeVisible();
  for (const text of await bracketCards.allTextContents()) expect(text).toContain("[");
  await expect(page.locator(".mivvu-icn-count-number")).toHaveText(String(await bracketCards.count()));
  await expect(input).toHaveAccessibleName("시설 검색");
  await expect(input).toHaveAccessibleDescription("한국어로 검색");
  await expect(page.locator(".mivvu-icn-result-count")).toHaveAttribute("aria-live", "polite");
  await input.fill("ㅎㅈㅅ");
  await page.getByRole("button", { name: "제2여객터미널", exact: true }).click();
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const rect = await input.boundingBox();
    expect(rect).not.toBeNull();
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(width);
    await expect(input).toBeVisible();
    if (width === 390) await page.screenshot({ path: "docs/handoffs/GW-ICN-008-390-ko.png" });
  }
  await page.getByRole("button", { name: "English", exact: true }).click();
  await input.fill("248 starbcks");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".mivvu-icn-facility-list > li").first()).toBeVisible();
  await page.screenshot({ path: "docs/handoffs/GW-ICN-008-390-en.png" });
  await expect(page.locator(".mivvu-icn-snapshot-note")).toContainText("Saved listing snapshot only");
});
