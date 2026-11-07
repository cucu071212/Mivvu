/**
 * GW-ICN-019 screenshot capture with assertions.
 * Run from repo root: node docs/design/gw-icn-019/capture-screenshots.mjs
 * Requires: linked node_modules, Playwright Chromium (npx playwright install chromium).
 */
import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "screenshots");
const PORT = process.env.GW_ICN_019_PORT || "8766";
const BASE = `http://127.0.0.1:${PORT}/`;

function startServer() {
  return spawn("python3", ["-m", "http.server", PORT], {
    cwd: __dirname,
    stdio: "ignore",
  });
}

const EN_ONLY = process.env.GW_ICN_019_EN_ONLY === "1";

async function assertArabicaEnBrowseCard(page) {
  const card = page.locator('[data-action="open"][data-id="browse-0"]');
  await card.waitFor({ state: "visible" });
  const text = await card.innerText();
  if (!text.includes("% ARABICA")) {
    throw new Error(`Expected fixture EN name on browse card, got: ${text.slice(0, 120)}`);
  }
  if (!text.includes("Near Gate 209")) {
    throw new Error(`Expected fixture EN location on browse card, got: ${text.slice(0, 120)}`);
  }
  if (text.includes("아라비카")) {
    throw new Error("KO facility name appears on default EN browse card without disclosure");
  }
  const fallbackLines = await card.locator(".mivvu-icn-ko-fallback").count();
  if (fallbackLines > 0) {
    throw new Error("Unexpected KO fallback hint on fixture-backed Arabica EN card");
  }
}

async function assertScreen(page, { screen, locale, titleIncludes }) {
  await page.waitForSelector(`#app[data-screen="${screen}"][data-locale="${locale}"]`, {
    timeout: 15000,
  });
  const title = await page.locator("[data-testid=screen-title]").first().textContent();
  if (!title || !titleIncludes.some((s) => title.includes(s))) {
    throw new Error(
      `Expected title containing ${JSON.stringify(titleIncludes)}, got "${title}" (screen=${screen}, locale=${locale})`,
    );
  }
}

async function shotPhone(page, name) {
  const phone = page.locator("#phone");
  await phone.waitFor({ state: "visible" });
  await phone.screenshot({ path: path.join(OUT, name) });
}

async function setHarnessWidth(page, width) {
  await page.selectOption("#viewport-select", String(width));
  await page.waitForTimeout(150);
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  const server = startServer();
  await new Promise((r) => setTimeout(r, 900));
  const browser = await chromium.launch();
  const errors = [];
  try {
    async function runViewport(browserWidth, harnessWidth, suffix) {
      const page = await browser.newPage({ viewport: { width: browserWidth, height: 820 } });
      await page.goto(BASE, { waitUntil: "networkidle" });
      await page.waitForSelector("#app:not([hidden])");
      await setHarnessWidth(page, harnessWidth);

      if (!EN_ONLY) {
        await page.evaluate(() => localStorage.removeItem("gw-icn-019-prototype-saved.v1"));
        await page.goto(BASE + "#/browse?lang=ko&demo=normal", { waitUntil: "networkidle" });
        await assertScreen(page, { screen: "browse", locale: "ko", titleIncludes: ["인천공항"] });
        await shotPhone(page, `01-browse-default-ko-${suffix}.png`);

        await page.click('[data-action="toggle-category-panel"]');
        await page.click('[data-action="category"][data-value="식・음료"]');
        await assertScreen(page, { screen: "browse", locale: "ko", titleIncludes: ["인천공항"] });
        await shotPhone(page, `02-browse-category-food-ko-${suffix}.png`);

        await page.click('[data-action="open"][data-id="browse-0"]');
        await assertScreen(page, { screen: "detail", locale: "ko", titleIncludes: ["아라비카"] });
        await shotPhone(page, `03-detail-arabica-ko-${suffix}.png`);

        await page.click('[data-action="toggle-save"]');
        await page.click('[data-action="saved"]');
        await assertScreen(page, { screen: "saved", locale: "ko", titleIncludes: ["저장한"] });
        await shotPhone(page, `04-saved-populated-ko-${suffix}.png`);

        await page.evaluate(() => localStorage.removeItem("gw-icn-019-prototype-saved.v1"));
        await page.goto(BASE + "#/saved?lang=ko&demo=normal", { waitUntil: "networkidle" });
        await assertScreen(page, { screen: "saved", locale: "ko", titleIncludes: ["저장한"] });
        await shotPhone(page, `05-saved-empty-ko-${suffix}.png`);

        await page.selectOption("#demo-select", "saved-missing");
        await assertScreen(page, { screen: "saved", locale: "ko", titleIncludes: ["저장한"] });
        await shotPhone(page, `06-saved-stale-sim-ko-${suffix}.png`);

        await page.selectOption("#demo-select", "normal");
      }

      if (EN_ONLY) {
        await page.goto(BASE + "#/browse?lang=en&demo=normal", { waitUntil: "networkidle" });
      } else {
        await page.click('[data-action="lang"][data-lang="en"]');
        await page.goto(BASE + "#/browse?lang=en&demo=normal", { waitUntil: "networkidle" });
      }
      await assertScreen(page, {
        screen: "browse",
        locale: "en",
        titleIncludes: ["Incheon Airport"],
      });
      await assertArabicaEnBrowseCard(page);
      await shotPhone(page, `07-browse-default-en-${suffix}.png`);

      await page.selectOption("#demo-select", "ko-fallback-demo");
      await page.goto(BASE + "#/browse?lang=en&demo=ko-fallback-demo", { waitUntil: "networkidle" });
      await assertScreen(page, {
        screen: "browse",
        locale: "en",
        titleIncludes: ["Incheon Airport"],
      });
      const fallbackText = await page.locator(".mivvu-icn-ko-fallback").first().textContent();
      if (!fallbackText?.includes("Korean name")) {
        throw new Error(`Expected EN KO fallback hint, got: ${fallbackText}`);
      }
      await shotPhone(page, `08-browse-en-ko-fallback-sim-${suffix}.png`);

      await page.click('[data-action="open"][data-id="prototype-ko-fallback"]');
      await assertScreen(page, {
        screen: "detail",
        locale: "en",
        titleIncludes: ["프로토타입", "한글"],
      });
      await shotPhone(page, `09-detail-en-ko-fallback-sim-${suffix}.png`);

      await page.selectOption("#demo-select", "storage-blocked");
      await page.goto(BASE + "#/browse?lang=en&demo=storage-blocked", { waitUntil: "networkidle" });
      await page.click('[data-action="open"][data-id="browse-0"]');
      await assertScreen(page, { screen: "detail", locale: "en", titleIncludes: ["ARABICA"] });
      const detailText = await page.locator(".mivvu-icn-detail-primary, .mivvu-icn-detail-name").first().innerText();
      if (detailText.includes("아라비카") && !detailText.includes("ARABICA")) {
        throw new Error("Detail shows KO name without EN on storage-blocked scenario");
      }
      await page.click('[data-action="toggle-save"]');
      const toast = await page.locator(".mivvu-icn-toast-error, .mivvu-icn-toast").first().textContent();
      if (!toast?.toLowerCase().includes("save")) {
        throw new Error(`Expected save failure toast, got: ${toast}`);
      }
      await shotPhone(page, `10-detail-save-blocked-en-${suffix}.png`);

      await page.close();
    }

    await runViewport(390, 390, "390px");
    await runViewport(360, 360, "360px");
    await runViewport(430, 430, "430px");
  } catch (e) {
    errors.push(String(e));
    throw e;
  } finally {
    await browser.close();
    server.kill();
  }
  console.log("Screenshots OK:", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
