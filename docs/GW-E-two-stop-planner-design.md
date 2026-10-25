# GW-E — Two-stop planner: mathematics, architecture, and adversarial verification

**Assignment:** Advanced GW-E research and algorithm design; documentation only. This is not authorization to execute GW-E1 or GW-E2.

**Author role:** Engineering Support Codex. **Review date:** 2026-10-25, America/New_York.

**Inspected baseline:** `47c07028e1eccb3515f8bd8bfddd80f1c90fccdd` (`origin/main`, fetched and matched to the requested baseline).

**G-E readiness: HOLD.** The arithmetic can support a small D-only demo estimator, but the approved roadmap also requires G-B1, G-C0, and separate human G-E authorization. A technically possible demo does not bypass those gates.

## 1. Scope, evidence, and decisions

Evaluate exactly two **distinct** selected facilities in both orders. Return all three directed travel legs, two queues, two activities, one final buffer, required minutes, remaining margin, and provenance. Preserve the single-stop API and all current GW-F semantics. Do not invent physical routes, airport distances, live availability, or security connections.

This design recommends exact enumeration, not reinforcement learning, a heuristic optimizer, or a new routing engine. At today's 12 recommendation-eligible facilities there are `12 × 11 / 2 = 66` unordered pairs and `132` ordered tours. A selected pair needs only two evaluations. Pair-wide discovery/ranking is specified for correctness analysis; the smallest initial product evaluates the pair selected by the traveler. Automatic pair suggestions require a separate UI scope decision.

### 1.1 Repository evidence inspected

Paths below refer to the baseline above; sections and symbols are more durable references than line numbers.

| Evidence | Observed contract / implication |
| --- | --- |
| [PLAN.md](../PLAN.md), §3–§5, §11, §13 | Two distinct stops, both directions, one buffer; same-zone movement uses the matrix. Latest gates are G-F3 + G-Data (G-X3 + G-B1 + G-C0) + G-E. |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md), Optional P1 and Phase D | GW-E1 is pure logic/tests; latest Phase D assigns Support Codex, GW-E2 assigns Lead. Earlier owner entries are historical. Research does not update task status. |
| [AGENTS.md](../AGENTS.md) | Lead owns UI, shared contract changes, final merges and deployment. Independent documentation branch; no other worktree or AGENTS changes. |
| [GW-F-CONTRACT.md](GW-F-CONTRACT.md), §3–§6 | Per-field override precedence, queue adjustment after resolution, baseline countdown versus fixed scenario minutes, unchanged single-stop signature. |
| [airport.ts](../src/types/airport.ts) | `Zone` spans A–G for discovery; `RecommendScopeZone` remains D. `Facility` has separate browse/recommend flags. Unknown and ineligible are different result variants. |
| [travel-times.ts](../src/data/travel-times.ts) | Only `{ D: { D: 3 } }`; metadata explicitly labels every leg `demo_estimate`. No facility-node graph. |
| [recommend.ts](../src/lib/recommend.ts) | Directed lookups, security/scope checks, bounded input guards, exact integer sums, fixed thresholds. Shared helpers currently private; do not copy them into an E engine. |
| [strict-integer.ts](../src/lib/strict-integer.ts), [validate-context.ts](../src/lib/validate-context.ts), [validate-facilities.ts](../src/lib/validate-facilities.ts) | Strict integer parsing and 1,440-minute primitive limits; dataset normalization/eligibility; invalid context produces no usable context. |
| [resolve-facility-durations.ts](../src/lib/resolve-facility-durations.ts), [validate-duration-overrides.ts](../src/lib/validate-duration-overrides.ts) | Resolver assumes validated inputs; overrides use own keys and matching IDs; invalid entries are rejected in full, valid unrelated entries retained. |
| [recommend-facilities-with-personalization.ts](../src/lib/recommend-facilities-with-personalization.ts) | Ephemeral resolved facility copies call the original engine. Demo constants are 8 queue / 10 activity. Source dataset is not mutated. |
| [WhatIfSimulator.tsx](../src/components/WhatIfSimulator.tsx), [what-if-compare.ts](../src/lib/what-if-compare.ts) | Baseline and scenario are independent runs with the same facilities, override map, and demo toggle. Comparisons join by identity, not rank index. |
| [boarding-countdown.ts](../src/lib/boarding-countdown.ts), [running-countdown-tick.ts](../src/lib/running-countdown-tick.ts), [countdown-baseline-recovery.ts](../src/lib/countdown-baseline-recovery.ts) | Absolute clock math, positive remaining time floored, expiry latched, rollback >5 seconds invalid, failure requires explicit recovery. |
| [gatewise-session.tsx](../src/context/gatewise-session.tsx), [RecommendationsScreen.tsx](../src/components/screens/RecommendationsScreen.tsx) | Invalid dataset, context, personalization drafts/rejected overrides, or recovery-required state suppress recommendations and What-if. Preserve these gates for E. |
| [GW-X-004 report](GW-X-004-integration-regression-report.md) | G-X3 approval recorded; historical production checks and 631 tests reported. This study separately reruns tests; it does not repeat production smoke. |

The baseline contains 26 source-linked facility records and 12 eligible D Gates records. All record queues/activities are null. These are repository observations, **not a fresh verification of each SFO listing**. Older baseline SHAs/headings in AGENTS, PLAN, and REMAINING_ROADMAP are historical; no unrelated documentation corrections are included here.

### 1.2 Findings that determine the design

1. Two single-stop totals cannot be added: that counts four travel legs and two buffers rather than three legs and one buffer.
2. A boarding area is not a physical location. Distinct facilities in D still require a D→D intermediate leg (3 demo minutes today).
3. A global queue adjustment is **per visited facility**. With two known unclamped queues, +7 minutes reduces the route margin by 14 minutes, not 7.
4. A known order can be shown when the reverse is unknown; it is only the **best modeled order**, not a proven better physical route.
5. Verified location/hours never promote estimated travel or user-supplied service durations to verified time.
6. Current numeric safety is stricter than older prose saying merely “finite integer.” Preserve the implemented 0–1,440 primitive range and signed adjustment range.
7. Phase B must own path finding, endpoint mapping, access policy, and edge evidence. E consumes directed leg results; it never reconstructs paths from gate names or straight-line distance.

## 2. Mathematical model and invariants

### 2.1 Definitions

Let G be the starting/return gate endpoint, and A and B two different normalized facility IDs. IDs are case-sensitive. Facility identity, graph-node identity, boarding area, and terminal identity are different concepts.

For one immutable model snapshot:

- `T`: whole minutes until boarding **starts**, from validated manual input or the accepted countdown tick.
- `b`: one final safety buffer, a nonnegative integer.
- `t(X,Y)`: directed travel minutes supplied by the routing adapter for this snapshot and passenger policy. It may instead be unknown or prohibited.
- `q_i`, `a_i`: resolved queue and activity minutes at stop i, independently resolved under GW-F1.
- `d`: `context.queueAdjustmentMinutes`, a signed integer, applied to each known queue once.
- `Q_i(d) = max(0, q_i + d)` if `q_i` is known and valid. If `q_i` is unknown, `Q_i` is unknown, regardless of d.

For complete, permitted inputs:

```text
R_AB = t(G,A) + Q_A(d) + a_A + t(A,B) + Q_B(d) + a_B + t(B,G) + b
R_BA = t(G,B) + Q_B(d) + a_B + t(B,A) + Q_A(d) + a_A + t(A,G) + b
M_AB = T - R_AB
M_BA = T - R_BA
```

For either order, `M >= 10 → feasible_in_model`, `0 <= M < 10 → tight_in_model`, and `M < 0 → over_budget`. The 10-minute classification threshold is additional margin **after** the buffer; never add it to R or subtract it twice. These are model classifications, not probabilities or flight-catching guarantees.

If any essential travel, queue, or activity value is unknown/invalid, both `requiredMinutes` and `marginMinutes` are null for that order. Retain known components for explanation, but do not display a partial sum as a total. A proven access prohibition is ineligible, not a very long finite duration and not a zero-duration edge.

### 2.2 Budget conservation proof

For order AB, define the chronological remaining budget after each component:

```text
B0 = T
B1 = B0 - t(G,A)
B2 = B1 - Q_A
B3 = B2 - a_A
B4 = B3 - t(A,B)
B5 = B4 - Q_B
B6 = B5 - a_B
B7 = B6 - t(B,G)
B8 = B7 - b = M_AB
```

Each term appears exactly once with coefficient −1; induction on the eight steps gives `B8 = T - R_AB`. Every duration is nonnegative, so the sequence cannot increase. The same proof applies to BA. T is neither reset on arrival at B nor independently granted to both stops. The final buffer cannot be spent on an activity and also counted as remaining margin.

The implementation should sum complete components with checked integer arithmetic and subtract once, rather than maintaining mutable “remaining time” between two calls. This proof is an independent oracle for the ledger, not an instruction to create a second mutable algorithm.

### 2.3 Why summing single-stop recommendations is incorrect

For complete single-stop totals `R_A` and `R_B` under the same assumptions:

```text
R_A + R_B - R_AB = t(A,G) + t(G,B) + b - t(A,B)
```

Thus `R_A + R_B` is not generally R_AB. In today's D demo with `b=10`, the difference is `3+3+10−3=13`. Even subtracting one buffer leaves two extra gate-connected legs in place of the intermediate leg. This identity is useful for tests only; calculate E directly from its three legs. Never derive an unknown intermediate edge from the other legs.

There is no assumed triangle inequality for the demo matrix. A pair need not cost more than either standalone tour on an arbitrary directed input. For example, synthetic `t(G,A)=2, t(A,G)=100, t(A,B)=2, t(B,G)=2`, zero visits/buffer gives single A =102 but AB=6. Therefore, excluding A merely because its standalone recommendation is over budget can wrongly exclude a valid pair. Complete shortest-path distances on one consistent, static, unrestricted metric closure have stronger properties; the current matrix contract does not promise them.

### 2.4 Further invariants and proof obligations

| Invariant | Argument / required behavior |
| --- | --- |
| Directed travel | AB reads GA, AB, BG; BA reads GB, BA, AG. Never infer an edge from its reverse. |
| One visit per ID | `A.id !== B.id` before route lookup; one queue and one activity per stop. Repeated selection is an input error, not a free second stop. |
| Same-area movement | Distinct endpoints sharing D still look up D→D. Graph same-node zero is permitted only under an explicit endpoint/co-location policy, never because zones match. |
| Single buffer | Buffer is outside the stop loop and path provider; ledger has exactly one b. |
| Time monotonicity | For fixed complete inputs, changing T by k changes M by k and never changes R. Decreasing T cannot improve classification. |
| Duration monotonicity | Increasing one nonnegative component by k increases R by k and reduces M by k, while within the supported input domain. |
| Queue monotonicity | `max(0,q+d)` is nondecreasing in d; increasing d cannot improve any known order. |
| Order cost difference | `R_AB−R_BA = t(G,A)+t(A,B)+t(B,G)−t(G,B)−t(B,A)−t(A,G)`. Queues, activities, T, and b cancel. |
| No order switch from shared service changes | With static paths and the same pair, shared queue adjustment or per-facility overrides cannot change which travel order costs less; ties use a stable key. A change suggests state mixing or a bug. |
| Unknown preservation | Null has no arithmetic identity here. An unknown may become known only from an explicit accepted override, enabled demo assumption for a service field, or routing evidence/policy. |
| Honest quantification | One feasible modeled order proves only that one order is feasible in this model. One over-budget order plus one unknown order cannot prove every possible order over budget. |
| Pure evaluation | Identical validated inputs and routing snapshot yield identical output. No clock/network/storage reads and no input mutation inside the evaluator. |

## 3. Safety, numeric bounds, and uncertainty policy

### 3.1 Eligibility and identity

Use normalized facilities from `validateFacilities` / `prepareProductionFacilities`; require zero dataset errors, as the current session does. The validator may retain a first duplicate row while reporting an error; do not treat that retained subset as a clean planner dataset. Reject ambiguous duplicate IDs before constructing a registry. Never deduplicate by facility name (different branches may share a name).

Preserve current eligibility policy: passenger post-security; gate scope D; each stop in the authorized D recommendation scope with `recommendEligible=true`; security `post` or `both`. `browseEligible` alone is never enough. Validated location fields must agree; do not bypass normalization with a raw object claiming D while its boarding area/terminal differs. Unknown facility security remains the existing explicit ineligible reason, not silently post-security.

For a selected pair, return a diagnostic if either selection is outside scope rather than silently dropping it and showing a one-stop result. Candidate discovery can filter ineligible rows before enumeration and report exclusion counts. `context.category` retains “applies to each candidate” behavior; a selected facility failing it is explicitly `selection_filtered_out`, not replaced. No implicit “coffee first, restroom second” category rule is added.

### 3.2 Travel result policy

| Input/evidence | Order result |
| --- | --- |
| All three directed legs permitted and numeric; both visits complete | Feasibility with full breakdown and component provenance. |
| Missing key, null, unresolved gate/facility endpoint, absent measured estimate | Unknown; leg-specific reason, null total/margin. |
| Negative, fractional, nonfinite, unsafe, or >1,440-minute primitive leg | Unknown `invalid_numeric_input`; do not clamp or replace. |
| Access restriction explicitly forbids a required segment | Ineligible for that order with `route_prohibited`. No route workaround in E. |
| No path found in an incomplete graph | Unknown `routing_coverage_unknown`; absence of data is not evidence of physical disconnection. |
| No path in a policy-complete supported graph, as certified by Phase B | Ineligible `route_unreachable`; Phase B must distinguish this from incomplete coverage. |
| Both facilities share a broad graph anchor | No automatic zero. Phase B must include last-meter access legs or return unknown. |
| Explicit zero leg | Accepted only with a documented zero-motion endpoint/co-location basis; a zero number without that basis is unknown. |

For the current adapter only, authorized D/post scope permits **demo model** legs under the existing policy. This is not a verified accessibility or real-world connectivity assertion. Every distinct-endpoint leg reads D→D and remains `demo_estimate`, including the intermediate movement. A new graph adapter must not silently fall back to D→D after a missing path; a fallback is a separately approved, visibly named model.

If an order has both missing information and a known prohibition, ineligible takes precedence, with all diagnostics retained. Evaluate the reverse independently; its edge may be permitted. Facility-level ineligibility applies to both orders.

### 3.3 Duration resolution and invalid overrides

Call the existing resolver independently for queue and activity:

1. Valid user override for this ID and field.
2. Else, if demo mode enabled, `DEMO_QUEUE_MINUTES=8` / `DEMO_ACTIVITY_MINUTES=10`.
3. Else the record's non-null field.
4. Else null/unknown.

Demo-on deliberately takes precedence over a record value for a field without an override; do not “fix” that ordering in E. Partial overrides do not imply zero for the other field. Apply d **after** resolution, once to each known queue, never to activity. Do not run a resolved or already adjusted queue back through the resolver.

`validateDurationOverrides` accepts numeric safe integers 0–1,440, not numeric strings. It rejects an entire invalid entry even when one field is valid, and preserves unrelated valid entries. The **session** currently rejects committing an override map with any error and suppresses results while drafts are invalid. E must retain this visible error/suppression behavior; it must not quietly use the validator's partial map and substitute demo values for a rejected edit. Direct typed callers that supply unvalidated/bad options must fail explicitly at the shared input boundary rather than hiding the error through fallback.

### 3.4 Numeric contract and precision

Reuse `parseStrictInteger`, `isModelSafeMinute`, and `safeIntegerSum`:

| Quantity | Allowed values / action |
| --- | --- |
| T, b, raw queue, raw activity, complete travel leg | Safe integer 0–1,440 inclusive. Null service/travel means unknown; it is not accepted for T/b. |
| d | Safe integer −1,440 through +1,440. |
| Derived adjusted queue | Safe integer 0–2,880. **Do not reapply the 1,440 primitive bound after addition.** |
| R, M | Checked sums/difference; do not cap total R at 1,440, floor M at zero, or clamp an over-budget plan to fit T. |
| Invalid context direct call | Shared context assertion throws `RangeError`, matching current engine behavior; normal UI uses `validateContext` before evaluation. |
| Invalid supplied duration / route result | Unknown diagnostic and null totals; numeric input must not be coerced. |

Maximum two-stop R under these bounds is `3×1440 + 2×2880 + 2×1440 + 1440 = 14400`. Therefore `−14400 <= M <= 1440` and every correctly bounded sum is exact. Keep checked arithmetic anyway: it guards direct callers and future contract drift. A raw queue of 1,441 is invalid, whereas a valid 1,440 queue plus d=1,440 legitimately yields 2,880.

JavaScript's `Number.isSafeInteger` restricts exact integer identity to magnitudes at most `2^53−1`; being finite alone is insufficient. [ECMAScript specification, Number.isSafeInteger and MAX_SAFE_INTEGER](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-number.issafeinteger).

Do not use epsilon-adjusted thresholds, `parseFloat`, bitwise coercion, or rounding of invalid user fractions. If Phase B measures seconds/fractional minutes, the Phase B policy must define the conversion before E consumes it. Recommended compatibility adapter: checked integer seconds, sum the full physical path first, then ceil its total seconds to a whole-minute **leg**; never floor travel. This is a proposal for GW-B-001 approval, not a change to today's minute contract. Repeated per-edge rounding can depend on graph subdivision; preserve the distinction between graph edges and the three planner legs.

### 3.5 Provenance and confidence

Keep per-leg `DataConfidence` and evidence references, plus per-stop `queueSource`, `activitySource`, original record `timeConfidence`, and `locationConfidence`. `user_override` is a duration source, not a new `DataConfidence` value. `official_record` means the resolver used the record; it does not prove its time was officially verified. Show the record's time confidence alongside that source.

Do not average confidence values or choose the “best” source to label the whole route. If any component is unknown, withhold totals. If any modeled component is a demo estimate, the plan must visibly include “contains demo estimates”; user inputs retain their own labels; third-party durations stay distinguishable. Only all-relevant-component official time evidence can support an all-official time label, and even that is not a guarantee. Location and published hours do not enter that promotion rule. Today every computed E route includes demo walking legs even with all four service fields supplied by the user.

Published opening hours remain informational. This model does not claim a facility will be open when visited, predict queues at arrival, or infer mobility accessibility. Time-dependent service windows require separate product/routing contracts.

## 4. Proposed TypeScript contracts and shared architecture

These are **proposed consumer contracts**, not new exports in this change and not a competing Phase B graph schema. Lead approves names/placement at GW-E1 handoff. Reuse imports from `airport.ts`, the GW-F wrapper options, and the existing validators.

### 4.1 Routing port (E consumes; Phase B owns adapters)

```ts
import type {
  DataConfidence, Facility, IneligibilityReason, PassengerSecurityArea,
  RecommendationStatus, RecommendScopeZone, ResolvedFacilityDurations,
  UserContext,
} from "@/types/airport";
import type {
  RecommendFacilitiesWithPersonalizationOptions,
} from "@/lib/recommend-facilities-with-personalization";

type Endpoint =
  | { readonly kind: "gate"; readonly gateZone: RecommendScopeZone;
      readonly gateId?: string } // omitted = representative area, not a precise gate
  | { readonly kind: "facility"; readonly facilityId: string };

type TravelFailure =
  | "missing_travel" | "endpoint_unmapped" | "routing_coverage_unknown"
  | "access_unknown" | "invalid_numeric_input" | "zero_motion_unproven"
  | "routing_contract_mismatch";

type TravelEvidence = {
  readonly model: "zone_demo" | "directed_graph";
  readonly timeConfidence: Exclude<DataConfidence, "unknown">;
  readonly sourceRefs: readonly string[]; // URL or versioned repository policy
  readonly accessBasis: "authorized_demo_scope" | "verified_policy";
  readonly zeroMotionBasis?: "same_physical_endpoint";
};

type DirectedLeg = {
  readonly from: Endpoint;
  readonly to: Endpoint;
} & (
  | { readonly kind: "known"; readonly minutes: number;
      readonly evidence: TravelEvidence }
  | { readonly kind: "unknown"; readonly minutes: null;
      readonly reason: TravelFailure }
  | { readonly kind: "ineligible"; readonly minutes: null;
      readonly reason: "route_prohibited" | "route_unreachable";
      readonly sourceRefs: readonly string[] }
);

type DirectedRoutingSnapshot = {
  readonly revision: string; // includes data, access and rounding-policy versions
  readonly getLeg: (request: {
    readonly from: Endpoint;
    readonly to: Endpoint;
    readonly passengerSecurityArea: PassengerSecurityArea;
  }) => DirectedLeg;
};
```

`getLeg` is pure over an already loaded immutable snapshot; no asynchronous fetch or clock access in the calculation. It must echo the requested endpoints, use the same passenger policy for all legs, and return validated directed results. Unknown confidence cannot accompany a known duration. Graph internals/path geometry can stay behind this port; E only needs auditable leg results. Inconsistent endpoints/revision or invalid known-leg evidence becomes an unknown `routing_contract_mismatch`, normalized with the requested endpoints and null minutes, never a usable zero/default. Known evidence needs a nonempty source-reference list; a numeric zero also needs `zeroMotionBasis`. If future routing needs a richer security/mobility state, Phase B must extend the port explicitly.

### 4.2 Evaluation and result contracts

```ts
type StopLedger = {
  readonly facilityId: string;
  readonly resolved: Readonly<ResolvedFacilityDurations>; // before queue delta
  readonly effectiveQueueMinutes: number | null;
  readonly locationConfidence: DataConfidence;
  readonly recordTimeConfidence: DataConfidence;
};

type OrderIssue = {
  readonly at: "selection" | "outbound" | "intermediate" | "return"
    | "stop0.queue" | "stop0.activity" | "stop1.queue" | "stop1.activity"
    | "total";
  readonly code: IneligibilityReason | TravelFailure
    | "route_prohibited" | "route_unreachable"
    | "missing_queue_estimate" | "missing_activity_estimate"
    | "selection_filtered_out";
};

type OrderLedger = {
  readonly order: readonly [string, string];
  readonly routingRevision: string;
  readonly legs: readonly [DirectedLeg, DirectedLeg, DirectedLeg];
  readonly stops: readonly [StopLedger, StopLedger];
  readonly minutesUntilBoarding: number;
  readonly queueAdjustmentMinutes: number;
  readonly bufferMinutes: number; // single field, never per stop
};

type OrderResult =
  | { readonly kind: "feasibility"; readonly ledger: OrderLedger;
      readonly status: Exclude<RecommendationStatus, "unknown">;
      readonly requiredMinutes: number; readonly marginMinutes: number }
  | { readonly kind: "unknown"; readonly ledger: OrderLedger;
      readonly issues: readonly OrderIssue[];
      readonly requiredMinutes: null; readonly marginMinutes: null }
  | { readonly kind: "ineligible";
      readonly order: readonly [string, string];
      readonly issues: readonly OrderIssue[];
      readonly ledger?: OrderLedger;
      readonly requiredMinutes: null; readonly marginMinutes: null };

type PairResult = {
  readonly kind: "pair";
  readonly pairKey: string; // JSON encoding of canonical sorted two-ID tuple
  readonly orders: readonly [OrderResult, OrderResult]; // canonical AB, then BA
  readonly bestModeledOrderIndex: 0 | 1 | null; // null if neither is numeric
};

type PairEvaluation = PairResult | {
  readonly kind: "invalid_selection";
  readonly reason: "duplicate_facility" | "facility_not_found"
    | "ambiguous_facility_id";
};

declare function evaluateTwoStopPair(input: {
  readonly context: Readonly<UserContext>;
  readonly facilities: readonly Facility[]; // validated, unique registry
  readonly selectedIds: readonly [string, string];
  readonly gate: Extract<Endpoint, { kind: "gate" }>;
  readonly routing: DirectedRoutingSnapshot;
  readonly personalization: Readonly<RecommendFacilitiesWithPersonalizationOptions>;
}): PairEvaluation;
```

Runtime preconditions remain necessary despite TypeScript: validate context/options first, registry uniqueness and selection identity second, then scope/security, duration resolution, and three directed legs per order. `gate.gateZone` must match the context; an unrecognized supplied `gateId` is unmapped, not silently ignored. `OrderResult.kind="feasibility"` requires every ledger leg and service field to be complete/valid and every issue list to be empty; the implementation must enforce this even though the compact structural type alone cannot express all cross-field invariants. Unknown numeric fields are normalized to null for the ledger, with their field diagnostic retained.

Facility-level rejection can omit a ledger because no routing is needed. Path-level rejection can retain a ledger and multiple issues for explanation. Report issues in a deterministic field order: selection, outbound, intermediate, return, stop0 queue/activity, stop1 queue/activity, total. Do not extend the single-stop `UnknownReason` union just to force an intermediate-leg error into it; E has its own presentation shape while sharing semantic primitives.

### 4.3 One budget policy, two public adapters

```text
validated context + GW-F1 resolver + authorized facility eligibility
                              |
            shared numeric/queue/classification primitives
                    /                         \
single-stop adapter: 2 legs, 1 stop   two-stop adapter: 3 legs, 2 stops
                    \                         /
                   checked budget aggregation
                              |
            complete status OR explicit unknown/ineligible
```

The lead should expose/extract the existing context assertion, adjusted-queue calculation, margin classifier, and checked total/margin aggregation into a small framework-free internal module (proposed `recommend-model.ts`), and make B and E both call it. Preserve B's existing unknown-reason priority, partial-ledger behavior, category filtering, sorting, exception behavior, and public signature. Eligibility checks should also be shared rather than copied; E must not use the single-stop total/status as an eligibility oracle.

Keep `recommendFacilities(context, facilities, travelTimes)` and `recommendFacilitiesWithPersonalization(...)` unchanged. E reuses `resolveFacilityDurations` directly so its ledger retains field-level provenance. Do **not** call the personalization wrapper and then resolve/adjust again. Shared arithmetic accepts arrays internally, but the public E adapter must enforce exactly two distinct stops; this is not authorization for an arbitrary-stop product.

The common module and edits to `recommend.ts` / `airport.ts` need an explicit lead handoff. If that integration is not approved, hold E implementation instead of copying a second set of thresholds or editing owner files independently. GW-E2 remains lead-owned.

## 5. Phase B routing integration requirements

### 5.1 Today's D-only adapter

Resolve each facility ID against the validated registry. For G→A, A→B, and B→G, check the authorized D/post/recommend policy and read the corresponding directed D→D entry. Distinct facilities use 3 minutes each even if their published descriptions or nearest landmark match. Do not use `nearestGateLandmark` as a distance or coordinate. `gateId` is optional today because `UserContext` only describes a zone; if a precise-gate model is requested but unavailable, return unknown instead of presenting area data as precise.

Every leg carries the existing matrix metadata and versioned demo-policy evidence. Null D→D makes all three legs unknown. Demo-off affects service-time fallback, **not** travel-matrix provenance: known user service overrides plus demo-off still use demo walking legs. Keep that visible.

### 5.2 Consumer requirements for the independent Phase B work

This is a handoff for the human lead to reconcile with GW-B-R001/GW-B-001, not an instruction sent to the other agent.

| Phase B deliverable | Why E needs it / acceptance question |
| --- | --- |
| Stable endpoint mapping | Can a selected gate and each facility map to a physical access point, rather than just a boarding-area centroid? |
| Directed leg resolution | Can GA, AB, BG, GB, BA, AG differ independently? Are one-way links preserved? |
| Access-state contract | Do concatenated paths enter/leave the same security/access state at the shared facility endpoint? Facility `post` alone cannot authorize every connecting path. |
| Coverage vs disconnection | Is “unmapped / incomplete coverage” distinguishable from evidence-backed prohibited or unreachable routes? |
| Per-leg time and access evidence | Are measurement/estimate method, source references, checked dates/revisions, and any demo fallback retained? |
| Endpoint access cost | Does a path include getting from a corridor/node into and out of the actual facility, without charging its queue/activity? |
| Same-node/co-location policy | Does zero require evidence of no modeled movement, not merely a shared coarse anchor? |
| Units and rounding | Are nonnegative exact units validated, path duration rounded once per planner leg, and unsupported >1,440 minute legs handled explicitly? |
| Snapshot/cache policy | Can all six queries use one revision and access policy; can stale results be rejected after gate/policy/model changes? |
| Deterministic route choice | Equal-cost physical paths return deterministic evidence/path identifiers without E knowing graph internals. |

Independent shortest paths concatenate safely only if the graph state is sufficient: static additive travel costs, a consistent endpoint/access state at each stop, and no hidden history-dependent constraint. Otherwise Phase B must expose stateful routing or report unsupported; E cannot assume three individually reachable segments compose. Walking through a facility's mapped vicinity does not count as completing a queue/activity there, and E does not forbid passing a selected facility before visiting it.

E does not execute Dijkstra/A*, infer a missing leg by summing other route calls, add security queues, or synthesize reverse edges. A graph provider may find a permitted multi-edge path even when no direct graph edge exists; a null direct edge alone does not imply no path. Any graph search lives in Phase B.

For a nonnegative weighted graph, Dijkstra is an appropriate baseline; BFS minimizes hops rather than duration. Missing edge weights must not inherit a library default (for example, NetworkX documents a default weight of 1 for a missing weight attribute). These are routing-provider concerns, not a recommendation to add NetworkX to this TypeScript app. [NetworkX shortest-path documentation](https://networkx.org/documentation/stable/reference/algorithms/shortest_paths.html).

### 5.3 Known boundaries

The proposed port supports static directed durations. Time-dependent edge closures, changing queues at arrival, security transitions requiring new passenger states, mobility profiles, and opening-time windows are future contracts. Do not label static paths as live. A graph implementation is not intrinsically required for a D-only demo; **approval of the Phase B representation policy and G-B1 is still required by the roadmap**.

## 6. Enumeration, ranking, filtering, and complexity

### 6.1 Selected pair

1. Validate the shared inputs and selected IDs; canonicalize by case-sensitive code-unit ID comparison, independent of display names/locale.
2. Resolve each facility's durations once for the snapshot. Apply d once per stop through the shared queue primitive.
3. Evaluate the canonical forward and reverse tours independently using three directed legs each.
4. Keep both results. Among numeric orders choose lower R (equivalently higher M), then canonical order key. If only one is numeric, select it as best **modeled** order. If neither is numeric, `bestModeledOrderIndex=null`.
5. Label ties honestly. On today's uniform D matrix, order cannot improve travel time: both tours cost 9 walking minutes. Tie-breaking is presentation stability, not a spatial recommendation.

Do not drop the reverse result just because the first is feasible. Do not turn two unknown orders into “0 minutes” or an arbitrary winner. If the best numeric order is over budget and its reverse is unknown, retain both facts rather than labeling the pair universally impossible.

### 6.2 Pair discovery (optional later consumer)

Apply existing normalized text/category/zone filters and eligibility first; then enumerate `i < j`. Define a pair key as `JSON.stringify([minId,maxId])`, avoiding delimiter collisions and A/B versus B/A duplication. The same candidate set and pair keys must be used for baseline and scenario. Never rank only a selected single-stop “top N” subset and claim the best pair across all facilities.

Proposed ranking: best numeric feasible pair, then tight, then over-budget, then pairs with only unknown/ineligible orders but at least one unknown, then wholly ineligible pairs (normally filtered before discovery). Within a numeric class, higher best-order margin first; within ties, canonical pair key, then canonical order key. No hidden popularity score, confidence average, category preference, or locale-dependent name tie-breaker. Surface provenance separately. This is a proposed E tie policy; do not change B's existing name/ID locale sort.

All-unknown candidates remain inspectable with reasons. No-match/less-than-two eligible candidates produces an empty pair list with an explanatory count, not a fake route. Discovery filters do not silently remove a stop from an already selected plan; invalidate or explain a filtered selection explicitly.

### 6.3 Complexity and safe optimization boundaries

| Operation | Cost under constant-time leg lookup |
| --- | --- |
| Evaluate one selected pair after registry creation | O(1) arithmetic and six directed lookups; O(1) result space. Registry creation/validation is O(n). |
| Enumerate every pair | O(n²) evaluations, `n(n−1)` orders. |
| Sort every pair | O(n² log n), O(n²) result space. |
| Maintain only top k (future, if justified) | O(n² log k), O(k) retained results; explanations still need a defined retrieval policy. |
| Today's eligible n=12 | 66 pairs, 132 orders; naive 396 leg calls, at most `n(n−1)+2n=156` distinct endpoint-to-endpoint queries. |

If a leg query costs L, naive evaluation is O(n²L). Phase B can cache per snapshot/policy/endpoint pair or run shortest paths from G and each candidate once; with a binary-heap Dijkstra implementation this is O((n+1)(V+E) log V) plus O(n²) lookups/output. Graph work and path evidence storage can dominate arithmetic; include graph size/path length in performance claims. Do not share caches across revisions/access policies.

These bounds assume one O(n) preparation pass for the unique-ID registry, eligibility, and resolved durations, followed by an internal evaluator over that prepared snapshot. The public selected-pair wrapper includes that O(n) setup when called alone. An optional all-pair enumerator must reuse the same internal evaluator and preparation; repeatedly rebuilding the registry for every pair would instead introduce O(n³) work. This is shared evaluation, not a second pair-ranking engine.

No pruning is needed for 12 candidates. Safe structural pruning removes identical IDs, out-of-scope/ineligible facilities, and explicit user-filter mismatches. Missing duration does **not** justify silently deleting a requested pair. A known partial sum may be an internal lower bound for an optional over-budget-only search, but it cannot convert an unknown order into a complete `over_budget` result or rank an incomplete total. Do not prune pairs using standalone status or assumed triangle inequalities. Gate “top k” optimization behind a measured need.

### 6.4 Future three-or-more-stop work

For a fixed k distinct stops, permutation enumeration costs O(k!·k), with `k+1` legs, k visits, one buffer. Choosing any ordered k stops from n gives `n!/(n−k)!` candidates before aggregation. For larger fixed sets, subset dynamic programming can reduce a static additive shortest-tour calculation to O(k²·2^k), but access/time windows change the state space. These are analysis directions only. No 3+ stop API, rewards, learned policy, or new optimization dependency is authorized. Two choices with transparent arithmetic do not need training data, exploration, or a learned safety policy.

## 7. What-if, countdown, and snapshot isolation

Call `evaluateTwoStopPair` twice with a common immutable facility/override/routing snapshot and two independently validated contexts. Baseline uses the accepted countdown/manual T; scenario uses the fixed scenario minutes control. Both use the same buffer, gate, demo flag, saved overrides, and selected pair. Only existing What-if controls change scenario T and d. Editing a scenario cannot mutate saved overrides, baseline context, or source records.

Join comparisons by canonical pair key **and ordered ID tuple**, never by result position in independently sorted lists. Show per-order before/after totals and margins. A best-to-best summary may be added, but if order/model/selection changes, label that difference rather than attributing it solely to queue/time input. Under this static model and the same pair, service-only changes cannot flip the preferred order (proved in §2.4).

For a fixed complete order with unchanged travel, activities, and buffer:

```text
M_s - M_b = (T_s - T_b)
            - [max(0,q_A+d_s) - max(0,q_A+d_b)]
            - [max(0,q_B+d_s) - max(0,q_B+d_b)]
```

If either side is unknown/ineligible, numeric delta is null; compare reasons and known components, not `null ?? 0`. A demo toggle changes both runs. A clock tick updates only baseline T; fixed scenario output stays numerically unchanged while the comparison delta can change.

### 7.1 Countdown integration obligations for GW-E2

- Use the existing shared countdown pipeline and explicit supplied context; do not create a second E timer or call `Date.now()` inside pure calculations.
- For positive remaining time, 90 seconds → 1 minute; 59 seconds → 0 minutes with `boardingStarted=false`; exact/past start → 0 with `boardingStarted=true`. A 0-minute display alone does not prove actual expiry. Current session strip uses a simpler zero-display predicate; do not copy that predicate into algorithmic expiry semantics.
- With today's 9-minute travel and default buffer, expiry gives negative margin. In a synthetic all-zero model, T=R=0 still mathematically classifies tight; do not alter the frozen threshold. UI expiry state must prevent interpreting that synthetic label as permission to start travel.
- Preserve paused-time simulation semantics: paused milliseconds are frozen, resume shifts the target relative to resume time; label paused context. Do not silently implement an airline-clock deadline instead.
- `runRunningCountdownTick` keeps minutes nonincreasing, latches expiry, and rejects rollback beyond 5,000 ms. On failure, suppress E/What-if through `baselineRecoveryRequired`; never reuse old positive minutes until explicit recovery.
- Recompute on selection, gate, validated durations, demo flag, queue adjustment, buffer, baseline minute, dataset, routing revision, or access-policy change. Preserve selected IDs but not cached feasibility.
- On browser resume/visibility return or reopening Plan, obtain a current accepted tick before showing a prior live result as current. Manual and paused contexts remain explicitly user assumptions; do not auto-age manual time.
- For a future async routing fetch, tag requests with a snapshot generation containing context, selection, personalization, and routing revision. Discard out-of-order replies. Do not combine one old leg with two new legs, or show baseline and scenario from different model versions as an input-only comparison. No arbitrary “safe for N seconds” freshness promise is introduced.

## 8. Independent numerical examples

All numbers in this section are **synthetic test inputs or explicit existing demo assumptions**, not newly verified SFO walking times. Expected values are calculated below without calling an E implementation.

### 8.1 Current D-only model

Distinct D facilities A and B; each queue=8, activity=10, buffer=10, d=0:

```text
AB = 3 + 8 + 10 + 3 + 8 + 10 + 3 + 10 = 55
BA = 3 + 8 + 10 + 3 + 8 + 10 + 3 + 10 = 55
T=65: M=+10 feasible; T=64: M=+9 tight
T=55: M=0 tight; T=54: M=-1 over budget; T=50: M=-5 over budget
```

Omitting the intermediate leg gives 52 (wrong); adding two single-stop totals gives `34+34=68` (wrong); adding two buffers to the actual pair gives 65 (wrong). This fixture distinguishes all three errors. Single-stop behavior remains `3+3+8+10+10=34`, T=50 → +16 feasible.

### 8.2 Asymmetric directed endpoint fixture

Synthetic physical endpoints G, A, B, all assigned to the permitted D test scope. They are **not** extra production boarding areas.

| Leg | GA | AB | BG | GB | BA | AG |
| --- | --- | --- | --- | --- | --- | --- |
| Minutes | 4 | 6 | 5 | 9 | 2 | 7 |

Visits: A queue=3/activity=8, B queue=4/activity=6, buffer=10. Service total=21.

```text
AB: travel 4+6+5=15; R=15+21+10=46; T=56 → M=10 feasible
BA: travel 9+2+7=18; R=18+21+10=49; T=56 → M=7 tight
```

If AB is unknown, forward total/margin are null; reverse remains 49/+7. If AB is prohibited, forward is ineligible, reverse remains numeric. Do not mirror BA=2 into AB. A selected best order in this fixture has no connection to real SFO path facts.

### 8.3 Personalization and demo precedence

D legs 3/3/3, buffer=10, T=50, d=0, null record services:

- Override only A queue=2; demo on. A=(2,10), B=(8,10). R=`9+2+10+8+10+10=49`; M=+1 tight. A queue is user-supplied; other service fields are demo.
- Same override, demo off. A activity, B queue/activity remain unknown. Both route totals/margins are null; known A queue=2 remains visible.
- Demo off, complete overrides A=(0,5), B=(1,4). R=`9+0+5+1+4+10=29`; M=+21 feasible, **walking still demo**.
- Synthetic record A=(1,2), B=(3,4), no overrides. Demo off gives R=`9+1+2+3+4+10=29`; demo on deliberately gives 55. This tests the approved demo-before-record precedence.

### 8.4 What-if and clamp effects

Use §8.1 baseline T=70, d=0: R=55, M=15 feasible.

- Scenario T=70, d=+7: queues 15+15, R=69, M=1 tight; delta −14.
- Scenario T=60, d=+7: R=69, M=−9 over budget; delta −24 = −10 time −14 queues.
- Scenario T=70, d=−10: queues 0+0, R=39, M=31; delta +16, not +20.
- Distinct clamp case: base queues 2 and 8, activities 10/10, travel 9, buffer 10, T=60. Baseline R=49, M=11. d=−5 gives queues 0/3, R=42, M=18; delta +7, not +10.

### 8.5 Extreme valid inputs and overflow rejection

All three primitive legs=1,440, both queues=1,440, both activities=1,440, buffer=1,440, d=+1,440, T=1,440:

```text
adjusted queues = 2880 each
R = 4320 + 5760 + 2880 + 1440 = 14400
M = 1440 - 14400 = -12960 (over_budget)
```

This valid result must not become unknown just because R exceeds 1,440. In contrast, any primitive value `1e20`, `Infinity`, or 1,441 is invalid. Equal huge T and b cannot cancel to a misleading margin of zero; context validation rejects them before arithmetic.

## 9. Adversarial test matrix

These are proposed future acceptance tests, **not tests implemented or passed for GW-E in this assignment**. Use plain literal expected ledgers/margins, independent of production helpers. Fixture F is §8.1 (R=55); fixture D is §8.2 (R=46/49). Test unknown with strict `=== null`, not falsey assertions, and assert absence of feasibility status on nonnumeric variants.

| ID | Input / attack | Independent expected result |
| --- | --- | --- |
| E01 | F at T=65,64,55,54 | Both margins +10,+9,0,−1; feasible,tight,tight,over-budget. |
| E02 | F at T=50 | Both R=55, M=−5; exactly three leg entries, two visits, one buffer. |
| E03 | F, b=0, T=55 | R=45, M=10 feasible. Explicit zero is not defaulted to 10. |
| E04 | F, T=0 | R=55, M=−55; no defaulting to old manual T. |
| E05 | D at T=56 | AB 46/+10; BA 49/+7; forward best. |
| E06 | D with AB=null/missing key | AB unknown with intermediate issue; totals null; BA 49/+7. |
| E07 | D with AB explicitly prohibited | AB ineligible, BA 49/+7; no symmetry fallback. |
| E08 | D with GA=null | AB unknown outbound; BA remains 49/+7 because AG=7 exists. |
| E09 | D with BG=null | AB unknown return; BA remains 49/+7. |
| E10 | F with D→D=null | All three legs unknown in each order; no best modeled order. |
| E11 | F, two IDs and same landmark/area | Intermediate remains 3, R=55; no same-zone/coarse-node zero. |
| E12 | A selected twice, including two object instances with same normalized ID | `invalid_selection: duplicate_facility`; no route evaluation. |
| E13 | Missing ID / duplicate IDs in registry | `facility_not_found` / `ambiguous_facility_id`; no arbitrary first/last match. |
| E14 | A and B names equal but IDs differ | Valid distinct pair; stable ID tie-breaking. |
| E15 | Non-D browse row or recommendEligible=false | Ineligible; no widening because coordinates/route happen to exist. |
| E16 | Security pre/unknown, or runtime passenger not post | Explicit existing security/passenger ineligibility; cannot gain feasibility via overrides. |
| E17 | Unknown graph coverage versus certified unreachable | Unknown coverage vs ineligible route-unreachable, respectively; totals null in both. |
| E18 | Numeric known leg with unknown access or missing required evidence | Unusable; unknown/access or contract diagnostic, not feasibility. |
| E19 | All record services null, demo off, no overrides | Both unknown even though walking=9; per-stop missing queue/activity reasons. |
| E20 | Only A queue=2, demo on/off | 49/+1 at T=50 / both unknown, as §8.3. |
| E21 | Complete overrides A=(0,5), B=(1,4), demo off | 29/+21 at T=50; explicit 0 preserved, travel demo flag retained. |
| E22 | Record A=(1,2), B=(3,4), demo off/on | R=29 / R=55; source labels follow the toggle. |
| E23 | Invalid A queue with valid A activity; valid B entry | Validator discards all of A, keeps B; session suppresses both runs until correction; no demo fallback masking. |
| E24 | Inherited override, unknown ID, mismatching key/ID, prototype-like ID | Own-key and validator behavior preserved; no cross-facility override pollution. |
| E25 | F at T=70, scenario d=+7 | Baseline 55/+15; scenario 69/+1; delta −14. |
| E26 | F T=70 → scenario T=60,d=+7 | Scenario 69/−9; delta −24. |
| E27 | F T=70,d=−10 | 39/+31; queue clamp saves 16, not 20. |
| E28 | Queues 2/8, d=0 → −5; other §8.4 values | 49/+11 → 42/+18; delta +7. |
| E29 | Unknown queue, d=−1440 or +1440 | Queue and totals remain null; adjustment cannot manufacture knowledge. |
| E30 | d=±1440, primitive at 0 or 1440 | Inclusive bounds accepted; derived 2880 queue allowed; no wraparound. |
| E31 | §8.5 maximum valid components | R=14400, M=−12960; exact finite over-budget result. |
| E32 | T/b/d outside bounds, fractions, NaN/±Infinity, unsafe integers | Input error/RangeError for bypassed context, no computed result. |
| E33 | Leg/record time −1,1.5,1441,NaN,Infinity,1e20 | Affected order unknown/invalid numeric; null totals; no truncation. |
| E34 | Strings `1e2`,`0x10`,`50.0`, whitespace, boolean | Existing field-specific strict parsers reject; numeric strings accepted only where existing contract permits. |
| E35 | Inject invalid route evidence or reversed endpoint echo | Contract failure, never use apparently favorable minutes. |
| E36 | All-zero synthetic visits/legs/buffer with valid zero-motion evidence, T=10/9/0 | R=0; margins 10/9/0 classify feasible/tight/tight. Explicit zero test only, not a real-airport claim. |
| E37 | Shared graph node for distinct real locations without access legs | Unknown `zero_motion_unproven` or unmapped; not R reduced by 3. |
| E38 | Same input twice, deep-frozen fixtures | Deep-equal results; no mutation of context, dataset, options, route snapshot, or arrays. |
| E39 | Reverse selected input IDs and shuffle candidate list | Same pair key, same two directed order results, same best-order tie choice. |
| E40 | Case-different/Unicode IDs and delimiter-containing IDs | Identity preserved; JSON tuple keys collision-free; deterministic code-unit ordering. |
| E41 | F for every eligible pair with equal services | 66 unique pairs, 132 orders; deterministic ties; never 26-based eligibility expansion. |
| E42 | Fewer than two candidates / all unknown candidates | Empty enumeration with count / retained unknown pairs, best index null. |
| E43 | One known over-budget order and one unknown | Known over-budget plus unresolved reverse; no assertion all orders impossible. |
| E44 | Shared +queue adjustment or overrides on D | R_AB−R_BA remains −3; winning order cannot flip. |
| E45 | Baseline F T=65 tick→64; fixed scenario T=70,d=0 | Baseline +10→+9, scenario stays +15; no scenario clock tick. |
| E46 | Clock 90s/59s/exact start | T=1/0/0; boardingStarted false/false/true; old positive feasibility not retained. |
| E47 | Pause 10min, advance 5min, resume | Pause retains 10; resume starts at 10; later accepted tick decreases. |
| E48 | Rollback >5000ms, expiry latch, invalid timestamp, >24h target | Existing clock failure/recovery rules; no cached E results during recovery. |
| E49 | Late route reply after selected gate/overrides/revision changes | Reply ignored; never mixed-leg or mixed-baseline/scenario snapshot. |
| E50 | UI invalid personalization drafts, dataset error, invalid context | E/What-if suppressed like B; clearing a filter cannot bypass the gate. |
| E51 | All hypothetical changes leave original saved overrides and dataset frozen | No mutation; field source labels remain attached to matching ID. |
| E52 | Partial lower bound already exceeds T, another component unknown | Still unknown, not complete over-budget; no total from partial information. |
| E53 | Synthetic A standalone 102 but AB 6 (§2.3), T=20 | AB feasible margin 14; standalone pruning must not remove the pair. |
| E54 | Provider rounding: path with 20s+20s edges | Proposed Phase B adapter returns ceil(40/60)=1 minute, not 0 or 2; requires policy approval. |
| E55 | One buffer increases by k within range | Both order R increase k, M decrease k; never 2k. |

### 9.1 Property-based / metamorphic tests

Use bounded deterministic generators with recorded seeds and small synthetic directed graphs; a new test-library dependency is optional and requires lead approval. Suggested properties:

- Enumerating permutations of two distinct IDs yields exactly two unique orders. Enumeration over n unique IDs yields `n(n−1)/2` pair keys.
- An independent integer ledger oracle (e.g. BigInt in tests only) equals the literal component sum for all complete valid generated inputs. Do not call the shared total helper to manufacture expected values.
- Increasing T by k within bounds changes M by +k; increasing a leg or activity by k changes M by −k; changing b by k changes M by −k.
- Queue delta obeys the exact clamp equation in §7, including crossing zero. A positive global change k can increase total queue by at most 2k; it is exactly 2k when neither endpoint is clamped.
- Replacing any required known leg/service with unknown removes numeric totals; it never yields a better known margin. Resolving an unknown creates a newly modeled result rather than a zero-cost transition.
- Transpose all directed legs and reverse the order: the travel sum is preserved. Do not assert AB=BA in the original asymmetric graph.
- For a fixed pair, changing shared service values leaves the order cost difference unchanged. Across different pairs, queue clamping can legitimately change rankings.
- Input permutation, ID-preserving renaming of display names, and repeated evaluation do not alter canonical E ranking. Avoid changing B's pre-existing display-name sort.
- Source downgrade changes labels and/or completeness, never promotes confidence. Unknown/null has no numeric ranking surrogate.
- Snapshot invariants: compare a pair under identical baseline/scenario contexts → zero numeric deltas where known and identical nonnumeric reasons otherwise.

### 9.2 Existing regression protection

Before and after any future shared-helper extraction, run all existing suites and add explicit characterization tests for exact B return objects, sort order, unknown-reason precedence, and RangeError behavior. At least preserve:

- Production D single stop: R=34 at queue8/activity10/buffer10; T50 → +16 feasible; T44 → +10; T43 → +9; T34 → 0; T33 → −1.
- Illustrative hero: 7+7+8+10+10=42; T50/T35/T52 → +8/−7/+10. Illustrative D/E/F fixtures must never enter production routing.
- Directed single-stop asymmetric 7+11+8+10+10=46; unknown outbound versus return reasons unchanged.
- Numeric hardening, source/override precedence, same-zone diagonal behavior, dataset eligibility and existing 26-directory/12-recommend invariants.
- Countdown failure/recovery and nonincreasing ticks; What-if fixed minutes; immutable personalization; React integration and Plan placeholder behavior until GW-E2 approval.

Relevant existing suites include `recommend.test.ts`, `recommend.regression.test.ts`, `numeric-hardening.test.ts`, `strict-integer.test.ts`, `resolve-facility-durations.test.ts`, `validate-duration-overrides.test.ts`, `recommend-facilities-with-personalization.test.ts`, `what-if-compare.test.ts`, countdown suites, `gw-x-*`, and multipage/session integration tests. Existing numeric tests mentioning `MAX_SAFE_INTEGER` may hit the stricter primitive guard before sum overflow; test `safeIntegerSum` overflow independently to exercise that branch rather than assuming its test title proves it.

## 10. Dependencies, migration, and G-E decision

### 10.1 Capability separation

| Class | Capability | Conditions / limitation |
| --- | --- | --- |
| Safe with today's contracts after gates | Selected two-stop D-only **demo** estimate, both orders, one buffer, exact arithmetic | Existing D→D=3 per movement; no claim of preferred physical path. |
| Safe with today's contracts after gates | GW-F override resolution, What-if deltas, baseline countdown integration | Existing validation/recovery and immutable snapshots preserved. |
| Safe for research now | Synthetic directed-path fixtures and adversarial specifications | Never written into production airport data. |
| Blocked pending approval/integration | Shipping any GW-E implementation/UI | G-B1 + G-C0 + G-E; shared-helper/type handoff; then task-specific GW-E1/GW-E2 authorization. |
| Blocked on Phase B evidence/contracts | Precise gate/facility walks, defensible asymmetric physical orders, accessibility/access-aware routes | Endpoint mapping, directed graph/edge evidence, units, access-state and coverage policy. |
| Blocked separately even with a graph | Recommendations outside D | Separate explicit scope/eligibility approval; discovery expansion does not authorize it. |
| Proposed future extension | All-pair suggestions, 3+ stops, time windows, time-dependent queues, probabilistic risk | New requirements and tests; not part of GW-E1 minimum. |

### 10.2 Smallest safe implementation path after human G-E

This is a proposed handoff sequence, not automatic task dispatch:

1. **Lead contract handoff within GW-E1:** reconcile this routing port with accepted GW-B-001, record D-only model/unknown policy, ownership of common helpers, exact return shapes and integer units. Confirm G-Data and G-E evidence.
2. **Support GW-E1, isolated pure logic:** write the literal selected-pair tests first (both orders, ledger, boundaries, missing edges, overrides, numeric guards); use shared helpers through the authorized handoff. Deliver only selected-pair evaluation and the existing labeled adapter. No general optimizer or new data required.
3. **Lead review / Phase B adapter parity:** run current regression suites and adapter conformance fixtures. Preserve the original single-stop signatures, outputs, and D eligibility. Replacing a demo adapter with a graph later is an explicit model-version change, not an invisible result improvement.
4. **Lead GW-E2, separately dispatched:** integrate selected IDs into My Plan session, show both orders and source labels, preserve live-baseline/fixed-scenario distinctions and all validation gates. Run UI smoke and a11y. Pair discovery can remain deferred.

Rollback disables E integration and restores its placeholder without changing the facility dataset, single-stop APIs, countdown state, or production matrix. A shared-helper extraction must be behavior-preserving and reviewable independently. No schema migration, storage persistence, package addition, or routing data release is necessary for the minimum D demo.

### 10.3 Readiness checklist

| Gate / prerequisite | Evidence in inspected baseline | Assessment |
| --- | --- | --- |
| G-F3 | Shipped in PLAN §11; current GW-F code/tests present | Recorded complete; new production smoke NOT CHECKED here. |
| G-X3 | Signed approval in GW-X-004 report and implementation plan | Recorded complete; current dataset/regressions checked separately below. |
| GW-B-R001 / GW-B-001 alignment | Other research assignment stated by user; no approved Phase B port/policy in this baseline | Pending human-mediated reconciliation; other agent's unpublished work NOT CHECKED. |
| G-B1 | No completion evidence in inspected baseline | HOLD. |
| G-C0 | No completion evidence in inspected baseline | HOLD. |
| Human G-E and GW-E1 authorization | This request explicitly authorizes research only | Not granted for implementation. |
| Owner handoff / contracts | Proposed in this document; no shared-source changes | Lead approval required before later code work. |

**Decision: HOLD for implementation and release.** This research is ready for lead review; it is not evidence that G-E has passed. The next implementation task remains **GW-B-002 after accepted GW-B-001 / G-B0**, if the lead confirms those gates; GW-E's own first implementation is **GW-E1 only after G-Data + explicit G-E**. Do not start either task from this recommendation.

## 11. Verification record for this documentation assignment

The final checked commands/results are recorded here before commit. GW-E code/tests are intentionally not implemented. Production deployment, real path measurements, other-agent work, and new human gate approvals are NOT CHECKED.

| Command / check actually run | Result |
| --- | --- |
| `git fetch origin main`; `git rev-parse origin/main 47c07028e1eccb3515f8bd8bfddd80f1c90fccdd` | PASS — both resolve to the inspected baseline. |
| `/private/tmp/gatewise-npm ci --ignore-scripts --no-audit --no-fund` | PASS — isolated worktree dependencies installed from the lockfile; package lifecycle scripts disabled. |
| `/private/tmp/gatewise-npm test` | PASS — 631 tests, 37 files. Vite reported a future config-loader compatibility warning; no test failures. |
| `/private/tmp/gatewise-npm exec -- tsc --noEmit` | Initial run failed only to write ignored `tsconfig.tsbuildinfo` (EPERM); approved retry PASS. |
| `/private/tmp/gatewise-npm run lint` | PASS. |
| Temporary Python arithmetic/data/document audit (`python3`, stdin) | PASS — 1,360 assertions covering literal worked sums, 1,296 clamp-equation combinations, 26 records / 12 eligible / null service fields, local links, and E01–E55 coverage. This is a document audit, not an E implementation test. |
| Extracted two TypeScript design blocks into `/private/tmp/gw-e-design-check/contracts.ts`; `/private/tmp/gatewise-npm exec -- tsc -p /private/tmp/gw-e-design-check/tsconfig.json --noEmit` | PASS against existing repository types; declarations only, no E runtime implementation. |
| `git diff --cached --check` and staged path inspection | PASS before commit — only this new design document staged. |
| Production build / deployed browser smoke | NOT RUN — documentation-only change; no production validation or new G-E approval claimed. |

The npm wrapper uses the existing bundled Node runtime. Dependency installation reported existing `whatwg-encoding` / ESLint deprecation warnings; no dependency manifest or lockfile was changed. Temporary checks and generated caches are not part of the committed document change.

No application source, dataset, dependency manifest/lockfile, existing planning document, or AGENTS.md is changed by this branch. The isolated worktree is retained for review; original worktrees and local instructions remain untouched.
