# GW-ICN-016 checkpoint — local saved facilities

Plan revision: **GW-PLAN-REV-2026-10-29**
Owner: Cursor · Human owner **accepted** **2026-11-04** for publication (commit/push authorized in acceptance task)

## Workspace

| Item | Value |
| --- | --- |
| Worktree | `/Users/wonjonghun/Desktop/GateWise/.worktrees/feat-gw-icn-016-saved-facilities` |
| Branch | `feat/gw-icn-016-saved-facilities` |
| Parent commit | `27ae147ca1c8ec3e804482cee07f75814ba9af7b` |
| Publication commit | Branch tip on `feat/gw-icn-016-saved-facilities` (full SHA in **Publication record** after push) |
| Intended PR base | `codex/gw-icn-015-enrich-data` (PR #13 at coordinator check) |

## Behavior delivered

1. **Detail save/unsave** — `aria-pressed` control on resolved detail; success/failure toasts; no success on storage read/write failure.
2. **`/icn/saved` list** — GW-ICN-019 header saved entry with count badge; empty state + CTA to `/icn`; local-only callout.
3. **Persistence** — `localStorage` key `mivvu.icn.savedFacilities.v1`; survives reload (browser-verified).
4. **Ordering** — most recent `savedAtMs` first; re-save of bilingual duplicate or reopen does not reorder.
5. **Bilingual identity** — narrow adapter merges only when GW-ICN-012 v1 fingerprints match per policy below; not by `sourceId`/name/index.
6. **Stale/missing/ambiguous** — rows stay visible with honest copy; optional **last-known** name/place labeled at save time; remove + reopen detail affordances.
7. **Locale** — same stored serialized ref; list/detail resolve with active locale + existing KO fallback rules.
8. **Navigation** — browse-origin and saved-origin session keys; back from detail returns to browse (with restore flag) or saved list; browse hub filters session not cleared when visiting saved list.
9. **SSR/hydration** — saved store server snapshot empty; client `useSyncExternalStore` with memoized snapshots (no render-phase writes).

## Persisted format (v1)

```json
{
  "version": 1,
  "items": [
    {
      "serializedRef": "<serializeIcnFacilityRef output>",
      "savedAtMs": 1730000000000,
      "lastKnown": {
        "displayName": "…",
        "placeLine": "T2 · 3F",
        "locale": "ko"
      }
    }
  ]
}
```

- Parser outcomes: `ok` | `unavailable` | `corrupt` | `unsupported_version` — corrupt/unsupported data is **not** overwritten on read.
- Each `serializedRef` must parse as GW-ICN-012 v1 before accept into the envelope.

## Bilingual saved identity policy (GW-ICN-016 adapter)

Two persisted refs represent **one** saved entry iff parsed v1 envelopes `a` and `b` satisfy **any**:

1. `a.contentFingerprint === b.contentFingerprint`
2. `a.pairedContentFingerprint === b.contentFingerprint` (validated pair captured at save)
3. `b.pairedContentFingerprint === a.contentFingerprint`

**Never** merge on shared `sourceId`, display name, listing index, or fingerprint prefix alone. Unpaired refs with only shared `sourceId` remain distinct.

Implementation: [`icn-saved-facility-identity.ts`](../../src/lib/icn-facilities/icn-saved-facility-identity.ts).

## Files changed (summary)

| Area | Paths |
| --- | --- |
| Storage / identity | `src/lib/icn-facilities/icn-saved-facilities-persistence.ts`, `icn-saved-facility-identity.ts`, `icn-saved-facilities-client-store.ts`, `icn-saved-list-present.ts`, `icn-saved-detail-session.ts` |
| Routes | `src/lib/mivvu-entry-routes.ts`, `src/app/(mivvu-entry)/icn/saved/page.tsx` |
| UI | `MivvuIcnHeader.tsx`, `MivvuIcnSavedFacilitiesPage*.tsx`, `MivvuIcnFacilityDetailPageClient.tsx`, `MivvuIcnFacilitiesBrowseScreen.tsx`, `mivvu-entry.css`, `mivvu-preview-messages.ts` |
| Tests | `*.test.ts(x)` for identity, persistence, list present, saved page + detail save |
| Notices | `src/lib/icn-facilities/icn-saved-user-notice.ts` |
| Docs | `docs/IMPLEMENTATION_PLAN.md`, this checkpoint |

## Antigravity review — author corrections (Findings 1–3)

Independent report: `/private/tmp/GW-ICN-016-antigravity-review/REVIEW.md` (conditional pass). **This section is author fix + re-verification only — not independent sign-off.**

| Finding | Fix |
| --- | --- |
| **1** Stale-row detail action labeled like back | New `icnSavedOpenDetail` (KO `상세 확인`, EN `View detail`) on stale/missing row forward action; header back labels unchanged. Regression: stale row exposes `View detail`, not `Back to list`. |
| **2** Notice text frozen in prior locale | Semantic notice kind (`saved` \| `removed` \| `failed`) + `resolveIcnSavedUserNoticeMessage` at render on detail and saved list; failure keeps `role="alert"`. Regression: removal notice re-localizes on KO↔EN toggle. |
| **3** No detail save component test | `MivvuIcnSavedFacilities.test.tsx` renders `MivvuIcnFacilityDetailPageClient` with `found` detail: `aria-pressed` save/unsave; failed `setItem` → unsaved + alert. |

Findings **4–5** (double-read optimization, wrapper cleanup) intentionally **not** changed in this pass.

## Human acceptance and independent re-verification

| Source | Verdict | Notes |
| --- | --- | --- |
| **Human owner** | **Accepted** **2026-11-04** | Publication authorization for GW-ICN-016 saved-facilities slice on `feat/gw-icn-016-saved-facilities`. |
| **Antigravity focused re-verification** (external) | **PASS** — Findings **1–3 RESOLVED** | Report: `/private/tmp/GW-ICN-016-antigravity-reverification/REVERIFICATION.md` (not in repo). Fresh `:38899` browser + 30-test focused suite per that report. |
| **Initial Antigravity review** (external) | Conditional pass → addressed | `/private/tmp/GW-ICN-016-antigravity-review/REVIEW.md` |

**Repository evidence (this worktree, not external report):** focused vitest **30/30** PASS; eslint/tsc PASS on saved slice; `npm run build` PASS after corrections; **`icn-shipped-output.test.ts` still FAIL** (inherited); **full vitest suite not claimed green**; out-of-repo 1011×2 probe **not** a completed pass (initial review timeout).

## Verification

### Initial author pass

| Command | Result |
| --- | --- |
| `vitest run` (4 focused files, 15 tests) | **PASS** |
| `eslint` (saved modules + touched UI) | **PASS** |
| `tsc --noEmit --incremental false` | **PASS** |
| `git diff --check` | **PASS** (tracked diffs) |
| `npm run build` (first pass in worktree) | **PASS** (includes `/icn/saved`) |
| Browser (`next start --port 38888`, pre-correction bundle) | **PASS** — KO browse → detail save → `/icn/saved`; EN toggle on list |

### After Antigravity corrections (2026-10-31)

| Command | Result |
| --- | --- |
| `vitest run` identity + persistence + list-present + `MivvuIcnSavedFacilities.test.tsx` + `icn-browse-lifecycle.test.tsx` | **PASS** — **5** files, **30** tests (**0** failures) |
| — breakdown | identity **4**, persistence **8**, list-present **1**, saved/detail UI **6**, browse-lifecycle **11** |
| `eslint` (notice + saved/detail UI + messages + saved tests) | **PASS** |
| `tsc --noEmit --incremental false` | **PASS** |
| `git diff --check` | **PASS** (tracked diffs) |
| `npm run build` (fresh run after corrections) | **PASS** — route table includes `/icn/saved` (no Google Fonts failure this run) |
| `vitest run src/lib/icn-facilities/icn-shipped-output.test.ts` | **FAIL** — **1** test (inherited baseline; unchanged by GW-ICN-016) |
| Full `vitest run` (entire repo) | **NOT RUN** — Antigravity full suite was not wholly green; do not claim green |
| Out-of-repo 1011×2 catalog probe | **NOT a completed pass** — logged full counts then **timed out** at ~8.3s (review evidence) |
| Browser UI repro for Findings 1–2 on **corrected** bundle | **NOT RUN (meaningful)** — existing `next start :38888` was not restarted; embedded snapshot on `/icn/saved` returned empty interactive tree (HTTP **200**). Component tests cover corrected labels and locale notices. |

**Browser limitations:** Cursor embedded browser; 390/360/430 layout not formally captured as PNG; keyboard-only pass not recorded; storage-blocked demo exercised in unit tests (`setIcnSavedFacilitiesStorageBackend`).

## Fixture / companion preservation

- No edits to shipped KO/EN facility fixture bytes or goods/services companion artifact (SHA-256 unchanged vs parent `27ae147` — matches Antigravity re-verification preservation check).
- GW-ICN-012 v1 wire semantics and `resolveIcnFacilityRef` outcomes unchanged.

## Git state

- Branch `feat/gw-icn-016-saved-facilities` — **one commit** on parent **`27ae147ca1c8ec3e804482cee07f75814ba9af7b`** (GW-ICN-015 enrich-data tip at branch start).
- `node_modules` / `.next` local only — **not** committed.

## Publication record

| Field | Value |
| --- | --- |
| Commit | `04265ea8b8a80e7cad25b978e4ac4e1c0c9dd697` |
| Remote | `origin/feat/gw-icn-016-saved-facilities` @ same SHA (verified `git ls-remote` after push) |
| PR base (intended) | `codex/gw-icn-015-enrich-data` @ `27ae147` (PR #13 at coordinator check) |

## Known limitations / follow-ups

- No saved-list size cap (GW-ICN-019 open item deferred).
- Stale row “open detail” on fully invalid refs shows resolver error UI (honest).
- Independent Codex review of identity edge cases still pending per implementation plan.
