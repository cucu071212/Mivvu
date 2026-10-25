# GW-E1 readiness review and G-E authorization proposal

**Date:** 2026-10-25 (America/New_York)  
**Role:** Engineering Lead Cursor / Senior Algorithm Engineer  
**Task type:** Planning and readiness only — **no GW-E implementation**  
**Verified `origin/main` SHA:** `8d7b9f1730072f609b187fd67f162a03dc23d214`  
**Independent branches (unchanged):** `feature/gw-ux-polish` @ `a5573ee` — not merged

---

## Executive recommendation

| Question | Answer |
| --- | --- |
| Is the **architecture** reconciled enough to implement a **narrow** GW-E1? | **Yes**, for a **legacy_zone / D-Gates demo** two-stop evaluator only. |
| May engineering **implement** GW-E1 now? | **No** — **G-E** and **G-Data** remain **HOLD** per `PLAN.md` §13 and `AGENTS.md`. |
| Readiness for human decision | **READY FOR SCOPED APPROVAL** of the **GW-E1 contract, demo travel policy, test matrix, and work packages** below. |
| Implementation authorization | **HOLD** until the human Engineering Lead issues explicit **G-E** (and closes or waives **G-Data** in writing). |

---

## 1. Architecture findings (documents vs code)

### 1.1 Sources reconciled

| Document | Repo status @ `8d7b9f` | Role |
| --- | --- | --- |
| `docs/GW-B-GW-E-integration-architecture.md` | On `main` | Unified B×E decisions **C01–C18**; future graph + legacy dual mode. |
| `docs/walking-time-policy.md` | On `main` (GW-B-R001) | No verified SFO-wide graph; D→D demo; G-Data gates for E. |
| `docs/GW-E-two-stop-planner-design.md` | **Not on `main`** — design commit `d32cdd9` on branch `codex/gw-e-two-stop-design` | Equations, adversarial cases **E01–E55**, routing port, ledger. |
| `docs/IMPLEMENTATION_PLAN.md` | On `main` | Phase D GW-E1/E2; **G-E** after **G-F3** + **G-Data**; Support owns pure E logic. |
| `docs/REMAINING_ROADMAP.md` | On `main` (stale SHA in table) | Phase D deferred; **G-Data HOLD** blocks **G-E**. |
| `PLAN.md` §4 E, §11–§13 | On `main` v1.6 | Two-stop semantics; **G-Data = G-X3 + G-B1 + G-C0**; E not started. |
| `AGENTS.md` | On `main` | GW-E after GW-F3 + **G-E**; Support pure modules; Lead UI/integration. |

### 1.2 Implementation baseline (verified on `8d7b9f`)

| Area | Observed behavior |
| --- | --- |
| **Eligible set** | **12** facilities via normalized `recommendEligible` + D/post scope (`gw-x-002-batch-1.test.ts` legacy ID list). **26** browse; **14** explicit `recommendEligible: false`. |
| **Travel** | `productionTravelMinutes.D.D = 3` (`demo_estimate`); outbound and return each call `resolveDirectedTravelLeg` independently (`recommend.ts`). |
| **Single-stop budget** | `required = outbound + return + queue + activity + buffer`; `margin = minutesUntilBoarding - required`; thresholds ≥10 / 0–9 / &lt;0 (`classifyMargin`). |
| **Unknown** | Any missing essential leg → `requiredMinutes` and `marginMinutes` **null** (GW-011). |
| **Queue adjustment** | Applied per facility after resolution; `max(0, q + d)`. |
| **GW-F** | Override → demo (if on) → record → unknown; session suppresses invalid personalization. |
| **What-if** | Same `recommendFacilities` path; scenario minutes fixed; baseline may tick (`what-if-compare.ts`). |
| **Phase B graph** | **Not implemented** — metadata-only GW-B-002 on `main`. |

### 1.3 Conflicts and drift (must not assume old plans)

| Topic | Conflict | Resolution for GW-E1 |
| --- | --- | --- |
| **REMAINING_ROADMAP baseline SHA** | Lists `6a847b8`; production is **`8d7b9f`**. | Use git `main` tip for release; update roadmap in a separate doc hygiene task (out of GW-E1 scope). |
| **GW-E design doc location** | Not merged to `main`. | Treat `d32cdd9` design + `main` integration study as **paired inputs**; copy contract into this readiness doc. |
| **IMPLEMENTATION_PLAN vs integration** | Plan allows extending `recommend.ts`; integration prefers **new itinerary module** + optional shared-core extraction with **lead handoff**. | **GW-E1B:** new pure module (e.g. `src/lib/plan-two-stop-legacy.ts`); **GW-E1A** only if lead authorizes shared extract without changing single-stop outputs. |
| **Facility-to-facility travel** | No `F→F` matrix cells; only `D→D`. | **Proposed demo policy (requires approval):** `t(A,B)` and `t(B,A)` use the **same legacy directed leg** as gate↔facility (`D→D` = 3 min), labeled `demo_estimate`, **not** measured indoor distance. |
| **Summing two single-stops** | Mathematically invalid (extra gate legs + extra buffer). | Forbidden; identity in GW-E design §2.3. |
| **Graph `route_unreachable`** | E design mentions; B graph is partial. | **Legacy GW-E1:** no `route_unreachable`; only ineligible / unknown / feasibility. |
| **G-Data vs hackathon desire** | PLAN requires G-Data before G-E. | Implementation **HOLD** unless lead **waives G-Data** for a labeled hackathon demo scope. |

---

## 2. GW-E1 scope proposal (D-Gates demonstration planner)

**In scope (GW-E1 legacy demo):**

- Input: validated **UserContext** (same as single-stop), **two distinct** facility IDs from the **12** eligible IDs, `productionTravelMinutes`, resolved durations map (GW-F), `useDemoTimeEstimates` flag.
- Evaluate **both orders** A→B and B→A with **three** directed travel legs each.
- **One** safety buffer `b` per itinerary (not per stop).
- **Two** queue and **two** activity terms (each resolved independently; `d` applied to each known queue).
- Output per order: ledger, `requiredMinutes`, `marginMinutes`, `feasible_in_model` | `tight_in_model` | `over_budget` | `unknown` | `ineligible`, provenance labels.
- **No** pair ranking across all 66 pairs in GW-E1 (selected pair only); enumeration spec deferred to GW-E2 / later.
- **No** UI (GW-E2).

**Out of scope:**

- Cross-terminal legs, graph search, new matrix values, eligibility expansion, live flight/queue data, physical routing UI.

---

## 3. Timing data: available vs missing

### 3.1 Supported today (legacy_zone)

| Leg | Model | Minutes | Confidence |
| --- | --- | --- | --- |
| Gate → facility A | `D→D` matrix lookup | 3 | `demo_estimate` |
| Facility A → gate | `D→D` | 3 | `demo_estimate` |
| Gate → facility B | `D→D` | 3 | `demo_estimate` |
| Facility B → gate | `D→D` | 3 | `demo_estimate` |
| **Facility A → facility B** | **No dedicated matrix key** | **Proposed:** reuse `D→D` = 3 each direction | **demo_estimate** (requires **G-E policy approval**) |
| Queue / activity | Per facility via GW-F | null unless demo on or user override | per resolver source |

### 3.2 Not available (must stay Unknown or out of scope)

- Measured gate-to-entrance or facility-to-facility walking times.
- Inter-terminal or A/G/E/F zone travel in production recommend scope.
- Official queue/wait at concessions (all records null).
- Triangle-inequality or “shortest path” between facilities — **not assumed**.

### 3.3 Demo-only facility-to-facility policy (human approval required)

**Proposal P-E-LEG-001:** For GW-E1 **legacy_zone** only, resolve `t(A,B)` and `t(B,A)` with the **same function** as `t(G,A)` — i.e. `resolveDirectedTravelLeg(matrix, "D", "D")` — and attach metadata note: *“Illustrative same-zone movement between distinct D Gates listings; not a surveyed path between those venues.”*

**If P-E-LEG-001 is rejected:** return **Unknown** (`missing_travel_outbound` or new reason `missing_inter_facility_leg`) for any order requiring A↔B until a reviewed leg exists.

---

## 4. GW-E1 TypeScript contract (implementation-ready, legacy mode)

Pure functions; new types in `src/types/two-stop-plan.ts` (or extend `airport.ts` **only with lead approval**).

```ts
import type {
  DataConfidence,
  Facility,
  FacilityDurationOverrideMap,
  ProductionTravelMatrix,
  RecommendationStatus,
  ResolvedFacilityDurations,
  UnknownReason,
  UserContext,
} from "@/types/airport";

/** Exactly two distinct recommend-eligible facility IDs in production scope. */
export type TwoStopSelection = readonly [facilityId: string, facilityId: string];

export type TwoStopTravelLegKind =
  | "gate_to_stop"
  | "stop_to_stop"
  | "stop_to_gate";

export type TwoStopTravelLeg = {
  kind: TwoStopTravelLegKind;
  fromFacilityId: string | "gate";
  toFacilityId: string | "gate";
  minutes: number | null;
  timeConfidence: DataConfidence;
  provenanceNote: string;
};

export type TwoStopVisitStop = {
  facilityId: string;
  facilityName: string;
  queueMinutes: number | null;
  activityMinutes: number | null;
  queueSource: ResolvedFacilityDurations["queueSource"];
  activitySource: ResolvedFacilityDurations["activitySource"];
};

export type TwoStopOrderLedger = {
  order: TwoStopSelection; // ordered visit sequence
  legs: readonly [TwoStopTravelLeg, TwoStopTravelLeg, TwoStopTravelLeg];
  stops: readonly [TwoStopVisitStop, TwoStopVisitStop];
  bufferMinutes: number;
  requiredMinutes: number | null;
  marginMinutes: number | null;
};

export type TwoStopOrderResult =
  | {
      kind: "feasibility";
      status: RecommendationStatus; // feasible | tight | over_budget only
      ledger: TwoStopOrderLedger & {
        requiredMinutes: number;
        marginMinutes: number;
      };
    }
  | {
      kind: "unknown";
      unknownReason: UnknownReason;
      ledger: TwoStopOrderLedger;
    }
  | {
      kind: "ineligible";
      reason:
        | "duplicate_selection"
        | "outside_recommend_eligibility"
        | "outside_supported_zone"
        | "passenger_not_airside"
        | "security_zone_unknown"
        | "security_zone_pre_only";
    };

export type TwoStopPairEvaluation = {
  facilityIds: TwoStopSelection; // canonical sorted pair for display key only
  orderAB: TwoStopOrderResult;
  orderBA: TwoStopOrderResult;
  /** Lower required minutes among complete feasibility results; null if none complete. */
  bestModeledOrder: "AB" | "BA" | null;
  travelMode: "legacy_zone";
  modelDisclaimer: string;
};

export type PlanTwoStopLegacyInput = {
  context: UserContext;
  selection: TwoStopSelection;
  facilities: readonly Facility[]; // normalized, zero validation errors
  travelTimes: ProductionTravelMatrix;
  resolvedByFacilityId: ReadonlyMap<string, ResolvedFacilityDurations>;
  useDemoTimeEstimates: boolean;
  durationOverrides: FacilityDurationOverrideMap;
  /** When false, t(A,B) unknown unless policy P-E-LEG-001 approved. */
  allowDemoInterFacilityLeg: boolean;
};

export function validateTwoStopSelection(
  selection: TwoStopSelection,
  facilities: readonly Facility[],
  context: UserContext,
): TwoStopOrderResult | null; // null => OK to evaluate

export function evaluateTwoStopPairLegacy(
  input: PlanTwoStopLegacyInput,
): TwoStopPairEvaluation;
```

**Classification:** reuse `classifyMargin` semantics (≥10 / 0–9 / &lt;0) on computed margin only — **do not duplicate thresholds in UI**.

**What-if (GW-E1 compatibility):** expose `evaluateTwoStopPairLegacy` twice with baseline vs scenario `UserContext`; compare margins and status like `what-if-present.ts` — **no separate engine**.

---

## 5. Unknown and time-calculation policies

| Situation | Policy |
| --- | --- |
| Same facility twice | `ineligible` / `duplicate_selection` — no evaluation. |
| Browse-only or non-D facility | `ineligible` — do not coerce. |
| Missing queue or activity | `unknown`; partial ledger allowed; **no** partial `requiredMinutes`. |
| Missing any travel leg | `unknown` with leg-specific reason. |
| P-E-LEG-001 off | A↔B legs unknown → entire order unknown. |
| Invalid numeric / unsafe integer | `unknown` `invalid_numeric_input`. |
| Buffer | Exactly **once** at end of sum; never per stop. |
| Queue adjustment | Apply `d` to **each** known queue; two stops ⇒ up to **2×d** margin impact. |
| Negative margin | `over_budget` — do not clamp display to zero. |
| Provenance | Every leg `demo_estimate` in legacy mode; mixed user/demo/unknown sources listed per stop. |

---

## 6. Regression test matrix (GW-E1)

| ID | Scenario | Expected |
| --- | --- | --- |
| T-E1-01 | Valid A,B demo on; T=50, b=10, all legs 3, q=8, a=10 | AB: R=3+8+10+3+8+10+3+10=**55**, M=**-5** → over_budget |
| T-E1-02 | Same inputs, reverse order BA | Same R (symmetric demo legs) |
| T-E1-03 | T=55 → M=0 | `tight_in_model` |
| T-E1-04 | T=65 → M=10 | `feasible_in_model` |
| T-E1-05 | Duplicate ID in selection | ineligible |
| T-E1-06 | Browse-only facility ID | ineligible |
| T-E1-07 | Demo off, null queue | unknown both orders |
| T-E1-08 | `d=+7`, two known queues | Margin **−14** vs `d=0` (C15 / E design) |
| T-E1-09 | `allowDemoInterFacilityLeg: false` | unknown if A↔B required |
| T-E1-10 | Identity: R_A+R_B−R_AB = t(B,G)+t(G,B)+b−t(A,B) with demo 3s | Documented **13** when b=10 |
| T-E1-11 | Determinism: duplicate calls | Bit-identical JSON |
| T-E1-12 | **Regression:** existing `recommend.test.ts` full suite | **Unchanged** |
| T-E1-13 | What-if: scenario T−7 vs baseline | Margin delta −7, paths unchanged |

**Adversarial catalog (apply at implementation):** GW-E design **E01–E55** and integration **N01–N07**, **I01–I25** — prioritize **E06–E09** (unknown legs), **E15** (buffer once), **E22** (no sum of singles), **N03** (layer vs leg unknown), **C15** (queue arity). Graph-only cases deferred until graph mode authorized.

---

## 7. Implementation work packages

### GW-E1A — Shared timing helpers (optional, lead-gated)

- Extract **only** if lead approves handoff: `classifyMargin`, `resolveAdjustedQueueMinutes`, safe sum helpers into `src/lib/time-budget-core.ts`.
- **Acceptance:** `recommend.test.ts` + GW-F tests **byte-identical outcomes**; no export surface change to `recommendFacilities`.

### GW-E1B — Two-stop planning engine (Support Codex)

- Files: `src/types/two-stop-plan.ts`, `src/lib/plan-two-stop-legacy.ts`, `src/lib/plan-two-stop-legacy.test.ts`.
- Implement contract §4; wire **P-E-LEG-001** via flag default **false** until G-E approves policy.
- **Acceptance:** Test matrix §6; `npm test`; no UI; no `facilities.json` edits.

### GW-E2 — Two-stop UI (Lead, separate authorization)

- `PlanScreen` / session: pair picker, order comparison, disclaimers, What-if hooks.
- **Depends on:** GW-E1B accepted + **G-E** UI slice approval.

---

## 8. Risks and unresolved decisions

| Risk | Mitigation |
| --- | --- |
| Judges interpret demo A↔B=3 min as real walking | UI copy + manifest disclaimer; policy P-E-LEG-001 explicit. |
| Shared-core extract breaks single-stop | GW-E1A optional; default duplicate logic in E module only if extract blocked. |
| `recommendEligible ?? true` in engine | E must use **validated** facilities only; never raw JSON. |
| G-Data HOLD vs hackathon timeline | Lead waiver or complete G-C0 before G-E. |
| Scope creep to 66-pair ranking | Defer to GW-E2+; GW-E1 = **selected pair** only. |
| UX branch interference | No edits on `feature/gw-ux-polish`; E work branches from `main`. |

**Unresolved (need human decision):**

1. Approve **P-E-LEG-001** (demo inter-facility D→D) vs Unknown for A↔B.  
2. Waive **G-Data** for demo-only E vs strict PLAN §13 sequence.  
3. Approve **GW-E1A** shared extract vs self-contained E module.  
4. Whether to vendor `GW-E-two-stop-planner-design.md` onto `main` as reference doc.

---

## 9. Proposed G-E authorization scope (for human signature)

When the Engineering Lead issues **G-E**, it should **explicitly** authorize **only**:

| Authorized | Not authorized |
| --- | --- |
| GW-E1B pure module + tests on a feature branch | Merge to `main` / production deploy (separate gate) |
| Legacy `legacy_zone` travel adapter per §3 | Phase B graph, new matrix numbers, cross-terminal recommend |
| Selected-pair evaluation (12 eligible IDs) | All-pairs ranking UI, eligibility changes |
| Policy flag for P-E-LEG-001 per decision §8 | Changing `recommend.ts` semantics without lead review |
| GW-E2 design spikes **only** if listed in same G-E letter | GW-E2 implementation without second approval |

**Preconditions checklist (record at authorization time):**

- [ ] GW-F3 shipped (done on `main`)  
- [ ] G-Data: **HOLD** — waive or complete (G-X3 done; G-B1 scoped done; **G-C0** per roadmap)  
- [ ] P-E-LEG-001 decision recorded  
- [ ] Support Codex branch from approved contract commit  
- [ ] Regression budget: `recommend.test.ts` + E2E unchanged for single-stop  

---

## 10. Skills applied (this task)

| Skill | Application |
| --- | --- |
| **ui-ux-pro-max** | UX search run (no DB hit for query); applied accessibility/don’t-use-color-alone guidance to §6–7 (legends/labels in future GW-E2). Planning-only — no UI edits. |
| **test-driven-development** | §6 test matrix defined **before** implementation; adversarial IDs mapped to future `plan-two-stop-legacy.test.ts`. |
| **systematic-debugging** | Not used for defects (no code changes); used reconciling doc/code **drift** (SHA, missing GW-E file on main). |
| **verification-before-completion** | `origin/main` fetched @ `8d7b9f`; branch isolation confirmed; no merge/deploy. |

---

## References

- Integration architecture: `docs/GW-B-GW-E-integration-architecture.md`  
- Walking policy: `docs/walking-time-policy.md`  
- GW-E design (off-main): commit `d32cdd969f443a967f4d7a376138f37f5b31a5bd`  
- Engine: `src/lib/recommend.ts`, `src/data/travel-times.ts`  
- Eligible IDs: `src/lib/gw-x-002-batch-1.test.ts` (`LEGACY_RECOMMEND_IDS`)
