# GW-ICN-007 — offline ICN snapshot quality gate

Plan revision: **GW-PLAN-REV-2026-10-26**. Human owner directly authorized local implementation in Codex chat on **2026-10-28 (America/New_York)**. Base: local `main` at `5bd3121f6aac992ac1b5d59e33c1e68d65c40170`; branch: `codex/gw-icn-007-snapshot-quality`. Cursor is integration reviewer; human owner gives final acceptance. Review **pending**, release **n/a**. No commit/push/merge/deploy authorization carries over from the prior release.

Canonical references: [PLAN](../../PLAN.md), [task permissions](../IMPLEMENTATION_PLAN.md#gw-icn-007-offline-icn-snapshot-quality-gate), [adapter contract/handoff](icn-facility-adapter-handoff.md), [browse contract/handoff](../design/mivvu-icn-browse-handoff.md).

## Usage

Run from the repository with its existing dependencies installed. No credentials, dotenv sourcing, network requests, or fixture refresh are needed. Baselines default to the shipped KO/EN snapshots; candidates must be explicit.

```bash
# Human summary; this self-comparison is a useful smoke check.
npm run quality:icn-snapshots -- \
  --candidate-ko src/data/fixtures/icn-facilities-ko.json \
  --candidate-en src/data/fixtures/icn-facilities-en.json

# Pure JSON on stdout; --silent suppresses npm's own banner.
npm run --silent quality:icn-snapshots -- \
  --candidate-ko /path/to/candidate-ko.json \
  --candidate-en /path/to/candidate-en.json \
  --json

# Explicit baseline files are also supported.
node scripts/check-icn-snapshots.mjs \
  --baseline-ko /path/to/baseline-ko.json \
  --baseline-en /path/to/baseline-en.json \
  --candidate-ko /path/to/candidate-ko.json \
  --candidate-en /path/to/candidate-en.json
```

`--help` prints usage. Node entry-point paths may be relative to the caller's working directory; default baselines still resolve inside this repository. Output goes to stdout, with no output-file option. Do not redirect shell output onto an input or shipped fixture. The wrapper uses the existing installed Vitest TypeScript runtime (similar to the sync CLI), launches only its offline harness, and transfers its result through an exclusively created file in a private temporary directory that it removes afterward. This avoids mixing runner progress with JSON. It never invokes `npx`, the sync client, or the fixture writer.

| Exit | Interpretation |
| --- | --- |
| `0` | Inputs validate. Warnings, additions/removals, conflicts and other changes can still require review. |
| `1` | Invalid JSON/schema/metadata, unreadable input, or runner failure. No successful comparison should be inferred. |
| `2` | Missing, duplicate, or unsupported CLI arguments. |

## Validation and interpretation

The reusable pure entry point is [`analyzeIcnSnapshots`](../../src/lib/icn-facilities/icn-snapshot-quality.ts). Every fixture is validated from `unknown` before typed access. It reuses the existing ICN constants, duplicate-ID detection and sync-integrity evaluator; there is no schema dependency or general data framework.

- The envelope and normalized record fields must match [the existing fixture type](../../src/types/icn-facility-browse.ts). Airport, expected language, operation, dataset, valid ISO timestamp, safe integer counts, unique nonnegative listing keys, enum values, nested objects and optional metadata are checked. `recordCount`, declared distinct/duplicate IDs, and `syncIntegrity` must agree with actual rows.
- Missing **data** is distinct from malformed **structure**: nullable fields accept explicit `null`, and blank strings (including name) are valid but reported as incomplete. A non-string name, omitted normalized field, wrong type, or unexpected field is invalid. The normalized schema requires nullable fields to exist; only the distinct/duplicate metadata fields are optional. Unknown terminal/category strings remain raw values. No text is coerced, translated, trimmed for comparison, or filled from another language in the report.
- Each language collapses identical normalized content, ignoring only `listingIndex` and JSON object key order. Distinct variants under one `sourceId` remain visible. `missingFields` reports raw-row counts, collapsed-listing counts and affected IDs; `category` means all three category tiers are absent, while each tier is also counted independently.
- Matching uses exactly one remaining record **on each side**. KO/EN alignment reports shared, unambiguous, KO-only, EN-only and ambiguous shared IDs. Baseline comparisons use the same cardinality rule. Added/removed entries contain the entire ID group's records; unambiguous changes contain exact field-level before/after values. A reused ambiguous ID has both content sets in `ambiguousMatches`, never a confidently matched changed facility. An unchanged ambiguous group remains flagged with `contentChanged: false`.
- Row order, listing indices and duplicate multiplicity cannot create false facility changes. Duplicate-count and metadata changes are visible separately. Reports have no generated timestamp and use stable sorting. Matching totals indicate count consistency only, **not complete airport coverage**; IDs are not guaranteed stable across refreshes.
- JSON `schemaVersion: 1` exposes `baseline`, `candidate`, `comparison`, `valid`, `reviewNeeded`, and `publicationDecision: "not_assessed"`. Invalid snapshots have errors and no analysis counts; their dependent comparisons/alignment are `null`, while independent valid inputs can still be analyzed. Read/JSON failures instead return top-level `errors` before comparison. Runner failures have a bounded stderr diagnostic. No percentages, approval thresholds, automated publishing or release decision are implemented.

## P3 runtime correction

[`icn-snapshot-matching.ts`](../../src/lib/icn-facilities/icn-snapshot-matching.ts) now owns normalized-content collapse and one-record-per-side matching, shared by analysis and runtime. `buildKoreanFallbackIndex` requires **both complete, collapsed catalogs**, before search/terminal filtering. If either side is ambiguous or an ID is unmatched, no Korean name/location is borrowed. Catalogs must not be re-deduplicated using their lossy display fields: distinct arrival/departure or duty flags can project to otherwise identical cards.

Existing English values, raw fields and Korean-fallback flags remain intact. The screen change only passes the full English catalog into that index. Shipped data output is unchanged, including item keys, order, terminal options and fallback flags. The date-formatting function is untouched; the regression digest intentionally excludes timezone-dependent date formatting. No UI redesign, SFO logic, API-client security boundary, CSP or credential handling changed. The historical language-coverage diagnostic still describes raw-row cardinality; use this new report for the shared post-collapse matching contract.

## Actual shipped-fixture result (2026-10-28)

Self-comparison, and reversal/reindexing of all shipped rows, produce **zero additions, removals, field changes, ambiguous matches or metadata changes**.

| Metric | KO | EN |
| --- | ---: | ---: |
| Raw rows | 1,028 | 1,028 |
| Collapsed listings / distinct IDs | 1,011 | 1,011 |
| Identical duplicate rows / duplicate-ID groups | 17 / 17 | 17 / 17 |
| Conflicting IDs | 0 | 0 |
| API reported total | 1,175 | 1,175 |
| Integrity | `api_total_mismatch` | `api_total_mismatch` |
| Missing name / location / terminal / floor (raw and collapsed) | 0 | 0 |
| Missing hours (raw and collapsed) | 84 | 84 |
| Missing large category (raw and collapsed) | 0 | 164 |
| Missing medium category (raw and collapsed) | 0 | 40 |
| Missing small category (raw and collapsed) | 464 | 464 |
| All category tiers absent (raw and collapsed) | 0 | 28 |

There are **1,011 unambiguous bilingual pairs**, zero KO-only or EN-only IDs, and zero ambiguous shared IDs. `valid: true`, `reviewNeeded: true`; warnings retain `API_TOTAL_MISMATCH`, `IDENTICAL_DUPLICATES`, and `MISSING_FIELDS`. The 1,175-versus-1,028 discrepancy remains unresolved and has not been investigated with live API requests in this task.

Both fixture files were compared byte-for-byte against `git show HEAD:<path>` after verification:

| File | SHA-256 |
| --- | --- |
| `icn-facilities-ko.json` | `0bcde726d1800a1896cba3b73277689f2ab303c6f33aef15cee8ad74f4dfd2f4` |
| `icn-facilities-en.json` | `31e9ddbe9d47ebd86b9a4692f7d2cbebacf043d21d6fef0f40a4729fca69614a` |

## Verification and review handoff

| Command / check actually run | Result |
| --- | --- |
| `npm test -- src/lib/icn-facilities/icn-browse-display.test.ts` before correction | Expected RED: both KO-side and EN-side conflicts borrowed Korean text. |
| `npm test -- src/lib/icn-facilities/icn-browse-view-model.test.ts` before fingerprint correction | Expected RED: category object key order changed the fingerprint. |
| Analyzer and CLI focused tests against contract stubs | Expected RED before implementation; then GREEN. |
| `ICN_SYNC=0 ICN_INVESTIGATE=0 npm test -- src/lib/icn-facilities src/components/mivvu src/lib/mivvu-preview-locale.test.ts` | **PASS: 137 tests; 3 skipped** (two live tests plus the dedicated CLI harness, which runs through CLI subprocess tests). |
| Human-summary and `--json` CLI commands above using shipped candidate paths | **PASS**, exit 0; JSON parsed; known mismatch retained and no content changes. |
| Python/subprocess CLI smoke with temporary malformed JSON, `null`, unsupported `--output`, and relative candidate paths outside the repo | **PASS**: invalid inputs exit 1, usage error exits 2, external-cwd self-comparison exits 0; input bytes unchanged. |
| Python/subprocess CLI smoke with temporary synthetic additions/removals/name change/conflicting terminal/missing hours/EN-only ID | **PASS**, exit 0 and review needed; each expected difference asserted. |
| `npm run lint` | **PASS** |
| `npm run build` | **PASS**, including TypeScript and static `/icn` generation. |
| Fixture byte comparison and pre-change shipped-catalog/display SHA-256 regression test | **PASS** |
| `git diff --check` plus new-text-file whitespace and Markdown-link checks | **PASS** |

The combined tests exposed a real CLI transport issue: runner progress could interleave with a large stdout JSON payload. The private temporary report transfer fixes it; the same combined suite then passed. An exploratory synthetic smoke initially reused the source's existing `P03` terminal (an identical duplicate, not a conflict); the smoke was corrected to use a genuinely different terminal, then passed. Existing Vite config-loader advisory remains; no dependencies/config were upgraded.

Skills read and used: `systematic-debugging`, `test-driven-development`, `verification-before-completion`. No subagents. No live sync, E2E/browser redesign QA, production inspection, commits or publishing were performed.

Changed files for Cursor review:

- `src/lib/icn-facilities/icn-snapshot-matching.ts`, `validate-icn-snapshot.ts`, `icn-snapshot-quality.ts`: shared rules, input validation, analysis/comparison.
- `scripts/check-icn-snapshots.mjs`, `src/lib/icn-facilities/icn-snapshot-quality-cli.ts`, `snapshot-quality-cli-runner.test.ts`, `package.json`: offline CLI entry/harness and summary.
- `src/lib/icn-facilities/icn-browse-view-model.ts`, `icn-browse-display.ts`, `src/components/mivvu/MivvuIcnFacilitiesBrowseScreen.tsx`: shared collapse and safe pre-filter matching.
- `src/lib/icn-facilities/icn-snapshot-quality.test.ts`, `icn-snapshot-quality-cli.test.ts`, `icn-shipped-output.test.ts`, `icn-browse-display.test.ts`, `icn-browse-view-model.test.ts`: adversarial and regression coverage.
- `docs/IMPLEMENTATION_PLAN.md`, this document: authorization/state, usage, evidence and limitations.

All 17 task files are local changes, with new files untracked. Existing `.DS_Store` and `docs/.DS_Store` were preserved. No blocker remains for local review. Suggested next action is **Cursor integration review of GW-ICN-007**, followed by human acceptance; this suggestion authorizes no additional implementation, commit, push, merge or release.
