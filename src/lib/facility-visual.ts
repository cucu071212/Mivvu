import type { Facility, FacilityCategory } from "@/types/airport";
import type { FacilityVisualManifestEntry } from "@/types/facility-visual";
import { loadFacilityVisualManifest } from "@/lib/facility-visual-manifest";

export type FacilityVisualPresentation = {
  kind: "venue_photo" | "illustrative_photo";
  src: string;
  alt: string;
  attribution: string | null;
  caption: string | null;
  width: number;
  height: number;
};

const ASPECT = { width: 640, height: 360 };

function findApprovedAsset(
  facilityId: string,
): FacilityVisualManifestEntry | undefined {
  const manifest = loadFacilityVisualManifest();
  return manifest.assets.find(
    (row) => row.facilityId === facilityId && row.rightsStatus === "approved",
  );
}

function buildAlt(
  facility: Facility,
  approved: FacilityVisualManifestEntry,
): string {
  if (approved.imageRole === "venue" && approved.depictsSfoLocation) {
    return `${facility.name} at San Francisco International Airport — verified venue photograph`;
  }
  const label = categoryLabel(facility.category);
  return `${facility.name} — illustrative ${label.toLowerCase()} photography (not this SFO location)`;
}

function categoryLabel(category: FacilityCategory): string {
  switch (category) {
    case "coffee":
      return "Coffee";
    case "shop":
      return "Shop";
    case "food":
      return "Food";
    default:
      return "Amenity";
  }
}

function buildCaption(approved: FacilityVisualManifestEntry): string | null {
  if (approved.imageRole === "venue" && approved.depictsSfoLocation) {
    return "Venue photograph at SFO (documented reuse rights).";
  }
  if (approved.imageRole === "illustrative") {
    return "Illustrative photo — does not depict this SFO location.";
  }
  return null;
}

/** Returns null when no manifest asset exists (no SVG hero fallback). */
export function resolveFacilityVisual(
  facility: Facility,
): FacilityVisualPresentation | null {
  const approved = findApprovedAsset(facility.id);
  if (!approved?.imagePath.startsWith("/")) {
    return null;
  }

  const kind =
    approved.imageRole === "venue" && approved.depictsSfoLocation
      ? "venue_photo"
      : "illustrative_photo";

  return {
    kind,
    src: approved.imagePath,
    alt: buildAlt(facility, approved),
    attribution: approved.attribution ?? null,
    caption: buildCaption(approved),
    width: ASPECT.width,
    height: ASPECT.height,
  };
}
