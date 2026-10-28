# Mivvu / ICN mobile — production release record

**Task:** GW-ICN-006  
**Plan revision:** `GW-PLAN-REV-2026-10-26`  
**Human authorization:** 2026-10-28 — merge [PR #2](https://github.com/cucu071212/Mivvu/pull/2) and production deployment  
**Release executor:** Cursor  
**Reviewer:** human owner  

Historical **SFO hackathon closeout** facts remain in [`RELEASE_FACTS.md`](./RELEASE_FACTS.md) (`c9c163c`, deployment `dpl_AVbZEGA48z5evM1GRRssLPfAgQLF`). This document records the **2026-10-28 Mivvu entry + ICN browse** promotion without rewriting that baseline.

## Identity

| Field | Value |
| --- | --- |
| Product entry | **Mivvu** first-entry shell at `/` |
| ICN browse | `/icn` (static KO/EN fixtures) |
| SFO demo (preserved) | `/flight`, `/explore`, `/recommendations`, `/plan` after airport acknowledgment |
| Repository | https://github.com/cucu071212/Mivvu |
| Production alias | https://gate-wise-iota.vercel.app |
| **`main` / merge SHA** | `556943b020749405f34f4b21622fbd1f5993bce0` |
| Prior `main` base (PR #2) | `c8b278fb7da37249ee261bdc20a36156fb39f799` |
| PR | [#2](https://github.com/cucu071212/Mivvu/pull/2) — merged 2026-10-28T15:43:25Z (GitHub; fast-forward to release SHA) |
| Vercel commit status | **success** — [deployment](https://vercel.com/gate-wise/gate-wise/5jA6L2Fo3MffGQ2AjrwcputsQNgW) |
| GitHub Actions E2E (head) | Run **40715902323** — success on `556943b` (owner-verified pre-release) |

## What shipped

- Mivvu brand intro (timed; reduced-motion bypass) then airport selection on `/`.
- ICN facility directory: search, terminal filters, KO/EN toggle with persisted locale on entry routes; **1,011** deduped listings per language from saved snapshots.
- SFO handoff: session/storage airport acknowledgment; deep link to `/explore` returns to selection until SFO is chosen; SFO GateWise surfaces unchanged in scope (26 browse / 12 recommend).
- Legacy preview URLs redirect: `/preview/mivvu-entry` → `/`, `/preview/mivvu-entry/icn` → `/icn`.
- SEC-01/02/03 packaging from GW-ICN-005 (sanitized ICN client errors, server-only credential boundary, tightened CSP allowances documented in security preflight).

## Known limits (unchanged)

- **P3 (nonblocking):** ambiguous Korean name/location fallback matching — not resolved in this release.
- Fixtures are **saved snapshots**, not live open/closed, queues, coordinates, or walking times; API total mismatch and duplicate `sn` documented in GW-ICN-004 evidence.
- No active penetration test; owner skipped Strix/Shannon — not a security guarantee.
- SFO submission counts and `legacy-d-v1` manifest remain the historical hackathon record; production now **also** serves Mivvu/ICN entry routes on the same alias.

## Evidence

- [Production smoke (2026-10-28)](../qa/mivvu-production-smoke-2026-10-28.md)
- [Preview QA + P2 corrections](../qa/mivvu-preview-qa.md)
- [Security preflight](../security/mivvu-preflight-review.md)
- **Follow-on (same alias):** [GW-ICN-009 ICN search + snapshot integration](./MIVVU_RELEASE_2026-10-28-icn-search.md) — `bb4735d` via PR #3
