# GW-B — SFO Terminal 2 map-based walking research

**Research date:** 2026-10-25 (America/New_York)
**Scope:** The 12 IDs in [`legacy-d-v1`](../src/data/approved-recommend-facility-ids.ts), Terminal 2 D Gates. Research and planning only. No routing implementation, new numeric travel edges, eligibility change, or G-Data approval.

## Decision

**GO for a bounded evidence and calibration pilot; NO-GO for replacing production `D→D = 3` with numeric gate/facility legs now.** SFO's [current linked printable Terminal 2 map](https://www.flysfo.com/maps/static-maps) supplies a grid legend of **approximately one minute of walking per grid square**, gate labels, and a concession directory. The [PDF](https://www.flysfo.com/sites/default/files/2025-11/251027_SFO_Tabloid_Face%20A_T2_Web.pdf) says **“Effective 11/2025.”** Current official facility pages supply nearer gate or Retail Street descriptions. This improves *spatial differentiation* over one D-wide number, but does not supply endpoint-to-endpoint walking times or a routable corridor graph. The legend is approximate scale guidance, not a measured path-time guarantee. No source reviewed reports a verified D-gate-to-concession or concession-to-concession duration.

The pilot should resolve facility entrances and walkable connections, obtain permission to reuse/derive map geometry, collect or obtain observed walking samples under documented conditions, and validate intervals before any runtime change. Until then keep production minutes labeled `demo_estimate`, and return **Unknown** for any future unsupported graph leg. Do not infer a guarantee of reaching a flight.

## Sources and what they establish

| Source | Checked 2026-10-25 | Evidence and limit |
| --- | --- | --- |
| [SFO Static Maps](https://www.flysfo.com/maps/static-maps) → [Terminal 2 PDF](https://www.flysfo.com/sites/default/files/2025-11/251027_SFO_Tabloid_Face%20A_T2_Web.pdf) | The page's Terminal 2 link opens the same PDF as the requested `flysfo.org` URL. | One-page public guide; directory with alphanumeric grids; mapped D1–D18 gate labels (D13 is not shown); approximate **one grid square ≈ one minute walk** legend. No drawn route instructions, facility entrance coordinates, walking-time table, directional asymmetry, temporary closure layer, or uncertainty interval. Grid cells describe approximate map position, not traversable path lengths. The guide is dated 11/2025, not a live map. |
| [SFO facility listings](https://www.flysfo.com/passengers/shop-dine-relax) linked per row below | Official current page text used for T2, D landmark or Retail Street. | “Near gate” is qualitative. A listing's “View Full Map” link is not an official measured travel time. The pages do not publish a path or travel-time interval. |
| [Existing GateWise time policy](./walking-time-policy.md), [PLAN.md §3](../PLAN.md), [production travel metadata](../src/data/travel-times.ts) | Repository baseline examined at `8d7b9f1730072f609b187fd67f162a03dc23d214`. | `D→D=3` is one representative **directed leg** per movement within D, explicitly a demo estimate. It is charged separately outbound and return. Prior GW-B policy requires provenance, scope, access, and unknown handling for a future graph. |

**Evidence tiers in this report:** `official landmark` means SFO explicitly gives a gate vicinity or Retail Street; `official grid` means the PDF directory names a cell; `inferred binding` means we associated a listing to one of multiple directory cells by its D Gates context. None is an exact position or verified walk time. For location confidence below, **high** = listing and a unique map grid align at coarse granularity, **medium** = a unique grid but only broad Retail Street or a name variant, **low** = multiple grid entries or unresolved identity. These are research confidence levels; they do not replace existing application `locationConfidence` fields.

## Twelve recommendation-eligible D Gates facilities

All twelve are currently recorded as post-security in the approved legacy recommendation set. Every official listing below says **Terminal 2**. Approximate position is limited to the stated gate vicinity or map grid; no point coordinates are asserted. All rows lack a verified entrance, walkable corridor path, or official per-leg walking time. Grid entries are from the [11/2025 SFO PDF](https://www.flysfo.com/sites/default/files/2025-11/251027_SFO_Tabloid_Face%20A_T2_Web.pdf); linked facility pages are separate official evidence.

| GateWise ID / facility | Official T2 D-area listing | PDF directory reference | Location confidence and approximate position | Additional gap or conflict |
| --- | --- | --- | --- | --- |
| `sfo-t2-d-16th-dolores-general-store` — [16th & Dolores General Store](https://www.flysfo.com/passengers/shop-dine-relax/16th-dolores-general-store) | D Gates, near **D16** | “16 & Dolores” **D2** | **Medium:** D16 vicinity and D2 cell; shortened map name appears to refer to same store. | Confirm name binding and entrance inside D2. |
| `sfo-t2-d-andale-mexican-kitchen-bar` — [Andalé Mexican Kitchen + Bar](https://www.flysfo.com/passengers/shop-dine-relax/andale-mexican-kitchen-bar) | Near **D16** | “Andalé” **D2** | **High:** D16 vicinity, D2 cell. | Exact entrance within cell unknown. |
| `sfo-t2-d-brookstone` — [Brookstone](https://www.flysfo.com/passengers/shop-dine-relax/brookstone-t2) | Near **D1** | “Brookstone” **E2** | **High:** D1 vicinity, E2 cell. | Exact entrance within cell unknown. |
| `sfo-t2-d-burger-joint` — [Burger Joint](https://www.flysfo.com/passengers/shop-dine-relax/burger-joint) | Near **D15** | “Burger Joint” **D2** | **High:** D15 vicinity, D2 cell. | Exact entrance within cell unknown. |
| `sfo-t2-d-cat-cora` — [Cat Cora](https://www.flysfo.com/passengers/shop-dine-relax/cat-cora) | Near **D9** | “Cat Cora’s Kitchen” **D1** | **Medium:** D9 vicinity and D1 cell; the listing itself also uses “Cat Cora’s Kitchen” in its About section. | Confirm whether map entry and current storefront entrance coincide. |
| `sfo-t2-d-kiehls` — [Kiehl's](https://www.flysfo.com/passengers/shop-dine-relax/kiehls) | D Gates, **T2 Retail Street** | “Kiehl’s” **D3** | **Medium:** D3 cell; no gate landmark in listing. | Entrances and Retail Street path alignment unknown. |
| `sfo-t2-d-lark-creek-grill` — [Lark Creek Grill](https://www.flysfo.com/passengers/shop-dine-relax/lark-creek-grill) | Near **D1** | “Lark Creek Grill” **E2** | **High:** D1 vicinity, E2 cell. | Exact entrance within cell unknown. |
| `sfo-t2-d-napa-farms-market` — [Napa Farms Market](https://www.flysfo.com/passengers/shop-dine-relax/napa-farms-market) | D Gates, **Retail Street** | “Napa Farms Market” **E3** | **Medium:** E3 cell; no gate landmark in listing. | Entrance and path along Retail Street unknown. |
| `sfo-t2-d-peets-coffee-d7` — [Peet's Coffee](https://www.flysfo.com/passengers/shop-dine-relax/peets-coffee-0) | Near **D7** | “Peet’s Coffee” **D1, E1** | **Low for grid binding:** D7 vicinity is official, but the directory has two Peet’s entries and does not identify which is this ID. | Resolve D7 storefront against both cells and other Peet’s listing; do not select D1 or E1 by guess. |
| `sfo-t2-d-sunglass-hut` — [Sunglass Hut](https://www.flysfo.com/passengers/shop-dine-relax/sunglass-hut-t2) | D Gates, **Retail Street** | “Sunglass Hut” **B5, E3** | **Low for grid binding:** E3 is a *candidate* D-area cell; PDF does not explicitly bind the two entries to named storefronts. | Resolve which cell corresponds to this T2 D listing; no exact entrance. |
| `sfo-t2-d-the-chocolate-market` — [The Chocolate Market](https://www.flysfo.com/passengers/shop-dine-relax/chocolate-market) | D Gates, **T2 Retail Street** | “The Chocolate Market” **A4, E3** | **Low for grid binding:** E3 is a *candidate* D-area cell, not a verified match to this storefront. | Resolve multi-location directory entry and exact entrance. |
| `sfo-t2-d-wakaba` — [Wakaba](https://www.flysfo.com/passengers/shop-dine-relax/wakaba) | Near **D9** | “Wakaba” **D1** | **High:** D9 vicinity, D1 cell. | Exact entrance within cell unknown. |

The grid codes **D1, D2, E2, E3** above are alphanumeric *map cells*. They are not gate IDs D1/D2/E2/E3. The PDF uses both kinds of labels, so storing them in one field would create a data error. The two-location retail entries and Peet’s are intentionally unresolved. The map's placement of gates and directory cells supports coarse *relative* geography; it does not establish a safe route through each cell.

## Feasibility of travel legs

| Leg | Verified official walking time? | Map-derived approximation possible? | Current blocker for production numeric use |
| --- | --- | --- | --- |
| **Gate → Facility** | **No.** The grid legend is approximate scale, not a specific origin/destination time. | **Possibly for an offline pilot:** identify exact gate and storefront access points, trace the passenger path across cells, then calibrate with observations. | Facility entrance and corridor topology are absent; many facilities have only a grid cell or “near” gate. A straight-line or cell-center calculation would misstate a path. |
| **Facility A → Facility B** | **No.** | **Possibly, but weakest:** two entrances and all connecting waypoints must be resolved. | Shared grid cell does not mean zero travel. Distinct storefronts need a positive, evidence-backed movement cost; multi-location names make some endpoints ambiguous. |
| **Facility → Gate** | **No.** | **Possibly** using the same validated geometry, checked as a *directed* leg. | Do not copy the outbound value automatically; route restrictions, entrances, escalators, congestion, or temporary conditions can differ. |

**Graph feasibility:** The PDF provides a background and scale cue but no machine-readable walkable centerlines, turn restrictions, accessible paths, or exact storefront entrances. A responsibly constructed *research* graph would use documented corridor/waypoint geometry and explicit facility/gate bindings reviewed against a current authoritative floor plan and field checks. Its edges would carry direction, level, access/security status, source, effective dates, interval, and method. Do not use raster shortest-line distance, Manhattan grid distance, or grid-cell equality as a production route. One grid crossing is **not** proof of one minute for every user or path. A release would also need route and time calibration and an approved reuse basis for derived map geometry.

## Proposed versioned walking-time dataset (future design, not implemented)

Store a dataset release independent from `facilities.json` and the legacy matrix. Suggested record shape illustrates required semantics, with null values showing a currently unsupported edge:

```ts
type WalkingDataset = {
  datasetId: string;             // e.g. "sfo-t2-d-walk-v1" after approval
  schemaVersion: 1;
  airport: "SFO";
  scope: "T2-D-post-security";
  publishedAt: string;           // release timestamp, not map effective date
  sources: Array<{
    id: string; url: string; title: string;
    publisher: "SFO" | "GateWise";
    sourceEffectiveFrom: string | null;
    checkedAt: string;
    reuseStatus: "approved" | "pending" | "restricted";
  }>;
  locations: Array<{
    id: string; kind: "gate" | "facility" | "waypoint";
    facilityId?: string; gate?: string;
    officialGridCell?: string | null;
    gateLandmark?: string | null;
    exactEntranceRef?: string | null;
    locationConfidence: "verified_entrance" | "official_landmark" | "official_grid" | "unresolved";
    sourceIds: string[];
  }>;
  directedLegs: Array<{
    fromId: string; toId: string;
    status: "estimated" | "unknown";
    estimateSeconds: number | null;
    intervalSeconds: { low: number; high: number } | null;
    method: "observed_sample" | "calibrated_waypoint_graph" | "unknown";
    timeConfidence: "calibrated_estimate" | "map_approximation" | "unknown";
    pathRef: string | null;      // reviewed graph path, never inferred from matching cells
    sourceIds: string[];
    asOf: string;
    recheckBy: string | null;
    limitations: string[];
  }>;
};
```

Rules for this design: `unknown` requires null estimate/interval and must propagate to an Unknown itinerary, never zero; a same-identity stay can be zero by itinerary semantics, not by a travel edge. Intervals must be nonnegative, ordered, and wide enough to reflect map and observed variation. Numeric legs must have resolvable, distinct endpoint identities, a reviewed traversable path, compatible access/security/level scope, effective provenance and approved reuse. Store both directions explicitly even when observed values happen to match. Record data collection method, sample conditions, speed assumption if used, rounding, reviewer, and raw evidence outside the runtime record. Check source freshness and route restrictions before applying a leg. Version a changed map, facility binding, path, interval, or method; preserve old versions for audit and rollback.

Validation before any proposed numeric release: independently match all 12 storefronts to entrances; resolve the three multi-entry bindings; inspect the relevant floor plan/route in both directions; verify post-security and accessibility conditions; obtain or collect representative timed walks across short and long D-area pairs, including repeat runs and slower walking; quantify interval coverage/error against held-out observations; check operational changes; review source reuse; and run independent route/unknown/identity tests. Missing evidence for one leg must not be silently filled from a nearby leg or from `D→D=3`.

## Comparison with the current demo model

The current [`D→D` edge](../src/data/travel-times.ts) applies **3 minutes per directed leg** for any distinct origin/destination in D; a single-stop gate-to-facility-to-gate visit therefore charges 3 + 3 = 6 movement minutes before queue, activity, and buffer. This cannot reflect that a shop near D16 and one near D1 may be at different positions relative to a selected gate. For two distinct facilities, the same-zone matrix also loses the A→B geometry. It has no per-gate or per-storefront endpoint and is explicitly **illustrative**, so treating 3 as a measured SFO time would overstate confidence. The official grid and landmarks can meaningfully improve *which places appear closer* and identify cases where one fixed cost is implausible, but the current evidence does not justify replacement per-leg minute values. Keep the existing demo label until a separately authorized, validated dataset passes G-Data.

## Recommended next actions for the human Engineering Lead

1. Approve or reject a **documentation/evidence pilot** scoped to T2 D only; keep G-Data HOLD and GW-E1B integration separate.
2. Ask SFO for a current floor plan or route data, map-derivation/reuse permission, exact concession entrance locations, and any official walking-time methodology. Resolve Peet’s, Sunglass Hut, and The Chocolate Market map bindings explicitly.
3. If access is granted, define a small waypoint graph and timing protocol; compare estimated intervals against independent walks. Bring the dataset, confidence policy, validation results, and exact affected file ownership back for a separate implementation authorization.

**No production numeric replacement or graph routing is recommended from this map alone.**
