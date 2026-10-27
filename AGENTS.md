# GateWise — Agent Instructions

## What this file is

`AGENTS.md` defines **how people and agents work together**: roles, permissions, conflict handling, verification, coordinator prompting, and reporting. It is **not** the product roadmap.

**Plan revisions:** [`docs/plan-revisions.md`](docs/plan-revisions.md). Tasks should cite the applicable `GW-PLAN-REV-*` identifier.

## Document responsibilities

- **Direct human decisions** establish or change approved product scope and permissions. They override coordinator proposals when clearly stated.
- **`AGENTS.md`** (this file) governs agent roles, collaboration, verification, safety, coordinator prompting rules, and conflict handling.
- **`PLAN.md`** governs product requirements and invariants. A task cannot silently change invariants or product scope without a human decision and `PLAN.md` update.
- **`docs/IMPLEMENTATION_PLAN.md`** governs assigned tasks, dependencies, evidence, and **task-specific permissions** (commit, push, deploy, credentials, etc.).
- **Applicable technical contracts** (e.g. [`docs/GW-F-CONTRACT.md`](docs/GW-F-CONTRACT.md)) govern defined interfaces. Superseded **ownership or workflow** lines in older contracts do not override this file; **technical rules** in contracts remain binding where still shipped.
- **Historical reports, archives, chats, and old GATEWISE STATUS posts** provide evidence of past work — **not** active authorization.

**Task overrides:** An assigned task may override default **ownership** and name files/modules. It **cannot** grant itself permissions beyond what the human authorized or silently change `PLAN.md` invariants.

**Prompt precedence:** A newer ChatGPT-generated prompt does **not** automatically override canonical documents. A **direct human instruction** assigning a task (with scope and permission) **authorizes execution** even if the implementation plan row still says “planned.” Record that authorization in GATEWISE STATUS (task ID, authorizer, channel/date). Do **not** require a circular rule that the implementation plan must be updated *before* recognizing a clear human assignment — update the plan when practical after authorization is clear.

The ChatGPT coordinator **may inspect accessible GitHub branches** (for example `origin/docs/gw-next-001-instruction-reset` or `main`) but must **verify the relevant current revision** (branch, commit, plan revision) before drafting assignments. **Unpushed local-only changes** are not on GitHub until pushed — the coordinator needs pasted diffs, attachments, or another accessible source for those. Do not assume any conversation has current repo state without verification.

## Obtaining applicable instructions

Before work, read the current:

1. [`AGENTS.md`](AGENTS.md)
2. [`PLAN.md`](PLAN.md)
3. [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) for the assigned task ID

**How to get files:** Clone or open the repo; checkout the branch the human specifies (e.g. `docs/gw-next-001-instruction-reset` or `main` after merge); or use files the human attaches in chat. **Merging documentation to `main` is not a universal prerequisite** for design or research — the prerequisite is **reviewed, applicable instructions** plus an **explicit task assignment** with execution permission.

**Production / release evidence (SFO):** [`docs/submission/RELEASE_FACTS.md`](docs/submission/RELEASE_FACTS.md). Do **not** store a permanent “current production SHA” in this file.

## Release and deployment

- **Merging or pushing to `main` may trigger an automatic Vercel production deployment** (typical GitHub ↔ Vercel integration; this repo has no `vercel.json` in-tree). Treat production promotion as consequential; require human authorization in the task.
- **`c9c163cd7ee51d270e1a079daf84ffaf37b5952a`** — historical **SFO product** baseline recorded in submission docs.
- **`c8b278fb7da37249ee261bdc20a36156fb39f799`** — **documentation closeout** commit on `main` (submission package); not the same role as the product SHA.
- Neither SHA is fresh proof of what is **currently serving** at https://gate-wise-iota.vercel.app without new deploy inspection or smoke evidence.

## Stack and durable boundaries

- Next.js App Router, React, TypeScript, Tailwind CSS, GitHub, Vercel.
- **Shipped SFO demo (preserve):** T2 D Gates recommend scope, What-if, GW-F, multi-terminal browse with honest limits — see `README.md` and submission package.
- **Primary development target (approved):** **ICN** mobile — see `PLAN.md`.
- Do **not** silently add: nationwide coverage commitments, commercialization, a chosen database/backend framework, paid providers, production indoor navigation, or live queue/walk/occupancy claims.
- `minutesUntilBoarding` means **minutes until boarding starts**.
- No invented airport facts. Label unverified walks, queues, and activity times as **demo estimates** or user-supplied.
- **Do not transfer** SFO synthetic walking assumptions (`legacy_zone`, D→D demo matrix) to ICN.

## Agent roles (defaults — task assignment overrides)

**Agent identity** means the **execution environment** (Cursor vs Codex), not the model or reasoning setting inside it. A stronger model does not replace tests or independent verification.

### Human owner

- Final product direction, scope, and production authorization
- Task dispatch (including direct assignment in chat)

### ChatGPT coordinator

- Clarifies requirements, drafts assignments and execution prompts, reviews architecture and evidence
- Coordinator output is **proposal** until reflected in `PLAN.md` / `docs/IMPLEMENTATION_PLAN.md` or confirmed by direct human decision

### Cursor (primary development and integration)

- Default owner: UI, ordinary feature work, application integration, preview preparation
- Default integration owner for wiring contracts into the app unless a task assigns otherwise
- May merge to `main` and deploy **only when the task explicitly authorizes it**
- Typical paths: `src/app/*`, `src/components/*`, integration, `package.json`, deployment config

### Codex (specialist)

- **Difficult engineering:** implementation, analysis, algorithms, data pipelines, adapters, security review, debugging, substantial features
- **Independent adversarial verification** of consequential changes (tests, red-team expectations, regression analysis) when assigned
- **Not limited to QA** — may own full feature implementation when the task assigns it (including UI or backend)
- When Codex implements a **consequential** change, the task should name **another reviewer** (human owner or Cursor) for integration review
- Uses feature branches; does not merge to `main` unless the task authorizes

**No automatic fan-out:** One agent, one task ID per authorization unless the human directs parallel work with clear boundaries.

## Coordinator prompting and task dispatch

These rules help **agents audit** coordinator-generated prompts. They apply to humans drafting prompts as well.

**Before drafting or forwarding an assignment:**

1. Verify relevant current documents, **task state** in `docs/IMPLEMENTATION_PLAN.md`, and **evidence** (branch, commit, reports). If repository access is unavailable, state the **last verified** SHA/branch/date and require an initial verification step before implementation.
2. Distinguish **approved human decisions**, **coordinator proposals**, and **unknown facts** (label unknowns; do not invent).
3. Reference **task ID** and applicable **`GW-PLAN-REV-*`**.
4. Define, proportionate to risk: **objective**, **scope** (files/modules), **ownership**, **dependencies**, **integration owner**, **acceptance**, **verification commands**, **permissions** (commit, push, deploy, secrets), and **stopping conditions** (GATEWISE STATUS, no scope creep).
5. **Reference canonical requirements** in `PLAN.md` / contracts — do not duplicate the full product spec in the prompt.
6. When a decision changes scope or invariants, **identify which documents must be updated** (`PLAN.md`, implementation plan, etc.).
7. **Review incoming evidence** (STATUS reports, CI, QA) before creating another assignment; avoid redundant tasks or parallel work without clear boundaries.
8. **Skills:** Name relevant skills; require honest reporting if a skill is unavailable or not used.
9. **Language:** Explain the assignment to the **human owner in Korean**; write the **agent execution prompt in English**.

Agents should refuse or clarify prompts that conflict with `PLAN.md`, lack execution permission, or omit verification for consequential changes.

## Ownership and safe edits

1. Edit only within the assigned task boundaries unless lead-mediated handoff.
2. Work in branches or worktrees; do not discard others’ uncommitted work.
3. Test expectations must be independently reasoned, not snapshots of implementation output.
4. State task permissions explicitly so small actions do not require re-approval each time; **production** always needs human authorization.

## Before starting any task (agent conflict procedure)

1. Read `AGENTS.md`, `PLAN.md`, and the assigned task in `docs/IMPLEMENTATION_PLAN.md`.
2. Compare the execution prompt to those sources (task ID, plan revision, scope, permissions, deliverable).
3. **Do not follow “newest prompt always wins.”**
4. On material mismatch with unclear human intent: state the conflict, ask **one** focused question, continue only on independent work.
5. On clear human decision changing product direction: update `PLAN.md` (and implementation plan if needed) **first**, then implement within scope.

## Execution prompts (content checklist)

- Task ID and `GW-PLAN-REV-*`
- Scope and permissions
- Deliverable and verification commands
- Pointers to canon — not a full `PLAN.md` paste

## Skill policy

- Skills do not override this file, `PLAN.md`, or an assigned task.
- `writing-plans` when explicitly asked to create or revise plans.
- `ui-ux-pro-max` for substantive UI.
- **Verification before completion:** use checks appropriate to the task (Markdown: link/consistency review; critical logic/regression fixes: targeted tests, often TDD). Markdown-only work does **not** require application tests.
- No autonomous multi-agent fan-out or broad `executing-plans` without explicit human approval.

## Git collaboration

- Commit, push, merge, deploy require **explicit authorization** in the task (or pre-authorized in the implementation plan row).
- Before edits: `git status`, current branch.
- Never force-push another developer’s branch or `main` without explicit human request.

## GATEWISE STATUS (required after each assigned task)

Separate **execution permission**, **work progress**, **review/acceptance**, and **integration/release** — see task state convention in `docs/IMPLEMENTATION_PLAN.md`.

```text
GATEWISE STATUS — [Cursor / Codex / Human-coordinated]
Task ID / objective:
Plan revision:
Execution permission: not_authorized | authorized (source: task row | direct human assign)
Work progress: not_started | in_progress | complete
Review / acceptance: pending | accepted | rejected
Integration / release: n/a | preview | production
Files changed:
Behavior delivered / verified data sources:
Tests and commands actually run: [command → PASS/FAIL/NOT RUN]
Git branch / commit / push state:
Dependencies needed from other owner:
Blockers, known limitations, integration risks:
Handoff / report location:
Recommended next task (proposal only):
Decision needed from human owner:
```

**Note:** Work progress `complete` does not imply review `accepted` or permission to start the next task.

## Shared recommendation contract (SFO shipped engine)

Unless a redesign task changes it:

**Single-stop (`recommendFacilities`)** — powers Results and What-if (GW-F3 wrapper optional; see `docs/GW-F-CONTRACT.md`):

- Required minutes = directed **outbound** + directed **return** + **queue** + **activity** + **one safety buffer**.
- Margin = minutes until boarding starts − required minutes.
- Thresholds: ≥10 `feasible_in_model`; 0–9 `tight_in_model`; <0 `over_budget`; missing essentials `unknown`.
- Unknown durations never zero-filled; What-if uses the same engine for baseline and scenario.
- Browse eligibility ≠ recommendation eligibility.

**Two-stop (shipped demo on My Plan)** — separate module (`src/lib/plan-two-stop-legacy.ts` and related policy); do not change engine behavior without an authorized task. Budget uses applicable **directed walking legs** between gate and stops, **both stops’ queue and activity durations** where known, and **one safety buffer** at the end (not per leg). See submission brief and adversarial handoff under `docs/qa/` for shipped semantics.

## Verification and safety

- Never expose secrets or run unreviewed install scripts.
- API documentation does not prove access or field accuracy — verify in assigned API tasks.
- Label fixtures and mocks; isolate until integration tasks authorize merge.
