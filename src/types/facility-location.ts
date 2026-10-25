/** Coarse SFO facility-area evidence. This contract carries no route geometry or travel time. */
export type FacilityLocationConfidence =
  | "verified_area"
  | "approximate_area"
  | "unknown";

export type KnownFacilityLocationEvidence = Readonly<{
  facilityId: string;
  locationConfidence: "verified_area" | "approximate_area";
  terminalLabel: string;
  gateAreaLabel: string;
  /** Human-facing vicinity; never an entrance or point coordinate. */
  areaLabel: string;
  /** Official listing URL supporting the area label. */
  sourceUrl: string;
  /** Optional official gate-vicinity relationship, not a walking instruction. */
  nearGate?: string;
  /** PDF directory cell, explicitly distinct from a gate ID. Omitted if binding is unclear. */
  mapGridCell?: string;
  mapSourceUrl?: string;
  evidenceNotes: string;
}>;

export type UnknownFacilityLocationEvidence = Readonly<{
  facilityId: string;
  locationConfidence: "unknown";
  terminalLabel: null;
  gateAreaLabel: null;
  areaLabel: null;
  sourceUrl: null;
  evidenceNotes: string;
}>;

export type FacilityLocationEvidence =
  | KnownFacilityLocationEvidence
  | UnknownFacilityLocationEvidence;
