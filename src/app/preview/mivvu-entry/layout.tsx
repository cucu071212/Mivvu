import { MivvuEntryLayoutShell } from "@/components/mivvu/MivvuEntryLayoutShell";
import type { ReactNode } from "react";

export default function MivvuEntryPreviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <MivvuEntryLayoutShell>{children}</MivvuEntryLayoutShell>;
}
