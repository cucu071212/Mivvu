# GW-ICN-010-R1 — Graphify refresh through 014

Plan revision: **GW-PLAN-REV-2026-10-29**. Analysis date/timezone: **2026-10-29 America/New_York** (source/report assembly through 23:27 EDT). Owner: Codex. Coordinator assessment: ChatGPT; final acceptance: human owner. **New analysis review/acceptance: pending**.

## Authorization and fixed source

Human owner directly assigned this refresh in a Codex chat attachment on 2026-10-29 America/New_York. Authorized: bounded static analysis, the two Markdown deliverables, explicit-file commit, normal push of `docs/gw-icn-010-refresh-014`, and one non-draft PR. No application changes, installs, providers, hooks/watchers, subagents, authentication/configuration changes, dependency merge, main push, merge, deploy or 015 work.

- Exact analyzed source: **`2be6c13297f0ea0590d69743525de62a47b3920a`**, verified remote 014 HEAD; initially clean isolated `<analysis-worktree>` based directly on that SHA.
- Remote main: `2e56a28c16ebd71eb202db7aa428db7ba9b50b78`; historical PR [#5](https://github.com/cucu071212/Mivvu/pull/5) open/unmerged at `1c3f7215f44e48e8fc89736b0829fd2e5f667aea`.
- PR [#10](https://github.com/cucu071212/Mivvu/pull/10): open/unmerged, head `feat/gw-icn-014-category` at analyzed SHA, base `feat/gw-icn-013-detail` at `135712d8561518d36b4f89fc508fdf6981889b94`.
- Original checkout: dirty `codex/gw-icn-007-snapshot-quality` at `5bd3121f6aac992ac1b5d59e33c1e68d65c40170`, preserved and excluded from extraction. No switch/stash/reset/clean/cherry-pick.
- Existing 010 map/checkpoint read from pinned `1c3f721`; only the report is retrieved into this branch for refresh. Historical checkpoint and original raw artifacts remain unchanged. Historical acceptance is not copied to R1.

Read source-revision AGENTS/PLAN/implementation plan, 012 contract, 013/014 checkpoints and final lifecycle corrections, category refinement, project-local Graphify skill and verification-before-completion. Shared inventory read from Git object at [pinned `70f681f`](https://github.com/cucu071212/Mivvu/blob/70f681f914d2ff0409fd559f521768b03053dccc/docs/tooling/agent-tool-inventory.md); PR #9 was not merged. Optional Ponytail not used; no coding change required it. No implementation-plan change was necessary; this checkpoint records direct authorization without changing historical task acceptance.

## Extraction and source findings

One code-only library extraction, Graphify **0.9.97**, `GRAPHIFY_BACKEND=none`, explicit tracked paths/root, external cache, `parallel=False`; build directed graph, cluster, diagnostics, export with explicit source SHA. **0 input / 0 output Graphify LLM tokens**, no provider/model subprocess. Query logging disabled. No rebuild or semantic pass.

- **281 inputs**: 260 src, 10 E2E, 7 scripts, 4 root code configs; 117 test/spec files; 28,480 lines / 96,820 whitespace words. No sensitive file selected; below broad-corpus warning thresholds.
- **1,318 raw node rows / 3,949 raw edges**; **1,342 built nodes / 3,820 directed edges / 58 communities**. Raw confidence 3,936 EXTRACTED / 13 INFERRED.
- **Health warning:** 26 dangling endpoint edges, 316 external-reference edges, 123 same-directed-endpoint collapses (125 undirected), 0 missing endpoints/self-loops/exact duplicate edges. Three raw ID pairs duplicate (1,315 distinct raw IDs); built endpoint nodes explain other count differences.
- **45 no-symbol files** still have source nodes; failed/skipped source lists empty. Two extra source strings are external `@playwright/test` / `node:fs`, not parsed code.
- Excluded from extraction: JSON/data, docs/prototypes, styles, YAML, images/binaries, secrets/env, dependencies, builds/caches, Git/worktree internals, generated output. Relevant data/style/config/docs read separately; no parsed coverage claim for them.
- Six vocabulary-expanded seeded queries, focused search retry, two directed paths and one explain: exit 0. Initial search BFS truncated; `--context call` retry retained separately. Other queries explicitly preserve complete edges beyond the requested display budget; display size is not LLM usage.
- Twelve call relationships checked at source lines: filter→category/search; taxonomy/inherited keys→1:1 matching; detail→ordinary catalogs/resolver; transport→normalized ref creation; ref creation→collapse; restore→silent clear/publish; BFCache→registration; display fallback→matching.

[Maintained report](../analysis/GW-ICN-010-code-map.md): architecture/routes plus A search/category, B snapshots/reference/detail, C entry/locale/store/lifecycle. Major updates: full-catalog references and `/icn/f/[ref]`; same-ref KO/EN resolution/error outcomes; ordinary detail loading; pure hub getters and explicit restore order; document-owned BFCache/Strict Mode context; category keys/disclosures/button sheet. Search remains locale-local before name/location display fallback. Scoped category arrays qualify the earlier index-reuse claim; no performance/defect investigation or optimization performed. SFO providers/engines and synthetic-walk boundaries remain separate.

## Verification and limitations

Document-only verification is recorded in `<local-evidence>/verification.json`: SHA-pinned path/line and local-link checks, whitespace, exact two-file scope, source assertions for selected graph edges/order, privacy review, source/worktree/historical artifact hashes and status preservation. Fresh result: **PASS — 84 SHA-pinned file links, 3 local links, 12 source call edges, 450 mapped tracked-file hashes, and 6,756 pre-existing worktree/artifact hashes**. The report contains **80 generated current-source path/line references**, plus fixed provenance/historical links checked against their pinned Git objects. All 24 valid worktree statuses/branches/HEADs are unchanged. No graph raw artifact is published.

**Inherited limitation:** `MivvuIcnFacilitiesBrowseScreen.test.tsx` combined run has **3 FAIL / 3 PASS**, recorded at 014 and its 013 baseline; affected EN-category, ambiguous-hours and HTML-text cases passed individually in the recorded review. Do not claim that file or the historical 71-test campaign is green. Not rerun/fixed here. Recorded 013 ABC/BFCache/Strict Mode/storage and 014 focused/category/sheet checks are historical; source was inspected without new browser verification.

**Intentionally NOT RUN:** application tests, lint/typecheck/build, broad suites, browsers, live airport APIs, offline CLI execution, benchmarks, performance investigation or production inspection. GitHub checks for the final publication SHA will be observed read-only; absent Actions runs mean no matching run, not PASS. No workflow changes/manual CI trigger to obtain green checks.

All 24 valid existing worktrees were baselined; one already-prunable checkout could not be inspected and was not modified. Original 363 non-secret/non-tool file hashes and historical 31 artifact hashes were recorded, plus tracked hashes/status/branch/HEAD for each valid worktree. Tool directories were inventoried via status, excluded from extraction/hash reading and not edited. Final preservation verification compares these baselines; no cleanup is authorized.

## Publication handoff and resumption

The documentation commit is a child of the analyzed source and changes only:

- `docs/analysis/GW-ICN-010-code-map.md`
- `docs/handoffs/GW-ICN-010-R1-checkpoint.md`

The report was absent on 014, so it was retrieved from historical PR #5 and refreshed, without merging/modifying that PR or importing its checkpoint. PLAN, implementation plan, application, tests, fixtures, scripts and workflows remain byte-identical to analyzed source.

At checkpoint preparation, analysis/documentation are complete and publication verification is the remaining action. Before push/PR, recheck PR #10 and remote 014; if unchanged/open, base **`feat/gw-icn-014-category`**, head **`docs/gw-icn-010-refresh-014`**. If changed, inspect ancestry before selecting a base; do not merge dependencies. Title: `docs(GW-ICN-010-R1): refresh Graphify map through ICN 014`.

Final publication SHA, pushed remote HEAD, PR URL/base/head, remote document byte verification, exact-HEAD checks and final preservation results are recorded in the **private completion report**, avoiding a self-referential publication-SHA edit in this checkpoint. Keep `<local-evidence>/` and the new worktree for assessment. No automatic cleanup, next task, merge or production release.

Local evidence layout (actual paths only in private closeout):

- `<local-evidence>/scope.json`, `source-tracked-before.json`, `preservation-before.json`, `initial-worktrees.txt`.
- `<local-evidence>/graphify-out/{extraction.json,graph.json,health.json,health.txt,summary.json,analysis.json,GRAPH_REPORT.md,vocabulary.txt,query-commands.json,query-*.txt,path-*.txt,explain-matching.txt,source-edge-checks.json}`.
- `<local-evidence>/{extraction.log,extract-map.py,query-map.py,report-references.json,verification.json}`; historical copies and publication/remote evidence retained alongside.

```text
GATEWISE STATUS — Codex
Task ID / objective: GW-ICN-010-R1 — refresh Graphify code map through 014
Plan revision: GW-PLAN-REV-2026-10-29
Execution permission: authorized (human owner, direct Codex chat attachment, 2026-10-29 America/New_York)
Work progress: complete (static analysis/documentation); publication verification remaining at checkpoint preparation
Review / acceptance: pending (ChatGPT coordinator assessment; human final acceptance)
Integration / release: n/a (documentation branch/PR publication only; no merge/production)
Files changed: maintained code map; new R1 checkpoint
Behavior delivered / verified data sources: static source at 2be6c13297f0ea0590d69743525de62a47b3920a; no application behavior changed
Tests and commands actually run: bounded Graphify extraction/query/path/explain; Git refs/PR reads; source/document/scope/preservation verification; application suites/build/browser/live API NOT RUN
Git branch / commit / push state: docs/gw-icn-010-refresh-014, child of analyzed source; final publication SHA/remote/PR/checks in private completion report
Dependencies needed from other owner: coordinator assessment and human acceptance
Blockers, known limitations, integration risks: graph integrity/AST limits; inherited combined browse test failures; runtime/bundle/production unverified
Handoff / report location: docs/analysis/GW-ICN-010-code-map.md; this checkpoint; private local evidence
Recommended next task (proposal only): none; stop after publication
Decision needed from human owner: accept R1 or request corrections
```
