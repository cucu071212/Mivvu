#!/usr/bin/env node
/** Capture GW-ICN-014 browse category bottom-sheet screenshots (local dev on :3014). */
import { chromium, devices } from "playwright";
import path from "node:path";

const outDir = path.join(process.cwd(), "docs/handoffs");
const baseUrl = process.env.GW_ICN_SCREENSHOT_BASE ?? "http://127.0.0.1:3014";

async function shot(page, name, width) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto(`${baseUrl}/icn`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, name), fullPage: false });
}

const browser = await chromium.launch();
const context = await browser.newContext({ ...devices["iPhone 12"] });
const page = await context.newPage();

await shot(page, "GW-ICN-014-390-default-ko.png", 390);

await page.goto(`${baseUrl}/icn`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /유형/ }).click();
await page.screenshot({ path: path.join(outDir, "GW-ICN-014-390-sheet-top-ko.png"), fullPage: false });

await page.getByRole("option", { name: "식・음료" }).click();
await page.screenshot({ path: path.join(outDir, "GW-ICN-014-390-food-selected-ko.png"), fullPage: false });

await page.getByRole("button", { name: /세부 유형/ }).click();
await page.screenshot({ path: path.join(outDir, "GW-ICN-014-390-sheet-sub-ko.png"), fullPage: false });

await browser.close();
console.log("Wrote screenshots to", outDir);
