# GateWise — Remaining work roadmap

Last updated: **2026-10-25** (post-Devpost submission; Level 2.7 on production).  
**Task IDs are not authorization to implement** unless the human Engineering Lead assigns them.

## Stable release baseline

| Item | Value |
| --- | --- |
| **Production URL** | https://gate-wise-iota.vercel.app |
| **`main` SHA** | `e2772d3` (GW-A-001 merged); GW-A-002 enrichment pending merge on feature branch |
| **Scope** | SFO Terminal 2 **D Gates** only; 12 verified facilities in `facilities.json`; directed zone-time **demo model**; multipage App Router (`/`, `/explore`, `/recommendations`, `/plan`) |
| **Shipped product** | P0 B+C, GW-015 schematic, GW-F1–F3, Level 2.0–2.7 UX, security headers (CSP, frame deny, etc.) |
| **Prior production SHAs** | `35ef72d` (GW-F3 security RC); `665e5e8` (MVP P0 tag `mvp-p0-baseline-665e5e8`) |

## Completed (preserve — do not regress)

| Track | Deliverable | Notes |
| --- | --- | --- |
| P0 | Engine, cards, What-if, deploy | `recommendFacilities` contract §4 `PLAN.md` |
| GW-015 | Terminal schematic + a11y | Orientation only — not navigation |
| GW-F1–F3 | Personalization, countdown, integration | `docs/GW-F-CONTRACT.md` |
| Security RC | Strict minutes, production CSP, countdown clock policy | `next.config.ts` headers |
| Level 2.x | Mobile-first UX, premium tokens, multipage session, layout rail + countdown dock | Merged via `b0b58c6` |
| Submission | Devpost + demo artifacts | Historical; see `docs/DEMO_SCRIPT.md` |

## Active development — data-first (Phase A → D)

**Why:** The app is deployable and honest about **unknown** queue/activity times, but travelers still lack **official hours, richer facility facts, and credible walk labels**. Next work prioritizes **verified data** over UI polish or GW-E.

**Execution plan (task IDs, owners, tests):** `docs/IMPLEMENTATION_PLAN.md` § Post-submission Phase A–D.  
**Product gates:** `PLAN.md` §12.

### Phase A — Verified airport data (current priority)

| Order | ID | Type | Summary | Depends on | Gate |
| --- | --- | --- | --- | --- | --- |
| 1 | **GW-A-R001** | Research | Audit official SFO sources/APIs; document what is publishable vs unavailable; update `docs/data-provenance.md` | — | **G-A0** |
| 2 | **GW-A-R002** | Research | Per-facility hours + amenity field extraction plan for all **12** shipped facilities | GW-A-R001 | **G-A0** |
| 3 | **GW-A-001** | Implement | Extend facility schema + validators (hours, amenities, location precision) without breaking recommend safety | **G-A0** | **G-A1** |
| 4 | **GW-A-002** | Implement | Populate enriched records from verified sources only; refresh `lastCheckedAt` | GW-A-001 | **G-A1** |
| 5 | **GW-A-003** | Implement | UI: facility detail + hours presentation with unknown/live disclaimers | GW-A-002 | **G-A1** |

**Acceptance (Phase A):** Every new field has source URL + checked date or is explicitly `unknown`; `npm test` + validation tests pass; no recommendation threshold changes without documented re-baseline; no invented hours or queues.

### Phase B — Distance & walking time

| Order | ID | Type | Summary | Depends on | Gate |
| --- | --- | --- | --- | --- | --- |
| 1 | **GW-B-R001** | Research | Indoor routing / distance options (SFO maps, third-party); license and accuracy limits | **G-A1** | **G-B0** |
| 2 | **GW-B-001** | Design | Document travel-edge model: `verified` \| `demo_estimate` \| `unknown` per directed edge | GW-B-R001 | **G-B0** |
| 3 | **GW-B-002** | Implement | Apply matrix/edge updates only where policy allows; keep directed asymmetry | GW-B-001, **G-B0** | **G-B1** |

**Acceptance (Phase B):** No edge presented as measured without provenance; missing edges stay `unknown` (not 0); hero demo scenarios in `PLAN.md` §5 still pass or are explicitly revised in docs.

### Phase C — Real-world usability

| Order | ID | Type | Summary | Depends on | Gate |
| --- | --- | --- | --- | --- | --- |
| 1 | **GW-C-001** | Implement | Facility detail surfaces (Explore + Results) using Phase A data | **G-A1** | **G-C0** |
| 2 | **GW-C-002** | Implement | Opening-hours UX (schedules, unknown, “not live availability”) | GW-A-003 | **G-C0** |
| 3 | **GW-C-003** | Implement | First-run / discovery improvements tied to real data (not generic tours) | GW-C-001 | **G-C0** |

**Acceptance (Phase C):** Mobile smoke on all four routes; accessibility spot-check; copy still states model-only, not boarding guarantee.

### Phase D — GW-E two-stop planner (deferred)

| ID | Summary | Preconditions |
| --- | --- | --- |
| **GW-E1** | Pure two-stop engine (both orders), tests independent of implementation | **G-E** + **G-Data** (`G-C0` + **G-B1**) |
| **GW-E2** | **My Plan** UI wiring (placeholder exists) | GW-E1 merged |

Do **not** start GW-E until Phase A–C gates close and the human lead re-issues **G-E**.

## Archived / no longer on active roadmap

| Item | Reason |
| --- | --- |
| Hackathon milestones M1–M6, gates G0–G6 | Event complete |
| GW-F0–F3 authorization queue | **Shipped** on `main` |
| GW-021 / GW-023 submission polish | Devpost submitted |
| Level 2.5–2.7 layout refinement | **Shipped** @ `0d1a041` → `b0b58c6` |
| Optional visual polish without data | Deprioritized post-submission |

## Unavailable or unknown data (explicit)

Until research proves otherwise, treat as **not available** for automation:

- Live SFO queue/wait times API
- Live flight / boarding gate API (out of scope permanently for P0+)
- Official turn-by-turn indoor routing API for T2 D Gates
- Real-time open/closed per facility (may only exist as static or marketing copy on flysfo.com)

## Rollback strategy

1. **Data enrichment:** Revert `facilities.json` commit; validators and UI fall back to pre-A schema if migration added.
2. **Travel matrix:** Revert `travel-times.ts` to last `demo_estimate`-labeled baseline.
3. **Production:** Vercel promote prior deployment (e.g. `b0b58c6` parent or `35ef72d`) without rewriting Git history.

## Minimum acceptance before next production release

- All existing tests + build green on release branch.
- Production security headers unchanged unless intentional, reviewed diff in `next.config.ts`.
- Production smoke: Flight, Explore, Results, Plan; countdown dock; personalization invalid gating; What-if independence.
- Data changes: provenance appendix updated in `docs/data-provenance.md`.
