# ICN facility adapter — GW-ICN-004 handoff

**Plan revision:** GW-PLAN-REV-2026-10-26  
**Branch:** `feat/mivvu-first-entry-slice` (local, uncommitted)  
**Scope:** Read-only server-side adapter + Korean development fixture (browse-only; no UI wiring).

---

## Files added or changed

| Path | Role |
| --- | --- |
| `src/types/icn-facility-browse.ts` | Browse-only types (`IcnFacilityBrowseRecord`, fixture envelope) |
| `src/lib/icn-facilities/*` | API client, parsers, normalizer, sync, validation, Vitest coverage |
| `src/data/fixtures/icn-facilities-ko.json` | Redacted Korean listing fixture (no `tel`) |
| `scripts/sync-icn-facilities.mjs` | Sync entry (spawns Vitest CLI test with `ICN_SYNC=1`) |
| `package.json` | `sync:icn-facilities` script |

SFO `Facility` / `recommendFacilities` contracts are **unchanged**. ICN data stays in `IcnFacilityBrowseRecord` until a UI task maps categories for display only.

---

## Run sync (local)

1. `DATA_GO_KR_SERVICE_KEY` in gitignored `.env.local` (see `docs/data/icn-api-verification.md`).
2. Export and sync:

```bash
set -a && source .env.local && set +a
npm run sync:icn-facilities -- --lang K --allow-total-mismatch
```

- Default (no flag): fails if fetched row count ≠ API `totalCount`.
- `--allow-total-mismatch`: writes fixture with `meta.syncIntegrity: "api_total_mismatch"` (required for 2026-10-28 live corpus).

---

## Normalized schema (summary)

Each `facilities[]` row:

- `listingIndex` — stable key within the fixture file (0…n−1).
- `sourceId` — API `sn` (not always unique).
- `airportIata` — `ICN`.
- `language` — `K` | `E`.
- `name`, `categories.{large,medium,small}` — raw taxonomy strings; unknown codes preserved.
- `terminalId`, `floor` — verbatim API values (`P01`, `F3`, etc.).
- `locationDescription` — `lcnm`.
- `hoursText` — `servicetime` only; **no** live open/closed inference.
- `arrivalOrDeparture` — `A` | `D` | null.
- `dutyFreeFlag` — `Y` | `N` | null (`lcduty`).
- `source` — API operation + dataset id.

Missing / blank strings → `null`. No walk minutes, queues, coordinates, or phone in the fixture.

`meta` records `retrievedAt`, `recordCount`, `apiReportedTotalCount`, optional `distinctSourceIdCount` / `duplicateSourceIds`, and `syncIntegrity`.

---

## Missing-data behavior

| Field | When absent |
| --- | --- |
| Category tiers | `null` (including `scategorynm`) |
| Terminal / floor / location / hours | `null` |
| Invalid `arrordep` / `lcduty` | `null` |
| Timing / queues / coords | Not in schema (never zero-filled) |

---

## Verification run (2026-10-28)

| Command | Result |
| --- | --- |
| `npm test -- src/lib/icn-facilities` | PASS (21 tests) |
| `npm run lint` | PASS |
| `npx tsc --noEmit` | PASS (after handoff edits) |
| `npm run sync:icn-facilities -- --lang K --allow-total-mismatch` | PASS (fixture written) |

### Live sync outcomes

| Metric | Value |
| --- | --- |
| `apiReportedTotalCount` | **1175** (matches GW-ICN-002) |
| Rows fetched (12 pages × 100) | **1028** |
| `syncIntegrity` | `api_total_mismatch` |
| `distinctSourceIdCount` | **1011** |
| Duplicate `sn` values | **17** (listed in fixture `meta.duplicateSourceIds`) |
| `retrievedAt` | `2026-10-28T02:06:19.941Z` |

**Anomalies (not silent):**

1. Pagination returns **1028** rows while `totalCount` remains **1175** (reproduced across page sizes 10–100).
2. **17** duplicate `sn` values within the fetched set; UI should key on `listingIndex`, not `sourceId` alone.

---

## Remaining work (browse UI)

1. Load `icn-facilities-ko.json` from a server route or RSC loader; show `meta.syncIntegrity` in dev/honest copy.
2. Map `categories.large` → display chips (no SFO `FacilityCategory` coercion without a reviewed mapping table).
3. Terminal labels for `P01` / `P03` / `G01` etc.
4. Do not feed ICN rows into `recommendFacilities` without a separate authorized task.
5. Re-run sync before release; investigate `totalCount` vs fetched rows with IIAC / data.go.kr if a “complete” corpus is required.

---

## Investigation — count mismatch & duplicate `sn` (2026-10-28)

**Method:** Systematic review of `parse-api-items` / `sync-icn-facilities` plus bounded live probes (`ICN_INVESTIGATE=1` → `src/lib/icn-facilities/investigate-sync-mismatch.test.ts`, ~17 requests at `numOfRows=100`). Fixture duplicate analysis: `icn-fixture-duplicate-sn.test.ts` (no API).

### 1. Parsing & pagination (local code)

| Check | Result |
| --- | --- |
| Dropped items / overwritten keys | **Not observed.** On every page, raw `items` numeric-key count equals `parseIcnApiItems` length and `parsedItemCount`. |
| `item[]` vs numeric-key object | Live pages use **numeric keys only** (`hasItemArray: false`). Parser path matches portal live shape. |
| Early termination | **Adjusted:** sync now stops after a **short** final page (`items.length < pageSize`) or an **empty** last page, avoiding a useless trailing request (e.g. page 12 when page 11 already returned only 28 rows). Does **not** change row totals. |

### 2. Per-page metadata (`lang=K`, `numOfRows=100`, `totalCount` stable at **1175**)

| pageNo | parsed rows | raw keyCount | notes |
| --- | ---: | ---: | --- |
| 1–10 | 100 each | 100 each | `pageNo` / `numOfRows` echoed correctly |
| 11 | **28** | **28** | partial page in **raw JSON** (not a parser loss) |
| 12 | **0** | **0** | empty in raw JSON |
| **Σ** | **1028** | **1028** | |

Pages **13–14** (beyond `ceil(1175/100)`): **0** rows each; `totalCount` still **1175**.

### 3. Overlap across page sizes

At global index **990**, `sn` sequence from page 10 (`numOfRows=100`, offset 90) matches page 20 (`numOfRows=50`, offset 40): `143, 828, 189, 2280, 513`.  
`totalCount` on page 1: **1175** for both `numOfRows=100` and `numOfRows=50` (stable in this session).

### 4. Duplicate `sourceId` (`sn`)

| Metric | Value |
| --- | ---: |
| Rows in fixture | 1028 |
| Distinct `sn` | 1011 |
| `sn` with 2+ rows | 17 |

For all **17** groups in `icn-facilities-ko.json`: paired rows are **identical normalized content** (name, terminal, floor, location, categories); they differ only by **`listingIndex`** (always consecutive). These are **API duplicate listings**, not collisions between distinct facilities under one id, and **not** an adapter dedupe bug.

**Do not** dedupe by `sn` alone; use **`listingIndex`** (or a future composite key) for stable UI keys.

### Verdict

| Issue | Cause |
| --- | --- |
| 1175 vs 1028 | **Reproducible in raw API responses** — `totalCount` overstates retrievable rows; pagination ends at 1028 with page 11 partial + page 12 empty. **Not** a local parser/sync drop. |
| 17 duplicate `sn` | **Reproducible in API / fixture** — repeated rows with same `sn` and same fields. **Not** fixed by client-side dedupe without product policy. |
| Missing 147 rows | **Unresolved provider-side** — no additional rows on pages 13–14; may be stale `totalCount`, unpublished rows, or undocumented filters. Escalate via data.go.kr / IIAC if a full 1175 corpus is required. |

### Development fixture recommendation

- Keep the existing **`icn-facilities-ko.json`** (1028 rows, `syncIntegrity: api_total_mismatch`) for browse UI **prototyping** with honest copy: “listing sample; API reports 1175 total.”
- **Do not** treat default sync as complete while `recordCount !== apiReportedTotalCount`; default `npm run sync:icn-facilities` remains **strict** (no `--allow-total-mismatch`).
- UI must key rows by **`listingIndex`**, not `sourceId` alone.
- Before production, re-sync under strict validation or provider clarification; do not claim full airport coverage from `totalCount` alone.

---

## English API coverage (`lang=E`) — 2026-10-28

**Method:** Existing sync pipeline (`npm run sync:icn-facilities -- --lang E`), then fixture comparison via `src/lib/icn-facilities/icn-language-coverage.ts` (Vitest: `icn-language-coverage.test.ts`). Korean fixture **not** overwritten (`icn-facilities-ko.json` `retrievedAt` unchanged).

### Sync outcomes

| Step | Result |
| --- | --- |
| Strict sync (`lang=E`, no override) | **Failed** — `Incomplete sync: fetched 1028 records but API totalCount is 1175` (same pagination gap as Korean). |
| Dev fixture write (`--allow-total-mismatch`) | **Success** → `src/data/fixtures/icn-facilities-en.json` |

| Metric | Korean (`K`) | English (`E`) |
| --- | ---: | ---: |
| Raw rows in fixture | 1028 | 1028 |
| API `totalCount` | 1175 | 1175 |
| `syncIntegrity` | `api_total_mismatch` | `api_total_mismatch` |
| Distinct `sourceId` | 1011 | 1011 |
| Duplicate `sn` groups (raw) | 17 | 17 |
| Deduplicated browse rows (identical content collapse) | 1011 | 1011 |
| EN `retrievedAt` | (unchanged KO sync) | `2026-10-28T02:35:28.451Z` |

### Cross-language ID alignment

| Check | Result |
| --- | ---: |
| `sourceId` in both fixtures | **1011** |
| Korean-only `sourceId` | **0** |
| English-only `sourceId` | **0** |

**Raw-row ambiguity:** **17** `sourceId` values appear **twice** in **each** language (identical normalized content within language, consecutive `listingIndex`). After per-language identical-row collapse, each `sourceId` maps to **one** browse row per language.

**Do not** join on raw `sourceId` without dedupe — use per-language collapse first, then pair on `sourceId` for bilingual display.

### Missing fields (raw rows, counts)

| Field | Korean rows missing | English rows missing |
| --- | ---: | ---: |
| Name | 0 | 0 |
| Location | 0 | 0 |
| Hours text | 84 | 84 |
| Terminal | 0 | 0 |
| Floor | 0 | 0 |
| Large category | 0 | **164** |

English has weaker category taxonomy on a subset of rows; UI must not invent categories.

### Sanitized representative pairs (same `sourceId`)

| Type | `sourceId` | Korean name | English name |
| --- | --- | --- | --- |
| Dining | 3289 | % 아라비카 | % ARABICA |
| Restroom | 3230 | 남자화장실 | Men's Toilet |
| Lounge | 420 | KE 라운지(외항사) | KE Lounge(Foreign airlines) |
| Rest / nursing | 548 | 유아휴게실(수유실) | Baby Care Room(Nursing Room) |

Terminal/floor for `3289` align across languages (`P03`, `F3`) in fixtures.

### Matching recommendation (later UI task)

1. **Per language:** collapse identical `sourceId` + content duplicates (current browse view-model policy).
2. **Cross language:** join collapsed rows on **`sourceId`** when exactly one row remains per side after collapse (true for this snapshot: 1011 paired IDs).
3. **Fallback:** if a future sync introduces unpaired IDs, show single-language row only; do not machine-translate or merge ambiguous multi-row groups without explicit rules (e.g. `listingIndex` + terminal/floor).
4. **Search:** keep language-specific fixtures; English search must not imply Korean query translation.

### Readiness verdict

| Question | Verdict |
| --- | --- |
| Can official `lang=E` API support an English directory parallel to Korean? | **Yes, with same limitations** — 1028/1011 usable rows, same `totalCount` mismatch, paired `sourceId` set matches Korean in this sync. |
| Ready for Korean/English browsing UI (separate snapshots)? | **Implemented (GW-ICN-004 UI slice, local)** — Mivvu preview loads fixtures by `mivvu.preview.locale.v1`; see [`docs/design/mivvu-icn-browse-handoff.md`](../design/mivvu-icn-browse-handoff.md). |
| Blockers | API `totalCount` vs fetched rows; 17 duplicate raw rows per language; **164** English rows missing `lcategorynm`; no live hours/open status. |

**Sync English fixture (local):**

```bash
set -a && source .env.local && set +a
npm run sync:icn-facilities -- --lang E --allow-total-mismatch
```
