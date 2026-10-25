# GW-A-R002 — Facility Hours & Amenity Extraction Matrix

**Task:** GW-A-R002 (research only)  
**Scope:** All **12** shipped facilities in `src/data/facilities.json` (SFO Terminal 2, D Gates, post-security MVP)  
**Research checked:** **2026-10-25 (America/New_York)** — each row verified by re-fetching the facility `sourceUrl` on that date  
**Depends on:** [GW-A-R001](./GW-A-R001-sfo-source-api-audit.md)  
**Baseline branch:** `research/gw-a-r001-sfo-source-api-audit` @ `72782f2`

---

## 1. Legend

| Tag | Meaning |
| --- | --- |
| **VF** | Verified fact — copied from official listing HTML at `sourceUrl` on research date |
| **UK** | Unknown — not published on listing (do not invent) |
| **UF** | Unverified claim — marketing or third-party mention on page; not operational guarantee |
| **MF** | Manual follow-up — ambiguity worth lead/Teammate note before UI copy |

**Hours policy:** Site-wide [Shop/Dine/Relax](https://www.flysfo.com/passengers/shop-dine-relax) disclaimer: *“Hours are subject to change without notice.”* Published hours are **static text**, not live availability.

**Day-specific differences:** On every shipped listing checked, hours are a **single weekly line** (“Sunday … Saturday” with one open–close range). **No** per-weekday differing hours were published on these pages.

**Timezone:** All times are interpreted as **America/Los_Angeles** (SFO local) wall-clock times on the listing; no UTC offset is published.

**Post-security:** Shipped records use GW-003/S1–S4 evidence (`securityZone: post`). Individual listing pages reviewed here emphasize terminal/location, not a repeated “post-security” sentence; security classification **unchanged** from provenance doc.

---

## 2. Master matrix (12 / 12)

| # | `id` | Name (listing H1) | Hours raw (VF) | Open–close (local) | Gate / area (VF) | Phone (VF) | Tagline / services (VF) | Directory badges (VF) | Gaps / conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `sfo-t2-d-16th-dolores-general-store` | 16th & Dolores General Store | Sunday - Saturday 4:00 am-11:30 pm | 04:00–23:30 daily | D Gates, near **D16**; Terminal 2 | UK on page | Books, magazines, newspapers, snacks, souvenirs and sundries | Open Past 10PM | Accessibility UK |
| 2 | `sfo-t2-d-andale-mexican-kitchen-bar` | Andalé Mexican Kitchen + Bar | Sunday- Saturday 6:00 am-10:00 pm | 06:00–22:00 daily | Near **D16**; Terminal 2 | 650-821-9306 | Fresh made-to-order entrees, beer and wine | — | Typo “Sunday-” spacing on site (MF cosmetic) |
| 3 | `sfo-t2-d-brookstone` | Brookstone | Sunday - Saturday 6:00 am-10:00 pm | 06:00–22:00 daily | Near **D1**; Terminal 2 | 415-770-7073 | Functional gadgets for health, home, office and travel | Military Discount | — |
| 4 | `sfo-t2-d-burger-joint` | Burger Joint | Sunday- Saturday 5:00 am-11:00 pm | 05:00–23:00 daily | Near **D15**; Terminal 2 | 650-820-9308 | Niman Ranch burgers, chicken burgers, veggie burgers and hot dogs | Open Past 10PM | — |
| 5 | `sfo-t2-d-cat-cora` | Cat Cora | Sunday- Saturday 7:30 am-10:00 pm | 07:30–22:00 daily | Near **D9**; Terminal 2 | 650-821-9290 | Full cocktail bar, wine, beer and diverse small plates; extended “About” prose | Sit Down Restaurant | H1 **Cat Cora** vs about **Cat Cora's Kitchen** (MF display name); UF Conde Nast / “award-winning” in about |
| 6 | `sfo-t2-d-kiehls` | Kiehl's | Sunday - Saturday 6:00 am-10:00 pm | 06:00–22:00 daily | D Gates, **T2 Retail Street**; Terminal 2 | 650-821-9151 | Skin and hair care products | Military Discount | No nearest gate on listing (matches JSON `null` landmark) |
| 7 | `sfo-t2-d-lark-creek-grill` | Lark Creek Grill | Sunday- Saturday 6:00 am-10:00 pm | 06:00–22:00 daily | Near **D1**; Terminal 2 | 650-821-9315 | Table service, full bar, seafood, steak and breakfast | Sit Down Restaurant | UF Priority Pass accepted; UF “Top Airport Restaurants” press mention |
| 8 | `sfo-t2-d-napa-farms-market` | Napa Farms Market | Sunday- Saturday 4:30 am-11:00 pm | 04:30–23:00 daily | D Gates, **Retail Street**; Terminal 2 | 650-821-9312 | Gourmet deli, bakery, coffee, desserts, retail food products | Open Past 10PM, SFO Green Business | Long marketing paragraph (VF as description, not hours) |
| 9 | `sfo-t2-d-peets-coffee-d7` | Peet's Coffee | Sunday- Saturday 4:30 am-8:30 pm | 04:30–20:30 daily | Near **D7**; Terminal 2 | 650-821-9196 | Specialty coffee and tea; pastries, sandwiches and salads | SFO Green Business | **Not in scope:** separate D15 Peet's listing / D14 article conflict (GW-003); shipped ID is **D7 only** |
| 10 | `sfo-t2-d-sunglass-hut` | Sunglass Hut | Sunday - Saturday 7:00 am-8:00 pm | 07:00–20:00 daily | D Gates, **Retail Street**; Terminal 2 | 650-821-9160 | Designer sunglasses and accessories | — | Earliest close (20:00) among shops; no gate landmark |
| 11 | `sfo-t2-d-the-chocolate-market` | The Chocolate Market | Sunday - Saturday 7:00 am-9:00 pm | 07:00–21:00 daily | D Gates, **T2 Retail Street**; Terminal 2 | 650-284-9748 | Artisanal Swiss chocolates; local SF/CA chocolatiers | — | — |
| 12 | `sfo-t2-d-wakaba` | Wakaba | Sunday- Saturday 6:30 am-10:30 pm | 06:30–22:30 daily | Near **D9**; Terminal 2 | 650-821-0818 | Japanese sushi, noodles, teriyaki, bento; beer and sake | SFO Green Business | About mentions **Sankaku (Terminal 3)** — out of MVP scope (MF: do not import T3 entity) |

**Coverage:** **12 / 12** facilities with `sourceUrl` re-checked **2026-10-25**.

### 2.1 JSON location fields vs listing (VF comparison)

| `id` | `nearestGateLandmark` in JSON | Listing gate landmark | Match? |
| --- | --- | --- | --- |
| 16th & Dolores | D16 | D16 | Yes |
| Andalé | D16 | D16 | Yes |
| Brookstone | D1 | D1 | Yes |
| Burger Joint | D15 | D15 | Yes |
| Cat Cora | D9 | D9 | Yes |
| Kiehl's | null | Retail Street only | Yes (intentional null) |
| Lark Creek | D1 | D1 | Yes |
| Napa Farms | null | Retail Street | Yes |
| Peet's D7 | D7 | D7 | Yes |
| Sunglass Hut | null | Retail Street | Yes |
| Chocolate Market | null | T2 Retail Street | Yes |
| Wakaba | D9 | D9 | Yes |

No gate landmark conflicts for the **shipped** twelve.

---

## 3. Verified hours summary

| Facility | Closes (local) | Opens (local) | Notes |
| --- | --- | --- | --- |
| 16th & Dolores | 23:30 | 04:00 | Latest close in set |
| Napa Farms | 23:00 | 04:30 | |
| Burger Joint | 23:00 | 05:00 | |
| Wakaba | 22:30 | 06:30 | |
| Andalé, Brookstone, Cat Cora, Kiehl's, Lark Creek | 22:00 | varies 06:00–07:30 | Cat Cora opens 07:30 |
| Chocolate Market | 21:00 | 07:00 | |
| Peet's D7 | 20:30 | 04:30 | Shortest evening hours |
| Sunglass Hut | 20:00 | 07:00 | |

**Recommendation engine:** Hours remain **informational** for Phase A UI; `waitMinutes` / `activityMinutes` stay **null** (`timeConfidence: unknown`) unless a future authorized task adds user/demo estimates.

---

## 4. Verified amenities / taxonomy signals

Official **directory badges** observed (not all appear on every page):

| Badge | Facility IDs |
| --- | --- |
| Open Past 10PM | 16th & Dolores, Burger Joint, Napa Farms |
| Military Discount | Brookstone, Kiehl's |
| Sit Down Restaurant | Cat Cora, Lark Creek Grill |
| SFO Green Business | Napa Farms, Peet's D7, Wakaba |

**GateWise `category` (existing, VF alignment):**

| category | Count | IDs |
| --- | --- | --- |
| `food` | 6 | Andalé, Burger Joint, Cat Cora, Lark Creek, Napa Farms, Wakaba |
| `coffee` | 1 | Peet's D7 (also sells food per listing — single primary category retained) |
| `shop` | 5 | 16th & Dolores, Brookstone, Kiehl's, Sunglass Hut, Chocolate Market |

**UK on all 12:** wheelchair/accessibility-specific text, halal/kosher, payment types, live wait times.

---

## 5. Unknown and conflicting records

### 5.1 Unknown (do not populate in GW-A-002 without new sources)

- Real-time open/closed status  
- Holiday or irregular closures  
- Per-weekday hour splits (not published; if site later adds them, re-check)  
- Queue, prep, or activity durations  
- Indoor walking minutes gate ↔ facility  

### 5.2 Conflicts / follow-ups (shipped set)

| Issue | Severity | Action |
| --- | --- | --- |
| Peet's D14 vs D15 (other listing) | **N/A to shipped ID** | Shipped record is **D7** only; keep GW-003 conflict doc for reserves |
| Cat Cora vs Cat Cora's Kitchen naming | Low (MF) | Prefer listing H1 **Cat Cora** for `name`; optional `marketingName` in schema |
| Wakaba copy references Terminal 3 Sankaku | Low (MF) | Do not add T3 facilities; optional footnote in UI |
| Lark Creek Priority Pass / awards | Low (UF) | Omit or label UF in amenities if shown |
| Site punctuation in hours lines | Cosmetic | Store `hoursRawText` verbatim + normalized local times |

---

## 6. Schema proposal (documentation only — no `airport.ts` change in R002)

Minimal backward-compatible extension to `Facility` for GW-A-001 implementation review.

### 6.1 New types (proposed)

```ts
/** IANA zone for interpreting open/close without offset in source. */
type FacilityHoursTimezone = "America/Los_Angeles";

/** When official site publishes one daily range for all days. */
type FacilityWeeklyHours = {
  kind: "weekly_same_all_days";
  /** Verbatim line from listing, e.g. "Sunday - Saturday 4:00 am-11:30 pm" */
  rawText: string;
  /** Normalized 24h HH:mm in airport local time; null if parse failed */
  openLocal: string | null;
  closeLocal: string | null;
  timezone: FacilityHoursTimezone;
};

type FacilityHours =
  | FacilityWeeklyHours
  | { kind: "unknown"; rawText?: string };

type FacilityOfficialBadge =
  | "open_past_10pm"
  | "military_discount"
  | "sit_down_restaurant"
  | "sfo_green_business";

type FacilityContact = {
  phoneE164OrDisplay: string | null; // store as published e.g. "650-821-9306"
  phoneSource: "official_listing" | "unknown";
};

type FacilityAmenityDetails = {
  /** Short tagline under H1 on flysfo.com */
  tagline: string | null;
  /** Normalized badges from listing / directory */
  officialBadges: FacilityOfficialBadge[];
  /** Longer "About" HTML summarized or omitted; if stored, cap length */
  aboutExcerpt: string | null;
};
```

### 6.2 Fields added to `Facility` (proposed)

| Field | Type | Required? | Semantics |
| --- | --- | --- | --- |
| `hours` | `FacilityHours` | No (default `unknown`) | Static published schedule only |
| `hoursConfidence` | `DataConfidence` | If `hours.kind !== 'unknown'` → `official_verified` | Mirrors location pattern |
| `hoursLastCheckedAt` | `YYYY-MM-DD` | Required when hours VF | May equal `lastCheckedAt` or be more specific |
| `hoursSourceUrl` | string | Required when hours VF | Usually same as `sourceUrl` |
| `contact` | `FacilityContact` | Optional | Phone when listed |
| `amenityDetails` | `FacilityAmenityDetails` | Optional | Tagline + badges; no invented services |

**Provenance:** Reuse existing `sourceUrl` + `lastCheckedAt` for location; hours may share the same URL/date or duplicate for clarity — validator should require `hoursSourceUrl` when `hoursConfidence === 'official_verified'`.

**Unknown handling:** `hours: { kind: 'unknown' }` — UI shows “Hours not published” / link to official page; never default to 24/7.

**Timezone behavior:** Display in **America/Los_Angeles**; do not convert to user locale for “is it open now” without a separate **non-live** “model estimate” feature and disclaimer (out of GW-A-002).

**Validation (GW-A-001 targets):**

- If `hours.kind === 'weekly_same_all_days'`, require `rawText`, `timezone`, and `hoursLastCheckedAt`; `openLocal`/`closeLocal` must parse or both be null with a validation warning code `hours_parse_partial`.  
- `officialBadges` enum-only — reject free-text claims (UF press quotes excluded).  
- `phoneE164OrDisplay` optional string; no fake numbers.  
- **No** change to `recommendFacilities` inputs unless a future gated task uses hours for eligibility (default: **hours do not affect** feasibility status).  
- Backward compat: missing `hours` → treat as `unknown` in UI.

### 6.3 Suggested JSON example (one facility — not committed to repo in R002)

```json
{
  "id": "sfo-t2-d-peets-coffee-d7",
  "hours": {
    "kind": "weekly_same_all_days",
    "rawText": "Sunday- Saturday 4:30 am-8:30 pm",
    "openLocal": "04:30",
    "closeLocal": "20:30",
    "timezone": "America/Los_Angeles"
  },
  "hoursConfidence": "official_verified",
  "hoursLastCheckedAt": "2026-10-25",
  "hoursSourceUrl": "https://www.flysfo.com/passengers/shop-dine-relax/peets-coffee-0",
  "contact": {
    "phoneE164OrDisplay": "650-821-9196",
    "phoneSource": "official_listing"
  },
  "amenityDetails": {
    "tagline": "Specialty coffee and tea",
    "officialBadges": ["sfo_green_business"],
    "aboutExcerpt": "Specialty coffee and tea, pastries, sandwiches and salads"
  }
}
```

---

## 7. GW-A-002 implementation hints (post G-A0)

1. Populate all 12 rows from §2 matrix; set `hoursLastCheckedAt` to verification date.  
2. Leave `waitMinutes`, `activityMinutes`, `timeConfidence` unchanged unless lead authorizes demo activity times.  
3. Update `docs/data-provenance.md` changelog when JSON merges.  
4. Run `npm test -- validate-facilities` after GW-A-001 validator changes.

---

## 8. Sources

- Per-facility URLs = `sourceUrl` in `src/data/facilities.json` (12 links)  
- Directory disclaimer: https://www.flysfo.com/passengers/shop-dine-relax  
- API/automation context: [GW-A-R001](./GW-A-R001-sfo-source-api-audit.md)  
- Security / candidate history: `docs/data-provenance.md` (GW-003)

---

**Document version:** 1.0  
**Status:** GW-A-R002 deliverable — pending lead acceptance for G-A0.
