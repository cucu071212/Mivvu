# GW-ICN-018 verification matrix — KO/EN × viewport

**Commit under test:** `4404473bdb1af8758cd3ab3e38b74c8bebaa6863`  
**Server:** `npm run build` → `npm run start --hostname 127.0.0.1 --port 3100`

## Browser evidence sources (honest attribution)

| Source | Role | Use in this matrix |
| --- | --- | --- |
| Antigravity `browser-audit.json` + `saved-origin-and-category-probe.json` | Independent hydrated **6× viewport × locale** audit | **Primary** for rows 1–5 (category sheet, save origin, URL return) |
| Playwright mobile ICN (**15/15** after hygiene) | Automated regression on search, detail, adopt, URL return | Rows 1–2, 5–6 |
| Vitest GW-ICN-017 + Situation + saved slices | Policy and URL semantics | Row 3–5 |
| Cursor `browser-matrix/results.json` (original) | Ad-hoc script output | **Not used as PASS** — all six `"pass": false` due to script bugs (see checkpoint); file **not modified** |
| SFO desktop Playwright **10/10** (initial campaign) | SFO regression | Row 7 — product code unchanged |

## Matrix (360 / 390 / 430 × KO / EN)

| # | Requirement | 360 KO | 360 EN | 390 KO | 390 EN | 430 KO | 430 EN | Method |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Airport → ICN browse → search → terminal + Type/Subtype filters → facility detail | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | Antigravity browser audit; Playwright search + adopt browse-return |
| 2 | Detail: snapshot provenance; honest hours/metadata; goods/services exact adopt only | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | Playwright adopt (**15/15**); EN `243` expand/collapse after locator fix |
| 3 | Situation policy (known/unknown; no forbidden assertions in listing bullets) | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | Vitest `icn-facility-situation.test.ts`; Antigravity DOM + unit scope |
| 4 | Save → saved list → reopen detail; reload; KO/EN identity; saved return origin | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | Antigravity `saved-origin-and-category-probe.json`; vitest saved slice |
| 5 | Shareable `/icn` state; Back/Forward; bare `/icn`; detail return syncs `q` / filters | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | Vitest URL slice; Playwright detail return URLs; Antigravity URL return **6/6** |
| 6 | Keyboard/focus/labels; no horizontal overflow | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | Playwright search spec; Antigravity overflow checks |
| 7 | SFO entry + demo; ICN ≠ SFO walk matrix | **PASS** | N/A | **PASS** | N/A | **PASS** | N/A | Playwright SFO specs (prior log, reused) |

## Representative fixture rows

| Row | sourceId | Check |
| --- | --- | --- |
| `% 아라비카` / ARABICA | 3289 | Detail, adopt goods, Situation, save |
| EN E-origin long goods | 243 | Show more/less toggle (**product PASS**; Playwright fixed) |
| `동측장기주차타워` | 2821 | Missing-hours honesty (initial matrix probe) |
| `We All Dream…` | 2021 | Situation (initial probe) |
| Hidden goods | 3395, 2063 | Playwright adopt |

## Automated summary (post–test-hygiene rerun)

| Suite | Result |
| --- | --- |
| Full vitest (`--pool=forks --maxWorkers=2 --testTimeout=60000`) | **FAILED — 1294 pass, 1 fail, 6 skip** |
| Sole failure | `icn-shipped-output.test.ts` (inherited hash) |
| ICN mobile Playwright (3 files) | **15/15 PASS** |
| SFO desktop Playwright | **10/10 PASS** (initial campaign; unchanged product) |
| Focused vitest (core journey, initial) | **107/107 PASS** (unchanged by hygiene) |

## Evidence paths

- Antigravity: `/private/tmp/GW-ICN-018-antigravity-review/`
- Cursor logs: `/private/tmp/gw-icn-018-verification/*rerun2*.log`
- Original flawed matrix JSON: `/private/tmp/gw-icn-018-verification/browser-matrix/results.json` (**preserved**)
- Playwright rerun PNGs under `docs/handoffs/GW-ICN-*` — **local only, not in publication commit** (excluded from staged scope; paths referenced for traceability only)
