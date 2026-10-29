# GW-ICN-013 — Implementation checkpoint (post Codex review corrections)

Plan revision: **GW-PLAN-REV-2026-10-29**  
Execution permission: **authorized** (direct human dispatch + lifecycle correction follow-up)  
Worktree: `/Users/wonjonghun/Desktop/GateWise/.worktrees/feat-gw-icn-013-detail`  
Branch: `feat/gw-icn-013-detail`  
Base SHA: `fcf46eb5b17263acf85e588928d3a2490e227651`  
Review source: `/private/tmp/GW-ICN-013-final-reverify/GW-ICN-013-findings-2-3-final-review.md` (supersedes prior lifecycle handoff claims where they conflict)

## Ownership model (single source of truth)

| Concern | Owner | Observable contract |
| --- | --- | --- |
| **Hub filters** (query / terminal) | `icn-browse-hub-filters.ts` module cache | `getIcnBrowseHubFiltersSnapshot` / `getIcnBrowseHubFiltersServerSnapshot` are **pure reads** (silent mirror of scheduled restore only; no listeners/events). Mutations via `setIcnBrowseHub*` publish then notify. **`commitScheduledHubRestoreIfIdle`** consumes session restore (respects user-edits flag); triggered from hub **subscribe** or session bridge — never from attach-only reset. |
| **Browse→detail navigation context** | `icn-browse-session.ts` + sessionStorage | Payload + `visitToken`; **one-shot** `MIVVU_ICN_BROWSE_ORIGIN_INTENT_KEY` on card click; active token; in-memory registration + `committedBrowseOriginVisitToken` for Strict Mode replay. |
| **One-time list restore** | Session flag `restoreOnNextHubVisit` | Set only by `scheduleHubRestoreFromDetail` when `fromBrowse`; consumed once by `commitScheduledHubRestoreIfIdle` on hub. |

**Prior problem:** three concerns leaked into each other — snapshot reads registered bridges and published; subscribe attach reset filters; registration mutated origin without notifying `useSyncExternalStore`; persisted `pagehide` kept active token so a new document could self-register from stale storage.

## Lifecycle transitions (authoritative)

| Event | Navigation context | Browse-origin UI | Hub restore |
| --- | --- | --- | --- |
| Browse card click | `save…` + intent + active token | — | — |
| Detail mount (layout) | Consume intent **or** `reattachCommittedBrowseOriginVisit` (Strict replay) **or** BFCache `pageshow` resume | `registerActiveDetailVisit` → **notifySessionChange** | — |
| Detail → list (`fromBrowse`) | `scheduleHubRestoreFromDetail` | — | Flag set; consumed on hub subscribe/commit |
| `pagehide` non-persisted / last unmount | `abandon…` clears all | Registration cleared | — |
| `pagehide` persisted (BFCache) | **`suspendDetailVisitAuthorizationOnCachedDeparture`** (payload kept, active token cleared) | Registration cleared | — |
| Direct URL / re-entry (no intent) | Stale payload may remain; **no registration** | Direct-entry banner; list does not schedule restore | — |
| KO/EN toggle | Unchanged | Reads registration via session store (no incidental rerender required) | — |

## Review finding corrections

| # | Finding | Correction |
| --- | --- | --- |
| 1 | Storage getter/method throws crash detail via unguarded `sessionStorage` in `useSyncExternalStore` / back handler | Centralized `getIcnSessionStorage`, `safeIcnSessionGetItem`, etc. in `icn-browse-session.ts`; detail uses guarded reads only. E2E: storage getter `SecurityError` probe — detail renders and “목록으로” reaches `/icn`. |
| 2 | Tab-wide `"1"` flag + stale restore | **Final lifecycle pass:** Browse-origin requires **intent consumption** or committed replay token + live registration; persisted departure **suspends** active token; registration **notifies** session subscribers (`useLayoutEffect`). |
| 3 | Hub store side effects | **Final lifecycle pass:** Pure snapshot reads; bridge only on subscribe; no reset on extra subscribers; `hubFiltersDirtyFromUser` blocks restore overwrite. |
| 4 | Detail rebuilt 2,022 refs per request | `MivvuIcnFacilityDetailPage` uses `buildIcnBrowseCatalog` for snapshots/fallback; full `referenceCatalogs` kept for resolution only. |
| 5 | Task ID in save copy | Removed staged save line from detail UI; no public task IDs. |
| 6 | “Not included” over directory flags | `icnDetailDirectoryLabel` (“목록 구분” / “Directory labels”) for arrival/duty-free rows. |

## Corrected earlier checkpoint claims

- **Link vs anchor:** Native `<a>` remains valid; reviewer did not reproduce URL-length-only `Link` failure. Not claimed as root cause in this checkpoint.
- **Turbopack:** Default build failure with **symlinked** `node_modules` is environmental; reviewer confirmed default Turbopack **PASS** with physical dependencies. CI uses `npm ci` (physical tree). Local verification: `npm run build -- --webpack` **PASS** (worktree symlink).
- **Lint:** Prior “eslint PASS” on changed files only; full **`npm run lint`** is the CI gate and now passes on corrected source.

## Detail-path timing (comparable local probe)

Warm KO+EN fixtures in Node (`icn-facility-detail-page.perf.test.ts`, three samples each, median of triplet):

| Path | Median (this run) |
| --- | --- |
| Ordinary `buildIcnBrowseCatalog` ×2 (detail uses this) | **2.4 ms** |
| Ref-bearing `buildIcnBrowseCatalogWithDetailRefs` ×2 (removed from detail) | **3901.6 ms** |

Cold vs warm: test warms both paths before sampling; numbers are **local Node observations**, not production SLA. Reviewer probe cited ~3.9–4.1 s for ref-bearing projections on same fixture scale.

Review source: `/private/tmp/GW-ICN-013-ownership-reverify/GW-ICN-013-ownership-reverification.md`

## Ownership corrections (A/B/C — 2026-10-29)

| Defect | Fix |
| --- | --- |
| **A BFCache resume** | `documentBrowseOriginVisitToken` (in-memory, per document) set only when browse intent is consumed; `resumeBrowseOriginAfterBfcache` requires `documentBrowseOriginVisitToken === session.visitToken` (no adoption from tab storage alone). |
| **B Snapshot purity** | Removed silent mirror from `getIcnBrowseHubFiltersSnapshot`; restore applies only via `commitScheduledHubRestoreIfIdle` on subscribe/session bridge. |
| **C Publish before notify** | Hub commit uses `clearIcnBrowseSessionContextSilently()` then `publishFilters`; `hubRestoreCommitInProgress` blocks bridge reset during commit. |

## Regression evidence (ownership pass)

| Command / check | Result |
| --- | --- |
| Worktree tests (session + hub + lifecycle + silent-mirror + publish-order) | **PASS** (25+ in focused set; 204/208 icn-facilities suite) |
| `vitest --config /private/tmp/GW-ICN-013-ownership-reverify/contract.config.mts` | **PASS** (2/2) |
| Author copies: `icn-browse-hub-filters-silent-mirror.test.ts`, `…-publish-order.test.ts` | In repo |
| `npm run lint` / `tsc --noEmit` | **PASS** (0 errors) |
| `npm run build -- --webpack` | **PASS** |

**Superseded claims:** Silent mirror on snapshot read; `consumeHubRestoreFilters` inside hub commit before publish; `resumeBrowseOriginAfterBfcache` inferring ownership from session only; prior “10/10 immutable lifecycle” includes probe #17 expecting restore via read alone — author lifecycle test now commits via subscribe.

**Immutable reviewer note:** `/private/tmp/GW-ICN-013-reverify/lifecycle.test.tsx` probe #17 still expects pre-purity behavior; author `icn-browse-lifecycle.test.tsx` is the updated contract.

**Reviewer-owned obsolete probe (not copied):** `/private/tmp/GW-ICN-013-reverify/lifecycle.config.mts` test #1 expects hub restore via `getIcnBrowseHubFiltersSnapshot()` alone after `scheduleHubRestoreFromDetail` — superseded by contract **B** (pure getters). Repository coverage: `icn-browse-hub-filters-current-contract.test.ts` (3 cases) + `icn-browse-hub-filters-commit-guard.test.ts` (publish-callback edit + guard), plus existing silent-mirror, publish-order, and lifecycle subscribe-then-read tests.

## Acceptance and publication (2026-10-29)

| Gate | State |
| --- | --- |
| Human acceptance | **Accepted** (direct human decision after `/private/tmp/GW-ICN-013-abc-reverify/GW-ICN-013-ABC-verification.md`) |
| Work progress (implementation) | **Complete** (unchanged since A/B/C pass) |
| Review / acceptance | **Accepted** |
| Integration / release | **Publication only** — PR opened; **no merge**, **no production deploy** |

**Final verification (closeout):** Focused vitest suite **26/26 PASS** (current-contract, commit-guard, lifecycle, session, hub, silent-mirror, publish-order). Browser evidence reused from ABC verification (production BFCache direct-entry vs browse-origin, list restore, Strict Mode dev, storage SecurityError). Full browser campaign not re-run.

**Publication commit:** see GATEWISE STATUS (branch `feat/gw-icn-013-detail`).

### Browser (production — independent ABC review, reused for closeout)

| Case | Result (ABC independent review) |
| --- | --- |
| BFCache direct-entry document B → Back | **PASS** — direct-entry banner; list empty / T2 off |
| Genuine browse-origin BFCache resume | **PASS** — facility list; ARABICA/T2 restored |
| Immediate browse origin after card nav | **PASS** |
| One-time list restore | **PASS** |
| Dev Strict Mode return | **PASS** |
| sessionStorage SecurityError | **PASS** |

## Remaining limitations

- Hub restore remains sessionStorage one-shot (not GW-ICN-017).

## Codex re-verification handoff (A/B/C + regressions) — **closed**

Human acceptance recorded; publication authorized. No further Codex pass required for GW-ICN-013 unless integration finds a regression.
