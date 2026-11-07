# GW-ICN-015-ENRICH-IMPL — checkpoint (publication)

Plan revision: **GW-PLAN-REV-2026-10-29**
Branch: `feat/gw-icn-015-goods-services`
Stack base: `feat/gw-icn-014-category`
Task scope: **Enrichment implementation slice only** — optional goods/services companion validation, association, and detail UI. Does **not** complete the full **GW-ICN-015** situation-suitability milestone in [`docs/IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md).

## Human acceptance and independent review (2026-10-30)

| Gate | Status | Notes |
| --- | --- | --- |
| Human owner acceptance | **`accepted`** | Direct authorization 2026-10-30 — enrichment slice + commit/push/PR (**not** merge, production deploy, or real-data acquisition) |
| Independent review (Codex) | **Verdict: acceptable** | Findings **1–4 RESOLVED** — final timestamp re-verification in external report `TIMESTAMP-REVERIFICATION.md` (reviewer-owned evidence outside this repo) |
| Real companion / catalog coverage | **Absent** | Production still loads **no** companion; shipped KO/EN core fixtures unchanged |

Cursor implemented the slice and author corrections; Codex performed independent verification. Human acceptance is recorded here; independent review does **not** substitute for later merge/deploy decisions.

## Verification evidence (provenance)

Inspect **individual** probe/test outcomes; do not treat process exit codes alone as proof.

| Evidence | What it shows | Provenance note |
| --- | --- | --- |
| Focused vitest (`icn-goods-services-companion-validate.test.ts`, `icn-goods-services-associate.test.ts`) | **20 PASS** | Author + Codex final timestamp pass |
| External `reverification/probe-outcomes.json` + `probes.log` | **73/77 PASS** (four timestamp FAILs) | **Retained** from first independent re-verification — **not** rewritten |
| External `reverification/probe-results.json` (summary) | Shows **77/77** after author re-ran `reverification/probes.cjs` | Summary **overwritten** by author rerun; **does not** match retained `probe-outcomes.json` / `probes.log` (**73/77**) |
| External `timestamp-reverification/probe-outcomes.json` | **77/77 PASS** | **Fresh independent** 77-check probe (Codex final timestamp pass) |
| External `timestamp-reverification/timestamp-boundaries.json` | **32/32 PASS** | Codex timestamp grammar/calendar/ordering boundary probes |
| Prior author checkpoint line citing old `probe-outcomes.json` as 77/77 | — | **Incorrect** relative to retained 73/77 file; corrected in this publication record |
| `npm run lint`, `npx tsc --noEmit`, `git diff --check` | PASS (prior passes; re-run at publication staging) | Author closeout + Codex timestamp pass |
| `npm run build` + browser MCP PNGs under `docs/handoffs/GW-ICN-015-browser-*.png` | Author closeout | Reused for publication; not rerun for timestamp-only delta |
| `icn-shipped-output.test.ts` | **FAIL inherited** | KO hash expectation vs fixture at baseline — **not** fixed in this slice |
| `MivvuIcnFacilitiesBrowseScreen.test.tsx` (combined run) | **Three inherited FAILs** | Known at GW-ICN-014 baseline; **not** reverified in final timestamp pass |

**Full suite:** Not green — inherited shipped-output failure and three browse-screen failures remain.

## Independent review findings 1–4 (final)

| # | Issue | Independent status |
| --- | --- | --- |
| **1** | Whole-candidate companion validation (incl. strict ISO/calendar timestamps) | **RESOLVED** |
| **2** | Observation date hydration (`Asia/Seoul`) | **RESOLVED** |
| **3** | Portable loader tests (no harness writes) | **RESOLVED** |
| **4** | Partial field dedup in association | **RESOLVED** |

## Scope delivered

- Accepted companion contract: [`docs/data/icn-facility-goods-services-contract.md`](../data/icn-facility-goods-services-contract.md).
- Reference addendum: supplementary descriptions ([`icn-facility-reference-contract.md`](../data/icn-facility-reference-contract.md)).
- Modules: fingerprint validator, companion validation, target digests, association + projection (`sectionVisible: false`, EN→KO fallback under contract, 280-char collapse).
- Detail wiring: `loadIcnGoodsServicesCompanion()` → **null** in production; dev-only labeled synthetic fixture.
- UI: `MivvuIcnGoodsServicesSection` + dev dashed banner when synthetic companion loads.

## Production and synthetic isolation

| Condition | Behavior |
| --- | --- |
| Default / production | No companion; goods/services section hidden |
| `ICN_GOODS_SERVICES_DEV_COMPANION=1` in **development** only | Loads validated `__test-fixtures__/icn-goods-services-companion-dev.json` |

Core fixture SHA-256 vs baseline HEAD: KO `0bcde726…`, EN `31e9ddbe…` (byte-identical).

## Browser evidence (repository-relative)

| PNG | Scenario |
| --- | --- |
| `GW-ICN-015-browser-ko-detail-390px.png` | KO detail with dev synthetic |
| `GW-ICN-015-browser-en-detail-390px.png` | EN detail |
| `GW-ICN-015-browser-ko-long-360px-expanded.png` | Long text expanded |
| `GW-ICN-015-browser-en-fallback-360px.png` / `-430px.png` | EN eligible KO fallback |
| `GW-ICN-015-browser-prod-hidden-section-390px.png` | Production-like hidden section |
| `GW-ICN-015-browser-browse-preservation-390px.png` / `-return-preservation-390px.png` | Browse state preserved |

## Publication exclusions (not in commit)

- Harness URL/temp files under `docs/handoffs/.gw-icn-015-*`, `.urlb64-*`
- `e2e/gw-icn-015-enrich-closeout.mobile.spec.ts`, `playwright.closeout.config.ts` (Playwright not installed in verification environment)
- Auto-generated `AGENTS.md` Next.js agent-rules block from local `next dev`
- External reviewer directories (`reverification/`, `timestamp-reverification/`)

## GATEWISE STATUS — Cursor (publication)

```text
Task ID / objective: GW-ICN-015-ENRICH-IMPL — acceptance record and publication
Plan revision: GW-PLAN-REV-2026-10-29
Execution permission: authorized (human: accept + commit/push/PR)
Work progress: complete
Review / acceptance: accepted (human 2026-10-30); independent acceptable; findings 1–4 RESOLVED
Integration / release: PR opened (stacked); not merged; not production-deployed
Files changed: see publication commit
Behavior delivered: validated optional companion path; production companion absent
Tests and commands actually run: see evidence table; full suite not green (inherited failures)
Git branch / commit / push state: recorded after push in publication report
Dependencies needed from other owner: feat/gw-icn-014-category merge path for integration
Blockers: real-data acquisition unauthorized; inherited test failures documented
Handoff / report location: this checkpoint
Recommended next task (proposal only): merge stack when authorized; separate acquisition task
Decision needed from human owner: merge/deploy when ready
```
