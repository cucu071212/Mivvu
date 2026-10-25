# GateWise

*Your airport. Your gate. Your time.* — SFO-focused boarding-start time model (single-stop recommendations, what-if, and an optional two-stop **demo** on My Plan).

Product scope and agent rules: [`PLAN.md`](./PLAN.md), [`AGENTS.md`](./AGENTS.md), [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md).

## What ships in the release candidate

- **SFO only** at the welcome screen; **26 facilities** in Explore across terminals; **12 Terminal 2 D Gates** facilities eligible for time-based recommendations.
- **Flight:** boarding context, optional demo queue/activity (8/10 min), countdown, boarding-pass style hero.
- **Results:** ranked cards, time-budget timeline, what-if baseline vs scenario, optional personal duration overrides.
- **My Plan:** two-stop **demo** planner (strict travel default; opt-in illustrative D→D legs). Not a measured routing or boarding guarantee.
- **Honest limits:** D→D **3 min** legs are unverified demo estimates; queue/activity default to **Unknown** unless demo mode or user overrides; no live flights or measured indoor routes.

See [`docs/qa/RELEASE-CANDIDATE-CLAIMS.md`](./docs/qa/RELEASE-CANDIDATE-CLAIMS.md) for judge/submission wording tied to the RC branch.

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server (App Router) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest (lib + component tests) |
| `npm run test:e2e:run` | Playwright E2E (requires `npx playwright install chromium`) |
| `npx tsc --noEmit` | Typecheck |

## Stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4
- Local JSON facility data; pure TypeScript recommendation engine in `src/lib/recommend.ts`

## Deployment

Production demo (when promoted by the lead): [https://gate-wise-iota.vercel.app](https://gate-wise-iota.vercel.app) — verify SHA with the team before judging.

Preview builds use Vercel **Deployment Protection** (team login required).
