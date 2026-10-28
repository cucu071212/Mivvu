import path from "node:path";
import type { IcnFacilitiesLanguage } from "@/types/icn-facility-browse";

export function icnFixtureOutputPath(lang: IcnFacilitiesLanguage): string {
  const file = lang === "E" ? "icn-facilities-en.json" : "icn-facilities-ko.json";
  return path.join(process.cwd(), "src/data/fixtures", file);
}
