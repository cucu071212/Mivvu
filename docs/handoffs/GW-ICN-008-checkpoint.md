# GW-ICN-008 checkpoint and Cursor handoff

## Authorization and identity

- Task: robust local ICN facility search; plan revision **GW-PLAN-REV-2026-10-26**.
- Human owner directly assigned this task through the attached execution prompt in Codex chat, **2026-10-28 America/New_York**. Codex implements; Cursor integration review; human final acceptance.
- Execution **authorized**; progress **complete**; review **pending**; integration/release **n/a**.
- Worktree: `/Users/wonjonghun/.codex/worktrees/gw-icn-008-search/GateWise`.
- Branch: `codex/gw-icn-008-search`; base/HEAD: `5bd3121f6aac992ac1b5d59e33c1e68d65c40170`. Current GitHub `cucu071212/Mivvu` main verified with GitHub connector before creation; local main/origin/main agree. Origin still uses the old GateWise repository URL; no remote settings changed.
- Local source/tests/docs/verification only. No commit, push, PR, GitHub mutation, merge, deployment, live airport API, active scanning, fixture replacement, dependency changes, or subagents. SFO engines/maps/recommendations/infrastructure excluded.
- Read current AGENTS, PLAN, implementation plan, plan revisions and ICN data/browse handoffs. No product-scope conflict. Existing GW-ICN-008 worktree/branch/checkpoint absent on startup.
- Skills read and applied: test-driven-development, systematic-debugging, verification-before-completion. No redesign/formal plan needed. Model configuration is inherited from this session; no model switch was performed.

## Progress / next action

**Local implementation and required verification complete.** No source changes are unfinished; no failing cases remain. Review/acceptance is pending; release is n/a.

Next concrete action: Cursor reviews the local diff and integrates with GW-ICN-007 only under a subsequent authorized task; human owner decides acceptance. No new task, commit, push or release is authorized by this completion. For resumption, inspect this worktree's actual diff/status and the measured-source hashes in the evidence JSON; do not restart or repeat successful checks without an affected change.

## Settled search decisions

- Search only selected locale catalog fields (name, location, category, terminal label). No bilingual fallback text in search. Preserve source/display strings.
- Canonical normalization, targeted full-width ASCII folding, lowercase and whitespace collapse; avoid global compatibility folding that conflates circled/superscript numbers.
- AND across whitespace-separated literal tokens, any field/order; retain old contiguous substring membership.
- Initial consonants match contiguous positions within a field; compatibility consonants and modern leading jamo equivalent. Mixed tokens retain complete Hangul syllables, Latin, digits and punctuation literally at their positions; no arbitrary gaps.
- Typo recovery only after zero strong matches in active terminal; at most one query token has one insertion/deletion/substitution against a complete Unicode-Latin name word, both query/candidate at least five letters. All other tokens strong. No transposition, digit, terminal, location or short-token fuzziness. Terminal label words, terminal ID, “terminal” and “concourse” are excluded even when repeated inside a name. Short literal substrings (e.g. loun) still match normally.
- Rank exact normalized name (0), whole mixed/initial name (1), name prefix or all literal name words (2), other name matches (3), other fields (4); catalog ordinal breaks ties. Empty query preserves membership/order. Initials do not skip punctuation/space; identical initials can legitimately match different words such as 화장실 and 환전소.
- Cache each catalog index independently of keystrokes and locale switches. Preserve raw input and composition state; no normalized text written into input.

## GW-ICN-007 preservation and integration

Original worktree `/Users/wonjonghun/Desktop/GateWise`, branch `codex/gw-icn-007-snapshot-quality`, has reviewed but uncommitted work. It is read-only throughout this task. Initial status and hashes are in [preservation manifest](GW-ICN-008-preservation.json), including existing .DS_Store files. No source copied from that implementation.
Actual overlap: `docs/IMPLEMENTATION_PLAN.md` and `src/lib/icn-facilities/icn-browse-view-model.ts`. 008 does not edit screen runtime, display fallback, fingerprint or collapse implementation; its component test is additional coverage. Integration consideration in `src/components/mivvu/MivvuIcnFacilitiesBrowseScreen.tsx`: Preserve 007's collapse/fingerprint changes and `buildKoreanFallbackIndex(catalogKo.items, catalogEn.items)` call on full catalogs. Do not rebuild that map from filtered results or re-deduplicate lossy view-models. 008 search indexes raw locale items before display fallback. 007 source/tests are not part of this worktree.

## Files changed

| Path | Purpose |
| --- | --- |
| `src/lib/icn-facilities/icn-facility-search.ts` | Client-safe normalization, index/cache, query preparation, matching, ranking, bounded typo recovery |
| `src/lib/icn-facilities/icn-browse-view-model.ts` | Existing filter delegates to cached search; entire catalog builder unchanged |
| `src/lib/icn-facilities/icn-facility-search.test.ts` | 18 synthetic contract/stage/adversarial tests |
| `src/lib/icn-facilities/icn-search-catalog.test.ts` | Actual fixture hashes, 1011 memberships/order, former substring retention, terminal isolation |
| `src/lib/icn-facilities/icn-search-evidence.test.ts` | Opt-in offline benchmark/relevance evidence; not a timing assertion |
| `src/components/mivvu/MivvuIcnFacilitiesBrowseScreen.test.tsx` | Raw composition text, node/focus/state, counts, HTML-shaped strings, locale-local search before fallback |
| `e2e/icn-facility-search.mobile.spec.ts` | Production Chromium IME/state/count/focus, literal syntax, 360/390/430 layout, screenshots |
| `docs/IMPLEMENTATION_PLAN.md` | Owner dispatch, permissions, completion and pending acceptance |
| `docs/handoffs/GW-ICN-008-checkpoint.md` | This durable checkpoint, verification history and Cursor handoff |
| `docs/handoffs/GW-ICN-008-preservation.json` | Original 007 branch/HEAD/dirty status and 19 file hashes |
| `docs/handoffs/GW-ICN-008-search-evidence.json` | Measured-source hashes, complete relevance examples, timing distributions/environment |
| `docs/handoffs/GW-ICN-008-390-ko.png`, `GW-ICN-008-390-en.png` | Reviewed 390px screenshots |

No fixture, package/lockfile, screen runtime, CSS, messages, SFO engine, API client or deployment config changed.

## Verification history (earlier states retained for resumption evidence)

- Startup `git worktree list --porcelain`, `git branch --list`, `git status --short`, `git rev-parse HEAD/main/origin/main`: inspected; no existing 008; 007 dirty and preserved.
- GitHub `search_branches` / `fetch_commit(main)`: main resolves to base above.
- `create_worktree` succeeded; first `git switch -c` sandbox-denied; same authorized local operation with escalation succeeded. No automatic approval rejection.
- Dependency setup: local clone-copy of already-installed node_modules (no install scripts, no lockfile/package changes); process session 34673 may still be copying. Inspect completion before tests.
- No feature checks run yet. No known failing implementation cases yet.

## Running processes

None at completion. Dependency copy, all test/build processes and Playwright-managed servers have exited. Earlier log entries below describe processes at the time of each checkpoint, not currently running work. Usage-limit interruption does not imply automatic resumption.

### Unit 1 — test-first baseline

`npm test -- src/lib/icn-facilities/icn-facility-search.test.ts` against unchanged base search: expected RED, 9 failed / 3 passed (12). Failures confirm missing normalization, multi-token, initials, typo fallback and ranking. Existing substring and literal syntax cases pass. Before implementation, corrected the two-typo negative from `coffe` (already a valid substring of Coffee) to `coffxe`; the contract preserves partial substrings, so only the latter tests two corrections. Dependency copy finished successfully; no running process.

### Unit 2 — first implementation and investigated test setup

First GREEN attempt: 11 passed / 1 failed. Investigation: numeric test used query `gate 1`, while every synthetic row contained terminal label `Terminal 1`; new AND semantics correctly match 1 there, and partial substring 1 also matches 01. Corrected test setup to contiguous `Gate01` / `Gate1` / `Gate2` / `Gate①²`, which isolates numeric normalization without contradicting the required substring/any-field behavior. Added direct normalization, index reuse, ranking/matching and edit-distance tests. No numeric boundary restriction is introduced: substring semantics remain intentional.

### Unit 3 — implemented search and focused verification

Source v1: new `src/lib/icn-facilities/icn-facility-search.ts` implements pure normalization/query preparation/indexing/matching/ranking, conservative one-token typo fallback and WeakMap cache per catalog array/locale. `icn-browse-view-model.ts` delegates only its existing filter function; catalog-building/display/007 fallback code untouched. `icn-facility-search.test.ts` covers contract and each exported stage. Cache requires immutable catalog arrays (current server-provided snapshots satisfy this).

New direct accented-Latin test was RED because initial ASCII-only token guard rejected `caféteria`; changed guard to Unicode Latin script and edit counting to code points. `ICN_SYNC=0 ICN_INVESTIGATE=0 npm test -- src/lib/icn-facilities src/components/mivvu src/lib/mivvu-preview-locale.test.ts`: **PASS 92**, **2 skipped** live-only harnesses. Existing Vite config-loader advisory, unchanged. No running process.

Next: component composition/state/security regression tests; fixture-byte/order and substring preservation tests; opt-in relevance/benchmark harness; full checks and local production browser QA.

### Unit 4 — fixture/component regression and real-catalog observations

Focused suite after fixture regression + component IME/state/HTML/fallback tests: **PASS 100**, **2 skipped**. Both fixtures unchanged; every catalog field and boundary sampled for previous substring membership. Initial evidence harness passed (150 index builds, 300 warm queries/scenario), but evidence inspection found two relevance issues to address before final measurement:
1. `ㅎㅈㅅ` matches both 화장실 and 환전소. Contiguous initials are correctly ambiguous, but whole initial-name matches should precede longer containing names; add independent ranking regression.
2. `termnal` recovered Terminal inside three real facility names. Terminal labels are protected fields but their repeated name words also need exclusion from typo candidates. Add independent negative test for terminal/concourse/transport-center words in names.
A proposed rejected query `loun` actually has 40 legitimate strong substring results; replace the evidence near-miss with `lounx`, and explicitly preserve short substrings. This is an evidence scenario correction, not a search bug.
Next: RED/GREEN these two tests, regenerate evidence for updated source, then full checks/build/browser. No running processes.

### Unit 5 — relevance corrections complete, before full verification

Two new regressions produced expected RED. Added whole-name/prefix initial ranking and excluded terminal label words (plus terminal/concourse and terminal ID) from Latin typo candidates even inside names. Existing mixed-token ranking expectation now correctly puts a contiguous mixed prefix first; membership unchanged. Focused search tests **PASS 18**. Updated evidence harness **PASS** against v2 search; refreshed JSON records source SHA-256. This source is the candidate for full verification.

Exact Python comparison of the complete catalog-builder source against `git show 5bd3121:src/lib/icn-facilities/icn-browse-view-model.ts` (excluding the new search import and replacement filter) **PASS, byte-identical**. Both fixture files compared byte-for-byte to the same base **PASS**. Combined with empty-query full-object/order tests, this establishes unchanged saved browse membership/order.

Running next: full offline unit suite, lint and production build, followed by TypeScript and production browser suite. No live API/environment files loaded. No UI source/CSS/copy changed.

### Full verification results (v2 source)

- `ICN_SYNC=0 ICN_INVESTIGATE=0 npm test`: **PASS 1051**, **3 skipped** (2 live harnesses + opt-in evidence harness, run separately).
- `npm run lint`: **PASS**.
- `NEXT_TELEMETRY_DISABLED=1 npm run build`: **PASS**, Next 16.4.3, TypeScript, 11 static pages, `/icn` static.
- `git diff --check`: **PASS** for tracked changes; full untracked whitespace/link checks still pending.
- Processes 73228/93023/48929 all finished. Before first browser run, corrected test locator from assumed “All terminals” to existing actual “All” copy by reading messages; product copy unchanged.
- Remaining: standalone tsc, production browser suite + screenshot inspection, source/import boundary audit, preservation recheck, final handoff.

### Browser first run and diagnosed expectation

`node_modules/.bin/tsc --noEmit`: **PASS**. `npm run test:e2e:run`: **28 passed / 1 failed**. All existing 27 browser regressions (including SFO) and new Chromium CDP Korean IME/state/focus test passed. Failure was the new test assuming literal `[` had no saved matches. Error snapshot shows bracketed listing names; offline fixture inspection finds bracketed text in 123 KO raw rows / 122 EN raw rows. Corrected browser expectation to require real bracket-containing cards and a matching visible count; no product change. Unit tests already assert literal unmatched-regex bracket behavior. Re-run only the changed ICN browser spec; existing regressions are unaffected.

Client chunk scan for `DataGoKrService`, `node:fs`, `readFileSync`, `icn-snapshot-quality`, `DATA_GO_KR_SERVICE_KEY`, `B551177`: **no matches** (rg exit 1 means absent). New runtime module imports only types; no filesystem/analyzer/server code added to the client. No server remains after Playwright exit.

## Final verification matrix

Commands run from `/Users/wonjonghun/.codex/worktrees/gw-icn-008-search/GateWise`. Runtime source v2 is identified by exact SHA-256 in [evidence JSON](GW-ICN-008-search-evidence.json); hashes rechecked against final files. No runtime changes occurred after production build.

| Command/check actually run | Final result |
| --- | --- |
| `npm test -- src/lib/icn-facilities/icn-facility-search.test.ts` | PASS 18 after documented RED/GREEN cycles |
| `ICN_SYNC=0 ICN_INVESTIGATE=0 npm test -- src/lib/icn-facilities src/components/mivvu src/lib/mivvu-preview-locale.test.ts` | PASS 100 / 2 skipped at v1; later v2 fully covered by full suite |
| `ICN_SYNC=0 ICN_INVESTIGATE=0 npm test` | PASS 1051 / 3 skipped on final runtime source (live sync/investigation disabled; evidence harness opt-in) |
| `ICN_SEARCH_EVIDENCE=1 npm test -- src/lib/icn-facilities/icn-search-evidence.test.ts` | PASS, final v2 measurements saved; 1 test |
| `npm run lint` | PASS, repeated after final browser test correction |
| `node_modules/.bin/tsc --noEmit` | PASS, repeated after final browser test correction |
| `NEXT_TELEMETRY_DISABLED=1 npm run build` | PASS, production compilation + typecheck + static routes |
| `npm run test:e2e:run` | Existing 27 browser tests PASS; new composition test PASS; bracket-case expectation failed (diagnosed above) |
| `npm run test:e2e:run -- e2e/icn-facility-search.mobile.spec.ts` | PASS 2/2 after correcting only the test expectation; all 29 browser cases have passing evidence across these two runs |
| `view_image` of KO + EN 390px screenshots | Reviewed: title/input/chips/count/cards/source notice readable, no horizontal clipping |
| Catalog-builder comparison + fixture bytes vs `git show 5bd3121:…` | PASS; builder byte-identical outside search wiring, both fixture bytes identical |
| Preservation manifest comparison | PASS: original 007 branch, HEAD, full dirty/untracked status and all 19 hashes unchanged |
| Evidence SHA-256 comparison against final sources | PASS |
| Client bundle scan + import inspection | No filesystem, API key/client, snapshot analyzer strings in browser chunks; runtime module has only type imports |
| `git diff --check`, changed/new text whitespace + Markdown link review | PASS for all 13 changed/new files; existing local relative Markdown targets resolve |

Browser scope: local production build, Chromium automation, mobile browser viewports; CDP `Input.imeSetComposition` + `Input.insertText` simulates composition and commit. Native OS Korean IME, physical devices, VoiceOver/screen-reader speech and non-Chromium browsers were **not tested**. Existing Vite loader advisory and Playwright NO_COLOR/FORCE_COLOR warnings remain; no dependency/config change was made for them.

## Compact relevance evidence

Results are observations from the unchanged saved snapshots, not new airport facts. Full top-three records and locations are in [evidence JSON](GW-ICN-008-search-evidence.json).

| Query / locale / filter | Expected behavior | Actual top results (sourceId), count | Rejected near-match |
| --- | --- | --- | --- |
| `ㅎㅈㅅ` / KO / T2 | Contiguous initials, whole-name matches first | 화장실 (559, 1040, 338); 76 total | `ㅅㅈㅎ`, `ㅎㅈㅅzz`: 0 |
| `ᄒᄌᄉ` / KO / T2 | Equivalent leading jamo | Same top 3 and 76 total | — |
| `248 스타벅스` / KO / T2 | AND across name/location, any order | 스타벅스 (657); 1 | `249 스타벅스`: 0 |
| `ＳＴＡＲＢＵＣＫＳ` / EN / all | Full-width and case normalize | STARBUCKS (2471), Starbucks (2117, 760); 6 | — |
| `248 starbucks` / EN / T2 | Numeric location plus name | Starbucks (657); 1 | `249 starbucks`: 0 |
| `starbcks` / EN / T2 | One deletion after no strong hits | STARBUCKS (2471), Starbucks (760, 657); 3 | `stabrucsk`: 0 |
| `loune` / EN / T1 | Five-letter query, one name deletion | Asiana Business Lounge Central/East/West (640, 744, 924); 12 | `lounx`, `loune 99999`: 0 |
| `termnal` / EN / all | No fuzzy terminal words, including inside names | 0 | — |
| `Starbucks` / KO; `화장실` / EN | No cross-language lookup | 0 each | — |
| `^.*$` / KO; HTML-shaped query / EN | Literal data | 0 each | `[` legitimately matches 123 KO bracketed listings in browser |

Initials are not a restroom category filter: 환전소 shares ㅎㅈㅅ and can appear farther down. Numeric characters stay distinct (including 01/1 and circled/superscript forms), but ordinary substring semantics remain: a query token `1` can match `01` or a terminal label; digits are never fuzzed. No translation, romanization, accent stripping, arbitrary-gap initials, or external search service is used.

## Performance evidence

Environment: Apple M5 Pro, macOS Darwin 25.6.0 arm64, Node v24.17.0, existing Vitest. Each locale has 1011 displayed listings. Serial isolated evidence run, `performance.now()` milliseconds. Build: 25 warmups then 150 index builds. Queries: one reused index, 50 warmups then 300 individual timings per scenario; all outliers retained. No timing assertions. Catalog creation, React rendering, DOM cost, input-to-paint latency and network are excluded; these are **not mobile-speed measurements**.

| Work | p50 ms | p95 ms | min–max ms |
| --- | ---: | ---: | ---: |
| KO index build | 2.811 | 3.204 | 2.666–3.784 |
| EN index build | 1.432 | 1.558 | 1.398–1.646 |
| KO warm `ㅎㅈㅅ`, T2 | 0.213 | 0.239 | 0.204–0.440 |
| KO warm `248 스타벅스`, T2 | 0.031 | 0.033 | 0.031–0.065 |
| EN warm full-width Starbucks, all | 0.065 | 0.076 | 0.063–0.269 |
| EN warm `starbcks`, T2 | 0.100 | 0.110 | 0.095–0.166 |
| EN warm no-result `termnal`, all | 0.241 | 0.274 | 0.228–0.332 |

All 15 query scenarios, including empty queries, mixed fields, initials, malformed-looking syntax and cross-language no-results, retain full distributions in the JSON. Index cache keys are immutable catalog array identity plus locale; replacing a snapshot must provide a new array. It is intentionally not a mutable-data subscription.

## Cursor integration and final GATEWISE STATUS

- Integrate 008's search import and final filter-function replacement while retaining 007's shared collapse/fingerprint implementation in `icn-browse-view-model.ts`.
- Preserve 007's `buildKoreanFallbackIndex(catalogKo.items, catalogEn.items)` call over **full** collapsed catalogs. Search remains before `toBrowseDisplayItems`; no Korean fallback text enters the English search index. Do not replace either full catalog with filtered results for bilingual ambiguity checking.
- Keep both task rows when resolving `docs/IMPLEMENTATION_PLAN.md`; this branch starts from main and therefore does not carry 007's uncommitted row/files. No 007 implementation is absorbed here.
- Existing local node_modules were clone-copied for isolation, with no installation scripts or dependency changes. No credentials/environment files were copied or loaded.

```text
GATEWISE STATUS — Codex
Task ID / objective: GW-ICN-008 — robust local ICN facility search
Plan revision: GW-PLAN-REV-2026-10-26
Execution permission: authorized (human owner, direct Codex chat attachment, 2026-10-28 America/New_York)
Work progress: complete
Review / acceptance: pending (Cursor integration review; human final acceptance)
Integration / release: n/a
Files changed: file inventory above; 2 runtime files, 5 test files, task docs/evidence/screenshots
Behavior delivered / verified data sources: normalized locale-local AND/initial search, conservative name typo fallback, deterministic rank/cache; unchanged saved KO/EN catalogs
Tests and commands actually run: final matrix above; 1051 unit tests, 27 existing browser regressions plus 2 ICN browser tests, lint/typecheck/build and offline evidence
Git branch / commit / push state: codex/gw-icn-008-search; base/HEAD 5bd3121f6aac992ac1b5d59e33c1e68d65c40170; no new commit/push/PR
Dependencies needed from other owner: Cursor integration review preserving GW-ICN-007 ambiguity guard
Blockers, known limitations, integration risks: no local blocker; immutable catalog cache; ambiguous initials and preserved partial numeric substrings; browser/benchmark limits above
Handoff / report location: docs/handoffs/GW-ICN-008-checkpoint.md in the absolute task worktree above
Recommended next task (proposal only): Cursor review of 008 with 007 integration boundaries
Decision needed from human owner: acceptance after review; any publication requires separate authorization
```

Final closeout: 13 changed/new files; `git diff --check` and new-file whitespace/newline/link checks PASS. Rechecked 007's complete dirty status and 19 hashes, plus measured source hashes: PASS. Branch/HEAD still as recorded, no new commits. `lsof -nP -iTCP:3100 -sTCP:LISTEN` returned no listener (exit 1), confirming the Playwright local server is stopped; this is not a test failure. No running process or unresolved local blocker.
