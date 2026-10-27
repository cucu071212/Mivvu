# GateWise Implementation Plan

> **For agentic workers:** One task ID at a time unless the human authorizes parallel work with clear boundaries. Post GATEWISE STATUS and stop unless the task says otherwise.

**Plan revision:** `GW-PLAN-REV-2026-10-26` ([`docs/plan-revisions.md`](./plan-revisions.md))
**Goal:** Post-hackathon ICN mobile product with trustworthy facility discovery and preserved SFO shipped demo.
**Architecture:** Mobile-first App Router UI; airport-specific **adapter boundary** for ICN; existing SFO paths unchanged until integration tasks say otherwise.
**Tech stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Vitest, Playwright, Vercel.

## Global constraints

See [`PLAN.md`](../PLAN.md) and [`AGENTS.md`](../AGENTS.md). ICN primary; SFO demo preserved; mobile viewports 360/390/430; browse without mandatory flight setup; [data.go.kr 15095064](https://www.data.go.kr/data/15095064/openapi.do) is reference only until GW-ICN-002 verifies access.

**Default:** Rows below are **planned** with **execution permission `not_authorized`** until the human owner authorizes (updates this row or gives a direct assignment recorded in GATEWISE STATUS). A direct human assignment can authorize work even before this file is updated.

---

## Task state convention

Use **four orthogonal dimensions** in GATEWISE STATUS and task tables:

| Dimension | Values | Meaning |
| --- | --- | --- |
| **Execution permission** | `not_authorized` \| `authorized` | May implement now |
| **Work progress** | `not_started` \| `in_progress` \| `complete` | Agent delivery state |
| **Review / acceptance** | `pending` \| `accepted` \| `rejected` | Human/coordinator acceptance |
| **Integration / release** | `n/a` \| `preview` \| `production` | Deploy state (`production` requires human) |

**Rules:**

- Progress `complete` ≠ review `accepted` ≠ permission for the **next** task.
- Completing documentation or code does not imply merge to `main` or production deploy.

**Prerequisites for ICN tasks (GW-ICN-001+):** Applicable plan revision; **reviewed** `AGENTS.md`, `PLAN.md`, and this file (from assigned branch, `main`, or attachments); **explicit task assignment** with execution permission. **Merge of GW-NEXT-001 to `main` is not required** if the human provides reviewed instructions another way.

---

## GW-NEXT-001: Documentation reset and correction

| Field | Value |
| --- | --- |
| **Owner** | Cursor |
| **Reviewer** | Human owner |
| **Depends on** | — |
| **Permission history** | (1) Initial pass: Markdown on branch only — **no** commit/push/merge/deploy. (2) Human authorized commit + push of documentation branch (`78fd4ff…`). (3) This pass: Markdown commit + push on `docs/gw-next-001-instruction-reset` only. **`main` merge and production promotion remain unauthorized.** |
| **Execution permission** | `authorized` (markdown on branch; commit/push to `docs/gw-next-001-instruction-reset` when human assigns — not `main`) |
| **Work progress** | `complete` |
| **Coordinator technical review** | `accepted` (structure/docs reviewed on GitHub @ `78fd4ff`) — does not replace human acceptance |
| **Review / acceptance (human owner)** | `pending` |
| **Integration / release** | `n/a` (branch published; not merged to `main`; not production) |
| **Deliverable** | `AGENTS.md`, `PLAN.md`, this file, `README.md`, archives, `docs/plan-revisions.md`, `docs/GW-F-CONTRACT.md` banner, consistency fixes |
| **Evidence** | `origin/docs/gw-next-001-instruction-reset` @ `78fd4ff` (prior); archive @ `docs/archive/hackathon-sfo-through-phase-c/` |

---

## ICN / mobile phase — task queue

### GW-ICN-001: Mobile UI audit and design proposal

| Field | Value |
| --- | --- |
| **Owner** | Cursor |
| **Reviewer** | Human owner |
| **Depends on** | Reviewed canon docs; explicit assignment |
| **Task permissions** | When authorized: docs/design artifacts; commit if task allows |
| **Execution permission** | `authorized` (source: direct human assign — narrowed first-entry slice, 2026-10-26) |
| **Work progress** | `complete` (narrowed slice: intro + airport selection mockup only; full audit deferred) |
| **Review / acceptance** | `pending` (design acceptance) |
| **Integration / release** | `n/a` |
| **Acceptance** | 360/390/430, safe areas, touch, reduced motion; maps Flight/Results/What-if/Plan proposals; open decisions tied to `PLAN.md`; no app code required |
| **Narrowed slice (2026-10-26)** | Branch `design/gw-icn-001-mobile`: `docs/design/gw-icn-001/` — logo intro + airport selection HTML prototype @ 390px; ICN labeled proposed primary; does not establish live ICN support. Broader GW-ICN-001 audit remains **pending** until separately assigned. |

---

### GW-ICN-002: ICN API access and response-quality verification

| Field | Value |
| --- | --- |
| **Owner** | Codex (or Cursor if assigned) |
| **Reviewer** | Human owner |
| **Depends on** | Reviewed canon docs; explicit assignment; API key outside repo |
| **Task permissions** | When authorized: local `.env` (not committed), `docs/icn/` reports |
| **Execution permission** | `not_authorized` |
| **Work progress** | `not_started` |
| **Review / acceptance** | `pending` |
| **Integration / release** | `n/a` |
| **Acceptance** | Redacted samples, field catalog, gaps, adapter sketch; no SFO zone matrix assumption |
| **Blocks** | GW-ICN-004 live integration |

---

### GW-ICN-003: Mobile redesign implementation

| Field | Value |
| --- | --- |
| **Owner** | Cursor |
| **Reviewer** | Human owner |
| **Depends on** | GW-ICN-001 review `accepted`; explicit assignment |
| **Task permissions** | When authorized: feature branch, commit/push, preview deploy |
| **Execution permission** | `not_authorized` |
| **Work progress** | `not_started` |
| **Review / acceptance** | `pending` |
| **Integration / release** | `n/a` |
| **Acceptance** | `lint`, `tsc`, `npm test`, `build`; viewport checklist; labeled fixtures if needed |

---

### GW-ICN-004: Real-data integration and refresh/error handling

| Field | Value |
| --- | --- |
| **Owner** | Cursor + Codex (split by sub-assignment) |
| **Reviewer** | Human owner |
| **Depends on** | GW-ICN-002 progress `complete` + review `accepted`; GW-ICN-003 shell |
| **Task permissions** | When authorized: fetch patterns, env documented, no paid providers without approval |
| **Execution permission** | `not_authorized` |
| **Work progress** | `not_started` |
| **Review / acceptance** | `pending` |
| **Integration / release** | `n/a` |
| **Acceptance** | Fixtures + live smoke; no invented hours/waits; SFO engine unchanged unless tasked |

---

### GW-ICN-005: Independent QA and preview review

| Field | Value |
| --- | --- |
| **Owner** | Codex |
| **Reviewer** | Human owner |
| **Depends on** | Preview from GW-ICN-003 or GW-ICN-004; explicit assignment |
| **Task permissions** | When authorized: QA branch, tests, `docs/qa/` report |
| **Execution permission** | `not_authorized` |
| **Work progress** | `not_started` |
| **Review / acceptance** | `pending` |
| **Integration / release** | `n/a` |
| **Acceptance** | Independent expectations; SFO regression; commands cited in report |

---

### GW-ICN-006: Approved production release

| Field | Value |
| --- | --- |
| **Owner** | Cursor |
| **Reviewer** | Human owner |
| **Depends on** | GW-ICN-005 review `accepted`; human production authorization |
| **Task permissions** | When authorized: merge `main`, Vercel production |
| **Execution permission** | `not_authorized` |
| **Work progress** | `not_started` |
| **Review / acceptance** | `pending` |
| **Integration / release** | `n/a` until human approves `production` |
| **Acceptance** | Release notes; ICN record without altering SFO historical facts; smoke evidence |

GW-ICN-001 and GW-ICN-002 may run in parallel when **separately authorized**.

---

## Historical SFO / HackPSU tasks

Detailed P0–Phase C task definitions:

- [`docs/archive/hackathon-sfo-through-phase-c/PLAN.md`](./archive/hackathon-sfo-through-phase-c/PLAN.md)
- [`docs/archive/hackathon-sfo-through-phase-c/IMPLEMENTATION_PLAN.md`](./archive/hackathon-sfo-through-phase-c/IMPLEMENTATION_PLAN.md)
- [`docs/archive/hackathon-sfo-through-phase-c/REMAINING_ROADMAP.md`](./archive/hackathon-sfo-through-phase-c/REMAINING_ROADMAP.md)

Not active authorization unless re-listed here with current plan revision and execution permission.

---

## SFO regression guard

Preserve unless a task explicitly changes it: **26** browse / **12** recommend (`legacy-d-v1`); `recommendFacilities` + GW-F contracts; submission artifacts under `docs/submission/` and `docs/qa/`.
