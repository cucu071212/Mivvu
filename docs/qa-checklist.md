# GateWise QA acceptance checklist — GW-018

Prepared 2026-10-24 (Eastern Time), from local branch `feat/data-utils` at `4689e47` before this documentation commit. This is an acceptance checklist, **not a completed UI QA report**. The human lead authorized preparation before the GW-017 dependency is available locally.

Integration note (2026-10-24): imported from teammate commit `e7d06298806a0023e2fce20a0c907719b65451de` onto `feature/core-app`, based on GW-013 commit `140ef64`. The observed-local-state section describes the teammate's authoring snapshot, not the current core-app implementation. This documentation import does not execute or certify application/UI acceptance checks.

## Observed local state

- `src/app/page.tsx` contains a design-system preview with sample status/source chips. Those chips do not demonstrate calculated recommendations.
- Facility JSON, filtering and validation modules, recommendation tests and the D-only demo travel matrix are present.
- `src/lib/recommend.ts` and `src/components/WhatIfSimulator.tsx` are absent locally. No recommendation, form, search, what-if or mobile behavior has been browser-verified for this task. Remote/staging/deployed state is **NOT CHECKED**.
- A Python read of the actual JSON confirmed 12 unique records, all zone D/post-security, official location metadata, checked date `2026-10-24`, null queue/activity durations and unknown time confidence. Categories: 6 food, 1 coffee, 5 shop.
- Existing provenance is in [data-provenance.md](data-provenance.md). Sources were not re-verified online during this documentation task; a checked date is not evidence of current opening or service availability.

## How to record a run

Every case below starts **NOT RUN**. After execution, record PASS/FAIL/BLOCKED, build commit, URL, browser/device/viewport, test inputs, actual result and evidence. A missing UI is BLOCKED, never PASS. Do not infer success from source presence or from the expected result in this document.

Use isolated synthetic test fixtures for broken inputs, security exclusions and numerical timing cases. Do not edit the approved facility JSON to stage a demo or add synthetic E/F zones to production. Fixture use and any visit-time estimates require the lead's approval and implementation. Lead owns all engine/UI fixes.

## Context and search

| ID | Input or action | Expected acceptance result | Initial status |
| --- | --- | --- | --- |
| C01 | Enter D and 50 minutes | Label says time until **boarding starts**. Valid normalized context uses buffer 10, queue adjustment 0 and passenger post-security. No gate-closure or live-flight claim. | NOT RUN |
| C02 | Submit missing gate or missing boarding minutes | Field-specific errors; `context: null`; no recommendations calculated from invalid values or stale valid results presented as current. | NOT RUN |
| C03 | Boarding minutes null, empty or whitespace; then -1, 8.5, `NaN`, `Infinity`, `12px`, boolean | Each invalid required value is rejected; blank boarding time is never defaulted to zero. Non-UI-representable values are utility-level tests. | NOT RUN |
| C04 | Required values D/0; optional buffer 0 and queue adjustment 0 | Explicit zeros are preserved. Zero remaining time is not silently replaced by a default. | NOT RUN |
| C05 | Gate ` D ` then E/F/lowercase d | Trimmed D is accepted; E/F/d are rejected by production context validation. D1/D7 are landmarks, not alternative production zones. | NOT RUN |
| C06 | Omit optional values or supply null/blank | Buffer defaults to 10; queue delta to 0; passenger to post; category is omitted. Defaults are confined to these optional fields. | NOT RUN |
| C07 | Buffer -1/fraction/nonfinite; queue -7 then fraction/nonfinite | Invalid buffer rejected; signed integer queue delta -7 accepted; fractional/nonfinite queue delta rejected. Any error means null context. | NOT RUN |
| C08 | Category food, invalid lounge; passenger pre/both/unknown | Supported category accepted, invalid category rejected. Explicit non-post passenger input rejected, not upgraded to post. | NOT RUN |
| S01 | Search `  PeEt  ` with coffee and D filters | Exactly the approved Peet's D7 record matches; trimmed case-insensitive name substring search. | NOT RUN |
| S02 | Search `Peet` with category food | No results; text/category/zone combine with AND. Clear empty state. | NOT RUN |
| S03 | Empty/whitespace query; category food/shop/coffee | Full list or category subsets in stable `en-US` base alphabetical order. With no search: 12 total, 6 food, 5 shop, 1 coffee. Input dataset is not reordered in place. | NOT RUN |
| S04 | Search only a location description/ID, or choose charging/restroom | Name-only search does not match hidden metadata. No invented charging/restroom records; empty results are acceptable for the approved dataset. | NOT RUN |

## Dataset, provenance and eligibility

| ID | Check | Expected acceptance result | Initial status |
| --- | --- | --- | --- |
| D01 | Load and validate JSON | Exactly 12 unique approved IDs; no validation errors. Original records, URLs, descriptions and dates preserved. | NOT RUN (raw JSON inspection passed separately) |
| D02 | Compare membership with approved shortlist | Napa Farms, Peet's D7, 16th & Dolores, Burger Joint, Wakaba, Brookstone, Andalé, Lark Creek Grill, Cat Cora, Kiehl's, Sunglass Hut, Chocolate Market. | NOT RUN |
| D03 | Check exclusions | No Peet's D14/D15, Plant Café/Pinkberry, or Books Inc./Compass Books in initial dataset. SFO News Express, We are SFC and Vino Volo remain reserves. | NOT RUN |
| D04 | Inspect source and estimate labels | Official listing metadata applies to names/locations. Companion S1-S4 provenance supports post-security classifications. It does not verify opening, queues, walking times or visit duration. Source links are usable and checked date visible where details are shown. | NOT RUN |
| D05 | Inspect actual JSON timing values and baseline output | Wait/activity remain null, time confidence unknown. With valid context and eligible security, missing visit times produce unknown output, never a calculated feasible/tight/over-budget result. | NOT RUN |
| D06 | Inspect travel metadata and schematic | D→D = 3 per leg is explicitly an unverified demo estimate, used independently outbound and return. No precise navigation/coordinates or claim that D/E/F share Terminal 2. | NOT RUN |
| E01 | Synthetic facility sides post and both, passenger post | Both eligible for time modeling; unknown timing can still yield unknown outcome. | NOT RUN |
| E02 | Synthetic facility sides unknown and pre | Explicit `kind: ineligible`, respectively `security_zone_unknown` and `security_zone_pre_only`; no feasibility badge or invented time budget. | NOT RUN |
| E03 | Runtime out-of-scope facility/gate E or F passed to production API | Rejected as outside supported scope, with an explanatory outcome. These are rejection fixtures, not production zones. | NOT RUN |

## Independent numerical oracle

**Hypothetical D-only fixture, not production data or an approved estimate:** outbound 3 + return 3 + queue 8 + activity 10 + buffer 10 = **34 required minutes**. Queue/activity values here are proposed test assumptions only. Do not assign them to a real facility without explicit lead approval. Margin = time until boarding starts minus required minutes. The buffer is already included once in the total.

| ID | Available minutes / other change | Required | Margin | Expected status | Initial status |
| --- | --- | --- | --- | --- | --- |
| N01 | 33 | 34 | -1 | `over_budget` | NOT RUN |
| N02 | 34 | 34 | 0 | `tight_in_model` | NOT RUN |
| N03 | 43 | 34 | 9 | `tight_in_model` | NOT RUN |
| N04 | 44 | 34 | 10 | `feasible_in_model` | NOT RUN |
| N05 | 50 | 34 | 16 | `feasible_in_model` | NOT RUN |
| N06 | 35 | 34 | 1 | `tight_in_model` | NOT RUN |
| N07 | 50; queue delta +7, queue becomes 15 | 41 | 9 | `tight_in_model` | NOT RUN |
| N08 | 35; queue delta +7 | 41 | -6 | `over_budget` | NOT RUN |
| N09 | 50; queue delta -3, queue becomes 5 | 31 | 19 | `feasible_in_model` | NOT RUN |
| N10 | 50; queue delta -8 or -99, queue floors at 0 | 26 | 24 | `feasible_in_model` | NOT RUN |

N01-N04 are classification boundaries, not aviation safety thresholds or guarantees. Reducing available time must never improve classification. Ranking places feasible before tight, over-budget and unknown; repeated identical calls give identical order. Test display explanations against the numeric breakdown, not just chip colors.

| ID | Fault injection / action | Expected acceptance result | Initial status |
| --- | --- | --- | --- |
| U01 | Null queue, then null activity, then both | `kind: unknown`, suitable missing-queue/activity reason; missing values remain null; `requiredMinutes` and `marginMinutes` both null. No feasibility status. | NOT RUN |
| U02 | Null queue plus positive/negative what-if queue delta | Queue remains unknown, never 0 or the delta itself. No computed total/margin. | NOT RUN |
| U03 | Missing production D→D matrix edge | Both legs unknown; a missing-travel reason; total/margin null. | NOT RUN |
| U04 | Illustrative export only: missing outbound with known return; then missing return with known outbound | Correct directional reason; known leg retained, missing leg null; no partial total or margin. | NOT RUN |
| U05 | Negative, NaN or Infinity travel duration | Invalid leg treated as unknown; no zero substitution, negative cost, NaN total or misleading classification. | NOT RUN |
| U06 | Known zero queue/activity or travel in synthetic fixtures | Valid known zero remains zero and is distinct from unknown. | NOT RUN |
| U07 | Illustrative export only: D→E 7, E→D 11, queue 8, activity 10, buffer 10 | 46 required, margin +4 at 50, tight. Directed legs shown separately. E/F are never exposed as production Terminal 2 zones. | NOT RUN |
| U08 | Test-only original hero D↔E 7 each, other assumptions as above | 42 required: +8 at 50, -7 at 35, +10 at 52. This is an illustrative regression, not the production D-only walkthrough. | NOT RUN |

## What-if integration

| ID | Action | Expected acceptance result | Initial status |
| --- | --- | --- | --- |
| W01 | Save baseline N05, change countdown to 35 (N06) | Baseline remains 50/+16/feasible; hypothetical is 35/+1/tight. Explain the 15-minute reduction. Both calculations call the same pure engine. | NOT RUN |
| W02 | From that baseline, hypothetical countdown 35 plus queue delta +7 (N08) | Baseline still 50/+16; hypothetical is 41 required/-6/over budget. Explain -15 available minutes and +7 queue minutes, reducing margin by 22 overall. | NOT RUN |
| W03 | Countdown unchanged at 50; queue delta +7 (N07), then restore | Queue-only change reduces margin by exactly 7. Restoring baseline inputs restores its output; no stale comparison state. | NOT RUN |
| W04 | Invalid hypothetical input | Clear error; do not present old hypothetical values as newly calculated. Baseline remains intact. | NOT RUN |
| W05 | What-if on the actual null-duration dataset | Unknown stays unknown until approved assumptions supply all essential times. No fabricated numeric result merely to animate a status change. | NOT RUN |

## Mobile and accessibility checks

All items are planned, **not browser-tested** in this task.

- [ ] Check 360×800 and 390×844 CSS-pixel viewports plus desktop. No horizontal overflow, clipped breakdowns or hidden what-if actions; allow normal scrolling.
- [ ] Check portrait/landscape and 200% browser zoom. Labels and primary actions remain readable and reachable.
- [ ] Use keyboard only: logical focus order, visible focus indicator, operable filters/sliders/buttons and source links; no trap.
- [ ] Inputs have programmatic labels, units and boarding-start wording. Validation errors identify fields and are connected to inputs; dynamic results/errors are discoverable to a screen reader.
- [ ] Status and confidence are conveyed in text as well as color; readable contrast and comfortably sized touch targets.
- [ ] Baseline versus hypothetical is unambiguous visually and in screen-reader order. A screen reader can identify which input changed and the new margin.
- [ ] Invalid/empty/unknown/ineligible states remain understandable on a small screen; source details and estimate caveats are accessible.

## Verification and handoff

Before claiming release readiness, run `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build` in the lead's configured environment. Recommendation tests require the real `recommendFacilities` and approved illustrative export. Run the desktop/mobile flow and rehearse [demo-script.md](demo-script.md) against the exact reviewed build; log any failure with steps, expected/actual results, fixture inputs and screenshot/log evidence.

For this preparation, automated application commands cannot establish UI readiness. Missing engine/what-if integration, unavailable npm tooling and any missing approved numeric demo fixture are handoff dependencies. Do not mark this checklist passed or treat it as deployed QA sign-off.
