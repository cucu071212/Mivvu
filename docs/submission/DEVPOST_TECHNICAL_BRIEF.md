# Devpost technical brief (source-grounded draft)

Copy into Devpost only after the human lead confirms event-specific fields.  
This file is **not** the teammate-owned presentation deck.

**Verified URLs**

- Production: https://gate-wise-iota.vercel.app
- GitHub: https://github.com/cucu071212/GateWise
- Release SHA: `c9c163cd7ee51d270e1a079daf84ffaf37b5952a`
- Production deploy: `dpl_AVbZEGA48z5evM1GRRssLPfAgQLF`

## Inspiration / problem

Airport maps answer *where*. They do not answer *whether there is time*. A traveler still has to guess the walk, the line, the stay, the return, and a buffer against boarding. GateWise exists to make that budget inspectable — and to leave it **Unknown** when the official record has no wait or activity time.

## What it does

GateWise is an SFO boarding-start time model:

1. Choose SFO on Welcome.
2. Set minutes until **boarding starts** on Flight.
3. Browse 26 sourced facilities on Explore, including published hours and Location Guidance.
4. Rank 12 Terminal 2 D Gates stops on Results using one shared engine.
5. Compare a What-if scenario with the same function; the baseline does not change.
6. Optionally plan two D Gates stops on My Plan (demo; travel opt-in required).

Outcomes: **feasible in model**, **tight**, **over budget**, or **unknown**. “Feasible” is not a boarding guarantee.

## How we built it

Next.js App Router, React, TypeScript, and Tailwind CSS. Facility facts live in local JSON. Walking assumptions live in a directed zone matrix. Recommendation math is a pure TypeScript function (`recommendFacilities`) used by both Results and What-if. Two-stop evaluation is a separate pure module with a strict-versus-demo travel policy. Vitest encodes independently calculated expectations. Playwright covers welcome, explore, modal focus, two-stop opt-in, and What-if.

No live airport APIs. No invented indoor coordinates.

## Technical architecture

```text
Welcome → session airport = SFO
Flight  → minutesUntilBoarding, buffer, optional demo durations, optional countdown
Explore → 26 listings + facility dialog + GW-B Location Guidance
Results → recommendFacilities(context, facilities, travelTimes)
What-if → same function, documented input deltas only
My Plan → evaluateTwoStopPairLegacy (demo policy)
```

Required minutes = directed outbound + directed return + queue + activity + safety buffer.  
Margin = minutes until boarding starts − required.  
Thresholds: ≥10 feasible, 0–9 tight, <0 over budget. Missing essentials stay null.

## Challenges we ran into

Separating a sourced *location claim* from an unsourced *duration* was the core design problem. Official listings disagree on nearby gates and do not publish live queues. The team kept nullable times, labeled demo estimates, and explicit ineligible/unknown states instead of filling zeros.

A second challenge was keeping every comparison on one engine so What-if could not drift from Results. A third was Location Guidance: browse-only listings such as Vino Volo must stay Unknown and must not inherit a “current Retail Street” marker from leftover directory text.

Keyboard focus in the native `<dialog>` was a fourth: Chromium can move Tab onto the dialog or `<body>` after the last control. The fix keeps `showModal()` and wraps only the Tab boundary.

## Accomplishments

- Shipped a public SFO demo with 26/12 honest scope.
- Shared recommendation + What-if contract with 945 unit tests and 23 E2E tests on the release SHA.
- Demo two-stop planner that treats T=0 as Over Budget (−55) instead of Unknown.
- GW-B Location Guidance that hides conceptual map chips when evidence is Unknown.
- Image rights audit that refuses to hotlink unlicensed SFO listing photos.

## What we learned

Official directory text is not a walking graph. A useful travel tool has to say **Unknown** more often than it feels comfortable. Labels (official / demo / user-supplied) matter as much as the number.

## What’s next

`[NOT IN THIS RELEASE]` Verified indoor walking data (G-Data HOLD), more airports, and live operations require new authorization. Do not present them as built.

## Technologies used

Next.js, React, TypeScript, Tailwind CSS, local JSON/TypeScript data, Vitest, Playwright, GitHub, Vercel.

Do **not** list AI ranking, live flight APIs, or indoor GPS.

## Devpost fields that must stay unmarked

| Field | State |
| --- | --- |
| Official event / track / prize category | `[VERIFY WITH HUMAN LEAD]` |
| Team legal names and role split for the form | `[VERIFY WITH HUMAN LEAD]` |
| Demo video URL | `[VERIFY WITH HUMAN LEAD]` — record against `c9c163c` / production alias |
| Award eligibility checkboxes | `[VERIFY WITH HUMAN LEAD]` |
| License | None published in-repo |

## Built-with / try-it links (ready)

- Try it: https://gate-wise-iota.vercel.app
- GitHub: https://github.com/cucu071212/GateWise
