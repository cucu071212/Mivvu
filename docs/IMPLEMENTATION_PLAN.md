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
| **Execution permission** | `authorized` (source: direct human assign, 2026-10-27) |
| **Work progress** | `complete` (documentation + unauthenticated + **live** verification 2026-10-27) |
| **Review / acceptance** | `pending` |
| **Integration / release** | `n/a` |
| **Acceptance** | Redacted samples, field catalog, gaps, adapter sketch; no SFO zone matrix assumption |
| **Evidence** | [`docs/data/icn-api-verification.md`](data/icn-api-verification.md) — live appendix; `scripts/icn-facilities-probe.mjs` |
| **Verdict (live)** | **Sufficient with gaps** for initial static ICN browse (1175 facilities; no coords/queues/live open) |
| **Blocks** | GW-ICN-004 may start adapter work; charging/water coverage still uncertain |

---

### GW-ICN-003: Mobile redesign implementation

| Field | Value |
| --- | --- |
| **Owner** | Cursor |
| **Reviewer** | Human owner |
| **Depends on** | GW-ICN-001 review `accepted`; explicit assignment |
| **Task permissions** | When authorized: feature branch, commit/push, preview deploy |
| **Execution permission** | `authorized` (source: direct human assign — bounded Mivvu first-entry slice, 2026-10-27) |
| **Work progress** | `complete` (bounded slice + main-entry integration on feature branch; `/` + `/icn`; SFO Flight at `/flight`; preview redirects; packaging evidence under GW-ICN-005) |
| **Review / acceptance** | `pending` |
| **Integration / release** | `preview` (automatic Vercel preview observed for draft PR #2 under GW-ICN-005; no production promotion) |
| **Acceptance** | `lint`, `tsc`, `npm test`, `build`; viewport checklist; labeled fixtures if needed |
| **Bounded slice (2026-10-27)** | Stitch-based **Mivvu** intro + airport selection; Plus Jakarta on entry routes; SFO CTA → `/explore`; ICN → `/icn`. Handoff: `docs/design/mivvu-first-entry-handoff.md`. Full GW-ICN-003 shell redesign remains **pending**. |
| **Main-entry integration (2026-10-28)** | Human-authorized local integration after GW-ICN-005 QA; checkpoint `518534a`; canonical routing via `src/lib/mivvu-entry-routes.ts`; legacy preview URLs redirect. |

---

### GW-ICN-004: ICN facility data adapter + preview browse slice

| Field | Value |
| --- | --- |
| **Owner** | Cursor |
| **Reviewer** | Human owner |
| **Depends on** | GW-ICN-002 progress `complete` (live verification) |
| **Task permissions** | Local implementation + verification only (no commit/push/deploy in this assign) |
| **Execution permission** | `authorized` (source: direct human assign — adapter + browse UI slice, 2026-10-27/28) |
| **Work progress** | `complete` (adapter, KO+EN fixtures, ICN browse, KO/EN locale toggle + persistence on Mivvu `/` and `/icn`; legacy preview URLs redirect) |
| **Review / acceptance** | `pending` |
| **Integration / release** | `preview` (feature-branch draft PR #2; automatic Vercel preview observed; no production deployment) |
| **Acceptance** | Adapter + static browse (search, terminal filter, honest snapshot copy); KO/EN fixture by locale; SFO `/explore` unchanged; intro timing unchanged |
| **Evidence** | [`docs/data/icn-facility-adapter-handoff.md`](data/icn-facility-adapter-handoff.md); [`docs/design/mivvu-icn-browse-handoff.md`](design/mivvu-icn-browse-handoff.md); screenshots `03-icn-browse-390-ko.png`, `03-icn-browse-390-en.png` |
| **Browse display count** | **1011** listings (collapsed from 1028 fixture rows) |
| **Live sync note (2026-10-28)** | `totalCount` 1175 vs **1028** rows fetched; `syncIntegrity: api_total_mismatch`; 17 duplicate `sn` in fetched set |
| **English fixture (2026-10-28)** | `icn-facilities-en.json` — 1028 raw / **1011** deduped; **1011** shared `sourceId` with KO; strict `lang=E` sync fails same mismatch |

---

### GW-ICN-005: Independent QA and preview review

| Field | Value |
| --- | --- |
| **Owner** | Codex |
| **Reviewer** | Human owner |
| **Depends on** | Preview from GW-ICN-003 or GW-ICN-004; explicit assignment |
| **Task permissions** | Original local QA and bounded SEC-01/02/03 follow-ups; direct human assignment on 2026-10-28 additionally authorizes local packaging review/focused corrections, explicit-file commits, normal push to `feat/mivvu-first-entry-slice`, and draft PR against `main`. No force-push, merge, production deploy, infrastructure changes, active scanning, new features, or dependency upgrades. |
| **Execution permission** | `authorized` (source: human owner, direct Codex chat assignments, 2026-10-27/28; PR packaging 2026-10-28 America/New_York) |
| **Work progress** | `complete` (bounded preview QA, SEC-01 sanitized errors, SEC-03 enforced server-only boundary, SEC-02 attribute restriction with inline allowances retained; combined PR packaging evidence below) |
| **Review / acceptance** | `pending` |
| **Integration / release** | `preview` (draft [PR #2](https://github.com/cucu071212/GateWise/pull/2); Vercel reports Ready for the feature-branch preview; no merge/manual deployment/production promotion) |
| **Acceptance** | Independent expectations; SFO regression; commands cited in report |
| **Evidence** | [Historical preview QA](qa/mivvu-preview-qa.md); [security review/remediation evidence](security/mivvu-preflight-review.md); [combined PR packaging handoff](qa/mivvu-pr-packaging.md); local browser probe `scripts/qa-mivvu-preview.mjs` |
| **Owner decision (2026-10-28)** | Proceed with the implemented entry, ICN browsing, KO/EN, and SEC-01/02/03 fixes as the basis for PR review. Skip Strix/Shannon and isolation setup for this release. Active penetration testing **not performed**; this decision is neither an independent code audit nor a guarantee of security. Review stays pending; human owner is integration reviewer. |

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
