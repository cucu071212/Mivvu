# GW-ICN-015-SITUATION checkpoint — ICN detail Situation panel

**Plan revision:** `GW-PLAN-REV-2026-10-29` (GW-ICN-011 §5; GW-ICN-019 detail hierarchy)
**Branch:** `feat/gw-icn-015-situation` (worktree `.worktrees/feat-gw-icn-015-situation`)
**Base:** `feat/gw-icn-017-browse-url` @ `93575cdef8b400864c0b8a2c9a356a137c1ad714`
**Execution permission:** direct human assign; **publication authorized** 2026-11-05 (commit, push, stacked PR — **no merge/deploy**)

## Acceptance and review record (2026-11-05)

| Gate | Result |
| --- | --- |
| Human owner | **`accepted`** (2026-11-05) |
| Antigravity independent review | **Acceptable** — `/private/tmp/GW-ICN-015-situation-antigravity-review/REVIEW.md` (two **low-severity** findings: partial terminal/floor projection; test hygiene) |
| Cursor author correction | Findings **1–2** corrected locally; **13/13** focused tests; **0** scoped ESLint warnings — **not** a new independent re-verification of those corrections |

## Publication scope

Stacked on **`feat/gw-icn-017-browse-url`** @ `93575cdef8b400864c0b8a2c9a356a137c1ad714`. Detail Situation panel only; **no fixture byte changes**; goods/services enrichment slice unchanged.

## Author correction (Antigravity Findings 1–2)

| Finding | Fix |
| --- | --- |
| **1** Partial terminal/floor & EN KO location fallback | `buildIcnFacilitySituationContent` requires **both** `record.terminalId` and `record.floor` for known place line; location known only when `displayLocation` is set and **`!locationFromKoreanFallback`**. Regression tests for synthetic partial terminal and EN fallback location. |
| **2** Test hygiene | Removed unused RTL imports; `expect(companion.ok).toBe(true)` before integration body; policy test covers **sparse** and **ambiguous-hours** unknown copy. |

**Shipped fixture rows:** unchanged projection for all 1,028 KO/EN rows (full terminal, floor, and locale-native location on every row per Antigravity audit).

## Scope delivered

- **`MivvuIcnSituationSection`** on `/icn/f/[ref]` for resolved detail (`found` only): three groups — **목록에서 확인된 정보 / 목록에 없거나 불분명 / 앱이 알려주지 않는 것** (KO) and EN equivalents.
- **`buildIcnFacilitySituationContent`** — derives known/unknown bullets from snapshot fields on `IcnFacilityDetailFoundView` only; does **not** repeat the full primary card (no duplicate name/hours values in known list).
- **Human policy (2026-11-05):** no clock comparison, no “open now,” no visit feasibility, no security-access inference from `arrivalOrDeparture` / `dutyFreeFlag`, no gate distance/walk/queue/route claims.
- **Unchanged:** goods/services enrichment block, save/browse URL/locale/category/detail-return sessions, fixtures, SFO demo.

## Placement

Detail order: primary block → goods/services (when visible) → **Situation** → listing notes `<details>`.

## Verification (author correction pass)

| Command | Result |
| --- | --- |
| Focused vitest (situation unit + section + detail integration + goods/services) | **PASS — 13/13** |
| Scoped ESLint (situation slice) | **PASS — 0 errors, 0 warnings** |
| `tsc --noEmit` | **PASS** |
| `git diff --check` | **PASS** |
| Fixture SHA-256 (ko, en, companion) | **Unchanged** (see Antigravity baseline) |
| `npm run build` | **Not re-run** (rendered copy unchanged on shipped rows; prior pass PASS) |
| Browser 360 / 390 / 430 | **Reuse Antigravity evidence** (`REVIEW.md` §4–5; no fixture or primary-card copy change on shipped rows) |
| `icn-shipped-output.test.ts` | **FAIL — 1/1** (**inherited**; fixtures unchanged) |
| Full `npm test` | **NOT RUN** — not green |

## Verification (initial author — superseded counts)

| Command | Result |
| --- | --- |
| Focused vitest (situation unit + section + detail integration + goods/services regression) | **PASS — 11/11** |
| `icn-shipped-output.test.ts` | **FAIL — 1/1** (**inherited** baseline; fixtures unchanged) |
| Scoped ESLint (situation slice) | **PASS** (0 errors) |
| `tsc --noEmit` | **PASS** (after readonly fix) |
| `npm run build` | **PASS** |
| `git diff --check` | **PASS** |
| Full `npm test` | **NOT RUN** — not green |
| Browser 360 / 390 / 430 (detail + missing-field EN) | **Pending Antigravity** — dev server not re-captured in this handoff; use worktree `npm run dev` and representative refs (`3289` complete, sparse fields via listing notes row) |

## Antigravity review checklist

1. **Copy:** KO/EN Situation headings and bullets match neutral policy; no suitability badge, score, or yes/no visit verdict in Situation or lead copy (not-claimed list may name excluded topics explicitly).
2. **Hours:** Primary hours line still snapshot-only disclaimer; Situation does **not** compare hours to device/server clock or state “open now.”
3. **Flags:** `arrivalOrDeparture` / `dutyFreeFlag` appear only as directory-metadata **known** lines or listing notes — no security-zone or eligibility inference.
4. **Regression:** Goods/services section still renders for `3289`; save control and back-to-browse/saved behavior unchanged; browse URL module untouched.
5. **Layout:** Situation readable at **360, 390, 430** px without overlapping primary or goods blocks.
6. **Fixtures:** SHA-256 unchanged for `icn-facilities-ko.json`, `icn-facilities-en.json`, `icn-goods-services-companion-v1.json`.

## Limitations

- Situation known lines describe **presence** of field classes, not re-display of long location/hours text (avoids duplicating the primary card).
- No user-supplied notes (not approved in GW-ICN-011).
- Full milestone **GW-ICN-015** table row remains the umbrella; **GW-ICN-015-ENRICH-*** slices stay separate completed work.

## Publication record

| Field | Value |
| --- | --- |
| Commit | *(record after push — not embedded in this publication commit)* |
| Remote | `origin/feat/gw-icn-015-situation` *(verify with `git ls-remote` after push)* |
| PR base (intended) | `feat/gw-icn-017-browse-url` @ `93575cdef8b400864c0b8a2c9a356a137c1ad714` |

---

```text
GATEWISE STATUS — Cursor (publication)
Task ID / objective: GW-ICN-015-SITUATION — ICN detail Situation panel
Plan revision: GW-PLAN-REV-2026-10-29
Execution permission: authorized (human 2026-11-05 — commit/push/PR)
Work progress: complete
Review / acceptance: accepted (human 2026-11-05; Antigravity Acceptable + Cursor Findings 1–2 correction)
Integration / release: publication — branch push; PR by coordinator; no merge/deploy
Tests: focused 13/13 PASS; eslint 0/0; icn-shipped-output inherited FAIL; full suite not green
Git: feat/gw-icn-015-situation — publication commit pending in this status block
Handoff: docs/handoffs/GW-ICN-015-situation-checkpoint.md; PR base feat/gw-icn-017-browse-url
```
