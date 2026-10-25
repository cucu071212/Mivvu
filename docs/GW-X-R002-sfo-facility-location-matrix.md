# GW-X-R002 — SFO-Wide Facility & Location Matrix

**Task:** GW-X-R002 (research only)  
**Research checked:** **2026-10-25 (America/New_York)**  
**Depends on:** [GW-X-R001](./GW-X-R001-sfo-coverage-source-audit.md), [GW-A-R002](./GW-A-R002-facility-hours-amenity-matrix.md) (shipped T2 D **12**)  
**Baseline:** `main` @ `76b91963780a357631eb1d9cb1c3f3fa098feef8`  
**Status:** Implementation-ready **research** matrix — not `facilities.json`.

---

## 1. Legend

| Code | Meaning |
| --- | --- |
| **VF** | Verified from official listing HTML on research date |
| **UK** | Unknown — not stated on listing; do not infer |
| **MF** | Manual follow-up (naming, hours split, security evidence) |
| **Browse** | Eligible for airport-wide **directory** in Phase X (with security caveats) |
| **Recommend** | Eligible for **time-based** `recommendFacilities` today |

**Security evidence codes:** **S1–S4** = `docs/data-provenance.md` (GW-003). **Page** = listing prose only (insufficient alone for `post`). **—** = not re-verified this session.

**Proposed ID pattern:** `sfo-{terminal}-{area}-{slug}` where `terminal` ∈ `hm1` \| `t2` \| `t3` \| `it`, `area` ∈ `b` \| `c` \| `d` \| `e` \| `f` \| `a` \| `g`, `slug` = flysfo.com path segment.

**Production IDs** (unchanged): `sfo-t2-d-*` — **12** rows in `facilities.json` @ `af5fe21`.

---

## 2. Coverage summary (this matrix)

| Terminal | Boarding area | Matrix rows | Shipped in prod | Representative new rows |
| --- | --- | ---: | ---: | ---: |
| Harvey Milk T1 | B | 2 | 0 | 2 |
| Harvey Milk T1 | C | 1 | 0 | 1 |
| Terminal 2 | D | 18 | **12** | 6 |
| Terminal 3 | E | 1 | 0 | 1 |
| Terminal 3 | F | 2 | 0 | 2 |
| Int'l Terminal | A | 1 | 0 | 1 |
| Int'l Terminal | G | 3 | 0 | 3 |
| **Total** | | **28** | **12** | **16** |

This is **representative**, not exhaustive. Full Shop/Dine inventory requires a dedicated inventory pass (sitemap / filtered directory crawl policy) in a follow-on research batch.

---

## 3. Master matrix

### 3.1 Terminal 2 — D Gates (production + reserves)

| Proposed ID | Name | Gate / location (VF) | Security | Hours (VF raw) | Category | Browse | Recommend | sourceUrl | Conflicts / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `sfo-t2-d-16th-dolores-general-store` | 16th & Dolores General Store | D16 | post, S2 | Sun–Sat 4:00 am–11:30 pm | shop | Yes | **Yes** | [link](https://www.flysfo.com/passengers/shop-dine-relax/16th-dolores-general-store) | **Shipped**; GW-A-R002 |
| `sfo-t2-d-andale-mexican-kitchen-bar` | Andalé Mexican Kitchen + Bar | D16 | post, S4 | Sun–Sat 6:00 am–10:00 pm | food | Yes | **Yes** | [link](https://www.flysfo.com/passengers/shop-dine-relax/andale-mexican-kitchen-bar) | Shipped |
| `sfo-t2-d-brookstone` | Brookstone | D1 | post, S3 | Sun–Sat 6:00 am–10:00 pm | shop | Yes | **Yes** | [link](https://www.flysfo.com/passengers/shop-dine-relax/brookstone-t2) | Shipped |
| `sfo-t2-d-burger-joint` | Burger Joint | D15 | post, S2 | Sun–Sat 5:00 am–11:00 pm | food | Yes | **Yes** | [link](https://www.flysfo.com/passengers/shop-dine-relax/burger-joint) | Shipped |
| `sfo-t2-d-cat-cora` | Cat Cora | D9 | post, S4 | Sun–Sat 7:30 am–10:00 pm | food | Yes | **Yes** | [link](https://www.flysfo.com/passengers/shop-dine-relax/cat-cora) | Shipped; MF name vs Kitchen |
| `sfo-t2-d-kiehls` | Kiehl's | Retail Street | post, S4 | Sun–Sat 6:00 am–10:00 pm | shop | Yes | **Yes** | [link](https://www.flysfo.com/passengers/shop-dine-relax/kiehls) | Shipped; null gate |
| `sfo-t2-d-lark-creek-grill` | Lark Creek Grill | D1 | post, S4 | Sun–Sat 6:00 am–10:00 pm | food | Yes | **Yes** | [link](https://www.flysfo.com/passengers/shop-dine-relax/lark-creek-grill) | Shipped |
| `sfo-t2-d-napa-farms-market` | Napa Farms Market | Retail Street | post, S1/S2 | Sun–Sat 4:30 am–11:00 pm | food | Yes | **Yes** | [link](https://www.flysfo.com/passengers/shop-dine-relax/napa-farms-market) | Shipped |
| `sfo-t2-d-peets-coffee-d7` | Peet's Coffee (D7) | D7 | post, S1 | Sun–Sat 4:30 am–8:30 pm | coffee | Yes | **Yes** | [link](https://www.flysfo.com/passengers/shop-dine-relax/peets-coffee-0) | Shipped |
| `sfo-t2-d-sunglass-hut` | Sunglass Hut | Retail Street | post, S4 | Sun–Sat 7:00 am–8:00 pm | shop | Yes | **Yes** | [link](https://www.flysfo.com/passengers/shop-dine-relax/sunglass-hut-t2) | Shipped |
| `sfo-t2-d-the-chocolate-market` | The Chocolate Market | Retail Street | post, S4 | Sun–Sat 7:00 am–9:00 pm | shop | Yes | **Yes** | [link](https://www.flysfo.com/passengers/shop-dine-relax/chocolate-market) | Shipped |
| `sfo-t2-d-wakaba` | Wakaba | D9 | post, S1 | Sun–Sat 6:30 am–10:30 pm | food | Yes | **Yes** | [link](https://www.flysfo.com/passengers/shop-dine-relax/wakaba) | Shipped |
| `sfo-t2-d-vino-volo` | Vino Volo | Retail Street | post, S4 | Sun–Fri 9–9; Sat 9–7 | food | Yes | No | [link](https://www.flysfo.com/passengers/shop-dine-relax/vino-volo) | Day-split hours |
| `sfo-t2-d-plant-cafe-pinkberry` | The Plant Café and Pinkberry | D4 | post, S4 | Sun–Sat 4:30 am–9:00 pm | food | Yes | No | [link](https://www.flysfo.com/passengers/shop-dine-relax/plant-cafe-and-pinkberry) | MF D3 article vs D4; split brand hours |
| `sfo-t2-d-peets-coffee-d15` | Peet's Coffee (D15) | D15 | post, S1 | Sun–Sat 6:00 am–1:00 pm | coffee | Yes | No | [link](https://www.flysfo.com/passengers/shop-dine-relax/peets-coffee) | MF D14/D15 conflict |
| `sfo-t2-d-books-inc` | Books Inc. | Retail Street | post, S1 | Sun–Sat 6:00 am–10:00 pm | shop | Yes | No | [link](https://www.flysfo.com/passengers/shop-dine-relax/books-inc) | MF Compass naming |
| `sfo-t2-d-sfo-news-express` | SFO News Express | D4 | post, S4 | Sun–Sat 6:00 am–3:00 pm | shop | Yes | No | [link](https://www.flysfo.com/passengers/shop-dine-relax/sfo-news-express) | Short hours |
| `sfo-t2-d-we-are-sfc` | We are SFC | Retail Street | post, S4 | Sun–Sat 6:00 am–10:00 pm | shop | Yes | No | [link](https://www.flysfo.com/passengers/shop-dine-relax/we-are-sfc) | Reserve |

### 3.2 Harvey Milk Terminal 1 — B & C (representative)

| Proposed ID | Name | Gate / location (VF) | Security | Hours (VF) | Category | Browse | Recommend | sourceUrl | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `sfo-hm1-b-bun-mee` | Bun Mee | Near B3 | **UK** (Page) | Sun–Sat 5:30 am–11:00 pm | food | Yes* | No | [link](https://www.flysfo.com/passengers/shop-dine-relax/bun-mee) | *Browse after S4 post proof |
| `sfo-hm1-b-bourbon-pub` | Bourbon Pub | Near B7 | **UK** (Page) | Sun–Sat 5:30 am–10:00 pm | food | Yes* | No | [link](https://www.flysfo.com/passengers/shop-dine-relax/bourbon-pub) | Sit-down; MF security |
| `sfo-hm1-c-49-mile-market` | 49 Mile Market | Near C2 | **UK** (Page) | Sun–Sat 3:30 am–10:30 pm | shop | Yes* | No | [link](https://www.flysfo.com/passengers/shop-dine-relax/49-mile-market) | |

### 3.3 Terminal 3 — E & F (representative; construction caveat)

| Proposed ID | Name | Gate / location (VF) | Security | Hours (VF) | Category | Browse | Recommend | sourceUrl | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `sfo-t3-e-ag1` | AG1 | Near E2 | **UK** (Page) | Sun–Sat Open 24 hours | shop | Yes* | No | [link](https://www.flysfo.com/passengers/shop-dine-relax/ag1) | T3 construction UX |
| `sfo-t3-f-aletitude` | Aletitude | Near F13 | **UK** (Page) | Sun–Sat 6:30 am–11:00 pm | food | Yes* | No | [link](https://www.flysfo.com/passengers/shop-dine-relax/aletitude) | |
| `sfo-t3-f-amoura` | Amoura | Food court F11–F22 | **UK** (Page) | Sun–Sat 5:00 am–11:00 pm | food | Yes* | No | [link](https://www.flysfo.com/passengers/shop-dine-relax/amoura) | Coarse gate range prose |

### 3.4 International Terminal — A & G (representative)

| Proposed ID | Name | Gate / location (VF) | Security | Hours (VF) | Category | Browse | Recommend | sourceUrl | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `sfo-it-a-boudin-bakery` | Boudin Bakery | Near A2 | **UK** (Page) | Sun–Sat 5:00 am–11:00 pm | food | Yes* | No | [link](https://www.flysfo.com/passengers/shop-dine-relax/boudin-bakery) | |
| `sfo-it-g-asian-box` | Asian Box | Near G4 | **UK** (Page) | Sun–Sat 7:00 am–11:00 pm | food | Yes* | No | [link](https://www.flysfo.com/passengers/shop-dine-relax/asian-box) | |
| `sfo-it-g-1300-on-fillmore` | 1300 on Fillmore | Near G11 | **UK** (Page) | Sun–Sat 7:00 am–11:00 pm | food | Yes* | No | [link](https://www.flysfo.com/passengers/shop-dine-relax/1300-fillmore) | Sit-down |
| `sfo-it-g-aviation-museum-library` | Aviation Museum & Library | IT G (no gate) | **UK** | Sun–Sat 10:00 am–4:30 pm | shop* | Yes* | No | [link](https://www.flysfo.com/passengers/shop-dine-relax/aviation-museum-library) | *Category `shop` weak — MF attraction not dining |

---

## 4. Verified vs unknown (field-level)

| Field | Shipped 12 (D) | T2 reserves (6) | Other terminals (10) |
| --- | --- | --- | --- |
| Name, terminal, listing URL | VF | VF | VF |
| Gate / location prose | VF (8 gate + 4 Retail St) | VF | VF (1 museum without gate) |
| Hours text | VF (GW-A-R002) | VF | VF where on page |
| Post-security | VF (S1–S4) | VF (S4/S1) | **UK** until S4 batch per terminal |
| Phone | VF partial | VF partial | VF partial |
| Recommend eligibility | **12 Yes** | No | No |
| Travel / queue / activity | UK (null) | UK | UK |

---

## 5. Proposed staged rollout order

Priority = verification quality + operational complexity (not terminal number alone).

| Stage | Scope | Rows (approx.) | Rationale |
| --- | --- | ---: | --- |
| **0** | T2 D — production **12** | 12 | Shipped @ `af5fe21`; recommend scope |
| **1** | T2 D — post-verified reserves | 6 | Same boarding area; S4/S1 already in GW-003 |
| **2** | Harvey Milk T1 B/C | TBD (24+ in S4 T2 filter was T2 only) | Run **S4-equivalent** filter `location=HM1` + post-security per GW-X batch rules |
| **3** | International A & G | TBD | International connection copy; customs out of scope |
| **4** | Terminal 3 E & F | TBD | **T3 construction** banner mandatory ([construction page](https://www.flysfo.com/about/construction/terminal-3-construction)) |

**Recommend scope expansion:** Separate lead task after **Phase B** edges + **G-X1** eligibility policy — not implied by directory stages.

---

## 6. Architecture proposal — backward-compatible migration (GW-X-001 input)

Documentation only — types not changed in R002.

### 6.1 Geographic model

```ts
// Proposed — not implemented
type AirportIata = "SFO";

type TerminalCode =
  | "harvey_milk_1"
  | "terminal_2"
  | "terminal_3"
  | "international";

type BoardingAreaCode = "B" | "C" | "D" | "E" | "F" | "A" | "G";

type GateLandmark = /* union grows per verified gates; legacy D1|D4|... retained */;

type RecommendScopeZone = "D"; // production until authorized expansion
```

**Relationships:** `SFO` → 4 terminals → 1–2 boarding areas each → gate landmarks (optional) → facilities.

### 6.2 `Facility` extensions (minimal)

| Field | Purpose | Legacy rows |
| --- | --- | --- |
| `airportIata` | Default `SFO` | Default on read |
| `terminalCode` | Harvey Milk / T2 / T3 / IT | Default `terminal_2` for shipped 12 |
| `boardingAreaCode` | B–G | Default `D` |
| `zone` | **Recommend scope** (`D` today) | Unchanged |
| `browseEligible` | Directory inclusion | `true` for shipped |
| `recommendEligible` | Time model inclusion | `true` only shipped 12 today |
| `securityZone` + evidence ref | post/pre/unknown | Unchanged semantics |
| `id` | Stable string | Keep existing `sfo-t2-d-*` |

### 6.3 Validation rules (proposal)

- `recommendEligible` ⇒ `securityZone` ∈ {`post`, `both`} and `zone` ∈ authorized recommend scope.
- `official_verified` location ⇒ `sourceUrl` + `lastCheckedAt`.
- Unknown security ⇒ `securityZone: unknown` or withhold from browse per lead policy.
- No route edges invented in facility rows.

### 6.4 Browse vs recommend (product)

| Surface | Data | Rule |
| --- | --- | --- |
| **Explore directory** | Airport-wide rows with provenance | Show limitations; UK security labeled |
| **Recommendations** | Subset with `recommendEligible` + matrix edges | Unchanged D model until B/X tasks |

---

## 7. Unresolved risks

| Risk | Mitigation |
| --- | --- |
| Directory listing ≠ safe airside access | Per-row S4-style evidence before `post` |
| T3 interim walkways | UX disclaimer; no walk minutes |
| Peet's / Plant gate conflicts | MF flags; no auto-merge |
| Aviation Museum category | MF — not standard food/shop |
| Sweet Maple HTTP 403 | Omitted (GW-003) |
| API static ingestion | GW-A-R001 — HTML path preferred |
| ID churn on slug change | Store flysfo slug + alias table in provenance |

---

## 8. G-X0 readiness

| Input | Status |
| --- | --- |
| GW-X-R001 | Accepted on `main` @ `76b9196` |
| GW-X-R002 | This document |
| Migration design | §6 (proposal for lead review) |

**G-X0 recommendation:** **READY** for human **sign-off** to authorize **GW-X-001** (schema migration implementation) — provided lead accepts §6 proposal, staged rollout §5, and browse/recommend split.

---

**Document version:** 1.0
