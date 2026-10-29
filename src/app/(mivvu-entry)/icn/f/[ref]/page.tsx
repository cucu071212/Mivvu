import type { Metadata } from "next";
import { MivvuIcnFacilityDetailPage } from "@/components/mivvu/MivvuIcnFacilityDetailPage";

export const metadata: Metadata = {
  title: "Mivvu · Incheon facility",
  description: "ICN facility listing detail from saved KO/EN snapshot data.",
};

type PageProps = {
  params: Promise<{ ref: string }>;
};

export default async function MivvuIcnFacilityDetailRoutePage({ params }: PageProps) {
  const { ref } = await params;
  return <MivvuIcnFacilityDetailPage refPathSegment={ref} />;
}
