# GW-B location data handoff — SFO Terminal 2 D Gates

**Scope:** 12 IDs in `legacy-d-v1` only. This package supplies coarse location evidence for a UI. It does not change eligibility, the recommendation engine, travel times, or the G-Data HOLD.

## API

Import from `@/lib/facility-location`:

```ts
getFacilityLocationEvidence(facilityId: string): FacilityLocationEvidence
listFacilityLocationEvidence(): readonly KnownFacilityLocationEvidence[]
```

Types are in `@/types/facility-location`. `FacilityLocationEvidence.locationConfidence` is `verified_area | approximate_area | unknown`. Known records include `facilityId`, `terminalLabel`, `gateAreaLabel`, `areaLabel`, `sourceUrl`, and `evidenceNotes`. Optional `nearGate` means only that SFO says the venue is near that gate. Optional `mapGridCell` has a corresponding `mapSourceUrl`; it is a printable-map directory cell, **not a gate number**. Neither field encodes a route, distance, or travel duration. The list is immutable and ordered to match the approved legacy recommendation manifest.

For an ID outside this evidence package, `getFacilityLocationEvidence` returns `locationConfidence: "unknown"`, null labels and source, and an explanatory note. The list contains only the 12 sourced records. Consumers should use the `unknown` discriminant to avoid displaying a guessed area.

## Data confidence

| Coverage | Count | Meaning |
| --- | ---: | --- |
| `verified_area` | 12 | Each SFO venue page states T2 D Gates plus a gate vicinity or Retail Street. This verifies a **broad area**, not an entrance. |
| `approximate_area` | 0 | Supported by the type for future qualified evidence; no current record needs an inferred area. |
| `unknown` | Any other ID | No evidence record in this package; returned on lookup, never filled from a name or zone. |
| Unique map directory cell included | 7 | Andalé D2, Brookstone E2, Burger Joint D2, Kiehl's D3, Lark Creek Grill E2, Napa Farms Market E3, Wakaba D1. Cells are text directory references only. |
| Map cell deliberately omitted | 5 | 16th & Dolores and Cat Cora use differing listing/map names; Peet's, Sunglass Hut, and The Chocolate Market have multiple map entries. Gate vicinity or Retail Street labels remain sourced from their venue pages. |

The `nearGate` relation is present only for the eight SFO listings that name a gate. Retail Street records do not receive a guessed nearest gate. No facility-to-facility ordering, coordinates, storefront entrances, walking routes, times, or distances are provided.

## Provenance and UI use

- Per-record `sourceUrl` links to the [official SFO venue listing](https://www.flysfo.com/passengers/shop-dine-relax). Location claims were cross-checked against `src/data/facilities.json` and the [GW-B SFO map research](https://github.com/cucu071212/GateWise/blob/b192a6d85cf241c6377e35136fe5bfc7a4394f98/docs/GW-B-SFO-map-walking-research.md) at `b192a6d85cf241c6377e35136fe5bfc7a4394f98` (checked 2026-10-25).
- A record with `mapGridCell` links to the [official SFO Terminal 2 printable map](https://www.flysfo.com/sites/default/files/2025-11/251027_SFO_Tabloid_Face%20A_T2_Web.pdf), effective 11/2025. Its grid legend gives approximate scale guidance, not per-leg times. No map artwork is reproduced here.
- The UI can show “Terminal 2 · D Gates · Near Gate D16” or “Terminal 2 · D Gates · Retail Street” with an official source link. If showing a grid cell, label it explicitly as a **map grid cell**. Do not turn a `nearGate` or shared `mapGridCell` into a walking direction or proximity ranking.
- Existing `Facility.locationConfidence` in `@/types/airport` uses a different vocabulary. This new field describes evidence granularity for the location package and does not alter that contract.

**Integration owner:** Engineering Lead Cursor. The package is ready for UI consumption after lead review; G-Data remains HOLD.
