# GW-ICN-011 — ICN product flow and implementation planning

**Plan revision:** `GW-PLAN-REV-2026-10-28`
**Task:** GW-ICN-011 (planning documentation only — not implementation authorization)
**Evidence base:** Application source and fixtures @ [`2e56a28c16ebd71eb202db7aa428db7ba9b50b78`](https://github.com/cucu071212/Mivvu/tree/2e56a28c16ebd71eb202db7aa428db7ba9b50b78). Architecture map: [GW-ICN-010 code map @ PR #5](https://github.com/cucu071212/Mivvu/blob/1c3f7215f44e48e8fc89736b0829fd2e5f667aea/docs/analysis/GW-ICN-010-code-map.md) (not on `main` @ `2e56a28`; local path after merge: `docs/analysis/GW-ICN-010-code-map.md`).

Human-approved direction (recorded in [`PLAN.md`](../../PLAN.md)): improve ICN into a coherent useful mobile app; evaluate proportionate SFO connections; use the result as a credible demo for official API outreach — with ICN valuable on its own. The **six core user actions** are approved product direction, not permission to build them yet.

---

## A. Six actions — capability, gaps, scope, and criteria

Legend: **Evidence** = current behavior with source pointers @ mapped SHA. **Scope** = recommended ICN product boundary. **Done when** = observable completion criteria for a future implementation task. **Deps** = data or technical prerequisites.

### 1. Choose or change an airport

| | |
| --- | --- |
| **Evidence** | `/` → `MivvuFirstEntryFlow` (intro session `mivvu.entry.introSeen.v1`, timing [`mivvu-entry-intro-timing.ts`](../../src/lib/mivvu-entry-intro-timing.ts)) → `MivvuAirportSelectionScreen` with ICN + SFO catalog ([`mivvu-entry-airport-catalog.ts`](../../src/data/mivvu-entry-airport-catalog.ts)). ICN CTA → `/icn`; SFO CTA → `acknowledgeAirportSelection` then `/explore` ([`MivvuAirportSelectionScreen.tsx`](../../src/components/mivvu/MivvuAirportSelectionScreen.tsx)). ICN browse **Back** → `/` ([`MivvuIcnFacilitiesBrowseScreen.tsx`](../../src/components/mivvu/MivvuIcnFacilitiesBrowseScreen.tsx)). SFO **Change airport** → `/` without clearing SFO acknowledgment ([`AppShell.tsx`](../../src/components/AppShell.tsx)). |
| **Remaining need** | No durable “last selected airport” for ICN return visits; catalog still marks ICN `coming_soon` while `/icn` is live. Changing airport from ICN loses in-memory browse state (expected today). |
| **Recommended scope** | Keep intro → airport selection entry (**settled**). Allow change-airport from ICN hub without entering SFO demo. Align catalog availability copy with honest ICN support. Optional: persist last airport in localStorage (**open decision** — not approved). |
| **Done when** | User can reach `/` from ICN and SFO demo paths; select ICN or SFO; KO/EN messages consistent; no SFO gate bypass for `/explore`. Viewport checklist 360/390/430. |
| **Deps** | Existing Mivvu routes ([`mivvu-entry-routes.ts`](../../src/lib/mivvu-entry-routes.ts)). |
| **Open decisions** | Persisted airport preference? **Owner:** human owner. **Reviewer:** Cursor integration. |

### 2. Search for a facility

| | |
| --- | --- |
| **Evidence** | Locale-local pipeline: `filterIcnBrowseItems` → `searchIcnIndex` ([`icn-facility-search.ts`](../../src/lib/icn-facilities/icn-facility-search.ts), [`icn-browse-view-model.ts`](../../src/lib/icn-facilities/icn-browse-view-model.ts)). UI: controlled search input, live result count, terminal filter before typo fallback. Shipped via GW-ICN-008/009. |
| **Remaining need** | Search does not cover floor/hours/sourceId as separate fields (by design). English display may show KO fallback lines ([`icn-browse-display.ts`](../../src/lib/icn-facilities/icn-browse-display.ts)) — not searchable unless product changes. |
| **Recommended scope** | **Do not rewrite search** without a documented unmet need. Extend only if detail/category surfaces require new indexed fields (explicit task). |
| **Done when** | Existing adversarial tests and `e2e/icn-facility-search.mobile.spec.ts` expectations still pass after adjacent UI work; no regression in terminal retention across locale toggle. |
| **Deps** | Immutable catalog arrays per request (WeakMap cache assumption). |
| **Open decisions** | Whether KO fallback display text should ever be searchable. **Owner:** human owner. |

### 3. Browse facilities without knowing names

| | |
| --- | --- |
| **Evidence** | Empty query lists all listings in catalog order; **terminal chips** filter by raw `terminalId` ([`icn-browse-view-model.ts`](../../src/lib/icn-facilities/icn-browse-view-model.ts)). Categories appear as joined `large` / `medium` / `small` on cards only — **no category browse/filter UI**. |
| **Remaining need** | Travelers who do not know facility names need **type-led discovery** (e.g. food, lounge) using fields already in the adapter — not new invented groupings. |
| **Recommended scope** | Add discovery using **existing** taxonomy strings from fixtures/API ([`IcnFacilityBrowseRecordCore.categories`](../../src/types/icn-facility-browse.ts)). Prefer chip or secondary filter row on `/icn` (same screen) over a new tab bar. Show counts per terminal/category where data exists; empty honestly. |
| **Done when** | User can filter to a terminal **and** a category value present in snapshot data without typing a name; clearing filters restores full list; snapshot coverage note remains visible. |
| **Deps** | Inventory of distinct category values per locale (offline script or test fixture — no invented labels). GW-ICN-014. |
| **Open decisions** | Filter UX (chips vs sheet); whether to filter on `large` only vs any tier. **Owner:** human owner. **Reviewer:** Cursor + UX review. |

### 4. Inspect facility information

| | |
| --- | --- |
| **Evidence** | Single-screen **cards** on `/icn` show name, terminal/floor line, location, category, hours text, bilingual fallback hints, snapshot aside ([`MivvuIcnFacilitiesBrowseScreen.tsx`](../../src/components/mivvu/MivvuIcnFacilitiesBrowseScreen.tsx)). No `/icn/...` detail route; cards are not links. Fields `arrivalOrDeparture`, `dutyFreeFlag`, `sourceId` not shown on card. |
| **Remaining need** | Dedicated inspection with full applicable fields, provenance, duplicate-ID / ambiguous pairing flags, and clearer separation of **published hours text** vs **live open/closed**. |
| **Recommended scope** | New detail route (e.g. `/icn/f/[ref]`) using **GW-ICN-012** reference; reuse Mivvu shell, locale toggle, honest copy patterns from browse snapshot block. Optional reuse of SFO **presentation patterns** (e.g. [`FacilityDetailDialog.tsx`](../../src/components/FacilityDetailDialog.tsx) section layout) without SFO `Facility` types or recommendation wiring. |
| **Done when** | From browse, user opens detail; **traveler-relevant primary content** shows name, category labels (`large` / `medium` / `small`), terminal/floor/location text, and verbatim `hoursText` with snapshot / not-live-status labeling; `arrivalOrDeparture` and `dutyFreeFlag` shown only as **directory metadata** (what the listing says) — **not** as access rules the user must satisfy. Missing primary fields labeled unknown, not blank. **Technical/diagnostic** fields (`sourceId`, `listingIndex`, resolver status, pairing ambiguity) separated from primary content (collapsed section or support-only — product decision in task). Snapshot source/date/`syncIntegrity` visible. |
| **Deps** | GW-ICN-012 reference; GW-ICN-013. |
| **Open decisions** | URL shape; whether to show raw `sourceId` to users (recommend developer-facing only). **Owner:** Codex (contract), Cursor (UI). |

### 5. Judge suitability / usability for their situation

| | |
| --- | --- |
| **Evidence** | Global snapshot disclaimer on browse ([`icn-browse-view-model.ts`](../../src/lib/icn-facilities/icn-browse-view-model.ts) coverage note). Card hours with ambiguous equal range de-emphasized (`isAmbiguousEqualHours`). **No** gate-time feasibility, security clearance, wheelchair routing, or “near gate” claims. |
| **Remaining need** | Structured help for travelers asking “Can I use this?” within **verified** limits — e.g. departure-only shop, duty-free flag meaning, hours text vs current time — without implying recommendation engine results. |
| **Recommended scope** | Detail-level **Situation** section: bullet **Known from snapshot** / **Unknown or not provided** / **We do not claim** (walking time, live queue, indoor route, accessibility). Optional user-supplied notes later — **not approved** now. |
| **Done when** | Independent reviewer can confirm no sentence implies gate proximity, live open status, or security access without API evidence; KO/EN strings reviewed. |
| **Deps** | GW-ICN-013; no ICN coordinates or SFO walk matrix. GW-ICN-015. |
| **Open decisions** | Whether to show clock comparison to hours text (risky — could imply live open). **Owner:** human owner. |

### 6. Save and revisit facilities

| | |
| --- | --- |
| **Evidence** | **Not implemented.** GW-ICN-010 records saved/favorites as unapproved proposal. |
| **Remaining need** | Local save list, reopen detail, survive reasonable snapshot updates. |
| **Recommended scope** | **Local-only** persistence (localStorage or IndexedDB) keyed by **GW-ICN-012** reference; cap list size; handle stale/missing/ambiguous entries with honest messaging. No accounts. |
| **Done when** | User saves from detail, sees saved list entry point from `/icn`, reopens detail; after simulated snapshot removal, UI shows “no longer in snapshot” not a crash; duplicate `sourceId` rows distinguished by reference. |
| **Deps** | GW-ICN-012 before GW-ICN-016. |
| **Open decisions** | Storage API; max saves; migrate on reference version bump. **Owner:** Codex (contract), Cursor (UI). **Reviewer:** human owner. |

---

## B. Coherent user flow and screen structure

### Design intent

Connect airport selection, discovery, search, inspection, suitability framing, and saved list with **minimal navigation chrome** — not six tabs for six actions. Preserve **settled** Mivvu intro timing, entry routes, locale persistence (`mivvu.preview.locale.v1`), and SFO acknowledgment gate.

### Proposed screen map (recommendation)

| Screen | Route (proposal) | Role |
| --- | --- | --- |
| Intro + airport selection | `/` (existing) | Actions **1**; locale toggle |
| ICN hub (search + browse) | `/icn` (existing, extended) | Actions **2**, **3**, entry to **4**/**6** |
| ICN facility detail | `/icn/f/[ref]` (new) | Actions **4**, **5**; save action |
| ICN saved list | `/icn/saved` (new) or hub section | Action **6** |

SFO demo remains **`/flight` → `/explore` → …** under `(app)` layout — unchanged unless a future outreach task adds a labeled cross-link from ICN hub.

### Representative journeys

1. **Find a known facility** — `/` → ICN → type name in search → open detail from card tap → read hours and flags → optional save.
2. **Discover a type in a terminal** — `/` → ICN → select terminal chip → select category filter (GW-ICN-014) → scroll list → detail.
3. **Recognize unknown conditions** — Detail **Situation** lists unknowns; snapshot aside repeats dataset date and `syncIntegrity`; no live status badge.
4. **Save and revisit** — Detail → Save → `/icn/saved` → tap item → detail; stale entry shows recovery copy.
5. **Return from detail without losing exploration** — Browse state in **URL query** (`q`, `terminal`, `category`) **recommended** over silent session-only state (supports deep links and back stack — aligns with UI UX Pro Max navigation guidance: predictable back, URL reflects state). **Proposal:** GW-ICN-017 implements query sync; browser back from detail restores list filters.

### KO / EN, mobile, accessibility (future verification criteria)

| Topic | Requirement | Future verification (not claimed done in GW-ICN-011) |
| --- | --- | --- |
| Locales | KO/EN toggle on Mivvu surfaces; `lang` on locale root | Existing provider tests + new detail/saved specs |
| Viewports | 360 / 390 / 430 CSS px; safe areas; touch ≥44px; no horizontal scroll | Playwright mobile projects + manual checklist |
| Motion | Respect `prefers-reduced-motion` on intro (existing) | Extend to any new transitions |
| a11y | Visible labels, `aria-live` on result counts (existing), focus order on filters | axe/Playwright assertions on new routes |
| Empty / missing | Empty search, empty category, missing EN name (KO fallback) | Copy review KO+EN |
| Storage failure | Locale already degrades if localStorage blocked | Saved list shows non-blocking error |

### Back and deep-link behavior (proposal)

- **ICN hub** deep link: `/icn?q=coffee&terminal=P01` (exact param names to fix in GW-ICN-017).
- **Detail** deep link: `/icn/f/[ref]` resolves record or shows not-found / ambiguous resolver page.
- **Back** from detail: browser back to hub with query restored; hub **Back** to `/` unchanged.

---

## C. Data and identity prerequisites

### What the snapshot already provides

From [`IcnFacilityBrowseRecordCore`](../../src/types/icn-facility-browse.ts) and shipped fixtures (1011 collapsed listings; 1028 raw rows; `api_total_mismatch`):

- **Categories:** `large`, `medium`, `small` — use for discovery filters after distinct-value inventory (GW-ICN-014). Do **not** invent GateWise category groups.
- **Location text:** `terminalId`, `floor`, `locationDescription` — not measured navigation.
- **Hours:** `hoursText` verbatim — **not** live open/closed.
- **Flags:** `arrivalOrDeparture`, `dutyFreeFlag` — not verified security or airside access.
- **Identity:** `sourceId` (API `sn`) **not reliably unique or stable**; `listingIndex` **snapshot-local**; content collapse via [`icn-snapshot-matching.ts`](../../src/lib/icn-facilities/icn-snapshot-matching.ts).

### Distinctions the product must preserve

| Concept | Label in UI (proposal) | Do not claim |
| --- | --- | --- |
| Published hours string | “Hours (snapshot text)” | Open now / closed now |
| Terminal/floor/location text | “Location (directory text)” | Walking time, map route |
| A/D flag | “Arrival/departure listing (directory)” | That the traveler may or may not enter; security clearance |
| Duty-free flag | “Duty-free listing (directory)” | Purchase eligibility or shop access |

### Identity guarantees (planning — not a settled contract)

A saved reference must be defined in **four separate layers**. A candidate `contentFingerprint` + `listingIndex` supports **deterministic identity within one snapshot** only; it does **not** by itself establish persistent facility identity across fixture updates. **Automatic cross-snapshot reconciliation is not specified here** — any merge/migrate policy requires a future authorized task and human review.

| Layer | Meaning | What a candidate resolver must do |
| --- | --- | --- |
| **Within one snapshot** | Same fixture bytes / same collapsed listing set | Map a stored ref to at most one browse row, or mark **ambiguous** if fingerprint + disambiguators match more than one row |
| **After row reordering** | `listingIndex` assignment changes but content unchanged | Resolve by content fingerprint (and agreed disambiguators), not by index alone; **never** silently attach a saved ref to a different fingerprint |
| **After content changes** | Name, hours, location, categories, flags, or terminal fields change fingerprint | Treat as **content changed** or **missing** — show explicit outcome; **no silent reassignment** to another facility |
| **Locale switch & bilingual pairing** | KO and EN catalogs are related but not always 1:1 | Detail/saved copy follows active locale rules; ambiguous `matchUnambiguousIcnRecords` outcomes surface as ambiguity — do not merge conflicting rows |

### Expected outcomes (saved + detail — proposal)

| Scenario | Expected user-visible outcome | Must not happen |
| --- | --- | --- |
| Name / hours / location / category text changes | Saved entry shows **updated snapshot content** or **content changed since save** (exact copy TBD in GW-ICN-012); user can remove stale save | Treating a different fingerprint as “the same place” without explicit user action |
| Rows reordered only | Saved ref still opens the same content when fingerprint matches | Opening a different facility because `listingIndex` shifted |
| Row removed from snapshot | **Missing from current snapshot**; offer remove from saved list | Crash or blank detail implying facility still exists |
| Duplicate / conflicting `sourceId` | Resolver respects collapse rules; ambiguity flagged | Collapsing two distinct content rows into one save target |
| Ambiguous KO/EN pair | Ambiguity flag; no synthetic merged record | Silent EN/KO merge or hidden conflict |

**Unsupported (explicitly unresolved):** Promising that saves survive every future refresh; auto-migrating refs across arbitrary content edits; inferring that two listings are “the same business” without matching rules above.

### Saved-item behavior (requirements for GW-ICN-012 / GW-ICN-016)

| Event | Expected behavior (proposal) |
| --- | --- |
| Snapshot refresh, fingerprint unchanged | Reference resolves; optional “snapshot date updated” |
| Snapshot refresh, fingerprint changed | **Content changed** or **missing** messaging — not silent swap |
| Row removed | Saved entry marked missing; offer remove from list |
| `sourceId` duplicate / content collision | Reference must not conflate two listings; ambiguity surfaced |
| Locale switch | Detail uses selected locale catalog; saved list shows localized title with fallback rules |
| Ambiguous bilingual pairing | Show ambiguity flag; do not silently merge EN/KO |

### Candidate reference shape (for review — not approved implementation)

**Proposal (Codex-owned GW-ICN-012):** Explore a versioned **`IcnFacilityRef` candidate** (e.g. schema version, content fingerprint aligned with [`icnFacilityContent`](../../src/lib/icn-facilities/icn-snapshot-matching.ts), snapshot disambiguators such as listing index **within that snapshot only**, optional saved-at metadata). Resolver outcomes: `found` | `missing` | `ambiguous` | `content_changed` (exact enum TBD in task). **Local-only** saved store holds refs + `savedAt` — no accounts or cloud sync. **Deliverable is a written contract + tests**, not assumption that fingerprint + index equals permanent identity.

---

## D. SFO connection matrix (proportionate)

| SFO capability | Reusable for ICN | ICN data prerequisite | Defer / do not force |
| --- | --- | --- | --- |
| **Browse + detail UI patterns** | Card/list section layout, focus rings, honest empty states, detail section typography | ICN adapter types; GW-ICN-012 ref | Universal `Facility` schema; SFO zone filters |
| **Flight context + countdown (SFO shipped)** | **Countdown UX** and manual “minutes until boarding starts” / boarding-start time input ([`BoardingCountdownControls`](../../src/components/BoardingCountdownControls.tsx), GW-F2) — **does not require a live flight feed** | ICN has no approved flight context surface; **GW-ICN-011 does not authorize ICN countdown** | Mounting `GateWiseSessionProvider` on `/icn`; implying ICN has boarding time data |
| **Time-feasibility recommendations (SFO)** | Margin/threshold **concepts** for outreach copy only | Directed walk legs, queues, gate landmark, recommend-eligible subset — **missing for ICN** | Calling `recommendFacilities` on ICN rows; treating manual countdown as proof of feasibility |
| **What-if** | Comparative UX patterns | Same as recommendations | ICN What-if without verified durations |
| **Two-stop planning** | None for ICN milestone | N/A | `plan-two-stop-legacy` / D→D demo matrix on ICN |

**Outreach framing (proposal):** Demo ICN Core Journey on mobile; optionally show SFO shipped demo via existing `/explore` path as **separate** “US airport time-budget demo” when pitching SFO — without implying ICN has the same data depth.

---

## E. Implementation sequence summary

See [`docs/IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md) for task IDs, permissions, and reviewers. Ordering rationale:

1. **GW-ICN-012** identity contract — blocks detail refs, deep links, saves; **does not promise** cross-update stability by itself ([GW-ICN-010 §6](https://github.com/cucu071212/Mivvu/blob/1c3f7215f44e48e8fc89736b0829fd2e5f667aea/docs/analysis/GW-ICN-010-code-map.md)).
2. **GW-ICN-013** detail — delivers inspect (**4**) before heavier **5**/**6**.
3. **GW-ICN-014** category discovery — **3**; independent of search rewrite.
4. **GW-ICN-015** suitability panel — **5**; depends on detail surface.
5. **GW-ICN-016** saved — **6**; depends on identity + detail.
6. **GW-ICN-017** exploration state — journey **5** (back without loss).
7. **GW-ICN-018** milestone verification — acceptance of ICN Core Journey in `PLAN.md`; **must include** category discovery (**GW-ICN-014**) and suitability panel (**GW-ICN-015**) in addition to detail, save, and exploration-state tasks (**GW-ICN-013**, **GW-ICN-016**, **GW-ICN-017**). **GW-ICN-014** remains independently schedulable before the milestone gate.

**Codex** defaults: 012, identity edge-case review on 015/016. **Cursor** defaults: 013, 014, 016 UI, 017, 018. **Human owner:** IA/filter decisions, milestone acceptance, outreach scope.

---

## Traceability

| User action | Primary future tasks | Current shipped evidence |
| --- | --- | --- |
| 1 Airport | (optional persist — open) | `/`, `/explore`, back paths |
| 2 Search | maintain | GW-ICN-008/009 |
| 3 Browse without names | GW-ICN-014 | Terminal chips only |
| 4 Inspect | GW-ICN-013 | Cards only |
| 5 Suitability | GW-ICN-015 | Snapshot disclaimers |
| 6 Save/revisit | GW-ICN-012, GW-ICN-016 | None |

**Approved direction vs this document:** Six actions and outreach/useful-ICN direction are **human-approved**. Screen routes, reference schema, storage mechanism, and task ordering are **recommendations** until accepted in `PLAN.md` or an authorized task.
