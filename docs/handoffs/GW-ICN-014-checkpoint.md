# GW-ICN-014 — Implementation checkpoint (acceptance closeout)

Plan revision: **GW-PLAN-REV-2026-10-29**
Execution permission: **authorized** (direct human dispatch + publication closeout)
Work progress: **complete**
Review / acceptance: **accepted** (human owner, 2026-10-29, after independent review)
Integration / release: **publication** (PR to `feat/gw-icn-013-detail`; **not** merge to `main` / **not** production)

## Baseline and dependency chain

| Item | Value |
| --- | --- |
| Dependency | **GW-ICN-013** @ `135712d8561518d36b4f89fc508fdf6981889b94` on `origin/feat/gw-icn-013-detail` (PR [#8](https://github.com/cucu071212/Mivvu/pull/8) cited by owner; **unmerged** on `origin` GateWise at closeout) |
| Worktree | `/Users/wonjonghun/Desktop/GateWise/.worktrees/feat-gw-icn-014-category` |
| Branch | `feat/gw-icn-014-category` |

Design refinement: [`GW-ICN-019-bottom-sheet-refinement.md`](GW-ICN-019-bottom-sheet-refinement.md) (bottom sheet supersedes inline category disclosure panel).

## Independent review

| Report | Verdict |
| --- | --- |
| [`GW-ICN-014-independent-review`](/private/tmp/GW-ICN-014-independent-review/GW-ICN-014-independent-review.md) | Two P2 findings — corrected in follow-up |
| [`GW-ICN-014-P2-reverification`](/private/tmp/GW-ICN-014-p2-reverification/GW-ICN-014-P2-reverification.md) | **Finding 1 RESOLVED**, **Finding 2 RESOLVED** (2026-10-29) |

Human owner **accepted** GW-ICN-014 after P2 re-verification (direct decision, 2026-10-29).

## Delivered behavior

- Compact **Type / Subtype** rows; bottom-sheet selection (immediate apply, no Apply).
- Eight KO top-level categories; optional medium subcategory; hub/session restore of `categoryLarge` / `categoryMedium` with GW-ICN-013 ownership.
- Filters compose with search and terminal; KO keys preserved across KO/EN toggle.
- EN UI: `icnKoOnlyCategory` disclosure when taxonomy shows KO source labels (`labelEnFromKoreanFallback`).
- Sheet options: native **buttons** with **`aria-pressed`** (no listbox/option roles).

## Known test limitation (not fixed in 014)

`MivvuIcnFacilitiesBrowseScreen.test.tsx` **combined run**: **3 FAIL / 3 PASS** — identical to baseline **135712d** (module-owned terminal filter leakage after `switches to English catalog while preserving terminal filter`). Failing cases: **shows English row without category line**; **shows ambiguous equal hours…**; **renders HTML-shaped source/query text…**. Each **PASS** when run alone. **Do not** describe the full file or historical 71-test campaign as green.

## Closeout verification (this publication pass)

| Command | Result |
| --- | --- |
| Focused vitest (13 files, 40 tests — category, hub, lifecycle, session, fixture, bottom sheet) | **PASS** |
| `npm run lint` | **PASS** (0 errors; 1 pre-existing prototype warning) |
| `npx tsc --noEmit` | **PASS** |
| `git diff --check` (pre-commit) | **PASS** |

Prior evidence reused (not re-run at closeout): webpack build, 390px KO + 360px EN browser screenshots, Codex P2 browser/keyboard campaign, GW-ICN-013 BFCache/return-flow probes (unchanged modules).

### Screenshots (handoff)

- `GW-ICN-014-390-*.png` (KO browse/sheets)
- `GW-ICN-014-360-en-type-sheet.png` (EN fallback disclosure)

## Publication record

| Field | Value |
| --- | --- |
| Commit | `22c0cd9c6915cd8adb9b66c5f3960f1a4e7bf3f2` |
| Remote | `origin/feat/gw-icn-014-category` @ same SHA (verified `git ls-remote`) |
| PR base | `feat/gw-icn-013-detail` @ `135712d` (PR #8 not merged; remote 013 unchanged) |
| PR | **Coordinator handoff** — create on `cucu071212/Mivvu` (repo moved from GateWise); see GATEWISE STATUS below |

## GATEWISE STATUS

```text
GATEWISE STATUS — Cursor
Task ID / objective: GW-ICN-014 — acceptance closeout and publication
Plan revision: GW-PLAN-REV-2026-10-29
Execution permission: authorized (human publication closeout)
Work progress: complete
Review / acceptance: accepted (human owner 2026-10-29; P2 re-verification)
Integration / release: publication (PR only; no merge/deploy)
Tests and commands actually run:
  focused vitest 13 files → PASS (40)
  npm run lint → PASS
  npx tsc --noEmit → PASS
  git diff --check → PASS
Known limitation: MivvuIcnFacilitiesBrowseScreen.test.tsx combined 3 FAIL (inherited)
Git branch / commit / push state: feat/gw-icn-014-category @ 22c0cd9c6915cd8adb9b66c5f3960f1a4e7bf3f2 pushed to origin (verified)
PR handoff (no gh / no GitHub token in Cursor):
  base: feat/gw-icn-013-detail
  head: feat/gw-icn-014-category
  title: GW-ICN-014: ICN category bottom sheets and hub filters
  compare: https://github.com/cucu071212/Mivvu/compare/feat/gw-icn-013-detail...feat/gw-icn-014-category
CI on exact HEAD: not inspected (PR not created from this environment)
Handoff: docs/handoffs/GW-ICN-014-checkpoint.md
Decision needed from human owner: merge PR when dependency chain ready (out of scope here)
```
