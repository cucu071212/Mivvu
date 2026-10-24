# GateWise

*Your airport. Your gate. Your time.*

GateWise helps travelers compare airport amenities against the time remaining until **boarding starts**. An airport map answers “Where is it?” GateWise adds “What would this visit require, including returning to the gate?”

[Live demo](https://gate-wise-iota.vercel.app) · [Source repository — private; judge access pending](https://github.com/cucu071212/GateWise)

> GW-021/023 README replacement for lead adoption, updated 2026-10-24 (Eastern Time). Root README is unchanged. Source reference: `origin/main` at `babaf96`; live smoke evidence: [consolidated QA](consolidated-qa-report.md). The production URL was reopened during finalization; exact deployed SHA is not verified. Links are relative to `docs/`; adjust them when adopting this as root README.

## MVP scope and status

The MVP covers **San Francisco International Airport, Terminal 2, D Gates**, with 12 approved post-security facility records: 6 food, 1 coffee and 5 shop entries. Gate landmarks help orientation; the production time model uses only coarse zone `D`. E/F are synthetic regression-test zones, not additional Terminal 2 coverage.

The inspected main source includes boarding-context validation, facility-name/category filtering, ranked recommendation cards, source details and a what-if comparison. The comparison evaluates baseline and hypothetical inputs through the same pure recommendation engine. The independent live audit exercised the main B+C smoke flow; full regression, mobile layout and accessibility remain pending.

| Evidence | Status for this draft |
| --- | --- |
| Dataset, shared contracts, utilities, engine, recommendation UI and what-if source | Inspected in `origin/main` at `babaf96` |
| Local teammate branch | `feat/data-utils`; older application snapshot, with documentation and independent tests |
| Vitest, TypeScript, lint and build | Not run in this environment; npm/npx unavailable |
| Live browser smoke | Search/AND filtering, demo toggle, What-if sequence, margin boundaries and representative invalid inputs exercised; see QA report |
| Public Vercel URL | [Live MVP](https://gate-wise-iota.vercel.app), reopened successfully 2026-10-24 |
| GW-015 schematic | Not visible on production at finalization check; no deployed schematic claim |
| Acceptance checklist and rehearsal script | Prepared; not completed QA or a timed rehearsal |

## How recommendations work

For an eligible facility, the model calculates:

```text
queue = max(0, known wait minutes + signed queue adjustment)
required minutes = outbound travel + return travel + queue + activity + buffer
margin minutes = minutes until boarding starts - required minutes
```

Outbound and return legs are looked up separately in a directed matrix. The production matrix currently uses a labeled **3-minute demo estimate per D→D leg**. Being in the same boarding area does not imply zero travel, and this approximation is not a measured walking route.

| Model outcome | Meaning |
| --- | --- |
| Feasible in model | Margin at least 10 minutes |
| Tight in model | Margin at least 0 and below 10 minutes |
| Over budget | Margin below 0 minutes |
| Unknown | An essential travel, queue or activity duration is unavailable; required total and margin remain null |
| Ineligible | Unsupported production zone or incompatible/unknown security-side access, with a reason |

The buffer is included once in required time. The additional status thresholds are model-display rules, not aviation safety standards. A recommendation does not guarantee catching a flight or boarding successfully.

## Data confidence

Names, Terminal 2 locations and post-security evidence come from official SFO sources documented in [data-provenance.md](data-provenance.md), checked on 2026-10-24. Each approved JSON record retains a source URL, checked date and location description. Some security evidence lives in companion directory/provenance references rather than the individual listing. A source-checked location does not verify live opening, queue length or route availability.

The production JSON preserves **null waiting and activity durations**, with unknown time confidence. Those records cannot support known time-budget outcomes by themselves. The inspected main source offers an opt-in demo mode that applies **8-minute queue and 10-minute activity assumptions** to in-memory copies, labeled `demo_estimate`; it does not modify `facilities.json`. The D→D travel assumption is also a demo estimate, even when a facility's location is officially sourced.

Three unresolved records are excluded from the initial dataset: the second Peet's D14/D15 location, Plant Café/Pinkberry D3/D4, and Books Inc./Compass Books. The supported Peet's record is near D7. The dataset does not claim individually verified restroom or charging-point coverage.

## What-if example

This sequence was exercised in the live browser audit with labeled demo assumptions; it is not a measured airport visit:

```text
3 outbound + 3 return + 8 queue + 10 activity + 10 buffer = 34 required minutes
50 until boarding starts -> +16 margin, feasible in model
35 until boarding starts ->  +1 margin, tight in model
35 until boarding starts and queue adjustment +7
  -> 41 required minutes, -6 margin, over budget
```

Baseline and hypothetical inputs run through the same function. The UI source includes before/after outcomes, margins and an explanation of changed countdown/queue assumptions. With demo visit estimates off, unknown visit times stay unknown in both runs; changing a queue delta cannot turn a missing queue estimate into a known value.

## Stack and architecture

- Next.js App Router and React, with TypeScript and Tailwind CSS.
- Local JSON facility records, shared TypeScript contracts and a separate directed travel matrix.
- Pure filtering, facility/context validation and recommendation utilities; Vitest test files.
- UI integration validates data/context before rendering recommendations, then uses the same engine for what-if comparisons.
- GitHub for source collaboration; the public MVP is hosted at the Vercel URL above.

The inspected manifest declares Next.js `16.4.3`, React `19.3.0`, Tailwind v4 and Vitest. These are repository declarations, not a claim that dependency installation succeeded in this environment.

## Local setup

The source repository is private (GitHub metadata checked 2026-10-24); cloning requires authorized GitHub access. The live demo is separate from source-code access. See the [source delivery checklist](submission-checklist.md#safe-source-code-delivery-recommendation) before sharing a code link with judges.

Use a reviewed integration checkout containing the application flow. This documentation branch has not merged the newer application commits. The inspected lockfile declares Node **>=20.9.0** for Next.js; use a compatible Node/npm installation.

The following is a documented setup workflow, **not executed successfully during this task**:

```bash
git clone https://github.com/cucu071212/GateWise.git
cd GateWise
npm ci
npm run dev
```

The configured development command is `next dev`; its default local address is [localhost:3000](http://localhost:3000), subject to available ports. No live server was started here. The committed lockfile supports a reproducible install workflow; it does not establish that packages or registry access will be available on another machine.

| Configured command | Purpose |
| --- | --- |
| `npm test` | Run Vitest suites under `src/lib` |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Check TypeScript without emitted application files |
| `npm run build` | Run `next build` |
| `npm run start` | Serve a successful production build with `next start` |

Run all checks in the configured lead environment before claiming release readiness. See [qa-checklist.md](qa-checklist.md) for acceptance cases and [demo-script.md](demo-script.md) for rehearsal guidance. Earlier source-branch observations in those documents must not be mistaken for current main-branch QA results.

## Deployment and verification

The [public MVP](https://gate-wise-iota.vercel.app) loads and its B+C smoke flow was exercised on 2026-10-24. This does not establish the exact deployed Git SHA or a complete release pass. The lead must record that SHA and recheck the reviewed build after any further deployment. No deployment was performed by this documentation task.

The optional GW-015 schematic is undergoing integration; it was not visible during the finalization check. Do not label it deployed until a fresh production check confirms its presence and disclaimers. It does not change recommendation calculations. Recording, mobile/accessibility and final automated checks remain tracked in [submission-checklist.md](submission-checklist.md).

## Limitations and future work

- One terminal and one coarse production zone; gate landmarks do not alter modeled walking times.
- Official location provenance is distinct from operating hours, live availability and measured route durations.
- Demo queue/activity assumptions are uniform examples, not personalized predictions; the source dataset keeps unknowns null.
- No live flight/boarding feed, real-time queues, boarding-pass scan or production indoor navigation is included in the claimed MVP.
- No AI model is required for the deterministic calculation. No AI inference service is claimed.
- Two-stop planning remains optional future work behind the project's P1 approval gates; it is not claimed as implemented.
- Mobile/accessibility acceptance, a recorded demo and the final deployed commit must still be confirmed.

Future work could include better verified within-terminal travel data, more precise uncertainty handling and carefully scoped additional facilities. Any wider coverage or two-stop planner needs new evidence and explicit scope approval.

Project requirements and ownership remain defined by [PLAN.md](../PLAN.md), [AGENTS.md](../AGENTS.md) and [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).
