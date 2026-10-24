# GateWise — Agent Instructions

## Mission and source of truth
Build the GateWise HackPSU MVP during the permitted development window. Read `PLAN.md` before coding. `PLAN.md` defines product requirements, milestones, calculation semantics, and scope. This file defines how coding agents should work. If instructions conflict, ask the engineering lead rather than silently expanding scope.

## Stack and hard boundaries
- Next.js App Router, React, TypeScript, Tailwind CSS, local JSON/TypeScript data, GitHub, Vercel.
- **P0:** single verified SFO terminal; gate/time input, amenities, shared zone-time recommendation engine, what-if before/after comparisons, clear source/estimate labels, responsive UI, deployed demo.
- **P1:** two-stop planner only after P0 passes tests and deploys and engineering lead approves.
- Do not build auth, database, payments, boarding-pass scanner, live-flight integration, multi-airport coverage or production indoor navigation.
- `minutesUntilBoarding` means **minutes until boarding starts**.
- No invented airport facts. Label all unverified walks, queue times and activity times as **demo estimates**. Never claim a model recommendation guarantees catching a flight.

## Ownership / safe edits
Engineering lead (Cursor / own Codex):
- `src/types/airport.ts`
- `src/data/travel-times.ts`
- `src/lib/recommend.ts`
- `src/components/WhatIfSimulator.tsx`
- `src/components/AmenityCard.tsx`
- `src/components/AmenityFilter.tsx`
- `src/components/AmenityDetail.tsx`
- all UI/UX, layout, design system, terminal schematic, `src/app/page.tsx` and application integration
- dependencies, package configuration, deployment and merges

Teammate (their Codex):
- `src/data/facilities.json`
- `src/lib/filter-facilities.ts` and `src/lib/filter-facilities.test.ts`
- `src/lib/validate-facilities.ts` and `src/lib/validate-facilities.test.ts`
- `src/lib/validate-context.ts` and `src/lib/validate-context.test.ts`
- `src/lib/recommend.test.ts`
- `docs/DEMO_SCRIPT.md`, data provenance notes, QA reports and Devpost copy drafts

- **Do not edit files assigned to the other owner.** If a change is needed, describe it in your response or PR and request the lead to make it.
- The lead defines shared types, `recommendFacilities` signature, UI prop interfaces, and the input/output contracts for `filterFacilities`, `validateFacilities`, and `validateContext` in the first 30 minutes. Teammate uses the contracts and sample fixtures; do not independently invent competing types.
- **All UI implementation belongs to the lead.** The teammate must not edit React components or styling. Filtering, normalization and validation belong in pure TypeScript utility modules; lead imports/wires them into UI.
- The teammate's utility scope is limited to approved P0 requirements: text/category/zone filtering, dataset integrity, and boarding-context input checks. No new back-end service, database, API, or extra product feature.
- Work in separate branches/worktrees. Open small PRs or share commits for review. Only the lead merges and deploys.
- Test files should use independently calculated expected outputs, not snapshots of the implementation result. The teammate owns tests for recommendation and utility functions; the lead remains responsible for fixing `recommend.ts` and all UI code if a test reveals a bug.

## Human-led coordination and task dispatch
- The human **Engineering Lead is the sole task dispatcher and final decision-maker** for both developer machines. The lead may collect Cursor and teammate Codex status reports and consult a separate ChatGPT conversation for prioritization and task-prompt drafting. That assistant does not control either machine and its suggestions require the lead's approval.
- `PLAN.md` is the frozen product specification; `docs/IMPLEMENTATION_PLAN.md` is the approved task breakdown, **not permission to execute every task automatically**. If the latter is absent while planning, the lead may generate it using `writing-plans`; agents must not pretend it already exists. Once created, read the current checked-out copy and follow the specific task ID the lead assigns.
- **One task per authorization:** on receiving an assignment, confirm task ID, intended deliverable, owned files, prerequisites, and acceptance checks; then implement only that task. Stop after verification and status report. A recommendation for the next task is not authorization to start it.
- **Coordinator handoff:** after each task or meaningful blocker, produce the report template below so the lead can forward it between assistants. Report real files/tests and pending dependencies, not guesses about the other developer's progress. Never send instructions directly to the other developer or silently revise their task; propose a handoff for the lead to transmit.
- **Progress sync:** at the 17:00 / 20:00 / 22:00 / 23:00 ET checkpoints, and when the lead requests it, provide a brief current-state report without starting unrelated work. The lead decides re-prioritization and scope cuts. Time-sensitive facts and GitHub state must be checked, not assumed.
- Changes to product goals require lead approval and an update to `PLAN.md`; changes to file ownership/agent behavior require lead approval and an update to `AGENTS.md`; task ordering/status changes belong to `docs/IMPLEMENTATION_PLAN.md`. Don't overwrite another agent's document changes.

## Skill policy (Cursor and Codex)
- Skills support assigned work; they do not override this file, file ownership, or explicit lead instructions. Prefer one agent working on one task.
- **Lead Cursor:** invoke `writing-plans` only when explicitly asked to create/revise the implementation plan. Use `ui-ux-pro-max` for substantive UI design; apply TDD to critical calculation logic, systematic debugging to hard bugs, and verification before reporting DONE.
- **Lead's Codex:** primarily read-only review/debug/test support. Never edit the same working tree/files concurrently with the lead's Cursor without an explicit, isolated handoff.
- **Teammate Codex (Superpowers plugin):** use `superpowers:test-driven-development` for assigned utility work and tests, `superpowers:systematic-debugging` for nontrivial bugs, and `superpowers:verification-before-completion` before reporting DONE. If a skill is unavailable, report that and use the normal testing workflow; do not invent invocations.
- Do **not** invoke brainstorming, `executing-plans`, `subagent-driven-development`, autonomous worktree agents, or parallel subagent fan-out without explicit lead approval. Do not restart feature ideation or produce fresh long plans for each task.
- These are **behavioral instructions, not a technical disable switch** for plugin skills. The lead should supervise any unexpected automatic workflow.

## Git collaboration and approval gates
- Branches: lead works in `feature/core-app`; teammate works in `feature/data-utils`; `main` is controlled by the lead. Equivalent isolated branches/worktrees can be assigned explicitly.
- Before edits, inspect `git status` and current branch. Never blindly discard local edits, force-push, rebase another developer's unpublished changes, or claim a remote merge happened without verifying it.
- An agent may prepare a commit/PR as instructed, but **commit, push, merge, and deployment require explicit authorization**. Only the lead reviews and merges into `main` and deploys.
- After shared contracts are merged, the teammate must fetch/integrate the updated `main` safely before implementing functions that depend on those contracts. The lead is responsible for coordinating that sync.

## Required report after each assigned task
Use this compact template, including when blocked. Mark unavailable information as NOT CHECKED rather than inventing it.

```text
GATEWISE STATUS — [Engineering Lead Cursor / Engineering Support Codex / Teammate Codex]
Task ID / objective:
Status: DONE | PARTIAL | BLOCKED
Files changed:
Behavior delivered / verified data sources:
Tests and commands actually run: [command → PASS/FAIL/NOT RUN]
Git branch / commit / push state:
Dependencies needed from other owner:
Blockers, known limitations, integration risks:
Recommended next task (proposal only):
Decision needed from human Engineering Lead:
```

## Coding procedure
1. Read the assigned task ID in `docs/IMPLEMENTATION_PLAN.md` (if approved and available) and its expected behavior in `PLAN.md`; do not choose a new task without lead authorization.
2. Read only relevant files; outline a short plan when the task is nontrivial.
3. Make focused, minimal edits confined to owned files.
4. Run targeted tests/type checks/build appropriate to the change. Report actual commands and results; never claim a test ran when it did not.
5. Report via the required GATEWISE STATUS template; stop and await the lead’s next instruction.
6. If blocked twice, stop retrying blindly. Report exact error, reproduction and suggested next step.

## Shared recommendation contract
- A single pure `recommendFacilities(context, facilities, travelTimes)` powers both B and C.
- Required minutes = directed outbound travel + directed return travel + queue + activity + safety buffer.
- Margin = minutes until boarding starts − required minutes.
- Margin >= 10: `feasible_in_model`; 0 <= margin < 10: `tight_in_model`; margin < 0: `over_budget`; missing essential inputs: `unknown`.
- Unknown durations are never zero-filled; invalid routes and security-zone incompatibility must be handled explicitly.
- What-if calls the same pure function for baseline and changed assumptions and shows before/after numerical reasons.

## Time and verification rules
- Saturday 17:00 ET: teammate facility data/filter utility + lead input UI. 20:00: lead core engine/recommendation display + teammate validation/tests. 22:00: lead What-if + teammate QA; B+C complete or cancel E. 23:00: first deployment.
- Sunday: regression QA, demo, and initial submission **before noon ET** (verify official event deadline).
- Prefer one agent per task. No subagent fan-out, repetitive planning loops or broad rewrites unless the lead explicitly requests them.
- Never expose secrets, overwrite other people's work, or run unreviewed third-party install scripts.
