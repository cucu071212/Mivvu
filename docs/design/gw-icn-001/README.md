# GW-ICN-001 — First-entry mobile design proposal

**Status:** Design prototype for owner review only.  
**Does not establish live ICN support** in the application. ICN is shown as the *proposed* primary airport for the next development target per `PLAN.md`.

**Plan revision:** GW-PLAN-REV-2026-10-26  
**Mockup:** Open [`mockup.html`](./mockup.html) in a browser (local file is fine).

## Visual direction — “Luminous Runway”

One cohesive direction that **extends the shipped SFO design system** (deep navy, sky background glow, cyan gradient `GW` mark, orange accent for primary actions) rather than replacing it.

| Principle | Application |
| --- | --- |
| **Continuity** | Reuse existing `gw-brand-icon` geometry: rounded square, cyan→blue gradient, bold `GW` monogram. |
| **Mobile-first** | Full-viewport intro; airport step uses edge-to-edge safe areas, 44px+ touch targets, single primary CTA. |
| **Honest scope** | Prototype badge, “design prototype” label, ICN marked “Next focus” with demo-estimate disclaimer — no live-data claims. |
| **Calm hierarchy** | Intro is typographic + mark only; airport screen leads with one question and a short ICN-forward card before secondary airports. |

Typography: **Inter** (UI) — aligned with the app’s sans stack; no editorial serif in this slice to keep parity with current product chrome.

## Screens in scope

1. **Logo / icon intro** — centered mark, product name, single line of promise; auto-advance or tap to continue (proposal only).
2. **Airport selection** — “Where are you flying from?” with **Incheon (ICN)** as the highlighted default; SFO retained as “Shipped demo”; other hubs as coming soon.

## Proposed logo transition (implementation not in mockup)

Sequence for a future build (respect `prefers-reduced-motion: reduce` → skip motion, cut to airport screen):

1. **0–400 ms — Arrival:** Full-screen sky background fades in (`opacity` 0→1). `GW` mark scales from 0.88→1.0 with a soft cyan outer glow (existing shadow language).
2. **400–900 ms — Resolve:** Wordmark “GateWise” fades in 12px below the mark; tagline “Know your time before boarding” fades in after 200 ms stagger.
3. **900–1400 ms — Breath:** Subtle horizontal “runway” line under the mark extends from center (scaleX 0→1, 350 ms, ease-out).
4. **1400 ms+ — Handoff:** Whole intro group translates up ~24px and fades out (280 ms) while the airport card content fades in from below (320 ms, overlap 120 ms). Optional: user tap skips to frame 4 immediately.

Total default auto-advance: **~2.2 s** before transition; tap always available for accessibility.

## Viewport checks

| Width | Check |
| --- | --- |
| **390px** | Primary artboard; screenshots captured here. |
| **360px** | Narrow Android; prototype banner and card padding tighten; no horizontal scroll. |
| **430px** | Large phone; content width capped with `max-width: 390px` centered so layout does not stretch awkwardly. |

## Artifacts

| File | Purpose |
| --- | --- |
| `mockup.html` | Self-contained HTML/CSS, both screens |
| `screenshots/01-intro-390.png` | Intro screen |
| `screenshots/02-airport-selection-390.png` | Airport selection screen |

## Reference in repo (baseline)

- Brand mark: `src/app/globals.css` (`.gw-brand-icon`, welcome shell)
- Current welcome flow: `src/components/WelcomeAirportScreen.tsx`, `AirportSelectionBootScreen.tsx`
