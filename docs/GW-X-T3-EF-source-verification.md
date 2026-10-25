# GW-X-T3-EF — Terminal 3 E/F Source Verification

**Task:** Pre–GW-X-002 Terminal 3 pilot research (docs only)  
**Research checked:** **2026-10-25 (America/New_York)**  
**Depends on:** [GW-X-R002](./GW-X-R002-sfo-facility-location-matrix.md) §3.3, [GW-X-R001](./GW-X-R001-sfo-coverage-source-audit.md), [data-provenance](./data-provenance.md) (S4/S5/S6 policy), [T3 construction](https://www.flysfo.com/about/construction/terminal-3-construction)  
**Baseline:** `main` @ `6e5058c8c110a0b8c62c6c8d3c4301c524dc5e14` (23 facilities; 12 recommend + 11 browse-only)  
**Status:** Source verification for **3** representative Terminal 3 E/F matrix rows — **not** `facilities.json`.

---

## 1. Scope

Verify the three Terminal 3 candidates from GW-X-R002 before a browse-only dataset batch:

| Proposed ID | Boarding area |
| --- | --- |
| `sfo-t3-e-ag1` | E |
| `sfo-t3-f-aletitude` | F |
| `sfo-t3-f-amoura` | F |

**Out of scope:** Full T3 Shop/Dine inventory, walking minutes, interim walkway routing graphs, recommend-scope expansion (production remains **T2 D Gates** only), live hours/open status.

**Construction (mandatory UX copy for any T3 batch):** Official [Terminal 3 Construction](https://www.flysfo.com/about/construction/terminal-3-construction) page documents curbside/check-in/AirTrain changes, interim post-security walkways (e.g. near Gate E2 toward F rotunda / IT G), and that paths may change. GateWise must **not** model detours or guarantee reachability from other terminals.

---

## 2. Evidence codes

| Code | Meaning |
| --- | --- |
| **S7** | **S4-equivalent for Terminal 3** — this session: Shop/Dine directory with **Terminal 3** + **Post-Security** filters |
| **Page** | Dedicated English listing HTML only — **insufficient alone** for `securityZone: post` |
| **S6-pre** | Official directory with **Pre-Security** (`security=72`) — used to confirm absence |

**S7 (2026-10-25):** Directory filters observed (HTML retrieval + prior browser spot-check pattern):

- **Terminal:** Terminal 3 (`location=3` in query string)
- **Security:** Post-Security (`security=73`)
- **URL:** [Shop/Dine/Relax — T3 + Post-Security](https://www.flysfo.com/passengers/shop-dine-relax?title=&field_hours_of_operation_status=All&location=3&gate_area=All&security=73&service_tags=All&content_type=All)

All three candidate slugs (`ag1`, `aletitude`, `amoura`) appear in this filtered HTML. None appear on T3 + `security=72` browse HTML. Per-candidate name search with `security=73` returns **1** card each; with `security=72` returns **0**.

---

## 3. Candidate verification matrix

### 3.1 Summary

| Proposed ID | Name (listing title) | Terminal (VF) | Area | Gate / location prose (VF) | Hours (VF raw) | Post-security | Browse (proposed) | Recommend (today) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `sfo-t3-e-ag1` | AG1 | Terminal 3 | **E** | Near Gate **E2** | Sun–Sat **Open 24 hours** | **VF** (S7) | Yes | No |
| `sfo-t3-f-aletitude` | Aletitude | Terminal 3 | **F** | Near Gate **F13** | Sun–Sat 6:30 am–11:00 pm | **VF** (S7) | Yes | No |
| `sfo-t3-f-amoura` | Amoura | Terminal 3 | **F** | Food Court near Gates **F11 to F22** | Sun–Sat 5:00 am–11:00 pm | **VF** (S7) | Yes | No |

**Verified vs unknown (security):** **3/3 post-security** under S7 directory filter. **0/3** rely on Page-only evidence for security classification in this report.

**Unknown / not sourced:** Queue and activity minutes (`null`). Walking times from D Gates or other terminals. Whether E2/F13 are active for a given flight. Live open/closed. **Aletitude:** no phone on listing body retrieved this session.

---

### 3.2 Row detail

#### AG1 — `sfo-t3-e-ag1`

| Field | Value |
| --- | --- |
| **Official URL** | https://www.flysfo.com/passengers/shop-dine-relax/ag1 |
| **Checked** | 2026-10-25 |
| **Category (proposed)** | `shop` |
| **Location prose** | Near Gate E2; Terminal 3 |
| **Hours** | `Sunday - Saturday Open 24 hours` |
| **Contact** | No phone on listing body retrieved this session |
| **Badges (listing)** | Open Past 10PM |
| **Amenity (listing)** | AG1 nutrition supplements on-the-go |
| **Security** | `post` — **S7** |
| **Conflicts / MF** | **24-hour** headline may require `hours.kind: unknown` + verbatim `rawText` at JSON ingest (no invented open/close locals) |

#### Aletitude — `sfo-t3-f-aletitude`

| Field | Value |
| --- | --- |
| **Official URL** | https://www.flysfo.com/passengers/shop-dine-relax/aletitude |
| **Checked** | 2026-10-25 |
| **Category (proposed)** | `food` |
| **Location prose** | Near Gate F13; Terminal 3 |
| **Hours** | `Sunday- Saturday 6:30 am-11:00 pm` |
| **Contact** | None on listing body retrieved this session |
| **Badges (listing)** | Military Discount; Open Past 10PM |
| **Amenity (listing)** | Full-service restaurant and sports bar; hot-pressed sandwiches, soups, salads, casual American fare |
| **Security** | `post` — **S7** |
| **Conflicts** | None identified on terminal/area/gate prose |

#### Amoura — `sfo-t3-f-amoura`

| Field | Value |
| --- | --- |
| **Official URL** | https://www.flysfo.com/passengers/shop-dine-relax/amoura |
| **Checked** | 2026-10-25 |
| **Category (proposed)** | `food` |
| **Location prose** | Food Court near Gates F11 to F22; Terminal 3 |
| **Hours** | `Sunday- Saturday 5:00 am-11:00 pm` |
| **Contact** | 650-821-8330 (listing) |
| **Badges (listing)** | Open Past 10PM; SFO Green Business |
| **Amenity (listing)** | Mediterranean cuisine; marketing “About” block (local/organic sourcing) |
| **Security** | `post` — **S7** |
| **Conflicts** | **Coarse gate range** F11–F22 — use full prose in `locationDescription`; do not invent a single `nearestGateLandmark` |

---

## 4. Security evidence (non-inference)

| Candidate | T3 + `security=73` (S7) | T3 + `security=72` | Name search `security=73` |
| --- | --- | --- | --- |
| AG1 | Present | Absent | 1 result |
| Aletitude | Present | Absent | 1 result |
| Amoura | Present | Absent | 1 result |

Slug presence determined by matching `/passengers/shop-dine-relax/{slug}` in directory HTML on **2026-10-25**.

---

## 5. Terminal / boarding-area assignment

| Source | Finding |
| --- | --- |
| Dedicated listings | **Terminal 3** on all three pages |
| Gate prose | **E2** → boarding area **E**; **F13** → **F**; **F11–F22** food court → **F** |
| GW-X-R001 | T3 labeled **E Gates** and **F Gates** on static maps index |

**JSON shape (batch proposal, not implemented here):**

- `airportIata`: `SFO`
- `terminalCode`: `terminal_3`
- `boardingAreaCode` / `zone`: `E` or `F` per row
- `browseEligible`: `true`
- `recommendEligible`: `false`
- `securityZone`: `post` with S7 URL recorded in provenance
- **UX:** Link or static copy referencing T3 construction limitations (no route math)

---

## 6. Eligibility recommendations (product + data)

| Surface | Recommendation |
| --- | --- |
| **T3 pilot `facilities.json` batch** | Ingest **3** rows together after lead signs dataset PR; construction disclaimer in `amenityDetails.aboutExcerpt` or product copy |
| **Browse** | Eligible once rows exist with S7-documented `post` |
| **Recommend** | **Not eligible** until separate authorized scope + travel-matrix task |
| **UI** | Terminal 3 + E/F labels; do not imply reachable from T2 D gate context |

---

## 7. Terminal 3 dataset batch readiness

| Criterion | Status |
| --- | --- |
| Official URLs + checked date for all 3 candidates | **Ready** |
| Post-security evidence (S7, not Page-only) | **Ready** (3/3) |
| Hours text on listings | **Ready** (AG1 24h needs MF at parse time) |
| Proposed stable IDs | **Ready** (GW-X-R002) |
| Construction caveat documented | **Ready** (link above) |
| Full T3 inventory | **Not ready** — only 3 representative rows |

**Recommended next dataset batch:** **GW-X-002 Terminal 3 pilot** — ingest verified **3** T3 E/F browse-only rows; mandatory T3 construction limitation copy in Explore/Results surfaces when those rows ship.

---

## 8. Limitations

- S7 directory evidence does not replace on-site verification or interim walkway closures.
- Airport-wide “all terminals connected post-security” prose on the construction page does **not** supply minutes or path availability for GateWise routing.
- No API ingestion; static HTML only.
- Published hours are not live availability.

---

**Document version:** 1.0
