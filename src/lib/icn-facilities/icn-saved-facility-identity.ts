import type { IcnFacilityRef } from "./icn-facility-reference";
import { parseIcnFacilityRef } from "./icn-facility-reference";

/** GW-ICN-012 v1 envelope parsed from a persisted serialized ref, or null if invalid. */
export function parseIcnSavedFacilityRefEnvelope(serializedRef: string): IcnFacilityRef | null {
  const parsed = parseIcnFacilityRef(serializedRef);
  if (parsed.status !== "valid") return null;
  return parsed.ref;
}

/**
 * GW-ICN-016 saved-list bilingual dedup (adapter only — does not change GW-ICN-012 identity).
 * Same entry when origins match or a stored captured counterpart fingerprint matches the other origin.
 * Never merges on sourceId, display name, listing index, or prefix/substring of fingerprints alone.
 */
export function icnSavedFacilityRefsRepresentSameEntry(a: IcnFacilityRef, b: IcnFacilityRef): boolean {
  if (a.contentFingerprint === b.contentFingerprint) return true;
  if (a.pairedContentFingerprint && a.pairedContentFingerprint === b.contentFingerprint) return true;
  if (b.pairedContentFingerprint && b.pairedContentFingerprint === a.contentFingerprint) return true;
  return false;
}

/** Identity match for a persisted row against a candidate serialized ref (invalid candidate → false). */
export function icnSavedFacilitySerializedRefsRepresentSameEntry(
  storedSerializedRef: string,
  candidateSerializedRef: string,
): boolean {
  const stored = parseIcnSavedFacilityRefEnvelope(storedSerializedRef);
  const candidate = parseIcnSavedFacilityRefEnvelope(candidateSerializedRef);
  if (!stored || !candidate) return false;
  return icnSavedFacilityRefsRepresentSameEntry(stored, candidate);
}
