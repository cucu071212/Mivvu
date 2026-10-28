# Mivvu first-entry slice — implementation handoff

**Task:** Bounded GW-ICN-003 slice + main-entry integration on the feature branch (2026-10-28; not merged).

**Plan revision:** `GW-PLAN-REV-2026-10-26`

**Checkpoint (preview + QA):** `518534a` on `feat/mivvu-first-entry-slice`.

**Stitch reference:** `docs/stitch_gatewise_mobile_screens/` (screen PNG + `code.html`).

## Canonical routes (integrated entry)

| Screen | URL |
| --- | --- |
| Intro + airport selection | `/` |
| ICN facility browse | `/icn` |
| SFO GateWise demo | `/explore`, `/flight`, `/recommendations`, `/plan` |

**Legacy preview URLs** (redirect to canonical): `/preview/mivvu-entry` → `/`, `/preview/mivvu-entry/icn` → `/icn`.

**Local verification server (production build):** `http://127.0.0.1:3113/` after `npm run build && npm run start -- --hostname 127.0.0.1 --port 3113`.

**Screenshots (390px):** `docs/design/mivvu-first-entry-screenshots/` (regenerate: `MIVVU_PREVIEW_URL=http://127.0.0.1:<port>/ node scripts/capture-mivvu-entry-screens.mjs`).

## Delivered

- Cobalt intro with shared `MivvuWordmark` (Stitch typography: spaced inner “v”).
- Airport selection matching Stitch hierarchy (ICN default, SFO selectable).
- Functional search + empty state; CTA `Explore ICN` / `Explore SFO`.
- Intro once per browser session (`sessionStorage`); **3.2 s** auto-advance (400 + 2500 + 300 ms); tap/keyboard dismiss; reduced-motion bypass.
- **ICN browse** at `/icn` from KO/EN fixtures; SFO persists `gatewise.airport-selection.v1` and routes to **`/explore`** only.
- Unacknowledged SFO app routes redirect to **`/`** (Mivvu); `WelcomeAirportScreen` retained for unit tests, not main entry.
- Shared layout shell: `MivvuEntryLayoutShell`; route constants: `src/lib/mivvu-entry-routes.ts`.

## Files

| Path | Role |
| --- | --- |
| `src/app/(mivvu-entry)/` | Canonical `/` + `/icn` + Mivvu metadata |
| `src/app/preview/mivvu-entry/` | Redirect-only legacy preview paths |
| `src/app/(app)/flight/page.tsx` | SFO Flight (moved from `/`) |
| `src/app/mivvu-entry.css` | Entry-only tokens and layout |
| `src/components/mivvu/*` | Intro, airport, browse, wordmark, flow |
| `src/lib/mivvu-entry-routes.ts` | Canonical + preview path constants |
| `src/data/mivvu-entry-airport-catalog.ts` | ICN + SFO catalog |
| `src/lib/mivvu-entry-intro-session.ts` | Session intro flag |

## Remaining limitations

- Full GW-ICN-003 shell redesign still **pending**; only entry + ICN browse + SFO demo paths integrated on the feature branch.
- Human owner authorized commit, normal feature-branch push, and draft PR packaging on 2026-10-28. Review remains pending; `main` merge and production promotion remain unauthorized.
- Fixture/sync limits unchanged (see ICN browse handoff and GW-ICN-005 QA).

## Verification (historical integration pass)

| Command | Result |
| --- | --- |
| `npm test` | PASS (996 passed, 2 skipped) |
| `npm run lint` | PASS |
| `npm run build` | PASS |
| `git diff --check` | Previously reported PASS; fresh packaging review found trailing spaces on lines 3–5, repaired without changing meaning |
| `MIVVU_QA_ORIGIN=http://127.0.0.1:3113 node scripts/qa-mivvu-preview.mjs` | PASS |
| `npx playwright test e2e/airport-selection.spec.ts e2e/navigation.mobile.spec.ts` | PASS (9) |

Final combined verification and publication evidence: [PR packaging handoff](../qa/mivvu-pr-packaging.md). ICN uses saved KO/EN snapshots with incomplete API coverage; see [browse handoff](mivvu-icn-browse-handoff.md). Active penetration testing was not performed; physical-device and non-Chromium testing remain unperformed. Packaging is not an independent code audit or a security guarantee.
