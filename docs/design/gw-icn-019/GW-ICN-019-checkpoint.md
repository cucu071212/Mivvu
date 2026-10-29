# GW-ICN-019 checkpoint

Plan revision: **GW-PLAN-REV-2026-10-29**  
Owner: Cursor · Design acceptance: **human owner (accepted 2026-10-29)**  
Revision: **rev 2** + **EN presentation correction** + **right-aligned wordmark with content-rail inset** (header accepted via `11-header-browse-ko-390px.png`)

## Workspace

| Item | Value |
| --- | --- |
| Worktree (absolute) | `/Users/wonjonghun/Desktop/GateWise-design-gw-icn-019` |
| Branch | `design/gw-icn-019-icn-ux` |
| Base / source | `chore/gw-icn-011-012-package` @ `460be126cddebc8b9df4a00b5fe9d5ea645a775b` (GW-ICN-011 plan + GW-ICN-012 reference module package) |
| Publication | PR into `chore/gw-icn-011-012-package` (depends on that package landing before downstream ICN implementation merges) |

## Before / after (correction pass)

| Issue | Before | After |
| --- | --- | --- |
| Toolbar @ 390px | Single row; “한국어” wrapped; ★ overlapped **Mivvu** | **Two-row header**: back (left) + **right-aligned Mivvu** with **`--mivvu-surface-inline-pad` inset** inside search/card rail; row 2 **Saved** (left) + **KO \| EN** (right, at content rail outer edge) |
| Category discovery | Eight chip rows always visible | **Collapsed type selector** (shows current value; panel expands on tap; closes on pick) |
| Detail | Many repeated disclaimer cards + bottom save | **Primary block**: name, location, hours + inline uncertainty + **save**; secondary notes in one **`<details>`** |
| Copy | “스냅샷” heavy | Traveler wording: **“수집일 / Information collected on”**, hours note at point of use |
| EN browse | KO category chips on EN screen | **EN category labels** from fixtures (`Restaurants`, …); terminals use EN chip labels where available |
| EN default card (Arabica) | KO name/location shown without disclosure (missing `en` in prototype JSON + silent KO substitute) | **`prototype-data.json` EN rows from fixtures**; **`displayFields`** uses EN record; **`recordForLocale`** no whole-record KO swap; default EN shows **`% ARABICA`**, **`Near Gate 209 on 3F, Terminal 2`** |
| KO fallback demo | Mis-captured as KO detail | EN UI + labeled simulated row; detail shows **Korean name** with explicit EN disclosure |
| Counts | Looked like full 1,011 list | **Preview vs full** count line (`65` preview · `1,011` full listing) |
| Screenshots | Mislabeled 03/05 | EN journey **`07`–`10`** + header set **`11`–`16`**; see [`screenshots/README.md`](../design/gw-icn-019/screenshots/README.md) for authoritative vs superseded |

Three-surface structure (**browse / detail / saved**), Mivvu identity, data contracts, and design-only scope **unchanged**.

## Skills and tools

| Skill / tool | Use |
| --- | --- |
| UI UX Pro Max | Toolbar reflow, chip disclosure, touch targets |
| verification-before-completion | Playwright capture gates before completion claims |
| systematic-debugging | Mislabeled screenshots → assert screen/locale/title before capture |
| Playwright | Documented PASS runs in verification table below |
| Hallmark | Not applied (preserve Mivvu) |

## Verification actually run

| Command | Result |
| --- | --- |
| `GW_ICN_019_PORT=8766 node docs/design/gw-icn-019/capture-screenshots.mjs` | **PASS** (historical full suite — 10 scenarios × 3 widths) |
| `GW_ICN_019_EN_ONLY=1 GW_ICN_019_PORT=8767 node docs/design/gw-icn-019/capture-screenshots.mjs` | **PASS** — EN `07`–`10`; visible `% ARABICA` / `Near Gate 209`; fallback disclosure |
| `GW_ICN_019_PORT=8768 node docs/design/gw-icn-019/capture-header-screenshots.mjs` | **PASS** — content-rail alignment (browse/detail/saved × KO/EN × 360/390/430); header PNGs `11`–`16` @ 390px |
| Production / `src/` | **NOT RUN** (design-only) |

**Limitations:** Not a physical device; not screen-reader certified; prototype filter simplified vs shipped search.

## Artifacts (publication commit)

- Prototype: [`docs/design/gw-icn-019/`](../design/gw-icn-019/) (`index.html`, `prototype.css`, `prototype.js`, `prototype-data.json`, capture scripts)
- Screenshots: [`docs/design/gw-icn-019/screenshots/`](../design/gw-icn-019/screenshots/) — **canonical header:** `11-header-browse-ko-390px.png`
- Docs: `DESIGN-RATIONALE.md`, `IMPLEMENTATION-HANDOFF.md`, `README.md`, `screenshots/README.md`
- Checkpoint: this file

## Remaining human decisions (implementation — not design reopen)

1. Saved list **cap** and **storage API** preference (GW-ICN-016)  
2. **URL ref transport** (verbose encode vs short id map) (GW-ICN-013/017)  
3. KO fallback searchable or not (GW-ICN-011 open item)

Accepted design (closed): toolbar saved entry + `/icn/saved`, category **disclosure**, detail section order, two-row **inset** header.

## Next action

**GW-ICN-013+** may proceed per implementation plan once this design PR is merged into the ICN package branch. Do not implement in the design PR itself.

## Preservation

No production `src/`, resolver, fixture, or dependency manifest changes in this deliverable.
