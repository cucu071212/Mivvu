import { chromium, devices } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseUrl =
  process.env.MIVVU_PREVIEW_URL ?? "http://127.0.0.1:3002/preview/mivvu-entry";
const outDir = path.resolve("docs/design/mivvu-first-entry-screenshots");

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const introContext = await browser.newContext({
  ...devices["iPhone 12"],
});
const introPage = await introContext.newPage();
await introPage.addInitScript(() => {
  sessionStorage.removeItem("mivvu.entry.introSeen.v1");
});
await introPage.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
await introPage.waitForTimeout(500);
await introPage.screenshot({
  path: path.join(outDir, "01-intro-390.png"),
  fullPage: false,
});
await introContext.close();

const airportContext = await browser.newContext({
  ...devices["iPhone 12"],
});
const airportPage = await airportContext.newPage();
await airportPage.addInitScript(() => {
  sessionStorage.setItem("mivvu.entry.introSeen.v1", "1");
  localStorage.setItem("mivvu.preview.locale.v1", "en");
});
await airportPage.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
await airportPage.getByRole("heading", { name: /Choose your airport/i }).waitFor({
  timeout: 60_000,
});
await airportPage.screenshot({
  path: path.join(outDir, "02-airport-selection-390.png"),
  fullPage: false,
});
await airportContext.close();

async function captureIcnBrowse(locale, filename) {
  const context = await browser.newContext({
    ...devices["iPhone 12"],
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.addInitScript((storedLocale) => {
    sessionStorage.setItem("mivvu.entry.introSeen.v1", "1");
    localStorage.setItem("mivvu.preview.locale.v1", storedLocale);
  }, locale);
  const browseUrl = `${baseUrl.replace(/\/$/, "")}/icn`;
  await page.goto(browseUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
  const heading =
    locale === "ko" ? /인천공항 시설/i : /Incheon Airport facilities/i;
  await page.getByRole("heading", { name: heading }).waitFor({ timeout: 60_000 });
  await page.screenshot({
    path: path.join(outDir, filename),
    fullPage: false,
  });
  await context.close();
}

await captureIcnBrowse("ko", "03-icn-browse-390-ko.png");
await captureIcnBrowse("en", "03-icn-browse-390-en.png");

await browser.close();
console.log("Saved screenshots to", outDir);
