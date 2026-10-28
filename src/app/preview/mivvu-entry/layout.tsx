import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { MivvuPreviewLocaleProvider } from "@/components/mivvu/MivvuPreviewLocaleProvider";
import "@/app/mivvu-entry.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-mivvu-entry",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export default function MivvuEntryPreviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={`mivvu-entry-root ${plusJakartaSans.variable}`}>
      <MivvuPreviewLocaleProvider>{children}</MivvuPreviewLocaleProvider>
    </div>
  );
}
