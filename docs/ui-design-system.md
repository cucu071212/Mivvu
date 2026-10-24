# GateWise UI Design System (GW-002)

**Stack:** Next.js 16, Tailwind CSS v4 (CSS-first `@theme` in `src/app/globals.css`).  
**Direction:** Mobile-first, minimal Swiss / professional tool (ui-ux-pro-max). Sky blues + booking orange accent.  
**Scope:** Tokens and utility classes only — components wire these in later tasks (GW-009+).

## Principles

- **Clarity under stress:** travelers skim before boarding; strong hierarchy, no decorative noise.
- **Honest labeling:** verified facts vs `demo_estimate` vs unknown are always visually distinct.
- **Model ≠ guarantee:** status chips describe in-app time math, not flight safety.
- **Accessibility:** WCAG 2.1 AA target for text (4.5:1 body); visible `:focus-visible` rings; 44px min touch targets on primary controls.
- **Motion:** 200ms transitions; respect `prefers-reduced-motion`.

## Typography

| Role | Implementation |
| --- | --- |
| UI sans | **Inter** via `next/font` → `--font-inter` |
| Data / breakdown mono | **JetBrains Mono** → `--font-jetbrains-mono` |
| Base size | `16px` / `1rem` on `body` |
| Line height | `1.5` body |

Use Tailwind: `text-sm`, `text-base`, `text-lg`, `font-semibold`, `tracking-tight` for headings.

## Color tokens (CSS variables)

Defined in `:root` with dark-mode overrides in `prefers-color-scheme: dark`.

| Token | Light role |
| --- | --- |
| `--gw-primary` | Brand, links, focus ring base |
| `--gw-accent` | Secondary CTA / emphasis |
| `--gw-background` / `--gw-foreground` | Page |
| `--gw-card` / `--gw-card-foreground` | Cards, inputs |
| `--gw-muted` / `--gw-muted-foreground` | Secondary text, panels |
| `--gw-border` | Dividers, input borders |
| `--gw-ring` | Focus outline |

Mapped into Tailwind via `@theme inline` as `--color-primary`, `--color-background`, etc.

## Recommendation status chips

Map `RecommendationStatus` + ineligible policy rows to classes:

| Model meaning | Class | Contract field |
| --- | --- | --- |
| Feasible (margin ≥ 10) | `gw-status-chip gw-status-feasible` | `kind: 'feasibility'`, `feasible_in_model` |
| Tight (0–9) | `gw-status-chip gw-status-tight` | `tight_in_model` |
| Over budget | `gw-status-chip gw-status-over` | `over_budget` |
| Unknown time data | `gw-status-chip gw-status-unknown` | `kind: 'unknown'` |
| Policy ineligible | `gw-status-chip gw-status-ineligible` | `kind: 'ineligible'` |

**Copy:** never use “guaranteed safe” or “will make your flight.”

## Confidence / source badges

| `DataConfidence` (location or time) | Class | Label copy (example) |
| --- | --- | --- |
| `official_verified` | `gw-badge gw-badge-verified` | “Official source” |
| `demo_estimate` | `gw-badge gw-badge-demo` | “Demo estimate” |
| `unknown` / `third_party` | `gw-badge gw-badge-unknown` | “Unverified” |

Demo estimates are **unverified modeling assumptions**, not measured SFO times. Unknown durations stay `null` in data — badge reflects confidence fields, not invented numbers.

## Surfaces & layout

| Utility | Use |
| --- | --- |
| `gw-surface-card` | Amenity cards, what-if panels |
| `gw-input` | Flight context fields (min-height 44px) |
| `gw-btn-primary` | Primary actions |
| `gw-focus-ring` | Interactive chips/toggles needing explicit focus styling |

**Spacing:** default Tailwind scale (`p-4`, `gap-3`, `px-6`). Page max width for mobile-first content: `max-w-2xl` (placeholder) — cards use `p-4`–`p-6`.

**Breakpoints (test):** 375, 768, 1024, 1440 — no horizontal scroll on 375.

## Interactive states

- **Hover:** links and buttons use `--gw-transition` (200ms); inputs lighten border toward primary.
- **Focus:** global `focus-visible` 2px `--gw-ring` offset 2px; components may add `gw-focus-ring`.
- **Active:** primary button slight scale `0.98`.

## What-if panel (later GW-017)

Use `gw-surface-card` with side-by-side stacks on `md:` breakpoint; status chips for before/after; numeric breakdown in `font-mono text-sm`.

## Filter bar (later GW-009/010)

`gw-input` for search; category pills with `gw-focus-ring` and `gw-badge` patterns for active filter.

## Files

| File | Responsibility |
| --- | --- |
| `src/app/globals.css` | Tokens, `@theme`, component utilities |
| `src/app/layout.tsx` | Font loading |
| This doc | Human + agent reference |

No `tailwind.config.ts` or extra PostCSS — v4 CSS-first only.

## Changelog

- **GW-002:** Initial system from ui-ux-pro-max query “airport travel productivity mobile boarding time”.
