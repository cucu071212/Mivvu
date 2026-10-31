# GW-ICN-015-ENRICH-DATA — acquisition assessment (corrected)

Plan revision: **GW-PLAN-REV-2026-10-29**
Branch: **`codex/gw-icn-015-enrich-data`** @ **`dac99bb8b89807ceda9e562aabe630c773121a69`**
Independent review: Codex DATA review and re-verification (2026-10-31, evidence retained outside this repository) — measurements below cite those reports where noted.

**Human acceptance (2026-10-31):** The human owner accepts this DATA producer, assessment, and reviewed candidate bytes for publication with ADOPT integration. **Producer findings 1–3** — independently **RESOLVED** (Codex DATA review / re-verification). **Finding 4** — wording corrected here against reviewer-requested text; publication does **not** claim a new independent sign-off on the final assessment edit. The **October 31 candidate** was **not** re-acquired or modified.

## Executive summary

The **stored companion candidate** validates, binds to unchanged shipped core fixtures, and supports **exact-match enrichment with contract withholding**. The accepted companion contract **permits** reviewed **`api_total_mismatch`** and exact-match omissions; it does **not** require full parity with API `totalCount` or the older fixture row count.

**Production loader wiring** is documented in [`docs/handoffs/GW-ICN-015-enrich-adopt-checkpoint.md`](../handoffs/GW-ICN-015-enrich-adopt-checkpoint.md). Human **DATA acceptance** is recorded **2026-10-31**; merge/deploy remain separate.

## Existing candidate (unchanged bytes)

| Property | Value |
| --- | --- |
| Location | `/private/tmp/GW-ICN-015-evidence/gw-icn-015-enrich-data-run/companion-candidate.json` |
| SHA-256 | `45f52bc64da4493f94e2daf02ec319586d983a77cb6df2995a367cd747c36802` |
| Validator | **`validateIcnGoodsServicesCompanion` → valid** (review + author re-check on unchanged file) |
| Target digests | K `44e2613d…`; E `3a951ceb…` |
| K capture (UTC) | `2026-10-31T04:36:14.329Z` → `2026-10-31T04:36:25.856Z` |
| E capture (UTC) | `2026-10-31T04:36:25.856Z` → **`2026-10-31T04:36:34.450Z`** |

Prior raw-page JSON, manifest, and review evidence under `GW-ICN-015-evidence/` and `GW-ICN-015-enrich-data-review/` were **not** overwritten.

## Capture scope and pagination (22 HTTP attempts)

| Item | Value |
| --- | --- |
| Budget used | **22 / 30** (11 K + 11 E; no retries) |
| API `totalCount` (both langs) | **1174** |
| Rows retrieved per language | **1027** |
| `syncIntegrity` | **`api_total_mismatch`** (contract-allowed with review) |
| Planned pages from `ceil(1174 / 100)` | **12** |
| Actual termination | **Page 11** with **27** rows (**short final page** policy — same as core sync adapter; review § “Why stopping at 11 pages”) |
| **147** (`1174 − 1027`) | **Reported-count discrepancy only** — not 147 identified missing facilities (review § `1174 − 1027`) |

The earlier assessment incorrectly implied 11 planned pages from `totalCount`; **12** is the ceiling plan; **11** requests reflect **short-page stop**, not budget exhaustion.

### Evidence limits (historical capture)

Saved `raw-pages-*.json` files contain **parsed item arrays** and selected body metadata from the client path. For the October 31 run:

- Historical **`pageNo`** is the **requested** page number (the old writer stored the request index, not the response echo).
- Historical **`numOfRows`** is the **parsed response-body** value — **100 on all 22** saved pages (K and E).
- **Absent:** separately logged **requested-versus-echoed** pagination pairs (requested page vs echoed `pageNo`, requested size vs echoed `numOfRows`) and **HTTP/API status traces** (`resultCode`/`resultMsg`, HTTP status). Successful API handling is **inferred** from parsed pages having been written, not from an independent network audit (review § Evidence qualification).

**Source provenance (review):** The acquisition producer was **uncommitted** with **no recorded producer file hashes**; the historical **manifest shape differs** from the currently inspected writer. Offline replay of retained raw rows through the corrected producer proves **compatible data transformation** and reproduces the candidate object — **not** the exact historical source bytes or an authenticated network transcript.

**No retrospective metadata was added** to the October 31 evidence files. Future captures use the corrected producer’s separate requested/echoed fields plus termination reason where the client exposes them.

## Capture-internal quality (per language, review § Independently recomputed coverage)

Denominator: **1027** raw observations (not deduplicated).

| Metric | Count |
| --- | ---: |
| Unique core fingerprints | **1010** |
| Retained duplicate rows (multiplicity 2 groups) | **17** |
| Usable text rows (`facilityitem` / `goods`) | **865** each |
| Blank / placeholder `-` | **132 / 30** |
| Uppercase `GOODS` in live payload | **0** (stored `{present:false}`) |
| Description-variant conflicts | **0** |

## Association vs shipped core fixtures (review measurements)

Shipped fixtures: **1028** raw records each; **1011** unique collapsed browse/detail references each.

### Raw-weighted (1028 listing rows)

| Outcome | KO requested | EN requested (same-origin refs in original assessment path) |
| --- | ---: | ---: |
| Visible | **861 (83.8%)** | **861** |
| Hidden `empty` | **162** | **162** |
| Hidden `no_exact_observation` | **5** | **5** |

### Unique collapsed references (1011)

| Outcome | Count |
| --- | ---: |
| Visible | **844 (83.5%)** |
| Hidden `empty` | **162** |
| Hidden `no_exact_observation` | **5** |

Duplicate collapse explains **865 = 848 + 17** usable captured rows and **861 = 844 + 17** visible matched rows (review).

### Five unmatched shipped records (not “one row short” alone)

Review reconciliation:

- **Four** shipped source IDs still appear in capture but with **changed core content** (hours/name): **2063, 3386, 2423, 2228** — each yields one old unmatched fingerprint and one new capture-only fingerprint.
- Source ID **251** is in shipped K/E but **absent from this capture** in both languages (absence from supplied capture only — not proof of closure).
- **Four** capture-only observations per language remain in the companion (usable text retained).

Thus **5** `no_exact_observation` outcomes on same-language paths vs **4** capture-only observations — not explained by row count alone.

### Reference origin vs locale (review § Reference-origin paths)

Cross-locale resolution uses **`cross_locale_association_unverified`** (subreason **`origin_fingerprint_missing_in_capture`**) for the five old fingerprints — **not** `no_exact_observation`. Visible match rates remain **861 raw-weighted / 844 unique** across K→K, K→E, E→K, E→E paths (review); **EN KO fallback: 0**.

## Producer corrections (author — findings 1–3; Codex re-verification RESOLVED)

| # | Fix | Tests |
| --- | --- | --- |
| **1** | Accept exact `facilityitem`, `goods`, `GOODS`; reject `Goods` etc. | Positive `GOODS` alone and with differing `goods` |
| **2** | Verify echoed `pageNo` and `numOfRows` every page; separate requested/echoed in evidence; block companion build on identity errors; record `terminationReason` for future captures | Offline echo mismatch + `numOfRows` mismatch |
| **3** | CLI validation narrowing, `const requestsBefore`, remove unused import | `tsc` + scoped ESLint |

## Assessment finding 4 (author wording — accepted with DATA)

Pagination, coverage, drift, and adoption-policy text corrected per independent DATA review (external evidence retained outside the repository). This document states the **historical evidence limits** and **861 raw-weighted / 844 unique** visible counts per re-verification.

Producer fixes (**1–3**) apply to **future** acquisition only; they do **not** alter the verified October 31 candidate bytes.

## Limitations for adoption decision (not automatic rejection)

- **`api_total_mismatch`** and **147** reported-count gap — document and review; contract allows mismatch label.
- **Stale core vs fresh descriptions** — fixtures collected **2026-10-28**; captures **2026-10-31** (~00:36 America/New_York); matching text is correspondence, not freshness certification.
- **No page-12+ probe** in this capture; no provider clarification; no exhaustive airport census claim.
- **Parsed-page and source provenance** — see **Evidence limits (historical capture)**; no independent HTTP/API transcript for the historical run.
- **Semantic** — descriptions are listed goods/services copy only; no availability, stock, admission, or security inference.
- **Integration** — real companion adoption is shipped in-repo with server-only loader checks; **merge to `main` / production deploy** remain **not authorized** by this DATA acceptance alone.

## Adoption stance (human accepted 2026-10-31)

The **candidate artifact** remains **technically supportable** for **partial exact-match** detail enrichment with withholding. Human owner acceptance covers DATA publication and ADOPT integration on branch **`codex/gw-icn-015-enrich-data`**; it is **not** exhaustive airport coverage or a freshness guarantee.

## Verification (author correction pass)

| Command | Result |
| --- | --- |
| Focused vitest (4 files, 32 tests) | **PASS** |
| `tsc --noEmit --incremental false` | **PASS** |
| Scoped ESLint (9 acquisition files) | **PASS** |
| `git diff --check` | **PASS** |
| Candidate SHA-256 | **`45f52bc…` unchanged** |
| Core fixture bytes vs `dac99bb` | **Unchanged** |

## GATEWISE STATUS — Cursor

```text
Task ID / objective: GW-ICN-015-ENRICH-DATA — final assessment wording correction (finding 4)
Plan revision: GW-PLAN-REV-2026-10-29
Execution permission: authorized (assessment.md only)
Work progress: complete (author)
Review / acceptance: finding 4 wording pending Codex confirmation; findings 1–3 RESOLVED (Codex)
Integration / release: n/a
Files changed: docs/data/GW-ICN-015-enrich-data-assessment.md only
Git: codex/gw-icn-015-enrich-data @ dac99bb…; uncommitted
```
