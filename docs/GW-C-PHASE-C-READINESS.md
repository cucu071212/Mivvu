# GW-C — Phase C implementation readiness (planning only)

**Date:** 2026-10-25 (America/New_York)  
**Author:** Engineering Lead Cursor  
**Baseline:** `origin/main` @ `6a847b8e7170e553aeb2d996567e4931e0426c33` (production)  
**Status:** Planning authorized — **no Phase C UI implementation** until human lead dispatches GW-C-001+ individually.

## 1. Upstream gates (record)

| Item | Status |
| --- | --- |
| Phase X | **COMPLETE** (G-X3 @ `6375ae7`; directory **26** browse / **12** recommend) |
| GW-B-R001 | **COMPLETE** (`docs/walking-time-policy.md`) |
| GW-B-001 | **DESIGN REVIEW ACCEPTED** (C01–C18; lead review `e0d11a3`) |
| GW-B-002 metadata-only | **IMPLEMENTED & DEPLOYED** @ `6a847b8` |
| **G-B1 (scoped legacy metadata)** | **APPROVED 2026-10-25** — legacy `D→D=3` demo, per-edge metadata, `legacy-d-v1` manifest |
| **G-B1 (graph / new matrix minutes)** | **HOLD** |
| **G-Data** | **HOLD** (GW-E precondition not met for graph or full B) |
| **G-E / GW-E** | **HOLD** |

Physical routing objectives for Phase B are **not** complete; only the metadata slice shipped.

## 2. Recommended implementation sequence

Priority: user-visible clarity first, lowest coupling to Support’s in-flight bundle second, orientation last (depends on C-001 surfaces).

| Order | Task | Rationale |
| --- | --- | --- |
| **1** | **GW-C-001** | Improves Explore/discovery without new pure libs; establishes detail patterns other tasks reuse. |
| **2** | **GW-C-002** | Hours/timezone copy is high-risk for hydration and trust; **prefer** Support `published-hours` utilities when merged — Lead wires UI only. |
| **3** | **GW-C-003** | First-run orientation should describe the **actual** C-001 directory and C-002 hours policy; implement after C-001 (and ideally after C-002 policy is fixed). |

**G-C0** (human UX smoke + a11y on preview) remains the exit gate for **G-E** re-authorization — not automatic when C-001–C-003 code merges.

---

## 3. GW-C-001 — Facility detail and discovery

### Current deficiencies (UI / UX)

- **Information hierarchy:** `FacilityBrowseCard` lists rows; there is no dedicated **detail** route or expandable panel for full provenance, hours block, contact, and official link in one place for **all 26** browse rows.
- **Cross-terminal context:** T3 construction notice exists when T3 visible; HM1/IT browse rows lack consistent “browse-only / no recommend” affordance at card level (scope note is page-level only).
- **Navigation:** Users must infer relationship between Explore cards and `/recommendations` timing cards (`AmenityCard` / `FacilityInformation` patterns differ).
- **Responsive:** Directory is a single column list; long official excerpts and badge rows may crowd small viewports without a defined detail layout (`.gw-rail` on Flight/Plan not mirrored on Explore).

### Proposed files (Lead-owned — implement only when authorized)

| File | Change |
| --- | --- |
| `src/components/FacilityBrowseCard.tsx` | Link or button to detail surface; consistent browse-only badge |
| `src/components/screens/ExploreScreen.tsx` | Layout rail alignment; optional detail slot / modal host |
| **New** `src/components/FacilityDetailPanel.tsx` (or sheet) | Consolidated hours, amenities, provenance, official URL |
| `src/components/FacilityInformation.tsx` | Reuse subsections where possible to avoid duplicate copy |
| `src/app/globals.css` | Detail panel tokens, focus rings, scroll containment |
| `src/components/screens/ExploreScreen.test.tsx` | Directory + detail a11y smoke |
| **New** `src/components/FacilityDetailPanel.test.tsx` | Renders unknown hours, browse-only, official link |

### Acceptance criteria

- All **26** browse-eligible facilities open a detail surface with honest labels (not live hours/queues).
- **12** recommend-eligible IDs show same static fields **plus** unchanged eligibility semantics (no new recommend scope).
- Official `sourceUrl` opens in new tab with visible “listing checked date” when present.
- Browse ≠ recommend copy visible on detail for non-recommend rows.

### Dependencies

- **G-X3** (shipped), **scoped G-B1** (shipped for travel disclaimers on Flight — no change required for C-001).
- No Support bundle required for C-001 core.

### Accessibility and responsive

- Detail surface: focus trap if modal; `aria-labelledby` for title; keyboard Esc to close.
- Touch targets ≥44px; readable line length on 390px (match existing mobile E2E viewport).
- Respect existing `gw-focus-ring` and `role="note"` patterns from Explore scope callout.

### Regression tests

- `ExploreScreen.test.tsx` (extend)
- `FacilityInformation.test.tsx` (reuse expectations)
- `npm test` recommend / batch tests unchanged (no `facilities.json` edits)
- Playwright: optional `e2e/workflows.spec.ts` browse path — run full E2E before release

### Complexity

**Medium** (3–5 lead days) — mostly UI composition, no engine changes.

---

## 4. GW-C-002 — Published-hours and airport-local timezone UX

### Current deficiencies

- `format-facility-hours.ts` handles `unknown` + `rawText`; airport-scale **policy** (America/Los_Angeles, DST boundaries, “not live”) is not centralized in one user-facing doc string reused across Explore + Results.
- Risk of **hydration mismatch** if client-only `toLocaleString` appears in SSR-visible labels (GW-A-003 / `format-boarding-time` pattern must be followed).
- Multi-terminal dataset increases chance of inconsistent hours presentation between `FacilityBrowseCard` and `AmenityCard`.

### Proposed files (Lead-owned UI integration)

| File | Change |
| --- | --- |
| `src/lib/format-facility-hours.ts` | **Lead:** only if Support bundle does not own — prefer **import Support API** after handoff |
| `src/components/FacilityBrowseCard.tsx` | Hours line via shared formatter |
| `src/components/AmenityCard.tsx` | Same formatter; consistent disclaimer |
| `src/components/screens/FlightScreen.tsx` | Cross-link hours policy footnote if needed |
| `docs/data-provenance.md` | Policy appendix (Lead) — display rules, not data rows |
| Tests: `format-facility-hours.test.ts`, component tests | Extend for DST edge fixtures |

### Acceptance criteria

- Documented timezone policy: **America/Los_Angeles** for published facility hours; UI states hours are **static listings**, not live open/closed.
- No SSR/client text mismatch on facility hours labels in Explore and Recommendations.
- Unknown hours remain visibly unknown (never blank or “closed”).

### Dependencies

- GW-A-003, GW-X-003 (shipped).
- **Engineering Support Codex — GW-C-SUPPORT-BUNDLE:** `published-hours` (or equivalent) pure module + tests — **Lead should wait for merge** or agreed import surface before duplicating logic.

### Accessibility and responsive

- Hours text must not rely on color alone for “unknown”.
- Screen reader: include “hours not verified live” in accessible name or description where hours shown.

### Regression tests

- Existing `format-facility-hours.test.ts` + AG1/Vino Volo `rawText` cases must stay green.
- Support adversarial timezone tests (when merged) run in CI; Lead runs full `npm test` + E2E on integration branch.

### Complexity

**Medium–High** (4–6 lead days) — **lower** if Support library lands first; **higher** if Lead must bridge interim duplication (avoid).

### Support required?

**Yes (recommended)** for DST/published-hours pure logic. Lead owns presentation wiring only.

---

## 5. GW-C-003 — First-run orientation

### Current deficiencies

- Explore header explains browse vs recommend; **first-time** visitors on `/` (Flight) may not see SFO-wide scope before setting gate/time.
- No dismissible, session-persistent orientation that covers **26 vs 12**, demo travel estimate, and no live flights.

### Proposed files

| File | Change |
| --- | --- |
| `src/components/GateWiseHome.tsx` or `AppShell.tsx` | Optional first-visit banner / dialog trigger |
| **New** `src/components/ScopeOrientationBanner.tsx` | Honest copy; `localStorage` or session flag |
| `src/components/screens/ExploreScreen.tsx` | Secondary link “About this directory” |
| `src/app/globals.css` | Banner layout in rail |
| Tests: `Accessibility.test.tsx`, new banner test | Dismiss, focus, no false live-data claims |

### Acceptance criteria

- Short copy: SFO directory scope, recommend limited to T2 D Gates, demo times, not navigation.
- Dismiss persists for session or 7-day local policy (lead choice at implement time).
- Does not block countdown or form inputs (non-modal banner preferred).

### Dependencies

- **GW-C-001** (detail/discovery vocabulary should match orientation copy).

### Accessibility and responsive

- Banner: `role="region"` + `aria-label`; dismiss control named.
- Mobile: banner does not cover countdown dock (Level 2.7 layout).

### Regression tests

- Component tests for dismiss + storage key.
- Full E2E smoke: Flight still usable with banner visible.

### Complexity

**Small–Medium** (2–3 lead days).

### Support required?

**No** for core copy; optional link to Support docs for hours policy after C-002.

---

## 6. Parallel work safety — ownership boundaries

### Engineering Lead Cursor (Phase C UI)

| Owns | Does not own |
| --- | --- |
| `src/components/**`, `src/app/**`, `src/app/globals.css` | Support pure libs until integration task |
| Explore / Flight / Plan / Recommendations presentation | `facilities.json`, validate-facilities (Teammate/Support when assigned) |
| Phase C integration tests in component paths | GW-C-SUPPORT-BUNDLE files on Support branch |
| `docs/data-provenance.md` display-policy appendix (coordination) | `published-hours` implementation on Support machine |

### Engineering Support Codex (GW-C-SUPPORT-BUNDLE)

| Owns (in bundle scope) | Lead must not duplicate |
| --- | --- |
| Pure `published-hours` (and related) modules + tests | Same logic in `format-facility-hours.ts` while bundle in flight |
| Timezone/DST adversarial tests | Facility record edits |
| Facility integrity utilities + docs | Recommendation engine, `travel-times.ts`, countdown |

### Expected integration points (no implementation now)

1. **C-002:** Lead imports Support-exported `formatPublishedHours` / `evaluatePublishedHours` (exact name TBD at bundle merge) from `src/lib/…` — single formatter used by `FacilityBrowseCard` and `AmenityCard`.
2. **C-001:** Detail panel reads existing `Facility` type only — no new duration fields.
3. **Regression:** Support bundle merge must not change **12** recommend IDs or `productionTravelMinutes` without separate authorization.

---

## 7. Remaining blockers before Phase C implementation

| Blocker | Owner |
| --- | --- |
| Human authorization per task ID (GW-C-001, then C-002, then C-003) | Engineering Lead (human) |
| Support bundle merge / handoff contract for hours | Support → Lead |
| **G-C0** checklist not yet executed | Lead + human after C tasks |
| Graph routing / full **G-B1** / **G-Data** | **HOLD** — out of Phase C scope |

## 8. Recommended next implementation task

**Authorize GW-C-001 only** after human review of this plan. Do not start GW-C-002 until C-001 acceptance or explicit parallel authorization; coordinate C-002 with Support bundle readiness.
