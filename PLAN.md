# GateWise — Product Plan

**Plan revision:** `GW-PLAN-REV-2026-10-29` ([`docs/plan-revisions.md`](docs/plan-revisions.md))
**Project:** GateWise — *Your airport. Your gate. Your time.*

> Airport maps show where amenities are. GateWise helps travelers decide whether they have time to visit them before boarding — with honest labels and unknowns where data is missing.

## Document responsibilities

| Document | Governs |
| --- | --- |
| **Human owner** | Approved scope, permissions, production promotion |
| [`AGENTS.md`](AGENTS.md) | Agent roles, collaboration, verification, safety, coordinator rules |
| **This file (`PLAN.md`)** | Product requirements, invariants, approved vs proposed direction |
| [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) | Task IDs, dependencies, evidence, task-specific permissions |
| **Technical contracts** (e.g. [`docs/GW-F-CONTRACT.md`](docs/GW-F-CONTRACT.md)) | Defined interfaces for shipped modules — ignore superseded ownership/workflow lines in contracts |
| [`docs/archive/`](docs/archive/) and submission/QA reports | Historical evidence — not active authorization |

Assigned tasks may override default **ownership** but cannot silently change product invariants here or self-grant permissions (see `AGENTS.md`).

---

## Approved direction — ICN and mobile

| Topic | Decision |
| --- | --- |
| Primary development target | **ICN (Incheon)** |
| Users | Travelers preparing the day before travel **and** people already at the airport |
| Facility coverage | As broad as **trustworthy data** permits |
| Design priority | **Mobile-first** (360 / 390 / 430 CSS px, safe areas, touch targets, keyboard, long content, loading/error/empty, `prefers-reduced-motion`) |
| Entry flow | Short GateWise icon/logo animation → **airport selection** |
| Discovery | Facility browse **must not require flight setup** |
| Legacy | Preserve **SFO** shipped demo, code paths, and **historical** submission/QA evidence (do not rewrite to describe ICN) |
| Future | SFO maintenance and other airports remain possible without committing to nationwide coverage |
| Outreach use | Improve ICN into a **credible demonstration** when requesting official data/API access from SFO or other US airports — ICN must be **useful on its own**, not merely an outreach mockup |
| Official API terms | Availability, access terms, and approval for SFO or other airports remain **unverified** unless a task records verification |

**ICN data:** Public API reference — [공항서비스 API (data.go.kr 15095064)](https://www.data.go.kr/data/15095064/openapi.do). Documentation is not proof of access, coverage, or accuracy (verify in task **GW-ICN-002**). Use a **small airport-specific adapter**; do not copy SFO `legacy_zone` or D→D demo walks to ICN.

### Human-approved core user actions (ICN product)

These six actions define the **approved product direction** for ICN. They are **not** blanket authorization to implement; task rows in [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) govern execution.

| # | Action | Requirement (high level) |
| --- | --- | --- |
| 1 | Choose or change an airport | Mivvu entry preserves intro → airport selection; user can return to change airport without breaking SFO demo paths |
| 2 | Search for a facility | Locale-local search over trustworthy ICN listings; **no search rewrite** without a documented unmet need |
| 3 | Browse facilities without knowing names | Discovery beyond name search (e.g. terminal and **existing API category fields**) without requiring flight setup |
| 4 | Inspect facility information | Dedicated inspection surface with source labels; distinguish published hours text from live open/closed status |
| 5 | Judge suitability within verified data | Honest “what we know / what we do not know” for the traveler’s situation — **no** gate proximity, security access, or accessibility claims without evidence |
| 6 | Save and revisit facilities | User can retain choices locally and return later; identity must survive snapshot refresh rules where possible |

Detailed gaps, completion criteria, screen flow, and implementation ordering: [`docs/design/GW-ICN-011-product-flow.md`](docs/design/GW-ICN-011-product-flow.md) (**GW-ICN-011**, planning only).

### ICN milestone (product, not release gate)

**ICN Core Journey (proposed milestone):** From airport selection, a traveler can discover or search ICN facilities, open a detail view with labeled snapshot data, understand unknowns, save at least one facility, and revisit saved items — in KO or EN on mobile viewports — **without** mandatory flight setup. Reaching this milestone is the minimum credible demo for outreach; it does not require SFO recommendation, What-if, or two-stop features on ICN.

---

## Shipped SFO behavior and compatibility

**Last recorded SFO release behavior** (see [`docs/submission/RELEASE_FACTS.md`](docs/submission/RELEASE_FACTS.md); not verified as the currently serving deployment without fresh evidence):

- **SFO only** at welcome for the live product surface; **26** browse-eligible facilities, **12** Terminal 2 D Gates recommend-eligible (`legacy-d-v1`).
- Multipage App Router UX: Welcome, Flight, Explore, Results, What-if, My Plan (optional **demo** two-stop planner with illustrative travel opt-in).
- **GW-F1–F3** shipped: per-facility duration overrides, boarding-start countdown, integrated What-if and session.
- **GW-B-002** metadata: labeled legacy travel model; not verified indoor walks.
- **Location Guidance:** listing-backed area evidence where present — not floor plans or routes.

**Regression rule:** ICN and shared refactors must not weaken SFO recommend/browse separation, calculation semantics below, or submission-recorded behavior unless a task explicitly changes scope with human approval.

**Historical product Git SHA (submission):** `c9c163cd7ee51d270e1a079daf84ffaf37b5952a` — evidence of what was verified at closeout, not automatic proof of the currently serving deployment.

---

## Data integrity and calculation invariants

Apply to existing engines unless an explicit redesign task changes them:

- **`minutesUntilBoarding`** = minutes until **boarding starts**, not gate closure.
- **Single-stop model** (`recommendFacilities` / What-if): required minutes = directed outbound + directed return + queue + activity + **one safety buffer**; outbound and return evaluated separately (no assumed symmetry).
- **Two-stop demo** (My Plan): separate shipped module — applicable directed walking legs, both stops’ queue and activity where known, **one** safety buffer total; see `AGENTS.md` and `docs/submission/RELEASE_FACTS.md`. Do not alter behavior without an authorized task.
- **One safety buffer** in each model (not double-counted with margin display heuristics).
- **Margin** = minutes until boarding starts − required minutes.
- **Thresholds:** margin ≥ 10 → `feasible_in_model`; 0–9 → `tight_in_model`; &lt; 0 → `over_budget`; missing essential inputs → `unknown`.
- **Unknown durations are never zero-filled.**
- **What-if** uses the same pure engine for baseline and scenario.
- **Browse eligibility ≠ recommendation eligibility.**
- Label **official / demo / user-supplied** data distinctly; never invent airport facts.
- Never imply a model outcome guarantees catching a flight.

---

## Current scope and non-goals

**In scope for ICN track (when tasks authorize):** mobile UX per approved direction, verified public data integration via adapter, honest limitations copy.

**Not approved as commitments:** nationwide coverage; commercialization; a chosen database, backend framework, or paid provider; production indoor navigation; live walking, queue, occupancy, or availability claims.

**Still out of product scope unless explicitly approved:** auth, payments, boarding-pass scanning, live flight feeds.

---

## Proposals and open decisions

Not requirements until recorded here or via direct human decision:

| Topic | Notes |
| --- | --- |
| Splash animation | Duration; repeat-visit behavior (**settled:** 3.2s intro timing and session skip — do not reopen without concrete conflict) |
| Bottom navigation | Labels and iconography (**proposal:** stack navigation + one hub screen; see GW-ICN-011 flow doc) |
| Filters | Category/terminal interaction pattern (use **existing** `large` / `medium` / `small` taxonomy only) |
| Visual identity | Brand polish beyond current GateWise (**settled:** Mivvu entry shell and wordmark variants for this track) |
| ICN entry catalog copy | `coming_soon` vs live `/icn` browse — align messaging without implying unverified coverage |
| Persisted airport preference | Universal last-selected airport vs session-only selection state |
| Facility reference key | Candidate ref schema and resolver outcomes (**GW-ICN-012**); cross-snapshot auto-reconciliation **not specified** |
| Saved storage | Local-only vs future account sync (**accounts not approved**) |
| Exploration state | URL query vs session storage when returning from detail |
| ICN screen IA (GW-ICN-019) | Human-reviewed design for browse/detail/saved flows before GW-ICN-013–017 screen coding — **not** six tabs or brand redesign |
| Planning features | How Flight / Results / What-if / Plan connect to ICN later (SFO-first; defer forced ICN parity) |

ChatGPT coordinator suggestions do not become requirements until captured above or in the implementation plan with human approval.

---

## Acceptance principles

1. **Honesty:** Source and estimate labels visible; gaps stay unknown.
2. **Regression:** Changes touching shared code keep SFO smoke paths and documented test expectations unless a task documents intentional change.
3. **Mobile ICN work:** Layout checks at 360 / 390 / 430 CSS px; safe areas; touch targets; reduced-motion path; distinguish browser viewport QA from physical-device testing.
4. **Integration:** API fixtures and mocks clearly labeled until real-data tasks authorize production paths.
5. **Release:** Production promotion requires human authorization (**GW-ICN-006**); merging to `main` may trigger Vercel production deploy (see `AGENTS.md`).

---

## Related documents

| Link | Purpose |
| --- | --- |
| [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) | Active task queue and permissions |
| [`docs/plan-revisions.md`](docs/plan-revisions.md) | Plan revision identifiers |
| [`docs/archive/hackathon-sfo-through-phase-c/PLAN.md`](docs/archive/hackathon-sfo-through-phase-c/PLAN.md) | Full HackPSU / SFO expansion plan (historical) |
| [`docs/submission/RELEASE_FACTS.md`](docs/submission/RELEASE_FACTS.md) | SFO release evidence |
| [`docs/GW-F-CONTRACT.md`](docs/GW-F-CONTRACT.md) | GW-F technical contract (shipped) |
| [`docs/design/GW-ICN-011-product-flow.md`](docs/design/GW-ICN-011-product-flow.md) | ICN six-action scope, user flow, SFO connection matrix, planned tasks |
| [GW-ICN-010 code map @ PR #5](https://github.com/cucu071212/Mivvu/blob/1c3f7215f44e48e8fc89736b0829fd2e5f667aea/docs/analysis/GW-ICN-010-code-map.md) | Code map @ analyzed SHA `2e56a28` ([PR #5](https://github.com/cucu071212/Mivvu/pull/5); merges to `docs/analysis/GW-ICN-010-code-map.md`) |
