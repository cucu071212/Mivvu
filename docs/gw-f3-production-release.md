# GW-F3 security production release

**Released:** 2026-10-24  
**Production URL:** https://gate-wise-iota.vercel.app  
**`main` commit:** `35ef72dcacadb0c79698e44a9f2ff5717cd5f016`  
**Audit:** Independent Codex **APPROVE** on `feature/gw-f3-rc-block-fixes` @ same SHA.

## What shipped

- GW-F1 personalization (per-facility queue/activity overrides; precedence personal → demo → official → unknown).
- GW-F2 boarding countdown (device clock; pause/resume/clear; failure recovery gate).
- GW-F3 integration into ranked recommendations and What-if.
- Post-remediation hardening: 0–1440 minute validation aligned UI/validator; countdown expiry latch and backward-clock stop; production CSP without `unsafe-eval`.

## Verification record (pre-deploy)

- `npx vitest run` — 25 files / 581 tests
- `npx tsc --noEmit`, `npm run lint`, `npm run build` — pass
- `npm audit` — 0 vulnerabilities

## Rollback references

| Label | SHA | Notes |
| --- | --- | --- |
| Pre–block-fix GW-F3 on `main` | `e458fdc4394c111c99c4908b744401524c8bd553` | Vercel promote prior production deployment |
| MVP P0 tag | `665e5e8` (`mvp-p0-baseline-665e5e8`) | No GW-F features |

## Non-blocking security notes

- CSP still allows `unsafe-inline` for scripts (Next.js hydration constraint); `unsafe-eval` is development-only.
- No live flight, queue, or indoor navigation data; all timing labels remain model/demo/user-supplied per `PLAN.md`.
