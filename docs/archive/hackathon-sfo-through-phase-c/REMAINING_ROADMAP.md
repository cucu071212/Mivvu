# GateWise — Remaining work roadmap (ARCHIVED)

> **Superseded:** `GW-PLAN-REV-2026-10-26` — see [`docs/REMAINING_ROADMAP.md`](../../REMAINING_ROADMAP.md) (pointer only) and [`docs/IMPLEMENTATION_PLAN.md`](../../IMPLEMENTATION_PLAN.md).

Last updated: **2026-10-25** (Phase X + GW-B-002 metadata slice shipped; scoped G-B1 approved).  
**Task IDs are not authorization to implement** unless the human Engineering Lead assigns them.

## Stable release baseline

| Item | Value |
| --- | --- |
| **Production URL** | https://gate-wise-iota.vercel.app |
| **`main` SHA** | `6a847b8e7170e553aeb2d996567e4931e0426c33` (`6a847b8`) — GW-B-002 + stabilization |
| **Browse / recommend** | **26** browse-eligible facilities; **12** T2 D Gates recommend-eligible (`legacy-d-v1` manifest) |
| **Travel model** | `legacy_zone` / **D→D = 3** `demo_estimate` with per-edge metadata (not verified SFO walks) |
| **Verification @ release** | **644** Vitest, **9** Playwright E2E, `tsc`, lint, build |
| **Prior production SHAs** | `5c156a2` (Phase B docs); `6375ae7` (G-X3); `af5fe21` (Phase A) |

## Completed (preserve — do not regress)

| Track | Deliverable | Notes |
| --- | --- | --- |
| P0 | Engine, cards, What-if, deploy | `recommendFacilities` contract §4 `PLAN.md` |
| GW-015 | Terminal schematic + a11y | Orientation only — not navigation |
| GW-F1–F3 | Personalization, countdown, integration | `docs/GW-F-CONTRACT.md` |
| Security RC | CSP, frame deny, countdown policy | `next.config.ts` headers |
| Level 2.x | Multipage session, layout rail, countdown dock | `b0b58c6` |
| **Phase A** | GW-A-R001/R002, GW-A-001/002/003 | **G-A0/G-A1**; @ `af5fe21` |
| **Phase X** | GW-X-R001/R002, GW-X-001–004 | **G-X3**; multi-terminal Explore |
| **Phase B (metadata)** | GW-B-R001, GW-B-001 design, GW-B-002 | **Scoped G-B1** approved; @ `6a847b8` |
| Submission | Devpost + demo artifacts | Historical; `docs/DEMO_SCRIPT.md` |

## Active development — Phase C → (B physical HOLD) → D

**Why:** Directory and legacy travel labeling are shipped. Next user-visible work is **usability** (detail, hours policy UX, orientation) without expanding recommend scope or inventing routing.

**Execution plan:** `docs/IMPLEMENTATION_PLAN.md` § Phase C. **Readiness:** `docs/GW-C-PHASE-C-READINESS.md`.

### Phase C — Product usability (**current priority — plan only until authorized**)

| Order | ID | Type | Summary | Depends on | Gate |
| --- | --- | --- | --- | --- | --- |
| 1 | **GW-C-001** | Implement | Facility detail + discovery polish | **G-X3**, scoped **G-B1** | Per-task auth → **G-C0** |
| 2 | **GW-C-002** | Implement | Hours / **America/Los_Angeles** display policy | GW-A-003, GW-X-003; Support published-hours lib | Per-task auth → **G-C0** |
| 3 | **GW-C-003** | Implement | First-run orientation (26 vs 12, honest limits) | GW-C-001 | Per-task auth → **G-C0** |

**Parallel:** Engineering Support Codex **GW-C-SUPPORT-BUNDLE** (hours, timezone/DST, integrity) — Lead integrates UI only; do not duplicate Support-owned modules.

### Phase B — Physical routing (**HOLD**)

| ID | Status |
| --- | --- |
| Verified SFO walking graph, new matrix minutes, cross-terminal recommend | **Not authorized** |
| GW-B-002 metadata | **Shipped** @ `6a847b8` |

### Phase D — GW-E two-stop planner (**deferred**)

| ID | Summary | Preconditions |
| --- | --- | --- |
| **GW-E1** | Pure two-stop engine + tests | **G-E** + **G-Data** (**HOLD**) |
| **GW-E2** | **My Plan** UI | GW-E1 |

Do **not** start GW-E until **G-Data** closes and the human lead re-issues **G-E**.

## Archived / historical

| Item | Reason |
| --- | --- |
| Hackathon M1–M6, gates G0–G6 | Event complete |
| GW-F0–F3 queue | **Shipped** |
| Phase A task queue (GW-A-*) | **Shipped** @ `af5fe21` |
| Phase X task queue (GW-X-*) | **Shipped** (G-X3) |
| Level 2.5–2.7 layout | **Shipped** |
| “T2 D-only forever” scope note | Superseded by Phase X — **recommend** scope still **12** D Gates until dedicated eligibility task |

## Unavailable or unknown data (explicit)

Until research proves otherwise:

- Live SFO queue/wait times API
- Live flight / boarding gate API (out of product scope)
- Guaranteed post-security connectivity between terminals
- Official turn-by-turn indoor routing for all terminals
- Real-time open/closed per facility

## Rollback strategy

1. **Phase X dataset batches:** Revert batch commit; directory shrinks; recommend scope unchanged if eligibility not expanded.
2. **Schema migration:** Document down-migration in GW-X-001; validators accept legacy rows.
3. **Travel metadata (GW-B-002):** Revert `travel-times.ts` + manifest commit; matrix minutes unchanged at **3** if only metadata reverted.
4. **Production:** Vercel promote prior deployment (e.g. `5c156a2`) without rewriting Git history.

## Minimum acceptance before next production release

- All tests + build green on release branch.
- Security headers reviewed if `next.config.ts` changes.
- Smoke: Flight, Explore, Results, Plan; **26/12** scope copy; E2E green.
- `docs/data-provenance.md` updated when display policy or data changes.
