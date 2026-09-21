import { Navbar } from "@/components/layout/Navbar";
import WhatsAppFloatingButton from "@/components/WatsappCTA";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<div className="relative flex flex-1 min-h-screen flex-col bg-ink text-cloud">
		   <Navbar />
			{children}
			<WhatsAppFloatingButton />
		</div>
	);
}
