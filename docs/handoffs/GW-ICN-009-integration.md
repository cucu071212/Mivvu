# GW-ICN-009 — local integration checkpoint

**Plan revision:** `GW-PLAN-REV-2026-10-26`
**Owner:** Cursor (human owner dispatch, 2026-10-28)
**Worktree:** `/Users/wonjonghun/.codex/worktrees/gw-icn-009-integration/GateWise`
**Branch:** `codex/gw-icn-009-integration`
**Base / HEAD:** `5bd3121f6aac992ac1b5d59e33c1e68d65c40170` (matches verified remote `main`)
**State:** packaged on feature branch (see commit SHA in checkpoint after push)
**Human authorization (2026-10-28):** Accepted reviewed 007/008 integration; authorized explicit-file commit, normal push, PR against `main`, and ordinary Vercel preview. **Merge and production remain unauthorized.**

## Packaging follow-ups (2026-10-28)

1. Removed obsolete “Cursor review pending” wording from implementation plan rows (technical reviews completed; human acceptance recorded separately).
2. Strengthened `icn-search-fallback-integration.test.ts` duplicate-row regression to assert exact `id` order for strong and typo queries (`browse-0`, `browse-1` by catalog ordinal).

## Prior integration verification (pre-packaging)

## Sources preserved (byte-for-byte unchanged)

| Worktree | Branch | Post-integration SHA (key shared files) | Status unchanged |
| --- | --- | --- | --- |
| `/Users/wonjonghun/Desktop/GateWise` | `codex/gw-icn-007-snapshot-quality` | `icn-browse-view-model.ts` `b845d8dc…` | Same dirty/untracked set as at start |
| `/Users/wonjonghun/.codex/worktrees/gw-icn-008-search/GateWise` | `codex/gw-icn-008-search` | `icn-browse-view-model.ts` `9e16d059…` | Same dirty/untracked set as at start |

Full pre-integration hashes recorded in [GW-ICN-008-preservation.json](GW-ICN-008-preservation.json) (007 manifest).

## Transfer inventory

**From GW-ICN-007:** snapshot matching/quality modules, validate CLI, `icn-browse-display.ts` (+ tests), `icn-browse-view-model.ts` (+ tests, pre-search), screen runtime, `package.json` (`quality:icn-snapshots`), `docs/data/icn-snapshot-quality-gate.md`, `scripts/check-icn-snapshots.mjs`, `icn-shipped-output.test.ts`, implementation plan row (007).

**From GW-ICN-008:** `icn-facility-search.ts` (+ unit/catalog/evidence tests), `MivvuIcnFacilitiesBrowseScreen.test.tsx`, `e2e/icn-facility-search.mobile.spec.ts`, handoffs (008 checkpoint, evidence, screenshots, preservation JSON), implementation plan row (008).

**GW-ICN-009 only:** `icn-search-fallback-integration.test.ts`, this checkpoint, merged `docs/IMPLEMENTATION_PLAN.md` (007/008/009 rows).

**Not copied:** `.DS_Store`, credentials, `node_modules` (clone-copied locally for verification only).

## Conflict resolutions

| File | Resolution |
| --- | --- |
| `icn-browse-view-model.ts` | **007** shared `collapseDuplicateListings` / `icnFacilityContentFingerprint` via `icn-snapshot-matching.ts`. **008** `getIcnSearchIndex` + `searchIcnIndex` in `filterIcnBrowseItems` only. Removed legacy substring helpers. **Did not** restore 008 inline collapse. Integrated file SHA-256: `56b87adbcf30be3f268a7ff30444751564a37479bc1708c446f55682073cd45a`. |
| `icn-browse-display.ts` | **007** bidirectional `buildKoreanFallbackIndex(ko, en)` + `matchUnambiguousIcnRecords`. |
| `MivvuIcnFacilitiesBrowseScreen.tsx` | **007** `buildKoreanFallbackIndex(catalogKo.items, catalogEn.items)` on full catalogs; search/filter unchanged in screen. |
| `MivvuIcnFacilitiesBrowseScreen.test.tsx` | **008** extended tests (composition, fallback/search separation). |
| `docs/IMPLEMENTATION_PLAN.md` | Rows for **007**, **008**, and **009**; Cursor review notes; integration `n/a`. |
| `package.json` | **007** (includes `quality:icn-snapshots`). |

## Verification actually run (integration worktree)

| Check | Result |
| --- | --- |
| Combined unit/component tests (9 files, 100 tests) | **PASS** |
| `icn-search-fallback-integration.test.ts` (3) | **PASS** — ambiguity hidden by terminal filter; full-catalog fallback; search keeps distinct same-id rows |
| `npm run lint` | **PASS** |
| `tsc --noEmit` | **PASS** |
| `npm run build` | **PASS** |
| `git diff --check` (tracked) | **PASS** |
| CLI self-comparison (shipped fixtures) | **PASS**, exit 0 |
| CLI invalid JSON / usage | exit **1** / **2** |
| Fixture SHA-256 KO/EN | Unchanged (`0bcde726…`, `31e9ddbe…`) |
| E2E `icn-facility-search.mobile.spec.ts` | **2/2 PASS** (CDP composition — not native OS IME) |
| E2E `airport-selection.spec.ts` | **7/7 PASS** |

**Not run:** full 1051-test suite, full 29-spec e2e sweep, `ICN_SEARCH_EVIDENCE=1` opt-in benchmark.

## Skills used

- **verification-before-completion** — all claims above from executed commands in this worktree
- **systematic-debugging** — integration regression failures (fallback test expectations)
- **test-driven-development** — new integration regression file written before re-run

## Limitations

- Synthetic composition/IME only in browser tests.
- `node_modules` copied from Desktop clone for isolation; no lockfile or dependency change.
- Combined behavior published on feature branch; merge/production **pending** separate authorization.

## Next action (recovery)

1. Codex: optional follow-up on **integration delta** only if PR review requests — not a repeat audit of unchanged 007/008 internals.
2. Human owner: merge/production decision remains separate.
3. On interrupt: verify source worktree hashes, then PR head SHA vs local commit.
