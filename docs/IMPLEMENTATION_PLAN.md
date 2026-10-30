# GateWise Implementation Plan

> **For agentic workers:** One task ID at a time unless the human authorizes parallel work with clear boundaries. Post GATEWISE STATUS and stop unless the task says otherwise.

**Plan revision:** `GW-PLAN-REV-2026-10-29` ([`docs/plan-revisions.md`](./plan-revisions.md))
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
| **Integration / release** | `production` (merged with GW-ICN-006 @ `556943b` on `main`) |
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
| **Review / acceptance** | `accepted` (human owner, 2026-10-28 — verified preview, P2 fixes, CI/E2E on `556943b`) |
| **Integration / release** | `production` (PR [#2](https://github.com/cucu071212/Mivvu/pull/2) merged to `main` @ `556943b`; Vercel production [deployment](https://vercel.com/gate-wise/gate-wise/5jA6L2Fo3MffGQ2AjrwcputsQNgW)) |
| **Acceptance** | Independent expectations; SFO regression; commands cited in report |
| **Evidence** | [Preview QA + P2 corrections](qa/mivvu-preview-qa.md); [production smoke](qa/mivvu-production-smoke-2026-10-28.md); [Mivvu release record](submission/MIVVU_RELEASE_2026-10-28.md); [security review/remediation evidence](security/mivvu-preflight-review.md); [combined PR packaging handoff](qa/mivvu-pr-packaging.md); `scripts/qa-mivvu-preview.mjs` |
| **Owner decision (2026-10-28)** | Proceed with the implemented entry, ICN browsing, KO/EN, and SEC-01/02/03 fixes as the basis for PR review. Skip Strix/Shannon and isolation setup for this release. Active penetration testing **not performed**; this decision is neither an independent code audit nor a guarantee of security. Human owner accepted corrections and authorized GW-ICN-006 production release same day. |

---

### GW-ICN-006: Approved production release

| Field | Value |
| --- | --- |
| **Owner** | Cursor |
| **Reviewer** | Human owner |
| **Depends on** | GW-ICN-005 review `accepted`; human production authorization |
| **Task permissions** | When authorized: merge `main`, Vercel production |
| **Execution permission** | `authorized` (human owner, 2026-10-28 — merge PR #2 and production deploy) |
| **Work progress** | `complete` |
| **Review / acceptance** | `accepted` (human owner, 2026-10-28) |
| **Integration / release** | `production` — `main` @ `556943b`; https://gate-wise-iota.vercel.app |
| **Acceptance** | Release notes; ICN record without altering SFO historical facts; smoke evidence |
| **Evidence** | [`docs/submission/MIVVU_RELEASE_2026-10-28.md`](submission/MIVVU_RELEASE_2026-10-28.md); [`docs/qa/mivvu-production-smoke-2026-10-28.md`](qa/mivvu-production-smoke-2026-10-28.md) |

### GW-ICN-007: Offline ICN snapshot quality gate

| Field | Value |
| --- | --- |
| **Plan revision** | `GW-PLAN-REV-2026-10-26` |
| **Owner** | Codex |
| **Integration reviewer / final acceptance** | Cursor / human owner |
| **Depends on** | Shipped KO/EN fixtures and ICN adapter/browse contracts; local `main` @ `5bd3121f6aac992ac1b5d59e33c1e68d65c40170` verified before edits |
| **Execution permission** | `authorized` (source: direct human assignment in Codex chat, 2026-10-28 America/New_York) |
| **Task permissions** | Local code, tests, docs, verification on `codex/gw-icn-007-snapshot-quality`. No commit, push, GitHub mutations, merge, deploy, live API, fixture replacement, dependency upgrades, active scanning, or subagents. Prior release permissions do not apply. |
| **Scope** | Offline untrusted snapshot validation, deterministic KO/EN analysis and baseline comparison CLI; shared unambiguous matching rule and P3 fallback correction; documentation and adversarial tests |
| **Work progress** | `complete` (shipped via GW-ICN-009 / PR #3) |
| **Review / acceptance** | `accepted` (Cursor integration review; human owner accepted integrated packaging and production release, 2026-10-28) |
| **Integration / release** | `production` — `main` @ `bb4735d` via [PR #3](https://github.com/cucu071212/Mivvu/pull/3); https://gate-wise-iota.vercel.app |
| **Acceptance / verification** | Current counts and totalCount mismatch retained; self/reordered comparisons have no content changes; synthetic invalid/incomplete/conflicting/asymmetric inputs; safe fallback; unchanged shipped fixture bytes and browse output; focused data/display tests, CLI smoke, lint, production build, whitespace review |
| **Handoff** | [Usage, results, limitations](data/icn-snapshot-quality-gate.md) |

### GW-ICN-008: Robust local ICN facility search

| Field | Value |
| --- | --- |
| **Plan revision** | `GW-PLAN-REV-2026-10-26` |
| **Owner / integration reviewer / final acceptance** | Codex / Cursor / human owner |
| **Execution permission** | `authorized` (direct human assignment, Codex chat attachment, 2026-10-28 America/New_York) |
| **Task permissions** | Isolated local source, tests, docs, checkpoints and verification only. No commit, push, PR, GitHub mutations, merge, deploy, live airport API, scanning, fixture replacement, dependency changes or subagents. |
| **Scope** | Locale-local Unicode/token/initial-consonant search, conservative name typo recovery, deterministic ranking, reusable indexes; existing layout and state preserved |
| **Base / dependency** | Local `main` @ `5bd3121f6aac992ac1b5d59e33c1e68d65c40170`; shipped browse contracts. GW-ICN-007 remains separate until GW-ICN-009 integration. |
| **Work progress** | `complete` (shipped via GW-ICN-009 / PR #3) |
| **Review / acceptance** | `accepted` (Cursor integration review; human owner accepted integrated packaging and production release, 2026-10-28) |
| **Integration / release** | `production` — `main` @ `bb4735d` via [PR #3](https://github.com/cucu071212/Mivvu/pull/3); https://gate-wise-iota.vercel.app |
| **Acceptance / verification** | Independent adversarial tests, unchanged fixtures/empty ordering, relevance and performance evidence, browser composition/state/count/focus/mobile checks, lint/typecheck/tests/build/whitespace |
| **Checkpoint / handoff** | [Durable progress and Cursor handoff](handoffs/GW-ICN-008-checkpoint.md) |

### GW-ICN-009: Local integration of GW-ICN-007 and GW-ICN-008

| Field | Value |
| --- | --- |
| **Plan revision** | `GW-PLAN-REV-2026-10-26` |
| **Owner** | Cursor |
| **Follow-up reviewer / final acceptance** | Codex (integration delta only) / human owner |
| **Execution permission** | `authorized` (human owner dispatch 2026-10-28; packaging commit/push/PR 2026-10-28; **production release** merge PR #3 + deploy 2026-10-28) |
| **Task permissions** | Integration branch commit, push, PR #3 merge to `main`, automatic Vercel production deploy, documentation-only follow-up PR/commits as needed. No unrelated merges, dependency changes, live API, or fixture refresh. |
| **Work progress** | `complete` (integrated, merged, production smoke recorded) |
| **Review / acceptance** | `accepted` (Cursor integration review; Codex integration delta — no blockers; human owner accepted packaging and production release, 2026-10-28) |
| **Integration / release** | `production` — `main` @ `bb4735d07f9b5cb68c6b44944ee76e994df801a8`; https://gate-wise-iota.vercel.app |
| **Evidence** | [Integration checkpoint](handoffs/GW-ICN-009-integration.md); [Release record](submission/MIVVU_RELEASE_2026-10-28-icn-search.md); [Production smoke](../qa/mivvu-production-smoke-2026-10-28-icn-search.md) |
| **Branch** | `codex/gw-icn-009-integration` merged via [PR #3](https://github.com/cucu071212/Mivvu/pull/3) |

### GW-ICN-010: Mivvu code map and change-impact analysis

| Field | Value |
| --- | --- |
| **Plan revision** | `GW-PLAN-REV-2026-10-26` (analysis); publication on `docs/gw-icn-010-code-map` |
| **Owner** | Codex |
| **Reviewer / final acceptance** | ChatGPT coordinator / human owner (**accepted**) |
| **Execution permission** | `authorized` (analysis + publication follow-up) |
| **Work progress** | `complete` |
| **Review / acceptance** | `accepted` |
| **Integration / release** | `n/a` (documentation PR [#5](https://github.com/cucu071212/Mivvu/pull/5); analyzed code @ `2e56a28c16ebd71eb202db7aa428db7ba9b50b78`) |
| **Deliverable** | [Code map @ PR #5 `1c3f721`](https://github.com/cucu071212/Mivvu/blob/1c3f7215f44e48e8fc89736b0829fd2e5f667aea/docs/analysis/GW-ICN-010-code-map.md), [checkpoint @ PR #5](https://github.com/cucu071212/Mivvu/blob/1c3f7215f44e48e8fc89736b0829fd2e5f667aea/docs/handoffs/GW-ICN-010-checkpoint.md) (after merge: [`./analysis/GW-ICN-010-code-map.md`](./analysis/GW-ICN-010-code-map.md), [`./handoffs/GW-ICN-010-checkpoint.md`](./handoffs/GW-ICN-010-checkpoint.md)) |
| **Use** | Impact boundaries for ICN search, snapshots/locale, and SFO separation — input to **GW-ICN-011** |

### GW-ICN-011: ICN product scope, user flows, and implementation plan

| Field | Value |
| --- | --- |
| **Plan revision** | `GW-PLAN-REV-2026-10-28` |
| **Owner** | Cursor |
| **Reviewer / final acceptance** | ChatGPT coordinator / human owner |
| **Depends on** | Reviewed canon; shipped ICN browse/search @ `2e56a28`; GW-ICN-010 analysis (PR #5 or same SHA) |
| **Execution permission** | `authorized` (source: direct human dispatch — **local planning Markdown only**, 2026-10-28) |
| **Task permissions** | Edit only: `PLAN.md`, this file, `docs/plan-revisions.md`, `docs/design/GW-ICN-011-product-flow.md`, `docs/handoffs/GW-ICN-011-checkpoint.md` on branch `docs/gw-icn-011-product-plan`. **No** commit, push, PR, merge, deploy, application edits, or subagents. |
| **Work progress** | `complete` |
| **Review / acceptance** | `accepted` (ChatGPT coordinator assessment; human owner **2026-10-29** — corrected plan) |
| **Integration / release** | `n/a` (accepted deliverable; **publication** via PR `chore/gw-icn-011-012-package` — **not** `main` merge or production) |
| **Deliverable** | Updated product/implementation plans; flow/design doc; checkpoint; registered future tasks GW-ICN-013–019 |
| **Evidence base** | `origin/main` @ `2e56a28c16ebd71eb202db7aa428db7ba9b50b78`; source inspection + GW-ICN-010 map |

### GW-ICN-012: ICN facility reference identity (candidate contract)

| Field | Value |
| --- | --- |
| **Plan revision** | `GW-PLAN-REV-2026-10-28` (implementation); acceptance recorded under **`GW-PLAN-REV-2026-10-29`** |
| **Owner** | Codex |
| **Integration reviewer** | Cursor (**accepted** — independent integration review 2026-10-29) |
| **Final acceptance** | Human owner **accepted** (2026-10-29), following Cursor review |
| **Depends on** | GW-ICN-011 accepted |
| **Execution permission** | `authorized` (direct human assignment to Codex, 2026-10-29) |
| **Work progress** | `complete` |
| **Review / acceptance** | `accepted` |
| **Integration / release** | `n/a` (pure module; **publication** via PR `chore/gw-icn-011-012-package` — **not** wired to routes/UI; **not** `main`/production) |
| **Deliverable** | [`icn-facility-reference.ts`](../src/lib/icn-facilities/icn-facility-reference.ts), tests, [`icn-facility-reference-contract.md`](data/icn-facility-reference-contract.md), [checkpoint](handoffs/GW-ICN-012-checkpoint.md) |
| **Integration requirements (not defects)** | Callers must pass **complete** normalized KO/EN catalogs; plan verbose ref transport for future routes; UI must not infer changed vs removed snapshot rows |

---

## ICN product completion — planned tasks (not authorized)

Registered by **GW-ICN-011** / updated **`GW-PLAN-REV-2026-10-29`**. Cite applicable **`GW-PLAN-REV-*`** when dispatching.

**GW-ICN-019 (2026-10-29):** Direct human dispatch on branch `design/gw-icn-019-icn-ux` (base `chore/gw-icn-011-012-package` @ `460be126cddebc8b9df4a00b5fe9d5ea645a775b`). **Execution permission:** `authorized`. **Work progress:** `complete`. **Review / acceptance:** **`accepted`** (human owner 2026-10-29 — header inset in `11-header-browse-ko-390px.png`). **Integration / release:** `n/a` (design-only PR). **Evidence:** [`docs/design/gw-icn-019/`](design/gw-icn-019/) (prototype + EN `07`–`10` + header `11`–`16`), [`docs/design/gw-icn-019/screenshots/README.md`](design/gw-icn-019/screenshots/README.md), [`docs/handoffs/GW-ICN-019-checkpoint.md`](handoffs/GW-ICN-019-checkpoint.md). Playwright: capture scripts PASS (reuse; no full recapture at publication).

**GW-ICN-014 (2026-10-29):** Branch `feat/gw-icn-014-category` (base `feat/gw-icn-013-detail` @ `135712d8561518d36b4f89fc508fdf6981889b94`). **Execution permission:** `authorized`. **Work progress:** `complete`. **Review / acceptance:** **`accepted`** (human owner 2026-10-29, after Codex P2 re-verification). **Integration / release:** **publication** (PR stacked on `feat/gw-icn-013-detail`; **not** `main` merge or production). **Evidence:** [`docs/handoffs/GW-ICN-014-checkpoint.md`](handoffs/GW-ICN-014-checkpoint.md), [`docs/handoffs/GW-ICN-019-bottom-sheet-refinement.md`](handoffs/GW-ICN-019-bottom-sheet-refinement.md), screenshots `GW-ICN-014-*.png`. **Test note:** `MivvuIcnFacilitiesBrowseScreen.test.tsx` still has **three inherited combined-run failures** (baseline `@135712d`); focused category/hub/lifecycle suites pass.

| Task ID | Objective | Owner (default) | Depends on | Integration reviewer | Excludes |
| --- | --- | --- | --- | --- | --- |
| **GW-ICN-019** | **ICN UI/UX design and human owner review** — Browse/search/category layout; detail hierarchy and interactions; saved-list entry and stale/missing states; back navigation and exploration-state expectations; KO/EN with real fixture records, long content, and missing data at 360/390/430; reuse settled Mivvu identity/intro. Deliver design artifacts and explicit human review **before** screen coding. | Cursor (+ UI/design skill when authorized) | GW-ICN-011 accepted; GW-ICN-012 accepted | Human owner | Six-tab IA, brand redesign, live open/access claims, automatic SFO feature migration, immediate implementation in this task |
| **GW-ICN-013** | **ICN facility detail route** — Traveler-relevant primary content; snapshot/source transparency; unknown handling; wire `resolveIcnFacilityRef` with full catalogs | Cursor | GW-ICN-012 accepted; **GW-ICN-019 accepted** (screen/UI portions) | Codex (data contract) | Live open/closed, maps, walking times, gate suitability |
| **GW-ICN-014** | **ICN category discovery** — browse/filter by existing API taxonomy (no invented groups). **Data/filter logic** may be scoped independently; **browse UI layout** requires **GW-ICN-019**. **2026-10-29 refinement:** bottom sheet type selector (see [`docs/handoffs/GW-ICN-019-bottom-sheet-refinement.md`](handoffs/GW-ICN-019-bottom-sheet-refinement.md), local checkpoint [`docs/handoffs/GW-ICN-014-checkpoint.md`](handoffs/GW-ICN-014-checkpoint.md)). | Cursor | **GW-ICN-019 accepted** (UI); GW-ICN-013 optional for card→detail | Human owner (IA) | Search algorithm rewrite |
| **GW-ICN-015** | **Situation suitability panel** — structured known/unknown/not claimed; no security-access inference from raw flags | Cursor + Codex review | GW-ICN-013; **GW-ICN-019 accepted** (presentation) | Human owner | SFO `recommendFacilities`, synthetic walks |
| **GW-ICN-016** | **Saved facilities (local)** — save, list, reopen detail; stale/missing/ambiguous handling | Cursor | GW-ICN-012, GW-ICN-013; **GW-ICN-019 accepted** (saved UX) | Codex (identity edge cases) | Auth, database, cross-device sync |
| **GW-ICN-017** | **Exploration state preservation** — return from detail without losing search/terminal/category context | Cursor | GW-ICN-013; **GW-ICN-019 accepted** (navigation model) | Codex optional | Forced global state merge with SFO session |
| **GW-ICN-018** | **ICN Core Journey verification** — Playwright + viewport checklist for milestone in `PLAN.md` (discover/search, **GW-ICN-014**, detail, **GW-ICN-015**, save/revisit, exploration state) | Cursor | GW-ICN-013, GW-ICN-014, GW-ICN-015, GW-ICN-016, GW-ICN-017 (each **accepted** when implemented) | Human owner | Production promotion (separate release task) |

**Recommended next bounded task (proposal):** **GW-ICN-013** (detail route) after **GW-ICN-019** design PR merges into `chore/gw-icn-011-012-package`. **GW-ICN-012** reference module is **accepted** and available for integration tasks.

**012 integration notes (carry forward):** (1) Full normalized catalogs at create/resolve — not browse projections. (2) Serialized refs are verbose (~1 KB+ on shipped fixtures); plan URL/storage in route tasks. (3) Changed vs removed content both surface as `reference_content_not_found`; UI copy must stay honest.

**SFO connection work:** No row above migrates SFO engines to ICN. Optional **later** tasks may expose SFO demo entry from ICN hub for outreach; defer until ICN Core Journey milestone unless human directs otherwise.

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
