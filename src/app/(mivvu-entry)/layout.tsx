import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MivvuEntryLayoutShell } from "@/components/mivvu/MivvuEntryLayoutShell";

export const metadata: Metadata = {
  title: "Mivvu",
  description:
    "Discover airport lounges, dining, and amenities. ICN directory from saved snapshots; SFO uses the same browse shell with facility information unavailable.",
};

export default function MivvuEntryLayout({ children }: { children: ReactNode }) {
  return <MivvuEntryLayoutShell>{children}</MivvuEntryLayoutShell>;
}
