# GateWise — Agent Instructions

## Mission and source of truth
Build and extend GateWise per `PLAN.md`. `PLAN.md` defines product requirements, milestones, calculation semantics, and scope. This file defines how coding agents work. If instructions conflict, ask the human Engineering Lead rather than silently expanding scope.

## Stack and hard boundaries
- Next.js App Router, React, TypeScript, Tailwind CSS, local JSON/TypeScript data, GitHub, Vercel.
- **P0 (shipped):** single verified SFO terminal; gate/time input, amenities, shared zone-time recommendation engine, what-if before/after comparisons, clear source/estimate labels, responsive UI, deployed demo.
- **Post-MVP:** **GW-F1 → GW-F2 → GW-F3** per `PLAN.md` §11 and `docs/GW-F-CONTRACT.md`. **GW-E** (two-stop planner) only after GW-F3 acceptance and separate **G-E** authorization.
- Do not build auth, database, payments, boarding-pass scanner, live-flight integration, multi-airport coverage, or production indoor navigation.
- `minutesUntilBoarding` means **minutes until boarding starts**.
- No invented airport facts. Label unverified walks, queues, and activity times as **demo estimates** or user-supplied where applicable. Never claim a model recommendation guarantees catching a flight.

## Agent roles (two-agent core + optional teammate)

### Engineering Lead Cursor — MacBook Pro (primary UI & integration)
- React components, UX, design system, terminal schematic, `GateWiseHome`, `WhatIfSimulator`, and all application integration.
- `src/app/page.tsx`, `src/app/globals.css`, dependencies, package configuration.
- Shared contract coordination: lead-owned updates to `src/types/airport.ts`, `src/data/travel-times.ts`, `src/lib/recommend.ts` when integration tasks authorize.
- Application-wide regression, `npm test` / `tsc` / `lint` / `build`, production builds, **final merges to `main`**, Vercel production releases.
- Branch examples: `feature/core-app`, `feature/gw-f-integration` (lead-assigned).

### Engineering Support Codex — personal MacBook Air (primary logic)
- **GW-F1:** `src/lib/resolve-facility-durations.ts`, `src/lib/validate-duration-overrides.ts` and tests — per `docs/GW-F-CONTRACT.md`.
- **GW-F2:** `src/lib/boarding-countdown.ts` and tests.
- **GW-E (later):** pure two-stop calculation module(s) and tests — only after GW-F3 + **G-E**.
- Independent feature branches (e.g. `feature/gw-f-logic`) **from approved `feature/gw-f-contracts`** after **G-F0** (contract approval ≠ `main` merge). **No** React/UI edits, **no** merges to `main`, **no** `facilities.json` changes.

### Teammate Codex — optional QA & submission support
- Independent QA, regression reports, `docs/DEMO_SCRIPT.md`, Devpost/submission copy, data-provenance notes.
- May own `src/lib/recommend.test.ts`, filter/validate tests, and `facilities.json` maintenance when assigned.
- **Must not block** GW-F1/F2/F3 implementation. Teammate unavailability is not a gate for Support Codex or Lead work.

## Ownership / safe edits (P0 + ongoing)

**Lead Cursor** (unless task says otherwise):
- `src/types/airport.ts` (contract changes at integration gates)
- `src/data/travel-times.ts`
- `src/lib/recommend.ts`
- `src/components/*` (all UI)
- `src/app/*`, deployment, merges

**Support Codex** (GW-F / GW-E pure logic only):
- Files listed in `docs/GW-F-CONTRACT.md` §2 and GW-E pure modules when authorized.
- Must not edit lead UI or `main` without lead merge.

**Teammate Codex** (when assigned):
- `src/data/facilities.json`
- `src/lib/filter-facilities.ts` + tests
- `src/lib/validate-facilities.ts` + tests
- `src/lib/validate-context.ts` + tests
- `src/lib/recommend.test.ts` (independent expectations)
- QA/submission docs under `docs/`

- **Do not edit files assigned to another role** without lead-mediated handoff.
- **All UI implementation belongs to Lead Cursor.** Support and Teammate write framework-free TypeScript utilities only.
- Work in separate branches/worktrees. Small PRs; **only the lead merges and deploys** `main`.
- Test expectations must be independently calculated, not snapshots of implementation output.

## Human-led coordination and task dispatch
- The human **Engineering Lead is the sole task dispatcher** for Lead Cursor and Support Codex machines.
- `PLAN.md` is the product specification; `docs/IMPLEMENTATION_PLAN.md` is the task breakdown — **not permission to execute every task automatically**. `docs/GW-F-CONTRACT.md` defines F-track technical APIs.
- **One task per authorization:** confirm task ID, deliverable, owned files, prerequisites, acceptance; implement only that task; GATEWISE STATUS; stop.
- **Coordinator handoff:** use the report template below; report real files/tests; never instruct the other developer directly.
- Changes to product goals → `PLAN.md` + lead approval. Ownership → `AGENTS.md`. Task order → `docs/IMPLEMENTATION_PLAN.md`.

## Skill policy
- Skills do not override this file or lead instructions. One agent, one task.
- **Lead Cursor:** `writing-plans` only when explicitly asked to create/revise plans. `ui-ux-pro-max` for substantive UI. TDD for critical calculation logic; verification before DONE.
- **Support Codex:** TDD for assigned pure modules; systematic debugging for hard bugs; verification before DONE.
- **Teammate Codex:** same testing/debugging discipline when assigned.
- Do **not** run autonomous multi-agent fan-out, `executing-plans`, or broad replans without explicit lead approval.

## Git collaboration and approval gates
- **Lead** merges `main` and deploys production. **Support** and **Teammate** use feature branches; push for review.
- Commit/push/merge/deploy require **explicit authorization** (except when the lead’s task explicitly includes them).
- Before edits: `git status`, current branch; never force-push another developer’s work.

## Required report after each assigned task

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
1. Read assigned task ID in `docs/IMPLEMENTATION_PLAN.md` and behavior in `PLAN.md` / `docs/GW-F-CONTRACT.md` as applicable.
2. Minimal edits in owned files only.
3. Run targeted tests/type checks/build appropriate to the change; report actual commands.
4. GATEWISE STATUS; stop for next instruction.

## Shared recommendation contract (unchanged semantics)
- Pure `recommendFacilities(context, facilities, travelTimes)` powers recommendations and What-if (GW-F3 may add a documented wrapper or optional resolved-duration input — see contract).
- Required minutes = directed outbound + directed return + queue + activity + safety buffer.
- Margin = minutes until boarding starts − required minutes.
- Thresholds: ≥10 `feasible_in_model`; 0–9 `tight_in_model`; <0 `over_budget`; missing essentials `unknown`.
- Unknown durations are never zero-filled. What-if uses the same engine for baseline and scenario with documented input deltas.

## Verification
- Never expose secrets or run unreviewed install scripts.
- Production baseline: https://gate-wise-iota.vercel.app @ `35ef72d` unless lead announces a newer approved `main`.
