# GW-X-004 — Integration & Regression Report

**Task:** GW-X-004 (Phase X closure integration)  
**Executed:** **2026-10-25 (America/New_York)**  
**Production `main`:** `a92467d16da023c9e52483a9ddcb51e9ee3df2db` (merge T3 pilot @ `7ebf3e9`)  
**Production URL:** https://gate-wise-iota.vercel.app  
**Vercel deployment:** `gate-wise-bi6xiwr08-gate-wise.vercel.app` (READY)  
**GW-X-004 doc/fix branch:** `docs/gw-x-004-integration-regression` (hours `rawText` fix + this report)  
**G-X3:** **Not signed** — human Engineering Lead approval required per `IMPLEMENTATION_PLAN.md`.

---

## 1. GW-X-004 acceptance criteria (IMPLEMENTATION_PLAN §GW-X-004)

| Criterion | Evidence | Result |
| --- | --- | --- |
| **602+ tests green** | `npm test` → **630** passed (37 files) | **PASS** |
| Flight countdown unchanged | Production `/` — countdown section + manual budget; `boarding-countdown.test.ts` in suite | **PASS** |
| What-if unchanged | Production `/recommendations` — What-if simulator region; `what-if-compare.test.ts` in suite | **PASS** |
| Personalization unchanged | Results — “Your time estimates” + browse 26; override tests in suite | **PASS** |
| Security headers unchanged | `curl -sI /explore` — `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, CSP per `next.config.ts` | **PASS** |
| D Gates smoke | 12 `recommendEligible` T2 D; legacy outcomes in `gw-x-002-batch-*` + `recommend.test.ts` | **PASS** |

---

## 2. Independent integration checks

| Area | Method | Result |
| --- | --- | --- |
| **Multi-terminal data + validation** | `validateFacilities` on production JSON; **26** rows, **0** errors; batch tests IT/T3/HM1/T2 | **PASS** |
| **Terminal / boarding-area filters** | Production Explore — Terminal 3 filter → **3 of 26**; IT HM1 patterns verified in prior releases | **PASS** |
| **Browse vs recommend** | Explore banner: **26** browse, **12** recommend; non-D chips “Browse only — not in recommend scope” | **PASS** |
| **Unknown duration propagation** | All production rows `waitMinutes` / `activityMinutes` null; recommend `unknown` kinds unchanged for 12 D | **PASS** |
| **Legacy D Gates behavior** | `recommendFacilities` deep-equal outcomes for 12 IDs @ 60 min context (batch tests) | **PASS** |
| **Mobile navigation** | Production Explore @ ~390px (prior session pattern); primary mobile nav present on Flight/Explore | **PASS** |
| **Limitation copy** | “not live open/closed”; cross-terminal walks not modeled; T3 construction link — no path minutes | **PASS** |
| **Coverage accuracy** | Directory is **representative** staged batches (R002), not full SFO inventory — stated in Explore header | **PASS** |

---

## 3. Production browser verification (2026-10-25)

| Check | Observation |
| --- | --- |
| Explore **26 of 26** | PASS |
| **AG1** — Terminal 3 · **E Gates**, browse-only | PASS |
| **Aletitude** / **Amoura** — Terminal 3 · **F Gates**, browse-only | PASS |
| **Amoura** F11–F22 location prose | PASS (card “Where” text) |
| T3 construction notice + “does not model paths” | PASS (`SFO Terminal 3 construction` link on Explore) |
| Recommendations **Browse all 26 places** | PASS |
| IT + T3 + HM1 ineligible on Results | PASS (Why ineligible sections) |
| **12** D Gates recommend scope copy | PASS |

---

## 4. Automated commands (`main` @ `a92467d`)

| Command | Result |
| --- | --- |
| `npm test` | **630** PASS |
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS |

---

## 5. Scoped fix (GW-X-004)

**Issue:** `presentFacilityHours` treated `hours.kind: unknown` as “not published” even when `rawText` was present (AG1 24-hour listing, Vino Volo day-split text).

**Fix:** `src/lib/format-facility-hours.ts` — show trimmed `rawText` with `isUnknown: true` and standard disclaimer; test in `format-facility-hours.test.ts`.

**Not in production until:** merge `docs/gw-x-004-integration-regression` (or cherry-pick) + deploy.

---

## 6. Remaining limitations (not failures)

- SFO facility inventory **not complete** (R002 representative matrix only).
- **Recommend scope:** T2 D Gates **12** only; no cross-terminal travel matrix.
- **Asian Box** / **Aviation Museum** (IT) deferred per verification reports.
- **AG1** hours remain **unknown** for time math (verbatim text only; no invented open/close locals).
- Terminal filter includes T3/IT with partial row counts vs full airport Shop/Dine catalog.
- Published hours ≠ live availability (by design).

---

## 7. G-X3 recommendation (for human lead)

| Recommendation | **READY** |
| --- | --- |
| Rationale | GW-X-004 checklist green on production @ `a92467d`; 630 tests; browse/recommend split verified; D Gates legacy preserved. Optional: merge hours `rawText` display fix before signing if AG1/Vino copy must match dataset on first paint. |
| Not signed here | Per task authorization — **G-X3** remains human sign-off in `IMPLEMENTATION_PLAN.md`. |

---

## 8. Recommended next Phase B task

**GW-B-R001** — Indoor location and routing research (`docs/walking-time-policy.md` or provenance appendix): evaluate SFO maps / third-party options, licensing, and **recommend staying on demo_estimate until a verified edge list exists** (IMPLEMENTATION_PLAN §Phase B).

---

**Document version:** 1.0
