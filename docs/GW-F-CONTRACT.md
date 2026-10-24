# GW-F — Technical contract (F1, F2, F3 integration)

**Status:** Proposed — documentation only until human Engineering Lead approves and authorizes implementation tasks.  
**Baseline:** `main` @ `665e5e85a9b30b8114c678c7097a3b9ce5e9e805`, production https://gate-wise-iota.vercel.app  
**Does not modify** existing `recommendFacilities`, `UserContext`, or `facilities.json` until a separate integration task (GW-F3) updates lead-owned contracts.

---

## 1. Scope summary

| Track | Goal |
| --- | --- |
| **GW-F1** | Per-facility user-supplied queue and/or activity durations; never write to official dataset. |
| **GW-F2** | Optional boarding-start date/time with device-clock countdown to derive `minutesUntilBoarding`. |
| **GW-F3** | Lead wires F1 + F2 into recommendations and What-if; full regression. |
| **GW-E** | Two-stop planner only after **GW-F3** acceptance and separate **G-E** authorization. |

---

## 2. Module ownership (implementation)

| Module | Owner | Tests |
| --- | --- | --- |
| `src/lib/resolve-facility-durations.ts` | Engineering Support Codex | `src/lib/resolve-facility-durations.test.ts` |
| `src/lib/validate-duration-overrides.ts` | Engineering Support Codex | `src/lib/validate-duration-overrides.test.ts` |
| `src/lib/boarding-countdown.ts` | Engineering Support Codex | `src/lib/boarding-countdown.test.ts` |
| `src/types/airport.ts` (new exported types only) | Engineering Lead Cursor | `tsc` via integration |
| UI + `GateWiseHome` / `WhatIfSimulator` wiring | Engineering Lead Cursor | smoke + existing suites |

Support Codex works on `feature/gw-f-logic` (or lead-assigned feature branches). **No** React, `main`, or `facilities.json` edits.

---

## 3. GW-F1 — Duration overrides

### 3.1 Types (to be added in `src/types/airport.ts` during GW-F3)

```ts
/** Minutes the user typed for one facility; does not mutate {@link Facility}. */
export type FacilityDurationOverride = {
  facilityId: string;
  /** When set, replaces resolved queue for this facility in the model. */
  queueMinutes?: number;
  /** When set, replaces resolved activity for this facility in the model. */
  activityMinutes?: number;
};

/** Map keyed by facility id for O(1) lookup. */
export type FacilityDurationOverrideMap = Readonly<
  Record<string, FacilityDurationOverride>
>;

export type ResolvedDurationSource =
  | "user_override"
  | "demo_estimate"
  | "official_record"
  | "unknown";

export type ResolvedFacilityDurations = {
  queueMinutes: number | null;
  activityMinutes: number | null;
  queueSource: ResolvedDurationSource;
  activitySource: ResolvedDurationSource;
};
```

### 3.2 Pure functions

```ts
/**
 * Normalize raw form/API input into a validated override map.
 * Rejects negative, non-integer, NaN, and unknown facility ids (caller passes valid ids).
 */
export function validateDurationOverrides(
  input: unknown,
  knownFacilityIds: readonly string[],
): {
  overrides: FacilityDurationOverrideMap;
  errors: Array<{ facilityId: string; field: "queueMinutes" | "activityMinutes"; code: string }>;
};

/**
 * Resolve effective queue/activity for one facility.
 * Does not mutate `facility` or `facilities.json`.
 */
export function resolveFacilityDurations(
  facility: Facility,
  options: {
    overrides: FacilityDurationOverrideMap;
    useDemoTimeEstimates: boolean;
    demoQueueMinutes: number; // default 8 — import from demo-estimate-facilities
    demoActivityMinutes: number; // default 10
  },
): ResolvedFacilityDurations;
```

### 3.3 Precedence (per field, independent)

For **queue** and **activity** separately:

1. **User override** — if `validateDurationOverrides` accepted a finite integer ≥ 0 for that field on this `facilityId` → use it; `source = user_override`.
2. Else if **`useDemoTimeEstimates`** → use demo constants (8 queue / 10 activity); `source = demo_estimate`.
3. Else use **`facility.waitMinutes`** / **`facility.activityMinutes`** from the official record; if non-null → `source = official_record`.
4. Else → `null` and `source = unknown` (never coerce to 0).

**Partial overrides:** If the user enters only queue, activity follows steps 2–4 on its own. Symmetric for activity-only.

**Queue adjustment:** Existing `UserContext.queueAdjustmentMinutes` (What-if) applies **after** resolved queue: `effectiveQueue = max(0, resolvedQueue + queueAdjustmentMinutes)` when `resolvedQueue !== null`. Adjustment does not apply when queue is unknown.

### 3.4 Provenance invariants

- Do **not** change `Facility.locationConfidence`, `timeConfidence`, `sourceUrl`, or schematic dataset rows when users override durations.
- Recommendation UI may show resolved source badges (`user_override` vs `demo_estimate` vs official/unknown) on **cards only**; schematic timing badges remain dataset-backed.
- User overrides are **in-memory / session** unless a future task explicitly adds persistence (out of GW-F scope).

### 3.5 F1 minimum tests

- Override queue only → activity from record/demo/unknown per rules above.
- Override both → demo flag ignored for overridden fields only.
- Demo on, no override → 8/10 with `demo_estimate` sources.
- Demo off, null record times → unknown sources, null minutes.
- Invalid override (−1, 3.5, empty string) → validation error; not in map.
- `queueAdjustmentMinutes: 7` increases effective queue by 7 when queue known.

---

## 4. GW-F2 — Boarding countdown

### 4.1 Types (GW-F3 addition to `airport.ts` or local to module until merge)

```ts
export type BoardingCountdownInput = {
  /** ISO 8601 local or offset datetime from UI, e.g. "2026-10-25T14:30" + separate tz handling */
  boardingStartAt: string;
};

export type BoardingCountdownState =
  | { mode: "manual"; minutesUntilBoarding: number }
  | {
      mode: "countdown";
      boardingStartAt: string; // normalized ISO
      /** running | paused */
      runState: "running" | "paused";
      /** When paused: ms remaining at pause instant (frozen). */
      pausedRemainingMs?: number;
    };

export type BoardingCountdownTick = {
  minutesUntilBoarding: number;
  /** True when boarding start is in the past (display 0 minutes). */
  boardingStarted: boolean;
  invalid: false;
} | { invalid: true; code: string };
```

### 4.2 Pure functions (`src/lib/boarding-countdown.ts`)

```ts
/** Parse and validate boarding start; rejects unparseable dates. */
export function parseBoardingStartAt(input: string, now: Date): {
  boardingStartAt: Date;
} | { error: string };

/**
 * Whole minutes until boarding starts from `now`.
 * Rounding: floor toward zero for positive remaining ms (59s → 0 min).
 * If boarding start ≤ now → minutesUntilBoarding = 0, boardingStarted = true.
 * Never returns negative minutes.
 */
export function minutesUntilBoardingFromTimestamp(
  boardingStartAt: Date,
  now: Date,
): BoardingCountdownTick;

/** Pause: capture remaining ms at pause time. */
export function pauseCountdown(
  state: Extract<BoardingCountdownState, { mode: "countdown" }>,
  now: Date,
): Extract<BoardingCountdownState, { mode: "countdown" }>;

/** Resume: recompute boardingStartAt from remaining ms at resume instant. */
export function resumeCountdown(
  state: Extract<BoardingCountdownState, { mode: "countdown"; runState: "paused" }>,
  now: Date,
): Extract<BoardingCountdownState, { mode: "countdown"; runState: "running" }>;

/** Clear countdown → manual mode with optional fallback minutes. */
export function clearCountdown(fallbackMinutes: number): Extract<BoardingCountdownState, { mode: "manual" }>;
```

### 4.3 Semantics

- **Device clock:** All ticks use `Date.now()` in the browser; no airline/live flight APIs; copy must state “local clock estimate only.”
- **Midnight / DST:** Use absolute `Date` math (UTC internally after parse); UI collects local date + time consistent with `parseBoardingStartAt` contract tests.
- **Zero:** At exact boarding start, `minutesUntilBoarding = 0`, `boardingStarted = true`.
- **Invalid times:** Empty, malformed, or unreasonably far past/future (optional cap, e.g. > 48h — lead may tighten in UI validation) → `invalid` tick; recommendations use existing `validateContext` failure path.
- **React:** Lead owns `setInterval` / `requestAnimationFrame` throttle (e.g. 1s), cleanup on unmount, pause stops timer, resume restarts.

### 4.4 F2 minimum tests

- 30 minutes before boarding → 30.
- 90 seconds before → 1 (floor) or 0 per spec above (document: **floor** → 1 min until < 60s → 0).
- Boarding in the past → 0, `boardingStarted: true`.
- Pause 10 min remaining, advance clock 5 min while paused → still 10.
- Resume → remaining decreases with clock.
- Clear → manual mode with stored minutes.

---

## 5. GW-F3 — Integration rules

### 5.1 Recommendations

- Lead applies `resolveFacilityDurations` (or a thin wrapper) **before** `recommendFacilities`, producing effective queue/activity per facility without mutating `facilities.json`.
- Preferred pattern: extend recommendation input via a **new optional parameter** or wrapper function agreed at GW-F3 (e.g. `recommendFacilitiesWithResolvedDurations`) to avoid silent behavior changes mid-refactor.
- Countdown mode: on each tick, update `UserContext.minutesUntilBoarding` from `minutesUntilBoardingFromTimestamp`; re-run recommend memo when minutes change (throttled).

### 5.2 What-if consistency

- **Baseline** uses baseline context: gate zone, buffer, security, **override map**, **countdown or manual minutes**, and `useDemoTimeEstimates` at baseline.
- **Scenario** changes only What-if controls (`minutesUntilBoarding` delta and/or `queueAdjustmentMinutes`) unless lead adds explicit scenario override UI (not in F1 scope).
- When countdown is **running**, both baseline and scenario use the **same** live `minutesUntilBoarding` at tick time; scenario minute slider applies **relative delta** to that live value or switches scenario to fixed minutes — **default:** scenario continues to use explicit scenario minutes field (existing behavior), baseline uses countdown when enabled. Lead documents chosen behavior in GW-F3-002 acceptance.
- Demo toggle affects **both** baseline and scenario (unchanged).

### 5.3 Regression invariants (must not break)

- P0 B+C hero margins with demo on/off.
- GW-015 schematic collapse, a11y, unfiltered directory.
- Directed travel matrix, security zone rules, unknown never zero-filled.
- `validateContext`, `filterFacilities`, `validateFacilities` behavior.

---

## 6. GW-E dependency

GW-E (two-stop planner) **must not** start until:

1. GW-F3 acceptance gate **G-F3** passed (tests + production smoke).
2. Human lead issues separate **G-E** authorization (unchanged P1 rules: time-budget estimator, not route optimization).

---

## 7. Open decisions (lead approval)

| ID | Question |
| --- | --- |
| **D-F1** | Persist overrides in `sessionStorage` for refresh, or session-only? |
| **D-F2** | Maximum future boarding datetime (e.g. 24h vs 7d)? |
| **D-F3** | What-if scenario minutes: fixed field vs “delta from live countdown”? |
| **D-F4** | GW-F3: extend `recommendFacilities` signature vs wrapper export? |

---

**Document version:** 1.0  
**Aligned with:** `PLAN.md` post-MVP section, `docs/IMPLEMENTATION_PLAN.md` GW-F tasks, `AGENTS.md` ownership.
