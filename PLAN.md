# GateWise — Product Plan

**Plan revision:** `GW-PLAN-REV-2026-10-26` ([`docs/plan-revisions.md`](docs/plan-revisions.md))
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

**ICN data:** Public API reference — [공항서비스 API (data.go.kr 15095064)](https://www.data.go.kr/data/15095064/openapi.do). Documentation is not proof of access, coverage, or accuracy (verify in task **GW-ICN-002**). Use a **small airport-specific adapter**; do not copy SFO `legacy_zone` or D→D demo walks to ICN.

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
| Splash animation | Duration; repeat-visit behavior |
| Bottom navigation | Labels and iconography |
| Filters | Interaction pattern |
| Visual identity | Brand polish beyond current GateWise |
| Planning features | How Flight / Results / What-if / Plan map into redesigned mobile IA |

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
