# GateWise — independent hackathon readiness audit

**Audit date:** 2026-10-25 (America/New_York)

**Role/scope:** independent QA of deployed single-stop user journey, recommendation contracts, UX polish branch, and submission claims. No application source changed.

**Verdict:** **CONDITIONAL GO** for the current single-stop B+C demo, after correcting submission copy and rerunning acceptance on the exact release build. **NO-GO for claiming a deployed Two-Stop Planner** at the inspected production URL.

## Build and evidence boundary

- Fetched origin/main, origin/feature/gw-ux-polish, and origin/feature/gw-e1b-two-stop-engine before review. Remote main and E1B both resolved to **82614d24cf9b8a4a10298e5e2fb56f2891d6d4ce**; UX polish resolved to **a5573ee42c2556d9b1d1fe26d0788bd5ef717d2e**. The user-supplied production-main snapshot **8d7b9f1730072f609b187fd67f162a03dc23d214** is the parent of current main, not the current main ref.
- The deployed URL was directly exercised on 2026-10-25. Browser observation alone cannot attest the deployed commit SHA. Current production showed the pre-E2 My Plan placeholder. All automated commands below ran in an isolated worktree at 82614d2, not against Vercel.
- UX polish was reviewed read-only from the remote Git ref, code, tests, and checked-in 1280px/390px screenshots. It was not merged, modified, or exercised as a live branch. GW-E2 was neither reviewed as a finished feature nor changed; the Lead's active worktree was preserved.
- Severity: **P0** blocks the core demo or makes a materially unsafe claim; **P1** requires correction before the relevant release/submission; **P2** meaningful UX/accessibility friction; **P3** editorial polish. Findings explicitly distinguish production, branch-only, and documentation.

## Severity-ranked findings

### P0 — none confirmed in the inspected production B+C flow

No core calculation failure was reproduced. This is bounded evidence, not certification of the pending GW-E2 build or real-world travel safety.

### P1-01 — submission materials describe an obsolete product snapshot (documentation, submission blocker)

**Reproduce:** Open README.md lines 24, 34, 44-46; docs/demo-script.md lines 3, 11-14, 32-36; docs/devpost-submission.md lines 3, 23-27, 69-90. Compare with production Explore, Results, and My Plan.

**Expected:** Judge-facing copy describes the verified release: SFO-wide **26-facility browse directory**, **12 D Gates facilities eligible for time-based recommendations**, an opt-in 8/10-minute demo mode, deployed URL, and a placeholder My Plan until E2 is actually accepted and deployed.

**Actual:** README still calls Flight a future placeholder, says there are no utility tests, and says Vercel deployment is merely planned. Demo script still describes a design preview and says engine/What-if integration is absent in its opening and fallback. Devpost draft is explicitly tied to babaf96, says the product covers only one terminal/twelve records, says the URL and tests were unverified, and says Vercel was not yet deployed. These are stale historical notes, not evidence that today's feature is missing. PLAN.md lines 3, 216, 239 and docs/IMPLEMENTATION_PLAN.md also retain historical HOLD/not-started language despite E1B on main.

**Impact:** Copy pasted into a submission can underclaim shipped capability or wrongly present unverified work as current. The GW-E status mismatch can confuse release decisions.

**Minimal fix:** Lead/editor creates one release-specific claims sheet from the final deployed SHA, updates README/demo/Devpost present-tense claims, preserves clearly labeled historical plan sections, and checks every submission field before publication. Do not advertise E2 until its UI is accepted and observed at the final URL.

**Evidence:** production /explore (26 browse, 12 recommend), /recommendations (demo comparison), /plan (GW-E not in release); named files above.

### P1-02 — UX polish timeline hides a missing directed walking leg (branch-only)

**Reproduce:** On origin/feature/gw-ux-polish at a5573ee, call buildTimeBudgetTimeline with an unknown recommendation whose outboundMinutes is 5 and returnMinutes is null. Repeat with the legs reversed. The existing test covers both legs known and queue/activity null, but not one missing leg.

**Expected:** The timeline may show the known leg but must explicitly list the missing return or outbound walking time, with total and margin unknown.

**Actual:** walkingSegments in src/lib/time-budget-timeline.ts returns immediately for either known leg without appending the opposite missing label (roughly lines 34-45). missingLabels therefore reports an incomplete margin but omits the actual missing directed leg. The base recommendation engine does preserve missing_travel_return/missing_travel_outbound; this is presentation-only loss of the reason.

**Impact:** If polish is integrated, a traveler may see partial walking minutes without the missing leg called out. Strict Unknown propagation in the result remains intact, but the new timeline's explanation is incomplete.

**Minimal fix:** On the Lead-owned UX branch, add an independent one-leg-missing test first, verify it fails, then append the missing directed-leg label in each one-known branch; verify both cases and rendering. Do not change recommend.ts semantics.

**Evidence:** branch files src/lib/time-budget-timeline.ts, src/lib/time-budget-timeline.test.ts; base src/lib/recommend.regression.test.ts missing-return case.

### P2-01 — empty-state message falsely implies a failed search on first Results visit (production and polish)

**Reproduce:** Fresh SFO session → Flight → Results, without searching or setting overrides.

**Expected:** An untouched optional estimate editor either stays collapsed or gives a neutral prompt to search/browse; “no matches” appears only after a query/filter actually returns none.

**Actual:** “No overrides set” is followed by “No places match. Try another search or browse all places.” The search is blank and 26 facilities exist. On 390px polish screenshot, this editor dominates the initial Results viewport and the actual recommendations are below the fold.

**Impact:** The first Results screen reads like a failed search and slows the judge path.

**Minimal fix:** Condition the no-match text on an active search/filter; otherwise show a neutral discover/edit prompt. Consider collapsing the optional editor by default or moving the ranked outcome above it on mobile.

**Evidence:** direct production Results observation; src/components/PersonalizedTimeControls.tsx lines 342-385; branch screenshot docs/qa/gw-ux-polish/recommendations-mobile-390.png.

### P2-02 — What-if repeats 14 ineligible comparisons after the 12 modeled entries (production and polish)

**Reproduce:** SFO → Flight → enable demo estimates → Results → scroll through What-if to its end.

**Expected:** The comparison keeps the 12 eligible places prominent; excluded directory entries are summarized or discoverable separately with their ineligibility reason.

**Actual:** 26 comparison rows render, including 14 repeated ineligible/unchanged rows. The polish screenshot of the end of What-if shows three such rows in one desktop view; the underlying Results list already explains ineligibility.

**Impact:** The valuable +16 → +1 → −6 demo is buried in a long repeat of “not eligible / unchanged,” increasing scroll and screen-reader work. Eligibility itself is correct.

**Minimal fix:** Show eligible comparison rows by default and a counted disclosure for excluded rows, while retaining their explanation. Keep the same engine inputs and outcomes.

**Evidence:** direct production What-if accessibility tree; src/components/WhatIfSimulator.tsx comparison map; branch screenshot docs/qa/gw-ux-polish/what-if-desktop-1280.png.

### P2-03 — UX polish may create competing status announcements (branch-only accessibility risk)

**Reproduce:** On UX polish, enable demo, change scenario from 50 to 35 minutes (all 12 eligible facilities change feasible → tight). Inspect rendered What-if markup.

**Expected:** One contextual announcement of the scenario/result change, with individual cards still readable by navigation.

**Actual:** Each changed card renders its own new role="status" badge in src/components/WhatIfSimulator.tsx around lines 329-343, so this transition can insert 12 live status nodes together. Actual VoiceOver/NVDA speech was not measured; treat this as a code-level risk, not a confirmed speech defect.

**Impact:** Potential announcement flood and poor focus context after one field edit.

**Minimal fix:** Keep card badges as ordinary text and add one atomic, contextual summary live region for the comparison update. Verify with a screen reader on the integrated build.

**Evidence:** branch WhatIfSimulator.tsx; UI-UX Pro Max “Contextual Live Badge Updates” guidance.

### P3-01 — My Plan points to a “D Gates directory” despite SFO-wide browse (production copy)

**Reproduce:** Open production /plan and read “What you can do now.”

**Expected:** Explore link describes the SFO-wide browse directory while distinguishing the D Gates recommendation scope.

**Actual:** It says “Browse the D Gates directory on Explore.”

**Minimal fix:** Update that sentence when the Lead next edits the page.

**Evidence:** production /plan; src/components/screens/PlanScreen.tsx around line 39.

## Journey and recommendation checks

| Check | Result and evidence |
| --- | --- |
| First visit / airport search / SFO selection | Production welcome showed SFO Available and JFK/LAX/ORD Coming soon. Search narrowed to JFK and SFO; Continue opened Flight. Existing E2E also checks empty search, unavailable airport, deep link, change airport, and mobile welcome. |
| Flight input → Explore → facility details/photos | Production preserved the 50-minute context across navigation. Explore showed 26 browse records, 12 recommend eligible, and explicit cross-terminal limits. Burger Joint detail opened as a focus-contained panel; Escape returned focus to its View details control. Image and caption said illustrative and not this SFO location. Books Inc. card identified a related SFO Terminal 2 venue photograph, not an exact listing photo. |
| Recommendations with missing queue/activity | Demo off: eligible cards showed Unknown, separate queue/activity “Not modeled,” and no total/margin. Fourteen browse-only records appeared as ineligible, not feasible recommendations. Demo on: 3 outbound + 3 return + 8 queue + 10 activity + 10 buffer = 34 required; 50 leaves +16. |
| What-if / return to Flight | Production 35-minute scenario changed +16 feasible to +1 tight. Adding +7 queue changed scenario margin to −6 over budget while baseline stayed +16. Returning to Flight preserved demo mode; entering manual 0 then Results yielded −34 for the 34-minute modeled visit. |
| Countdown zero / past start / changing time | Countdown E2E checks sub-minute floor, start alert exactly at the timestamp, zero after start, pause/resume/clear. Unit tests cover timestamp semantics and clock rollback. Manual production zero was checked; a live running countdown was not independently timed on Vercel during this audit. |
| Boundaries / safety buffer / Unknown / eligibility | Existing independently literal expected-value tests cover margin 10, 9, 0, −1; one buffer; signed queue adjustment; missing queue/activity/travel; directed legs; and browse-only nonpromotion. Current automated suite passed. No change to recommend.ts. |
| Data and claims | Production repeatedly labels D→D=3 as unverified demo travel, published hours as non-live, queue/activity as demo/user/unknown, and device countdown as local-clock only. No live flight/queue, measured route, or current open/closed claim was observed. SFO is the only selectable airport. |
| Desktop, 390px, keyboard, focus, contrast, text scale | Desktop and 390px workflows passed the existing browser suite, including no horizontal scroll and visible mobile nav. Existing detail modal E2E verifies Escape/focus return. Direct browser review observed labeled controls and focusable links. Contrast was not measured across every token/state; 200% text reflow and actual screen-reader announcement behavior remain release checks. Branch screenshots are visual evidence only, not live interaction proof. |

## Submission claim corrections

Use these statements only after the Lead checks the exact final deployment:

1. **Coverage:** “GateWise browses 26 sourced SFO facilities across terminals; time-based recommendations currently cover 12 eligible Terminal 2 D Gates facilities.” Do not say multiple airports are supported.
2. **Timing:** “The D Gates movement value is an unverified three-minute demo estimate per directed leg. Queue and activity durations are unknown by default; opt-in demo values are 8 and 10 minutes or users can enter personal estimates.” Do not say measured walks, indoor routing, live queues, or flight tracking.
3. **Hours/photos:** “Published SFO hours are informational and may change. Most displayed food/coffee photos are illustrative, not photographs of the listed SFO location; Books Inc. has a related Terminal 2 venue photo with a subject caveat.” Do not describe all images as actual facility photographs or hours as live availability.
4. **Two-stop:** “The deployed My Plan page is a placeholder. A pure E1B engine is on current main; E2 UI is pending Lead acceptance/deployment.” Do not claim a usable two-stop planner from a local branch or code-only engine.
5. **Evidence:** Replace babaf96 and obsolete release notes with final deployed SHA, live URL, recorded demo link if it exists, and actual suite results. Do not infer Vercel SHA from a browser page alone.

## Verification performed

| Command / action | Exact result |
| --- | --- |
| git fetch origin main feature/gw-ux-polish feature/gw-e1b-two-stop-engine; git ls-remote origin refs/heads/main refs/heads/feature/gw-ux-polish refs/heads/feature/gw-e1b-two-stop-engine | PASS; refs as recorded above. |
| npm ci --ignore-scripts --offline | PASS; 445 packages added, 0 vulnerabilities reported. |
| npm test | PASS; 51 files, 841 tests. Vite emitted a non-failing future native config loader warning. |
| npx tsc --noEmit | PASS; exit 0. |
| npm run lint | PASS; exit 0. |
| npm run build | PASS; Next.js compiled and prerendered /, /explore, /plan, /recommendations. |
| npm run test:e2e:run, initial | NOT RUN to test execution; 16/16 launched cases failed before browser start because Playwright Chromium headless shell v1248 was absent. Root cause was the missing runtime, not an application assertion. |
| npx playwright install chromium; npm run test:e2e:run, rerun | Installation PASS; rerun PASS, 16/16 browser tests including 390px mobile. |
| Direct production UI review at https://gate-wise-iota.vercel.app | PASS for the bounded journey and arithmetic observations above. It does not verify the deployed SHA or pending E2. |
| UX polish branch read-only code/screenshot review | Completed; branch-only findings above. No branch test run or live preview claim. |

## Skills applied

- **ui-ux-pro-max:** Read the installed Cursor skill and queried keyboard/focus navigation, empty search state, and contextual status announcements; applied its accessibility and feedback checks to production and polish. No design-system generation or UI edits.
- **test-driven-development:** Read and applied its “failing test before production code” boundary. This was an audit; no production feature/fix or QA test was written, so no red-green implementation cycle is claimed. P1-02 includes a test-first fix recommendation.
- **systematic-debugging:** Investigated the browser-suite failure to its missing Chromium binary, installed the matching runtime, and reran successfully. Traced the branch timeline symptom through the one-known-leg branches and compared it with the working engine Unknown reason.
- **verification-before-completion:** Ran and inspected fresh unit, typecheck, lint, build, and browser suite outputs before reporting PASS; checked Git state before commit/push.

## Release decision and ordered actions

**CONDITIONAL GO** for the currently deployed single-stop demo: the observed production calculations and refreshed-main suites passed. The conditions are (1) correct submission materials and verify the exact final deployed SHA, (2) test the final GW-E2 integration and any UX polish after Lead merge/deploy, and (3) run the remaining contrast, enlarged-text, and screen-reader checks on that final build. The current production URL is **NO-GO for a Two-Stop Planner availability claim**.

Order: **P1-01 submission copy**, **P1-02 timeline before polish integration**, **P2-01 first Results empty state/mobile hierarchy**, **P2-02 What-if length**, **P2-03 live-region behavior**, **P3-01 My Plan wording**. GW-E2 requires its own separate acceptance and deployment evidence. This report does not authorize or perform any product fix, merge, or deployment.
