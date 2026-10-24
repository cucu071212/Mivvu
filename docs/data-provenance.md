# GW-003: SFO scope and data provenance

Research checked: **2026-10-24 (America/New_York)**. Owner: Teammate Codex.
Scope: research and GW-001 handoff only. No facility JSON, contracts, time matrix, or application code is implemented here. Recommendations below require the Engineering Lead's approval.

## Recommended single-terminal scope

Recommend **SFO Terminal 2, D Gates**, initially limited to facilities with confirmed post-security access. Eighteen candidate records are documented below across the existing `food`, `coffee`, and `shop` categories. Eight have explicit post-security corroboration in the sources reviewed; the remaining ten need security-side confirmation before inclusion in an eligible post-security dataset. A candidate is not automatically a validated dataset entry.

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

| # | Facility name | Proposed category | Official location description | Security side / evidence | Official facility URL actually checked |
| --- | --- | --- | --- | --- | --- |
| 1 | Andalé Mexican Kitchen + Bar | `food` | Near Gate D16 | `unknown`; not explicit in reviewed listing | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/andale-mexican-kitchen-bar) |
| 2 | Burger Joint | `food` | Near Gate D15 | `post`, S2 | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/burger-joint) |
| 3 | Cat Cora | `food` | Near Gate D9 | `unknown`; not explicit in reviewed listing | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/cat-cora) |
| 4 | Lark Creek Grill | `food` | Near Gate D1 | `unknown`; not explicit in reviewed listing | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/lark-creek-grill) |
| 5 | Napa Farms Market | `food` | D Gates, Retail Street | `post`, S1 and S2 | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/napa-farms-market) |
| 6 | The Plant Café and Pinkberry | `food` | Near Gate D4 | `unknown`; not explicit in reviewed listing | [Combined listing](https://www.flysfo.com/passengers/shop-dine-relax/plant-cafe-and-pinkberry) |
| 7 | Vino Volo | `food` | D Gates, Retail Street | `unknown`; not explicit in reviewed listing | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/vino-volo) |
| 8 | Wakaba | `food` | Near Gate D9 | `post`, S1 | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/wakaba) |
| 9 | Peet's Coffee (D7 location) | `coffee` | Near Gate D7 | `post`, S1 | [D7 listing](https://www.flysfo.com/passengers/shop-dine-relax/peets-coffee-0) |
| 10 | Peet's Coffee (D15 location) | `coffee` | D Gates, near Gate D15 | `post`, S1; D14 conflict noted below | [D15 listing](https://www.flysfo.com/passengers/shop-dine-relax/peets-coffee) |
| 11 | 16th & Dolores General Store | `shop` | D Gates, near Gate D16 | `post`, S2 | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/16th-dolores-general-store) |
| 12 | Books Inc. | `shop` | D Gates, Retail Street | `post`, S1; naming ambiguity noted below | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/books-inc) |
| 13 | Brookstone | `shop` | Near Gate D1 | `post`, S3 | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/brookstone-t2) |
| 14 | Kiehl's | `shop` | D Gates, T2 Retail Street | `unknown`; not explicit in reviewed listing | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/kiehls) |
| 15 | SFO News Express | `shop` | Near Gate D4 | `unknown`; not explicit in reviewed listing | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/sfo-news-express) |
| 16 | Sunglass Hut | `shop` | D Gates, Retail Street | `unknown`; not explicit in reviewed listing | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/sunglass-hut-t2) |
| 17 | The Chocolate Market | `shop` | D Gates, T2 Retail Street | `unknown`; not explicit in reviewed listing | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/chocolate-market) |
| 18 | We are SFC | `shop` | D Gates, T2 Retail Street | `unknown`; not explicit in reviewed listing | [Listing](https://www.flysfo.com/passengers/shop-dine-relax/we-are-sfc) |

Category reasoning: dining outlets and Vino Volo's small-plate service map to `food`; the two dedicated coffee outlets map to `coffee`; bookstores, merchandise shops and the chocolate retailer map to `shop`. Napa Farms Market also offers coffee and retail goods, but a single primary category avoids duplicated records. Plant Café/Pinkberry remains one combined candidate. The two Peet's records are distinct locations, not duplicate names to discard.

## Conflicts, exclusions and research limitations

1. **Peet's D14 versus D15:** The official [Terminal 2 grab-and-go article](https://www.flysfo.com/pt-pt/node/15252), checked through SFO's localized URL, names D7 and D14. The dedicated D15 listing and S1 instead identify D15. Prefer the dedicated listing for the candidate, flag the conflict, and use only coarse zone D until resolved. The same article places Plant Café/Pinkberry around D3; their combined dedicated listing says D4. Use D4 with the discrepancy preserved here. These conflicts do not change the D-zone recommendation.
2. **Books Inc. versus Compass Books:** The current dedicated listing is titled Books Inc. and identifies Terminal 2 Retail Street. S1 lists both Books Inc. and Compass Books there; the Books Inc. page retains Compass Books image/map labels, including an image caption referring to Terminal 3. Do not create an additional Terminal 2 Compass Books record without confirming whether it is a separate outlet or a renamed listing. The current directory's separate Compass Books entry is labeled Terminal 3 and is excluded.
3. **Supplementary security evidence:** The official Traveling with Kids page (S3), checked via its localized SFO URL, explicitly describes Brookstone near D1 as post-security and 16th & Dolores near D16 as post-security. It also uses the older Compass Books name. The table incorporates its Brookstone evidence, giving **eight** explicitly supported post-security candidates. Other rows remain unknown where explicit evidence is missing.
4. **Sweet Maple is a reserve, not counted:** An official search result identifies Terminal 2 Retail Street and S2 identifies post-security access, but opening its dedicated page returned HTTP 403. Omitted from the 18-row shortlist rather than treating the inaccessible page as fully reviewed. [Attempted listing](https://www.flysfo.com/passengers/shop-dine-relax/sweet-maple).
5. **Restrooms and charging:** No individually identified Terminal 2 restroom or charging point with sufficient location/security evidence was established in this audit. Their absence from this shortlist does not mean the terminal lacks them. Do not invent entries or advertise category coverage based on generic map legends. Exact points need further official-source verification in a separately authorized task.
6. **Excluded scope:** C/E/F gates, interterminal connector facilities, lounges requiring eligibility, pre-security attractions and facilities without an unambiguous Terminal 2 location are not included. An airport map showing neighboring gates is not permission to expand the terminal scope.
7. **No operational validation:** No on-site check, live open/closed validation, opening-hours reconciliation, accessible-route verification, distance calculation or route timing was performed. Official pages can be stale or inconsistent. Source access on the checked date supports a published listing, not real-time service availability.
8. **Access limitations:** One attempted filtered directory URL could not be retrieved. The unfiltered official directory and dedicated facility pages were used instead. The PDF screenshot request yielded no viewable image; map-derived precise placements and security classifications remain unverified here. No third-party facility claim was used as evidence.

## CONTRACT INPUT FOR GW-001

### Recommended terminal

**SFO Terminal 2, D Gates; post-security subset only for eligible recommendations.** The lead must approve the scope before freezing contracts. Retain unknown-security candidates for research or withhold them from usable data until independently corroborated.

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
- Ten candidates' explicit security sides after incorporating Brookstone's supplementary evidence; these must remain unknown pending verification.
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
- Security evidence: explicit sources distinguished from unknown; eight candidates supported after supplementary Brookstone evidence, ten pending.
- Times and unsupported facts: unknown; no invented facilities, timings or subzones.
- GW-001 handoff: included above; PLAN.md and shared contracts untouched.
- Research-only boundary: no GW-004 dataset or other implementation delivered.
