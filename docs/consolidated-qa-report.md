# Independent QA and submission readiness audit

2026-10-24, approximately 16:15 ET. Role: QA and Submission Lead. **B+C smoke flow passed for the cases below; submission readiness remains conditional.** No application change, merge, deployment or GW-E work was performed.

## Scope and evidence

- Fetched current refs. Source reviewed: `origin/main` = `babaf968269a7ecb1a7dc1efb153915ee3c1502c`; optional map = `origin/feature/terminal-map` at `fbcdf109b6a159f2302f4adc0dfa0c6e806d5979`.
- Tested [production GateWise](https://gate-wise-iota.vercel.app/) directly in the Codex in-app browser using native input actions, accessibility-tree observations and a visual screenshot. This was an existing browser viewport, **not device emulation**. Exact deployed Git SHA was not exposed/verified; matching observed behavior does not prove deployment equals main.
- Reviewed main README, recommendation source/interfaces, and local [QA checklist](qa-checklist.md), [release preparation](release-qa-prep.md), [demo script](demo-script.md), [Devpost draft](devpost-submission.md), [README draft](README-draft.md) and prior [schematic review](gw015-review.md). Documentation drafts on this branch are not all integrated into main.
- `command -v npm` returned exit 1. npm/Vitest, lint, TypeScript and build **NOT RUN**. No screen-reader, mobile/device, zoom, contrast audit, network/console audit or timed spoken rehearsal was performed. No broad release certification is implied.

## Live checks actually executed

| Check / inputs | Observed result |
| --- | --- |
| Fresh load: boarding 50, buffer 10, demo off | 12 places; all approved names visible in alphabetical tie order. Terminal 2 D Gates, boarding-start wording, source dates/links and post-security labels present. Visit times and totals/margins unmodeled; no fabricated feasibility. |
| Search `nApA` | One result: Napa Farms Market. |
| Keep `nApA`, select Coffee | Zero places; explicit no-match messages in recommendations and What-if. Confirms AND filtering for this case. |
| Change search to `pEeT`, keep Coffee | One result: Peet's Coffee near D7. |
| Enable demo estimates; baseline 50/buffer 10 | Peet's: outbound 3 + return 3 + queue 8 + activity 10 + buffer 10 = 34 required; margin +16, feasible in model. Official-source and demo-estimate badges shown together with distinct meaning explained by the demo toggle/banner. |
| Scenario 35, queue delta 0; then +7 | Margin +1/tight, then −6/over budget. Baseline stays 50/+16. Explanation identifies both changed inputs and before/after margins. |
| Scenario 33/34/43/44, delta 0 | Margins −1/0/+9/+10 respectively; over budget/tight/tight/feasible. All four threshold cases passed. |
| Scenario 50, delta −99 | Margin +24, feasible: consistent with known queue clamped to zero (26 required). This checks the rendered margin, not a separately displayed scenario breakdown. |
| Disable demo estimates with delta −99 retained | Both runs return unknown; queue/activity, total and margin stay unmodeled. A negative delta does not turn missing queue data into zero. |
| Main boarding blank, then −1, 8.5, `Infinity` | Validation error remains; recommendations suppressed, filters disabled and What-if hidden. Restoring 50 restores results. |
| Scenario queue `0.5` | Error explains finite integer requirement; comparison removed, main recommendation remains. Restoring 7 restores the comparison. |
| Visual comparison inspection | Baseline/scenario columns, text statuses, margins, caveats and an input focus outline were visible. This is a spot inspection, not keyboard/accessibility certification. |

Local screenshot evidence: `/private/tmp/gatewise-qa-comparison.png` (temporary audit artifact, not a committed submission asset). No source links were followed and no official airport pages were revalidated in this audit.

## Official facts versus model assumptions

The exercised UI clearly separates sourced facility identity/location/security labels from the opt-in simulated 8-minute queue, 10-minute activity and 3-minute directed walk legs. Demo mode defaults off; missing visit times remain unknown. The location/source checked date does **not** establish live opening, availability or a measured route. No live-flight, AI inference, real-time queue, two-stop-planner or boarding-success claim was observed in the exercised flow.

All production entries share zone D and uniform demo timing costs. Alphabetical ties are expected; this smoke run does **not** prove mixed-status ranking, asymmetric routes, missing-route behavior or security-ineligible rendering. Those require isolated fixtures and executed automated tests. Prior integration-test coverage gaps recorded in release preparation remain open; no new test pass is claimed.

## Prioritized readiness findings

| Priority | Finding / required action |
| --- | --- |
| P1 — release sign-off gap | Confirm the deployed commit and obtain actual test/lint/type/build results for the final consolidated revision. Repeat targeted smoke checks after any GW-015 integration. No exercised B+C functional blocker was found, but this is incomplete regression evidence. |
| P1 — judge-facing documentation | Main README still calls the home page a placeholder, says utility tests have not arrived and describes deployment as planned. Demo-script introduction/fallback still describes absent integration; README/Devpost drafts still say no verified URL. These are historical caveats, not current production descriptions. Lead should reconcile them and add the checked production link without upgrading unexecuted mobile/build claims. Root README's Node “20+” is less precise than the draft's locked Next.js >=20.9.0 requirement; verify setup on a clean environment. |
| P1 — submission assets/status | No demo video URL or completed recording was supplied; no timed 2–3 minute rehearsal is documented. Team names/contributions, applicable event disclosure fields, actual submission confirmation and official event deadline/rules are NOT CHECKED. Confirm required media/fields against the event before treating any absence as an event-specific mandatory blocker. |
| P1 — remaining acceptance evidence | Mobile widths/zoom, keyboard traversal, screen-reader announcements, contrast, source-link destinations and deployment console/network health remain unexecuted. Security exclusions/missing routes/mixed ranking are not reachable with the current uniform approved dataset; run isolated fixtures rather than inventing airport facts. |
| P2 — optional polish | Empty Restroom/Charging categories are honest but could distract judges. Repeated 12-card/12-comparison content creates a long page; use the Coffee filter in the demo. A visible provenance link and more explicit per-field confidence wording could make source-versus-time distinctions easier to find. No app change is requested by this audit. |

## Demo and submission copy handoff

The current script's **34-minute D-only arithmetic and +16 → +1 → −6 sequence are technically correct and now exercised live**. Its 2:30 schedule is a proposed timeline, not a measured rehearsal. Keep main boarding at 50/buffer 10, filter Coffee/Peet's, show unknown first, enable estimates, then edit scenario 35/0 and 35/+7. End with model uncertainty and no boarding guarantee. Explain security-ineligible behavior verbally; the approved dataset does not provide a live ineligible example. Do not present synthetic E/F or the 42-minute illustrative test as a Terminal 2 route.

Before submission, lead should remove obsolete preview-only narration, record/rehearse this flow, adopt the reviewed README draft with corrected root-relative links, and update Devpost's live URL/evidence state. Devpost's core algorithm, data boundaries and excluded-feature claims match the reviewed source and exercised flow. Claims that independent tests exist are supported by source; claims that the full suite passed remain unsupported here. Do not list optional schematic as integrated or a recorded video as complete until verified. No final copy or submission was edited by this audit.

Missing/unconfirmed assets: final public README with live link; demo video and verified URL; judge-readable screenshots/project imagery (main's public assets are scaffold SVGs, not submission screenshots); team/contribution/disclosure information; final QA evidence and deployed SHA; event-specific completion/deadline confirmation. Some may exist outside the inspected repository; that state is unknown.

## Optional terminal schematic integration

The fetched map branch still adds only a standalone component; it is not mounted in main and no schematic appeared in the live audit. Prior static review found all 12 source-backed groupings, explicit non-geographic positioning/no-route disclaimers and no recommendation/What-if calculation dependency. Keep integration read-only.

After integration, check full-directory versus filtered-results labeling, persistent unknown timing badges while demo modeling is on, partial-data alerts versus main's fail-closed recommendation policy, and the hardcoded Post-security/Retail Street assumptions if data changes. Verify mobile layout, keyboard source links and source/confidence labels. Re-run the four margins and the baseline/scenario sequence above; schematic ordering or spacing must never become travel inputs. Integration remains a lead decision, not a prerequisite for the already exercised B+C flow.

**Disposition:** Conditional submission readiness. Resolve P1 evidence/content gaps and confirm required submission assets; preserve the working B+C scope. Only this report is committed on `feat/data-utils`.
