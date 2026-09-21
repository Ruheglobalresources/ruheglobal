import WhatsAppFloatingButton from "@/components/WatsappCTA";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <>
            {children}
        </>
    );
}
