"use client";

// src/app/portal/chat/page.tsx
// Phones: the Chat tab of the bottom bar lands here. The conversation itself is the chat panel
// in app/portal/layout.tsx; it covers the whole screen while this route is showing (portal-shell.tsx
// opens it for /portal/chat), so this page has nothing of its own to draw.
// Desktop has the chat as a sidebar, so a visit here (a shared link, a rotated tablet) opens that
// sidebar and goes to the dashboard.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePortalShell } from "@/components/portal/portal-shell";

export default function PortalChatPage() {
  const router = useRouter();
  const { setChatOpen } = usePortalShell();

  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setChatOpen(true);
      router.replace("/portal");
    }
  }, [router, setChatOpen]);

  return null;
}