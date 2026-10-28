# GW-ICN-006 — production smoke evidence

**Plan revision:** `GW-PLAN-REV-2026-10-26`  
**Target:** https://gate-wise-iota.vercel.app  
**Source SHA:** `556943b020749405f34f4b21622fbd1f5993bce0` on `main`  
**Performed:** 2026-10-28 (Cursor, post-deploy)  
**Method:** Browser automation on live production after Vercel commit status **success** ([deployment](https://vercel.com/gate-wise/gate-wise/5jA6L2Fo3MffGQ2AjrwcputsQNgW)). No live ICN API calls or active scans.

## Preconditions verified (release gate)

| Check | Result |
| --- | --- |
| PR #2 head | `556943b` |
| PR #2 merged | Yes — `merged_at` 2026-10-28T15:43:25Z |
| `origin/main` | `556943b` |
| GitHub combined status on SHA | **success** (Vercel) |
| Production HTML | Served **Mivvu** title on `/` after deploy (curl poll; `age: 0` on fresh response) |

## Smoke results

| Flow | Result |
| --- | --- |
| `/` | Mivvu intro observed, then airport selection (KO default `.mivvu-entry-locale-root` **`lang="ko"`**; document `lang="en"`) |
| `/icn` | KO browse: search label, terminal chips, **1,011** count, snapshot limitation copy present |
| `/icn` EN toggle | English UI; locale root **`lang="en"`**; terminal filter (**475** of 1,011 for Terminal 1); search empty state for `Peet` |
| Fresh `/explore` (storage cleared) | Redirected to `/` airport selection |
| SFO selection → `/explore` | **Explore SFO** CTA reached `/explore` and remained there |
| `/flight` | GateWise Flight shell reachable after acknowledgment |
| `/recommendations` | Results page reachable (26-place browse control present) |
| `/plan` | My Plan / two-stop demo reachable |
| `/preview/mivvu-entry` | Client navigation to **`/`** |
| `/preview/mivvu-entry/icn` | Client navigation to **`/icn`** |
| SFO pages | Document **`lang="en"`** on `/plan` |

## Network / console

- Spot-check via Performance API on `/plan`: static `_next` assets returned **HTTP 200**; no user-visible broken layout in exercised flows.
- Full console capture across every route was **not** recorded; owner pre-release E2E run **40715902323** passed on the same SHA.

## Not repeated in this smoke

- Full Vitest / Playwright suite (CI already green on `556943b`).
- Screen-reader session, non-Chromium browsers, physical devices.
- Vercel SSO-protected preview URLs (production alias used instead).

## P3

Ambiguous KO fallback matching — **nonblocking; unchanged**.
