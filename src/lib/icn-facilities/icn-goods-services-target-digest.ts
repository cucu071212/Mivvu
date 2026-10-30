import { createHash } from "node:crypto";
import type { IcnFacilitiesFixture } from "@/types/icn-facility-browse";
import { icnFacilityContentFingerprint } from "./icn-snapshot-matching";

/** companion schema 1: bound core fixture digest (UTF-8 JSON.stringify fixed-order object) */
export function computeIcnGoodsServicesTargetCoreDigest(fixture: IcnFacilitiesFixture): string {
  const fingerprints = fixture.facilities
    .map((record) => icnFacilityContentFingerprint(record))
    .sort();
  const payload = {
    airportIata: fixture.meta.airportIata,
    language: fixture.meta.language,
    source: fixture.meta.source,
    retrievedAt: fixture.meta.retrievedAt,
    recordCount: fixture.meta.recordCount,
    apiReportedTotalCount: fixture.meta.apiReportedTotalCount,
    syncIntegrity: fixture.meta.syncIntegrity,
    fingerprints,
  };
  return createHash("sha256").update(JSON.stringify(payload), "utf8").digest("hex");
}

export function companionTargetDigestsMatch(
  companion: { targetCoreDigests: { K: string; E: string } },
  koFixture: IcnFacilitiesFixture,
  enFixture: IcnFacilitiesFixture,
): boolean {
  return (
    companion.targetCoreDigests.K === computeIcnGoodsServicesTargetCoreDigest(koFixture)
    && companion.targetCoreDigests.E === computeIcnGoodsServicesTargetCoreDigest(enFixture)
  );
}
