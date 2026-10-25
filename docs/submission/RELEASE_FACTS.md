# GateWise v1.0 — release facts

Recorded 2026-10-25 during the hackathon closeout. Do not treat older roadmap SHAs as current.

## Identity

| Field | Value |
| --- | --- |
| Product | GateWise |
| Tagline | Your airport. Your gate. Your time. |
| Repository | https://github.com/cucu071212/GateWise |
| Production alias | https://gate-wise-iota.vercel.app |
| Approved Git SHA | `c9c163cd7ee51d270e1a079daf84ffaf37b5952a` |
| Integration | Fast-forward of `feature/gw-b-location-ui` onto previous `main` `091805b` |
| Codex location-data ancestor | `11c5e1f9fa4e49d386563395f104291e9a315df5` |
| Vercel production deployment | `dpl_AVbZEGA48z5evM1GRRssLPfAgQLF` |
| Vercel readyState | READY |
| Vercel target | production |
| Aliases on that deployment | `gate-wise-iota.vercel.app`, `gate-wise-gate-wise.vercel.app` |
| Vercel Git SHA metadata | **Not exposed** by `vercel inspect --json` |

Do not create a new production deploy unless a release-blocking bug is separately approved.

## Scope that actually ships

- SFO only at Welcome.
- **26** browse facilities in Explore.
- **12** recommendation-authorized Terminal 2 D Gates IDs (`legacy-d-v1` in `src/data/approved-recommend-facility-ids.ts`):
  - 16th & Dolores General Store
  - Andalé Mexican Kitchen + Bar
  - Brookstone
  - Burger Joint
  - Cat Cora
  - Kiehl's
  - Lark Creek Grill
  - Napa Farms Market
  - Peet's Coffee (`sfo-t2-d-peets-coffee-d7`)
  - Sunglass Hut
  - The Chocolate Market
  - Wakaba
- **12** GW-B location-evidence rows, all `verified_area`. Facilities without a row (including Vino Volo and Bun Mee) present as **Unknown**.
- GW-E2 two-stop planner is a **demo** on My Plan. T=0 boarding minutes are valid (`091805b`).

## Fresh verification on `c9c163c` (closeout)

| Command | Result |
| --- | --- |
| `npm test` | PASS — 945/945 (62 files) |
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS |
| `npm run test:e2e:run` | PASS — 23/23 |

## Environment

No application `.env` files are in the repository. Local run needs no secrets. `next.config.ts` sets security headers only. Do not invent required API keys.

## License

No `LICENSE` file is present in the repository.
