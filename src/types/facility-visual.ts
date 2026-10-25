/** Optional approved imagery — separate from facility eligibility / recommend data. */
export type FacilityVisualRightsStatus = "approved";

/** Whether the file depicts the listed SFO venue vs category stock art. */
export type FacilityVisualImageRole = "venue" | "illustrative";

export type FacilityVisualManifestEntry = {
  facilityId: string;
  /** Path under /public, e.g. /facility-visual/approved/example.jpg */
  imagePath: string;
  rightsStatus: FacilityVisualRightsStatus;
  imageRole: FacilityVisualImageRole;
  /** True only when evidence confirms the SFO location for this listing. */
  depictsSfoLocation: boolean;
  sourceUrl: string;
  rightsEvidence: string;
  attribution?: string | null;
};

export type FacilityVisualManifest = {
  version: string;
  assets: FacilityVisualManifestEntry[];
};
