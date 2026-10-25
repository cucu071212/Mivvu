import type { KnownFacilityLocationEvidence } from "@/types/facility-location";

/** Official SFO T2 printable-map directory; map cells are not gate numbers. */
const T2_MAP_URL =
  "https://www.flysfo.com/sites/default/files/2025-11/251027_SFO_Tabloid_Face%20A_T2_Web.pdf";

/**
 * GW-B T2 D-area evidence, in legacy recommendation-manifest order.
 * Gate vicinity/Retail Street comes from individual SFO listings. The November
 * 2025 map only adds a cell when its directory name has a clear single binding.
 * A cell never supplies an entrance, corridor, route, distance, or walk time.
 */
const evidenceRows = [
      {
        facilityId: "sfo-t2-d-16th-dolores-general-store",
        locationConfidence: "verified_area",
        terminalLabel: "Terminal 2",
        gateAreaLabel: "D Gates",
        areaLabel: "Near Gate D16",
        nearGate: "D16",
        sourceUrl: "https://www.flysfo.com/passengers/shop-dine-relax/16th-dolores-general-store",
        evidenceNotes: "SFO lists D Gates near D16. The map shortens the name to 16 & Dolores, so its grid binding is omitted; entrance unknown.",
      },
      {
        facilityId: "sfo-t2-d-andale-mexican-kitchen-bar",
        locationConfidence: "verified_area",
        terminalLabel: "Terminal 2",
        gateAreaLabel: "D Gates",
        areaLabel: "Near Gate D16",
        nearGate: "D16",
        mapGridCell: "D2",
        mapSourceUrl: T2_MAP_URL,
        sourceUrl: "https://www.flysfo.com/passengers/shop-dine-relax/andale-mexican-kitchen-bar",
        evidenceNotes: "SFO lists this venue near D16; the T2 map directory lists Andalé in grid D2. Exact entrance unknown.",
      },
      {
        facilityId: "sfo-t2-d-brookstone",
        locationConfidence: "verified_area",
        terminalLabel: "Terminal 2",
        gateAreaLabel: "D Gates",
        areaLabel: "Near Gate D1",
        nearGate: "D1",
        mapGridCell: "E2",
        mapSourceUrl: T2_MAP_URL,
        sourceUrl: "https://www.flysfo.com/passengers/shop-dine-relax/brookstone-t2",
        evidenceNotes: "SFO lists Brookstone near D1; the T2 map directory lists it in grid E2. Exact entrance unknown.",
      },
      {
        facilityId: "sfo-t2-d-burger-joint",
        locationConfidence: "verified_area",
        terminalLabel: "Terminal 2",
        gateAreaLabel: "D Gates",
        areaLabel: "Near Gate D15",
        nearGate: "D15",
        mapGridCell: "D2",
        mapSourceUrl: T2_MAP_URL,
        sourceUrl: "https://www.flysfo.com/passengers/shop-dine-relax/burger-joint",
        evidenceNotes: "SFO lists Burger Joint near D15; the T2 map directory lists it in grid D2. Exact entrance unknown.",
      },
      {
        facilityId: "sfo-t2-d-cat-cora",
        locationConfidence: "verified_area",
        terminalLabel: "Terminal 2",
        gateAreaLabel: "D Gates",
        areaLabel: "Near Gate D9",
        nearGate: "D9",
        sourceUrl: "https://www.flysfo.com/passengers/shop-dine-relax/cat-cora",
        evidenceNotes: "SFO lists this venue near D9. The map uses Cat Cora’s Kitchen; the storefront-to-grid binding is omitted pending confirmation.",
      },
      {
        facilityId: "sfo-t2-d-kiehls",
        locationConfidence: "verified_area",
        terminalLabel: "Terminal 2",
        gateAreaLabel: "D Gates",
        areaLabel: "Retail Street",
        mapGridCell: "D3",
        mapSourceUrl: T2_MAP_URL,
        sourceUrl: "https://www.flysfo.com/passengers/shop-dine-relax/kiehls",
        evidenceNotes: "SFO lists Kiehl's on T2 D Gates Retail Street; the map directory lists grid D3. No gate or entrance is specified.",
      },
      {
        facilityId: "sfo-t2-d-lark-creek-grill",
        locationConfidence: "verified_area",
        terminalLabel: "Terminal 2",
        gateAreaLabel: "D Gates",
        areaLabel: "Near Gate D1",
        nearGate: "D1",
        mapGridCell: "E2",
        mapSourceUrl: T2_MAP_URL,
        sourceUrl: "https://www.flysfo.com/passengers/shop-dine-relax/lark-creek-grill",
        evidenceNotes: "SFO lists Lark Creek Grill near D1; the map directory lists grid E2. Exact entrance unknown.",
      },
      {
        facilityId: "sfo-t2-d-napa-farms-market",
        locationConfidence: "verified_area",
        terminalLabel: "Terminal 2",
        gateAreaLabel: "D Gates",
        areaLabel: "Retail Street",
        mapGridCell: "E3",
        mapSourceUrl: T2_MAP_URL,
        sourceUrl: "https://www.flysfo.com/passengers/shop-dine-relax/napa-farms-market",
        evidenceNotes: "SFO lists Napa Farms Market on D Gates Retail Street; the map directory lists grid E3. No gate or entrance is specified.",
      },
      {
        facilityId: "sfo-t2-d-peets-coffee-d7",
        locationConfidence: "verified_area",
        terminalLabel: "Terminal 2",
        gateAreaLabel: "D Gates",
        areaLabel: "Near Gate D7",
        nearGate: "D7",
        sourceUrl: "https://www.flysfo.com/passengers/shop-dine-relax/peets-coffee-0",
        evidenceNotes: "SFO lists this Peet's near D7; the map has multiple Peet's grid entries, so the binding is unresolved.",
      },
      {
        facilityId: "sfo-t2-d-sunglass-hut",
        locationConfidence: "verified_area",
        terminalLabel: "Terminal 2",
        gateAreaLabel: "D Gates",
        areaLabel: "Retail Street",
        sourceUrl: "https://www.flysfo.com/passengers/shop-dine-relax/sunglass-hut-t2",
        evidenceNotes: "SFO lists Sunglass Hut on D Gates Retail Street; the map has multiple grid entries, so the binding is unresolved.",
      },
      {
        facilityId: "sfo-t2-d-the-chocolate-market",
        locationConfidence: "verified_area",
        terminalLabel: "Terminal 2",
        gateAreaLabel: "D Gates",
        areaLabel: "Retail Street",
        sourceUrl: "https://www.flysfo.com/passengers/shop-dine-relax/chocolate-market",
        evidenceNotes: "SFO lists The Chocolate Market on T2 D Gates Retail Street; the map has multiple grid entries, so the binding is unresolved.",
      },
      {
        facilityId: "sfo-t2-d-wakaba",
        locationConfidence: "verified_area",
        terminalLabel: "Terminal 2",
        gateAreaLabel: "D Gates",
        areaLabel: "Near Gate D9",
        nearGate: "D9",
        mapGridCell: "D1",
        mapSourceUrl: T2_MAP_URL,
        sourceUrl: "https://www.flysfo.com/passengers/shop-dine-relax/wakaba",
        evidenceNotes: "SFO lists Wakaba near D9; the map directory lists grid D1. Exact entrance unknown.",
      },
    ] satisfies KnownFacilityLocationEvidence[];

export const SFO_T2_LOCATION_EVIDENCE: readonly KnownFacilityLocationEvidence[] =
  Object.freeze(evidenceRows.map((row) => Object.freeze(row)));
