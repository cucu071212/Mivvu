# GW-ICN-019 — Implementation handoff (GW-ICN-013–017)

**Design acceptance:** human owner **accepted** (2026-10-29). Implementation tasks below may proceed after this design merges; they do not reopen IA, header inset, or EN disclosure rules.

## Route map

| Route | Task | Design deliverable |
| --- | --- | --- |
| `/icn` (extend) | GW-ICN-014, GW-ICN-017 | Hub layout, category chips, tappable cards, saved toolbar entry, query sync |
| `/icn/f/[ref]` | GW-ICN-013, GW-ICN-015 | Section hierarchy, flags disclaimer, situation panel, save CTA |
| `/icn/saved` | GW-ICN-016 | List, empty/stale/storage failure UX |

## GW-ICN-013 — Detail route

- Wire `resolveIcnFacilityRef` with **full** normalized catalogs (GW-ICN-012).
- **Primary block** order matches prototype: name → location line → hours (snapshot) + inline uncertainty → **Save** → category subtitle; resolver banners when needed.
- **Secondary:** `<details>` listing notes (directory flags, limits, collected-on date, source).
- Map resolver statuses to banners: `missing` → missing listing copy; `ambiguous` → bilingual pairing copy; never pick first `sourceId` match.
- Create refs with `createIcnFacilityRef` at browse→detail boundary from normalized record, not from `browse-{index}` id alone.
- **URL encoding:** URI-encode `serializeIcnFacilityRef` once at transport; parse decoded value — validate length limits in integration tests.

## Revision 2 UI notes (2026-10-29)

- Implement **two-row ICN header** per prototype CSS (`mivvu-icn-header-row1/2`): **right-aligned Mivvu** on row 1 with **`margin-inline-end: var(--mivvu-surface-inline-pad)`** so the wordmark sits inside the same content rail as search/cards (see `11-header-browse-ko-390px.png`); row 2 language control at the **content rail outer edge**, not past it.
- **Category filter:** collapsed trigger + expandable panel; store KO `categoryKey`; display locale-specific labels.
- **Detail:** primary column + `<details>` for listing notes; copy uses **collected-on** wording in production messages.
- **Counts:** show preview/full distinction if production uses paged or full catalog load (prototype only has subset).
- **EN presentation:** production should use resolver/catalog EN fields; KO field fallback only with disclosure. Prototype JSON was backfilled from fixtures for representative rows; **`enMissingInPrototype`** marks rows still without an EN object in the design dataset.

## GW-ICN-014 — Category discovery

- UI: **disclosure selector**, not always-expanded grid.
- Active filter pills + clear — match prototype interaction.
- Do not index KO fallback display text for search unless human approves (open item from GW-ICN-011).

## GW-ICN-015 — Situation panel

- Implement three lists from design rationale; populate “known” from resolved record fields only.
- Do **not** compare clock to hours text for “open now” without separate human approval.

## GW-ICN-016 — Saved (local)

- Storage: `localStorage` or `IndexedDB` wrapper — store `{ ref: serialized, savedAt }`.
- Cap size (proposal: 50 — **human to confirm**).
- Locale toggle resolves same stored ref; stale → remove affordance.
- Copy for `reference_content_not_found` must not imply we know *why* content disappeared (012 note).

## GW-ICN-017 — Exploration state

- Sync `q`, `terminal`, `category` to URL on hub.
- `history.pushState` / App Router equivalent so **Back** from detail restores hub filters.
- Restore scroll on hub return (prototype: sessionStorage; choose Next.js-compatible approach).
- Direct entry to detail: show `directDetailFallback` pattern when no hub history.

## Component / style integration

- Reuse `mivvu-entry.css` tokens and existing ICN browse classes; add modifiers for card links, category wrap row, detail sections, save bar.
- Keep `MivvuWordmark`, `MivvuLanguageToggle`, snapshot aside patterns from `MivvuIcnFacilitiesBrowseScreen`.

## Test hooks (GW-ICN-018)

- Playwright mobile 360/390/430: search + category filter, open detail, back with query preserved, save + reopen, stale simulated fixture row, KO/EN toggle on detail.
- Representative fixture rows (traceable): `% 아라비카` (`sourceId` 3289), `We All Dream of Flying…` (`2021`), `동측장기주차타워` (`2821`, missing hours).

## Explicit decisions for human reviewer

1. Approve **toolbar saved entry** vs hub-only section.
2. Approve **collapsed type selector** vs always-visible chip grid.
3. Confirm **saved list cap** and storage API preference.
4. Accept **detail section order** and situation panel scope for GW-ICN-015.
5. Choose **URL ref transport** strategy given verbose JSON refs (path segment vs short internal id mapping — mapping is new contract work if chosen).
