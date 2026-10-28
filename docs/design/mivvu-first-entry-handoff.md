# Mivvu first-entry slice — implementation handoff

**Task:** Bounded GW-ICN-003 slice (local only; not merged).  
**Stitch reference:** `docs/stitch_gatewise_mobile_screens/` (screen PNG + `code.html`).  
**Preview URL:** `http://localhost:<port>/preview/mivvu-entry` (run `npm run dev` or `npm run build && npx next start -p 3025`).

**Screenshots (390px, iPhone 12 profile):** `docs/design/mivvu-first-entry-screenshots/01-intro-390.png`, `02-airport-selection-390.png` (regenerate: `MIVVU_PREVIEW_URL=... node scripts/capture-mivvu-entry-screens.mjs`).

## Delivered

- Cobalt intro with shared `MivvuWordmark` (Stitch typography: spaced inner “v”).
- Airport selection matching Stitch hierarchy (ICN default, SFO selectable).
- Functional search + empty state; CTA `Explore ICN` / `Explore SFO`.
- Intro once per browser session (`sessionStorage`); ~1.2s auto-advance; tap/keyboard dismiss; reduced-motion bypass.

## Integration gap

- **ICN browsing is not implemented.** `Explore ICN` shows an accessible alert; no navigation.
- **SFO** persists existing `gatewise.airport-selection.v1` preference and routes to **`/explore`** (SFO facility data only).
- Main app welcome (`WelcomeAirportScreen`) and global branding remain **GateWise** — unchanged.

## Files

| Path | Role |
| --- | --- |
| `src/app/preview/mivvu-entry/` | Isolated preview route + Plus Jakarta Sans layout |
| `src/app/mivvu-entry.css` | Entry-only tokens and layout |
| `src/components/mivvu/*` | Intro, airport, wordmark, flow orchestrator |
| `src/data/mivvu-entry-airport-catalog.ts` | ICN + SFO catalog |
| `src/lib/mivvu-entry-intro-session.ts` | Session intro flag |
