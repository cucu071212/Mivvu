# GW-ICN-018 checkpoint — ICN Core Discovery Journey verification

**Plan revision:** `GW-PLAN-REV-2026-10-29`  
**Repository:** `cucu071212/Mivvu` (local clone `GateWise`)  
**Verified base:** `4404473bdb1af8758cd3ab3e38b74c8bebaa6863` (`feat/gw-icn-015-situation`, stacked PR **#16** base)  
**Worktree:** `.worktrees/gw-icn-018-verification` (detached @ SHA above)  
**Execution permission:** authorized (human owner **2026-11-05**); test-hygiene rerun + **publication (commit/push, stacked PR)** authorized **2026-11-05** — **no merge/deploy**

## Human acceptance (2026-11-05)

Human owner accepted **ICN Core Discovery Journey: conditional pass** for milestone GW-ICN-018. Full Vitest remains **FAILED (not green)** with sole inherited `icn-shipped-output` failure. Milestone does **not** include ICN travel-time recommendations or saved-item-based recommendations.

## Review vs author verification

- **Antigravity** (`/private/tmp/GW-ICN-018-antigravity-review/REVIEW.md`) independently confirmed traveler-flow soundness and diagnosed original Playwright/Vitest failures.
- **Test-only corrections and 15/15 ICN mobile Playwright rerun** after hygiene were **Cursor author verification**, not a new independent review.
- **SFO 10/10** Playwright evidence **reused** from the initial GW-ICN-018 campaign (product unchanged @ `4404473`).

## Milestone verdict (owner-approved gate)

| Verdict | Result |
| --- | --- |
| **ICN Core Discovery Journey** | **Conditional pass** — required hydrated browser flows verified (Antigravity independent audit + Playwright **15/15** mobile after hygiene); product code unchanged @ `4404473` |
| **Full test suite (`npm test`)** | **FAILED (not green)** — **1294 pass / 1 fail / 6 skip**; sole failure = inherited `icn-shipped-output.test.ts` hash mismatch |

**Gate rule applied:** “Conditional pass” only because all required browser flows pass and the **only** remaining full-suite failure is the independently confirmed inherited hash mismatch. The suite is still labeled **FAILED**, not green.

**Out of milestone:** boarding-time suitability, gate walks, saved-item-based recommendations (future feature only).

## Skills (actually available and used)

| Skill | Used |
| --- | --- |
| `systematic-debugging` (`~/.cursor/skills/systematic-debugging/SKILL.md`) | **Yes** — traced Playwright/Vitest failures against Antigravity `REVIEW.md` before edits |
| `test-driven-development` (`~/.cursor/skills/test-driven-development/SKILL.md`) | **Yes** — reproduced failing assertions, minimal test-only fixes, reran affected specs first |
| `verification-before-completion` (`~/.cursor/skills/verification-before-completion/SKILL.md`) | **Yes** — full vitest + ICN Playwright campaign before final verdict |
| `graphify`, UI design skills | **No** (not needed) |

## Independent review

- **Report:** `/private/tmp/GW-ICN-018-antigravity-review/REVIEW.md`
- **Hydrated browser evidence:** `browser-audit.json`, `saved-origin-and-category-probe.json` (same directory)
- **Initial Cursor campaign logs (preserved):** `/private/tmp/gw-icn-018-verification/`

## Test-hygiene corrections (this assignment — test/docs only)

1. **`icn-goods-services-api-field-capture.test.ts`** — `serviceKey: "test-service-key"` on offline mocked `captureIcnGoodsServicesLanguageCatalog` (zero real API calls).
2. **`e2e/icn-facility-detail.mobile.spec.ts`** — browse-origin return expects GW-ICN-017 URLs: `?q=…` and `?q=…&terminal=P03` plus restored search + T2 `aria-pressed`; direct-entry `"목록으로"` still expects bare `/icn`.
3. **`e2e/gw-icn-015-enrich-adopt.mobile.spec.ts`** — after `"Show more"` click, assert expanded state via `"Show less"` locator (label swap); collapse back to `"Show more"`. KO `243` no-toggle test unchanged.

**Product / fixture bytes:** unchanged (see SHA-256 table).

## Fixture / companion byte preservation

| Artifact | SHA-256 @ rerun |
| --- | --- |
| `icn-facilities-ko.json` | `0bcde726d1800a1896cba3b73277689f2ab303c6f33aef15cee8ad74f4dfd2f4` |
| `icn-facilities-en.json` | `31e9ddbe9d47ebd86b9a4692f7d2cbebacf043d21d6fef0f40a4729fca69614a` |
| `icn-goods-services-companion-v1.json` | `45f52bc64da4493f94e2daf02ec319586d983a77cb6df2995a367cd747c36802` |

## Commands and results

### Initial verification campaign (before hygiene)

| Command | Result |
| --- | --- |
| Full vitest (`--pool=forks --maxWorkers=2 --testTimeout=60000`) | **1293 pass, 2 fail, 6 skip** |
| ICN mobile Playwright | **12/15 PASS** |
| SFO desktop Playwright | **10/10 PASS** (reused; product unchanged) |
| `npm run build` | **PASS** (initial campaign) |

### After test-hygiene + rerun (**2026-11-05**)

| Command | Result |
| --- | --- |
| `vitest run icn-goods-services-api-field-capture.test.ts` | **PASS — 8/8** |
| Affected Playwright (detail + adopt specs) | **PASS — 13/13** |
| Full vitest (same pool/workers/timeout) | **FAIL — 1294 pass, 1 fail, 6 skip** (`icn-shipped-output` only) |
| ICN mobile Playwright (3 spec files, fresh build via `npm run test:e2e`) | **PASS — 15/15** |
| `npm run lint` | **PASS** (0 errors; 3 pre-existing warnings) |
| `npx tsc --noEmit --incremental false` | **PASS** |
| `git diff --check` | **PASS** on tracked text diffs |

**Logs (rerun):** `/private/tmp/gw-icn-018-verification/vitest-full-rerun2.log`, `playwright-icn-mobile-rerun2.log`, `playwright-affected-rerun.log`, `vitest-api-capture-rerun.log`.

## Inherited failure: `icn-shipped-output.test.ts` (unchanged expectation)

KO expected `0986f616…` vs actual `b6149d16…` with **fixture bytes frozen** since `5bd3121`. Confirmed by Antigravity + initial investigation: browse/display serialization drift (GW-ICN-007–014), not fixture mutation. **Not updated in this task.**

## Playwright EN `243` — corrected diagnosis

**Initial checkpoint error (withdrawn):** claimed `"Show more"` absent in production.

**Actual cause (Antigravity + author rerun):** Product **PASS** — 349-char EN companion text renders collapse toggle. Playwright **FAIL** was **defective locator**: after click, accessible name becomes `"Show less"`, so `getByRole("button", { name: "Show more" })` cannot satisfy `aria-expanded="true"`. Hygiene fix **PASS**. Expanded-state screenshot from the author Playwright rerun is **`docs/handoffs/GW-ICN-015-adopt-en-long-360px-expanded.png`** — **local only, not in this publication commit** (PNG artifacts excluded from staged scope).

## Author browser-matrix script — do not treat as ground truth

**Original artifact (unchanged):** `/private/tmp/gw-icn-018-verification/browser-matrix/results.json` — all six cells `"pass": false` due to script defects (wrong saved-storage key `gatewise.icn…` vs `mivvu.icn.savedFacilities.v1`; Situation regex scanned disclaimer “not claimed” bullets; terminal Back check clicked already-active T2). **Do not overwrite or relabel** that file.

**Independent six-cell hydrated audit:** Antigravity `browser-audit.json` + `saved-origin-and-category-probe.json` — **PASS** for core journey × 360/390/430 × KO/EN (category sheet, save/revisit, URL return). Matrix table cites this evidence; Cursor did **not** rerun a corrected matrix script (no `results-corrected.json`).

## New product defects

**None** at `4404473` after hygiene reruns.

## Antigravity / matrix handoff

- [`GW-ICN-018-verification-matrix.md`](GW-ICN-018-verification-matrix.md)
- [`GW-ICN-018-antigravity-checklist.md`](GW-ICN-018-antigravity-checklist.md)

---

```text
GATEWISE STATUS — Cursor (publication)
Task ID / objective: GW-ICN-018 — Core Journey verification + test-hygiene publication
Plan revision: GW-PLAN-REV-2026-10-29
Execution permission: authorized (human 2026-11-05 — commit/push/PR; not merge/deploy)
Work progress: complete
Review / acceptance: accepted conditional pass (human 2026-11-05)
Integration / release: publication branch push — PR by coordinator; not merge/production
Files in publication commit: 3 test files + 3 handoff docs only (see commit stat)
Tests: full vitest FAILED 1 inherited; ICN Playwright 15/15 (author rerun, reused for publication); SFO 10/10 reused
Git: branch test/gw-icn-018-core-journey; parent 4404473…
Blockers: inherited icn-shipped-output hash — disposition deferred
Handoff: docs/handoffs/GW-ICN-018-*.md; PR base feat/gw-icn-015-situation
```
