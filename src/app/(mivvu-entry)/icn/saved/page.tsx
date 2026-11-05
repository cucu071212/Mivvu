import type { Metadata } from "next";
import { MivvuIcnSavedFacilitiesPage } from "@/components/mivvu/MivvuIcnSavedFacilitiesPage";

export const metadata: Metadata = {
  title: "Saved facilities — Incheon (ICN) | Mivvu",
  description: "Locally saved ICN facility listings on this device.",
};

export default function IcnSavedFacilitiesRoutePage() {
  return <MivvuIcnSavedFacilitiesPage />;
}
