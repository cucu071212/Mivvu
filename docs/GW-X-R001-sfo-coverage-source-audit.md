# GW-X-R001 — Official SFO Coverage Source Audit

**Task:** GW-X-R001 (research only)  
**Scope:** Airport-wide SFO coverage sources for Phase X expansion (directory + future staged data)  
**Research checked:** **2026-10-25 (America/New_York)**  
**Baseline:** `main` @ `757042be6689575b2fcae4647be272ffc4344c15` (Phase X roadmap merged)  
**Companion:** [GW-A-R001](./GW-A-R001-sfo-source-api-audit.md) (API/licensing), `docs/data-provenance.md` (GW-003 D Gates evidence)

**Production recommend scope (unchanged):** Terminal 2 **D Gates** only — 12 facilities @ `af5fe21`. This audit does **not** authorize widening recommendation eligibility.

---

## 1. Executive summary

| Question | Finding |
| --- | --- |
| **Primary facility source** | [Shop/Dine/Relax](https://www.flysfo.com/passengers/shop-dine-relax) directory + per-facility pages under `/passengers/shop-dine-relax/<slug>` |
| **Terminal / gate naming** | [Static Maps](https://www.flysfo.com/maps/static-maps), [Meeting Points](https://www.flysfo.com/passengers/ground-transportation/meeting-points) |
| **Airside connectivity** | [T3 Construction](https://www.flysfo.com/about/construction/terminal-3-construction) documents **interim** post-security walkways; **not** a GateWise travel-time graph |
| **APIs** | [developers.flysfo.com](https://developers.flysfo.com/) — registration **paused**; Terms restrict static JSON ingestion ([GW-A-R001](./GW-A-R001-sfo-source-api-audit.md)) |
| **Safe directory expansion** | Staged addition of facilities with **dedicated listing pages**, terminal/boarding-area labels, and **per-row post-security evidence** — browse only until B/X eligibility tasks |
| **Not available** | Live hours/queues, POI coordinates, guaranteed cross-terminal walk minutes, exhaustive gate-active lists |

---

## 2. Verified SFO terminal / boarding-area / gate hierarchy

Sources cross-checked **2026-10-25**. Gate **ranges** are official prose, not proof every integer is active.

| Terminal (official label on flysfo.com) | Boarding areas (maps index) | Published gate range (meeting points) | Static map asset (index) |
| --- | --- | --- | --- |
| **Harvey Milk Terminal 1** | B Gates, C Gates | B1–B27; C1–C11 | Harvey Milk Terminal 1 B & C Gates |
| **Terminal 2** | D Gates | D1–D18 | Terminal 2 D Gates |
| **Terminal 3** | E Gates, F Gates | E1–E13; F1–F22 | Terminal 3 E & F Gates |
| **Dianne Feinstein International Terminal** | A Gates, G Gates | *(not in meeting-points excerpt)* | International Terminal Overview **A & G Gates** |

**Naming notes (VF):**

- International facilities appear in Shop/Dine as **“Dianne Feinstein International Terminal A”** or **“G”** (not a single merged “International” terminal code in listings).
- Harvey Milk Terminal 1 is the current public name for Terminal 1 on static maps.

**Hierarchy model (proposed for GW-X-R002 / GW-X-001 — not implemented here):**

```text
SFO (airport)
├── Harvey Milk Terminal 1
│   ├── B Gates (range B1–B27)
│   └── C Gates (range C1–C11)
├── Terminal 2
│   └── D Gates (range D1–D18)          ← production recommend scope today
├── Terminal 3
│   ├── E Gates (range E1–E13)
│   └── F Gates (range F1–F22)
└── Dianne Feinstein International Terminal
    ├── A Gates
    └── G Gates
```

---

## 3. Verified coverage sources (URLs)

| Source | URL | Provides | Limits |
| --- | --- | --- | --- |
| Shop/Dine/Relax directory | https://www.flysfo.com/passengers/shop-dine-relax | Airport-wide concessions; terminal tags on cards; badges; links to detail pages | Hours disclaimer; not live open/closed; security side not always explicit on card |
| Facility detail pages | `https://www.flysfo.com/passengers/shop-dine-relax/*` | Name, tagline, hours text, location prose, phone, badges | No lat/long; variable gate precision; pre vs post must be verified per row |
| Static maps | https://www.flysfo.com/maps/static-maps | Printable PDFs/web maps per terminal/boarding area | Orientation only; not routing graph |
| Meeting points | https://www.flysfo.com/passengers/ground-transportation/meeting-points | Gate **ranges** by terminal | Landside meeting context; not concession security proof |
| T3 construction | https://www.flysfo.com/about/construction/terminal-3-construction | Check-in relocations (D/E → T2 counters), **interim** airside walkways, AirTrain changes | Construction changes over time; interim paths ≠ permanent topology |
| SFO Developer Portal | https://developers.flysfo.com/ | Flight/reference, curb-to-gate, gate-to-gate products (catalog) | Paused registration; license limits static reuse |
| API Terms | https://developers-sandbox.flysfo.com/terms | License constraints | See GW-A-R001 |
| robots.txt | https://www.flysfo.com/robots.txt | Crawl rules | Not a content license |
| Sitemap | https://www.flysfo.com/sitemap.xml | Site index | Shop/Dine slugs not enumerated in a quick grep count (0 matches for path segment in XML fetch) — **inventory gap** for automation |
| Green business list | https://sustainability.flysfo.com/certified-green-businesses/ | Terminal + post-security for some T2 candidates (GW-003 S1) | Partial coverage |

---

## 4. Security-side boundaries & airside connectivity

### 4.1 Confirmed facts (VF — with limits)

| Statement | Source | GateWise use |
| --- | --- | --- |
| Arriving passengers cannot be met at the gate (landside) | Meeting points intro | UX copy only |
| T2 arrivals “D Gates (D1–D18)” | Meeting points | Aligns with D scope |
| “All terminals … connected by **post-security walkways**” | T3 construction | **Airport-level** claim; does not supply minutes, opening hours of paths, or construction closures |
| **Interim** walkways: T3 near E2 ↔ F rotunda; F ↔ IT G; etc. | T3 construction | Model as **operational caveat**, not a complete edge list |
| D/E check-in may use **Terminal 2** counters during construction | T3 construction | Check-in ≠ boarding area; do not merge E into T2 data model |

### 4.2 Unknown / incomplete (UK — do not infer)

| Topic | Status |
| --- | --- |
| Minute-accurate walks between terminals/boarding areas | **Unknown** — no official POI-level graph in public HTML |
| Whether a landside passenger can reach a given concession without re-screening | **Unknown** per facility — requires per-listing security evidence |
| International-to-domestic connection paths for all itineraries | Partial prose on T3 page only; not a matrix |
| Current closure of specific connectors during construction | Changes; needs dated re-check |

### 4.3 Assumptions requiring lead approval (not facts)

| Assumption | Risk if used without approval |
| --- | --- |
| “If airside, any T2 passenger can reach any T3 shop in time” | **Overstates** reachability for recommendations |
| “Gate range implies all gates operational” | May be false |
| “Shop/Dine listing implies post-security” | **False** for some entries — GW-003 used directory filters (S4) for proof |

**GateWise rule (Phase X):** **Directory browse** may list airport-wide facilities with provenance; **recommendation** remains on **D Gates + existing matrix** until **G-X1+** and **Phase B** authorize eligibility edges.

---

## 5. What can safely enter the facility directory (vs recommend)

| Criterion | Directory (GW-X-002 batch) | Recommend engine |
| --- | --- | --- |
| Dedicated `sourceUrl` on flysfo.com | **Required** when `official_verified` | Same facility record may exist but **ineligible** if outside recommend scope |
| Terminal + boarding area label on listing | **Required** at stated granularity | Zone/matrix must exist — else **unknown** status |
| Post-security evidence | **Required** per GW-003 rules (dedicated page + S4 or equivalent) | **Required** `securityZone: post` |
| Hours / phone | Optional enrichment per Phase A pattern | Does not affect status until durations known |
| Cross-terminal visit | May **display** location | **Must not** imply feasible unless margin computed with **labeled** edges |

**Already in production directory (recommend-eligible scope):** 12 × T2 D Gates (`facilities.json`).

**Categories with weak official POI data (GW-003):** Restrooms, charging — **do not invent** to fill filters.

---

## 6. Proposed incremental expansion boundaries (staged — lead approval)

Suggested **research → data** order for GW-X-R002 / GW-X-002 (not authorization to implement):

| Stage | Terminal / area | Rationale | Caveats |
| --- | --- | --- | --- |
| **0 (shipped)** | T2 D Gates | Phase A complete | Recommend scope |
| **1** | T2 D — remaining Shop/Dine listings not in MVP-12 | Same boarding area; lowest connectivity risk | De-duplicate vs shipped 12 |
| **2** | Harvey Milk T1 B/C | Large Shop/Dine presence | Verify post-security per row; B vs C landmarks |
| **3** | International Terminal A & G | Distinct labels on directory | International connection complexity; customs out of scope |
| **4** | Terminal 3 E & F | Large catalog | **T3 construction** banner on UX; interim walkways |

**Out of scope for automated expansion without new research:**

- Lounges (eligibility rules), parking/landside-only retail, AirTrain-only vendors without airside evidence
- Facilities only on third-party maps

---

## 7. Maps, PDFs, and APIs

| Asset type | Availability | GateWise use |
| --- | --- | --- |
| Terminal PDFs via static maps index | **Yes** (linked from static-maps page) | Provenance for orientation labels only |
| Gate-to-gate API | Catalog only; access paused | Phase B research; not static JSON without legal exception |
| Flight/terminal reference API | Catalog only | Does not replace Shop/Dine for hours |
| Indoor turn-by-turn | **Not found** publicly | Stay **unknown** |

---

## 8. Licensing, provenance, freshness

| Mechanism | Guidance |
| --- | --- |
| HTML extraction | Preferred path (human-verified, `sourceUrl` + `lastCheckedAt`) per Phase A |
| API Content in repo | **Unsupported** without Airport written approval (GW-A-R001 §5) |
| Images / logos | Airport IP — no reuse without consent |
| Freshness | Editorial CMS; construction pages change — re-check before batches |
| Hours | Static text; global “subject to change without notice” |

---

## 9. Research gaps & prerequisites for GW-X-R002

| Gap | R002 action |
| --- | --- |
| Full facility slug inventory by terminal | Build matrix rows from Shop/Dine + sitemap crawl policy review |
| Post-security field per listing | S4-style directory filter + dedicated page audit per row |
| Gate landmark normalization (B/C/E/F/A/G) | Map to proposed schema enums; conflicts flagged |
| De-duplication vs localized names | GW-003 localization caveat |
| Recommend eligibility per terminal | Policy doc — separate from directory rows |
| Construction-effective dates | Note on T3 rows + UX disclaimer |
| Restroom/charging official POIs | Separate research or remain absent |

---

## 10. G-X0 readiness (this task only)

| Gate input | Status |
| --- | --- |
| **GW-X-R001** | **Delivered** (this document) |
| **GW-X-R002** | **Not started** — matrix required for G-X0 per `PLAN.md` §13 |
| **Migration / browse vs recommend design** | Outlined in Phase X roadmap; detailed in R002 + lead review |

**Recommendation:** **HOLD G-X0** until **GW-X-R002** is accepted. **Authorize GW-X-R002** as the next research task.

---

## 11. Source checklist (2026-10-25)

- https://www.flysfo.com/passengers/shop-dine-relax  
- https://www.flysfo.com/maps/static-maps  
- https://www.flysfo.com/passengers/ground-transportation/meeting-points  
- https://www.flysfo.com/about/construction/terminal-3-construction  
- https://developers.flysfo.com/  
- https://developers-sandbox.flysfo.com/apis  
- https://developers-sandbox.flysfo.com/terms  
- https://www.flysfo.com/robots.txt  
- https://www.flysfo.com/sitemap.xml  
- docs/GW-A-R001-sfo-source-api-audit.md  
- docs/data-provenance.md  

---

**Document version:** 1.0  
**Status:** GW-X-R001 deliverable — pending lead acceptance.
