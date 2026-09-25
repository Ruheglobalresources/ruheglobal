import Footer from "@/components/Footer";
import { Navbar } from "@/components/layout/Navbar";
import WhatsAppFloatingButton from "@/components/WatsappCTA";
import type { ReactNode } from "react";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col bg-ink text-cloud">
      <Navbar />

      {/* Reserve space for the fixed navbar */}
      <main className="pt-18 lg:pt-22">
        {children}
      </main>

      <WhatsAppFloatingButton />
      <Footer />
    </div>
  );
}