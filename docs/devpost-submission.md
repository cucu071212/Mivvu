# GateWise — Devpost submission copy

Finalized 2026-10-24 (Eastern Time), GW-021/023. Submission copy prepared for the Engineering Lead; **not submitted**. Live MVP: [gate-wise-iota.vercel.app](https://gate-wise-iota.vercel.app). Core browser smoke evidence is recorded in [consolidated QA](consolidated-qa-report.md); the URL was reopened successfully during finalization. Final deployed SHA, full automated regression and mobile/accessibility sign-off remain unverified. Use the narrative sections below for Devpost; the handoff section is an internal checklist, not judge-facing copy.

## Project name

GateWise

## Tagline

Your airport. Your gate. Your time.

## Elevator pitch

GateWise compares airport amenities with the time remaining until boarding starts. Its SFO Terminal 2 D Gates MVP separates sourced location facts from demo timing assumptions and makes the reasons behind each modeled outcome visible.

## Inspiration: the passenger problem

Knowing where an airport café is does not tell a traveler whether a visit fits before boarding. A useful decision must account for getting there, waiting, spending time at the facility, returning to the gate and leaving a buffer. GateWise focuses on making that budget understandable rather than hiding it behind a single reassuring label.

## What it does

GateWise supports a boarding-start time input, safety buffer, facility-name/category filters, ranked recommendation cards and a what-if comparison. The MVP is deliberately limited to SFO Terminal 2, D Gates, with twelve approved official-source facility records.

Each outcome exposes a numeric breakdown when essential durations are known: feasible in the model, tight, or over budget. Missing durations remain unknown, and incompatible or unverified security-side access is explained as ineligible. “Feasible” describes assumptions inside the model; it does not promise boarding success.

The what-if flow compares a baseline with changed remaining time or a signed queue adjustment using the same recommendation function. It shows outcomes and margins alongside an explanation of changed inputs.

## How we built it

GateWise uses Next.js App Router, React, TypeScript and Tailwind CSS. Local JSON facility data, a directed zone-time matrix and user context are kept separate. Pure TypeScript utilities validate inputs and data, filter the list and calculate recommendations. Vitest test files cover independent arithmetic, boundaries and missing-data behavior. GitHub supports the shared implementation workflow.

The calculation is transparent:

```text
required = outbound + return + max(0, known queue + adjustment) + activity + buffer
margin = minutes until boarding starts - required
```

Margins of at least 10 are feasible in the model; margins at least 0 and below 10 are tight; negative margins are over budget. Missing essential times yield unknown totals and margins. Directed outbound and return legs are evaluated separately. The production zone is D only; D/E/F fixtures exist exclusively for synthetic regression testing.

## Data provenance and honest uncertainty

The twelve-record dataset contains names, location descriptions, official SFO source URLs, checked dates and confidence labels. Companion provenance documents post-security evidence. The research date is 2026-10-24; it is not a guarantee of current service availability.

The source JSON has null queue and activity durations. An opt-in mode applies labeled demo estimates to in-memory copies: eight minutes for queue and ten for activity. The D→D travel model uses an unverified three-minute estimate per leg. These values are demonstrations, not airport measurements or live predictions.

The initial dataset excludes three unresolved location/identity cases rather than presenting uncertainty as fact. [Data provenance and exclusions](data-provenance.md) are available for review.

## Demonstration example

The live browser audit exercised this sequence using synthetic timing assumptions, not a measured real-world visit:

- Three minutes outbound, three returning, eight in queue, ten for the activity and a ten-minute buffer total **34 minutes**.
- With 50 minutes until boarding starts, the margin is **+16: feasible in the model**.
- Change remaining time to 35 minutes: **+1: tight**.
- Also increase the queue assumption by seven minutes: 41 required, **-6: over budget**.

The same engine explains each change. With visit estimates off, the real dataset's missing durations stay unknown instead of being silently replaced with zero.

## Engineering challenges and takeaways

The central challenge was separating a trustworthy location claim from an uncertain duration. Official sources can disagree about a nearby gate or business name, while even a valid listing does not provide a current queue. The project addresses this with documented exclusions, nullable durations and explicit source/estimate labels.

A second challenge was keeping the calculator and what-if comparison consistent. Shared contracts, one pure recommendation engine and independently calculated expected outputs make the assumptions inspectable. The model can be checked against independently calculated expected results, including boundary margins and missing-data cases.

## Limitations

The MVP covers one terminal and one coarse boarding zone. Gate landmarks are orientation aids, not measured routing inputs. Queue, activity and walking estimates are demonstrations; source-checked locations do not establish current opening or availability. The claimed scope includes no live flight integration, real-time queue service, AI model or production indoor navigation. No two-stop planner is claimed. GateWise never guarantees catching a flight.

## What's next

Priorities are final regression/mobile/accessibility checks and a recorded walkthrough on the final reviewed deployment. After that, better evidenced within-terminal travel data and clearer uncertainty could improve the model. Additional coverage and optional two-stop planning would require separate approval and supporting data.

## Built with

Next.js, React, TypeScript, Tailwind CSS, local JSON, Vitest, GitHub, Vercel.

The public MVP is hosted at the Vercel URL above. No live-data or AI service is listed as a dependency.

## Internal submission handoff — do not paste as project narrative

| Field | Value / evidence state |
| --- | --- |
| Source repository | [cucu071212/GateWise](https://github.com/cucu071212/GateWise) |
| Inspected implementation snapshot | `origin/main` at `babaf96`; exact deployed SHA still needs lead confirmation |
| Live demo URL | [Production MVP](https://gate-wise-iota.vercel.app), reopened 2026-10-24 |
| Demo video URL | Not supplied or verified; no recording claim |
| Final tests, TypeScript and build result | Required from the configured lead environment; npm/npx unavailable here |
| Browser evidence | B+C smoke, margin boundaries, representative validation and data-confidence behavior passed in the independent audit; not full regression |
| Mobile/accessibility | Still pending against the final build |
| GW-015 schematic | Integration branch exists; not visible on production at finalization check. Do not describe as deployed until confirmed |
| Team names, contributions and applicable event disclosure fields | Human lead supplies and confirms |
| Submission completion | Not submitted by this task |

Before publishing, complete [submission-checklist.md](submission-checklist.md), record [demo-script.md](demo-script.md), and reconcile copy with the final deployed commit. Keep any schematic claim gated on a fresh production check. No GW-E implementation is claimed. The lead owns final submission and deployment decisions.
