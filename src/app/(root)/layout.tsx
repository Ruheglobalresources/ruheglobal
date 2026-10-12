import Footer from "@/components/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PortalBottomBarGate } from "@/components/portal-bottom-bar-gate";
import WhatsAppFloatingButton from "@/components/WatsappCTA";
import type { ReactNode } from "react";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // pb: room for the portal bottom bar on phones when it is showing (0 otherwise), see portal-bottom-bar-gate.tsx
  return (
    <div className="relative flex min-h-screen flex-1 flex-col bg-ink pb-[var(--portal-bar-offset,0px)] text-cloud lg:pb-0">
      <Navbar />

      {/* Reserve space for the fixed navbar */}
      <main className="pt-18 lg:pt-22">
        {children}
      </main>

      <WhatsAppFloatingButton />
      <Footer />

      {/* Phones: the portal bottom bar on /courses and /institutions for people who came from the portal */}
      <PortalBottomBarGate />
    </div>
  );
}