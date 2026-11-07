# GW-ICN-017 checkpoint — shareable ICN browse URL state

**Plan revision:** `GW-PLAN-REV-2026-10-29`
**Branch:** `feat/gw-icn-017-browse-url` (local worktree `.worktrees/feat-gw-icn-017-browse-url`)
**Base:** `origin/feat/gw-icn-016-saved-facilities` @ `5805d2d881cadae533a59555bd71fc5bfca23a06`
**Execution permission:** direct human assign; **publication authorized** 2026-11-05 (commit, push, stacked PR — **no merge/deploy**)

## Acceptance and independent review (2026-11-05)

| Gate | Result |
| --- | --- |
| Human owner | **`accepted`** (2026-11-05) |
| Antigravity (Findings 1–6) | **`RESOLVED`** — final Finding 3 report: `/private/tmp/GW-ICN-017-antigravity-finding3-reverification/FINDING3_REVERIFICATION.md` |
| Prior reports | `/private/tmp/GW-ICN-017-antigravity-review/REVIEW.md`, `/private/tmp/GW-ICN-017-antigravity-reverification/REVERIFICATION.md` |

## Publication scope

Shareable `/icn` browse URL state (`q`, `terminal`, `type`, `subtype`); `history.replaceState` / `pushState`; location bootstrap precedence with GW-ICN-013 detail restore and GW-ICN-016 saved flows; departure history guard; hub bootstrap on remount/popstate. **No fixture byte changes** (KO/EN catalog + goods/services companion unchanged). **PR base:** `feat/gw-icn-016-saved-facilities`.

## Antigravity review (Findings 1–6)

| Finding | Status | Summary |
| --- | --- | --- |
| **1** Back/Forward to bare `/icn` | **RESOLVED** | `notifyIcnBrowseUrlLocationSearchChanged()` always parses the address bar and applies filters (including defaults when `search === ""`). Detail restore still commits before bootstrap when `peekHubRestoreFilters()` is set. |
| **2** Query double-decode | **RESOLVED** | Removed second `decodeURIComponent`; `firstParam` uses trimmed `URLSearchParams` values only. Round-trip tests for `1+1`, `%50`, `100%25`. |
| **3** Airport selection history | **RESOLVED** | Bootstrap reconciles bare `/icn`; guarded departure `resetIcnBrowseHubFilters()`; ensure before URL sync; Antigravity Sequences A–B **PASS** (CDP 390×844). |
| **4** Missing regression tests | **RESOLVED** | Popstate/DOM, encode round-trips, departure, detail-restore normalization, cross-route bare `/icn`, force=false bootstrap. |
| **5** Slow sync tests | **RESOLVED** | `icn-browse-url-sync.test.tsx` uses module-scoped 2-row catalogs. |
| **6** Plan revision typo | **RESOLVED** | Checkpoint + status block use `GW-PLAN-REV-2026-10-29`. |
| **7** Duplicate constants | **Unresolved (deferred)** | Intentionally not changed this pass. |
| **8** Preview redirect | **Out of scope** | Unchanged limitation. |

## URL semantics

Canonical browse route: **`/icn`**. Query keys:

| Param | Hub field | Notes |
| --- | --- | --- |
| `q` | `query` | Trimmed; omitted when empty |
| `terminal` | `terminalFilter` | Fixture terminal id; omitted when `all` |
| `type` | `categoryLarge` | KO-stable GW-ICN-014 key |
| `subtype` | `categoryMedium` | Valid under `type`; omitted when `all` |

**Not in URL:** locale, saved facilities, detail refs, SFO session keys.

**Precedence:**

| Situation | Winner |
| --- | --- |
| Explicit browse params in URL | Parsed URL (clears pending browse session restore) |
| Bare `/icn` + `restoreOnNextHubVisit` | One-shot session restore (commit before bootstrap), then URL `replaceState` |
| Bare `/icn` cold load (no restore) | Parsed defaults; stale module state reconciled when hub filtered but URL bare (unless hub non-default awaiting post-restore URL sync) |
| `popstate` to bare `/icn` | Parsed defaults via `notifyIcnBrowseUrlLocationSearchChanged` |
| Saved → detail → saved | Unchanged (no browse URL on saved routes) |

**Modules:** `icn-browse-url-state.ts`, `icn-browse-url-location-bootstrap.ts`, `icn-browse-url-history-sync-guard.ts`, `useIcnBrowseUrlSync.ts`.

## Fresh verification (correction pass — not reused Antigravity evidence)

Dev server: `next dev` on port **3000**, worktree `.worktrees/feat-gw-icn-017-browse-url` (Turbopack HMR).

| Check | Viewport | Result |
| --- | --- | --- |
| `/icn` → T2 chip → browser **Back** → bare `/icn`, `전체` pressed, **1,011** results | 390×844 (CDP) | **PASS** |
| `/icn?q=1%2B1` searchbox **`1+1`**, URL stays encoded | 390×844 | **PASS** |
| `/icn?terminal=P03` → **공항 선택** → `/` → browser **Back** → `/icn?terminal=P03` | 390×844 (CDP) | **PASS** |
| Detail return + saved-origin | — | **Not re-run** this pass (Antigravity prior PASS unchanged modules for BFCache/saved session) |

Prior pass browser rows in the section below remain **historical**; do not treat them as substitution for the fresh rows above.

## Verification summary (publication)

| Command | Result |
| --- | --- |
| Focused vitest (5 URL files + `icn-browse-lifecycle` + hub-current-contract + browse screen) | **PASS — 45/45** (Antigravity + author runs) |
| Scoped ESLint, `tsc --noEmit`, `npm run build` | **PASS** (author publication pass; product unchanged at commit) |
| Antigravity browser (Finding 3 Sequences A–B, detail/URL precedence) | **PASS** @ `localhost:3000`, 390×844 |
| `vitest run src/lib/icn-facilities/icn-shipped-output.test.ts` | **FAIL — 1/1** (**inherited** SHA-256 baseline; fixtures unchanged) |
| Full `npm test` | **Not run** — not green |

## Publication record

| Field | Value |
| --- | --- |
| Commit | *(record after push — not embedded in this publication commit)* |
| Remote | `origin/feat/gw-icn-017-browse-url` *(verify with `git ls-remote` after push)* |
| PR base (intended) | `feat/gw-icn-016-saved-facilities` @ `5805d2d881cadae533a59555bd71fc5bfca23a06` |

## Historical sections (author passes — superseded by acceptance above)

| Command | Result |
| --- | --- |
| Focused vitest (5 files: url-state, location-bootstrap, url-sync, lifecycle, hub-current-contract) | **PASS — 37/37** (~630ms; sync file ~110ms) |
| Scoped `eslint` on GW-ICN-017 TS/TSX | **PASS** (0 errors) |
| `tsc --noEmit` | **PASS** |
| `npm run build` | **PASS** |
| `git diff --check` | **PASS** |
| `vitest run src/lib/icn-facilities/icn-shipped-output.test.ts` | **FAIL — 1/1** (**inherited** baseline) |
| Full `npm test` | **Not run** — not green |

## Historical browser evidence (initial implementation pass — superseded for defects 1–3)

Initial pass checks before Antigravity review; **defects 1–3 failed** in independent review and are addressed in the correction pass table above.

## Limitations

- Preview `/preview/mivvu-entry/icn` still drops query params (redirect only).
- Scroll position not in URL.
- Duplicate URL param constants in `mivvu-entry-routes.ts` (Finding 7 deferred).
- **`icn-shipped-output.test.ts`** remains an inherited failure; full vitest suite not claimed green.

---

```text
GATEWISE STATUS — Cursor (publication)
Task ID / objective: GW-ICN-017 — shareable ICN browse URL state
Plan revision: GW-PLAN-REV-2026-10-29
Execution permission: authorized (human 2026-11-05 — commit/push/PR)
Work progress: complete
Review / acceptance: accepted (human 2026-11-05; Antigravity Findings 1–6 RESOLVED)
Integration / release: publication — branch push; PR by coordinator; no merge/deploy
Tests: focused 45/45 PASS; icn-shipped-output 0/1 FAIL inherited; full suite not green
Git: feat/gw-icn-017-browse-url — publication commit pending in this status block
Handoff: docs/handoffs/GW-ICN-017-checkpoint.md; PR base feat/gw-icn-016-saved-facilities
```
