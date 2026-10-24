# GateWise — Remaining work roadmap

Last updated: 2026-10-24 (GW-F planning).  
**Task IDs are not authorization to implement** unless the human Engineering Lead assigns them.

## Stable release baseline

| Item | Value |
| --- | --- |
| **Production URL** | https://gate-wise-iota.vercel.app |
| **`main` SHA** | `665e5e85a9b30b8114c678c7097a3b9ce5e9e805` (`665e5e8`) |
| **Scope** | P0 B+C, GW-015 collapsible D Gates schematic, GW-020 deploy, GW-021 submission docs, GW-022 production regression (keyboard `<details>` concern triaged — real browser PASS) |

## Completed (preserve — do not regress)

| ID | Deliverable | Status |
| --- | --- | --- |
| GW-012–014 | Engine + ranked cards | On `main` |
| GW-015 | Terminal schematic + collapse/a11y fix | On `main` @ `665e5e8` |
| GW-017 | What-if simulator | On `main` |
| GW-020 | Production deploy + smoke | Live URL above |
| GW-021 | README/Devpost drafts | Docs on repo branches; lead may promote README |
| GW-022 | Production regression report | `docs/gw022-production-regression-report.md` on `feat/data-utils` |

## Active development track — GW-F (approved order)

Technical contract: **`docs/GW-F-CONTRACT.md`**. Implementation tasks: **`docs/IMPLEMENTATION_PLAN.md`** (GW-F1 / GW-F2 / GW-F3).

| Phase | Summary | Owner | Gate |
| --- | --- | --- | --- |
| **GW-F1** | Per-facility user queue/activity overrides; precedence over demo; no dataset mutation | Support Codex | **G-F1** — modules + tests merged for lead integration |
| **GW-F2** | Boarding-start countdown (device clock); pause/resume/clear | Support Codex | **G-F2** — countdown module + tests |
| **GW-F3** | Wire F1+F2 into recommendations & What-if; full regression | Lead Cursor | **G-F3** — acceptance before any GW-E work |
| **GW-E** | Two-stop time-budget planner | Support (logic) + Lead (UI) | **G-E** after **G-F3** only |

**Contract docs branch:** `feature/gw-f-contracts` (planning); logic work expected on `feature/gw-f-logic` after **G-F0** contract approval.

## Optional submission polish (non-blocking for GW-F)

| ID | Owner | Notes |
| --- | --- | --- |
| GW-021 | Lead + Teammate | Promote README; align Devpost with `665e5e8` + live URL |
| GW-023 | Teammate + Lead | Demo recording ≤5 min; Devpost submit per event rules |

Teammate Codex may execute these in parallel; **must not block** GW-F1/F2.

## Suggested priority order

1. **Merge** `feature/gw-f-contracts` → `main` when lead approves (documentation only).
2. **Authorize GW-F1-001** (Support) — duration override modules per contract.
3. **Authorize GW-F2-001** (Support) — countdown module (can follow F1 or parallel after contract freeze).
4. **Authorize GW-F3-*** (Lead) — integration + regression on feature branch → merge → deploy.
5. **GW-E** only if **G-F3** + **G-E** explicit approval and submission timeline safe.

## Rollback strategy

1. **F features:** Revert GW-F3 integration commit; pure F1/F2 modules unused if UI wiring removed.
2. **Schematic:** Remove `TerminalSchematic` block from `GateWiseHome.tsx` (GW-015 rollback) without touching engine.
3. **Production:** Vercel promote prior deployment to last known good `main`.

## Minimum acceptance after GW-F3

- All P0/GW-015 hero scenarios still pass (`npm test`, build, production smoke).
- User override: partial queue-only override; demo precedence respected.
- Countdown: tick updates minutes; pause holds; clear returns to manual.
- What-if: baseline/scenario rules per `docs/GW-F-CONTRACT.md` §5.2.
- No changes to official `facilities.json` rows from user input.
