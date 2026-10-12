"use client";

// src/components/portal/portal-bottom-bar-gate.tsx
// Mounted in app/(root)/layout.tsx. Keeps the portal's phone bottom bar on the public /courses and
// /institutions pages, but only for people who came from the portal (portal-shell.tsx sets the
// sessionStorage flag when /portal opens). Someone arriving from Google sees the normal site.
// It does not read the session, so the public pages stay static and indexable.
// While the bar shows, it publishes --portal-bar-offset on <html>; the root layout and the WhatsApp
// button use it to move up out from under the bar. It is 0px otherwise.
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PORTAL_FLAG_KEY } from "@/lib/portal-paths";
import { PortalBottomBar } from "./portal-bottom-bar";

const BAR_HEIGHT = "calc(4.5rem + env(safe-area-inset-bottom))";

export function PortalBottomBarGate() {
  const pathname = usePathname();
  const [fromPortal, setFromPortal] = useState(false);

  // Read after mount (the server cannot know it); re-read on navigation in case it was set meanwhile.
  useEffect(() => {
    try {
      setFromPortal(sessionStorage.getItem(PORTAL_FLAG_KEY) === "1");
    } catch {
      setFromPortal(false);
    }
  }, [pathname]);

  const onCatalog = pathname.startsWith("/courses") || pathname.startsWith("/institutions");
  const show = fromPortal && onCatalog;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--portal-bar-offset", show ? BAR_HEIGHT : "0px");
    return () => {
      root.style.removeProperty("--portal-bar-offset");
    };
  }, [show]);

  return show ? <PortalBottomBar /> : null;
}