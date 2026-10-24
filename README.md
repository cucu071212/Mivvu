# GateWise

*Your airport. Your gate. Your time.* — HackPSU Fall 2026 MVP (boarding-aware recommendations + what-if simulator).

Product scope and agent rules: see [`PLAN.md`](./PLAN.md), [`AGENTS.md`](./AGENTS.md), and [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md).

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

Open [http://localhost:3000](http://localhost:3000). The home page is a minimal placeholder until flight context and recommendations land in later tasks.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js dev server (App Router) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript) |
| `npm test` | Vitest — `src/lib/**/*.test.ts` (utilities; none yet at GW-000) |
| `npx tsc --noEmit` | Typecheck without emit |

## Stack (GW-000)

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS v4 (`@import "tailwindcss"` in `src/app/globals.css`)
- ESLint flat config (`eslint.config.mjs`)
- Vitest for pure `src/lib` unit tests (teammate-owned tests arrive after GW-001)

## Deployment

Vercel deployment is planned after P0 B+C (`GW-020`). Not configured in this scaffold task.
