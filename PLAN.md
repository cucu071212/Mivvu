# GateWise — HackPSU Fall 2026 Final Implementation Plan

**Status:** Approved product baseline **v1.6 (Phase A + Phase X complete; Phase B metadata slice complete)** — HackPSU P0/P1, **GW-F1–F3**, Level 2 multipage UX, security hardening, **Phase A** data + UI, **Phase X** SFO-wide directory (**26** browse / **12** recommend), and **GW-B-002** legacy travel metadata **shipped** on production `main` @ `6a847b8e7170e553aeb2d996567e4931e0426c33` (see §11–§13). **Active development** is **Phase C — usability** (§13), with Phase B **physical routing HOLD** and **GW-E** (Phase D) **HOLD** until **G-Data** closes.  
**Project:** GateWise — *Your airport. Your gate. Your time.*  
**Event:** October 24–25, 2026 (Eastern Time)  
**Team:** Engineering lead (Cursor + own Codex) and teammate (Codex, data/utility logic/QA)  
**Primary source:** `GateWise_HackPSU_Project_Plan.md` (Draft v0.1), approved v1.0 plan, and team decisions (updated ownership: lead owns all UI; teammate owns data, utilities and tests).

**How to use this file:** Product scope and acceptance criteria live here. Agent behavior and per-file edit restrictions live in `AGENTS.md`. Create the detailed `docs/IMPLEMENTATION_PLAN.md` using `writing-plans` **only after both coding environments and file contracts are ready**; that execution plan may not override P0/P1 boundaries.

> **Pitch:** Airport maps show where amenities are. GateWise helps travelers decide whether they have time to visit them before boarding.

## 1. Non-negotiable decisions

1. **P0 Core B:** Boarding-aware facility recommendation for **one verified SFO terminal**, using 10–20 facilities where source records are available; reduce the number rather than invent facts.
2. **P0 Differentiator C:** What-if simulator using **the same recommendation function**, with before/after comparison and a numeric reason for status changes.
3. **P1 Stretch E:** Evaluate at most **two distinct facility stops** in both orders, only after **GW-F3** (F1+F2 integration) passes acceptance and the human lead separately authorizes **G-E** (see §11). E is a time-budget estimator, not verified indoor route optimization.
4. Data is separated into **zone-to-zone time matrix**, **facility records**, and **user context**. Verified airport facts and assumed/demo times remain separately labeled.
5. **No** live flight feeds, real boarding-pass scanning, nationwide airports, production indoor routing, authentication, database, or payments during P0.
6. **`minutesUntilBoarding` means time until boarding STARTS**, not gate closure. Never call a modeled option "guaranteed safe".

**Scope-freeze rule:** New ideas go to `BACKLOG.md` rather than P0. Changes require an explicit agreement by both team members.

## 2. Demo success criteria

A judge can (a) select the supported SFO terminal and gate zone, (b) enter minutes until boarding, (c) see facilities sorted with calculated time and clear confidence labels, (d) change remaining time or a queue-time assumption, and (e) immediately see before/after status, remaining margin, and a transparent explanation. The live URL loads on mobile and the entire path works without paid APIs.

**Hero demo — clearly simulated inputs:** Start in zone D with 50 minutes until boarding, select an example facility in E. Outbound 7 + return 7 + queue 8 + activity 10 + buffer 10 = **42 minutes**, margin **+8 (Tight)**. Reduce to 35 minutes; margin becomes **−7 (Over Budget)**. Clearly explain the 15-minute reduction. Demo facilities and timings are not represented as verified SFO facts.

## 3. Data contract

Keep the reference matrix as a **demo assumption**, not an actual SFO measurement. Choose which *one* terminal/gate areas are represented only after inspecting official SFO information; **do not imply D, E, and F are all in that one terminal without verifying**.

```ts
export type Zone = 'D' | 'E' | 'F'; // ILLUSTRATIVE; replace after SFO data audit
export type DataConfidence = 'official_verified' | 'third_party' | 'demo_estimate' | 'unknown';
export type TravelMatrix = Record<Zone, Record<Zone, number | null>>;

export const demoTravelMinutes: TravelMatrix = {
  D: { D: 3, E: 7, F: 12 },
  E: { D: 7, E: 3, F: 6 },
  F: { D: 12, E: 6, F: 3 },
};

export type Facility = {
  id: string;
  name: string;
  zone: Zone;
  category: 'food' | 'coffee' | 'restroom' | 'charging' | 'shop';
  securityZone: 'pre' | 'post' | 'both' | 'unknown';
  waitMinutes: number | null;      // demo estimate unless supported
  activityMinutes: number | null;  // demo estimate unless supported
  sourceUrl?: string;
  lastCheckedAt?: string;
  locationConfidence: DataConfidence;
  timeConfidence: DataConfidence;
};

export type UserContext = {
  gateZone: Zone;
  minutesUntilBoarding: number;
  bufferMinutes: number;
  category?: Facility['category'];
  queueAdjustmentMinutes?: number; // what-if delta, default 0
};

export type RecommendationStatus = 'feasible_in_model' | 'tight_in_model' | 'over_budget' | 'unknown';
```

**Data integrity:** Source-confirmed names, terminal/gate area and security status must have URLs and a checked date. Never present queue times, walking times, hours, accessibility, precise paths or live flight states as real unless independently verified. If key values are absent, return `unknown`; do not substitute zero. Avoid unsupported terminal crossings and security re-entry assumptions.

### Important same-zone rule

`D→D = 3` means a **representative between-location travel estimate in zone D**, not an actual measured distance. For B, traveling from the gate to a different facility in the same zone can use this approximation twice; for E, remaining **at the same facility** costs zero additional travel while moving between two distinct facilities in the same zone uses the matrix. These values must be explicitly labeled as a demo model.

## 4. Single pure recommendation engine

```ts
recommendFacilities(
  context: UserContext,
  facilities: Facility[],
  travelTimes: TravelMatrix
): Recommendation[]
```

For each eligible facility:

- `outbound = travelTimes[gateZone][facility.zone]`
- `returnTrip = travelTimes[facility.zone][gateZone]` (**do not assume symmetry**)
- `queue = max(0, facility.waitMinutes + queueAdjustmentMinutes)` when known
- `requiredMinutes = outbound + returnTrip + queue + activityMinutes + bufferMinutes`
- `marginMinutes = minutesUntilBoarding - requiredMinutes`

Use consistent model thresholds: margin **>= 10** → `feasible_in_model`; **0–9** → `tight_in_model`; **< 0** → `over_budget`; unknown or prohibited route inputs → `unknown`/excluded with a reason. The margin is additional to the separately counted safety buffer; this is an app-display heuristic, not an aviation safety claim. Ranking should place feasible options before tight, over-budget and unknown and expose the breakdown.

**C reuses the exact same function:** retain baseline inputs and hypothetical inputs, call `recommendFacilities` for both, and show original status, new status, margins, plus which input changed and why. No second recommendation algorithm.

**E (only stretch):** for facilities A and B, evaluate `gate → A → B → gate` and `gate → B → A → gate` with directed matrix edges, distinct-facility identity, total queue/activity for each stop, and **one** final buffer. Compare both, handling unknown edges and any zero same-facility transition appropriately. Use the same time-data contracts. Do not describe this as verified indoor route optimization.

## 5. Test-first acceptance checks

- 50 minutes available, 42 required → margin +8 and `tight_in_model`.
- 35 minutes available, 42 required → margin −7 and `over_budget`.
- 52 minutes available, 42 required → margin +10 and `feasible_in_model`.
- Increasing a queue estimate by 7 reduces the margin by exactly 7.
- Reducing remaining time cannot improve a facility's feasibility classification.
- Missing matrix edge, queue or activity estimate → `unknown`, not 0.
- Wrong terminal/security-zone constraints exclude facility or mark ineligible.
- Non-symmetric matrix correctly calculates outbound and return separately.
- For E: evaluate both orders; one buffer only; same-location vs same-zone distinct locations correctly differentiated.
- Recommendation output has numeric breakdown and confidence information; no misleading live-data language.

Use targeted unit tests first, then `npm run lint`, `npx tsc --noEmit` and `npm run build` where scripts/configuration permit.

## 6. Deliverable screens

1. **Flight context:** supported airport/terminal, gate zone, minutes until boarding (start), optional category and safety buffer.
2. **Recommendations:** ranked cards with status, walk/queue/activity/return/buffer breakdown, margin, source and estimate badges.
3. **What-if:** boarding-time and queue-time controls, side-by-side baseline vs changed result, explanation of recommendation changes.
4. **Terminal overview:** original simple zone schematic only; no false claim of precise indoor navigation.
5. **Detail/empty states:** source information, explicit uncertainty, no-results and invalid-input handling.

Mobile-first responsive design. A clean working flow is more valuable than a large number of pages.

## 7. Engineering, contracts and ownership

**Stack:** Next.js App Router, TypeScript, Tailwind CSS, local JSON/TS data, Vercel, GitHub. Avoid database, auth and paid APIs.

```text
gatewise/
  PLAN.md
  AGENTS.md
  docs/IMPLEMENTATION_PLAN.md       # generated after setup; task-level only
  docs/DEMO_SCRIPT.md
  src/types/airport.ts              # lead
  src/data/travel-times.ts          # lead
  src/data/facilities.json          # teammate
  src/lib/recommend.ts              # lead
  src/lib/recommend.test.ts         # teammate
  src/lib/filter-facilities.ts      # teammate (pure search/category/zone filtering)
  src/lib/filter-facilities.test.ts # teammate
  src/lib/validate-facilities.ts    # teammate (data validation/normalization)
  src/lib/validate-facilities.test.ts # teammate
  src/lib/validate-context.ts       # teammate (user input validation)
  src/lib/validate-context.test.ts  # teammate
  src/components/AmenityCard.tsx    # lead (all UI)
  src/components/AmenityFilter.tsx  # lead (all UI)
  src/components/AmenityDetail.tsx  # lead (all UI)
  src/components/WhatIfSimulator.tsx # lead
  src/app/page.tsx                  # lead/integration
  README.md
```

| Engineering lead — Cursor + own Codex | Teammate — Codex |
|---|---|
| Own shared types, function interfaces, recommendation algorithm and directed zone matrix | Verify official SFO sources and create `facilities.json` with source/estimate separation |
| Own **all UI/UX**: design system, page layout, flight input, AmenityCard/Filter/Detail, recommendation display, What-if UI and terminal schematic | Implement **pure filtering/search logic** (`filter-facilities.ts`) for category, text and zone; no React/UI changes |
| Own What-if integration, wiring utility functions into UI, error states and accessibility | Implement **data validation/normalization** (`validate-facilities.ts`) and **input validation** (`validate-context.ts`) against lead-defined contracts |
| Own project configuration, small PR review, final integration, GitHub and Vercel deployment | Write independent unit tests for recommendation, filtering and validation utilities; prepare test fixtures |
| Own visual design decisions (UI UX Pro Max may be used in Cursor); establish shared type contracts first | Mobile/functional QA, bug reports, demo script, Devpost copy and recording; flag UI issues for lead to fix |

**First 30 minutes of permitted development:** Lead defines `src/types/airport.ts`, `recommendFacilities` signature, all UI prop interfaces, sample fixtures, utility function contracts (`filterFacilities`, `validateFacilities`, `validateContext`) and supported SFO terminal/zone scope (or labels all placeholders as demo). Agree on expected input/output and error/unknown behavior; commit/push contracts immediately. The teammate implements only against these contracts, rather than guessing types. During contract setup, the teammate can verify official facility sources independently.

**UI/component rule:** lead exclusively owns React components, visual design, layout, and UI integration. Teammate's filtering/validation utilities are pure, framework-independent functions: they must not import React, manipulate UI files, or call `recommendFacilities` internally. Lead wires utilities into UI and handles their messages/states. **Testing rule:** teammate test expectations are calculated independently of implementation output. **Ownership:** editing the other person's files requires explicit handoff. Separate branches and small, frequent merges; lead controls `main`.

**Integration checkpoints:** 17:00 ET: teammate's verified dataset + search/filter utility and lead's input/basic amenity UI; 20:00 ET: lead's recommendation engine/cards + teammate's validation and unit tests; 22:00 ET: lead's What-if and numeric comparison + teammate's regression QA; 23:00 ET: deployed mobile smoke test. Integrate smaller PRs before each checkpoint rather than waiting until the end.

**Planning sequence:** (1) both machines: Cursor/Codex, repo access, chosen skill installation; (2) agreed `PLAN.md` and `AGENTS.md`; (3) lead runs `writing-plans` **once** to create `docs/IMPLEMENTATION_PLAN.md` with owner, exact files, dependencies, checks and exit criteria; (4) approved task assignment; (5) start source implementation at the permitted time. Do not let the skill add features or change cutoffs.

## 8. Milestones and stop rules (Eastern Time)

Event schedule in prior plan: **Sat Oct 24, 2:00 PM → Sun Oct 25, 1:45 PM**; **initial Devpost submission by Sun Oct 25, noon**. Recheck official rules before relying on these times. Preparation before allowed hacking time must comply with event rules.

| Time | Gate | Stop rule |
|---|---|---|
| Sat 14:00–17:00 | Supported terminal chosen; teammate dataset/filter utility and lead context form/facility list usable | Do not add another airport |
| Sat 17:00–20:00 | Lead matrix/engine/cards; teammate validation utilities and independent tests | Drop extras if core fails |
| Sat 20:00–22:00 | What-if and before/after explanations functional | **If B+C incomplete at 22:00, cancel E** |
| Sat 22:00–23:00 | First deployed build and mobile smoke test | Stop adding P0 pages |
| Overnight | Test, contingency, rest as needed | Do not depend on a paid/live API |
| Sun 07:00–09:00 | Regression checks; E only if P0 fully stable and demo ready | Revert E if it destabilizes P0 |
| Sun 09:00–10:00 | Production URL, incognito/mobile test, README | Feature freeze |
| Sun 10:00–11:30 | Record <=5 min demo, complete Devpost and submit | Submit before noon |
| Sun 12:00 | **Initial submission deadline** | Verify successful submission |

**Absolute fallback:** If data collection stalls, use a smaller verified subset plus clearly identified synthetic demo entries. If map work stalls, use a zone list. If E stalls, delete/disable it. Always preserve a working live B+C flow.

## 9. Submission checklist

- [ ] Working live Vercel URL in incognito and on phone.
- [ ] SFO scope accurately labeled; no fictional venue presented as verified.
- [ ] What-if scenario demonstrably changes results and explains numeric reason.
- [ ] Test cases pass; no material TypeScript/build/runtime errors.
- [ ] Location facts and estimated times visibly distinguished.
- [ ] GitHub repo and README with source/limitations/setup.
- [ ] Demo recording (<=5 min) and backup screenshots/video.
- [ ] Devpost initial submission completed before deadline.

## 10. Team sign-off

**Decision required before coding:** Agree to **B+C as P0**, **E only after milestone gates**, single SFO terminal, one pure recommendation engine, directed zone-time matrix, assumption labels, explicit stop rules, and owner assignments. After approval, freeze this plan; log new ideas in backlog rather than expanding scope.

**Decision:** Team approval recorded in conversation; implementation may begin within official allowed hours.

**Engineering lead / UI owner:** Main developer (Cursor + Codex)  **Data / Utilities / QA owner:** Teammate (Codex)

## 11. Post-MVP feature progression (GW-F → GW-E) — historical record

**Production baseline (2026-10-25):** https://gate-wise-iota.vercel.app · `main` @ `b0b58c698179eb8241765f3ac8a93233cfc20676` (`b0b58c6`). Includes P0 B+C, GW-015 schematic, GW-F1–F3 (personalization, boarding countdown, What-if wiring), Level 2.0–2.7 multipage App Router UX, and post-audit security headers (production CSP without `unsafe-eval`).

| Phase | ID | Status | Summary |
| --- | --- | --- | --- |
| **F1** | GW-F1 | **Shipped** | Per-facility user queue/activity overrides; precedence over demo; no `facilities.json` mutation. Contract: `docs/GW-F-CONTRACT.md`. |
| **F2** | GW-F2 | **Shipped** | Boarding-start countdown from device clock; pause/resume/clear; not live airline data. |
| **F3** | GW-F3 | **Shipped** | F1+F2 integrated into recommendations and What-if; shared session across `/`, `/explore`, `/recommendations`, `/plan`. |
| **E** | GW-E | **Not started** | Two-stop planner — §4 E semantics; requires **G-E** plus post-submission **G-Data** gate (§12). |

**Preserved contracts (do not weaken):** `recommendFacilities` thresholds and breakdown semantics (§4); `minutesUntilBoarding` = minutes until boarding **starts**; unknown durations never zero-filled; What-if uses the same engine for baseline and scenario; user overrides never alter official dataset rows.

**Agent model (unchanged):** Engineering Lead Cursor (UI + integration + `main`); Engineering Support Codex (pure logic modules); optional Teammate for data/QA — see `AGENTS.md`.

## 12. Post-submission roadmap — Phase A (COMPLETE)

**Shipped:** **Phase A — Verified airport data** on production `main` @ **`af5fe21`** (2026-10-25). All **12** SFO Terminal 2 **D Gates** facilities include published hours, amenity taglines/badges, provenance, and Explore/Results UI with **not live** disclaimers. Contracts: GW-A-R001/R002, GW-A-001/002/003; gates **G-A0** / **G-A1** approved.

**Preserved:** Existing `recommendFacilities` semantics (§4), `minutesUntilBoarding` meaning, unknown durations never zero-filled, What-if and personalization (GW-F). Historical task detail: `docs/IMPLEMENTATION_PLAN.md` § Phase A.

## 13. Active roadmap (Phase X → B → C → D)

**Mission:** Expand GateWise from the hackathon **T2 D Gates** MVP toward **SFO-wide facility discovery** with honest limits — without inventing facilities, hours, walking times, or post-security connectivity.

**Execution:** `docs/IMPLEMENTATION_PLAN.md` (Phase X–D). **Priority table:** `docs/REMAINING_ROADMAP.md`. **Phase C plan:** `docs/GW-C-PHASE-C-READINESS.md`.

| Phase | Goal | Outcome | Status (2026-10-25) |
| --- | --- | --- | --- |
| **X — SFO-wide expansion** | Research official coverage; extend data model; add verified facilities **incrementally**; airport-wide directory UI. | Travelers browse SFO concessions by terminal/boarding area; **recommendation eligibility** stays gated on verified travel model — browsing ≠ reachable before boarding. | **COMPLETE** (G-X3) |
| **B — Distance & walking time** | Credible indoor distance policy; labeled directed edges. | No unlabeled matrix minutes; metadata on legacy **D→D=3** demo model. | **Metadata slice COMPLETE** (GW-B-002 @ `6a847b8`); **verified graph / new minutes HOLD** |
| **C — Product usability** | Polish expanded-airport UX after X (+ B copy where relevant). | Clear scope, limitations, and actions on enriched coverage. | **NEXT** (authorize GW-C-001+ individually) |
| **D — GW-E two-stop planner** | Two-stop module + **My Plan** after **G-Data**. | §4 E semantics unchanged; not indoor navigation. | **HOLD** (**G-Data** / **G-E**) |

### Phase X tasks (summary — authorize individually)

| ID | Type | Summary |
| --- | --- | --- |
| **GW-X-R001** | Research | Official SFO terminal, boarding area, gate, security-access, and facility data sources |
| **GW-X-R002** | Research | Location & facility matrix: IDs, relationships, confidence, coverage gaps |
| **GW-X-001** | Implement | Data model migration (airport/terminal/boarding area/gate/facility); **legacy D Gates behavior preserved** |
| **GW-X-002** | Implement | Staged dataset expansion (verified rows only) |
| **GW-X-003** | Implement | Multi-terminal directory UI, filters, location labels, limitations |
| **GW-X-004** | Implement | Integration & regression (602+ tests, D Gates smoke, recommend safety) |

### Approval gates (post–Phase A)

| Gate | Entry criteria | Unlocks |
| --- | --- | --- |
| **G-X0** | GW-X-R001 + GW-X-R002 accepted; migration & eligibility design reviewed | **GW-X-001** |
| **G-X1** | Schema + validators + legacy **12** D records unchanged in recommend path; migration doc | **GW-X-002** (staged batches) |
| **G-X2** | Agreed dataset milestone + provenance for new rows; no invented fields | **GW-X-003** |
| **G-X3** | GW-X-004 regression green on preview; browse vs recommend rules documented | **GW-B-R001**, further **GW-X-002** batches |
| **G-B0** | GW-B-R001 + GW-B-001 policy approved | **GW-B-002** |
| **G-B1 (scoped legacy metadata)** | **APPROVED 2026-10-25** — GW-B-002 @ `6a847b8`: labeled legacy **D→D=3** demo, per-edge metadata, `legacy-d-v1` manifest; **12** recommend IDs unchanged | Phase C tasks (per-task authorization) |
| **G-B1 (graph / new matrix minutes)** | **HOLD** | Physical routing pilot |
| **G-Data** | **HOLD** — **G-X3** met; scoped legacy **G-B1** met; **G-C0** and full graph **G-B1** not met | **G-E** |
| **G-C0** | Expanded-airport UX smoke + a11y on preview | **G-E** re-authorization |
| **G-E** | **G-F3** shipped (done) + **G-Data** | **GW-E1** / **GW-E2** |

### Backward compatibility & migration (Phase X)

1. **Dataset:** Existing **12** facility IDs, `zone: "D"`, and enriched Phase A fields remain valid; validators accept legacy rows without new terminal fields until migration adds optional/required rules per **G-X1** spec.
2. **Recommendation:** `recommendFacilities` continues to use the **production travel matrix** and **post-eligible** facilities in the **authorized recommend scope** (initially unchanged D Gates model) until a **separate approved task** widens eligibility edges — multi-terminal **browse** must not imply recommend feasibility.
3. **Staged expansion:** GW-X-002 adds facilities in **batches** (e.g. per terminal or boarding area) with `sourceUrl`, `lastCheckedAt`, and confidence; gaps stay **unknown**, not synthetic.
4. **Connectivity:** No assumption that airside passengers can cross terminals or pre/post security without explicit sourced evidence per facility row.
5. **Rollback:** Revert dataset commits per batch; UI falls back to D-only directory; types remain backward compatible where possible.

### Data sources — known constraints (unchanged; see GW-A-R001)

Documented in `docs/data-provenance.md` and `docs/GW-A-R001-sfo-source-api-audit.md`. Phase X research (**GW-X-R001**) must re-validate before any API or scrape automation.

### Scope boundaries (ongoing)

- **SFO only** until lead authorizes another airport; no multi-airport in Phase X without new plan revision.
- No auth, database, live flights, payments, or production indoor turn-by-turn navigation.
- Do not invent facilities, hours, queues, or walking minutes.
- New ideas → `BACKLOG.md`; contract changes → lead approval + `PLAN.md` / `AGENTS.md` update.
