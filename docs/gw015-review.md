# GW-015 — Terminal schematic integration QA review

Reviewed 2026-10-24, after `git fetch origin`, on `feat/data-utils`.

- Schematic snapshot: `origin/feature/terminal-map` at `fbcdf109b6a159f2302f4adc0dfa0c6e806d5979`.
- Recommendation/What-if snapshot: `origin/main` at `babaf968269a7ecb1a7dc1efb153915ee3c1502c`.
- Guidance: [UI design system](ui-design-system.md), [release QA preparation](release-qa-prep.md), [facility provenance](data-provenance.md), PLAN.md and GW-015 implementation-plan acceptance.

**Assessment:** Source inspection supports integrating this as a read-only orientation section without calculation changes. It is not yet mounted in either branch's page/home component. No browser, accessibility, build or release pass is established. Lead-owned integration and pending checks below remain necessary.

## Facility coverage and location claims

Python parsing confirmed identical datasets across the two reviewed refs: 12 unique facility IDs. The component validates the imported JSON, derives landmark groups from non-null `nearestGateLandmark`, and renders each row in exactly one matching group or the no-landmark group. This is source-level coverage reasoning, not a rendered DOM count or execution of the validator.

| Published grouping | Facilities represented |
| --- | --- |
| D1 | Brookstone; Lark Creek Grill |
| D7 | Peet's Coffee — approved D7 outlet |
| D9 | Cat Cora; Wakaba |
| D15 | Burger Joint |
| D16 | 16th & Dolores General Store; Andalé Mexican Kitchen + Bar |
| Retail Street; no nearest gate assigned | Kiehl's; Napa Farms Market; Sunglass Hut; The Chocolate Market |

The four null-landmark rows all explicitly describe Retail Street in their location text. No artificial gate assignment is made. D4 is a supported contract landmark but has no approved facility row, so it is correctly absent from this dataset-derived view. It remains available in the main form's orientation selector; absence here does not mean the gate does not exist. The disputed Peet's D14/D15 outlet, Plant Café/Pinkberry and Books Inc./Compass remain excluded; Burger Joint's D15 association is a separate supported record.

All 12 records carry official location confidence, SFO listing URLs and `2026-10-24` verification dates. Source associations are traceable through those fields and the companion provenance document. Airport pages were **not rechecked** during this review. Published location/security evidence is not evidence of current opening, service availability or measured travel times.

## Inspection findings

Line references below refer to the pinned schematic snapshot.

| Area | Source evidence and assessment |
| --- | --- |
| Placement honesty | Lines 76–79 explicitly say not an official floor plan/navigation and reject geographic spacing, walking distances and routes. Lines 97–99 explain numeric landmark order, not walking order. No coordinates, path drawing, route arrows or distance computations appear. The boxes convey published associations rather than physical positioning. |
| Provenance/confidence | `FacilityList` (lines 18–51) retains descriptions, separately labeled location/timing badges, named SFO links and machine-readable verification dates. The closing note (136–139) distinguishes official facts, unknown queue/activity and the separate demo travel model. It makes no boarding recommendation. |
| Accessibility structure | Named outer/nested sections, h2/h3 hierarchy, figure/caption, lists, descriptive links and text-based confidence labels are present. Links use `gw-focus-ring` and `min-h-11` (44 px target height under the default scale), matching design guidance. Actual accessible names, focus visibility, contrast and reading order are not runtime verified. |
| Mobile intent | One grid column below `md`, two at `md`; `min-w-0`, wrapped badges and facility names use responsive layout utilities. Fits the design system's mobile-first intent. Long links/descriptions, zoom, light/dark contrast and the narrow two-column layout inside main's `max-w-2xl` container still require inspection in a browser. |
| Calculation isolation | Only `className` is accepted; no gate/filter/context callbacks or timing inputs. Imports are JSON, pure validation, a type and ConfidenceBadge. Main's `buildRankedRecommendations` still receives context/facilities/filter/travel/demo flag, and What-if performs baseline/scenario calls through that helper. The schematic need not participate in either data flow. |
| Branch isolation | Three-dot diff against main contains only the new 142-line component. Contracts, dataset, validator, engine, travel matrix, ConfidenceBadge and design-system document are byte-identical across reviewed refs. Neither page nor GateWiseHome currently imports/mounts the schematic. Integration remains pending. |

## Integration risks / lead follow-up

No current-dataset source defect requiring a calculation change was identified. The following are review concerns, not observed browser failures:

1. **Full-directory scope versus filtered recommendations.** Module-level JSON validation always supplies all 12 entries. Filters, invalid context and selected gate do not affect this section. Label it clearly as the full orientation directory; check that users do not interpret its contents as current recommendations, selection or eligibility results. There is no selection/highlight interface today.
2. **Unknown badges during demo mode.** The schematic displays original dataset timing confidence, so it stays “Unverified” while recommendation cards may show demo estimates. This preserves data integrity; ensure the surrounding UI retains the existing explanation that the schematic uses source records while demo modeling is temporary. Never feed schematic box order/spacing into travel calculations.
3. **Different invalid-dataset policies.** The schematic displays remaining valid rows plus an alert when any validation errors occur (lines 82–86). Main suppresses all recommendations on dataset errors. A partial orientation view could coexist with a disabled recommendation view; validate this deliberately and retain both alerts rather than implying a complete verified directory.
4. **Future data assumptions.** “Post-security” is hardcoded, and every missing-landmark row is placed under “Retail Street.” Both match today's 12 records, but the validator also permits other security values and optional location descriptions. Future rows require review of these headings; null landmark alone does not prove Retail Street or post-security access.
5. **Page length and responsiveness.** Twelve repeated source entries add scrolling and keyboard stops alongside existing cards/What-if. Test discoverability and comparison access at mobile widths. No map interaction, focus jump or sticky layout is implemented or required by the component.

## Missing integration acceptance cases — all NOT RUN

| Case | Expected evidence before accepting integration |
| --- | --- |
| Mount and coverage | Mount once in the lead-owned page/home, compile and check hydration/console. Assert 12 unique facility entries within the schematic only, correct group membership/counts, no D4/fictitious D14 association, and four Retail Street rows with no inferred gate. |
| Honest labeling | At every breakpoint, retain the geography/routing disclaimer, numeric-order explanation, per-row URL/date and distinct location/time labels. Follow source links; do not infer live availability. |
| Filter/context independence | Search/category filters, no matches, blank/invalid boarding, and changing gate landmark leave the explicitly full-directory schematic intact while existing recommendation error/count behavior remains correct. |
| Timing-mode independence | Demo off retains unknown outcomes; demo on uses 3+3+8+10+10 = 34 minutes with buffer 10. Schematic retains original unknown timing badges and no invented routes. Toggling modes must not mutate JSON or alter grouping. |
| Calculation regression | With queue delta 0 and demo on: available 33/34/43/44 gives margin −1/0/9/10 and over/tight/tight/feasible. Results, breakdowns and ordering must match pre-integration results for identical inputs. |
| What-if regression | Baseline 50/buffer 10 gives margin +16; scenario 35/delta +7 gives required 41/margin −6. Baseline stays fixed while only scenario fields change. Keep existing signed-queue clamping and null handling from release QA checks. |
| Invalid/changed fixtures | In isolated fixtures, reject a malformed row and observe partial-data warning versus main's disabled recommendations. Review labels for a valid non-post or non-Retail-Street null-landmark fixture; do not silently generalize current heading assumptions. Do not edit production JSON to run these checks. |
| Keyboard/AT | Verify named landmarks, heading/list reading order, all 12 descriptive source links, visible focus and no keyboard traps. Labels and confidence meaning must work without color. No fake interactive map controls or navigation promises. |
| Mobile/zoom/themes | Test 375/768/1024/1440 px per design system, plus 320 px and 200% zoom per release QA. Check single/two-column transitions, wrapping, no horizontal overflow, touch targets and light/dark text/focus contrast. |

## Verification actually performed

- `git status --short --branch`: clean `feat/data-utils` before editing this review.
- `git fetch origin`: succeeded; the terminal-map remote ref was fetched.
- `git rev-parse`, `git show` and `git diff --stat origin/main...origin/feature/terminal-map`: pinned/read source snapshots and confirmed the component-only branch diff.
- Python static assertions: datasets identical with 12 unique IDs; all four unassigned locations explicitly Retail Street; all rows post-security with official location/unknown timing confidence, SFO URL and verification date. Relevant shared files unchanged; no calculation API reference or page/home mount in the component branch.
- npm/Vitest, TypeScript, lint, build, rendering, browser, mobile and screen-reader verification: **NOT RUN**. No final release certification. Existing release-preparation risks remain open.

Only this review document is changed by this task. Integration and any application/test changes belong to the Engineering Lead under separate authorization.
