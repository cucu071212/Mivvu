import { test as base, expect } from "@playwright/test";

const AIRPORT_SELECTION_INIT = {
  airportIata: "SFO",
  acknowledgedAt: "2026-10-25",
};

export const test = base.extend<{ browserHealth: void }>({
  browserHealth: [async ({ page, context, baseURL }, use, testInfo) => {
    await page.addInitScript((record) => {
      window.localStorage.setItem(
        "gatewise.airport-selection.v1",
        JSON.stringify(record),
      );
    }, AIRPORT_SELECTION_INIT);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(`Runtime: ${error.stack ?? error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`Console: ${message.text()}`);
    });
    page.on("response", (response) => {
      if (response.status() >= 500) errors.push(`HTTP ${response.status()}: ${response.url()}`);
    });
    // The browser must use only the local app and its bundled dataset/assets.
    await context.route(/^https?:\/\//, async (route) => {
      if (new URL(route.request().url()).origin === baseURL) {
        await route.continue();
      } else {
        errors.push(`Unexpected external request: ${route.request().url()}`);
        await route.abort("blockedbyclient");
      }
    });
    await use();
    if (errors.length) {
      await testInfo.attach("browser-errors", {
        body: errors.join("\n\n"),
        contentType: "text/plain",
      });
    }
    expect(errors, "No console errors, uncaught exceptions, HTTP 5xx, or external requests").toEqual([]);
  }, { auto: true }],
});

export { expect };
