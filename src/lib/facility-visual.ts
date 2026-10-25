import type { Facility, FacilityCategory } from "@/types/airport";
import type { FacilityVisualManifestEntry } from "@/types/facility-visual";
import { loadFacilityVisualManifest } from "@/lib/facility-visual-manifest";

export type FacilityVisualPresentation = {
  kind: "approved_photo" | "category_fallback";
  src: string;
  alt: string;
  attribution: string | null;
  width: number;
  height: number;
};

const ASPECT = { width: 640, height: 360 };

function categoryFallbackPath(category: FacilityCategory): string {
  switch (category) {
    case "coffee":
      return "/facility-visual/fallback-coffee.svg";
    case "shop":
      return "/facility-visual/fallback-shop.svg";
    case "food":
    default:
      return "/facility-visual/fallback-food.svg";
  }
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

function findApprovedAsset(
  facilityId: string,
): FacilityVisualManifestEntry | undefined {
  const manifest = loadFacilityVisualManifest();
  return manifest.assets.find(
    (row) => row.facilityId === facilityId && row.rightsStatus === "approved",
  );
}

export function resolveFacilityVisual(facility: Facility): FacilityVisualPresentation {
  const approved = findApprovedAsset(facility.id);
  if (approved?.imagePath.startsWith("/")) {
    const alt = `${facility.name} at SFO — approved listing imagery`;
    return {
      kind: "approved_photo",
      src: approved.imagePath,
      alt,
      attribution: approved.attribution ?? null,
      width: ASPECT.width,
      height: ASPECT.height,
    };
  }

  const label = categoryLabel(facility.category);
  return {
    kind: "category_fallback",
    src: categoryFallbackPath(facility.category),
    alt: `${facility.name} — ${label} category illustration (not a photograph of this location).`,
    attribution: null,
    width: ASPECT.width,
    height: ASPECT.height,
  };
}
