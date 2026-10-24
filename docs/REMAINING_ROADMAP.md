# GateWise — Remaining work roadmap

Last updated: 2026-10-24 (integration consolidation).  
**Not authorization to implement optional features.**

## Completed work and Git integration status

| Task | Description | Git status |
| --- | --- | --- |
| GW-012–014 | Recommendation engine, browse UI, ranked cards | **On `origin/main`** (`babaf96` and ancestors) |
| GW-017 | What-if simulator | **On `origin/main`** @ `babaf968269a7ecb1a7dc1efb153915ee3c1502c` |
| GW-020 | Production deploy + smoke | **Live** at https://gate-wise-iota.vercel.app (MVP without schematic); deployment **git SHA unverified** from CI/agent (lead confirms in Vercel UI) |
| GW-015 | `TerminalSchematic.tsx` | **On `origin/feature/terminal-map`** @ `fbcdf109` — **cherry-picked into `feature/integration-gw015`** (not on `main`) |
| GW-021 | README + Devpost drafts | **On `origin/feat/data-utils`** — docs cherry-picked into integration branch (`docs/README-draft.md`, `docs/devpost-submission.md`) |
| GW-022 prep | Release QA prep doc | **On `origin/feat/data-utils`** — `docs/release-qa-prep.md` on integration branch |
| GW-015 QA | Integration review | **On `origin/feat/data-utils`** — `docs/gw015-review.md` on integration branch |

**Integration branch:** `feature/integration-gw015` (from `origin/main` + selective files only; no wholesale branch merges).

## Stable deployment

- **Production URL (current public MVP):** https://gate-wise-iota.vercel.app  
- **Expected `main` SHA:** `babaf968269a7ecb1a7dc1efb153915ee3c1502c`  
- **Deployment metadata:** Hosting commit not independently verified in agent environment; treat as **unverified** until Vercel → Production → Source matches `babaf96` or newer approved `main`.

## Issues found during GW-015 integration

1. **Schematic vs recommendations scope** — Schematic always shows all 12 source-backed rows; filters affect cards only. Mitigated with collapsible section copy and GW-015 QA notes in UI.
2. **Demo mode badge mismatch** — Schematic keeps dataset `timeConfidence`; recommendations use demo overlay when toggled. Mitigated with explicit note when demo is on.
3. **Invalid dataset split behavior** — Main blocks recommendations; schematic may show partial valid rows + alert (by design). Mitigated with alert when `datasetErrors.length > 0`.
4. **Page length** — Collapsible schematic defaults closed to reduce scroll/keyboard burden.
5. **ESLint noise** — Local `.vercel/` build artifacts can pollute `npm run lint` if present; `.gitignore` includes `.vercel` on integration branch.

No new airport facts or `facilities.json` changes in integration.

## Mandatory submission track (GW-021 / GW-022 / GW-023)

| ID | Owner | Priority | Deliverable | Minimum acceptance |
| --- | --- | --- | --- | --- |
| **GW-021** | Lead + Teammate | P0 | Promote `docs/README-draft.md` → `README.md`; finalize `docs/devpost-submission.md` on Devpost | Accurate stack, limitations, setup, live URL, no overclaims |
| **GW-022** | Teammate execute / Lead fix | P0 | Full regression per `docs/release-qa-prep.md` + `docs/qa-checklist.md` | `npm test`, `tsc`, `lint`, `build` green; deployed smoke on **post-merge** URL |
| **GW-023** | Teammate + Lead | P0 (**G6**) | Demo recording ≤5 min; Devpost initial submit **Sun 12:00 ET** | Hero path: context → demo → recommendations → what-if; schematic optional in recording |

**Dependencies:** GW-022 after lead **merges** integration (or `main` at approved SHA) and **re-deploys**; GW-023 after GW-022 sign-off.

## Optional GW-E (two-stop planner)

**Approval gate:** Human Engineering Lead **G-E** only — see `docs/IMPLEMENTATION_PLAN.md` optional P1 section.

**Prerequisites (all required):**

1. B+C deployed and verified (**G4** / GW-020).  
2. `npm test` recommendation + utility suites green.  
3. GW-019 hero acceptance on deployed URL.  
4. Sunday submission (**GW-022 / GW-023 / G6**) not at risk.

**If started:** extend `recommend.ts` (lead); teammate tests; no auth/DB/live flights.

## Suggested priority order (next actions)

1. **Review** `feature/integration-gw015` PR — schematic + docs only.  
2. **Merge to `main`** when lead authorizes (not done in consolidation task).  
3. **Deploy** integration build to Vercel; re-run production smoke including schematic expand/collapse.  
4. **GW-021** — README + Devpost copy with confirmed production URL and SHA.  
5. **GW-022** — full regression checklist (R01–R10+ in `release-qa-prep.md`).  
6. **GW-023** — record demo and submit Devpost before **G6**.  
7. **GW-E** — only if lead explicitly approves and submission path is safe.

## Rollback strategy

1. **Git:** `git revert` the integration merge commit on `main`, or reset deployment to previous Vercel production deployment (Vercel dashboard → Promote prior deployment).  
2. **Feature-only:** Remove `TerminalSchematic` import and `<details>` block from `GateWiseHome.tsx`; redeploy — core B+C unchanged.  
3. **Docs-only:** Revert doc commits without touching `src/`.  
4. **Emergency Sunday:** Drop GW-E first; if schematic blocks submission, ship `main` @ `babaf96` without GW-015 and document schematic as post-hackathon.

## Minimum acceptance tests (post-merge deploy)

- 12 facilities, official links, SFO T2 D Gates scope.  
- Demo OFF unknown / ON calculated (34 min required, margins at 50/43/33).  
- What-if baseline fixed; scenario changes outcomes.  
- Search/category filters; invalid context errors.  
- Schematic: expand/collapse, 12 entries, filter-independent, disclaimers visible.  
- Mobile ~375px, keyboard focus on summary/links, no reproducible hydration errors on production `next start` / Vercel.
