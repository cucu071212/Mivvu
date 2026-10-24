# GW-022 — Pre-deployment QA preparation

Prepared 2026-10-24. **Preparation only; no release certification or runtime pass.**

Reviewed fetched `origin/main` at `babaf968269a7ecb1a7dc1efb153915ee3c1502c` (GW-017). The working branch remains `feat/data-utils`; its existing commits were preserved without merging main. Findings below describe that inspected main snapshot, not a locally running application.

## Evidence and limits

| Evidence | Result |
| --- | --- |
| `git fetch origin`, `git show origin/main:<path>` | Fetched and inspected contracts, GW-017 UI/comparison helpers, recommendation integration, demo overlay, travel matrix, relevant tests and confidence presentation. |
| Python JSON parsing of `origin/main:src/data/facilities.json` | Parsed successfully; 12 records. This is static inspection, not execution of the app loader or validator. |
| Existing `docs/qa-checklist.md`, PLAN.md and implementation plan | Reviewed against the GW-017 source snapshot. |
| `command -v npm` | No executable found; exit 1. |
| npm/Vitest, lint, TypeScript and production build | **NOT RUN** in this preparation task. Test source inspection does not establish that tests pass. |
| Browser, mobile viewport, keyboard and screen reader | **NOT RUN**. All acceptance checks below remain pending. |
| Deployed URL and deployment health | **NOT CHECKED**. No Vercel deployment claim. |

Official source URLs and verification dates come from the existing dataset/provenance documentation; airport websites were not rechecked in this task. Official location evidence does not establish current opening hours, queues or live availability.

## Alignment with the older QA checklist

- Its historical “engine absent” snapshot is superseded for this review: main now contains GW-017, ranked recommendation integration and an opt-in demo-duration overlay. The older document itself is unchanged.
- Alphabetical filtering checks remain useful, but the final list must follow recommendation status/margin ranking, then deterministic name/ID tie-breaking. Alphabetical production results alone do not prove mixed-status ranking.
- GW-017 baseline inputs follow the current main form; there is no saved-baseline action. Hold the main form fixed while editing hypothetical inputs. The main buffer, filters and demo toggle affect both runs.
- The actual D-only demo overlay uses queue 8, activity 10 and directed D→D travel 3 per leg. With buffer 10, required time is **34 minutes**. The illustrative D/E/F 42-minute example remains a synthetic engine fixture, not an SFO Terminal 2 route or current UI scenario.
- Unsupported zones, alternative security sides, missing route edges and mixed-status fixtures require isolated contract/engine tests; do not add fabricated airport rows or imply those are normal UI controls.

## Pending regression checklist

Every row is **NOT RUN**. “Source expectation” means inferred from inspected code/contracts, not verified browser behavior.

| ID / level | Action and expected result |
| --- | --- |
| R01 — browser / data | Load with a valid context and cleared filters: 12 approved facilities, Terminal 2 D Gates only. Check names, unique IDs, official URLs, dates and location descriptions against `data-provenance.md`; the disputed second Peet’s outlet (D14/D15), Plant Café/Pinkberry and Books Inc./Compass stay excluded; the approved Peet’s D7 outlet remains included. |
| R02 — browser | Browse cards and details; search with empty text, mixed-case name substring and no match. Combine category and text with AND; clear filters to restore records. Check count, empty state and consistent selected details. |
| R03 — engine + browser | Use independent mixed fixtures to check feasible → tight → over-budget → unknown → ineligible; within comparable outcomes verify margin ordering and name `en-US` base/ID tie-breaking. In the production overlay all facilities share timing costs, so tied ordering alone is insufficient. |
| R04 — browser | Demo estimates default off: null queue/activity produce unknown, with no numeric feasibility promise. Toggle on: queue 8/activity 10 visibly labeled demo estimates; travel 3 each way also estimated. Toggle off: unknown restored, official dataset unchanged. |
| R05 — engine + browser | With the overlay on and buffer 10, exercise all four boundary rows below. Check status, required total, signed margin and explanation in cards and What-if. |
| R06 — browser | Hold main boarding 50, buffer 10, demo on: baseline required 34, margin +16 feasible. Set scenario to 35, queue delta 0: required 34, margin +1 tight. Then delta +7: required 41, margin −6 over-budget. Explain the combined margin reduction of 22 (15 less available + 7 extra queue). |
| R07 — engine + browser | At 50 minutes, delta +7 gives required 41/margin +9; delta −3 gives 31/+19. Deltas −8 and −99 clamp effective known queue to 0, required 26/margin +24. Signed adjustment must never manufacture a known queue from null. |
| R08 — browser | Change main boarding/buffer, filters and demo toggle: both comparison runs reflect current shared inputs; scenario boarding remains independently editable. Show changed inputs and before/after numeric reasons. Check clear-filter/no-result transitions. |
| R09 — validator + browser | Required boarding blank/whitespace, negative, fractional, nonnumeric, NaN and Infinity fail. Optional blank buffer defaults to 10 and blank queue delta to 0; explicit zero is preserved. Negative buffer/fractional queue fail; signed integer queue delta is allowed. Unsupported gate zone fails at the contract boundary. Invalid context returns null; UI errors prevent stale numeric recommendations. |
| R10 — engine fixtures | Post-security passenger: post/both facilities eligible, pre/unknown ineligible with reason. Missing outbound or return leg, null queue or activity yield unknown with null required/margin; no zero substitution. Negative/NaN/Infinity travel values must not yield feasibility. Production remains D-only. |
| R11 — browser / provenance | Verify source links, last-checked date, official location confidence and estimated time confidence in cards/details. No implication of live airport data, current opening status, measured indoor navigation, automatic flight countdown or guaranteed boarding success. Minutes mean until boarding **starts**. |
| R12 — mobile / keyboard / AT | At 320–390 px and 200% zoom, check no clipped inputs/breakdowns/comparisons or horizontal overflow. Tab through filters, details, toggle and scenario inputs; visible focus and readable labels, non-color status meaning, error association/announcement and result announcements. Verify mobile users can enter a minus sign for queue delta and correct invalid fields. |

### Boundary oracle (demo inputs only)

Required = outbound 3 + return 3 + queue 8 + activity 10 + buffer 10 = **34**. Set queue delta 0. Apply available minutes to the main form or independently to the scenario while keeping other inputs fixed.

| Minutes until boarding starts | Margin | Expected classification |
| --- | --- | --- |
| 33 | −1 | `over_budget` |
| 34 | 0 | `tight_in_model` |
| 43 | 9 | `tight_in_model` |
| 44 | 10 | `feasible_in_model` |

These are calculated acceptance oracles, not executed tests or official airport timing data.

## Source-inspection risks and coverage gaps

| Finding | Release implication / follow-up for lead |
| --- | --- |
| `recommendation-page-integration.test.ts`, “mixed feasibility statuses”: all 12 rows receive the same demo durations and D-only route. | The integration assertion does not actually exercise mixed status groups. Independent engine fixtures cover ranking separately; inspect/run those and validate genuinely mixed integration data before claiming that path covered. |
| `what-if-compare.test.ts`, “does not mutate source facilities”: checks an overlay copy, but passes a different `[facility]` array to the function. | That assertion does not protect the actual scenario input from mutation. Another page-integration test checks its actual array; this specific scenario test still needs stronger evidence. No tests changed here. |
| `GateWiseHome.tsx` / `WhatIfSimulator.tsx`: baseline is reactive to main inputs; scenario has independent input state. | “Saved baseline” narration would be inaccurate. Validate shared-buffer/filter/toggle behavior and confirm the intended UX with the lead. |
| Overlay gives every production facility equal queue/activity and same-zone travel costs. | Current dataset cannot demonstrate realistic timing differentiation or mixed ranking. Explain ties honestly; do not invent per-facility durations for a stronger demo. |
| Scenario inputs use `inputMode="numeric"`; errors use alerts, but explicit error descriptions and comparison result announcements need browser/AT assessment. | Negative queue entry on mobile and assistive-technology feedback remain unverified; source inspection alone does not establish an accessibility failure or pass. |
| No runtime/build/deployment evidence collected here. | Actual compilation, hydration, console/network health, responsive layout and deployed behavior remain release risks until verified against a named commit and URL. |

## Handoff before final regression

The lead supplies the release commit/URL and a working dependency environment. For a separately authorized verification run, record actual `npm test`, lint, TypeScript and production-build results, then browser/device evidence for each checklist row. Use the repository's verified scripts (`test`, `lint`, `build`); determine the TypeScript invocation from the available toolchain. Record failures with inputs, expected/actual results and reproduction steps. Final release certification remains pending explicit authorization and executed evidence.
