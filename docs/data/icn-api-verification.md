# ICN terminal facilities API — GW-ICN-002 verification

**Plan revision:** GW-PLAN-REV-2026-10-26  
**Verification date (documentation + unauthenticated probes):** 2026-10-27  
**Task:** GW-ICN-002  
**Workspace note:** Investigation artifacts added on branch `feat/mivvu-first-entry-slice` (parent `103524337e1ca0e8edf007a0a3c32c4b76985fea`) without stashing or resetting uncommitted Mivvu preview work.

---

## Official sources

| Source | URL | Role |
| --- | --- | --- |
| 공공데이터포털 dataset | [15095064 — 인천국제공항공사_여객터미널 시설정보 현황](https://www.data.go.kr/data/15095064/openapi.do) | Access rules, parameters, response schema, traffic limits |
| Service base URL (documented) | `https://apis.data.go.kr/B551177/FacilitiesInformation` | REST host |
| Operation (documented) | `GET …/getFacilitesInfo` | **Typo in path:** `Facilites` (not `Facilities`) |
| Reference guide (documented) | *OpenAPI활용가이드_인천국제공항공사[여객터미널 시설 정보 조회 서비스].docx* (download from dataset page) | Not fetched in this pass; portal tables used as primary spec |

**Provider (documented):** Incheon International Airport Corporation (IIAC).  
**Cost (documented):** Free.  
**Approval (documented):** Dev and production accounts — automatic approval.  
**Traffic (documented):** Dev 1,000 calls/day; production up to 1,000,000/day (higher with use-case registration).  
**Formats (documented):** JSON and XML (`type` parameter; default XML).  
**Update cadence (documented):** Described as real-time on portal; **not verified** against live payloads.

---

## Access and authentication

### Documented requirements

1. Register on [data.go.kr](https://www.data.go.kr) and **apply for use** of dataset 15095064.
2. Issue a **service key** (일반 인증키 / Encoding or Decoding key per portal instructions).
3. Pass `serviceKey` on every request (required).
4. Optional filters: `lang`, `lcduty`, `facilitynm`, `arrordep`, pagination `pageNo` / `numOfRows`.

### Credentials in this environment

| Check | Result (2026-10-27) |
| --- | --- |
| `.env.local` gitignored | **Yes** (`.gitignore` rule `.env.*`; not tracked by git) |
| `DATA_GO_KR_SERVICE_KEY` loaded for probes | **Yes** (value not recorded; loaded via `source .env.local`) |
| Committed keys in repository | **None** |

**Live authenticated verification:** **Completed** 2026-10-27 (see [Live verification](#live-verification-2026-10-27)).

### Requests attempted (sanitized)

No authenticated URLs or keys are recorded below.

| # | Request | HTTP | Observed outcome |
| --- | --- | --- | --- |
| 1 | `GET getFacilitesInfo` — JSON, `numOfRows=2`, `lang=E`, **no** `serviceKey` | 401 | `errMsg`: `SERVICE_KEY_IS_NULL`, `returnReasonCode`: `20` |
| 2 | Same endpoint with **placeholder** invalid `serviceKey` | 200 (body error) | `errMsg`: `SERVICE_KEY_IS_NOT_REGISTERED_ERROR`, `returnReasonCode`: `30` |

These confirm the endpoint is reachable and that the gateway enforces key presence/registration. They do **not** prove facility payload shape, pagination totals, or category coverage.

**Reusable probe (with key):** `node scripts/icn-facilities-probe.mjs` — prints redacted samples; never logs the real key.

---

## Local setup (credentials)

1. On [dataset 15095064](https://www.data.go.kr/data/15095064/openapi.do), complete **활용신청** and copy the **Encoding** service key (or Decoding, consistently URL-encoded if required).
2. Create a **gitignored** file at repo root, e.g. `.env.local`:

   ```bash
   DATA_GO_KR_SERVICE_KEY=your_encoding_key_here
   ```

3. Export for one-off probes (do not paste the key in chat or commit):

   ```bash
   set -a && source .env.local && set +a
   node scripts/icn-facilities-probe.mjs --lang E --rows 10 --page 1
   ```

4. Optional second page: `--page 2` to confirm `totalCount` / pagination behavior.

---

## Documented response fields → product mapping

Portal schema (not live-validated). Sample values are **from dataset documentation**, not from GateWise live calls.

| API field | Documented meaning | GateWise browse use | Notes / gaps |
| --- | --- | --- | --- |
| `sn` | Facility sequence number | Provisional `id` | Stability across refreshes **unknown**; may need composite key |
| `facilitynm` | Store / facility name | `name` | Multilingual via `lang` |
| `lcategorynm` / `mcategorynm` / `scategorynm` | Large / mid / small category | Map → `FacilityCategory` or ICN-specific taxonomy | **Live category list unverified** (dining, restroom, charging, etc.) |
| `terminalid` | `P01` T1, `P03` T2, `G01` concourse, `G02`/`G03` transport centers | Terminal filter / labels | Good for T1/T2 browse scope |
| `floorinfo` | e.g. `3F`, `1B` | Display + filter | Textual, not a graph |
| `lcnm` | Free-text location | `locationDescription` | Not measured walking time |
| `servicetime` | e.g. `08:00 ~ 19:00` | Static hours display | **Not** live open/closed |
| `tel` | Phone | Contact display | Redact in public fixtures |
| `facilityitem` / `GOODS` | Merchandise / brands | Optional detail | Shop-heavy |
| `lcduty` | `Y` duty-free / `N` general | Zone copy, filters | Not security clearance modeling |
| `arrordep` | `A` arrivals / `D` departures | Airside context hint | **Not** equivalent to SFO `securityZone` |
| `resultCode` / `resultMsg` | API status | Error handling | |
| `totalCount`, `pageNo`, `numOfRows` | Pagination | Client paging | **Not verified** live |

### Representative documented example (sanitized, from portal)

```json
{
  "sn": "1469",
  "arrordep": "D",
  "facilityitem": "[brands omitted]",
  "facilitynm": "[Grand duty-free cosmetics example]",
  "lcnm": "Terminal 1, 3F, duty-free near gate 27 (paraphrased)",
  "lcategorynm": "Duty-free shopping",
  "mcategorynm": "Grand duty-free",
  "scategorynm": "Fragrance & cosmetics",
  "servicetime": "08:00 ~ 19:00",
  "lcduty": "Y",
  "terminalid": "P01",
  "floorinfo": "3F"
}
```

(English strings depend on `lang=E`; exact wording **not** verified live.)

### Fields **not** documented in portal output table

- Latitude / longitude or indoor coordinates  
- Queue/wait time, occupancy, or “open now”  
- Stable global facility UUID  
- Gate-level routing or walking minutes  

Do **not** infer these from listings.

---

## Category coverage (dining, restrooms, charging, lounges, rest areas)

See [Live verification](#live-verification-2026-10-27) for targeted `facilitynm` probes. Summary: dining and restrooms are present; lounges and rest/nursing rooms appear; dedicated charging/drinking-water listings were **not found** under obvious Korean search terms (may use other names or be absent).

---

## Live verification (2026-10-27)

**Method:** `set -a && source .env.local && set +a` then read-only `fetch` calls and `scripts/icn-facilities-probe.mjs` (key never logged).  
**JSON root:** `response.header` + `response.body` (not `OpenAPI_ServiceResponse` on success).  
**API success criterion:** `response.header.resultCode === "00"` and `resultMsg === "NORMAL SERVICE."` (HTTP 200 observed).

### Requests performed (parameters only)

| # | `lang` | `pageNo` | `numOfRows` | `facilitynm` | Purpose |
| --- | --- | --- | --- | --- | --- |
| L1 | K | 1 | 10 | — | Baseline structure + pagination |
| L2 | K | 2 | 10 | — | Distinct page |
| L3 | E | 1 | 10 | — | English list + compare ordering |
| L4 | K | 1 | 50 | — | Null-field spot check |
| L5 | K | 1 | 20 | `화장실` | Restrooms |
| L6 | K | 1 | 20 | `라운지` | Lounges |
| L7 | K | 1 | 20 | `휴게` | Rest / nursing rooms |
| L8 | K | 1 | 5 | `커피` | Dining sample |
| L9 | K / E | 1 | 5 | `아라비카` / `ARABICA` | Cross-language `sn` check |
| L10 | K | 1 | 20 | `충전`, `충전기`, `USB`, `콘센트` | Charging (all `totalCount` 0) |
| L11 | K | 1 | 5 | `급수`, `음수` | Drinking water (0 matches) |

### Pagination (L1–L3)

| Field | Observed |
| --- | --- |
| `totalCount` | **1175** (consistent across K/E and pages 1–2) |
| `pageNo` / `numOfRows` | Echoed correctly |
| Distinct `sn` on page 1 vs 2 (K) | **Yes** (e.g. page 1 starts `3289, 2030, …`; page 2 starts `2156, …`) |
| Sort order K vs E page 1 | **Differs** (same corpus size; English order not identical to Korean) |

### JSON item shape

- Records arrive under `response.body.items` as a **numeric-key object** (`"0"…"n-1"`), not always `items.item[]`.
- Live field names are **lowercase** (`goods`, not `GOODS` in samples).
- `floorinfo` uses values like **`F3`** (not always `3F` as in portal examples).

### Sanitized examples

**Dining (K, `sn` 3289 — matched E by same `sn`):**

```json
{
  "sn": "3289",
  "facilitynm": "% 아라비카",
  "lcategorynm": "식・음료",
  "mcategorynm": "스낵/카페/디저트 ",
  "scategorynm": null,
  "lcnm": "제2여객터미널 3층 면세지역 209번 게이트 부근",
  "terminalid": "P03",
  "floorinfo": "F3",
  "servicetime": "06:00 ~ 22:00",
  "lcduty": "Y",
  "arrordep": "D",
  "tel": "[REDACTED]"
}
```

**English (`sn` 3289, same record):**

```json
{
  "sn": "3289",
  "facilitynm": "% ARABICA",
  "lcategorynm": "Restaurants",
  "mcategorynm": "Snack / Cafe / Dessert",
  "lcnm": "Near Gate 209 on 3F, Terminal 2",
  "terminalid": "P03",
  "floorinfo": "F3",
  "servicetime": "06:00 ~ 22:00",
  "arrordep": "D"
}
```

**Restroom (K, `facilitynm` search `화장실`, `totalCount` 136):**

```json
{
  "sn": "3230",
  "facilitynm": "남자화장실",
  "lcategorynm": "기타시설",
  "mcategorynm": "기타편의",
  "lcnm": "[location text present in live payload]",
  "terminalid": "P01",
  "floorinfo": "F3",
  "arrordep": "D"
}
```

**Lounge (K, `facilitynm` search `라운지`, `totalCount` 31):** examples under `안내・편의시설` / `라운지/호텔/휴식` (e.g. airline and accessible lounges).

**Rest area (K, `facilitynm` search `휴게`, `totalCount` 30):** includes `유아휴게실(수유실)` under `의료/유아`.

### Cross-language `sn` alignment

- For `% 아라비카` / `% ARABICA`, **`sn` 3289** appears in both `lang=K` and `lang=E` filtered results with consistent terminal/floor/duty fields.
- **Not proven:** long-term stability of `sn` across API updates (single-session observation only).

### Missing / null fields (sample of 50 records, page 1 K)

| Field | Missing in sample |
| --- | --- |
| `scategorynm` | 2 / 50 null |
| Coordinates, queue, live open flag | **Not in API** |
| All other core columns in table above | 0 / 50 null in this sample |

### Category probe interpretation

| Need | Live signal | Caveat |
| --- | --- | --- |
| Dining | `식・음료`, cafe/coffee name searches | Full F&B taxonomy not catalogued |
| Restrooms | `화장실` → 136 rows | English `restroom` search returned 0 (use K labels or category browse) |
| Lounges | `라운지` → 31 rows | Mixed airline / accessible lounges |
| Rest areas | `휴게` → nursing/rest rooms | Not general seating maps |
| Charging | `충전*` / `USB` / `콘센트` → 0 | **Not found** in targeted probes; may exist under other names |
| Drinking water | `급수` / `음수` → 0 | **Not found**; `물` matched unrelated offices |

---

## Data usefulness for first amenity browsing

| Can support (static browse, with adapter) | Cannot support (without other data) |
| --- | --- |
| Name, terminal, floor, textual location | Live queue / wait |
| Category taxonomy (after mapping) | Measured indoor walks |
| Published service hours **text** | Guaranteed “open now” |
| Arrival/departure area hint | SFO-style `legacy_zone` matrix |
| Multilingual listing (`lang`) | Comprehensive nationwide coverage |

**Adapter implication:** Small ICN-specific module: fetch paginated JSON, normalize categories, label `demo_estimate` or `unknown` for any timing fields, honest “listing data” copy. Do not copy SFO D-gate recommendation matrix.

---

## Verdict

**For an initial ICN facility-browsing experience (static list, honest limitations):** **Sufficient with gaps**

| Gap | Impact |
| --- | --- |
| No coordinates / indoor graph | Browse by text + terminal/floor only |
| No queues, walks, live open/closed | Cannot power recommendation engine |
| Charging / drinking-water not verified in probes | May need separate data source or deeper category mining |
| `sn` stability unproven | Adapter should tolerate ID changes |
| English search semantics differ | Default UI language strategy needed |

**Live verification:** **Complete** — authenticated payloads inspected; `resultCode` `00`; **1175** facilities reported.

---

## Bounded next step

**GW-ICN-004 (proposal):** Implement a read-only ICN adapter that paginates `getFacilitesInfo`, normalizes the numeric `items` object, maps `lcategorynm` → browse categories, and ships redacted fixtures from one full `lang=K` sync — still **no** SFO matrix or live-status claims.

---

## GATEWISE STATUS (GW-ICN-002)

```text
Task ID: GW-ICN-002
Plan revision: GW-PLAN-REV-2026-10-26
Execution permission: authorized (direct human assign)
Work progress: complete (documentation + unauthenticated + live verification)
Review / acceptance: pending
Integration / release: n/a

Verified facts (live):
  - resultCode 00, totalCount 1175, pagination works (K/E pages 1–2)
  - response.body.items numeric-key array; cross-lang sn 3289 aligned
  - Dining, restrooms, lounges, rest/nursing present in probes
  - .env.local gitignored; key not committed

Gaps / unknowns:
  - Charging & drinking-water not found via targeted facilitynm probes
  - sn long-term stability; full category taxonomy not enumerated
  - No coordinates, queues, walks, live hours

Blockers for GW-ICN-004: none for starting adapter sketch; product must label browse-only limits

Deliverables:
  - docs/data/icn-api-verification.md (live section appended)
  - scripts/icn-facilities-probe.mjs (response parsing fix)
```
