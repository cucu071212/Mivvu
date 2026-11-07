# GW-ICN-018-HASH-DISPOSITION — handoff (accepted, committed)

**Plan revision:** `GW-PLAN-REV-2026-10-29`
**Worktree:** `.worktrees/gw-icn-018-hash-disposition`
**Branch:** `fix/gw-icn-018-shipped-output-baseline`
**Parent / PR base:** `7dbca210e5e340d3b5a93aebe27053b2db26b17b` (`test/gw-icn-018-core-journey`)
**Reviews:** Antigravity validation boundary; Codex final review + P2 re-verification (`/private/tmp/GW-ICN-018-HASH-DISPOSITION-codex-p2-reverification/REVIEW.md`).

## Human acceptance

**Human owner (2026-11-05):** Accepts hash disposition and sealed companion boundary after **Codex P2 RESOLVED**. Authorizes commit and push of `fix/gw-icn-018-shipped-output-baseline`. **Does not** authorize merge or deployment.

## Summary

1. **`icn-shipped-output.test.ts`** — KO/EN baselines rebaselined (`b6149d16…`, `9d1718c59…`); GW-ICN-014 category keys explain drift from `5bd3121`; GW-ICN-007 output-identical on shipped fixtures.
2. **`icn-goods-services-associate.ts`** — `bindValidatedGoodsServicesCompanion`; registered fast path rechecks **`companionTargetDigestsMatch`** on current fixtures (**Codex P2 fixed**).
3. **`icn-goods-services-adoption.ts`** — bind-once coverage entry; zero counts on invalid input; run-local projection cache (861/162/5/…).
4. **Tests** — adoption + associate regressions including post-bind KO/EN fixture `meta.retrievedAt` mutation (`structuredClone` only; shipped fixture bytes unchanged).

## Codex P2

| Finding | Disposition |
| --- | --- |
| Registered path trusted fixture reference identity after bind | **RESOLVED** — digest recheck before enrichment; associate regressions |

## Independent verification (Codex P2 re-verification)

Author Cursor runs before acceptance did **not** persist logs matching post-P2 **33/33** or **1299/0/6** counts. **Authoritative full-suite evidence for acceptance:**

| Source | Command | Result |
| --- | --- | --- |
| **Codex** (2026-11-05) | `npm test -- --pool=forks --maxWorkers=2 --testTimeout=60000` | **1299 pass / 0 fail / 6 skip — 48.89s** (`…/codex-p2-reverification/full.log`) |
| **Codex** | Associate suite + probe regressions | **15/15**; reproducer **3/3** (same report dir) |

**Reused (not rerun for this publication):** GW-ICN-018 Playwright ICN **15/15** / SFO **10/10**; author focused **33/33** (~23s) and full **~46s** from pre-Codex-log local runs (not saved as canonical evidence).

## Fixture SHA-256 (unchanged)

| Artifact | SHA-256 |
| --- | --- |
| KO core | `0bcde726d1800a1896cba3b73277689f2ab303c6f33aef15cee8ad74f4dfd2f4` |
| EN core | `31e9ddbe9d47ebd86b9a4692f7d2cbebacf043d21d6fef0f40a4729fca69614a` |
| Companion v1 | `45f52bc64da4493f94e2daf02ec319586d983a77cb6df2995a367cd747c36802` |

## Committed scope

- `src/lib/icn-facilities/icn-shipped-output.test.ts`
- `src/lib/icn-facilities/icn-goods-services-adoption.ts`
- `src/lib/icn-facilities/icn-goods-services-adoption.test.ts`
- `src/lib/icn-facilities/icn-goods-services-associate.ts`
- `src/lib/icn-facilities/icn-goods-services-associate.test.ts`
- `docs/handoffs/GW-ICN-018-HASH-DISPOSITION-handoff.md`

**Merge / deploy:** not authorized in this task.
