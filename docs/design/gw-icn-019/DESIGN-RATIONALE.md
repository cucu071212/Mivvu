# GW-ICN-019 — Design rationale

Plan revision: **GW-PLAN-REV-2026-10-29**  
Human reviewer: owner (acceptance **pending**)

## Design intent

Extend the **settled Mivvu** first-entry identity (cobalt wordmark, off-white airport shell, compact toolbar, KO/EN toggle, snapshot honesty) into a **single ICN hub** plus **detail** and **saved** surfaces. The six approved user actions stay on **three routes**, not six tabs.

| Action | Primary surface |
| --- | --- |
| 1 Airport change | Existing `/` (unchanged in this design) |
| 2 Search | `/icn` search field (maintain shipped engine in implementation) |
| 3 Browse without names | `/icn` **category** chips + existing terminal chips |
| 4 Inspect | `/icn/f/[ref]` detail sections |
| 5 Suitability | Detail **Situation** panel (GW-ICN-015) |
| 6 Save/revisit | Detail save + `/icn/saved` (or hub entry — see decision below) |

## Revision 2 (2026-10-29 — coordinator visual pass)

### Toolbar (responsive)

Two-row header: **row 1** = back (left) + **Mivvu wordmark (right-aligned inside content rail)**; **row 2** = **Saved** pill (left) and **KO | EN** toggle (right). Row 1 wordmark uses the same **`--mivvu-surface-inline-pad`** inset as search/cards so its right edge sits **inside** the card/search outer boundary (not flush with the phone edge and not tied to the language pill’s outer edge).

**Human decision (2026-10-29):** Owner selected **right-aligned wordmark** with **`--mivvu-surface-inline-pad` inset** (supersedes centered wordmark). **Header and overall design accepted** 2026-10-29 (`11-header-browse-ko-390px.png`).

### Category discovery (density)

**Default collapsed:** a single **Type** control shows the current selection (`전체 유형` / `All types` or chosen value). Tap expands a **panel** of chips (fixture taxonomy); choosing a value closes the panel and shows a removable filter pill. Terminal chips stay a single horizontal scroll row.

### Detail hierarchy and copy

**Above the fold:** name → location line → hours + one-line uncertainty → **Save**. Category as secondary line. Flags, limits, source date, and “what we do not claim” move under **Listing notes and limits** (`<details>`). Prefer **“Information collected on …” / “수집일”** over the word “snapshot” in primary UI.

### English presentation (final correction, same rev 2 layout)

Prototype JSON **pairs EN rows from fixtures** using the same conservative rules as shipped browse matching (`createIcnFacilityRef` / paired fingerprints) — **without** editing production fixtures or resolver. Example: `% 아라비카` (`sourceId` 3289) ships **`% ARABICA`**, **`Near Gate 209 on 3F, Terminal 2`**, and **`Restaurants · Snack / Cafe / Dessert`** on EN cards and detail.

**Display rules in the prototype (design-only):**

| Case | Behavior |
| --- | --- |
| EN record present in prototype data | Show EN name, location, category; no KO fallback hints |
| EN record **absent** in prototype JSON (data gap) | Show **“English listing not in prototype data”** — do **not** substitute the whole KO record |
| EN record present but **empty name/location** (field gap) | Show KO text **only** with explicit disclosure (“Showing the Korean name/location because English is not in the listing”) |
| Labeled **simulated** row (`demo=ko-fallback-demo`) | Preserved: empty EN fields + disclosure + “Simulated for design review” |

Category and terminal chips use **EN fixture labels** when locale is EN (`Restaurants`, `T1`, …).

### Counts

Result line distinguishes **preview subset** (65 rows in prototype JSON) from **full listing** (1,011 collapsed listings in fixtures).

---

## A. Discovery / search hub (`/icn`)

**Hierarchy (top → bottom):** two-row header → title → search → terminal chips (horizontal scroll) → **collapsed type selector** → active filter pills → result count (preview vs full) → tappable cards → collapsible listing info (`<details>`).

**Category taxonomy:** KO eight `large` values; EN six official large labels from fixtures — filter keyed internally by KO `categoryKey`.

**Cards:** Chevron affordance; EN shows `% ARABICA` etc. from EN records; fallback hints when EN field empty (simulated row documents the pattern).

**Source/date/coverage:** Collapsed **About this listing** at list bottom; same pattern on saved screen.

## B. Facility detail (`/icn/f/[ref]`)

**Primary block:** Name, combined location line, hours + inline “not open now” note, save control, category subtitle.

**Secondary:** Expandable listing notes (directory labels, limits, collected-on date, source).

**Save:** Inline in primary block (not only sticky footer).

## C. Saved facilities (`/icn/saved`)

**Entry:** **Saved** pill on row 2 (not overlapping wordmark).

**Stale:** Demo scenario shows remove affordance on saved screen without faking a detail view in screenshots.

**Storage failure:** Non-blocking error on saved screen and on save action (mirrors locale storage degradation pattern).

## D. Navigation and state (GW-ICN-017 preview)

**Recommended URL query on hub:** `q`, `terminal`, `category` (names fixed at implementation).

**Browse → detail → back:** Browser history + restored query; **scroll position** stored per hub session (prototype uses `sessionStorage`; production may use `history.state` or equivalent).

**Locale toggle:** Same route and query; re-resolve **same stored ref** on detail/saved (GW-ICN-012 — do not rewrite ref on toggle).

**Direct detail:** Show fallback banner when no prior hub state; offer list CTA — do not fabricate browse context.

**Reference transport (implementation decision, not redesigned here):** Store full serialized ref in saved list; for URLs prefer encoded ref segment or server lookup — **never** show raw JSON to users. Verbose refs (~1 KB) noted in 012 handoff.

## Alternatives (human decision only where consequential)

1. **Saved route vs hub section:** Prototype uses **`/icn/saved` route** for clarity and deep links. Alternative: expandable section on hub — simpler chrome, weaker revisit affordance.
2. **Category filter layout:** Prototype uses **collapsed disclosure** (default). Alternative: always-visible chip grid (rejected for vertical cost).
3. **Filter on `large` only vs any tier:** Recommend **`large` only** for chip count and traveler mental model; medium/small remain visible on cards.

## Preservation confirmation

- Mivvu intro timing, wordmark, airport selection, SFO `/explore` gate — **unchanged**
- Shipped ICN search pipeline — **not redesigned** (prototype filter is stand-in)
- GW-ICN-012 resolver — **not modified**; UI consumes outcomes only
- No live hours, maps, walks, accounts, or six-tab IA

## Copy examples (new strings — KO / EN)

| Key | KO | EN |
| --- | --- | --- |
| Hours snapshot disclaimer | 스냅샷에 기록된 시간입니다. 지금 영업 중인지는 알 수 없습니다. | Hours come from the snapshot text only. We cannot tell if it is open now. |
| Flag disclaimer | 위 구분은 공항 목록에 적힌 정보뿐입니다… | These labels are directory metadata only… |
| Saved local note | 이 기기에만 저장됩니다… | Saved on this device only… |
| Missing listing | 현재 스냅샷에서 이 시설을 찾을 수 없습니다… | This facility is not in the current snapshot… |

## Skills and tools used

- **UI UX Pro Max:** loaded; queries for mobile back navigation and chip reflow (verified matches applied above).
- **Hallmark:** instructions read; **not applied** — would conflict with “preserve Mivvu identity” and existing entry CSS tokens.
- **verification-before-completion:** Playwright capture with screen/locale/title asserts **and** visible EN card text (`% ARABICA`, `Near Gate 209`; no silent KO on default EN browse).
