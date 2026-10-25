import manifestJson from "@/data/facility-visual-manifest.json";
import type { FacilityVisualManifest } from "@/types/facility-visual";

export function loadFacilityVisualManifest(): FacilityVisualManifest {
  return manifestJson as FacilityVisualManifest;
}
