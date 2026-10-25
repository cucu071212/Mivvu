# GW-C-SUPPORT — Data and time reliability handoff

## Assignment and recovery checkpoint

- Authorized package: Workstreams A–E from the human Lead's Phase C Data & Time Reliability assignment; supersedes the narrow GW-C-002-SUPPORT proposal.
- Starting `origin/main`: **`47c07028e1eccb3515f8bd8bfddd80f1c90fccdd`**, fetched and independently matched with `git ls-remote origin refs/heads/main` on 2026-10-25 ET.
- Branch: **`codex/gw-c-reliability-package`**.
- Preserved worktree: `/Users/yegeonlee/.codex/worktrees/gw-c-data-time-reliability/GateWise`.
- The initially considered branch name already belonged to another worktree. That branch and all existing release branches were left alone.
- First verified checkpoint: **`ca757ec`**, published-hours and Pacific timestamp modules/tests.
- Scope: new pure utilities, tests, a test-only baseline fixture, and this handoff. No application integration, source-record changes, dependency changes, routing/Phase B/GW-E work, countdown changes, merges, deployment, or G-C0 approval.
- Completion state: implementation and verification complete. Final commit SHA and remote push verification belong in the final GATEWISE STATUS report (a commit cannot embed its own SHA). On recovery, inspect `git status --short --branch` and `git log -3 --oneline` in this worktree before making changes. Do not restart the superseded narrow task.

Delivered files: `src/lib/published-hours.ts`, `src/lib/published-hours.test.ts`, `src/lib/airport-local-time.ts`, `src/lib/airport-local-time.test.ts`, `src/lib/audit-facility-data.ts`, `src/lib/audit-facility-data.test.ts`, `src/lib/fixtures/recommendation-baseline-v1.ts`, and this document. All are additions relative to starting main.

## Exported APIs

### `src/lib/published-hours.ts`

```ts
presentPublishedHours(
  hours: FacilityHours | null | undefined,
  hoursConfidence?: DataConfidence,
): PublishedHoursPresentation
```

The returned object includes the existing `FacilityHoursPresentation` fields (`scheduleLine`, `disclaimer`, `spansMidnight`, `isUnknown`), plus:

| Field | Meaning |
| --- | --- |
| `kind` | `weekly`, `raw_text`, `unknown`, `withheld`, or `invalid` |
| `rawText` | Exact input text, including whitespace, or `null`; never HTML |
| `confidence` | Declared schedule confidence; unknown schedules always remain `unknown` |
| `timezone` | The shared `FACILITY_HOURS_TIMEZONE`, `America/Los_Angeles` |
| `liveStatus` | Always `unknown`; deliberately no current-opening calculation |

Existing formatted lines, suppression of non-official weekly schedules, overnight annotation, and disclaimer are reused from `presentFacilityHours`. The old module remains unchanged, so existing UI behavior is unaffected until Lead integration. No `Date`, clock, locale-default formatting, browser state, network calls, or schedule parsing from prose is used.

The deliberate improvements at the new boundary are: unknown raw text retains whitespace verbatim; `null` is an explicit unknown input; malformed runtime schedules fail closed with `kind: invalid`. Blank raw text retains its exact value in metadata but produces the existing unknown display line. A weekly object must contain both valid zero-padded `HH:mm` endpoints or both `null`, an SFO timezone, and nonblank raw text. Unknown hours with an inconsistent `official_verified` confidence are never promoted to a known schedule. The audit separately rejects that inconsistent record.

`isUnknown` retains its legacy meaning: an unparsed **weekly** official schedule can have `isUnknown: false`; AG1/Vino Volo unknown-kind raw text has `isUnknown: true`. Use `kind` when distinguishing structured from raw presentation. Equal opening/closing endpoints remain equal and are **not** interpreted as 24-hour operation. `spansMidnight` describes wall-clock ordering, not elapsed duration on a DST date.

### `src/lib/airport-local-time.ts`

```ts
presentAirportLocalTime(value: unknown): AirportLocalTimePresentation
isCalendarDate(value: unknown): value is string
```

`presentAirportLocalTime` accepts ISO instants in `YYYY-MM-DDTHH:mm[:ss[.SSS]]Z` or an explicit `±HH:mm` offset. Fractions may contain one to three digits when seconds are supplied. It accepts calendar years 0100–9999, valid clock components, and offset hours 00–23/minutes 00–59. This is an instant parser, not a validator that an arbitrary supplied offset is an actual SFO offset.

- `null`/`undefined` → `kind: unknown`, `Time unknown`.
- Malformed dates, rollover dates, local/offset-free strings, date-only strings, numbers, Date objects, surrounding whitespace, leap seconds, and `-00:00` (an unspecified RFC3339 offset) → `kind: invalid`.
- Valid instant → `kind: timestamp` with numeric `date`, `time` (seconds, no milliseconds), `offsetMinutes`, `offsetLabel`, and deterministic assembled `text`.
- Missing Intl/timezone support or a converted local date outside the supported calendar → `kind: unavailable`. It never falls back to the host zone.

Example: `2026-11-01T09:30:00Z` produces `2026-11-01 01:30:00 Pacific Time (UTC-08:00)`. The earlier occurrence at `08:30Z` shows `UTC-07:00`, making the repeated hour distinguishable. Explicit `en-US`, Gregorian calendar, Latin digits, `h23`, and `America/Los_Angeles` are supplied to `Intl.DateTimeFormat`; numeric parts are assembled without locale punctuation. Historical IANA offsets with seconds are retained rather than silently rounded.

`isCalendarDate` validates a real Gregorian `YYYY-MM-DD` in the same year range, including century/leap-year rules. **Keep `lastCheckedAt`/`hoursLastCheckedAt` as date-only text.** Passing those fields to the timestamp presenter would shift semantics; they are not midnight UTC instants.

No boarding/countdown or flight-time function imports this module. The existing `formatBoardingStartLabel` pins a locale but relies on the host timezone; it is intentionally unchanged. Any boarding-label policy change needs a separate Lead decision because those inputs currently represent user/device context, not facility hours.

### `src/lib/audit-facility-data.ts`

```ts
type RecommendationEligibilityBaseline = {
  readonly version: string;
  readonly approvedFacilityIds: readonly string[];
};

auditFacilityData(raw: unknown, baseline: RecommendationEligibilityBaseline): FacilityDataAudit
```

The input is raw JSON-compatible data, **before normalization**. The audit composes the existing schema validator with independent raw-representation, provenance, normalized-ID collision, and exact approved-ID-set checks. It is not a competing Facility schema or a replacement for `validateFacilities`.

The report contains `policyVersion: "gw-c-facility-audit-v1"`, the caller's `baselineVersion` (or null if invalid), `ok`, counts (`input`, `valid`, `browseEligible`, `recommendEligible`), sorted `recommendationIds`, and ordered `issues`. Each issue has a typed `code`, `severity`, `path`, and `message`. Schema errors retain their existing codes/paths. `ok` means **zero errors**, not zero warnings or approval to release. Counts and ID comparisons use schema-valid normalized records; invalid/dropped source rows remain errors. A record with an audit-only error may still count as schema-valid; always check `ok`, not just counts.

No records or flags are repaired or returned for production use. The function does not call `recommendFacilities`, load a routing manifest, fetch sources, inspect the clock, or mutate input/baseline. Results contain only JSON-safe values. Issue ordering follows input order; recommendation IDs are sorted. Reordering input rows naturally changes diagnostic paths/order.

## Validation policy

| Area | Error policy | Warning / preservation policy |
| --- | --- | --- |
| IDs | Require lowercase ASCII kebab-case; detect duplicates after NFKC + trim + case folding even if an earlier row is invalid | Never normalize/rewrite IDs |
| Location | Existing validator checks SFO, terminal/boarding-area mapping and zone consistency | Existing legacy omitted location/eligibility fields remain valid with a `legacy_location_defaults` warning |
| Security | Existing enum and recommendation consistency checks; known pre/post/both claims require attribution | Explicit unknown remains unknown and emits `unknown_security` |
| Eligibility | Exact approved set; additions, removals, same-count substitutions, invalid or disabled approved rows fail | Browse-only expansion need not change the approved set |
| Durations | Raw values must be null or nonnegative safe integer **numbers**; existing confidence consistency checks apply | Null stays unknown and emits `unknown_durations`; never zero-filled |
| Published hours | Strict presentation shape; weekly confidence must be explicit; unknown hours must not contain normalized time claims | Missing hours and raw-only schedules emit `unknown_hours` / `unparsed_hours` |
| Provenance | Required for attributed location/time, known security, official contact/badges, and every published hours text (including unknown/rawText); valid URL plus checked date | Unknown/no-text hours need no invented source |
| Source URLs | Official claims require HTTPS at exactly `flysfo.com` or `www.flysfo.com`; other attributed sources allow HTTP(S); no credentials, custom port, or whitespace | URL syntax/host checks do not verify page content, availability or authenticity of a claimed fact |
| Dates | Strict real YYYY-MM-DD, no timestamps or whitespace | No freshness/age policy or current-clock inference |
| Baseline | A nonblank trimmed version and nonempty unique canonical ID list are mandatory; malformed/missing baseline fails | Caller owns approval; version strings are not authorization |

These checks intentionally exceed normalization tolerance in the existing validator (for example string durations, padded IDs/times, inferred weekly confidence). Keep the audit on the **raw** dataset so normalization cannot erase evidence. The audit can emit both a schema error and a policy error for the same bad field; this is intentional.

## Versioned recommendation protection and Lead interface

No Lead-owned ID manifest exists in the verified starting tree. `src/lib/fixtures/recommendation-baseline-v1.ts` is explicitly **test-only**. It pins the 12 historically approved GW-004 IDs with version `sfo-t2-d-approved-12-v1`, consistent with the existing IT batch regression and `docs/data-provenance.md` approved shortlist. It is not generated from current flags and is not imported by production utilities.

When a Lead-owned Phase B manifest exists, adapt its authoritative version and ID list to `RecommendationEligibilityBaseline` in a Lead-owned integration/CI test. Do not copy the manifest into this library and do not derive the approved set by filtering the same dataset being audited. The fixture remains a historical regression expectation until the Lead explicitly authorizes an eligibility-baseline revision. Passing an arbitrarily expanded list can weaken any caller-supplied policy; the versioned fixture/test and Lead review protect that boundary.

This audit protects the existing D-only validator contract. A future expansion of recommendation scope requires the Lead's shared-contract/validator work and a reviewed baseline version; merely passing new IDs does not authorize cross-terminal recommendations.

### Completion-time integration update

After the verified implementation was committed/pushed, remote main advanced to **`ba90a7914bcf7974b931c00eea719c835d2037a0`**. A read-only comparison found **no overlapping changed file paths** with this eight-file package. Main now includes the Lead-owned `src/data/approved-recommend-facility-ids.ts` from GW-B-002. Its 12 IDs match this package's frozen acceptance fixture; its version is `legacy-d-v1`. No manifest was copied, changed, or merged into this support branch. Use this concrete adapter on the Lead's integration branch:

```ts
import {
  APPROVED_LEGACY_RECOMMEND_FACILITY_IDS,
  APPROVED_LEGACY_RECOMMEND_MANIFEST_VERSION,
} from "@/data/approved-recommend-facility-ids";

const approvedBaseline = {
  version: APPROVED_LEGACY_RECOMMEND_MANIFEST_VERSION,
  approvedFacilityIds: APPROVED_LEGACY_RECOMMEND_FACILITY_IDS,
};
```

The source manifest does not exist at this support branch's starting commit, so this is an integration instruction rather than a new runtime import here. Main also includes new facility-detail UI, browser tests/dependencies, and travel metadata; the support package's green verification applies to its recorded base plus its additions, **not** the later combined main. Lead integration must rerun the latest main checks and preview smoke tests. `FacilityInformation` still calls the existing presenter on that main revision, so the replacement below remains applicable.

## Exact integration steps for Cursor

1. Review the isolated branch against starting main. Merge/cherry-pick only through the Lead's normal review process. The package does not itself approve G-C0.
2. In the Lead-owned `FacilityInformation` integration, replace the presenter import/call only:

   ```ts
   import { presentPublishedHours } from "@/lib/published-hours";
   const hours = presentPublishedHours(facility.hours, facility.hoursConfidence);
   ```

   Existing `scheduleLine`, `disclaimer`, `spansMidnight`, `isUnknown` consumers continue to work. Keep `facilityOfficialListingUrl` / `facilityVerificationDate` imports from the old formatter. Render text normally through React; do not use `dangerouslySetInnerHTML`. Do not display `rawText` as a workaround for `kind: withheld` or `invalid`. Do not turn `liveStatus: unknown` into an Open/Closed badge.
3. On an airport timestamp surface, pass an **already explicit-offset instant** to `presentAirportLocalTime`, render `text`, and handle unknown/invalid/unavailable states. Do not pass provenance dates, invent a timestamp, or replace device-local boarding controls as part of this integration.
4. Add a Lead-owned data/CI assertion using the authoritative manifest adapter:

   ```ts
   import { auditFacilityData } from "@/lib/audit-facility-data";
   // approvedBaseline comes from the reviewed Lead manifest/adapter.
   const report = auditFacilityData(rawFacilityJson, approvedBaseline);
   expect(report.issues.filter((issue) => issue.severity === "error")).toEqual([]);
   expect(report.ok).toBe(true);
   ```

   Until that manifest lands, the delivered audit test already runs the frozen historical acceptance fixture. Do not import the fixture into application logic.
5. Review warnings, run full tests/typecheck/lint/build on the integration branch, and perform preview smoke/a11y checks on Explore and Results: all 26 listings browseable, exactly 12 eligible recommendations, AG1/Vino Volo verbatim text and not-live disclaimer, unknown data visible, mobile layout intact. Only the Lead can approve G-C0 after those UI checks.

## Test matrix and verification record

| Suite / case | Evidence |
| --- | --- |
| `published-hours.test.ts` | 32 tests: explicit expected labels for all 24 structured schedules plus the two raw schedules; separate legacy compatibility check; raw Unicode/whitespace; midnight/noon/overnight/equal endpoints; malformed shapes; suppression/confidence; all 1,440 minute labels; frozen/JSON-round-trip determinism |
| `airport-local-time.test.ts` | 62 tests: standard/daylight offsets, exact 2026 DST transition instants, repeated fall-back hour, year/leap/date boundaries, explicit-offset equivalence, invalid timestamps, unknowns, missing Intl support, converted-calendar overflow, date-only validation |
| `audit-facility-data.test.ts` | 72 tests: full 26/12 dataset, malformed roots/rows, canonical/duplicate IDs, location/security/flag errors, raw durations, source spoofing, date errors, each provenance field removed from every row, hours confidence/shape, all browse-only recommendation expansions, every approved-ID removal/replacement, frozen inputs and valid/invalid baseline contracts |
| Generated properties | Exhaustive minute domain and deterministic row-mutation sweeps; no randomness, snapshots, property-testing dependency, or new date library |
| TDD evidence | Each new suite was run first and failed because its new module was absent. Additional provenance/calendar-overflow tests failed on the implemented code before fixes, then passed. The third-party fixture was corrected to remove its unrelated official-contact claim. |

Baseline: **631 tests in 37 files passed** before edits. After the initial audit implementation, the full suite passed **794 tests in 40 files**; later boundary/expected-label tests increased the final suite (see final checks below).

This machine has no `npm` on the default shell PATH. Actual commands used the existing `/private/tmp/gatewise-npm` wrapper, which selects the bundled Node runtime/npm and a temporary npm cache; it is equivalent to the displayed npm/npx commands without changing repository dependencies/configuration.

| Actual command | Result |
| --- | --- |
| `/private/tmp/gatewise-npm ci --ignore-scripts --no-audit --no-fund` | PASS; installed lockfile dependencies; no package files changed |
| `/private/tmp/gatewise-npm test -- src/lib/published-hours.test.ts src/lib/audit-facility-data.test.ts src/lib/airport-local-time.test.ts` | PASS, 166 tests / 3 files |
| `TZ=UTC`, `TZ=Asia/Seoul`, `TZ=America/Los_Angeles` followed by the focused command | PASS in three separate processes, 165 tests each before the final additional static-label assertion; in-suite tests also change host TZ and wall clock |
| `/private/tmp/gatewise-npm test` | PASS, **797 tests / 40 files**, final run |
| `/private/tmp/gatewise-npm exec -- tsc --noEmit` | PASS after filesystem escalation; first sandbox attempt failed only to write `tsconfig.tsbuildinfo` |
| `/private/tmp/gatewise-npm exec -- tsc --noEmit --incremental false` | PASS on completed support code |
| `/private/tmp/gatewise-npm run lint` | PASS, final run |
| `/private/tmp/gatewise-npm run build` | PASS, all five routes prerendered; first sandbox attempt failed to create `.next`, approved escalation succeeded |
| `git diff --check` | PASS |

Existing toolchain notices: Vitest warns about a future native Vite config-loader change; npm installation reports locked-package deprecations. Neither prevented checks; dependency/configuration updates are outside this assignment. No browser/preview UI integration test was performed for this additive library package.

## Known data gaps and extension points

- 26 representative browse listings are not comprehensive SFO coverage. Exactly 12 existing T2 D Gates records remain eligible for recommendations; this package grants no route coverage.
- All 26 source rows retain null wait/activity values. The audit reports this explicitly; it does not fill demo values or alter downstream model semantics.
- The original 12 records rely on legacy location/eligibility defaults. A future explicit-field migration needs a separate authorized data task; this package only warns.
- AG1's 24-hour statement and Vino Volo's split-week schedule remain unparsed raw text. Richer per-day/24-hour schedule types need a Lead-reviewed shared schema change and dedicated source evidence, not guessing from prose.
- Existing Peet's D14/D15, Plant D3/D4, and Books Inc./Compass discrepancies remain documented in `docs/data-provenance.md`; this audit validates structure, not resolution of conflicting source claims.
- Source metadata is checked offline. No official pages were re-fetched, no claim of fresh source verification is made, and date age is not a proxy for current opening status. Security evidence can depend on companion provenance documents; a single URL does not prove every field.
- Timestamp output is deterministic for the same input and compatible runtime IANA timezone data. No browser locale/host-zone dependence is used, but the package does not bundle/pin an IANA database; historical/future governmental timezone rule changes can differ between runtimes.
- No weekly schedule is converted into a specific occurrence on a DST date; there is no open/closed engine, holiday/exception support, elapsed opening duration, or handling of ambiguous local schedule instances.
- For new browse records: retain stable canonical IDs, explicit location/security/eligibility metadata, supported hours representation, and checked sources. Run the raw audit with the unchanged approved baseline. Review any new warnings before release.

## Decisions remaining with the human Engineering Lead

1. Review/adopt the additive presenter and stricter release-audit policy (especially official-host attribution and explicit raw weekly confidence).
2. Supply the future authoritative manifest adapter and decide where the audit runs in CI; preserve the exact approved-ID protection.
3. Separately authorize any legacy source-record migration, richer hours schema, or device-versus-airport boarding label policy.
4. Integrate and complete preview smoke/a11y checks before deciding G-C0. Phase B/GW-E gates remain separate.

Recommended next task, proposal only: **Lead Cursor review and integrate GW-C-002 hours presentation**, then verify Explore/Results preview behavior. No subsequent task is started by this package.
