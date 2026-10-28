# GW-ICN-005 — bounded independent Mivvu preview QA

**Historical preview QA:** The evidence below predates canonical-route integration and remains scoped to that tested state. The human owner subsequently authorized packaging the implemented integration and SEC-01/02/03 changes for draft PR review on 2026-10-28. Current feature-branch routes are `/` (Mivvu), `/icn` (KO/EN snapshot browsing), `/flight` (SFO Flight), and the existing SFO `/explore`, `/recommendations`, `/plan`; both old preview URLs redirect. See the [final PR packaging handoff](mivvu-pr-packaging.md) for combined verification. Strix/Shannon and isolation setup are skipped by owner decision; active penetration testing was not performed. That decision is not an independent code audit or a security guarantee. Production promotion remains unauthorized.

**Plan revision:** `GW-PLAN-REV-2026-10-26`  
**Execution permission:** direct human assignment in this chat, 2026-10-27 (America/New_York); local QA and small confirmed-defect fixes only.  
**Tested state:** `feat/mivvu-first-entry-slice` at HEAD `103524337e1ca0e8edf007a0a3c32c4b76985fea`, with the existing uncommitted GW-ICN-003/004 work and the local GW-ICN-005 changes below. The initial working tree was already dirty; no reset, stash, branch switch, commit, push, merge, or deployment was performed.  
**Surfaces:** `/preview/mivvu-entry`, `/preview/mivvu-entry/icn`, and SFO handoff to `/explore`.

## Method and actual checks

- Read `AGENTS.md`, `PLAN.md`, `docs/IMPLEMENTATION_PLAN.md`, and the three requested design/data handoffs. Verified branch, HEAD, and working tree before editing.
- Built the current local code with `npm run build`, then started that build with `npm run start -- --hostname 127.0.0.1 --port 3111`. The browser probe exercised rendered text and interactions in that process, including the new hours copy and focus style; HTTP 200 alone was not used as freshness evidence.
- `node scripts/qa-mivvu-preview.mjs` → **PASS** against the production build. Chromium covered fresh KO/EN browser locales, intro auto completion (3,290 ms from visible dialog; configured 3,200 ms), tap and Enter dismissal, once-per-session return, reduced-motion bypass, explicit language persistence, search/filter/reset, SFO navigation, and KO/EN entry and browse widths 360/390/430×844. It also checked KO/EN at 390×600 with root text enlarged from 16 to 24 px, keyboard focus, chip scrolling when needed, document width, and console errors (none). With JavaScript disabled, the server rendered only the loading shell before locale resolution; no wrong-language heading appeared.
- `npm test` → **PASS**, 994 tests passed / 2 skipped after the scoped additions. `npm test -- src/components/mivvu` → **PASS**, 12 tests. The skipped tests are the existing opt-in live sync and mismatch investigation tests; no live sync was required for this QA.
- `npx playwright test e2e/airport-selection.spec.ts e2e/navigation.mobile.spec.ts` → **PASS**, 8 SFO regression tests against the production build.
- `npm run build` → **PASS** after the UI/CSS fixes (Next.js static routes include both preview pages and `/explore`). `npm run lint` → **PASS** after the new probe was converted to ES imports. `git diff --check` → **PASS**.

## Findings and fixes

| Severity | Finding, reproduction, and resolution |
| --- | --- |
| **Medium — fixed** | Search for `15 Benches (김소산)` in KO or `15 Benches (So-san Kim)` in EN: source row `2030` carries raw `00:00 ~ 00:00`, which the original card displayed as if it were an informative operating range. Both fixtures contain 158 raw rows with this value. A UI test first failed on the original display. The card now shows **운영시간 확인 필요 / Hours unavailable** for equal start/end clock ranges, while the fixture and view model retain raw text. Explicit `00:00 ~ 24:00` remains displayed verbatim. No 24-hour or live-open inference was added. |
| **Medium — fixed** | On airport selection, focus the search box and press Tab. The radio input received keyboard focus but was transparent and 1×1 px; its visible card had no outline. The browser assertion first failed with `cardOutline: none`. A scoped `:focus-within` outline on the card makes the focused choice visible. The rebuilt browser probe passed. |
| **Informational — no change** | KO and EN listing order differs. `buildIcnBrowseCatalog` collapses identical `sourceId` + content rows and retains the lowest `listingIndex`; it does **not** alphabetize or merge languages. Each fixture has sequential `listingIndex` 0–1027, but its source row order is language specific (KO begins `% 아라비카`, `15 Benches`; EN begins `% ARABICA`, `(Cleanup Air) laundry`). Fresh browser contexts showed the corresponding first row and 1,011 count. The policy is stable fixture/source order, so no sorting change was made. |

## Acceptance observations

- **Intro:** Timing constants are 400 ms enter + 2,500 ms hold + 300 ms exit = **3,200 ms**. Browser auto completion, tap, Enter, and session return passed. Unit checks confirmed both timers clear after dismissal and on unmount; reduced motion skips the intro and records the session flag.
- **Locale:** Fresh `ko-KR` showed KO and `en-US` showed EN. Explicit EN choice persisted through ICN, back to airport selection, and reload. Query and terminal selection remain in component state while switching language; no automatic translation occurs. No hydration/console errors or wrong-language pre-hydration heading were observed.
- **Browse/data:** Each 1,028-row fixture yielded **1,011** cards after 17 identical duplicate rows were collapsed. Searching `% ARABICA` returned 1; combining it with Terminal 1 returned 0; an impossible query produced the empty state; clearing query and choosing All restored 1,011. English `Bus Stops 11` remained searchable without a category line; `East Long-term Parking Tower` remained searchable without an hours line. Existing unit tests cover unambiguous Korean name/location fallback; current fixtures have no missing names or locations, so the browser could not exercise that fallback with real rows. Terminal codes remain raw in the fixture; P02’s Concourse label remains an inference from location descriptions.
- **Navigation/SFO:** Explore ICN opened ICN cards; Back returned to airport selection without replaying the intro. Explore SFO reached `/explore`. The existing SFO airport and mobile navigation Playwright tests passed, including 390 px Explore details.
- **Mobile/accessibility:** At 390×844, the first complete ICN card ended at about **414 px** in both languages with default 16 px text. At 360/390/430 px, entry and browse document width did not exceed viewport width. At 390×600 with 24 px root text, vertical scrolling reached the last card without page-level horizontal overflow; English chips overflowed within their own scroll row and the last chip could be reached. KO chips fit at that size. Browser checks reached controls by accessible names and confirmed keyboard-visible focus on the airport choice and terminal chip.
- **Credentials:** `.env.local` is gitignored; `git ls-files` found no credential-like tracked paths, and the configured service key value was absent from all 265 tracked files. The value and its variable name were absent from 40 built `.next/static` client assets and the rendered HTML responses for both preview pages and `/explore`. No credential or authenticated URL was printed.

## Remaining limits and readiness

- Fixtures are saved snapshots, not live opening status or complete airport coverage. The upstream API reports 1,175 total but returns 1,028 rows; this QA did not repeat authenticated sync or resolve the provider mismatch. EN has 164 raw rows without a large category; both languages have 84 without hours. No coordinates, queues, walking times, or full coverage claim was introduced.
- No manual assistive-technology session or non-Chromium browser run was performed. The browser probe used desktop Chromium with mobile-size viewports; it did not test physical devices or safe-area hardware. An actual missing-name/location fallback did not occur in these fixtures.
- **Verdict:** The bounded preview is ready for human review as input to a **later, separately authorized main-entry integration task**. Review/acceptance remains pending. This verdict does not authorize merging, production release, or claims that the ICN corpus is complete.

## Local GW-ICN-005 files

`src/components/mivvu/MivvuIcnFacilitiesBrowseScreen.tsx`, `src/lib/mivvu-preview-messages.ts`, `src/app/mivvu-entry.css`, focused component tests under `src/components/mivvu/`, `scripts/qa-mivvu-preview.mjs`, this report, and the GW-ICN-005 task row in `docs/IMPLEMENTATION_PLAN.md`.
