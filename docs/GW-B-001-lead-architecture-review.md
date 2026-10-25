# GW-B-001 — Engineering Lead architecture review

**Review date:** 2026-10-25 (America/New_York)  
**Reviewer:** Engineering Lead Cursor  
**Inputs reviewed:**

| Artifact | Identity |
| --- | --- |
| Unified integration study | `codex/gw-b-e-integration-architecture` @ `f9ab25745d89dbe225b8ffc93b43e870d3751152` — `docs/GW-B-GW-E-integration-architecture.md` |
| Phase B research | `codex/gw-b-r001-routing-research` @ `452686683cb84ff2fa156fc3ea13d8a3b159aa9d` — `docs/walking-time-policy.md` |
| GW-E design | `codex/gw-e-two-stop-design` @ `d32cdd969f443a967f4d7a376138f37f5b31a5bd` — `docs/GW-E-two-stop-planner-design.md` |
| Implementation baseline | `origin/main` @ `47c07028e1eccb3515f8bd8bfddd80f1c90fccdd` |

**Verdict:** **ACCEPT WITH CONDITIONS** — architecture is implementable and preserves current product semantics if C01–C18 and §9 staging are adopted. **Does not authorize G-B0, G-B1, G-Data, or G-E.**

This record supplements the Support integration document; it does not replace human gate sign-off in `IMPLEMENTATION_PLAN.md`.

---

## Lead assessment of C01–C18

| ID | Lead disposition | Notes |
| --- | --- | --- |
| C01 | **Accepted** | Adapter from graph seconds → minute legs matches `ProductionTravelMatrix` / `recommend.ts` separation. |
| C02 | **Accepted** | Explicit `legacy_zone` vs `location_graph` required; matches `RecommendScopeZone = 'D'` and no silent D=3 fallback. |
| C03 | **Accepted** | Legacy keeps scalar `demo_estimate`; graph carries envelope — aligns with `DataConfidence` in `airport.ts`. |
| C04 | **Accepted** | Single ranking objective for displayed minutes; document §6.4 counterexample must become a regression test when E ships. |
| C05 | **Accepted** | Edge vs route-level inaccessibility — prevents over-interpreting blocked edges as whole-airport disconnect. |
| C06 | **Accepted** | **Critical:** partial graph → Unknown, not invented connectivity or `route_unreachable` on incomplete data. |
| C07 | **Accepted** | Qualify fixture docs only; path search may reroute — consistent with honest partial graph. |
| C08 | **Accepted** | One reviewed entrance per facility for pilot; matches “no invented nearest gate” on browse rows. |
| C09 | **Accepted** | Legacy zero test fixtures preserved; graph edges positive between distinct nodes. |
| C10 | **Accepted** | Horizon/buffer validation independent of T — protects countdown + recommend from partial frames. |
| C11 | **Accepted (policy)** | Half-open `[from,until)` needs explicit sign-off in GW-B-001 policy appendix when G-B0 is requested. |
| C12 | **Accepted** | What-if **input** fixed; outputs may refresh when evidence frame changes — matches session/countdown reality. |
| C13 | **Accepted** | Matches GW-F: `official_verified` ≠ guaranteed walk time; resolver sources ≠ predictions. |
| C14 | **Accepted** | **Required:** versioned `approvedFacilityIds` (12 legacy IDs) in code/tests; `zone === 'D'` alone is insufficient (26-row dataset). |
| C15 | **Accepted** | Queue arity explains −7 vs −14; must share one budget core before GW-E1. |
| C16 | **Accepted** | **GW-B-002 metadata-only first** — do not bundle graph search into B-002 without new task ID. |
| C17 | **Accepted** | Legacy matrix tests stay adapter-level; no false triangle assumptions on arbitrary costs. |
| C18 | **Accepted** | Legacy projection layer mandatory before extending public `ProductionRecommendation` unions. |

**No disputed rejections.** Open **policy** items (C11 envelope boundary, freshness intervals) are blockers for **graph** mode only, not for metadata-only B-002.

---

## Contract vs `origin/main` (spot check)

| Area | Baseline behavior | Unified proposal compatibility |
| --- | --- | --- |
| `productionTravelMinutes` | 1×1 `D→D=3`, `demo_estimate` metadata | `legacy_zone` mode preserves matrix; no new SFO minutes without G-B1 evidence |
| `recommendFacilities` | Unknown if null durations; ineligible for scope/security | `BudgetResult` + projection must preserve kinds, reasons, sort, thresholds |
| GW-F resolver / overrides | Precedence + session suppression | `ResolvedStop` uses same resolver inputs |
| What-if | Same engine, fixed scenario minutes field | C12 + `PrepareInput` snapshot revision |
| Countdown | Device clock; recovery failures suppress | Graph `frame`/`recheckBy` additive, not replacing countdown module |
| Browse directory | 26 / 12 split | C14 + graph cannot promote browse-only rows |

Declaration-only TypeScript in the integration doc **typechecked** against baseline types per Support §11; runtime validators and legacy projection **not yet implemented**.

---

## Minimum safe milestone (no unavailable airport evidence)

1. **Merge** `walking-time-policy.md` (R001) and integration architecture (B-001) to `main` as **docs only**.
2. **GW-B-002 (metadata-only)** after **scoped G-B0:** extend `productionTravelMatrixMetadata` / types with per-edge policy fields (`demo_estimate` | `unknown` | future `verified`), provenance refs, asymmetry documentation — **no new numeric legs**, no cross-zone keys, no graph loader.
3. **Regression:** existing 631 tests + explicit “12 ID” guard + P0 recommend cases unchanged.
4. **Defer:** graph validator/resolver, entrance bindings, GW-E1 until blockers in integration §10 cleared and separate tasks authorized.

---

## G-B0 readiness (lead recommendation)

| | |
|--|--|
| **Recommendation** | **HOLD** |
| **Unblock** | (1) Human **GW-B-001** sign-off on this review + merged policy/architecture docs; (2) explicit **metadata-only** GW-B-002 scope in `IMPLEMENTATION_PLAN.md`; (3) C14 approved-ID manifest decision (constant + test). |
| **Does not require** | SFO graph dataset, API license, or GW-E authorization |

---

**Document version:** 1.0
