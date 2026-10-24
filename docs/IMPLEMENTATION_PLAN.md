# GateWise P0 (B + C) Implementation Plan

> **For agentic workers:** Execute **one task ID at a time** only after the human Engineering Lead authorizes it. Do not run `executing-plans` or `subagent-driven-development` unless the lead explicitly approves. After each task, post the GATEWISE STATUS report from `AGENTS.md` and stop.

**Goal:** Ship a deployed HackPSU MVP where a judge can enter SFO gate context, see boarding-aware facility recommendations (B), and run a what-if comparison using the same pure engine (C), with verified vs demo-estimate labels and no false safety claims.

**Architecture:** Local Next.js App Router UI (lead) calls pure TypeScript utilities for filter/validate (teammate) and a single `recommendFacilities` engine (lead). Data splits into `travel-times.ts`, `facilities.json`, and runtime `UserContext`. What-if re-invokes the same function with baseline vs adjusted inputs.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, local JSON/TS data, Vitest (or project test runner), GitHub, Vercel.

## Global Constraints

- P0 only: one verified SFO terminal scope; 10–20 facilities with sources where possible; never invent airport facts.
- `minutesUntilBoarding` = minutes until **boarding starts**, not gate closure.
- No auth, database, payments, boarding-pass scanner, live flight feeds, multi-airport coverage, or production indoor navigation.
- Unverified walks, queues, and activity times labeled **demo estimates**; never imply a recommendation guarantees catching a flight.
- Recommendation thresholds: margin ≥ 10 → `feasible_in_model`; 0–9 → `tight_in_model`; &lt; 0 → `over_budget`; missing essentials → `unknown` (never zero-fill unknown durations).
- Required minutes = directed outbound + directed return + queue + activity + safety buffer (directed matrix; do not assume symmetry).
- P1 stretch **E** (two-stop planner): **optional** only after **GW-F3** acceptance (**G-F3**), prior B+C deploy/tests, and human lead **G-E** authorization. Post-hackathon, E must not start before F-track integration. Revert E if it threatens submission or F3 regression.
- File ownership per `AGENTS.md` is binding; cross-owner edits require lead-mediated handoff.
- Branches: lead `feature/core-app`, teammate `feature/data-utils`; lead merges `main` and deploys.

---

## How to use this document

| Field | Meaning |
| --- | --- |
| **Owner** | `Lead` = Engineering Lead (Cursor + own Codex). `Teammate` = data/utilities/QA Codex. |
| **Depends on** | Task IDs that must be DONE and merged (or contracts pushed) before starting. |
| **Tests** | Commands and/or test files the owner must run before reporting DONE. |
| **Acceptance** | Objective checks; lead verifies at integration gates. |
| **Integration** | Where this task meets the other track or `page.tsx`. |

**Task authorization:** Lead assigns a single Task ID → agent confirms deliverable, files, deps, acceptance → implements only that task → GATEWISE STATUS → **Lead approval** before next task.

**Progress sync (required):** Sat **17:00**, **20:00**, **22:00**, **23:00** ET — both sides post GATEWISE STATUS; lead decides cuts/reprioritization. Do not start new tasks during sync unless lead assigns.

---

## Approval gates (human Engineering Lead)

| Gate ID | When (ET) | Entry criteria | Lead decision |
| --- | --- | --- | --- |
| **G0** | Before first code task | `PLAN.md` + `AGENTS.md` agreed; branches exist | Authorize **GW-000** (Lead) and **GW-003** (Teammate) **in parallel**; then **GW-001** after GW-000 merges |
| **G1** | Sat **17:00** | GW-001–GW-012 acceptance met (see Milestone M1) | Merge integration PR; authorize 17:00–20:00 tasks or cut scope |
| **G2** | Sat **20:00** | GW-013–GW-018 acceptance met (see M2) | Authorize what-if + QA tasks or drop extras |
| **G3** | Sat **22:00** | B+C demo path works locally (see M3) | Authorize deploy (**GW-020**); **do not authorize E here**. If B+C incomplete, **cancel E** for the hackathon |
| **G4** | Sat **23:00** | Live Vercel URL + mobile smoke (see M4) | Freeze new P0 pages; Sunday regression only |
| **G5** | Sun ~09:00–10:00 | Regression + README (see M5) | Feature freeze for submission |
| **G6** | Sun **12:00** | Devpost initial submission | Verify submission; **E is disallowed** if it competes with GW-022 / GW-023 |
| **G-E** | After **G4** (and only if submission timeline is safe) | GW-020 deploy DONE; GW-012 (key tests) PASS; GW-019 demo readiness confirmed | Human lead **explicitly** authorizes **GW-E1** or keeps E cancelled |

---

## Milestone map (Eastern Time)

| Window | Milestone | P0 deliverable | Stop rule |
| --- | --- | --- | --- |
| Sat 14:00–17:00 | **M1 @ 17:00** | Supported terminal/zone chosen; `facilities.json` + filter utility; lead flight-context UI + browsable facility list (filter wired) | Do not add another airport |
| Sat 17:00–20:00 | **M2 @ 20:00** | `recommendFacilities` + ranked cards with breakdown; teammate validation utilities + independent unit tests | Drop non-core UI if engine fails |
| Sat 20:00–22:00 | **M3 @ 22:00** | What-if baseline vs changed + numeric explanation; teammate regression QA on hero scenario | **If B+C incomplete, cancel E** |
| Sat 22:00–23:00 | **M4 @ 23:00** | First production deploy + mobile smoke | Stop adding P0 pages |
| Sun 07:00–12:00 | **M5** | Regression, demo script, recording, Devpost | E only after **G-E** (deploy + tests + demo ready + lead approval); submission always wins |

**Hero demo (acceptance reference):** Gate zone D, 50 min until boarding, example facility zone E: outbound 7 + return 7 + queue 8 + activity 10 + buffer 10 = 42 required → margin +8 `tight_in_model`. At 35 min → margin −7 `over_budget`. Queue +7 decreases margin by exactly 7.

---

## Target file map (P0)

| Path | Owner | Responsibility |
| --- | --- | --- |
| `src/types/airport.ts` | Lead | Shared types, `Recommendation`, utility I/O contracts |
| `src/data/travel-times.ts` | Lead | Directed demo matrix + labels |
| `src/data/facilities.json` | Teammate | Sourced facility records |
| `src/lib/recommend.ts` | Lead | `recommendFacilities` |
| `src/lib/recommend.test.ts` | Teammate | Independent engine tests |
| `src/lib/filter-facilities.ts` | Teammate | Pure list filter |
| `src/lib/filter-facilities.test.ts` | Teammate | Filter tests |
| `src/lib/validate-facilities.ts` | Teammate | Dataset validation |
| `src/lib/validate-facilities.test.ts` | Teammate | Validation tests |
| `src/lib/validate-context.ts` | Teammate | User context validation |
| `src/lib/validate-context.test.ts` | Teammate | Context tests |
| `src/components/AmenityCard.tsx` | Lead | Recommendation card UI |
| `src/components/AmenityFilter.tsx` | Lead | Category/zone/search UI |
| `src/components/AmenityDetail.tsx` | Lead | Source/confidence detail |
| `src/components/WhatIfSimulator.tsx` | Lead | Baseline vs what-if UI |
| `src/app/page.tsx` | Lead | Integration shell |
| `src/app/globals.css`, `tailwind.config.ts` | Lead | Design tokens / theme |
| `docs/DEMO_SCRIPT.md` | Teammate | Judge walkthrough |
| `docs/data-provenance.md` | Teammate | URLs, checked dates, scope notes |
| `src/data/fixtures/demo-facilities.ts` | Lead | Typed UI fixtures until teammate data is wired (GW-009) |

---

## Phase 0 — Repository bootstrap (Sat 14:00+)

**Parallel track:** Teammate **GW-003** may start at **G0** alongside Lead **GW-000**; GW-003 does not wait for the Next.js scaffold.

### GW-000: Next.js app scaffold

**Owner:** Lead  
**Depends on:** G0  
**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx` (placeholder), `.eslintrc` or eslint config per template, `vitest.config.ts` (if using Vitest)
- Modify: `README.md` (setup/run commands)

**Tests:** `npm install` → `npm run lint` → `npx tsc --noEmit` → `npm run build` (after scripts exist)  
**Acceptance:** App builds; `page.tsx` renders placeholder; test runner configured for `src/lib/**/*.test.ts`.  
**Integration:** Teammate **GW-003** proceeds in parallel (docs only). Teammate branches for JSON/utilities after GW-000 merges to `main`.  
**Lead gate:** Merge to `main` before **GW-001**.

---

## Phase 1 — Contracts & design (Sat 14:00–~14:30; GW-003 may overlap GW-000)

### GW-001: Shared types and utility contracts

**Owner:** Lead  
**Depends on:** GW-000 merged; **GW-003 draft** (may be in progress—freeze waits on review below)  
**Files:**
- Create: `src/types/airport.ts`

**Interfaces (must export):**
- Types: `Zone`, `DataConfidence`, `TravelMatrix`, `Facility`, `UserContext`, `RecommendationStatus`, `Recommendation` (include numeric breakdown fields, exclusion/unknown reasons, confidence fields for UI badges).
- Document in file comments: `minutesUntilBoarding` semantics; same-zone travel rule from `PLAN.md` §3.
- Export function signatures (implementations come in later tasks):
  - `recommendFacilities(context, facilities, travelTimes): Recommendation[]`
  - `filterFacilities(facilities, query): Facility[]` (exact filter shape defined here)
  - `validateFacilities(raw): { facilities: Facility[]; errors: ... }`
  - `validateContext(input): { context: UserContext | null; errors: ... }`

**Tests:** `npx tsc --noEmit`  
**Acceptance:** Teammate can implement utilities without inventing types. **Before contract freeze:** incorporate verified terminal/gate-area findings from **GW-003** into `Zone` / scope exports and comments, **or** if GW-003 is incomplete at freeze time, label every zone and terminal string as **provisional demo-only** (e.g. `locationConfidence: 'demo_estimate'` on scope constants, file-header comment that zones are illustrative until provenance merges). Never present unverified zones as official SFO facts.  
**Integration:** Push/merge immediately after freeze rule above; teammate **GW-004**–**GW-008** depend on this.  
**Lead gate:** Lead reviews GW-003 draft (or documents provisional demo zones), then announces contract freeze; only lead may change contracts afterward (teammate requests via handoff).

### GW-002: UI design system (UI UX Pro Max)

**Owner:** Lead  
**Depends on:** GW-000  
**Skill:** Read and apply `ui-ux-pro-max` (palette, typography, spacing, status colors, mobile-first).  
**Files:**
- Modify: `tailwind.config.ts`, `src/app/globals.css`
- Create: `docs/ui-design-system.md` (tokens, status badge colors for `feasible_in_model` / `tight_in_model` / `over_budget` / `unknown`, estimate vs verified badge styles, focus states)

**Tests:** Visual check in dev server; `npm run build`  
**Acceptance:** Documented tokens for cards, filters, and what-if panels; accessible contrast for status chips; no new product features.  
**Integration:** **GW-008**, **GW-013**, **GW-016** consume these classes.  
**Lead gate:** Lead approves visual direction before heavy component work (**GW-013**).

### GW-003: SFO scope & provenance research

**Owner:** Teammate  
**Depends on:** **G0 only** — **explicitly allowed in parallel with GW-000** (and may overlap GW-001 until lead freezes contracts)  
**Files:**
- Create: `docs/data-provenance.md`

**Tests:** Manual review of URLs and dates  
**Acceptance:** One supported terminal/gate-area story documented; no claim that D/E/F are all verified without sources; list of candidate facilities with source URLs.  
**Integration:** Feeds **GW-001** (zone/scope finalization or provisional demo labeling) and **GW-004**; lead updates `src/types/airport.ts` only in **GW-001** (not via teammate edits).

---

## Phase 2 — Toward M1 (Sat ~14:30–17:00)

### GW-004: Facility dataset

**Owner:** Teammate  
**Depends on:** GW-001 merged, GW-003 draft  
**Files:**
- Create: `src/data/facilities.json`

**Tests:** Run `validateFacilities` once **GW-007** exists; until then, JSON schema self-check against `Facility` type via `npx tsc` import or temporary script (teammate documents command in status).  
**Acceptance:** 10–20 entries; each verified field has `sourceUrl` + `lastCheckedAt`; queue/activity unknowns are `null`, not `0`; `locationConfidence` / `timeConfidence` set per field.  
**Integration:** Loaded by lead in `page.tsx`; validated before render.

### GW-005: Directed travel matrix

**Owner:** Lead  
**Depends on:** GW-001  
**Files:**
- Create: `src/data/travel-times.ts`

**Tests:** `npx tsc --noEmit`  
**Acceptance:** `TravelMatrix` exported; values labeled demo assumption in comments; supports hero scenario zones (D↔E = 7 per plan illustrative matrix unless audit changes scope).  
**Integration:** Passed to `recommendFacilities` in **GW-011** and UI in **GW-014**.

### GW-006: Filter facilities (pure)

**Owner:** Teammate  
**Depends on:** GW-001  
**Files:**
- Create: `src/lib/filter-facilities.ts`, `src/lib/filter-facilities.test.ts`

**Tests:** `npm test -- src/lib/filter-facilities.test.ts`  
**Acceptance:** Category, zone, and text search; no React imports; deterministic ordering documented.  
**Integration:** Lead wires in **GW-010** via `AmenityFilter` + `page.tsx`.

### GW-007: Validate facilities (pure)

**Owner:** Teammate  
**Depends on:** GW-001  
**Files:**
- Create: `src/lib/validate-facilities.ts`, `src/lib/validate-facilities.test.ts`

**Tests:** `npm test -- src/lib/validate-facilities.test.ts`  
**Acceptance:** Rejects invalid ids/zones/categories; normalizes safe fields; reports errors for UI.  
**Integration:** Lead calls on load in **GW-010**; blocks bad dataset from silent render.

### GW-008: Validate context (pure)

**Owner:** Teammate  
**Depends on:** GW-001  
**Files:**
- Create: `src/lib/validate-context.ts`, `src/lib/validate-context.test.ts`

**Tests:** `npm test -- src/lib/validate-context.test.ts`  
**Acceptance:** Validates gate zone, minutes ≥ 0, buffer default, optional category; clear error messages.  
**Integration:** Flight context form shell in **GW-009**; teammate validators wired in **GW-010**.

### GW-009: Flight context + facility browse UI shell (fixtures only)

**Owner:** Lead  
**Depends on:** GW-002, GW-001 only (**independent of teammate utility PRs**)  
**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/AmenityFilter.tsx` (controls only), minimal list row or stub card for browse
- Create: `src/data/fixtures/demo-facilities.ts` (and optional `demo-context.ts`) — typed `Facility[]` / defaults matching **GW-001** contracts

**Tests:** Manual: change zone/minutes/buffer/category → list updates using **in-page fixture filter** or direct `filterFacilities` stub import is **not** required; client-side filter on fixtures is acceptable until **GW-010**. Invalid-input UI may use local validation placeholders.  
**Acceptance:** M1 judge path (a)(b) **UI shell**: terminal/zone, minutes until boarding, optional category/buffer; browsable facility list from **fixtures** only. Does **not** call `recommendFacilities`. Does **not** require `facilities.json` or teammate validators to be merged.  
**Integration:** **GW-010** replaces fixtures with `validateFacilities` + `filterFacilities` + `validateContext` and live **GW-004** data.

### GW-010: M1 integration merge (utilities + dataset)

**Owner:** Lead (merge); Teammate (PR review support)  
**Depends on:** GW-004, GW-006, GW-007, GW-008, GW-009  
**Files:**
- Modify: `src/app/page.tsx` (wire imports; remove or bypass fixture-only path), `src/components/AmenityFilter.tsx` as needed
- Modify: `src/data/fixtures/demo-facilities.ts` — keep for Storybook/dev fallback only if lead chooses; production path uses validated JSON

**Tests:** `npm run lint`, `npx tsc --noEmit`, `npm test` (all teammate tests), manual browse flow  
**Acceptance:** **M1 / G1:** dataset + filter + context form usable end-to-end; invalid input shows errors from `validateContext`; facility list reflects `filterFacilities` on validated data.  
**Lead gate:** **G1** — explicit go for recommendation work (**GW-011**+).

---

## Phase 3 — Toward M2 (Sat 17:00–20:00)

### GW-011: Recommendation engine

**Owner:** Lead  
**Depends on:** G1, GW-001, GW-005  
**Files:**
- Create: `src/lib/recommend.ts`

**Tests:** Teammate tests in **GW-012** (lead runs locally while pairing on failures)  
**Acceptance:** Implements `PLAN.md` §4–5: directed legs, thresholds, ranking, unknown handling, security-zone exclusions with reasons, breakdown on each `Recommendation`.  
**Integration:** Single function used later by **GW-016** (what-if calls twice).

### GW-012: Recommendation unit tests (independent expectations)

**Owner:** Teammate  
**Depends on:** GW-001, GW-011 implemented enough for red/green  
**Files:**
- Create: `src/lib/recommend.test.ts`

**Tests:** `npm test -- src/lib/recommend.test.ts`  
**Acceptance:** All checks from `PLAN.md` §5:
- 50 min / 42 req → +8 `tight_in_model`
- 35 min / 42 req → −7 `over_budget`
- 52 min / 42 req → +10 `feasible_in_model`
- Queue +7 → margin −7
- Less time never improves classification
- Missing matrix/queue/activity → `unknown`
- Security/terminal constraints exclude or ineligible
- Non-symmetric matrix outbound vs return

**Integration:** If fail, lead fixes `recommend.ts` only; teammate does not patch engine.

### GW-013: Amenity card + detail components

**Owner:** Lead  
**Depends on:** GW-002, GW-001, GW-011  
**Files:**
- Create: `src/components/AmenityCard.tsx`, `src/components/AmenityDetail.tsx`

**Tests:** Manual + `npm run build`  
**Acceptance:** Status chip, margin, full minute breakdown, verified vs demo badges, no “guaranteed safe” copy.  
**Integration:** Rendered from `page.tsx` in **GW-014**.

### GW-014: Ranked recommendations on page

**Owner:** Lead  
**Depends on:** GW-011, GW-013, GW-010  
**Files:**
- Modify: `src/app/page.tsx`

**Tests:** Hero scenario manual; `npm run build`  
**Acceptance:** **M2 partial:** judge path (c) — facilities sorted per engine rules with labels.  
**Integration:** `recommendFacilities(validatedContext, validatedFacilities, travelTimes)`.

### GW-015: Terminal zone schematic (simple)

**Owner:** Lead  
**Depends on:** GW-002  
**Files:**
- Create: `src/components/TerminalSchematic.tsx` (or section in `page.tsx` if tiny)
- Modify: `src/app/page.tsx`

**Tests:** Manual mobile layout  
**Acceptance:** Simple zone overview; disclaimer: not precise indoor navigation.  
**Integration:** Optional highlight of gate zone vs facility zone.

### GW-016: M2 integration & empty states

**Owner:** Lead  
**Depends on:** GW-012 passing, GW-014  
**Files:**
- Modify: `src/app/page.tsx`, components as needed for empty/invalid states

**Tests:** `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`  
**Acceptance:** **M2 / G2:** recommendations + validation + tests green; detail/empty states per `PLAN.md` §6.  
**Lead gate:** **G2** — authorize what-if (**GW-017**).

---

## Phase 4 — Toward M3 (Sat 20:00–22:00)

### GW-017: What-if simulator (feature C)

**Owner:** Lead  
**Depends on:** G2, GW-011  
**Files:**
- Create: `src/components/WhatIfSimulator.tsx`
- Modify: `src/app/page.tsx`

**Tests:** Manual hero: 50 → 35 minutes shows status/margin change with numeric reason; queue adjustment −7 margin.  
**Acceptance:** Same `recommendFacilities` for baseline and hypothetical; side-by-side or clear before/after; explains which input changed (`minutesUntilBoarding`, `queueAdjustmentMinutes`, etc.). No second algorithm.  
**Integration:** Judge paths (d)(e) from `PLAN.md` §2.

### GW-018: Regression QA + demo script draft

**Owner:** Teammate  
**Depends on:** GW-017 on branch or staging  
**Files:**
- Create: `docs/DEMO_SCRIPT.md`
- Optional: `docs/qa-report-YYYY-MM-DD.md`

**Tests:** `npm test`, `npm run build`; manual script walkthrough  
**Acceptance:** Script covers hero demo with “simulated inputs” language; QA notes for any UI issues (lead fixes UI).  
**Integration:** Feeds Sunday recording; lead owns UI fixes.

### GW-019: M3 verification

**Owner:** Lead (with teammate QA)  
**Depends on:** GW-017, GW-018  
**Tests:** Full B+C path on desktop + mobile viewport  
**Acceptance:** **M3 / G3:** B+C complete locally.  
**Lead gate:** **G3** — confirm B+C locally; **authorize GW-020**; **E remains cancelled until G-E** (post-deploy).

---

## Phase 5 — Toward M4 (Sat 22:00–23:00)

### GW-020: Production deploy

**Owner:** Lead  
**Depends on:** G3, GW-019  
**Files:**
- Modify: `README.md` (live URL, limitations), Vercel project settings (dashboard, not committed secrets)

**Tests:** Incognito load; phone smoke; core flow B+C  
**Acceptance:** **M4 / G4:** working live URL; mobile-usable.  
**Lead gate:** **G4** — freeze new P0 pages.

### GW-021: README & submission prep

**Owner:** Lead (README); Teammate (Devpost draft in docs)  
**Depends on:** GW-020  
**Files:**
- Modify: `README.md`
- Create: `docs/devpost-draft.md` (teammate)

**Acceptance:** Source/limitations/setup documented per `PLAN.md` §9.

---

## Phase 6 — Sunday (M5, submission)

### GW-022: Full regression

**Owner:** Teammate (execute); Lead (fix failures in owned files)  
**Depends on:** G4  
**Tests:** `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, deployed smoke  
**Acceptance:** No material TS/build/runtime errors; hero demo still passes.

### GW-023: Demo recording & Devpost

**Owner:** Teammate (script, recording support); Lead (final URL check)  
**Depends on:** GW-022  
**Files:** `docs/DEMO_SCRIPT.md`, Devpost (external)  
**Acceptance:** ≤5 min recording; initial submission before **Sun 12:00 ET** (**G6**).

---

## Optional P1 — Stretch E (two-stop planner)

**Preconditions (all required — no exceptions):**

1. **B+C deployed** — **GW-020** DONE and live URL verified (**G4** passed).  
2. **Key tests pass** — at minimum **GW-012** / `npm test` for recommendation + utility suites green.  
3. **Demo readiness** — **GW-019** acceptance met (hero path on deployed or staging URL per lead).  
4. **Human Engineering Lead** explicitly authorizes **G-E** and task **GW-E1**.  
5. **Sunday submission safe** — GW-022 / GW-023 / **G6** are not at risk; if E work would delay regression, recording, or Devpost, **do not start E** or revert E immediately.

**G3 does not approve E.** At **22:00 ET**, if B+C is incomplete, **cancel E** for the event. **G-E** is the only authorization gate for stretch work.

### GW-E1: Two-stop engine extension

**Owner:** Lead  
**Depends on:** **G-E** (all preconditions above)  
**Files:**
- Modify: `src/lib/recommend.ts` (or add `src/lib/recommend-two-stop.ts` only if lead keeps single-file policy — prefer extending with clearly named exports)
- Modify: `src/types/airport.ts` if new types required

**Tests:** Teammate adds cases to `src/lib/recommend.test.ts` or `src/lib/recommend-two-stop.test.ts` via handoff agreement  
**Acceptance:** `PLAN.md` §4 E rules: both orders, one buffer, distinct facilities, unknown edges handled.

### GW-E2: Minimal UI for two-stop (only if time)

**Owner:** Lead  
**Depends on:** GW-E1  
**Files:** `src/app/page.tsx` and/or small component  
**Acceptance:** Clearly labeled stretch demo; revert if destabilizes P0.

**Stop rule:** If E slips, breaks deploy, or threatens **G6** submission, delete/disable E and preserve B+C live flow. **Sunday:** default to **no E** unless lead confirms spare time after **GW-022**.

---

## Status reporting (required after every task)

Post to the human Engineering Lead using the template in `AGENTS.md`:

```text
GATEWISE STATUS — [Engineering Lead Cursor / Engineering Support Codex / Teammate Codex]
Task ID / objective:
Status: DONE | PARTIAL | BLOCKED
Files changed:
Behavior delivered / verified data sources:
Tests and commands actually run: [command → PASS/FAIL/NOT RUN]
Git branch / commit / push state:
Dependencies needed from other owner:
Blockers, known limitations, integration risks:
Recommended next task (proposal only):
Decision needed from human Engineering Lead:
```

---

## Task index (quick reference)

| ID | Owner | Milestone | Summary |
| --- | --- | --- | --- |
| GW-000 | Lead | Pre-M1 | Next.js scaffold |
| GW-001 | Lead | Pre-M1 | Types & contracts |
| GW-002 | Lead | Pre-M1 | UI UX Pro Max design system |
| GW-003 | Teammate | Pre-M1 | SFO provenance doc |
| GW-004 | Teammate | M1 | facilities.json |
| GW-005 | Lead | M1 | travel-times.ts |
| GW-006 | Teammate | M1 | filter-facilities |
| GW-007 | Teammate | M1 | validate-facilities |
| GW-008 | Teammate | M1 | validate-context |
| GW-009 | Lead | M1 | Context + browse UI (fixtures) |
| GW-010 | Lead | **G1** | M1 utility + data integration |
| GW-011 | Lead | M2 | recommend.ts |
| GW-012 | Teammate | M2 | recommend.test.ts |
| GW-013 | Lead | M2 | AmenityCard + Detail |
| GW-014 | Lead | M2 | Ranked list integration |
| GW-015 | Lead | M2 | Terminal schematic |
| GW-016 | Lead | **G2** | M2 hardening |
| GW-017 | Lead | M3 | WhatIfSimulator |
| GW-018 | Teammate | M3 | QA + DEMO_SCRIPT |
| GW-019 | Lead | **G3** | B+C sign-off |
| GW-020 | Lead | **G4** | Vercel deploy |
| GW-021 | Both | M4 | README / Devpost draft |
| GW-022 | Teammate | M5 | Regression |
| GW-023 | Teammate | **G6** | Recording + submit |
| GW-E1 | Lead | P1 (after **G-E**) | Two-stop engine |
| GW-E2 | Lead | P1 (after **G-E**) | Two-stop UI (optional) |

---

## Plan self-review (completed)

1. **Spec coverage:** P0 B (`recommendFacilities`, cards, context), P0 C (`WhatIfSimulator`, same function), data contracts, tests §5, screens §6, milestones §8, ownership §7 — mapped to GW-* tasks. E isolated behind **G-E** (post-deploy), not G3.
2. **Placeholder scan:** No TBD tasks; each task lists files and acceptance.
3. **Type consistency:** Contracts centralized in GW-001; utilities and engine reference those exports only.

---

---

## Post-MVP — GW-F track (F1 → F2 → F3 → GW-E)

**Contract:** `docs/GW-F-CONTRACT.md` (APIs, precedence, countdown semantics, What-if rules).  
**Baseline:** `main` @ `665e5e8`, https://gate-wise-iota.vercel.app  
**Do not start GW-E** until **G-F3** passed and human lead issues **G-E** (replaces hackathon-only “after G4” timing for new work).

### Approval gates (GW-F)

| Gate | Entry criteria | Lead decision |
| --- | --- | --- |
| **G-F0** | Human lead **approves** shared contract on branch `feature/gw-f-contracts` (**no** required `main` merge or Vercel deploy) | Authorize Support **GW-F1-001** / **GW-F2-001**; all GW-F branches **base from** approved `feature/gw-f-contracts` |
| **G-F1** | F1 modules + tests green on feature branch | Authorize lead integration subtasks or **GW-F2** if not started |
| **G-F2** | F2 module + tests green | Authorize **GW-F3** |
| **G-F3** | F1+F2 wired; `npm test`, `tsc`, `lint`, `build`; production smoke | Authorize **G-E** / **GW-E1** or defer E |
| **G-E** | **G-F3** done; submission timeline safe | Authorize **GW-E1** (unchanged E rules in optional P1 section) |

### GW-F1-001: Duration override resolution (pure)

**Owner:** Engineering Support Codex  
**Depends on:** **G-F0**  
**Files:**
- Create: `src/lib/validate-duration-overrides.ts`, `src/lib/validate-duration-overrides.test.ts`
- Create: `src/lib/resolve-facility-durations.ts`, `src/lib/resolve-facility-durations.test.ts`

**Tests:** `npm test -- resolve-facility-durations validate-duration-overrides`  
**Acceptance:** `docs/GW-F-CONTRACT.md` §3 precedence, partial overrides, validation errors, queue adjustment interaction documented in tests.  
**Integration:** Lead consumes in **GW-F3-001**; types added to `airport.ts` at integration only.

### GW-F1-002: Contract review handoff (optional)

**Owner:** Lead  
**Depends on:** GW-F1-001 pushed  
**Acceptance:** Lead confirms APIs match contract or requests revision via handoff (no UI).

### GW-F2-001: Boarding countdown utilities (pure)

**Owner:** Engineering Support Codex  
**Depends on:** **G-F0** (may parallel **GW-F1-001** after contract branch approval)  
**Files:**
- Create: `src/lib/boarding-countdown.ts`, `src/lib/boarding-countdown.test.ts`

**Tests:** `npm test -- boarding-countdown`  
**Acceptance:** §4 rounding (floor minutes), past → 0, pause/resume/clear, invalid input codes.  
**Integration:** Lead UI timer in **GW-F3-002**.

### GW-F3-001: Engine integration — resolved durations

**Owner:** Lead  
**Depends on:** **G-F1**, GW-F1-001 merged or cherry-picked  
**Files:** `src/types/airport.ts` (new types), new `recommendFacilitiesWithPersonalization` wrapper ( **`recommendFacilities` signature unchanged** per D-F4), `GateWiseHome.tsx` / recommendation path  
**Tests:** `npm test`, `recommend.test.ts` green; new integration tests as needed  
**Acceptance:** Overrides never mutate `facilities.json`; schematic badges unchanged; demo/user/official precedence per contract; overrides in React state only (D-F1).

### GW-F3-002: Countdown UI + context wiring

**Owner:** Lead  
**Depends on:** **G-F2**, GW-F2-001  
**Files:** `GateWiseHome.tsx`, context validation integration, cleanup on unmount  
**Tests:** Manual + unit hooks; `validateContext` paths for invalid countdown  
**Acceptance:** Device-clock copy; pause/resume/clear; no live-flight claims; boarding start within 24h (D-F2); What-if scenario minutes fixed while baseline may use countdown — labeled in UI (D-F3).

### GW-F3-003: What-if + regression gate

**Owner:** Lead (execute); Teammate optional QA report  
**Depends on:** GW-F3-001, GW-F3-002  
**Tests:** `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`; production smoke checklist (GW-022 R01–R10 subset + F scenarios)  
**Acceptance:** **G-F3** — What-if rules §5.2; hero demo margins unchanged with defaults; GW-015 schematic intact.

### GW-E (unchanged scope, updated precondition)

**Precondition addendum:** **G-F3** passed in addition to prior deploy/test/demo rules when starting E after GW-F track.

---

## Task index supplement (GW-F)

| ID | Owner | Gate | Summary |
| --- | --- | --- | --- |
| GW-F1-001 | Support Codex | G-F0 | Override validate + resolve modules |
| GW-F1-002 | Lead | G-F1 | API handoff review |
| GW-F2-001 | Support Codex | G-F0 | Boarding countdown pure lib |
| GW-F3-001 | Lead | G-F1 | Recommend integration |
| GW-F3-002 | Lead | G-F2 | Countdown UI |
| GW-F3-003 | Lead + optional Teammate | **G-F3** | Regression + What-if |
| GW-E1 / GW-E2 | Lead + Support | **G-E** after **G-F3** | Two-stop planner |

---

**Document version:** 1.2  
**Aligned with:** `PLAN.md` v1.3, `AGENTS.md`, `docs/GW-F-CONTRACT.md`  
**Next step (human lead):** **G-F0** approved on `feature/gw-f-contracts` — authorize **GW-F1-001** / **GW-F2-001** from that branch; merge to `main` only when releasing integrated GW-F3 (separate authorization).
