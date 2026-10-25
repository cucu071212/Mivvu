# Branch and PR cleanup plan (proposal only)

**Do not delete branches, close PRs, or push tags until the human Engineering Lead approves each action.**

Inventory taken 2026-10-25 against `origin/main` = `c9c163c`.

## Proposed annotated tag (needs approval)

```text
git tag -a v1.0.0-hackathon c9c163cd7ee51d270e1a079daf84ffaf37b5952a
# message: GateWise v1.0 hackathon production — dpl_AVbZEGA48z5evM1GRRssLPfAgQLF
git push origin v1.0.0-hackathon
```

Appropriate because `main` is the approved production SHA. Do not move the tag later.

## Pull requests

`gh` is not installed in this environment. The public GitHub pulls API returned **404** (private repository).

**Proposed:** In the GitHub UI, inspect **PR #1**. If its commits are already ancestors of `c9c163c` or were superseded by later `main` history, **close it as already incorporated** with a comment pointing at `c9c163c`. Do not merge stale feature PRs into `main`.

Stale open PRs that only repeat shipped GW-A/C/E/F/X work should be closed the same way after a human scan.

## Already included in `main` (safe later delete candidates)

These remote tips are ancestors of `origin/main` (ahead-count 0). History remains in `main` after branch deletion.

Examples: `feature/gw-b-location-ui`, `feature/gw-b-location-data`, `feature/gw-e2-two-stop-planner`, `feature/gw-e1b-two-stop-engine`, `fix/gw-e2-adversarial-engine`, `release/rc-gw-e2-ux-polish`, GW-A/C/X feature branches, most `docs/` and `research/` branches listed in the promotion inventory, Level 2 UX branches, `feature/gw-f3-*` that were merged.

**Proposed action after approval:** delete remote feature branches that are ancestors of `c9c163c` and have no open unique work. Keep `main` and the release tag.

## Historical / superseded, unique commits (do not merge)

| Branch | Unique | Keep? |
| --- | --- | --- |
| `feat/data-utils` | 19 | Archive; unique docs only. Logic superseded. |
| `codex/gw-c-reliability-package` | 3 | Archive docs; hours libs already on `main` via later work. |
| `codex/gw-e-two-stop-design` | 1 | Keep as research archive. |
| `codex/gw-hackathon-readiness-audit` | 1 | Keep as QA archive. |
| `docs/gw-e1-readiness-review` | 1 | Keep as research archive. |
| `feature/gw-f-logic` / `feature/gw-f2-logic` | 1 each | Unique SHAs; files exist on `main` via later integration. Do not re-merge. |
| `feature/terminal-map` | 1 | Experimental schematic. Keep isolated. |
| `codex/gw-e2-adversarial-tests` | 1 | Extra tests not in this FF. Review before any merge. |

## Experimental / HOLD — remain isolated

| Branch | Why |
| --- | --- |
| `codex/gw-b-sfo-map-research` | Walking-estimate research. **G-Data HOLD**. |
| `chore/hackathon-release-closeout` | This documentation branch. Merge only if the lead wants README/docs on `main`. |

## Local worktrees

Several `codex/*` and `feature/gw-f-*` worktrees exist locally. They do not need deletion for the demo. Do not force-push them.

## Explicit non-actions

- Do not merge leftover unique branches “for cleanup.”
- Do not force-push `main`.
- Do not delete research history.
- Do not deploy from this closeout branch.
