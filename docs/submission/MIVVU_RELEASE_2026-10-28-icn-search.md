# Mivvu / ICN — production release record (search + snapshot quality integration)

**Task:** GW-ICN-009 (integrates GW-ICN-007 + GW-ICN-008)
**Plan revision:** `GW-PLAN-REV-2026-10-26`
**Human authorization:** 2026-10-28 — merge [PR #3](https://github.com/cucu071212/Mivvu/pull/3) and production deployment (after protected preview smoke)
**Release executor:** Cursor
**Final reviewer:** human owner

Prior **Mivvu entry + ICN browse** release (GW-ICN-006) remains in [`MIVVU_RELEASE_2026-10-28.md`](./MIVVU_RELEASE_2026-10-28.md) (`556943b`). Historical **SFO hackathon** facts remain in [`RELEASE_FACTS.md`](./RELEASE_FACTS.md) (`c9c163c`, deployment `dpl_AVbZEGA48z5evM1GRRssLPfAgQLF`).

## Identity

| Field | Value |
| --- | --- |
| Production alias | https://gate-wise-iota.vercel.app |
| Repository | https://github.com/cucu071212/Mivvu |
| **`main` merge SHA** | `bb4735d07f9b5cb68c6b44944ee76e994df801a8` |
| Prior `main` base (PR #3) | `5bd3121f6aac992ac1b5d59e33c1e68d65c40170` |
| Integrated feature SHA (PR head) | `aac53a31f76fa520321334d360c22a98048a99cf` |
| PR | [#3](https://github.com/cucu071212/Mivvu/pull/3) — merged 2026-10-28 (GitHub merge commit) |
| GitHub Actions regression (PR head) | Run **40770942071** — success on `aac53a3` |
| Vercel production (merge commit) | **success** — [deployment](https://vercel.com/gate-wise/gate-wise/8NwdsbYZE9iMtqiqCjiv4fktBibz) |

## What shipped

- **GW-ICN-007:** Offline ICN snapshot validation/quality CLI, deterministic KO/EN comparison, shared matching/collapse for duplicate listings, safer P3 bilingual display fallback (fixtures unchanged).
- **GW-ICN-008:** Local ICN facility search (Unicode, Korean initial consonants, conservative English typo recovery, deterministic ranking) wired into browse filtering only.
- **GW-ICN-009:** Integrated view-model (007 collapse + 008 search), integration regression tests, maintainer docs under `docs/data/icn-snapshot-quality-gate.md`.

SFO demo scope (**26** browse / **12** recommend) preserved on the same alias.

## Known limits (unchanged)

- Fixtures remain **saved snapshots**; not live open/closed, queues, or walking times.
- Documented API `totalCount` mismatch vs deduped browse count; duplicate `sn` handling per integration handoff.
- Search IME coverage: strong synthetic/unit evidence; **native OS IME/devices not fully verified** in production smoke.
- Offline quality CLI is **maintainer-only** — not a public production endpoint.

## Evidence

- [Production smoke (2026-10-28, ICN search integration)](../qa/mivvu-production-smoke-2026-10-28-icn-search.md)
- [Integration checkpoint](../handoffs/GW-ICN-009-integration.md)
- [Snapshot quality gate usage](../data/icn-snapshot-quality-gate.md)
