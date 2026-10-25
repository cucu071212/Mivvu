# GW-X-IT-AG — International Terminal A/G Source Verification

**Task:** Pre–GW-X-002 International Terminal research (docs only)  
**Research checked:** **2026-10-25 (America/New_York)**  
**Depends on:** [GW-X-R002](./GW-X-R002-sfo-facility-location-matrix.md) §3.4, [GW-X-R001](./GW-X-R001-sfo-coverage-source-audit.md), [data-provenance](./data-provenance.md) (S4 policy), [GW-X-T1-BC](./GW-X-T1-BC-source-verification.md) (S5 methodology)  
**Baseline:** `main` @ `f788b3866c3eb5ecf0420b420d72b44eb857b577` (21 facilities; 12 recommend + 9 browse-only)  
**Status:** Source verification for **4** representative International Terminal A/G matrix rows — **not** `facilities.json`.

---

## 1. Scope

Verify the four Dianne Feinstein International Terminal candidates from GW-X-R002 before an International Terminal dataset batch:

| Proposed ID | Boarding area |
| --- | --- |
| `sfo-it-a-boudin-bakery` | A |
| `sfo-it-g-asian-box` | G |
| `sfo-it-g-1300-on-fillmore` | G |
| `sfo-it-g-aviation-museum-library` | G |

**Out of scope:** Full International Shop/Dine inventory, A↔G airside connectivity minutes, customs/immigration routing, recommend-scope expansion (production remains **T2 D Gates** only), live open/closed status.

---

## 2. Evidence codes

| Code | Meaning |
| --- | --- |
| **S4** | Official Shop/Dine directory with **terminal + Post-Security** filters (T2 precedent; `security=73`) |
| **S5** | HM1 + Post-Security directory filter ([GW-X-T1-BC](./GW-X-T1-BC-source-verification.md)) |
| **S6-A** | **S4-equivalent for International Terminal A** — this session |
| **S6-G** | **S4-equivalent for International Terminal G** — this session |
| **S6-pre** | Official directory with **Pre-Security** selected (`security=72`) — observed taxonomy, not gate inference |
| **Page** | Dedicated English listing HTML only — **insufficient alone** for `securityZone: post` |

**S6-A (2026-10-25):** Directory filters observed (browser + HTML retrieval):

- **Terminal:** Dianne Feinstein International Terminal A (`location=1545`)
- **Security:** Post-Security (`security=73`)
- **URL:** [Shop/Dine/Relax — IT A + Post-Security](https://www.flysfo.com/passengers/shop-dine-relax?title=&field_hours_of_operation_status=All&location=1545&gate_area=All&security=73&service_tags=All&content_type=All)

**S6-G (2026-10-25):** Directory filters observed:

- **Terminal:** Dianne Feinstein International Terminal G (`location=1659`)
- **Security:** Post-Security (`security=73`)
- **URL:** [Shop/Dine/Relax — IT G + Post-Security](https://www.flysfo.com/passengers/shop-dine-relax?title=&field_hours_of_operation_status=All&location=1659&gate_area=All&security=73&service_tags=All&content_type=All)

**S6-pre checks:** Name search with `security=72` vs `security=73` on the same Shop/Dine view (HTML `view-header` result counts and presence of facility slug in response body).

---

## 3. Candidate verification matrix

### 3.1 Summary

| Proposed ID | Name (listing title) | Terminal (VF) | Area | Gate prose (VF) | Hours (VF raw) | Post-security (authoritative) | Browse (proposed) | Recommend (today) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `sfo-it-a-boudin-bakery` | Boudin Bakery | Dianne Feinstein International Terminal **A** | **A** | Near Gate **A2** | Sun–Sat 5:00 am–11:00 pm | **VF** (S6-A) | Yes | No |
| `sfo-it-g-1300-on-fillmore` | 1300 on Fillmore | Dianne Feinstein International Terminal **G** | **G** | Near Gate **G11** | Sun–Sat 7:00 am–11:00 pm | **VF** (S6-G) | Yes | No |
| `sfo-it-g-asian-box` | Asian Box | Dianne Feinstein International Terminal **G** | **G** | Near Gate **G4** | Sun–Sat 7:00 am–11:00 pm | **UK** (directory gap) | Hold* | No |
| `sfo-it-g-aviation-museum-library` | Aviation Museum & Library | Dianne Feinstein International Terminal **G** | **G** | No gate (terminal G only) | Sun–Sat 10:00 am–4:30 pm | **Pre** (S6-pre); **not** post | Hold* | No |

\* **Hold** = do not ingest as `post` browse rows until security evidence policy is satisfied (Asian Box) or product accepts explicit **pre-security** browse rows with UX disclaimers (museum).

**Verified vs unknown (security):** **2/4** have **post-security** directory classification (S6-A / S6-G). **0/4** rely on Page-only evidence alone for **post** in this report. **1/4** has official **pre-security** taxonomy (museum). **1/4** lacks both pre and post directory classification when filters are applied (Asian Box).

**Unknown / not sourced:** Queue and activity minutes (remain `null`). Walking times, A↔G connections, customs-aware reachability. Whether gate numbers A2/G4/G11 are active for a given flight.

---

### 3.2 Row detail

#### Boudin Bakery — `sfo-it-a-boudin-bakery`

| Field | Value |
| --- | --- |
| **Official URL** | https://www.flysfo.com/passengers/shop-dine-relax/boudin-bakery |
| **Checked** | 2026-10-25 |
| **Category (proposed)** | `food` |
| **Location prose** | Near Gate A2; Dianne Feinstein International Terminal A |
| **Hours** | `Sunday- Saturday 5:00 am-11:00 pm` (listing headline) |
| **Contact** | 650-871-2517 (listing) |
| **Badges (listing / directory)** | Online Ordering; Open Past 10PM; directory card also shows Military Discount (localized UI) |
| **Amenity (listing)** | Fresh baked sourdough bread, sandwiches, salads, sourdough pizza and sweet treats |
| **Security** | `post` — **S6-A** (slug present on IT A + Post-Security directory HTML; absent from IT G + Post-Security) |
| **Conflicts** | Localized directory title may prefix “Order Ahead”; use listing title **Boudin Bakery** for display |

#### 1300 on Fillmore — `sfo-it-g-1300-on-fillmore`

| Field | Value |
| --- | --- |
| **Official URL** | https://www.flysfo.com/passengers/shop-dine-relax/1300-fillmore |
| **Checked** | 2026-10-25 |
| **Category (proposed)** | `food` |
| **Location prose** | Near Gate G11; Dianne Feinstein International Terminal G |
| **Hours** | `Sunday- Saturday 7:00 am-11:00 pm` |
| **Contact** | 601-519-8121 (listing — reported verbatim; not validated as reachable) |
| **Badges (listing)** | Open Past 10PM; Sit Down Restaurant |
| **Amenity (listing)** | Cocktail lounge and restaurant serving modern takes on Southern classics for breakfast, lunch and dinner |
| **Security** | `post` — **S6-G** (slug on IT G + Post-Security directory; also appears on airport-wide Post-Security HTML crawl) |
| **Conflicts** | None identified on terminal/area/gate prose |

#### Asian Box — `sfo-it-g-asian-box`

| Field | Value |
| --- | --- |
| **Official URL** | https://www.flysfo.com/passengers/shop-dine-relax/asian-box |
| **Checked** | 2026-10-25 |
| **Category (proposed)** | `food` |
| **Location prose** | Near Gate G4; Dianne Feinstein International Terminal G |
| **Hours** | `Sunday- Saturday 7:00 am-11:00 pm` |
| **Contact** | www.asianbox.com; 415-362-8870 (listing) |
| **Badges (listing)** | Open Past 10PM |
| **Amenity (listing)** | Fresh organic Vietnamese street food; vegetarian/gluten-free; marketing “About” block on page |
| **Security** | **UK** for `post` and for `pre` — see §4.2 |
| **Conflicts** | R002 assumed Page-only post; **not supported** by directory filters in this session |

#### Aviation Museum & Library — `sfo-it-g-aviation-museum-library`

| Field | Value |
| --- | --- |
| **Official URL** | https://www.flysfo.com/passengers/shop-dine-relax/aviation-museum-library |
| **Checked** | 2026-10-25 |
| **Category (proposed)** | `shop` (MF — cultural attraction; not standard dining retail) |
| **Location prose** | Dianne Feinstein International Terminal G (no gate landmark on listing) |
| **Hours** | `Sunday - Saturday 10:00 am-4:30 pm` |
| **Contact** | 650-821-9900 (listing) |
| **Badges (listing)** | “Additional Information and Directions” link; accreditation prose (SFO Museum / AAM) |
| **Amenity (listing)** | Exhibitions, research services, and educational programs in an architectural adaptation of the Airport's 1930s passenger lobby |
| **Security** | **`pre`** — **S6-pre** (slug on `security=72` name search; **absent** from `security=73` name search; **absent** from IT G + Post-Security directory) |
| **Conflicts** | GW-X-R002 weak `shop` category still applies; do not model as meal stop |

---

## 4. Security evidence (non-inference)

### 4.1 Post-security (S6-A / S6-G)

| Candidate | IT A + `security=73` | IT G + `security=73` | Airport-wide `security=73` |
| --- | --- | --- | --- |
| Boudin Bakery | **Present** | Absent | Present |
| 1300 on Fillmore | Absent | **Present** | Present |
| Asian Box | Absent | Absent | Absent |
| Aviation Museum & Library | Absent | Absent | Absent |

Slug presence determined by matching `/passengers/shop-dine-relax/{slug}` in directory HTML on **2026-10-25**.

### 4.2 Asian Box — directory taxonomy gap

| Filter test | Result |
| --- | --- |
| `title=asian+box`, `security=73` | **0** results (`asian-box` slug absent) |
| `title=asian+box`, `security=72` | **0** results |
| `title=asian+box`, `security=All` | **1** result (terminal G on card) |
| `location=1659`, `security=73` (browse all IT G post) | **0** (`asian-box` absent; `1300-fillmore` present) |
| `location=1659`, `security=72` | **0** for `asian-box` |

**Conclusion:** Listing prose places the vendor near Gate G4 in Terminal G, but the official Shop/Dine **security taxonomy does not classify this node as Post-Security or Pre-Security** under the same filter methodology used for S4/S5/S6. Do **not** set `securityZone: post` from gate or terminal text alone. **Manual follow-up** (alternate official source or SFO content correction) before batch ingest.

### 4.3 Aviation Museum — pre-security classification

| Filter test | Result |
| --- | --- |
| `title=aviation+museum`, `security=72` | **1** result (`aviation-museum-library`) |
| `title=aviation+museum`, `security=73` | **0** results |
| IT G + `security=73` browse | Slug **absent** |

**Conclusion:** Official directory taxonomy supports **`pre`**, not `post`. Ingestion as an airside browse row would misrepresent access unless the product explicitly supports and labels **pre-security** International facilities.

---

## 5. Terminal / boarding-area assignment

| Source | Finding |
| --- | --- |
| Dedicated listings | Terminal string **Dianne Feinstein International Terminal A** or **G** (not a single merged “international” label on pages) |
| Gate prose | **A2** → boarding area **A**; **G4** / **G11** → boarding area **G** |
| Static maps index (GW-X-R001) | International Terminal overview documents **A Gates** and **G Gates** separately |

**JSON shape (batch proposal, not implemented here):**

- `airportIata`: `SFO`
- `terminalCode`: `international` (GateWise enum per GW-X-R002 §6)
- `boardingAreaCode` / `zone`: `A` or `G` per row
- `browseEligible`: `true` only when security policy satisfied
- `recommendEligible`: `false` (recommend scope unchanged)
- `securityZone`: `post` only with S6-A/S6-G; `pre` only with S6-pre evidence; `unknown` when directory gap (Asian Box)

---

## 6. Eligibility recommendations (product + data)

| Surface | Recommendation |
| --- | --- |
| **International batch (minimum verified post-security)** | Ingest **2** rows together: **Boudin Bakery (A)** + **1300 on Fillmore (G)** after lead signs dataset PR |
| **Asian Box** | **Hold** until directory pre/post classification exists or lead accepts `securityZone: unknown` with strict non-post UX (not recommended for Phase X minimum post-security coverage goal) |
| **Aviation Museum & Library** | **Hold** for standard dine/shop browse batch, or separate **pre-security** attraction row with explicit landside/pre copy — **not** `post` |
| **Recommend** | **Not eligible** for all four until separate authorized scope + travel-matrix task |
| **UI** | International connection / customs disclaimers per GW-X-R001; no cross-terminal walk minutes |

---

## 7. International Terminal dataset batch readiness

| Criterion | Status |
| --- | --- |
| Official URLs + checked date for all 4 candidates | **Ready** |
| Post-security evidence (S6, not Page-only) | **Partial** — **2/4** ready (`post`) |
| Hours text on listings | **Ready** (parse per GW-A-001 rules) |
| Proposed stable IDs | **Ready** (GW-X-R002) |
| Full International inventory | **Not ready** — only 4 representative rows verified |
| Phase X “all major terminals” browse milestone | **Partial** — IT represented with **2** verified **post-security** browse rows; **2** rows blocked on security policy |

**Recommended next dataset batch:** **GW-X-002 International pilot** — ingest verified **2** IT A/G **post-security** rows above; defer Asian Box and Aviation Museum per §4.2–4.3 unless lead overrides security policy.

---

## 8. Limitations

- Directory filter evidence does not replace on-site routing, customs, or construction closures.
- Korean-localized directory UI was active in browser; **English** dedicated listing pages used for names, hours, and contact.
- No API ingestion; static HTML only.
- Published hours are **not** live availability (same policy as production Explore).
- Phone numbers and external URLs are copied from listings without dial-test verification.

---

**Document version:** 1.0
