# GateWise — Devpost submission draft

Prepared 2026-10-24 (Eastern Time), GW-021. **Editorial draft for lead review; not submitted.** Code descriptions are supported by inspected `origin/main` commit `babaf96`. Browser behavior, test/build success and deployment were not verified in this task. Remove editorial notes and fill verified submission links before publishing; do not turn planned work into completed claims.

## Project name

GateWise

## Tagline

Your airport. Your gate. Your time.

## Elevator pitch

GateWise compares airport amenities with the time remaining until boarding starts. Its SFO Terminal 2 D Gates MVP separates sourced location facts from demo timing assumptions and makes the reasons behind each modeled outcome visible.

## Inspiration: the passenger problem

Knowing where an airport café is does not tell a traveler whether a visit fits before boarding. A useful decision must account for getting there, waiting, spending time at the facility, returning to the gate and leaving a buffer. GateWise focuses on making that budget understandable rather than hiding it behind a single reassuring label.

## What it does

The inspected implementation supports a boarding-start time input, safety buffer, facility-name/category filters, ranked recommendation cards and a what-if comparison. The MVP is deliberately limited to SFO Terminal 2, D Gates, with twelve approved official-source facility records.

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

The source JSON has null queue and activity durations. An opt-in mode in the inspected implementation applies labeled demo estimates to in-memory copies: eight minutes for queue and ten for activity. The D→D travel model uses an unverified three-minute estimate per leg. These values are demonstrations, not airport measurements or live predictions.

The initial dataset excludes three unresolved location/identity cases rather than presenting uncertainty as fact. [Data provenance and exclusions](data-provenance.md) are available for review.

## Demonstration example

This is simulated arithmetic, not a verified real-world visit or a claim that a demo recording has been completed:

- Three minutes outbound, three returning, eight in queue, ten for the activity and a ten-minute buffer total **34 minutes**.
- With 50 minutes until boarding starts, the margin is **+16: feasible in the model**.
- Change remaining time to 35 minutes: **+1: tight**.
- Also increase the queue assumption by seven minutes: 41 required, **-6: over budget**.

The same engine explains each change. With visit estimates off, the real dataset's missing durations stay unknown instead of being silently replaced with zero.

## Engineering challenges and takeaways

The central challenge was separating a trustworthy location claim from an uncertain duration. Official sources can disagree about a nearby gate or business name, while even a valid listing does not provide a current queue. The project addresses this with documented exclusions, nullable durations and explicit source/estimate labels.

A second challenge was keeping the calculator and what-if comparison consistent. Shared contracts, one pure recommendation engine and independently calculated expected outputs make the assumptions inspectable. The tests are implementation artifacts; this draft does not claim that a full test suite or deployed acceptance run passed in this environment.

## Limitations

The MVP covers one terminal and one coarse boarding zone. Gate landmarks are orientation aids, not measured routing inputs. Queue, activity and walking estimates are demonstrations; source-checked locations do not establish current opening or availability. The claimed scope includes no live flight integration, real-time queue service, AI model or production indoor navigation. No two-stop planner is claimed. GateWise never guarantees catching a flight.

## What's next

Priorities are final regression/mobile/accessibility checks, a verified live build and a recorded walkthrough. After that, better evidenced within-terminal travel data and clearer uncertainty could improve the model. Additional coverage and optional two-stop planning would require separate approval and supporting data.

## Built with

Next.js, React, TypeScript, Tailwind CSS, local JSON, Vitest, GitHub.

Vercel is the intended hosting target; it is omitted from completed deployment claims until the lead verifies a project and URL. No live-data or AI service is listed as a dependency.

## Submission fields and evidence still needed

| Field | Value / evidence state |
| --- | --- |
| Source repository | [cucu071212/GateWise](https://github.com/cucu071212/GateWise) |
| Inspected implementation snapshot | `origin/main` at `babaf96`; source review only |
| Live demo URL | Not verified; lead must supply the actual deployed URL |
| Demo video URL | Not supplied or verified; no recording claim |
| Final tests, TypeScript and build result | Required from the configured lead environment; npm/npx unavailable here |
| Mobile, accessibility and deployed smoke evidence | Not executed during this task; record results against the final build |
| Team names, contributions and applicable event disclosure fields | Human lead supplies and confirms |
| Submission completion | Not submitted by this task |

Before publishing, reconcile this copy with the final reviewed commit and actual verified behavior. Follow [qa-checklist.md](qa-checklist.md) and rehearse [demo-script.md](demo-script.md); their source-snapshot caveats remain relevant. The lead owns final submission and deployment decisions.
