# Feature verification matrix

Release: `c9c163cd7ee51d270e1a079daf84ffaf37b5952a`  
Production: https://gate-wise-iota.vercel.app (`dpl_AVbZEGA48z5evM1GRRssLPfAgQLF`)  
Checked: 2026-10-25 closeout (fresh `npm test` / `tsc` / lint / build / `test:e2e:run` + live alias).

| Feature | Expected | Automated | Live production | Notes |
| --- | --- | --- | --- | --- |
| Airport Welcome + SFO | SFO selectable; JFK/LAX/ORD coming soon cannot continue | E2E airport-selection | PASS | |
| Flight dashboard | Minutes, buffer 10, demo off by default, countdown optional | E2E workflows + countdown | PASS | Demo disclaimer when enabled |
| Explore 26 facilities | 26 detail buttons / cards | E2E + JSON count | PASS | 26 rows in `facilities.json` |
| Facility details + source links | Official SFO listing present | E2E facility-detail | PASS | flysfo 16th / Vino / Bun Mee HTTP 200 |
| Results / 12 eligible | Only manifest IDs modeled | E2E: 12 feasible (demo) / 14 ineligible | PASS | `legacy-d-v1` |
| What-if | Same engine; baseline unchanged | E2E: 50→35 = +1 tight; +7 queue = −6 over; baseline +16 | PASS live | Burger Joint |
| Two-stop strict | Unknown until travel opt-in | E2E two-stop-planner | PASS | |
| Two-stop demo | Explicit travel checkbox | E2E + live | PASS | 70 min → 55 required, **+15 feasible** |
| E04 T=0 | Over budget, −55 | Prior live + engine tests | PASS (same deploy) | Burger Joint ↔ Peet’s Coffee |
| Location Guidance 16th | Verified area, near D16 | E2E + live | PASS | Conceptual guide shown |
| Location Guidance Vino Volo | Unknown; no current Retail Street chip | E2E + live | PASS | Where listing may still say Retail Street |
| Location Guidance Bun Mee | Unknown | E2E + live | PASS | HM1 B; T2-only scope note |
| Modal Tab / Shift+Tab | Stays on visible dialog controls | E2E 12-step cycle | PASS | `tabIndex={-1}` + boundary wrap |
| Escape / focus restore | Closes; restores trigger | E2E | PASS | |
| Mobile 390 | Nav + planner usable, no horizontal overflow | E2E mobile + live overflow check | PASS | overflow=false at 390 |
| No measured-walk claim | Copy forbids official walking measurements | E2E + copy review | PASS | |
| P1/P2 GW-B fixes | Present on SHA | Source + tests | PASS | |
| GW-E2 T=0 engine | `min: 0` boarding window | `plan-two-stop-legacy.ts` | PASS | Ancestor `091805b` |

## Console / assets

Live production pages loaded as GateWise (no auth wall). Horizontal overflow was not observed at 1280 or 390 on My Plan. A dedicated browser console-log harvest was not captured in this pass — treat as **not instrumented**, not as “no errors exist.” Failed static assets were not observed in the flows above.

## Do not mark as verified

| Item | Why |
| --- | --- |
| Vercel `githubCommitSha` | Inspect JSON has no git meta |
| GitHub PR list / PR #1 | `gh` not installed; public API 404 (repo likely private) |
| Award tracks / team names | Human-owned |
| Presentation slides | Owned by another teammate |
