# GateWise — HackPSU Fall 2026 Final Implementation Plan

**Status:** Approved product baseline **v1.4 (post-submission)** — HackPSU P0/P1, **GW-F1–F3**, Level 2 multipage UX, and security hardening **shipped** on production `main` @ `b0b58c6` (see §11–§12). **Active development** is data-first (Phase A–C) before **GW-E** (§12).  
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

## 12. Post-submission roadmap (data-first → GW-E)

**Mission after Devpost:** Make GateWise useful with **real, labeled airport information** for the existing **SFO Terminal 2 D Gates** scope — not more visual polish or speculative features without data backing.

**Active task breakdown:** `docs/IMPLEMENTATION_PLAN.md` (Phase A–D). **Current priority order:** `docs/REMAINING_ROADMAP.md`.

| Phase | Goal | Outcome |
| --- | --- | --- |
| **A — Verified airport data** | Enrich the shipped **12** facilities with official hours, amenity facts, finer location text, source URLs, and `lastCheckedAt` — without inventing fields SFO does not publish. | Travelers see **what is officially known** vs **unknown**; dataset validation stays strict. |
| **B — Distance & walking time** | Research credible indoor routing; define how verified, estimated, and unknown directed travel minutes are stored and labeled. | Replace silent demo assumptions only where evidence exists; matrix edges remain **directed** and non-symmetric. |
| **C — Real-world usability** | Present enriched data in facility detail, hours, discovery, and recommendations copy. | First-time users understand scope, limits, and how to act on a recommendation. |
| **D — GW-E two-stop planner** | Implement approved two-stop time-budget module + UI on **My Plan** after A–C foundations. | Same engine rules as §4 E; not indoor navigation or live routing. |

### Approval gates (post-submission)

| Gate | Entry criteria | Lead decision |
| --- | --- | --- |
| **G-A0** | GW-A-R001 research report accepted; enrichment schema does not break validation or recommendation safety | Authorize **GW-A-001** implementation tasks |
| **G-A1** | Enriched `facilities.json` + validators green; provenance doc updated | Authorize **GW-B-R001** / Phase B design |
| **G-B0** | Walking-time policy written (verified / demo_estimate / unknown); no unlabeled measurements | Authorize matrix or edge-model changes (**GW-B-001+**) |
| **G-B1** | Any new travel minutes labeled and tested; P0 hero margins unchanged unless explicitly re-baselined | Authorize Phase C UX tasks |
| **G-C0** | Production-preview UX for hours/detail/discovery passes smoke + accessibility check | Re-authorize **G-E** for **GW-E** |
| **G-E** | **G-F3** shipped (done) + **G-Data** (**G-C0** and **G-B1**) | Authorize **GW-E1** / **GW-E2** |

### Data sources — known constraints (2026-10-24 research)

Documented in `docs/data-provenance.md`. Unless separately verified:

- **No** official SFO public API for live facility hours, queue times, or indoor turn-by-turn routing in this project scope.
- **Yes** official HTML listings on flysfo.com (Shop/Dine/Relax, per-facility pages, filtered directory); hours may be static text or badges — **not** guaranteed real-time.
- **No** production use of third-party indoor maps without explicit lead approval and licensing review.
- Restrooms/charging at gate-level precision remain **research gaps**; do not fabricate POIs to fill categories.

### Scope freeze (post-submission)

- Stay on **one terminal** (T2 D Gates) until the human Engineering Lead authorizes expansion.
- Do not add auth, database, live flights, payments, or multi-airport coverage.
- New ideas → `BACKLOG.md`; contract changes → lead approval + `PLAN.md` / `AGENTS.md` update.
