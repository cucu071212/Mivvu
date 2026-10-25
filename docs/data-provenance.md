# GW-003: SFO scope and data provenance

Research checked: **2026-10-24 (America/New_York)**. Owner: Teammate Codex.
Scope: GW-003 research, GW-001 handoff, and the explicitly authorized GW-004 readiness preparation only. No facility JSON, contracts, time matrix, or application code is implemented here. The Engineering Lead approved the 12-facility shortlist and exclusion policy on 2026-10-24; shared contracts and JSON implementation remain gated on GW-001 review and integration.

## Recommended single-terminal scope

Recommend **SFO Terminal 2, D Gates**, limited to facilities with confirmed post-security access. Eighteen candidate records are documented below across the existing `food`, `coffee`, and `shop` categories. GW-003 established explicit post-security evidence for eight; the subsequent GW-004 readiness review found official directory-filter evidence for the other ten (S4 below). Location/name conflicts remain unresolved for three candidates. A candidate is not automatically a validated dataset entry.

This is a compact scope with multiple dining and retail listings. It avoids relying on Terminal 3's interim construction routes. This is a project-scope recommendation, not a claim that Terminal 2 is free of operational changes.

### Terminal and gate-area evidence

| Official source actually checked | Finding | Limits |
| --- | --- | --- |
| [SFO Static Maps](https://www.flysfo.com/maps/static-maps) | Labels Terminal 2 as D Gates; Terminal 3 as E & F Gates; Harvey Milk Terminal 1 as B & C Gates. | Terminal map coverage can include neighboring terminals and connectors. |
| [SFO Meeting Points](https://www.flysfo.com/passengers/ground-transportation/meeting-points) | Associates Terminal 2 with the D1-D18 gate range; Terminal 3 with E1-E13 and F1-F22. | A published range is not proof that every integer is an active gate. Do not generate an exhaustive gate dropdown from the range. |
| [SFO Shop/Dine/Relax](https://www.flysfo.com/passengers/shop-dine-relax) | Lists Terminal 2 concessions; individual location pages below identify D gates and Retail Street. | Dynamic open/closed badges and hours are not live availability guarantees. |
| [SFO Terminal 3 Construction](https://www.flysfo.com/about/construction/terminal-3-construction) | Describes interim post-security connections and directs D/E departures to Terminal 2 check-in counters. | Shared check-in counters do not make E Gates part of Terminal 2. Do not model construction detours or terminal crossings in this MVP. |

**D, E, and F are not verified subzones of one terminal.** Use D only for the recommended scope. Individually referenced D-gate landmarks in the candidate sources include **D1, D4, D7, D9, D15, and D16**; they are location references, not proposed separate zones. D14 appears in a conflicting article discussed below.

The current static-map index links a [Terminal 2 printable map](https://www.flysfo.com/sites/default/files/2025-11/251027_SFO_Tabloid_Face%20A_T2_Web.pdf). Its text was retrieved; a screenshot request did not provide a viewable image in this session. No facility security-side claim here relies on visual interpretation of that PDF. Its directory uses map-grid references: a directory cell such as E3 must not be converted into an E-gate facility or a TypeScript zone. The map also lists businesses in neighboring areas, so the document title alone is insufficient location evidence.

## Evidence and confidence rules

- Each candidate row was checked on **2026-10-24**. This is the research date, not a source publication date or an on-site inspection.
- Names and location descriptions below are supported by the linked SFO listing. Category assignments are proposed GateWise classifications based on the listing's offering; they are not SFO taxonomy exports.
- `post` means an official source explicitly identifies post-security access. `unknown` means the reviewed evidence does not explicitly establish security side; a nearby D gate alone is not treated as confirmation here.
- An `unknown` security side must remain unknown or the entry must be withheld until verified. Do not silently convert it to `post` on the basis of the terminal recommendation.
- `official_verified` can describe the sourced name/terminal/location facts at the stated granularity. It must not imply verified security side when that field remains unknown, precise coordinates, current opening, route availability, or time estimates.
- **All walking, queue, activity and return durations remain unverified.** Unknown durations must remain `null` in later data work. Any subsequently approved simulated durations require `demo_estimate` labels and separate provenance; no numerical time values are proposed by this research.

## Candidate facilities

All rows: **Terminal 2; proposed coarse zone `D`; checked 2026-10-24**. Locations retain the source's granularity; Retail Street entries have no invented nearest gate. Rows are research references, not production IDs.

Security references:

- **S1:** [SFO Sustainability: Certified Green Businesses](https://sustainability.flysfo.com/certified-green-businesses/) explicitly lists terminal, area and security side for Books Inc., Napa Farms Market, both Peet's locations and Wakaba.
- **S2:** [SFO Late Night Dining Options](https://www.flysfo.com/late-night-dining-options-sfo) explicitly lists Terminal 2 Burger Joint and 16th & Dolores General Store as post-security (and corroborates Napa Farms Market).
- **S3:** [SFO Traveling with Kids](https://www.flysfo.com/de/node/9980) explicitly identifies Brookstone near D1 and 16th & Dolores near D16 as post-security.
- **S4 (GW-004 preparation, 2026-10-24):** [Official directory with Terminal 2 and Post-Security selected](https://www.flysfo.com/passengers/shop-dine-relax?title=&field_hours_of_operation_status=All&location=2&gate_area=All&security=73&service_tags=All&content_type=All). Verified interactively in the browser: Terminal 2 selected, Post-Security selected, hours/content/gate-area filters unrestricted, then Load more vendors. The resulting 24-record list includes all ten formerly unknown candidates. `security=73` was observed from the actual control, not guessed. Merely seeing a Post-Security filter label on an unfiltered page is not evidence. Search-tool retrieval of this filtered URL failed; the browser did show the selected controls and results. Localized titles can lag the English pages; use the dedicated English facility URLs for display names and the selected filter for security classification.

| # | Facility name | Proposed category | Official location description | Security side / evidence | Official facility URL actually checked |
| --- | --- | --- | --- | --- | --- |
| 1 | Andalé Mexican Kitchen + Bar | `food` | Near Gate D16 | `post`, S4 (localized result: Andalé Mexican Restaurant) | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/andale-mexican-kitchen-bar) |
| 2 | Burger Joint | `food` | Near Gate D15 | `post`, S2 | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/burger-joint) |
| 3 | Cat Cora | `food` | Near Gate D9 | `post`, S4 | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/cat-cora) |
| 4 | Lark Creek Grill | `food` | Near Gate D1 | `post`, S4 | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/lark-creek-grill) |
| 5 | Napa Farms Market | `food` | D Gates, Retail Street | `post`, S1 and S2 | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/napa-farms-market) |
| 6 | The Plant Café and Pinkberry | `food` | Near Gate D4; D3 conflict remains | `post`, S4 | [Combined listing](https://www.flysfo.com/passengers/shop-dine-relax/plant-cafe-and-pinkberry) |
| 7 | Vino Volo | `food` | D Gates, Retail Street | `post`, S4 | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/vino-volo) |
| 8 | Wakaba | `food` | Near Gate D9 | `post`, S1 | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/wakaba) |
| 9 | Peet's Coffee (D7 location) | `coffee` | Near Gate D7 | `post`, S1 | [D7 listing](https://www.flysfo.com/passengers/shop-dine-relax/peets-coffee-0) |
| 10 | Peet's Coffee (D15 location) | `coffee` | D Gates, near Gate D15 | `post`, S1; D14 conflict noted below | [D15 listing](https://www.flysfo.com/passengers/shop-dine-relax/peets-coffee) |
| 11 | 16th & Dolores General Store | `shop` | D Gates, near Gate D16 | `post`, S2 | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/16th-dolores-general-store) |
| 12 | Books Inc. | `shop` | D Gates, Retail Street | `post`, S1; naming ambiguity noted below | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/books-inc) |
| 13 | Brookstone | `shop` | Near Gate D1 | `post`, S3 | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/brookstone-t2) |
| 14 | Kiehl's | `shop` | D Gates, T2 Retail Street | `post`, S4 | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/kiehls) |
| 15 | SFO News Express | `shop` | Near Gate D4 | `post`, S4 | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/sfo-news-express) |
| 16 | Sunglass Hut | `shop` | D Gates, Retail Street | `post`, S4 | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/sunglass-hut-t2) |
| 17 | The Chocolate Market | `shop` | D Gates, T2 Retail Street | `post`, S4 | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/chocolate-market) |
| 18 | We are SFC | `shop` | D Gates, T2 Retail Street | `post`, S4 | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/we-are-sfc) |

Category reasoning: dining outlets and Vino Volo's small-plate service map to `food`; the two dedicated coffee outlets map to `coffee`; bookstores, merchandise shops and the chocolate retailer map to `shop`. Napa Farms Market also offers coffee and retail goods, but a single primary category avoids duplicated records. Plant Café/Pinkberry remains one combined candidate. The two Peet's records are distinct locations, not duplicate names to discard.

## Conflicts, exclusions and research limitations

1. **Peet's D14 versus D15:** The official [Terminal 2 grab-and-go article](https://www.flysfo.com/pt-pt/node/15252), checked through SFO's localized URL, names D7 and D14. The dedicated D15 listing and S1 instead identify D15. Prefer the dedicated listing for the candidate, flag the conflict, and use only coarse zone D until resolved. The same article places Plant Café/Pinkberry around D3; their combined dedicated listing says D4. Use D4 with the discrepancy preserved here. These conflicts do not change the D-zone recommendation.
2. **Books Inc. versus Compass Books:** The current dedicated listing is titled Books Inc. and identifies Terminal 2 Retail Street. S1 lists both Books Inc. and Compass Books there; the Books Inc. page retains Compass Books image/map labels, including an image caption referring to Terminal 3. Do not create an additional Terminal 2 Compass Books record without confirming whether it is a separate outlet or a renamed listing. The current directory's separate Compass Books entry is labeled Terminal 3 and is excluded.
3. **Supplementary security evidence:** The official Traveling with Kids page (S3), checked via its localized SFO URL, explicitly describes Brookstone near D1 as post-security and 16th & Dolores near D16 as post-security. It also uses the older Compass Books name. GW-003 had eight explicitly supported post-security candidates. S4 now supplies published security classification for the other ten; it does not resolve exact gate or business-name discrepancies.
4. **Sweet Maple is a reserve, not counted:** An official search result identifies Terminal 2 Retail Street and S2 identifies post-security access, but opening its dedicated page returned HTTP 403. Omitted from the 18-row shortlist rather than treating the inaccessible page as fully reviewed. [Attempted listing](https://www.flysfo.com/passengers/shop-dine-relax/sweet-maple).
5. **Restrooms and charging:** No individually identified Terminal 2 restroom or charging point with sufficient location/security evidence was established in this audit. Their absence from this shortlist does not mean the terminal lacks them. Do not invent entries or advertise category coverage based on generic map legends. Exact points need further official-source verification in a separately authorized task.
6. **Excluded scope:** C/E/F gates, interterminal connector facilities, lounges requiring eligibility, pre-security attractions and facilities without an unambiguous Terminal 2 location are not included. An airport map showing neighboring gates is not permission to expand the terminal scope.
7. **No operational validation:** No on-site check, live open/closed validation, opening-hours reconciliation, accessible-route verification, distance calculation or route timing was performed. Official pages can be stale or inconsistent. Source access on the checked date supports a published listing, not real-time service availability.
8. **Access limitations:** One attempted filtered directory URL could not be retrieved. The unfiltered official directory and dedicated facility pages were used instead. The PDF screenshot request yielded no viewable image; map-derived precise placements and security classifications remain unverified here. No third-party facility claim was used as evidence.

## CONTRACT INPUT FOR GW-001

### Recommended terminal

**SFO Terminal 2, D Gates; post-security facilities only for eligible recommendations.** The lead must approve the scope before freezing contracts. S4 resolves the ten previously unknown security classifications. Keep general unknown-security handling in the contract; a future unknown must still be withheld or explicitly ineligible.

### Verified gate/zone identifiers

- Official boarding/gate area: **D Gates**.
- Official published gate range: **D1-D18**, with no claim that every integer is active.
- Specific candidate-page landmarks: **D1, D4, D7, D9, D15, D16**.
- **Retail Street** is a published location description within the D Gates; no evidence establishes it as a separate official gate-area identifier.
- **E and F belong to Terminal 3** in the current SFO map index. They must not be included as official Terminal 2 zones.

### Candidate shared TypeScript Zone values

Propose **`Zone = 'D'`** for the coarse, source-backed boarding-area model. This is a handoff proposal, not a contract implementation. Do not silently create D-east/D-west, numbered gate clusters, map-grid zones or extra terminal coverage to reproduce the three-zone illustration. Finer within-D modeling would require lead approval, explicit definitions and a clear distinction between official landmarks and synthetic model groupings.

With one zone, the existing same-zone approximation still applies to gate-to-facility and return legs; it does not mean that all locations coincide. It cannot represent actual variation among D-gate walks. The lead should decide whether that approximation is sufficient before freezing GW-001.

### Available facility categories

The 18 candidates support **`food`, `coffee`, `shop`**. Existing `restroom` and `charging` type members may remain supported by the contract, but this audit provides no ready individual records for them. Do not add yoga, lounge or attraction categories for this task.

### Unverified or missing information

- Every travel, queue and activity duration; no time matrix values are verified.
- GW-003's ten unknown security classifications are now supported as post-security by S4. This does not establish route availability, live operations or exact positions.
- Fine-grained facility coordinates, nearest gates for Retail Street listings, gate inventory, route constraints, current hours/availability and accessible paths.
- Peet's D14/D15, Plant D3/D4 and Books Inc./Compass naming discrepancies.
- Shared utility input/output types, validation errors, defaults and security eligibility behavior remain lead-owned GW-001 work. In particular, the illustrative `UserContext` has no explicit security-side field: the lead must define how a post-security-only scope and unknown-security records are handled.
- GW-004 must wait for merged GW-001 contracts and its own authorization. This document does not invent schema fields or serialize candidate records.

### Changes needed to PLAN.md's illustrative assumptions (lead action only)

1. Replace the illustrative D/E/F terminal interpretation and example `Zone`/matrix keys with the approved Terminal 2 D-only scope, or explicitly retain the multi-zone illustration as synthetic material separate from actual SFO coverage.
2. Adapt the hero demo's D-to-E narrative to the approved scope. The arithmetic regression examples (42 required; +8 at 50; -7 at 35; +10 at 52) can remain independently calculated synthetic test cases. Their original 7-minute cross-zone legs must not be relabeled as verified Terminal 2 travel.
3. Have the lead choose and label any demonstration travel/queue/activity assumptions. Simply applying the illustrative 3-minute same-zone leg twice with queue 8, activity 10 and buffer 10 yields **34**, not 42 required minutes. Resolve the demo narrative and fixtures explicitly; do not silently preserve an incorrect total or change timing values in this research task.
4. Preserve source/estimate separation, null unknown durations, boarding-start semantics, directed legs and the existing feasibility thresholds. No calculation-policy or P0 feature expansion is requested.

## GW-003 acceptance review

- One terminal recommendation: Terminal 2 D Gates, pending lead approval.
- Official terminal/gate-area identifiers: map index and Meeting Points checked.
- Candidate count: 18 separately documented records with official facility URLs, categories, locations and shared checked date.
- Security evidence at GW-003 handoff: eight candidates supported, ten pending. The dated GW-004 preparation review below supersedes that pending count with S4 evidence.
- Times and unsupported facts: unknown; no invented facilities, timings or subzones.
- GW-001 handoff: included above; PLAN.md and shared contracts untouched.
- Research-only boundary: no GW-004 dataset or other implementation delivered.

## GW-004 readiness preparation — 2026-10-24

Authorization covers research and this document only while GW-001 is finalized. All 18 dedicated English facility pages in the table were re-read for name, terminal and location; no candidate was dropped from the evidence record. S1 and the conflicting grab-and-go article were also rechecked. S4 adds explicit official post-security directory classification for all ten candidates that GW-003 had left unknown.

### Recheck results and unresolved conflicts

| Issue | Official evidence rechecked | Readiness decision |
| --- | --- | --- |
| Peet's D14 / D15 | Dedicated D15 listing still says near D15; S1 also says D15. The grab-and-go article still labels its second Peet's link D14. Dedicated D7 listing still says D7. | D15 is the better-supported descriptive location, but the contradiction is **unresolved**. Retain both citations; reserve D15 from the first dataset. Use D7 for the coffee demo. Do not create a third Peet's record for D14. |
| Plant Café/Pinkberry D3 / D4 | Dedicated combined listing still says D4; the grab-and-go article still says D3. S4 includes the combined business under Terminal 2/Post-Security. | Security classification is now supported; nearest-gate conflict is **unresolved**. Reserve from the initial shortlist. Preserve one combined candidate, not two assumed separate stops. |
| Books Inc. / Compass Books | Dedicated English page still says Books Inc., Terminal 2 Retail Street, with Compass Books map/image labels and a Terminal 3 image caption. S1 still lists both names. The browser's localized S4 result uses Compass Books for the Terminal 2 bookstore. | Published Terminal 2/post-security location is supported, but name/identity and whether there are separate outlets remain **unresolved**. Reserve from the initial shortlist; do not add duplicate records or assert a confirmed rename. |

The review found no conflicting terminal/location description in the other 15 dedicated English listings against the prior candidate table. This describes the checked sources, not a claim of real-time operational accuracy. The localized S4 directory also uses older names for some records (for example, Andalé Mexican Restaurant and 16th & Dolores as Sunset News). Use the dedicated English listing for the canonical display name; preserve this localization caveat rather than treating translated labels as new facilities.

### Security-side findings for all ten formerly unknown candidates

S4 returned **Andalé, Cat Cora, Lark Creek Grill, The Plant Café and Pinkberry, Vino Volo, Kiehl's, SFO News Express, Sunglass Hut, The Chocolate Market, and We are SFC** with Terminal 2 and Post-Security selected on **2026-10-24**. Their table entries now cite S4 and say `post`. This is an observed official taxonomy result, not an inference from proximity to a D gate. It does not resolve Plant's location conflict or establish live opening, service availability, queue length or route availability.

The other eight retain their earlier explicit S1/S2/S3 evidence. Thus all 18 have published post-security support at the checked granularity; **three still have material location/name uncertainties** and are reserved below. No formerly unknown candidate was assumed eligible without new evidence.

### Approved planned scope for GW-004: 12 facilities

The Engineering Lead approved these 12 original candidates on **2026-10-24** as the planned scope for the initial GW-004 dataset. They provide food/coffee/shop variety, retain exact source granularity, and avoid the three documented location/name conflicts. Scope approval does not authorize JSON implementation before GW-001 contracts pass review and are integrated, or guarantee visit feasibility. **All unverified walking, queue and activity durations must remain `null` until explicitly approved demo estimates are defined.**

| Priority | Candidate | Category | Source-supported location | Selection reason / evidence |
| --- | --- | --- | --- | --- |
| Core 1 | Napa Farms Market | `food` | D Gates, Retail Street | Recognizable meal/grab-and-go option; explicit post-security evidence in S1/S2. Do not invent a nearest gate. |
| Core 2 | Peet's Coffee — D7 | `coffee` | Near D7 | Clear coffee choice; dedicated D7 listing and S1 agree; avoids the second outlet's D14/D15 dispute. |
| Core 3 | 16th & Dolores General Store | `shop` | Near D16 | Broad travel-shopping use case; dedicated English location and S2/S3 post-security evidence. Localized directory uses older Sunset News title. |
| Core 4 | Burger Joint | `food` | Near D15 | Dedicated location and S2 post-security corroboration. |
| Core 5 | Wakaba | `food` | Near D9 | Adds a different dining offering; dedicated location and S1 post-security corroboration. |
| Core 6 | Brookstone | `shop` | Near D1 | Travel-goods option; dedicated location and explicit S3 post-security corroboration. |
| Core 7 | Andalé Mexican Kitchen + Bar | `food` | Near D16 | Dedicated location unchanged; S4 now establishes post-security classification. |
| Core 8 | Lark Creek Grill | `food` | Near D1 | Table-service alternative; dedicated location unchanged; S4 post-security classification. |
| Additional 9 | Cat Cora | `food` | Near D9 | Another dining choice; dedicated location unchanged; S4 post-security classification. |
| Additional 10 | Kiehl's | `shop` | D Gates, T2 Retail Street | Retail variety; S4 post-security classification; no invented nearest gate. |
| Additional 11 | Sunglass Hut | `shop` | D Gates, Retail Street | Simple shopping record; S4 post-security classification. |
| Additional 12 | The Chocolate Market | `shop` | D Gates, T2 Retail Street | Gift-shopping option; S4 post-security classification. Primary `shop` category, not a second restaurant record. |

All 12 rows are approved for the planned dataset; the priority labels do not reduce that scope. Any later reduction requires a lead decision. The six not selected remain documented:

- **SFO News Express, We are SFC, Vino Volo:** supported Terminal 2/post-security reserves. Omitted for a compact category mix, not because they are unverified or inferior options.
- **Peet's D15, Plant Café/Pinkberry, Books Inc.:** published post-security support, but unresolved location/name conflicts. The lead explicitly excluded these from the initial MVP dataset. Keep the conflicts documented; resolving one does not automatically add the facility to the approved scope.

### Suggested demo facilities (individual alternatives)

1. **Napa Farms Market:** meal choice with multiple explicit official sources; show its actual Retail Street description and the location source separately from model assumptions.
2. **Peet's Coffee near D7:** coffee filter example with an unambiguous checked gate landmark and explicit post-security evidence.
3. **16th & Dolores General Store near D16:** shopping filter example, with a sourced D-gate landmark and explicit security evidence.

These are three alternative single-facility recommendations, **not a two-stop itinerary**. A demo can browse categories, select one, then adjust boarding-start time or an explicitly simulated queue assumption through the shared engine. This preparation does not choose any travel, queue or activity duration, predict a particular ranking/status, or promise that a visit fits. The lead must reconcile the original D-to-E hero narrative with the approved D-only scope and choose labeled simulation inputs before demonstrating numerical status changes. Unknown durations must not be zero-filled merely to make the demo work.

### Readiness blockers and lead decisions

- **GW-001 contract freeze and safe integration remain required:** final `Facility`, `Zone`, provenance fields, null handling and validation contracts must come from the lead. No schema is implemented here.
- **Preserve compound evidence:** most dedicated pages establish name/location while S1-S4 establish security. If the final schema has only one `sourceUrl`, the lead must specify how the companion security evidence and conflict notes remain traceable (this document can serve as companion provenance). Do not imply a single listing explicitly proves every field.
- The 12-entry shortlist and three-conflict exclusion policy are approved. SFO News Express, We are SFC and Vino Volo remain verified reserves. GW-001 still owns final zone/type definitions and provenance representation; no new categories or artificial subzones are proposed here.
- All durations, exact paths, current opening and accessible routes remain unverified. Post-security classification alone is insufficient to produce a known time budget.
- The lead authorized committing and pushing this document only. Full GW-004 implementation remains blocked until GW-001 passes review and is integrated and implementation is authorized. No merge is authorized. GW-006/GW-007/GW-008 and lead-owned files are untouched.

---

## APIs and automation limits (GW-A-R001)

**Research checked:** **2026-10-25 (America/New_York)**. Full audit: [`docs/GW-A-R001-sfo-source-api-audit.md`](./GW-A-R001-sfo-source-api-audit.md).

### Official web (preferred for Phase A facility facts)

- **Shop/Dine/Relax** ([directory](https://www.flysfo.com/passengers/shop-dine-relax)) and each shipped facility `sourceUrl` are the authoritative source for **static** hours text, marketing descriptions, coarse location prose, terminal labels, phone numbers, and filter badges.
- Site-wide disclaimer: hours are **subject to change without notice**; badges such as “Open Past 10PM” are **not** verified live availability signals.
- **[robots.txt](https://www.flysfo.com/robots.txt)** does not block `/passengers/shop-dine-relax`, but robots rules are **not** a content license. Automated clients may receive HTTP errors (e.g. 403) for some URLs.

### SFO Developer Portal (not authorized for static JSON ingestion without legal review)

| Product | Purpose (catalog) | Facility hours / amenities? |
| --- | --- | --- |
| Flight and Reference Data | Flights + airport/terminal/boarding area reference | **No** concession hours |
| Curb To Gate | Curb → gate time estimates | **No** |
| Gate-To-Gate Connection | Gate → gate time/distance estimates | **No** shop-level POIs; possible **Phase B** gate walks only |

- **New developer registration paused** on [developers.flysfo.com](https://developers.flysfo.com/) (2026-10-25); contact `sfo-apisupport@flysfo.com`; signed [Terms](https://developers-sandbox.flysfo.com/terms) required.
- Terms prohibit **caching/exporting/aggregating** API Content for use outside the API — conflicts with committing API-derived fields into `facilities.json` unless Airport approves otherwise in writing.

### Explicitly unavailable (do not claim in product or data)

- Live **queue or wait-time** APIs for concessions or security.
- **Real-time open/closed** per facility API (only static/marketing copy on flysfo.com).
- **Official indoor routing** or published **walking minutes** from each gate to each shipped amenity.
- **Live flight / boarding gate** integration (permanent out-of-scope for GateWise product direction).
- Reuse of **flysfo.com photos** or airport IP without prior written consent (API Terms §7.7).

### Update practice

- Refreshes are **manual**: re-open official listing pages, update `lastCheckedAt`, and document conflicts in provenance.
- **GW-A-R002** per-facility hours/amenity matrix (12/12 shipped IDs, **2026-10-25**): [`docs/GW-A-R002-facility-hours-amenity-matrix.md`](./GW-A-R002-facility-hours-amenity-matrix.md).
- **GW-A-001 (G-A0 approved):** `Facility` optional fields `hours`, `hoursConfidence`, `hoursLastCheckedAt`, `hoursSourceUrl`, `contact`, `amenityDetails` — see `src/types/airport.ts` and `validate-facilities.ts`.
- **GW-A-002 enrichment (2026-10-25):** All **12** shipped `facilities.json` records populated from [GW-A-R002](./GW-A-R002-facility-hours-amenity-matrix.md). Each row has `hours` (`weekly_same_all_days` + verbatim `rawText`), `hoursConfidence: official_verified`, `hoursLastCheckedAt` / `hoursSourceUrl`, and `amenityDetails` (tagline + official badges). **Contact omitted** only for 16th & Dolores (no phone on listing). `waitMinutes` / `activityMinutes` remain **null**; `timeConfidence: unknown`. Hours are static listing text — not live open/closed. MF/UF items (Cat Cora naming, Wakaba T3 mention, Lark Creek Priority Pass) handled per R002 §5.
