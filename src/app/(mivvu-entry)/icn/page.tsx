import type { Metadata } from "next";
import { MivvuIcnBrowsePage } from "@/components/mivvu/MivvuIcnBrowsePage";

export const metadata: Metadata = {
  title: "Mivvu · Incheon facilities",
  description:
    "Browse Incheon International Airport facilities from saved KO/EN snapshot listings.",
};

export default function MivvuIcnBrowseRoutePage() {
  return <MivvuIcnBrowsePage />;
}
