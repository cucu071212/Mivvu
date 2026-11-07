# GW-ICN-012 checkpoint

Plan revision: **GW-PLAN-REV-2026-10-28**. Owner: Codex; integration reviewer: Cursor (**accepted** 2026-10-29); final acceptance: human owner (**accepted** 2026-10-29). Publication via PR `chore/gw-icn-011-012-package` — not `main` merge or production.

## Workspace and applicable inputs

- Worktree: `/private/tmp/GateWise-gw-icn-012-facility-reference` (use explicitly).
- Branch: `codex/gw-icn-012-facility-reference`; base/HEAD: `2e56a28c16ebd71eb202db7aa428db7ba9b50b78`, matching locally available `origin/main` and coordinator pin. Local commit history confirms released 007/008/009 through `aac53a3` / merge `bb4735d`. No remote freshness or current deployment claim; no fetch needed for the assigned verified source.
- Original dirty 007 checkout preserved; 011 planning worktree read directly, never copied or edited.
- Accepted corrected 011 inputs: `/Users/wonjonghun/Desktop/GateWise-gw-icn-011-product-plan` on `docs/gw-icn-011-product-plan`, HEAD `2e56a28…`, five uncommitted planning files. Its pending acceptance / planned 012 labels predate the explicit acceptance and authorization in this dispatch. Human dispatch supersedes those workflow labels; no material requirements conflict found. This implementation branch retains older committed plan headers; applicable 2026-10-28 instructions are the local inputs below, not silently substituted older plans.

| Accepted input | SHA-256 |
| --- | --- |
| PLAN.md | `14d6f6190920156fa809e9b2a10ab7e28d3878192c08c239bca4f809742b6a64` |
| docs/IMPLEMENTATION_PLAN.md | `04f565d56e7d3b7e7edc89d55fabe6fbf685371d69a1f3745ae873d8cd73fdb3` |
| docs/design/GW-ICN-011-product-flow.md | `34db60b870e08f0017bf28686a125539d66836082c2d3513fa16feb1d6ce660d` |
| docs/handoffs/GW-ICN-011-checkpoint.md | `19ff037331b302dc76b28543ad637e263ebac2181b00ccf7723f2cd7944f9539` |
| docs/plan-revisions.md | `de467b5662364285120055bf72ce6b35dc7da307a605c49d4cef9a417b664f95` |

Read AGENTS.md in original and isolated source and supplied current installation policy. Read accepted PLAN, implementation plan/012 row, flow, revisions, and checkpoint. GW-ICN-010 map/checkpoint read at local branch HEAD `1c3f7215f44e48e8fc89736b0829fd2e5f667aea` (`/private/tmp/GateWise-gw-icn-010-analysis`), especially §6. Confirmed source: normalized types, exact content inventory/collapse, matching, display fallback, catalog projection, server page boundary, fixture validation. No Graphify execution/rebuild; source confirms relevant map relationships. No SFO contract code is touched.

Skills read/applied: test-driven-development, verification-before-completion, Ponytail; systematic-debugging read for failures. Graphify skill read for navigation guidance; use limited to existing 010 map as explicitly assigned, no rerun. All requested skills available.

## Progress

- Complete: inspect worktrees/canon/accepted inputs; isolate released source; inspect reference boundary. Reuse existing dependencies via temporary local `node_modules` symlink to 009 integration worktree; no install or dependency-file edit.
- Decision: versioned exact canonical content fingerprint, no ordinal or redundant sourceId. Operate on complete normalized per-language records, not lossy browse projections. Exact origin content must still exist before a conservative locale pair can resolve. Changed/removed content returns missing; cannot reliably distinguish those cases or auto-migrate.
- Remaining: write failing resolver tests; implement; focused regressions/typecheck/lint/whitespace/preservation; finish contract and Cursor handoff.
- Files so far: this checkpoint only.
- Checks: source SHA/history and accepted input hashes PASS. No implementation verification run yet.
- Inspection failures: guessed catalog filenames absent; actual builder is `icn-browse-view-model.ts`; task 012 is a table row, not a heading. Corrected reads; no source impact.
- Preservation evidence: `/private/tmp/GW-ICN-012-preservation.json` records original/planning statuses and tracked file hashes. Do not publish this local evidence.
- Next action: write initial failing tests in `src/lib/icn-facilities/icn-facility-reference.test.ts`, run against minimal unimplemented API, then implement.

Work progress: **in_progress**; review/acceptance: **pending**; integration/release: **n/a**. Resume here using the absolute worktree. No background processes.

## Checkpoint — initial implementation green

- Added `src/lib/icn-facilities/icn-facility-reference.ts` and `.test.ts`.
- TDD RED: API signatures with unimplemented return values, 23 assertion failures / 1 rejection test passed (24 cases); no import/setup error. Full local log `/private/tmp/GW-ICN-012-red.txt`. Failures establish missing creation, serialization, exact resolution, locale guard and version behavior. Then implemented only this API.
- GREEN: `npm test -- src/lib/icn-facilities/icn-facility-reference.test.ts` → PASS, 24/24.
- Schema refinement: optional paired fingerprint captured at creation under the existing complete-catalog 1:1 rule. A single origin fingerprint plus later sourceId-only join could silently follow a replaced translation after refresh; both exact fingerprints now gate locale resolution. Previously ambiguous/absent translation is not opportunistically adopted later. Same-language exact resolution still succeeds independently.
- Parse rejects malformed/unknown v1 fields and inconsistent pairs; positive safe-integer future versions are explicitly unsupported. All failures omit records. Content changes/removals deliberately share a missing outcome; no identity inference.
- Existing Vite warning: CommonJS loading of ESM-style `vitest.config.ts` (future configLoader behavior). Not a resolver failure; tool configuration is outside scope.
- Next action: strengthen frozen-v1 wire compatibility/edge cases, run directly affected regressions and typecheck/lint, write contract, final preservation/whitespace review. No process pending.

## Final closeout — local implementation complete

Completed the pure shared module, 26 reference tests, and [contract / Cursor handoff](../data/icn-facility-reference-contract.md). Exported creation/serialization/parsing/resolution interfaces, snapshot/refresh/locale guarantees, error priority, examples, full-normalized-catalog precondition and future consumer integration checks are documented there. Exact origin plus optionally captured counterpart content prevents silent reassignment; changed/removed content deliberately shares a missing result. No existing code, fixtures, plan documents, package/configuration files, routes, UI, storage or SFO behavior was changed.

### Verification actually run

| Command/check | Result |
| --- | --- |
| Initial `npm test -- src/lib/icn-facilities/icn-facility-reference.test.ts` against unimplemented API signatures | Expected RED: 23 failed / 1 passed; assertion failures, no loader error |
| Same focused command after implementation | PASS: 24 tests (then two additional wire/null edge-case tests added) |
| `npm test -- src/lib/icn-facilities/icn-facility-reference.test.ts src/lib/icn-facilities/icn-browse-view-model.test.ts src/lib/icn-facilities/icn-browse-display.test.ts src/lib/icn-facilities/icn-browse-catalog.fixture.test.ts src/lib/icn-facilities/icn-fixture-duplicate-sn.test.ts src/lib/icn-facilities/icn-snapshot-quality.test.ts src/lib/icn-facilities/icn-shipped-output.test.ts src/lib/icn-facilities/icn-search-fallback-integration.test.ts` | PASS: 8 files / 85 tests, including 26 new reference cases |
| `./node_modules/.bin/tsc --noEmit --incremental false` | PASS |
| `./node_modules/.bin/eslint src/lib/icn-facilities/icn-facility-reference.ts src/lib/icn-facilities/icn-facility-reference.test.ts` | PASS |
| `git diff --check` and explicit Python whitespace scan of all four new/untracked files | PASS |
| Python local Markdown link review | PASS: 6 local targets exist |
| Python compare all tracked base bytes against `git show HEAD:<path>` | PASS: 373 files unchanged, including fixtures |
| Original checkout preservation | PASS: all 349 tracked file hashes and complete Git status identical to pre-edit record |
| Accepted planning worktree preservation | PASS: all 373 tracked file hashes and complete Git status identical; five accepted input hashes unchanged |
| Exact final Git scope | PASS: four untracked deliverables only, no tracked edits or staging |
| Build / browser / live API / fixture refresh / Graphify execution / full audit / deployment | NOT RUN, not required for this isolated unconnected helper |

One closeout check initially failed because `node_modules/` in `.gitignore` ignores a directory but not the temporary dependency **symlink**. Inspected ignore pattern and link type, then unlinked only that temporary link. Rerun scope/preservation checks PASS. Existing dependencies were never installed/edited; no tool configuration changed. To rerun tests locally, temporarily link `node_modules` to `/Users/wonjonghun/.codex/worktrees/gw-icn-009-integration/GateWise/node_modules`, run the commands above, then unlink it again. Existing Vite future config-loader warning is unchanged and nonfatal.

Final local evidence: `/private/tmp/GW-ICN-012-preservation.json`, `/private/tmp/GW-ICN-012-verification.json`, `/private/tmp/GW-ICN-012-red.txt`. These are local raw evidence, outside the four deliverables. No pending process or background job remains.

```text
GATEWISE STATUS — Codex
Task ID / objective: GW-ICN-012 — bounded ICN facility reference contract and pure resolver
Plan revision: GW-PLAN-REV-2026-10-28; accepted corrected local 011 input provenance/hashes above
Execution permission: authorized (human owner, direct Codex chat attachment, 2026-10-29 America/New_York)
Work progress: complete
Review / acceptance: accepted (Cursor integration review 2026-10-29; human owner 2026-10-29)
Integration / release: n/a (publication via PR chore/gw-icn-011-012-package; not main/production)
Files changed: src/lib/icn-facilities/icn-facility-reference.ts; src/lib/icn-facilities/icn-facility-reference.test.ts; docs/data/icn-facility-reference-contract.md; docs/handoffs/GW-ICN-012-checkpoint.md
Behavior delivered / verified data sources: exact versioned content refs; guarded captured bilingual pairing; explicit missing/ambiguous/invalid/unsupported outcomes; normalized full-catalog boundary; unchanged shipped offline KO/EN fixtures
Tests and commands actually run: focused+affected regressions PASS (8 files/85 tests); typecheck PASS; targeted ESLint PASS; whitespace/links/scope/base bytes/original+planning preservation PASS; exact commands above
Git branch / commit / push state: codex/gw-icn-012-facility-reference, HEAD/base 2e56a28c16ebd71eb202db7aa428db7ba9b50b78; four new untracked files; no stage/commit/push/PR/merge/deploy
Dependencies needed from other owner: Cursor independent integration review; human acceptance
Blockers, known limitations, integration risks: no delivery blocker; caller must provide full normalized catalogs; content identity is not real-world identity; changed/removed origins and stale/uncaptured translations remain unresolved; verbose link transport/length needs future integration verification; no UI/route wiring
Handoff / report location: /private/tmp/GateWise-gw-icn-012-facility-reference/docs/data/icn-facility-reference-contract.md; checkpoint in this worktree under docs/handoffs/GW-ICN-012-checkpoint.md
Recommended next task (proposal only): no new task started; review this delivery first
Decision needed from human owner: accept or request corrections after Cursor review; no publication permission requested
```

Remaining implementation steps: **none**. Next concrete action: Cursor independently reviews these four local files and full-catalog/locale consumer boundary; human owner decides acceptance. Preserve worktree/evidence for review. Do not publish or start the next task under this authorization.
