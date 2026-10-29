/**
 * GW-ICN-019 — two-row header alignment verification + focused header PNGs.
 * Run from worktree root (linked node_modules):
 *   GW_ICN_019_PORT=8768 node docs/design/gw-icn-019/capture-header-screenshots.mjs
 */
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "screenshots");
const PORT = process.env.GW_ICN_019_PORT || "8768";
const BASE = `http://127.0.0.1:${PORT}/`;

function startServer() {
  return spawn("python3", ["-m", "http.server", PORT], {
    cwd: __dirname,
    stdio: "ignore",
  });
}

async function setHarnessWidth(page, width) {
  await page.selectOption("#viewport-select", String(width));
  await page.waitForTimeout(80);
}

async function measureContentRailBox(page) {
  const box = await page.evaluate(() => {
    const root = document.getElementById("scroll-root");
    if (!root) return null;
    const rect = root.getBoundingClientRect();
    const cs = getComputedStyle(root);
    const padL = parseFloat(cs.paddingLeft) || 0;
    const padR = parseFloat(cs.paddingRight) || 0;
    const left = rect.left + padL;
    const width = rect.width - padL - padR;
    if (width <= 0) return null;
    return { x: left, y: rect.top, width, height: rect.height };
  });
  return box;
}

async function assertHeaderAlignment(page, context) {
  const wordmark = page.locator(".mivvu-icn-header-row1 .mivvu-wordmark-header-compact");
  const lang = page.locator(".mivvu-icn-header-row2 .mivvu-lang-toggle");
  await wordmark.waitFor({ state: "visible" });
  await lang.waitFor({ state: "visible" });
  const railBox = await measureContentRailBox(page);
  const wBox = await wordmark.boundingBox();
  const lBox = await lang.boundingBox();
  if (!railBox) throw new Error(`Missing content rail box (${context})`);
  if (!wBox) throw new Error(`Missing wordmark box (${context})`);
  if (!lBox) throw new Error(`Missing language toggle box (${context})`);
  const railRight = railBox.x + railBox.width;
  const wmRight = wBox.x + wBox.width;
  const langRight = lBox.x + lBox.width;
  if (wmRight > railRight + 1) {
    throw new Error(`Wordmark past content rail outer edge (${context})`);
  }
  if (wmRight >= langRight - 0.5) {
    throw new Error(`Wordmark should inset from lang control outer edge (${context})`);
  }
  if (langRight > railRight + 1) {
    throw new Error(`Language control past content margin (${context})`);
  }
  const back = page.locator(".mivvu-icn-back");
  const backBox = await back.boundingBox();
  if (backBox && wBox && backBox.x + backBox.width > wBox.x - 4) {
    throw new Error(`Back label collides with wordmark (${context})`);
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

async function shotHeader(page, filename) {
  await page.waitForTimeout(150);
  const header = page.locator("#phone .mivvu-icn-header");
  await header.waitFor({ state: "visible" });
  const box = await header.boundingBox();
  if (!box) throw new Error("Header bounding box missing for screenshot");
  await page.screenshot({
    path: path.join(OUT, filename),
    clip: { x: box.x, y: box.y, width: box.width, height: box.height },
    animations: "disabled",
  });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const server = startServer();
  await new Promise((r) => setTimeout(r, 400));
  const browser = await chromium.launch();
  const widths = [
    { browser: 360, harness: 360, suffix: "360px" },
    { browser: 390, harness: 390, suffix: "390px" },
    { browser: 430, harness: 430, suffix: "430px" },
  ];
  const alignmentLog = [];

  try {
    for (const { browser: bw, harness, suffix } of widths) {
      const page = await browser.newPage({ viewport: { width: bw, height: 820 } });
      await page.goto(BASE, { waitUntil: "networkidle" });
      await page.waitForSelector("#app:not([hidden])");
      await setHarnessWidth(page, harness);

      const scenarios = [
        { screen: "browse", lang: "ko", hash: "#/browse?lang=ko&demo=normal", title: ["인천공항"], shot: suffix === "390px" ? `11-header-browse-ko-${suffix}.png` : null },
        { screen: "browse", lang: "en", hash: "#/browse?lang=en&demo=normal", title: ["Incheon Airport"], shot: suffix === "390px" ? `12-header-browse-en-${suffix}.png` : null },
        { screen: "detail", lang: "ko", hash: "#/browse?lang=ko&demo=normal", title: ["아라비카"], openId: "browse-0", shot: suffix === "390px" ? `13-header-detail-ko-${suffix}.png` : null },
        { screen: "detail", lang: "en", hash: "#/browse?lang=en&demo=normal", title: ["ARABICA"], openId: "browse-0", shot: suffix === "390px" ? `14-header-detail-en-${suffix}.png` : null },
        { screen: "saved", lang: "ko", hash: "#/saved?lang=ko&demo=normal", title: ["저장한"], shot: suffix === "390px" ? `15-header-saved-ko-${suffix}.png` : null },
        { screen: "saved", lang: "en", hash: "#/saved?lang=en&demo=normal", title: ["Saved facilities"], shot: suffix === "390px" ? `16-header-saved-en-${suffix}.png` : null },
      ];

      for (const sc of scenarios) {
        await page.goto(BASE + sc.hash, { waitUntil: "networkidle" });
        if (sc.openId) {
          await page.click(`[data-action="open"][data-id="${sc.openId}"]`);
        }
        await assertScreen(page, { screen: sc.screen, locale: sc.lang, titleIncludes: sc.title });
        const ctx = `${suffix} ${sc.screen} ${sc.lang}`;
        await assertHeaderAlignment(page, ctx);
        alignmentLog.push(`PASS ${ctx}`);
        if (sc.shot) await shotHeader(page, sc.shot);
      }
      await page.close();
    }
  } finally {
    await browser.close();
    server.kill();
  }

  console.log("Header alignment checks:");
  for (const line of alignmentLog) console.log(" ", line);
  console.log("Header screenshots (390px): 11–16 in", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
