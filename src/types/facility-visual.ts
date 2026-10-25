/** Optional approved imagery — separate from facility eligibility / recommend data. */
export type FacilityVisualRightsStatus = "approved";

export type FacilityVisualManifestEntry = {
  facilityId: string;
  /** Path under /public, e.g. /facility-visual/approved/example.webp */
  imagePath: string;
  rightsStatus: FacilityVisualRightsStatus;
  sourceUrl: string;
  rightsEvidence: string;
  attribution?: string | null;
};

export type FacilityVisualManifest = {
  version: string;
  assets: FacilityVisualManifestEntry[];
};
