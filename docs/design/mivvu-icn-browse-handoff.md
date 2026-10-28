# Mivvu ICN browse UI — GW-ICN-004 bounded slice handoff

**Plan revision:** GW-PLAN-REV-2026-10-26  
**Branch:** `feat/mivvu-first-entry-slice` (feature-branch integration for draft PR review; not production)

---

## Canonical routes and legacy preview redirects

| Screen | URL |
| --- | --- |
| Entry (intro + airport) | `/` (canonical); `/preview/mivvu-entry` redirects |
| ICN facility browse | `/icn` (canonical); `/preview/mivvu-entry/icn` redirects |

Local (production build): `http://127.0.0.1:3113/` and `http://127.0.0.1:3113/icn` after `npm run build && npm run start -- --hostname 127.0.0.1 --port 3113`.

---

## Changed files (browse + language)

| Path | Role |
| --- | --- |
| `src/lib/mivvu-preview-locale.ts` | `ko` / `en`, `localStorage` key `mivvu.preview.locale.v1`, browser default |
| `src/lib/mivvu-preview-messages.ts` | Shared KO/EN copy (no i18n package) |
| `src/components/mivvu/MivvuPreviewLocaleProvider.tsx` | Locale context; boot shell until post-mount resolve |
| `src/components/mivvu/MivvuLanguageToggle.tsx` | Accessible 한국어 / English control |
| `src/lib/icn-facilities/load-icn-facilities-fixture.ts` | KO + EN fixture loaders |
| `src/lib/icn-facilities/icn-browse-display.ts` | KO-only fallback hints for missing EN name/location |
| `src/lib/icn-facilities/icn-browse-view-model.ts` | `buildIcnBrowseCatalog(fixture, locale)` |
| `src/components/mivvu/MivvuIcnFacilitiesBrowseScreen.tsx` | Dual catalogs; preserves search + terminal on language change |
| `src/components/mivvu/MivvuIcnBrowsePageClient.tsx` | Client wrapper for browse route |
| `src/components/mivvu/MivvuAirportSelectionScreen.tsx` | Messages + language toggle |
| `src/components/mivvu/MivvuEntryLayoutShell.tsx` | Shared entry layout with locale provider |
| `src/app/(mivvu-entry)/icn/page.tsx`, `src/components/mivvu/MivvuIcnBrowsePage.tsx` | Canonical `/icn`; builds KO + EN catalogs server-side |
| `src/app/preview/mivvu-entry/` | Redirects legacy preview paths to `/` and `/icn` |
| `src/app/mivvu-entry.css` | Language toggle + browse layout |
| `scripts/capture-mivvu-entry-screens.mjs` | 390px captures including KO/EN browse |

Adapter/sync unchanged in this slice; fixture files unchanged.

---

## Mobile layout (2026-10-28 compact browse)

- Single toolbar row: back + compact wordmark + language toggle; EN back label **Airports**.
- Page title only (intro lead removed); search hint **한국어로 검색** / **Search in English** (`aria-describedby`).
- Terminal chips: horizontal scroll, short labels (T1/T2, **P02 → 탑승동/Concourse** from fixture location text; portal doc lists G01 concourse, not P02 code).
- Result count directly above list; tighter cards; compact T* · floor metadata.

---

## Language behavior

1. **Default:** Korean if `navigator` language list starts with `ko`; otherwise English.
2. **Persistence:** Explicit toggle writes `mivvu.preview.locale.v1` and restores on later visits.
3. **Hydration:** Boot shell until locale resolves after mount (avoids flash/mismatch).
4. **Fixtures:** UI loads `icn-facilities-ko.json` or `icn-facilities-en.json` by locale; search runs on displayed language only.
5. **Navigation:** Locale kept between airport selection and ICN browse; intro session flag unchanged (no intro replay on return).
6. **Missing data:** Omit optional category/hours lines; do not drop rows missing large category. English rows may show KO name/location with localized “Korean listing only” hint when unambiguous (`icn-browse-display.ts`).

---

## Displayed record count

- **1,011** facilities per language after identical-row collapse (from **1,028** raw rows each).
- **164** English raw rows missing large category (`lcategorynm`); **84** rows per language missing hours in fixtures (see `docs/data/icn-facility-adapter-handoff.md`).
- Confirmed: `icn-browse-catalog.fixture.test.ts`, `icn-language-coverage.test.ts` (`ICN_LANG_COVERAGE=1`).

---

## Historical browse-slice verification (2026-10-28, before canonical-route integration)

| Command | Result |
| --- | --- |
| `npm test -- src/lib/icn-facilities src/components/mivvu src/lib/mivvu-preview-locale.test.ts` | PASS (44; 2 skipped sync/investigate) |
| `npm run lint` | PASS |
| `npm run build` | PASS (`/preview/mivvu-entry/icn` static) |
| Screenshots 390px | `03-icn-browse-390-ko.png`, `03-icn-browse-390-en.png` |

Manual: language toggle on airport + browse; terminal + query preserved on switch; SFO → `/explore` unchanged; intro timing 3.2s unchanged.

---

## Screenshots

- `docs/design/mivvu-first-entry-screenshots/03-icn-browse-390-ko.png`
- `docs/design/mivvu-first-entry-screenshots/03-icn-browse-390-en.png`

---

## Remaining limitations (out of scope)

- No facility detail, maps, category chips filter, live API refresh, or recommendation engine.
- No automatic query translation between KO/EN fixtures.
- API `totalCount` (1175) vs fetched rows (1028) not shown in UI; honest copy in footer only.
- Feature-branch entry (`/`) uses Mivvu; SFO Flight is at `/flight`; `/explore`, `/recommendations`, and `/plan` preserve the SFO demo behavior. This is not evidence of production integration or deployment.
- No physical-device, safe-area hardware, manual assistive-technology, or non-Chromium testing; active penetration testing was not performed.

Human owner authorized packaging the implemented entry, ICN browse, KO/EN, and SEC-01/02/03 changes for draft PR review on 2026-10-28. Final verification: [PR packaging handoff](../qa/mivvu-pr-packaging.md). Security scope and residual inline allowances: [security report](../security/mivvu-preflight-review.md). Acceptance remains pending.
