# Independent production recommendation red-team audit

Date: 2026-10-25. User-assigned audit; no new roadmap implementation task.
Baseline: `47c07028e1eccb3515f8bd8bfddd80f1c90fccdd`.
Branch: `codex/recommendation-red-team`.

## Confirmed findings, ranked by severity

1. **P2 — Pause/resume could restore a budget minute after tolerated clock jitter.**
   Start a 44-minute countdown with demo estimates enabled; advance one second
   (baseline 43), move the device clock backward one second, then Pause and Resume.
   The baseline became 44. Demo required time is independently 3 outbound + 3 return
   + 8 queue + 10 activity + 10 buffer = 34; margin therefore incorrectly improved
   from +9 (tight) to +10 (feasible). Pause displayed a capped budget but stored the
   larger raw timestamp remainder, which resume then restored.
   Fix: capture the paused remainder at the later of the current clock and latest
   accepted clock reading. Normal pause/resume retains exact milliseconds.
   Regression: `does not regain a budget minute through pause/resume after tolerated clock jitter`
   in `src/components/GateWiseHome.integration.test.tsx`. Before the fix it failed
   with actual `44`, expected `43`; after the fix it also verifies the tight card.

2. **P2 — Successive small rollbacks bypassed the five-second clock-failure guard.**
   With boarding at 18:44:00Z, accept ticks at 18:00:01Z and 17:59:58Z, then tick at
   17:59:55Z. Each step is only three seconds backward, but the aggregate is six.
   The old memory moved backward on each accepted tick, allowing continued
   rollbacks to keep a stale budget active instead of suppressing results.
   Fix: retain the maximum accepted device timestamp when advancing tick memory;
   both the timer and pause now use that retained timestamp. The tolerance remains
   five seconds. Forward progression and ordinary small jitter remain supported.
   Regressions: `rejects cumulative backward jitter beyond five seconds from the latest clock reading`
   in `src/lib/running-countdown-tick.test.ts` and
   `stops results after cumulative small rollbacks exceed the clock tolerance`
   in the mounted integration suite. Both failed before the fix: the pure result
   was `ok`, and the UI remained in running mode. Both now pass; the mounted test
   verifies that recommendation cards and What-if are suppressed.

3. **P3 — Flight hero announced boarding started up to 59 seconds early.**
   Start a one-minute countdown and advance one second. The correctly floored
   budget is zero, but the hero displayed “Boarding started (baseline 0)” while
   the actual boarding-start event was still in the future.
   Fix: use “Baseline at 0 whole minutes” for that budget label. The separate
   countdown alert still reports boarding started at the actual timestamp.
   Regression: `does not announce boarding started just because fewer than 60 seconds remain`
   in the mounted suite. Failed on the premature label before the fix, then passed
   including the subsequent actual boarding-start alert. No rounding changes.

## Scope and preserved behavior

Read `AGENTS.md`, `PLAN.md`, and `docs/GW-F-CONTRACT.md`, plus the relevant task
entries in `docs/IMPLEMENTATION_PLAN.md`. Inspected the production engine,
numeric/context validation, duration resolution and wrapper, countdown helpers,
shared session, What-if, eligibility, and their existing tests. No ongoing
integration branch or Phase B/GW-E research/design contents were accessed.

No defect was reproduced in the core sum, directed-leg accounting, single buffer,
margin thresholds, missing-duration handling, or override precedence. Existing
tests cover invalid/nonfinite/negative values, asymmetric illustrative edges,
missing edges, DST/date parsing, and eligibility exclusions. Core engine,
facility records, walking estimates, eligibility policy, and contracts are unchanged.

Added `src/lib/recommend-red-team.test.ts` to verify:

- Exactly 26 browse-eligible facilities and 12 modeled D Gates facilities, with
  all 14 browse-only rows remaining ineligible even under zero overrides,
  maximum boarding budget, minimum queue adjustment, and demo mode on/off.
- Independently calculated repeated queue scenarios (+0, +7, -100, +7, +0),
  no mutation of frozen facility/override inputs, reset-to-unknown with demo off,
  and reset-to-demo totals with demo on.
- Production travel metadata remains explicitly `demo_estimate`.

## Verification actually executed

All commands below ran in the isolated worktree. Counts describe each run at the
time it was executed, including intentionally failing regressions.

| Command | Result |
| --- | --- |
| `npm test` (unmodified baseline) | PASS: 631 tests, 37 files |
| `npm test -- src/components/GateWiseHome.integration.test.tsx` | Expected RED: 2 clock regressions failed; 6 existing tests passed |
| `npm test -- src/components/GateWiseHome.integration.test.tsx -t 'does not regain'` | PASS after pause fix: 1 passed, 7 skipped |
| `npm test -- src/lib/running-countdown-tick.test.ts` | Expected RED: cumulative rollback regression failed; 7 existing tests passed |
| `npm test -- src/lib/running-countdown-tick.test.ts src/components/GateWiseHome.integration.test.tsx` | PASS after clock fixes: 16 tests |
| `npm test -- src/components/GateWiseHome.integration.test.tsx -t 'does not announce'` | Expected RED: 1 failed, 8 skipped; after copy fix PASS: 1 passed, 8 skipped |
| `npm test -- src/lib/recommend-red-team.test.ts` | PASS: 2 safety-invariant tests |
| `npm test` (final implementation) | PASS: 637 tests, 38 files |
| `npx tsc --noEmit` | First attempt failed only with TS5033/EPERM writing `tsconfig.tsbuildinfo`; authorized retry PASS, exit 0 |
| `npm run lint` | PASS, exit 0 |
| `npm run build` | PASS, exit 0; all 7 static pages generated |
| `git diff --check` | PASS |
| `git diff --exit-code 47c07028e1eccb3515f8bd8bfddd80f1c90fccdd -- AGENTS.md PLAN.md docs/GW-F-CONTRACT.md src/data src/lib/recommend.ts src/lib/resolve-facility-durations.ts src/lib/what-if-compare.ts` | PASS: unchanged |

Vitest emitted its existing non-fatal warning about ESM syntax in the CommonJS
config and a future Vite loader default. No configuration/dependency changes were
made. Dependencies were copied from the original checkout without installation;
branch creation and the dependency copy initially hit sandbox write restrictions
and succeeded on authorized retries.

## Unresolved issues and merge recommendation

No confirmed defect from this audit is left unfixed. No architectural workaround
was introduced. Device-clock estimates, intentional pause/resume target shifting,
and fixed What-if scenario minutes remain the approved contract. Mounted fake-clock
tests were run; real-device sleep/background throttling and production-browser
smoke testing were not performed. This is a focused audit, not proof of correctness
under every runtime condition.

Ready for human Engineering Lead review and merge based on the checks above.
`advanceTickMemory` now requires previous memory; its production caller and tests
are updated. The two component edits are limited to countdown correctness and
accurate budget wording. Any later integration should preserve these regressions.
No merge to `main` or deployment was performed.
