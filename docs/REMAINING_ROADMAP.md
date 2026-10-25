# GateWise — Remaining work roadmap

Last updated: **2026-10-25** (Phase A shipped; Phase X roadmap integrated).  
**Task IDs are not authorization to implement** unless the human Engineering Lead assigns them.

## Stable release baseline

| Item | Value |
| --- | --- |
| **Production URL** | https://gate-wise-iota.vercel.app |
| **`main` SHA** | `af5fe2109714dcad8b4f0cf7f72c2561d3656cbe` (`af5fe21`) — Phase A complete |
| **Recommend scope (unchanged until GW-X)** | SFO Terminal 2 **D Gates**; 12 verified facilities; directed zone-time **demo model** |
| **Shipped product** | P0 B+C, GW-F1–F3, Level 2.0–2.7 UX, Phase A hours/amenity UI, security headers |
| **Prior production SHAs** | `7010c32` (GW-A-002); `b0b58c6` (Level 2.7); `35ef72d` (GW-F3 security RC) |

## Completed (preserve — do not regress)

| Track | Deliverable | Notes |
| --- | --- | --- |
| P0 | Engine, cards, What-if, deploy | `recommendFacilities` contract §4 `PLAN.md` |
| GW-015 | Terminal schematic + a11y | Orientation only — not navigation |
| GW-F1–F3 | Personalization, countdown, integration | `docs/GW-F-CONTRACT.md` |
| Security RC | CSP, frame deny, countdown policy | `next.config.ts` headers |
| Level 2.x | Multipage session, layout rail, countdown dock | `b0b58c6` |
| **Phase A** | GW-A-R001/R002, GW-A-001/002/003 | **G-A0/G-A1**; shipped @ `af5fe21` |
| Submission | Devpost + demo artifacts | Historical; `docs/DEMO_SCRIPT.md` |

## Active development — Phase X → B → C → D

**Why:** Phase A proved verified listing extraction for T2 D Gates. The product goal is **SFO-wide facility discovery** with staged verification — not a single big-bang dataset or silent recommend expansion.

**Execution plan:** `docs/IMPLEMENTATION_PLAN.md` § Phase X–D. **Product gates:** `PLAN.md` §13.

### Phase X — SFO-wide expansion (**current priority**)

| Order | ID | Type | Summary | Depends on | Gate |
| --- | --- | --- | --- | --- | --- |
| 1 | **GW-X-R001** | Research | Official SFO terminal, boarding area, gate, security-access, facility sources | — | **G-X0** |
| 2 | **GW-X-R002** | Research | Location & facility matrix: IDs, relationships, confidence, gaps | GW-X-R001 | **G-X0** |
| 3 | **GW-X-001** | Implement | Extend airport/terminal/boarding-area/gate/facility contracts; preserve legacy D behavior | **G-X0** | **G-X1** |
| 4 | **GW-X-002** | Implement | Add verified facilities in **staged batches** (not all SFO at once) | GW-X-001, **G-X1** | **G-X2** |
| 5 | **GW-X-003** | Implement | Multi-terminal directory UI, filters, location labels, limitation copy | GW-X-002 milestone, **G-X2** | **G-X3** |
| 6 | **GW-X-004** | Implement | Integration & regression (tests, D Gates smoke, recommend safety) | GW-X-003 | **G-X3** |

**Acceptance (Phase X):** No invented facilities or hours; browse vs **recommend eligibility** explicitly separated; existing **12** D records + recommend behavior unchanged unless lead approves a dedicated eligibility task; provenance per row.

### Phase B — Distance & walking time (after Phase X foundation)

| Order | ID | Type | Summary | Depends on | Gate |
| --- | --- | --- | --- | --- | --- |
| 1 | **GW-B-R001** | Research | Indoor routing / distance (SFO maps, APIs, third-party); licenses | **G-X3** (recommended) | **G-B0** |
| 2 | **GW-B-001** | Design | Travel-edge policy: `verified` \| `demo_estimate` \| `unknown` | GW-B-R001 | **G-B0** |
| 3 | **GW-B-002** | Implement | Labeled matrix/edge updates; directed asymmetry | GW-B-001, **G-B0** | **G-B1** |

**Note:** Walking-time work applies to **recommendation eligibility**, not merely listing facilities in the directory.

### Phase C — Product usability (after X; overlaps B where routing copy matters)

| Order | ID | Type | Summary | Depends on | Gate |
| --- | --- | --- | --- | --- | --- |
| 1 | **GW-C-001** | Implement | Expanded discovery/detail polish beyond GW-A-003 baseline | **G-X3** | **G-C0** |
| 2 | **GW-C-002** | Implement | Hours/timezone UX hardening at airport scale | GW-A-003, GW-X-003 | **G-C0** |
| 3 | **GW-C-003** | Implement | First-run orientation for SFO-wide scope | GW-C-001 | **G-C0** |

### Phase D — GW-E two-stop planner (deferred)

| ID | Summary | Preconditions |
| --- | --- | --- |
| **GW-E1** | Pure two-stop engine + tests | **G-E** + **G-Data** (**G-X3** + **G-B1** + **G-C0**) |
| **GW-E2** | **My Plan** UI | GW-E1 |

Do **not** start GW-E until **G-Data** closes and the human lead re-issues **G-E**.

## Archived / historical

| Item | Reason |
| --- | --- |
| Hackathon M1–M6, gates G0–G6 | Event complete |
| GW-F0–F3 queue | **Shipped** |
| Phase A task queue (GW-A-*) | **Shipped** @ `af5fe21` |
| Level 2.5–2.7 layout | **Shipped** |
| “T2 D-only forever” scope note | Superseded by Phase X — **recommend** scope still D until eligibility task |

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
3. **Travel matrix (Phase B):** Revert `travel-times.ts` to labeled baseline.
4. **Production:** Vercel promote prior deployment (e.g. `af5fe21` parent) without rewriting Git history.

## Minimum acceptance before next production release

- All tests + build green on release branch.
- Security headers reviewed if `next.config.ts` changes.
- Smoke: Flight, Explore, Results, Plan; Phase A facility copy; expanded directory if X UI ships.
- `docs/data-provenance.md` updated for new rows.
