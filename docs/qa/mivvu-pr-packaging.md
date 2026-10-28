# Mivvu integration and security — PR packaging handoff

**Task:** GW-ICN-005, supplemental packaging of the implemented GW-ICN-003/004 integration and SEC-01/02/03 changes.

**Plan revision:** `GW-PLAN-REV-2026-10-26`.

**Authorization:** Human owner directly assigned this task in Codex chat, 2026-10-28 (America/New_York): local review, focused packaging corrections, explicit-file commits, normal push to the existing feature branch, and draft PR against `main`. Human owner remains the integration reviewer; acceptance is pending. Force-push, merge, production deployment, infrastructure changes, active scanning, new features, and dependency upgrades are unauthorized.

## Reviewed state and resulting experience

- Fresh branch/HEAD check: `feat/mivvu-first-entry-slice` at `518534a89acd24917e5b9a55aef87e746ce51a92`, with inherited integration/security changes uncommitted and no files initially staged. No commits above that checkpoint existed at task start.
- `git fetch origin` and a fresh `git ls-remote --heads origin main feat/mivvu-first-entry-slice` confirmed `main` at `c8b278fb7da37249ee261bdc20a36156fb39f799` and no published feature branch under that name. The complete PR includes the earlier documentation reset, design artifacts, adapter, saved fixtures, and preview QA, plus the integration/security changes above `518534a`.
- `/` opens the 3.2-second, once-per-session Mivvu intro and airport selection. Reduced motion bypasses the intro. ICN opens `/icn` without flight setup; SFO opens `/explore`. KO/EN applies to Mivvu entry and ICN browsing; SFO remains in English.
- SFO Flight moved from `/` to `/flight`; `/explore`, `/recommendations`, `/plan`, recommendation/What-if semantics, and two-stop demo remain available. Unacknowledged SFO deep links return to airport selection. Legacy `/preview/mivvu-entry` and `/preview/mivvu-entry/icn` redirect to `/` and `/icn` through Next navigation. Static prerendered redirect responses may be HTTP 200 with a client/meta redirect rather than an HTTP 3xx; browser navigation verifies the destination.
- Security: SEC-01 returns controlled client errors without upstream body/URL/message/cause propagation; SEC-03 uses the real Next `server-only` compiler marker; SEC-02 adds `script-src-attr 'none'`. The Vitest empty-marker resolution is exclusively in `test.alias`; Next/application resolution and global Node conditions are not bypassed. Prior SEC-03 negative/positive real-build evidence and SEC-02 before/after browser evidence were reviewed; unchanged probes were not rebuilt or rerun unnecessarily.
- This packaging pass changes documentation/status only, including the requested trailing spaces in the entry handoff; inherited application fixes are preserved. Product requirements and historical SFO submission evidence are unchanged. This is task/evidence reconciliation, not a product-plan revision; `writing-plans` was not needed. `verification-before-completion` and `systematic-debugging` were used. No subagents were used.

## Final combined verification — 2026-10-28

The final production build and browser suites used a fresh temporary source copy with existing installed dependencies. No installation, `.env*`, credential, or previous `.next` was copied. All **257** application/public/script/E2E/config/package input files compared byte-for-byte with the working tree after verification. Tests use saved snapshots or mocks; opt-in live sync and investigation were disabled. No real airport API request or fixture refresh was needed or performed.

| Actual command/check | Result |
| --- | --- |
| `env -i PATH="$PATH" ICN_SYNC=0 ICN_INVESTIGATE=0 ICN_LANG_COVERAGE=0 NEXT_TELEMETRY_DISABLED=1 npm test` | PASS: **1,017 tests**, 79 files; **2 opt-in live tests skipped** |
| `env -i PATH="$PATH" NEXT_TELEMETRY_DISABLED=1 npm run lint` | PASS, exit 0 |
| `env -i PATH="$PATH" NEXT_TELEMETRY_DISABLED=1 npm run build` in the source copy | PASS, exit 0, including TypeScript and all canonical/SFO/legacy preview routes |
| `env -i PATH="$PATH" NEXT_TELEMETRY_DISABLED=1 node_modules/.bin/playwright test` in the built copy | PASS: **24 browser tests**, including routing, countdown, What-if, details, two-stop demo, and mobile navigation |
| `env -i PATH="$PATH" MIVVU_QA_ORIGIN=http://127.0.0.1:3131 node scripts/qa-mivvu-preview.mjs` | PASS: **22 checkpoints**, KO/EN, intro dismissal/timing/session, persistence, search/terminal/empty states, redirects, SFO handoff, 360/390/430 widths, enlarged text, keyboard focus; zero browser errors |
| Ordinary loopback GETs for six canonical routes and both preview routes | PASS: expected enforced CSP, retained script/style inline allowances, no production `unsafe-eval`; browser suites verify redirect navigation |
| `git diff --check` for changes above the checkpoint | PASS after fixing the entry handoff's three hard-break lines |
| `git diff --check origin/main` for the complete intended PR | FAIL: **216 inherited documentation whitespace findings**; checkpoint comparison already had **218**. Of the remaining findings, 189 are in the preserved SFO archive. No source-code whitespace finding; historical artifacts were not rewritten to conceal this baseline failure. |
| Local known-value/pattern credential checks | No credential exposure established; scope and limitations below |

The full-PR whitespace result is reported separately from the passing packaging diff. It does not indicate an application test/build failure. Initial restricted Git fetch/remote requests were denied by filesystem/network restrictions, then completed with approved access. The first helper credential-pattern pass misclassified three Google Fonts URLs and flagged the deliberate test credentials; parsing confirmed no URL userinfo in the font links and synthetic values in the test. The corrected check passed without printing values or authenticated URLs.

## Data and security limitations

- Each KO/EN fixture contains **1,028 raw rows**, collapsing 17 identical duplicates to **1,011 displayed listings**. The upstream `totalCount` is **1,175**, so `syncIntegrity` remains `api_total_mismatch`; complete coverage is not claimed. EN has 164 raw rows without a large category; each language has 84 without hours. Equal clock ranges display hours-unavailable copy, not a 24-hour inference.
- These are saved snapshots, not live opening status, queues, walking times, occupancy, coordinates, maps, or guaranteed facility coverage. P02's Concourse label is inferred from fixture location descriptions. Search follows the displayed language and is not automatically translated. No SFO synthetic travel assumptions are applied to ICN.
- Production CSP still allows inline script blocks and inline styles; development alone retains its prior `unsafe-eval`. SEC-02 is partially mitigated. Standalone probe/direct-parser diagnostics and further sync hardening are outside SEC-01. See the [security report](../security/mivvu-preflight-review.md) for the historical registry checks and remaining bundled-code/provenance limits; no dependency upgrade or new audit was performed here.
- **Owner decision:** Skip Strix/Shannon and isolation setup for this release. **Active penetration testing was not performed.** Proceeding to PR review is not an independent code audit or a guarantee that the application is secure.
- Browser evidence covers Chromium with desktop/mobile-size viewports. Physical devices, safe-area hardware, non-Chromium engines, and manual assistive-technology sessions remain untested.

## Credential hygiene and preserved local work

`.env.local` exists locally, matches `.gitignore`'s `.env.*` rule, and is untracked. Known local environment values and URL-encoded/decoded variants were checked in memory only. Pattern checks cover private keys, AWS/GitHub/provider token shapes, credential URLs/query strings, and literal credential assignments. The final index is checked before committing; Git history includes reachable refs and reflogs, not just the PR commits. Built client assets also omit the credential variable name. No value, authenticated URL, environment file, raw secret-bearing log, temporary probe, or generated build/test cache is staged.

This bounded local check is not a full entropy scanner or a guarantee against unknown/historical credentials, unreachable objects, LFS/archives, host credential stores, or deployed artifacts. Deliberate synthetic test URLs remain in tests. `.DS_Store` and `docs/.DS_Store` are unrelated and intentionally left uncommitted; ignored environment files, local `.next`, caches, and local verification outputs are preserved/excluded.

## Automation and publication boundary

The inspected `.github/workflows/e2e.yml` runs tests on PRs targeting `main`; its push filter is `main` or `codex/browser-e2e-reliability`. It has read-only repository permissions and no deploy/promotion command. No in-tree `vercel.json`, Vercel deploy hook, or feature-branch production trigger was found; the ignored local Vercel link does not specify a production branch. Remote Vercel project settings were not independently verified, so this review does not certify external automation configuration. Existing documentation identifies `main` promotion as the consequential production path. The authorized feature-branch push may create an ordinary Vercel preview; a preview is claimed only if its URL/status is actually observed.

This PR does not itself authorize production promotion. No merge or manual deployment is permitted or performed. Publication details are recorded after the normal push/draft PR operation and in the final GATEWISE STATUS.
