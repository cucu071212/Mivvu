# GW-ICN-015-ENRICH-ADOPT — checkpoint (publication)

Plan revision: **GW-PLAN-REV-2026-10-29**
Branch: **`codex/gw-icn-015-enrich-data`** (stacked on **`feat/gw-icn-015-goods-services`**, PR **#12** @ **`dac99bb…`**)

## Human acceptance (2026-10-31)

The human owner **accepts** real-companion adoption integration and the **final E2E/documentation correction** (sourceId **243**: KO **187** chars without toggle; EN E-origin **349** chars with Show more / Show less). **Does not** grant merge, production deploy, or full **GW-ICN-015** milestone completion.

| Gate | Status |
| --- | --- |
| Independent ADOPT runtime review | **Supportable** — default loader, fail-closed paths, server boundary, native Chrome (Codex adopt review; evidence **outside** repo) |
| Final E2E spec correction | **Author-corrected**; **not** independently re-signed on this edit alone |
| jsdom adoption tests | **7 PASS** after correction (includes EN **243** collapse) |
| Playwright adopt spec | **Not executed** by author (Chromium missing in first pass; second attempt blocked by occupied port **3100**) |
| Human ADOPT acceptance | **`accepted` 2026-10-31** |
| Publication | **Commit/push/PR authorized** |

## Adopted artifact

| Field | Value |
| --- | --- |
| Repository path | `src/data/fixtures/icn-goods-services-companion-v1.json` |
| SHA-256 (file bytes) | `45f52bc64da4493f94e2daf02ec319586d983a77cb6df2995a367cd747c36802` |
| Capture metadata preserved | `syncIntegrity`: **`api_total_mismatch`** (K/E); observation window **2026-10-31T04:36:14.329Z** → **2026-10-31T04:36:34.450Z** |
| Target binding | `targetCoreDigests` validated against shipped KO/EN core fixtures |

## Core fixture preservation

| Fixture | SHA-256 (unchanged) |
| --- | --- |
| `icn-facilities-ko.json` | `0bcde726d1800a1896cba3b73277689f2ab303c6f33aef15cee8ad74f4dfd2f4` |
| `icn-facilities-en.json` | `31e9ddbe9d47ebd86b9a4692f7d2cbebacf043d21d6fef0f40a4729fca69614a` |

## Loader behavior

| Runtime | Companion loaded |
| --- | --- |
| Default (no `ICN_GOODS_SERVICES_DEV_COMPANION`) | Reviewed shipped JSON after byte SHA + schema + digest checks |
| `ICN_GOODS_SERVICES_DEV_COMPANION=1` in non-production | Labeled `__test-fixtures__/icn-goods-services-companion-dev.json` |
| Production / `VERCEL_ENV=production` with dev flag | **Reviewed** companion (synthetic blocked) |

Invalid/missing companion → `loadIcnGoodsServicesCompanion()` returns **null**; core detail unchanged.

Modules: `icn-goods-services-adoption.ts`, `load-icn-goods-services-companion.ts` (server-only reviewed read).

## Coverage (reviewed expectations)

| Denominator | Visible | Hidden empty | Hidden no exact | EN KO fallback |
| --- | ---: | ---: | ---: | ---: |
| Raw-weighted (1028) | **861** | **162** | **5** | **0** (EN path) |
| Unique browse (1011) | **844** | **162** | **5** | **0** |

Both reference-origin and requested-locale paths retain strict withholding and existing fallback policy (see assessment and Codex adopt review summaries).

## Tests and commands (publication evidence)

| Command | Result |
| --- | --- |
| Adoption + loader vitest | **12 PASS** |
| `MivvuIcnGoodsServicesAdoption.test.tsx` | **7 PASS** |
| Associate + companion validate vitest | **20 PASS** (reused) |
| `icn-shipped-output.test.ts` | **1 FAIL inherited** — not fixed |
| Combined `MivvuIcnFacilitiesBrowseScreen.test.tsx` | **Three inherited FAILs** — not rerun |
| `npm run lint` / `tsc` / `npm run build` | **PASS** (author adopt pass; reused at publication) |
| Playwright `e2e/gw-icn-015-enrich-adopt.mobile.spec.ts` | **Not executed** (see acceptance table) |

## Browser evidence

- **Codex adopt review (external):** native Chrome at 390×844 on copied production build — KO/EN **3289**, hidden **3395**, browse return, **E-origin EN 243** toggle behavior.
- **Author:** jsdom projection tests only for adopt pass; no claim of duplicating Codex browser runs.

## Out of scope / not done

- Merge to `main`, Vercel production promotion, core fixture refresh, new API capture
- Full **GW-ICN-015** suitability panel milestone
