# GW-ICN-009 — production smoke evidence (ICN search + snapshot integration)

**Plan revision:** `GW-PLAN-REV-2026-10-26`
**Target:** https://gate-wise-iota.vercel.app
**Release merge on `main`:** `bb4735d07f9b5cb68c6b44944ee76e994df801a8` (merge commit for [PR #3](https://github.com/cucu071212/Mivvu/pull/3))
**Integrated feature SHA (PR head):** `aac53a31f76fa520321334d360c22a98048a99cf`
**Performed:** 2026-10-28 (Cursor, post-merge production deploy)
**Method:** Browser automation on live production after GitHub combined status **success** on merge commit ([Vercel deployment](https://vercel.com/gate-wise/gate-wise/8NwdsbYZE9iMtqiqCjiv4fktBibz)). No live ICN API calls, active scans, or public exposure of the offline quality CLI.

## Preconditions verified (release gate)

| Check | Result |
| --- | --- |
| PR #3 head | `aac53a3` |
| PR #3 base | `5bd3121` |
| PR #3 merged | Yes — merge commit `bb4735d` on `main` |
| GitHub regression (run 40770942071) | **success** on PR head (owner-verified pre-release) |
| GitHub combined status on `bb4735d` | **success** (Vercel production) |
| Production cache freshness | `/icn` response `age: 5` after deploy (curl headers) |

## Smoke results (this pass)

| Flow | Result |
| --- | --- |
| `/icn` EN `starbcks` | **6** Starbucks-related listings (typo recovery) |
| `/icn` KO `ㅎㅈㅅ` | **196** listings (initial-consonant search; e.g. 화장실) |
| `/icn` KO terminal filter | **제1여객터미널** with `ㅎㅈㅅ`: **104** shown; empty query + T1: **475** of 1,011 |
| `/icn` empty / no-match | Empty query shows catalog; `zzznomatchicn` → KO empty-state status copy |
| `/icn` locale | KO UI (`한국어` pressed, KO labels); document `lang="en"` (same pattern as GW-ICN-006) |
| `/` → SFO → `/explore` | SFO selected → **Explore** nav current; `/explore` deep link stayed on explore |
| SFO `/explore` | Document **`lang="en"`**; GateWise browse shell present |

## Network / console

- No dedicated console-log harvest on this pass; no user-visible broken layout in exercised flows.
- Static app routes only; no live airport API requests observed in tested flows.

## Not repeated in this smoke

- Full Vitest / Playwright suite (regression **40770942071** already green on PR head).
- Offline `check-icn-snapshots` CLI (maintainer tool; unchanged fixture bytes on release).
- Native OS IME / physical devices (synthetic composition covered in GW-ICN-008 evidence).
- Vercel SSO preview URL (production alias used).

## Prior human preview (PR #3)

Owner reported the same flows working on the protected feature preview before merge authorization. This document records **post-production** Cursor verification only.

## Known limits (unchanged)

- Saved snapshot fixtures; API total mismatch; duplicate `sn` collapse documented in GW-ICN-004/007 evidence.
- P3 ambiguous KO fallback improved but not perfect; native IME behavior not fully instrumented in production smoke.
