# Browser E2E regression suite

Task: Browser E2E Reliability Infrastructure (human-authorized QA task; no existing implementation-plan ID). Base: confirmed `origin/main` at `47c07028e1eccb3515f8bd8bfddd80f1c90fccdd`. Existing Vitest suites remain unchanged; no previous browser framework or CI workflow was present.

## Local setup and execution

Use Node.js 22 and npm (the committed `package-lock.json`).

```sh
npm ci --ignore-scripts
npx playwright install chromium
npm run test:e2e
```

On Linux, install browser OS dependencies with `npx playwright install --with-deps chromium` (may need elevated OS package permissions). Dependency lifecycle scripts are disabled; the browser installation is an explicit, separate step.

`test:e2e` builds the actual production app and runs Playwright against a fresh `next start` server at **http://127.0.0.1:3100**. Keep port 3100 free. The suite refuses to reuse an existing server and cannot be redirected to Vercel via an environment variable. Browser requests to other HTTP(S) origins fail the test. The existing Next.js build downloads Google Fonts at build time, so clean builds need network access; browser workflows themselves use only bundled assets and data.

After a successful build, iterate without rebuilding unchanged source:

```sh
npm run test:e2e:run
npm run test:e2e:run -- --project=chromium e2e/countdown.spec.ts
npm run test:e2e:run -- --project=mobile-chromium
npm run test:e2e:run -- --headed
npm run test:e2e:report
```

Always rebuild after application changes. `test:e2e:run` deliberately assumes an existing, current `.next` production build. Vitest remains `npm test`; its explicit include patterns exclude `e2e/`.

If a shared Playwright browser-cache installer is locked, use a private cache instead of deleting its lock or stopping another task:

```sh
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/gatewise-e2e-browsers npx playwright install chromium
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/gatewise-e2e-browsers npm run test:e2e
```

Use the same cache variable for installation and test execution. Choose a suitable local temporary path on other operating systems. Do not commit browser binaries.

## Coverage and maintenance

Nine tests: eight desktop Chromium and one mobile Chromium at 390 × 844.

| Area | Assertions |
| --- | --- |
| Flight | Heading, boarding area, gate selector, 50-minute manual budget, 10-minute buffer, demo off, device-clock and unverified-time disclosures |
| Explore | 26 browse entries; terminal and boarding-area filters; search, empty state, clear filters; browse-only presentation and no modeled total |
| Recommendations | Independent explicit set of 12 eligible D Gates facilities; 14 other cards explicitly ineligible without timing breakdowns; unknown queue/activity and unmodeled totals; no boarding guarantee |
| Desktop navigation | Flight → Explore → Results → Flight; shared manual budget; out-of-scope terminal filter produces only explanatory ineligible cards with no modeled durations |
| What-if | Demo labels; independent demo arithmetic; scenario time and queue changes affect margin/status while baseline stays fixed; invalid scenario hides comparisons |
| Countdown | Empty and >24h validation; floor-to-zero before boarding; exact boarding start and no negative minutes; pause, resume, manual restoration |
| Mobile | Touch navigation between all three main workflows; active-route semantics; state retention; no horizontal overflow |
| Browser health | Every test fails on console errors, uncaught page errors, HTTP 5xx responses, or external HTTP(S) requests |

Expected names/counts are acceptance fixtures, not generated from the app's eligibility predicate. Intentional dataset changes should update expectations only after scope approval. The 34-minute demo total is independently calculated as 3 outbound + 3 return + 8 queue + 10 activity + 10 buffer; it is **not** a measured airport journey.

Selectors use accessible roles, labels, and visible names. Each test receives a new browser context. Countdown tests install/pause Playwright's clock before navigation, use a fixed UTC instant and timezone, and advance timer callbacks explicitly with `runFor`. No real-time sleeps, external API fixtures, application clock patches, or dataset mutations are used.

## CI and diagnostics

`.github/workflows/e2e.yml` runs on main pull requests, main pushes, this infrastructure branch, and manual dispatch. It uses Node 22, installs Chromium, runs Vitest/TypeScript/lint, then builds and runs E2E. CI uses one worker, fails on `.only`, and has **zero retries** so flaky failures remain visible. Local execution uses two workers.

On failure, inspect the terminal assertion and `test-results/` error context, screenshot, video, trace, and `browser-errors` attachment when applicable. Open the HTML report with `npm run test:e2e:report`, or a specific trace with `npx playwright show-trace <trace.zip>`. CI uploads `playwright-diagnostics` for seven days. Generated reports are ignored by Git.

No console errors are allowlisted. Investigate any new message before adding an exception. Record application defects with base SHA, exact inputs, expected/actual output, and trace; this task does not authorize production fixes.

References: [Playwright local web server](https://playwright.dev/docs/test-webserver), [controlled clock](https://playwright.dev/docs/clock), [CI setup](https://playwright.dev/docs/ci-intro).

## Deliberate limits

Chromium only; the mobile project is viewport/touch emulation, not real-device or WebKit coverage. No visual snapshot/a11y audit, live flight data, actual SFO walk-time validation, two-stop planner, or exhaustive personalization coverage. Countdown rollback/remount regressions from the separate red-team branch are outside this bounded suite; that branch is not a dependency and has not been cherry-picked. CI execution must be distinguished from local execution in the verification report.

## Results presentation clarification

The mission requested only eligible facilities for time-based recommendations. On the confirmed base, Results intentionally renders 26 cards: 12 eligible (Unknown by default; modeled with demo inputs) plus 14 explicitly ineligible explanatory cards. This is established by `src/lib/recommendation-page-integration.test.ts` and the approved `docs/GW-X-004-integration-regression-report.md` (“IT + T3 + HM1 ineligible on Results”). The suite preserves that existing behavior and proves the 14 excluded cards receive no timing breakdowns or feasible outcomes.

Reproduce the distinction: open `/recommendations` with a fresh session; see 26 cards, 14 labeled “Not eligible.” Enable demo estimates on Flight and return; only 12 cards become feasible. Selecting Harvey Milk Terminal 1 on Explore gives three explanatory ineligible cards on Results. Hiding all ineligible cards would be a separate UI change requiring lead authorization, not an infrastructure fix.
