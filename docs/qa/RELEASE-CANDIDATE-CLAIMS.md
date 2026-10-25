# GateWise — release candidate claims (editorial)

Use only after verifying the **exact deployed preview/production SHA** and URL.

**Release candidate branch:** `release/rc-gw-e2-ux-polish` (see latest commit on that branch).

## Safe to say

1. **Coverage:** GateWise browses **26** sourced SFO facilities; **12** Terminal 2 D Gates listings receive time-based recommendations. Other terminals are browse-only in the current model.
2. **Timing:** Directed D→D legs use an **unverified 3-minute demo estimate** each way. Queue and activity are **Unknown** by default; opt-in demo mode uses **8** and **10** minutes (labeled). Users may enter personal estimates on Results.
3. **Two-stop (My Plan):** **Demo only** — compares two eligible D Gates stops with **strict** travel (inter-facility Unknown) unless the user opts in to **illustrative D-Gates travel**. Requires separate Flight demo toggle for queue/activity to show complete demo numbers. **Not** measured walks or a boarding guarantee.
4. **Photos / hours:** Most food/shop images are **illustrative**; published hours are informational, not live availability.
5. **What-if:** Compares baseline vs scenario using the same `recommendFacilities` engine; browse-only rows are collapsed by default.

## Do not say

- Measured airport walking times, indoor routing, live queues, or flight tracking.
- Multi-airport product support (only SFO is selectable).
- That two-stop planning is validated for real-world safety without the demo disclaimers.

## Verification checklist (lead)

- [ ] Record deployed URL and git SHA
- [ ] `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run test:e2e:run`
- [ ] Manual: airport welcome → Flight → Explore → Results → What-if → My Plan (strict + demo)
- [ ] Screen reader spot-check on What-if scenario change (single live summary)
