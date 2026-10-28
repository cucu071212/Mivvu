import { chromium, devices } from "@playwright/test";

const baseUrl =
  process.env.MIVVU_PREVIEW_URL ?? "http://127.0.0.1:3025/preview/mivvu-entry";

const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({ ...devices["iPhone 12"] });
const page = await context.newPage();

await page.addInitScript(() => {
  sessionStorage.removeItem("mivvu.entry.introSeen.v1");
});

const started = Date.now();
await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.getByRole("heading", { name: /Choose your airport/i }).waitFor({
  timeout: 10_000,
});
const elapsed = Date.now() - started;

await browser.close();

const ok = elapsed >= 1700 && elapsed <= 2300;
console.log(
  JSON.stringify({ elapsedMs: elapsed, expectedMs: 1800, withinTolerance: ok }),
);
process.exit(ok ? 0 : 1);
