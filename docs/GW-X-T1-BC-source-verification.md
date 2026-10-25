# GW-X-T1-BC — Harvey Milk Terminal 1 B/C Source Verification

**Task:** Pre–GW-X-002 Batch 2 research (docs only)  
**Research checked:** **2026-10-25 (America/New_York)**  
**Depends on:** [GW-X-R002](./GW-X-R002-sfo-facility-location-matrix.md) §3.2, [GW-X-R001](./GW-X-R001-sfo-coverage-source-audit.md), [data-provenance](./data-provenance.md) (S4 policy)  
**Baseline:** `main` @ `6666be0a60ffa4db3f73051200d140fe2314aef9` (18 facilities; 12 recommend + 6 browse-only T2 D reserves)  
**Status:** Source verification for **3** representative T1 B/C matrix rows — **not** `facilities.json`.

---

## 1. Scope

Verify the three Harvey Milk Terminal 1 candidates from GW-X-R002 before Batch 2 ingestion:

| Proposed ID | Boarding area |
| --- | --- |
| `sfo-hm1-b-bun-mee` | B |
| `sfo-hm1-b-bourbon-pub` | B |
| `sfo-hm1-c-49-mile-market` | C |

**Out of scope:** Full T1 Shop/Dine inventory, walking times, B↔C connectivity, recommend-scope expansion (production remains **T2 D Gates** only).

---

## 2. Evidence codes

| Code | Meaning |
| --- | --- |
| **S4** | Official Shop/Dine directory with **terminal + Post-Security** filters applied (see data-provenance) |
| **S5** | **S4-equivalent for Harvey Milk T1** — this session (below) |
| **Page** | Dedicated English listing HTML only (location/terminal/hours; **insufficient alone** for `securityZone: post`) |

**S5 (2026-10-25):** Interactive directory with filters observed:

- **Terminal:** Harvey Milk Terminal 1 (`location=1543` in query string)
- **Security:** Post-Security (`security=73`, same value as T2 S4)
- **URL:** [Shop/Dine/Relax — HM1 + Post-Security](https://www.flysfo.com/passengers/shop-dine-relax?title=&field_hours_of_operation_status=All&location=1543&gate_area=All&security=73&service_tags=All&content_type=All)

Result cards on the filtered page included all three candidates (English/Korean titles may differ on cards; dedicated listing URLs below are authoritative for **names**).

---

## 3. Candidate verification matrix

### 3.1 Summary

| Proposed ID | Name (listing title) | Terminal (VF) | Area | Gate prose (VF) | Hours (VF raw) | Post-security | Browse (proposed) | Recommend (today) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `sfo-hm1-b-bun-mee` | Bun Mee | Harvey Milk Terminal 1 | **B** | near Gate **B3** | Sun–Sat 5:30 am–11:00 pm | **VF** (S5) | Yes | No |
| `sfo-hm1-b-bourbon-pub` | Bourbon Pub | Harvey Milk Terminal 1 | **B** | Near Gate **B7** | Sun–Sat 5:30 am–10:00 pm | **VF** (S5) | Yes | No |
| `sfo-hm1-c-49-mile-market` | 49 Mile Market | Harvey Milk Terminal 1 | **C** | near Gate **C2** | Sun–Sat 3:30 am–10:30 pm | **VF** (S5) | Yes | No |

**Verified vs unknown (security):** **3/3 post-security** under S5 directory filter. **0/3** rely on Page-only evidence for security classification in this report.

**Unknown / not sourced:** Queue and activity minutes (remain `null`). Walking times between gates and facilities. Live open/closed status. Whether gate numbers B3/B7/C2 are active integers (meeting-points ranges are not gate-by-gate proof).

---

### 3.2 Row detail

#### Bun Mee — `sfo-hm1-b-bun-mee`

| Field | Value |
| --- | --- |
| **Official URL** | https://www.flysfo.com/passengers/shop-dine-relax/bun-mee |
| **Checked** | 2026-10-25 |
| **Category (proposed)** | `food` |
| **Location prose** | near Gate B3; Harvey Milk Terminal 1 |
| **Hours** | `Sunday- Saturday 5:30 am-11:00 pm` (listing headline) |
| **Contact** | 650-821-6820; external link bunmee.co (listing) |
| **Badges (listing)** | Open Past 10PM |
| **Security** | `post` — **S5** (appears on HM1 + Post-Security directory filter) |
| **Conflicts** | Directory card may show “Order Ahead Bun Mee”; use listing title **Bun Mee** for display ID stability |

#### Bourbon Pub — `sfo-hm1-b-bourbon-pub`

| Field | Value |
| --- | --- |
| **Official URL** | https://www.flysfo.com/passengers/shop-dine-relax/bourbon-pub |
| **Checked** | 2026-10-25 |
| **Category (proposed)** | `food` |
| **Location prose** | Near Gate B7; Harvey Milk Terminal 1 |
| **Hours** | `Sunday- Saturday 5:30 am-10:00 pm` |
| **Contact** | No phone on listing body retrieved this session |
| **Badges (listing)** | Open Past 10PM; table-service positioning in directory card |
| **Security** | `post` — **S5** |
| **Conflicts** | None identified; long “About” marketing copy only — not used for time estimates |

#### 49 Mile Market — `sfo-hm1-c-49-mile-market`

| Field | Value |
| --- | --- |
| **Official URL** | https://www.flysfo.com/passengers/shop-dine-relax/49-mile-market |
| **Checked** | 2026-10-25 |
| **Category (proposed)** | `shop` |
| **Location prose** | near Gate C2; Harvey Milk Terminal 1 |
| **Hours** | `Sunday - Saturday 3:30 am-10:30 pm` |
| **Contact** | 628-399-0544 (listing) |
| **Badges (listing / directory)** | Open Past 10PM; Military Discount on directory card |
| **Security** | `post` — **S5** |
| **Conflicts** | None identified |

---

## 4. Terminal / boarding-area assignment

| Source | Finding |
| --- | --- |
| [Static maps index](https://www.flysfo.com/maps/static-maps) | Harvey Milk Terminal 1 labeled **B & C Gates** (GW-X-R001) |
| Dedicated listings | Terminal string **Harvey Milk Terminal 1** on all three pages |
| Gate prose | **B3**, **B7** → boarding area **B**; **C2** → boarding area **C** |

**JSON shape (Batch 2 proposal, not implemented here):**

- `airportIata`: `SFO`
- `terminalCode`: `harvey_milk_1`
- `boardingAreaCode` / `zone`: `B` or `C` per row
- `browseEligible`: `true`
- `recommendEligible`: `false` (recommend scope unchanged)
- `securityZone`: `post` with `lastCheckedAt` + S5 URL recorded in provenance

---

## 5. Eligibility recommendations (product + data)

| Surface | Recommendation |
| --- | --- |
| **Batch 2 `facilities.json`** | Ingest these **3** rows together as HM1 pilot batch after lead signs dataset PR; copy hours/contact from listings; `waitMinutes` / `activityMinutes` **null** |
| **Browse** | Eligible once rows exist in dataset with S5-documented `post` |
| **Recommend** | **Not eligible** until separate authorized scope + travel-matrix task (Phase B / eligibility expansion) |
| **UI (GW-X-003)** | Show terminal/boarding labels; do not imply reachable from T2 D gate context |

---

## 6. GW-X-002 Batch 2 readiness

| Criterion | Status |
| --- | --- |
| Official URLs + checked date for all 3 candidates | **Ready** |
| Post-security evidence (S5, not Page-only) | **Ready** |
| Hours text on listings | **Ready** (parse per GW-A-001 rules; weekly_same where single headline range) |
| Proposed stable IDs | **Ready** (GW-X-R002) |
| Full T1 inventory | **Not ready** — only 3 representative rows verified |
| G-X2 dataset milestone | **HOLD** until Batch 2 JSON merged + lead review |

**Recommended next dataset batch:** **GW-X-002 Batch 2** — ingest verified **3** HM1 B/C rows above; optional follow-on research pass for additional HM1 listings using the same S5 filter before widening Batch 2.

---

## 7. Limitations

- Directory filter evidence does not replace on-site or routing verification.
- Korean-localized directory UI was active in browser; English listing pages were used for names/hours.
- No API ingestion; static HTML only.
- Sweet Maple / 403-style listing failures elsewhere in GW-003 policy still apply to other candidates not in this batch.

---

**Document version:** 1.0
