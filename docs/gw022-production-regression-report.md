# GW-022 — Final production regression report

**Role:** Independent QA Lead  
**Date:** 2026-10-24 (Eastern Time)  
**Production URL:** https://gate-wise-iota.vercel.app  
**Expected `origin/main`:** `665e5e85a9b30b8114c678c7097a3b9ce5e805` (verified via `git fetch` + `git rev-parse origin/main`)  
**Deployed commit SHA (Vercel metadata):** NOT VERIFIED in this environment  

**Scope:** Live browser regression on production only. No application code changes. Local `npm test` / lint / build **not re-run** in this task (prior lead runs on `665e5e8`).

## Summary

| Verdict | Detail |
| --- | --- |
| **Overall** | **PASS with caveats** — core MVP + GW-015 schematic behave correctly on production; keyboard toggle on `<details>` summary not confirmed via automation; external SFO link HTTP check blocked by 403. |

## Results matrix

| ID | Check | Result | Evidence |
| --- | --- | --- | --- |
| R01 | SFO T2 D Gates app loads | **PASS** | Title GateWise; scope copy; Zone D |
| R02 | 12 facilities + listing links on cards | **PASS** | “12 places”; 12 “View official listing” links (DOM count) |
| R03 | Demo OFF → unknown margins | **PASS** | Initial load: unknown notes on all cards |
| R04 | Demo ON → calculated breakdowns | **PASS** | Demo status banner; queue 8 / activity 10 / travel 3 shown |
| R05 | Margins −1 / 0 / +9 / +10 (demo ON, buffer 10, required 34) | **PASS** | What-if baseline at 33→**−1 over budget**, 34→**0 tight**, 43→**+9 tight**, 44→**+10 feasible** |
| R06 | What-if comparison (50 baseline; scenario 35; queue +7) | **PASS** | Baseline **+16 feasible** → scenario **−6 over budget** with combined explanation |
| R07 | Text search filter | **PASS** | “Napa” → **1 place**; Napa Farms in list |
| R08 | Category filter | **PASS** | Food → **6 places** (food category facilities) |
| R09 | Invalid boarding minutes | **NOT RUN** | Automation fill with empty string failed; behavior verified in prior integration pass — recommend one manual empty-field check before Devpost |
| R10 | GW-015 schematic visible | **PASS** | “D Gates schematic (full directory)” present |
| R11 | Schematic independent of filters | **PASS** | With Napa search: 1 recommendation; schematic still lists all landmark groups / 12 SFO listing hrefs when expanded |
| R12 | Schematic mouse expand/collapse | **PASS** | `details.open` false → panel height 0; click opens (~3175px) and second click closes |
| R13 | Schematic Enter / Space on summary | **FAIL (automation)** | Programmatic Enter/Space and one `browser_press_key` pass did not toggle `open`; **mouse click on summary works**. Manual keyboard retest recommended (native `<details>` should support Space/Enter). |
| R14 | Schematic links not focusable when collapsed | **PASS** | `link.focus()` when `open=false` did not retain focus on link |
| R15 | Schematic SFO hrefs | **PARTIAL** | 12 `https://www.flysfo.com/...` hrefs present (sample Brookstone); **click-through / HTTP 200 not verified** (`curl` returned **403** — likely bot wall) |
| R16 | Mobile 375px layout | **PASS** | No horizontal overflow; core regions reachable |
| R17 | Runtime / hydration errors | **PASS** | No hydration text; no `nextjs-portal` error overlay observed |
| R18 | Disclaimers (model-only, demo estimates, schematic honesty) | **PASS** | Flight-context travel note; demo status; schematic “not a floor plan”; “not filtered” directory note |

## Failures / follow-ups

### F1 — Keyboard toggle on schematic summary (automation FAIL)

**Steps:** Load production → Tab or click “D Gates schematic (full directory)” → press Enter or Space with summary focused.  
**Expected:** Panel expands/collapses like mouse click.  
**Observed in automation:** `open` stayed unchanged after Enter/Space in several attempts; mouse toggle reliable.  
**Action:** Human keyboard-only smoke before judging submission accessibility.

### F2 — SFO listing link live navigation (NOT RUN)

**Steps:** Expand schematic → activate “SFO listing for Brookstone”.  
**Expected:** Browser navigates to official flysfo.com listing.  
**Observed:** Href validated in DOM only; automated HTTP HEAD got 403.

## Devpost / GW-023 blockers (from `docs/devpost-submission.md` + this run)

| Blocker | Status |
| --- | --- |
| Update draft to **`665e5e8`** and GW-015 schematic | **Open** — draft still references `babaf96` and pre-schematic scope |
| **Live demo URL** in Devpost | **Ready to paste:** https://gate-wise-iota.vercel.app |
| **Demo video URL** | **Missing** — GW-023 not done |
| Promote `docs/README-draft.md` → root `README.md` with live URL | **Open** (GW-021) |
| Team names / contribution fields | **Human lead** |
| Reconcile “tests/build passed” claims | **Open** — cite lead CI on `665e5e8`; this report is production browser only |
| Vercel deployment SHA in submission | **Open** — confirm in Vercel UI |

## Commands run

- `git fetch origin` → **PASS**
- `git rev-parse origin/main` → `665e5e85a9b30b8114c678c7097a3b9ce5e805`
- Production browser regression → **executed** (Cursor browser MCP on gate-wise-iota.vercel.app)
- `curl -sI` sample SFO URL → **403** (not treated as product defect)

---

*End of GW-022 production regression report.*
