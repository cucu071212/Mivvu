# Known limitations — GateWise v1.0

Use this list in judge Q&A. Do not soften these into marketing claims.

## Product scope

- One airport: SFO. Welcome lists other codes as coming soon; they cannot continue into the app.
- Time-based recommendations cover **Terminal 2 D Gates** only, and only the 12 IDs in `legacy-d-v1`.
- Explore can show 26 listings. Browse-only rows are discovery, not modeled walks from your gate.

## Timing honesty

- Official JSON keeps `waitMinutes` and `activityMinutes` as `null`.
- Unknown durations are never replaced with zero.
- D→D **3 minute** legs are unverified demo estimates, not official SFO walking measurements.
- Demo queue **8** / activity **10** apply only after an explicit Flight toggle.
- Two-stop inter-stop walks stay Unknown until the My Plan travel checkbox is checked.
- Published hours are sourced listing text, not live open/closed status.
- Gate landmarks are orientation aids. They are not inputs to the time model.

## Location Guidance (GW-B)

- Evidence is listing-backed **area** confidence (`verified_area` or `unknown`).
- Not a floor plan, not coordinates, not a drawn route, not a walking-time claim.
- When evidence is Unknown, the conceptual T2 D guide is hidden. Listing “Where” text may still appear as an attributed facility detail.

## Imagery

- Most cards use category illustrations, not venue photography.
- Official flysfo.com listing photos are **not** licensed for reuse in this app.
- See `docs/FACILITY-IMAGE-RIGHTS-AUDIT.md`.

## Explicitly not built

Auth, database, payments, live flights, boarding-pass scan, multi-airport coverage, production indoor navigation, AI ranking, and verified physical walking graphs (**G-Data HOLD**).

## Accessibility note (pre-existing, not changed in this freeze)

`docs/ACCESSIBILITY_AUDIT.md` records a What-if “Scenario” label contrast measurement below 4.5:1 in light mode. No visual fix is included in this closeout. Flag for a separately authorized polish pass.

## Presentation / tooling notes (not product defects)

- Vercel inspect does not publish a Git commit SHA.
- Cursor-driven Tab/Escape events can land in the IDE instead of the page. Playwright and in-page keydown cover the dialog trap.
- An Explore name search can remain visible in the shared directory on Results until cleared.

## Award / event fields

Hackathon prize categories, official eligibility rules, and teammate legal names are **not recorded here**. Mark those `[VERIFY WITH HUMAN LEAD]` on Devpost.
