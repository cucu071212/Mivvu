# GW-ICN-018 — Antigravity independent review checklist

**Target base SHA:** `4404473bdb1af8758cd3ab3e38b74c8bebaa6863` (publication branch stacks on this parent)  
**Worktree:** `GateWise/.worktrees/gw-icn-018-verification`  
**Author evidence:** `docs/handoffs/GW-ICN-018-checkpoint.md`, `GW-ICN-018-verification-matrix.md`  
**Human acceptance:** conditional milestone pass **2026-11-05** (full Vitest still **FAILED**, 1 inherited hash)

## Setup

- [ ] Confirm `git rev-parse HEAD` = `4404473bdb1af8758cd3ab3e38b74c8bebaa6863`
- [ ] `npm ci` in this worktree only
- [ ] `npm run build && npm run start --hostname 127.0.0.1 --port 3100`
- [ ] Do **not** merge, deploy, or call live airport APIs

## Fixture integrity

- [ ] SHA-256 matches checkpoint for `icn-facilities-ko.json`, `icn-facilities-en.json`, `icn-goods-services-companion-v1.json`
- [ ] `git diff 4404473 -- src/data/fixtures/` is empty

## Traveler journey (mobile 390×844 minimum; spot-check 360 and 430)

- [ ] `/` → Explore ICN → `/icn` hydrates (not HTTP-only)
- [ ] Search `% 아라비카` → URL contains encoded `q` → open detail
- [ ] Primary block shows snapshot disclaimer; hours line not presented as live status
- [ ] Goods/services: real text for matched adopt row only; unmatched rows omit section
- [ ] Situation: three groups; **no** “open now”, walk minutes, boarding feasibility, or security eligibility **assertions** in known/unknown bullets (not-claimed list may name excluded topics)
- [ ] Save → `/icn/saved` → reopen detail → unsave; reload browser; KO↔EN on saved identity
- [ ] `/icn?q=1%2B1`, terminal chip + Back, bare `/icn` defaults — consistent with GW-ICN-017 checkpoint
- [ ] Detail return keeps browse query in URL (not a regression)

## SFO regression

- [ ] Choose SFO → Explore; deep link `/explore` behavior unchanged
- [ ] No ICN browse copy implies SFO `legacy_zone` walk matrix or flight-session recommendation engine

## Automated re-run (independent)

- [ ] Focused vitest command from checkpoint → expect **107/107 PASS**
- [ ] `npm test -- --pool=forks --maxWorkers=2 --testTimeout=60000` → expect **1294 pass, 1 fail (`icn-shipped-output`), 6 skip** — suite **FAILED / not green**
- [ ] ICN mobile Playwright (3 spec files) → expect **15/15 PASS** after GW-ICN-018 test hygiene
- [ ] `npm run lint` / `tsc --noEmit` / `git diff --check` on tracked files

## Disposition review

- [ ] Agree or reject **conditional pass** with inherited `icn-shipped-output` baseline drift documented in checkpoint
- [ ] Confirm no new blocking product defects vs Playwright/e2e hygiene items

## Explicit non-goals

- [ ] Saved-facility-based recommendations not claimed
- [ ] No IIAC indoor map data, no production promotion

**Sign-off:** Antigravity reviewer / date / PASS | FAIL | Accept conditional pass
