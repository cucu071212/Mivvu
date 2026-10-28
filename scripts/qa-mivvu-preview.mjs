/* Local GW-ICN-005 production-build browser probe. Run against a freshly built loopback server. */
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const origin = process.env.MIVVU_QA_ORIGIN || "http://127.0.0.1:3111";
const errors = [];
const results = [];
const record = (name, value) => results.push({ name, value });

async function ready(page, locale) {
  await page.getByRole("heading", { name: locale === "ko" ? "인천공항 시설" : "Incheon Airport facilities" }).waitFor();
}
async function newPage(browser, options = {}) {
  const context = await browser.newContext({ locale: options.locale || "en-US", viewport: options.viewport || { width: 390, height: 844 }, reducedMotion: options.reducedMotion || "reduce" });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  return { context, page };
}
function countText(page) { return page.locator(".mivvu-icn-count-number").innerText(); }
async function metrics(page) {
  return page.evaluate(() => {
    const card = document.querySelector(".mivvu-icn-facility-card");
    const chips = document.querySelector(".mivvu-icn-chip-row");
    return { width: innerWidth, documentWidth: document.documentElement.scrollWidth, firstCardBottom: card?.getBoundingClientRect().bottom, chipScrollWidth: chips?.scrollWidth, chipClientWidth: chips?.clientWidth, scrollHeight: document.documentElement.scrollHeight, cardFont: card ? getComputedStyle(card.querySelector("h2")).fontSize : null };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const locale of ["ko", "en"]) {
      const { context, page } = await newPage(browser, { locale: locale === "ko" ? "ko-KR" : "en-US" });
      await page.goto(`${origin}/preview/mivvu-entry/icn`);
      await ready(page, locale);
      assert.equal(await countText(page), "1,011");
      assert.equal(await page.locator(".mivvu-icn-facility-name").first().innerText(), locale === "ko" ? "% 아라비카" : "% ARABICA");
      assert.equal(await page.getByText("00:00 ~ 00:00", { exact: true }).count(), 0);
      assert.ok(await page.getByText(locale === "ko" ? "운영시간 확인 필요" : "Hours unavailable", { exact: true }).count() > 0);
      assert.ok(await page.getByText("00:00 ~ 24:00", { exact: true }).count() > 0);
      const m = await metrics(page);
      assert.ok(m.documentWidth <= m.width, `page overflow at ${locale}: ${JSON.stringify(m)}`);
      assert.ok(m.firstCardBottom <= 844, `first card below viewport at ${locale}: ${JSON.stringify(m)}`);
      record(`${locale} default`, m);
      await context.close();
    }
    {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(`${origin}/preview/mivvu-entry/icn`);
      assert.equal(await page.getByRole("heading").count(), 0);
      assert.ok(await page.getByRole("status", { name: "Loading" }).count());
      record("pre-hydration locale shell", true);
      await context.close();
    }

    {
      const { context, page } = await newPage(browser, { reducedMotion: "no-preference" });
      await page.goto(`${origin}/preview/mivvu-entry`);
      await page.getByRole("dialog", { name: "Mivvu welcome" }).waitFor();
      const started = Date.now();
      await page.getByRole("heading", { name: "Choose your airport" }).waitFor({ timeout: 5000 });
      const elapsed = Date.now() - started;
      assert.ok(elapsed >= 2500 && elapsed <= 4500, `automatic intro elapsed ${elapsed}ms`);
      assert.equal(await page.evaluate(() => sessionStorage.getItem("mivvu.entry.introSeen.v1")), "1");
      record("automatic intro", { elapsedMsFromVisibleDialog: elapsed });
      await context.close();
    }
    {
      const { context, page } = await newPage(browser, { reducedMotion: "no-preference" });
      await page.goto(`${origin}/preview/mivvu-entry`);
      await page.getByRole("dialog", { name: "Mivvu welcome" }).click();
      await page.getByRole("heading", { name: "Choose your airport" }).waitFor();
      await page.reload();
      await page.getByRole("heading", { name: "Choose your airport" }).waitFor();
      assert.equal(await page.getByRole("dialog").count(), 0);
      record("tap dismissal and once per session", true);
      await context.close();
    }
    {
      const { context, page } = await newPage(browser, { reducedMotion: "no-preference" });
      await page.goto(`${origin}/preview/mivvu-entry`);
      await page.getByRole("dialog", { name: "Mivvu welcome" }).waitFor();
      await page.keyboard.press("Tab");
      assert.ok(await page.getByRole("dialog").evaluate((el) => el.matches(":focus-visible")));
      await page.keyboard.press("Enter");
      await page.getByRole("heading", { name: "Choose your airport" }).waitFor();
      record("keyboard intro dismissal", true);
      await context.close();
    }

    const { context, page } = await newPage(browser, { locale: "ko-KR" });
    await page.goto(`${origin}/preview/mivvu-entry`);
    await page.getByRole("heading", { name: "공항을 선택하세요" }).waitFor();
    assert.equal(await page.getByRole("dialog", { name: "Mivvu welcome" }).count(), 0);
    await page.getByRole("searchbox", { name: "공항 검색" }).focus();
    await page.keyboard.press("Tab");
    const radioFocus = await page.evaluate(() => ({
      input: document.activeElement?.classList.contains("mivvu-entry-radio"),
      cardOutline: getComputedStyle(document.activeElement?.closest("label")).outlineStyle,
    }));
    assert.ok(radioFocus.input && radioFocus.cardOutline !== "none", `airport radio focus not visible: ${JSON.stringify(radioFocus)}`);
    await page.getByRole("button", { name: "English" }).click();
    await page.getByRole("heading", { name: "Choose your airport" }).waitFor();
    await page.getByRole("button", { name: "Explore ICN" }).click();
    await ready(page, "en");
    assert.equal(await countText(page), "1,011");
    const search = page.getByRole("searchbox", { name: "Search facilities" });
    await search.fill("% ARABICA");
    const searchCount = Number((await countText(page)).replace(/,/g, ""));
    assert.ok(searchCount > 0 && searchCount < 1011);
    await page.getByRole("button", { name: "Terminal 1", exact: true }).click();
    const combinedCount = Number((await countText(page)).replace(/,/g, ""));
    assert.ok(combinedCount <= searchCount);
    await search.fill("never-a-facility-zzzz");
    assert.equal(await countText(page), "0");
    assert.ok(await page.getByRole("status").filter({ hasText: "No facilities match" }).count());
    await search.fill("");
    await page.getByRole("button", { name: "All", exact: true }).click();
    assert.equal(await countText(page), "1,011");
    await search.fill("Bus Stops 11");
    const noCategory = page.getByRole("heading", { name: "Bus Stops 11" }).locator("..");
    assert.equal(await noCategory.locator(".mivvu-icn-facility-category").count(), 0);
    await search.fill("East Long-term Parking Tower");
    const noHours = page.getByRole("heading", { name: "East Long-term Parking Tower" }).locator("..");
    assert.equal(await noHours.locator(".mivvu-icn-facility-hours").count(), 0);
    await search.fill("ARABICA");
    await page.getByRole("button", { name: "한국어" }).click();
    await ready(page, "ko");
    assert.equal(await page.getByRole("searchbox", { name: "시설 검색" }).inputValue(), "ARABICA");
    await page.getByRole("button", { name: "English" }).click();
    await ready(page, "en");
    await page.getByRole("button", { name: "Airports" }).click();
    await page.getByRole("heading", { name: "Choose your airport" }).waitFor();
    assert.equal(await page.getByRole("dialog", { name: "Mivvu welcome" }).count(), 0);
    await page.reload();
    await page.getByRole("heading", { name: "Choose your airport" }).waitFor();
    assert.equal(await page.getByRole("button", { name: "English" }).getAttribute("aria-pressed"), "true");
    await page.locator('label[for="mivvu-airport-SFO"]').click();
    await page.getByRole("button", { name: "Explore SFO" }).click();
    await page.waitForURL("**/explore");
    record("navigation and locale persistence", { searchCount, combinedCount, sfoPath: new URL(page.url()).pathname });
    await context.close();

    for (const width of [360, 390, 430]) {
      for (const locale of ["ko-KR", "en-US"]) {
        const { context, page } = await newPage(browser, { locale, viewport: { width, height: 844 } });
        await page.goto(`${origin}/preview/mivvu-entry/icn`);
        await ready(page, locale === "ko-KR" ? "ko" : "en");
        const m = await metrics(page);
        assert.ok(m.documentWidth <= width, `overflow ${locale}/${width}: ${JSON.stringify(m)}`);
        assert.ok(m.chipScrollWidth >= m.chipClientWidth);
        record(`viewport ${locale} ${width}x844`, m);
        await context.close();
        const entry = await newPage(browser, { locale, viewport: { width, height: 844 } });
        await entry.page.goto(`${origin}/preview/mivvu-entry`);
        await entry.page.getByRole("heading", { name: locale === "ko-KR" ? "공항을 선택하세요" : "Choose your airport" }).waitFor();
        const entryWidth = await entry.page.evaluate(() => document.documentElement.scrollWidth);
        assert.ok(entryWidth <= width, `entry overflow ${locale}/${width}: ${entryWidth}`);
        record(`entry viewport ${locale} ${width}x844`, { documentWidth: entryWidth });
        await entry.context.close();
      }
    }
    for (const locale of ["ko-KR", "en-US"]) {
      const { context, page } = await newPage(browser, { locale, viewport: { width: 390, height: 600 } });
      await page.goto(`${origin}/preview/mivvu-entry/icn`);
      await ready(page, locale === "ko-KR" ? "ko" : "en");
      const m = await metrics(page);
      assert.ok(m.documentWidth <= 390);
      await page.evaluate(() => { document.documentElement.style.fontSize = "24px"; });
      await page.waitForTimeout(50);
      const large = await metrics(page);
      assert.ok(parseFloat(large.cardFont) > parseFloat(m.cardFont), `text did not enlarge: ${JSON.stringify({ m, large })}`);
      assert.ok(large.documentWidth <= 390, `large text overflow: ${JSON.stringify(large)}`);
      await page.locator(".mivvu-icn-facility-card").last().scrollIntoViewIfNeeded();
      assert.ok(await page.locator(".mivvu-icn-facility-card").last().isVisible());
      const chips = page.locator(".mivvu-icn-chip-row");
      await page.getByRole("button", { name: locale === "ko-KR" ? "제2여객터미널" : "Terminal 2", exact: true }).click();
      if (large.chipScrollWidth > large.chipClientWidth) {
        assert.ok(await chips.evaluate((el) => el.scrollLeft) > 0);
      }
      await page.keyboard.press("Shift+Tab");
      assert.ok(await page.evaluate(() => document.activeElement?.matches(":focus-visible")));
      record(`short viewport and large text ${locale}`, { default: m, enlarged: large });
      await context.close();
    }
    assert.deepEqual(errors.filter((e) => /hydration|did not match|uncaught|error/i.test(e)), []);
    record("browser errors", errors);
    console.log(JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
