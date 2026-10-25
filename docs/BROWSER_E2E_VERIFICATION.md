# Browser E2E verification — 2026-10-25

Task: Browser E2E Reliability Infrastructure. Role: Teammate Codex / QA automation. Branch: `codex/browser-e2e-reliability`.

## Isolation and scope

Fetched `origin/main` before creating the worktree. Exact starting SHA: **`47c07028e1eccb3515f8bd8bfddd80f1c90fccdd`**. Worktree: `/Users/wonjonghun/.codex/worktrees/browser-e2e/GateWise`.

Changes are limited to npm E2E scripts/dev dependency/lockfile, Playwright configuration, four files under `e2e/`, generated-output ignores in Git/ESLint, a GitHub Actions workflow, and these two E2E documents. Application source, airport data, recommendation/countdown logic, AGENTS.md, existing tests, approved contracts, and Phase B/GW-E research remain unchanged. No red-team commits were cherry-picked; no existing worktrees were modified. No merge or deployment was performed.

## Executed verification

Local environment: macOS arm64, Node **v24.17.0**, npm **11.13.0**, Playwright **1.64.1**, Chromium **156.0.8078.4** (revision 1248).

| Actual command | Final result |
| --- | --- |
| `npm install --save-dev --save-exact @playwright/test --ignore-scripts --no-audit --no-fund` | PASS; exact dependency and lockfile, lifecycle scripts disabled |
| `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/gatewise-e2e-browsers npx playwright install chromium` | PASS; Chromium, headless shell and FFmpeg installed |
| `npm test` | PASS: **631 tests**, **37 files** |
| `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/gatewise-e2e-browsers npm run test:e2e` | PASS: production `npm run build` then **9/9 E2E**, **0 retries**, **0 skips**, 4.0s browser-suite duration |
| `npx tsc --noEmit` | PASS after final test changes |
| `npm run lint` | PASS after ignoring generated diagnostics |
| `git diff --check` | PASS |
| `git diff --name-only -- src AGENTS.md PLAN.md docs/IMPLEMENTATION_PLAN.md docs/GW-F-CONTRACT.md` | No changes |

The production build prerendered `/`, `/explore`, `/recommendations`, `/plan`, and the not-found route. Tests cover eight desktop Chromium cases and one 390 × 844 mobile Chromium case. Setup, coverage, and commands are in [BROWSER_E2E.md](./BROWSER_E2E.md).

A temporary negative probe injected `console.error` and an uncaught browser exception. `npm run test:e2e:run -- e2e/health-probe.spec.ts` exited **1 as expected**, with both messages in the health-guard assertion and `browser-errors` attachment, plus screenshot/video/trace. The probe was removed before the final 9/9 run and is not part of the committed suite.

## Failures encountered and resolved

- The first E2E invocation built successfully but **all nine browser launches failed** because matching binaries were unavailable. The shared browser cache had other long-running installers. Only this task's waiting installer was stopped; a separate cache resolved installation. These launch failures are not counted as passing tests.
- The first real browser run had **5 passes / 4 failures**. Two failures involved a label-text selector for the terminal dropdown; switching to its observed accessible `combobox` role resolved them. Other assertions assumed 12 total Results cards; approved main actually renders 12 eligible plus 14 explanatory ineligible cards. Existing tests and signed G-X3 evidence confirm this behavior. The corrected suite tests the eligible set independently and proves excluded cards have no time breakdown/feasible outcomes. All five affected workflow tests then passed, followed by the final complete 9/9 run.
- Post-E2E lint scanned third-party JavaScript inside the generated trace viewer and failed. Explicitly excluding only Playwright output folders fixed this; final lint exits 0 without findings. No source rules were disabled.
- Non-fatal existing Vite config-loader and runner `NO_COLOR`/`FORCE_COLOR` warnings appeared. They are tooling output, not browser console errors; the final browser-health checks passed without exceptions or allowlists.

## Integration notes and remaining limits

**Results interpretation:** The task's phrase “only eligible facilities” cannot mean “only 12 cards visible” on this approved baseline. Reproduction: open `/recommendations`; 26 cards appear, with 14 labeled “Not eligible.” With demo enabled, exactly 12 become feasible. A terminal-1 filter produces three explanatory ineligible cards. This matches the existing signed G-X3 behavior, so no application defect is claimed or patched. Hiding those cards would need a separate UI task. See the setup document for details and evidence paths.

No application defect was found in the exercised workflows. This is bounded evidence, not an exhaustive audit. In particular, red-team clock rollback/remount cases and Phase B/GW-E changes were not investigated or integrated.

The suite uses only a local production server; it does not call Vercel or airport APIs. A fresh Next.js build still needs access to its existing Google Fonts downloads. Browser binaries and reports remain untracked.

CI is configured for Ubuntu/Node 22 but **hosted CI has not been verified in this local report**. Local results used Node 24 as stated above. The workflow runs on this branch push, main pushes/PRs, and manual dispatch; inspect its run before making it a required merge check. Chromium mobile emulation is not a Safari/real-device test. Firefox/WebKit, visual regression, full accessibility, and exhaustive personalization are outside scope.

Recommended next task (proposal only): Lead review of this infrastructure branch and its CI run. Human decision: accept the preserved 12-eligible/14-ineligible Results presentation or separately authorize a UI change. No implementation dependency on the red-team or architecture-document branches.
