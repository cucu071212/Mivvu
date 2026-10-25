# GW-E2 independent adversarial test handoff

Scope: `plan-two-stop-legacy` pure engine at fetched `origin/main` (`82614d24cf9b8a4a10298e5e2fb56f2891d6d4ce`). This branch adds only a synthetic fixture test file and this handoff. No production implementation, UI, facility data, or integration branch was edited.

## Coverage

`src/lib/plan-two-stop-legacy.adversarial.test.ts` adds 39 Vitest cases. Expected ledgers are literal arithmetic, independent of production total helpers. They cover E01, E03–E04, E10, E12–E13, E15, E18–E19, E21, E27, E29, E31–E33, E38–E39, E52, and E55 from the E01–E55 design matrix, where the current legacy D-zone API supports them. The graph, async reply, countdown, and UI cases require their respective later layers. Both selection orders are exercised for the ledger and buffer invariants.

## Reproducible findings

Run `npm test -- src/lib/plan-two-stop-legacy.adversarial.test.ts` on this branch. Five cases fail, grouped into three engine defects:

1. **E04 — zero boarding minutes:** complete 55-minute demo itinerary with `minutesUntilBoarding: 0` should produce margin `-55` and `over_budget`. Both orders instead return `unknown`. The `!parseStrictInteger(...)` check in `src/lib/plan-two-stop-legacy.ts` treats valid numeric zero as false.
2. **E29/E31 — valid adjusted queues above 1,440:** raw queue minutes and queue adjustment may each be 1,440; derived queues may reach 2,880. The engine applies the primitive `isModelSafeMinute` cap to the derived queue at line 245, returning `invalid_numeric_input`. In E29 this masks a genuinely missing queue at the other stop; in E31 it rejects the independently calculated `R=14,400`, `M=-12,960` valid arithmetic boundary.
3. **E32 — direct-call context bounds:** `minutesUntilBoarding: 1441` and `queueAdjustmentMinutes: -1441` still produce a feasibility result. The engine's boarding parser has no 1,440 maximum, and the queue adjustment is not range-validated before clamping. These inputs violate the established 24-hour primitive bounds.

These are pure-engine direct-call findings. The UI may validate some inputs upstream, but that does not establish the direct engine contract. The tests deliberately remain red for the implementation owner to resolve; no engine code was changed here.

## Verification on this worktree

- Focused adversarial Vitest: 34 pass, 5 confirmed product failures (39 total).
- Existing two-stop and single-stop suites: 72 pass in three files.
- Full `npm test`: 875 pass, 5 confirmed product failures (880 total, 52 files).
- `tsc --noEmit --incremental false`: pass.
- `npm run lint`: pass.
- `NEXT_TELEMETRY_DISABLED=1 npm run build`: pass after local `npm ci --ignore-scripts --offline`.
- E2E: not run; this engine-only branch does not contain the GW-E2 UI from the lead's integration branch.

The first build attempt failed because a temporary `node_modules` symlink pointed outside the Turbopack worktree root. Replacing it with exact lockfile dependencies installed offline resolved that environment failure; it did not change tracked files.

## Integration guidance

Bring this test-only branch into the lead's release candidate after the engine owner resolves the three findings, or use it directly to verify the fixes before integration. Preserve the failing assertions as regression tests. The strict policy test confirms a null middle leg and explicit strict provenance, while the demo policy test checks all three leg endpoints, confidence labels, and the synthetic-leg policy reference. The single-stop characterization checks the original `recommendFacilities` breakdown shape and arithmetic.
