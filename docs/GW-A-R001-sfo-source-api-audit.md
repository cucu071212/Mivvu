# GW-A-R001 — SFO Official Source & API Audit

**Task:** GW-A-R001 (research only)  
**Scope:** SFO Terminal 2 **D Gates** concessions relevant to GateWise’s shipped 12-facility dataset  
**Research checked:** **2026-10-25 (America/New_York)**  
**Researcher role:** Engineering Lead (docs)  
**Baseline:** `main` @ `f22a1030b87c16dacdd9cd77fee7be85f196afce` after roadmap merge  
**Companion:** `docs/data-provenance.md` (GW-003 candidate evidence); this document adds **APIs, automation, and obtainability** for Phase A.

---

## 1. Executive summary

| Category | Verdict |
| --- | --- |
| **Authoritative public web (flysfo.com)** | Primary source for facility names, coarse location, static hours text, marketing descriptions, filter badges, and phone numbers for Shop/Dine/Relax listings. |
| **SFO Developer Portal APIs** | Three documented products (Flight & Reference, Curb To Gate, Gate-To-Gate). **New developer registration paused** on production portal (2026-10-25). Access requires signed Terms of Service; license is **revocable**, **non-transferable**, and **restricts caching/export/aggregation** of API Content. |
| **Live queue / wait times** | **Not found** in official public sources reviewed. |
| **Real-time open/closed per facility** | Directory shows marketing badges (e.g. “Open Past 10PM”); not verified as live operational status. Hours disclaimer: subject to change without notice. |
| **Indoor routing to concessions** | Static/PDF terminal maps and prose locations only on public web; Gate-To-Gate API describes **gate-to-gate** estimates **if licensed** — not validated for amenity-level routing in this audit. |
| **Photos** | Hosted on flysfo.com; airport Terms treat Content and IP as City property — **no reuse rights** for GateWise without separate written consent. |
| **Recommended data path for Phase A enrichment** | Human-verified extraction from official listing URLs (already in `facilities.json` as `sourceUrl`), with `lastCheckedAt` and field-level provenance — **not** bulk scrape or API-backed cache into the repo without legal review. |

---

## 2. Shipped dataset anchor (read-only)

GateWise production scope uses **12** facilities in `src/data/facilities.json`, each with an official Shop/Dine/Relax `sourceUrl` under:

`https://www.flysfo.com/passengers/shop-dine-relax/<slug>`

Examples checked in this audit: [Brookstone](https://www.flysfo.com/passengers/shop-dine-relax/brookstone-t2), [Napa Farms Market](https://www.flysfo.com/passengers/shop-dine-relax/napa-farms-market), [Peet's Coffee](https://www.flysfo.com/passengers/shop-dine-relax/peets-coffee-0).  
This task **did not** modify JSON or application code.

---

## 3. Authoritative public sources (non-API)

### 3.1 Shop/Dine/Relax directory

| URL | What it provides | Limits |
| --- | --- | --- |
| [Shop/Dine/Relax](https://www.flysfo.com/passengers/shop-dine-relax) | Terminal filters, category badges (e.g. Sit Down Restaurant, Open Past 10PM, Military Discount, SFO Green Business), links to facility pages | Global note: **“Hours are subject to change without notice.”** Listing cards are not a live availability API. |
| Per-facility pages (12 `sourceUrl`s) | Display name, tagline/description, **static hours line** (e.g. “Sunday - Saturday 6:00 am-10:00 pm”), location prose (e.g. “Near Gate D1”), terminal label, phone, optional badges | No coordinates, no queue times, no walking minutes to gate; security-side often implied by post-security directory context but must still match GW-003 evidence rules. |
| [Late-night / extended hours content](https://www.flysfo.com/passengers/shop-dine-relax) (linked from roadmap research) | Some T2 concessions appear on aggregate “open past 10PM” style listings | **Partial** coverage vs all 12 IDs; not a substitute for per-page hours text (GW-A-R002 will matrix this). |

### 3.2 Terminal, gate, and maps

| URL | What it provides | Limits |
| --- | --- | --- |
| [Static Maps](https://www.flysfo.com/maps/static-maps) | Printable overview maps including **Terminal 2 D Gates** (PDF/web assets; e.g. tabloid PDF linked from map index per GW-003) | Orientation and naming; **not** turn-by-turn or measured walks to individual concessions. Map grid cells (e.g. directory codes) must not be confused with gate IDs (GW-003). |
| [Meeting Points](https://www.flysfo.com/passengers/ground-transportation/meeting-points) | Published gate **ranges** (T2 ↔ D1–D18) | Range ≠ exhaustive active gate list for UI dropdowns. |
| [Terminal 3 Construction](https://www.flysfo.com/about/construction/terminal-3-construction) | Operational context for connections | Out of GateWise T2 D-only MVP scope. |

### 3.3 Site mechanics (automation hints only — not permission to scrape)

| Check | Finding |
| --- | --- |
| [robots.txt](https://www.flysfo.com/robots.txt) | Does **not** disallow `/passengers/shop-dine-relax`. Disallows `/admin/`, `/search/`, auth paths, etc. Sitemap: `https://www.flysfo.com/sitemap.xml`. |
| Automated HTTP fetch | Some paths return **403** to non-browser clients (observed for at least one listing slug via `curl`); browser retrieval succeeded for others in this session. **Technical reachability ≠ license to bulk harvest or redistribute.** |
| Update method | Drupal-style public site; content updates are **editorial** (no public changelog API for concessions reviewed here). Freshness = **re-check listing pages** and record `lastCheckedAt`. |

---

## 4. SFO Developer Portal — products and access

### 4.1 Portals checked

| Portal | URL | Status (2026-10-25) |
| --- | --- | --- |
| Production | [developers.flysfo.com](https://developers.flysfo.com/) | **“New developer registration … currently paused.”** Contact `sfo-apisupport@flysfo.com`. |
| Sandbox / catalog | [developers-sandbox.flysfo.com](https://developers-sandbox.flysfo.com/) | Describes program; signed PDF Terms required before registration. |

### 4.2 API products (catalog text only — schemas not verified in this audit)

From [sandbox APIs index](https://developers-sandbox.flysfo.com/apis):

| Product | Stated purpose | Relevance to GateWise Phase A (facilities) |
| --- | --- | --- |
| **SFO Flight and Reference Data API** | Planned and real-time flights; reference data for airport, airline, **terminal**, **boarding area**, aircraft | **Low** for hours/amenities. Terminal/boarding area reference might align with zone naming but does **not** replace concession listings. Live flight integration is **out of product scope** per `PLAN.md` / roadmap. |
| **SFO Curb To Gate API** | Estimated time curb → gate; references terminal/door/gate APIs | **Not** concession walking times; preconditioning only for airport-wide journey estimates. |
| **Gate-To-Gate Connection** | Estimated **time and distance** from one **gate** to another | Potential **Phase B** input for walk budgets **between gates**, not shop-level POIs. Requires agreement, runtime API use, and legal fit (see §5). **Not evaluated** against live responses in this audit (no API key). |

**Costs:** Public catalog does not list dollar pricing; Terms describe a **royalty-free** license **subject to agreement** and compliance — not “open data.”

**OpenAPI / field-level documentation:** Not retrieved in full during this audit (portal pages are marketing/catalog level). **No claim** of specific JSON fields for concessions, hours, or queues.

---

## 5. License and integration constraints (API Terms)

Source: [SFO API Terms of Service](https://developers-sandbox.flysfo.com/terms) (sandbox; production program references same agreement flow).

High-signal restrictions for GateWise architecture:

| Clause theme | Implication for GateWise |
| --- | --- |
| Content includes **“map and places data”** | Concession-like data **may** exist via API, but only under contract — not verified here. |
| **No pre-fetch, index, store, or cache Content for use outside the API** (§3.4.i) | Conflicts with storing API payloads in `facilities.json` or build-time ingestion **unless** Airport approves a different pattern in writing. |
| **No export/save Content to a third-party platform** (§3.4.h) | Static hosting (e.g. Vercel) + committed JSON likely counts as export — **legal review required** before API-backed enrichment. |
| **No aggregating, analyzing, extracting, or repurposing Content** (§3.4.l) | Conflicts with offline recommendation engine precomputing from API-derived place graphs without explicit permission. |
| **Public apps must be free** unless Airport Director approves fees (§3.1) | Aligns with current demo; future monetization needs approval. |
| **Revocable, non-transferable** license; City may terminate at sole discretion (§5.2) | Operational risk for any hard dependency on API Content in production. |
| **Airport IP** (logos, CADD, copyrighted publications) requires **prior written consent** (§7.7) | Facility hero images on flysfo.com are **not** automatically usable in GateWise UI. |

**Conclusion:** SFO APIs are **unsupported for Phase A facility enrichment** in the current GateWise model (static JSON + client-side engine) **without** a negotiated exception or a runtime-only integration design approved by the Airport and human lead. Phase B may revisit **Gate-To-Gate** solely for **gate-level** demo estimates with the same legal gate.

---

## 6. Obtainability matrix (research questions)

| Information need | Obtainable from official sources? | Source type | Verified in this audit? | Notes |
| --- | --- | --- | --- | --- |
| Operating hours (static text) | **Yes**, for many listings | Per-facility HTML | **Partial** (sample pages + directory disclaimer) | Not real-time; GW-A-R002 will row all 12 IDs. |
| Operating hours (live) | **No evidence** | — | No | Treat as **unavailable**. |
| Terminal / gate area labels | **Yes**, coarse | Listings, meeting points, maps | Yes (consistent with GW-003) | “Near Gate Dx”, “Retail Street”, Terminal 2. |
| Precise indoor coordinates | **No** on public listing pages | — | No | **Unavailable** for MVP enrichment path. |
| Amenity descriptions & services | **Yes**, marketing level | Taglines, badges, prose | Partial | Filters include restaurant type, discounts, green business, etc. |
| Security side (pre/post) | **Sometimes explicit** | Directory + dedicated pages | Deferred to GW-003 + R002 | Do not infer from gate proximity alone. |
| Official maps | **Yes** | Static PDFs/images | Yes (index page) | Walking **distance** not published as numeric graph for concessions. |
| Walking time / distance (gate ↔ gate) | **Maybe** via Gate-To-Gate API | Licensed API | **Not tested** (no access) | Phase B; label as estimate per API docs if ever used. |
| Walking time (gate ↔ shop) | **Not found** officially | — | No | Remains **demo_estimate** or **unknown** in matrix. |
| Queue / TSA / concession wait | **Not found** | — | No | **Unavailable** — aligns with roadmap “unavailable APIs” list. |
| Photos | **Yes** on site | CDN assets | Yes | **Usage rights not granted** to third parties by Terms. |
| Data freshness | **Manual** | Editorial CMS | Yes | No public concession feed identified. |
| Machine-readable open data catalog | **No** public SF open-data set identified for T2 concessions | — | No | API program is proprietary, not CKAN-style open data. |

---

## 7. Distinguishing fact classes (GateWise policy)

| Class | Definition | Phase A action |
| --- | --- | --- |
| **Verified fact** | Copied from official flysfo.com text with `sourceUrl` + `lastCheckedAt` | Allowed in `facilities.json` after GW-A-001 schema + G-A0. |
| **Demo estimate** | Model or user-supplied time/distance | Already used for travel matrix; must stay labeled. |
| **Unknown** | Not published officially | Keep `null` / unknown — never zero-filled. |
| **Unsupported integration** | Would require API cache, scrape pipeline, or live flight/queue feeds | **Do not implement** in GW-A-R001/R002; flag for lead + legal. |

---

## 8. Unsupported or out-of-scope integrations (explicit)

- Live SFO **queue/wait** API for dining or security.
- **Live flight / gate assignment** feeds for GateWise P0+ product direction.
- **Official turn-by-turn indoor routing** to each of the 12 amenities.
- **Real-time open/closed** per facility as an API (only static/marketing signals on web).
- Bulk **scraping** or **sitemap-driven ingestion** without rights review (robots.txt is not a data license).
- Embedding **flysfo.com images** or **API Content** without Airport written approval.

---

## 9. Risks and limitations of this audit

- No API keys were issued; **no live API responses** were captured.
- Not all 12 facility pages were re-fetched line-by-line in this document (delegated to **GW-A-R002** matrix).
- HTTP 403 behavior may vary by client, geography, or WAF rules — re-check from lead environment before any automation decision.
- Airport construction, seasonal hours, and concession churn can invalidate static hours without notice (site disclaimer).

---

## 10. Recommended next steps

| Order | Task | Rationale |
| --- | --- | --- |
| 1 | **GW-A-R002** — per-facility field matrix for all 12 IDs | Converts this audit into actionable extraction spec (hours conflicts, badges, accessibility mentions). |
| 2 | Human lead **G-A0** decision | Plan requires **GW-A-R001 + GW-A-R002** + schema review before GW-A-001. |
| 3 | Optional: contact `sfo-apisupport@flysfo.com` | Only if lead wants Phase B Gate-To-Gate or future flight-adjacent features — ask specifically about **static JSON redistribution** and **map/places fields**. |
| 4 | Defer **GW-B-R001** until **G-A1** | Indoor distance research builds on enriched facility locations. |

---

## 11. URLs consulted (checklist)

- https://www.flysfo.com/passengers/shop-dine-relax  
- https://www.flysfo.com/passengers/shop-dine-relax/brookstone-t2  
- https://www.flysfo.com/maps/static-maps  
- https://www.flysfo.com/robots.txt  
- https://developers.flysfo.com/  
- https://developers-sandbox.flysfo.com/  
- https://developers-sandbox.flysfo.com/apis  
- https://developers-sandbox.flysfo.com/terms  
- GW-003 references: meeting points, T3 construction, T2 map PDF (see `docs/data-provenance.md`)

---

**Document version:** 1.0  
**Status:** GW-A-R001 deliverable — research complete pending lead acceptance.
