"use client";

// src/components/portal/portal-shell.tsx
// Owns the layout state for the two portal sidebars:
//   - left: the menu sidebar, pinned open (icons + labels) or collapsed (icon rail).
//     A collapsed rail still opens over the page while the cursor is on it; that
//     temporary "peek" lives in portal-nav.tsx and never moves the page.
//   - right: the chat sidebar, open or closed, and how wide it is
// The widths are published as CSS variables on one wrapper, so the fixed
// sidebars and the page content (PortalMain) all follow the same numbers.
// Choices are remembered in localStorage.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export const LEFT_EXPANDED = 248; // px (was 288)
export const LEFT_COLLAPSED = 72; // px (was 76): one 48px icon slot plus 12px padding each side
export const CHAT_MIN = 300; // px (was 320)
export const CHAT_DEFAULT = CHAT_MIN; // the chat starts at its smallest width; people can drag it wider
export const CHAT_MAX = 760;

// Colour of the frame around the white body (sidebar + navbar + chat bar). Sampled from the
// Paystack dashboard. Change it here and the sidebar, navbar, chat and corners all follow.
export const FRAME_COLOR = "#f6f7fa";

const KEY_LEFT = "portal:left-collapsed";
const KEY_OPEN = "portal:chat-open";
// "-v2": the old key saved the width on every visit (even when never touched), which
// would have kept everyone on the old 380px. Now a width is only saved once the
// person has actually resized the chat.
const KEY_WIDTH = "portal:chat-width-v2";
const KEY_WIDTH_OLD = "portal:chat-width";

// On phones the chat is its own page at this route (opened from the bottom bar).
export const CHAT_PAGE = "/portal/chat";

// The sidebars only sit beside the page from the lg breakpoint up.
const DESKTOP_QUERY = "(min-width: 1024px)";

// The chat may take up to 60% of the window, so the page never gets squeezed out.
export function getChatMax() {
  if (typeof window === "undefined") return CHAT_MAX;
  return Math.max(CHAT_MIN, Math.min(CHAT_MAX, Math.floor(window.innerWidth * 0.6)));
}

function clampChat(width: number) {
  return Math.round(Math.min(getChatMax(), Math.max(CHAT_MIN, width)));
}

type PortalShellContextValue = {
  ready: boolean;
  leftCollapsed: boolean;
  toggleLeft: () => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  chatWidth: number;
  setChatWidth: (width: number) => void;
  resetChatWidth: () => void;
  dragging: boolean;
  setDragging: (dragging: boolean) => void;
  unread: number;
  setUnread: (count: number) => void;
};

const PortalShellContext = createContext<PortalShellContextValue | null>(null);

export function usePortalShell() {
  const ctx = useContext(PortalShellContext);
  if (!ctx) throw new Error("usePortalShell must be used inside <PortalShell>");
  return ctx;
}

// Open the chat: the sidebar on desktop, the full page (/portal/chat) on phones.
export function useOpenChat() {
  const { setChatOpen } = usePortalShell();
  const router = useRouter();
  return useCallback(() => {
    if (window.matchMedia(DESKTOP_QUERY).matches) setChatOpen(true);
    else router.push(CHAT_PAGE);
  }, [setChatOpen, router]);
}

// Close the chat: collapse the sidebar on desktop, leave the page on phones.
export function useCloseChat() {
  const { setChatOpen } = usePortalShell();
  const router = useRouter();
  return useCallback(() => {
    if (window.matchMedia(DESKTOP_QUERY).matches) {
      setChatOpen(false);
      return;
    }
    // came from a page of this site: go back to it. Opened directly: go to the dashboard.
    const cameFromSite = document.referrer.startsWith(window.location.origin);
    if (cameFromSite && window.history.length > 1) router.back();
    else router.replace("/portal");
  }, [setChatOpen, router]);
}

export function PortalShell({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatWidth, setChatWidthState] = useState(CHAT_DEFAULT);
  const [dragging, setDragging] = useState(false);
  const [unread, setUnread] = useState(0);

  // Restore saved choices after mount (the server cannot know them). `ready`
  // also keeps animations off for this first jump.
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY).matches;
    try {
      const savedLeft = localStorage.getItem(KEY_LEFT);
      const savedOpen = localStorage.getItem(KEY_OPEN);
      const savedWidth = Number(localStorage.getItem(KEY_WIDTH));
      localStorage.removeItem(KEY_WIDTH_OLD);

      if (savedLeft !== null) setLeftCollapsed(savedLeft === "1");
      if (savedWidth) setChatWidthState(clampChat(savedWidth));

      // Phones show the chat full-screen, so it always starts closed there.
      // First visit on a roomy desktop starts open.
      if (desktop) setChatOpen(savedOpen === null ? window.innerWidth >= 1280 : savedOpen === "1");
    } catch {
      // storage blocked: keep the defaults
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY_LEFT, leftCollapsed ? "1" : "0");
      if (chatWidth === CHAT_DEFAULT) localStorage.removeItem(KEY_WIDTH);
      else localStorage.setItem(KEY_WIDTH, String(chatWidth));
      // Don't let a phone session overwrite the desktop preference.
      if (window.matchMedia(DESKTOP_QUERY).matches) localStorage.setItem(KEY_OPEN, chatOpen ? "1" : "0");
    } catch {
      // ignore
    }
  }, [ready, leftCollapsed, chatOpen, chatWidth]);

  // Keep the chat inside its limits when the window shrinks.
  useEffect(() => {
    const onResize = () => setChatWidthState((w) => clampChat(w));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // On phones the chat is a page of its own (/portal/chat), so it is open exactly while
  // that page is showing. Desktop keeps its own open/closed choice.
  const pathname = usePathname();
  useEffect(() => {
    if (!window.matchMedia(DESKTOP_QUERY).matches) setChatOpen(pathname === CHAT_PAGE);
  }, [pathname]);

  const setChatWidth = useCallback((width: number) => setChatWidthState(clampChat(width)), []);
  const resetChatWidth = useCallback(() => setChatWidthState(clampChat(CHAT_DEFAULT)), []);
  const toggleLeft = useCallback(() => setLeftCollapsed((c) => !c), []);

  const value = useMemo<PortalShellContextValue>(
    () => ({
      ready,
      leftCollapsed,
      toggleLeft,
      chatOpen,
      setChatOpen,
      chatWidth,
      setChatWidth,
      resetChatWidth,
      dragging,
      setDragging,
      unread,
      setUnread,
    }),
    [ready, leftCollapsed, toggleLeft, chatOpen, chatWidth, setChatWidth, resetChatWidth, dragging, unread]
  );

  const vars = {
    "--portal-left": `${leftCollapsed ? LEFT_COLLAPSED : LEFT_EXPANDED}px`,
    "--portal-right": `${chatOpen ? chatWidth : 0}px`,
    "--portal-chat-width": `${chatWidth}px`,
    "--portal-frame": FRAME_COLOR,
    "--portal-bottom-bar": "calc(4.5rem + env(safe-area-inset-bottom))",
  } as CSSProperties;

  return (
    <PortalShellContext.Provider value={value}>
      {/* Desktop frame: the sidebar + top strip wrap a white body (pt-14 = the strip's height) */}
      <div className="min-h-screen bg-white lg:bg-[var(--portal-frame)] lg:pt-14" style={vars}>
        {children}
      </div>
    </PortalShellContext.Provider>
  );
}

// Pages that are a form (the application wizard at /portal/<terminal>/<application>)
// read best at a fixed width. Everything else (dashboard, courses, institutions,
// a terminal's application list) is a grid or a strip of cards and fills the space.
const isFormPage = (pathname: string) =>
  /^\/portal\/(?!courses(\/|$)|institutions(\/|$))[^/]+\/[^/]+/.test(pathname);

// The page area: the white, inset body of the desktop layout. It sits under the
// top strip (the header in portal-nav.tsx), between the two sidebars, and uses ALL
// the space between them: collapse the menu or the chat and the body grows into it.
// The page still scrolls with the window (so sticky bars, hash links and infinite
// scroll behave as before); the round top corners are fixed overlays, because a
// real border-radius would scroll away with the content.
// The left space follows the pinned width only, so hovering a collapsed rail
// opens it over the page without pushing anything.
export function PortalMain({ children }: { children: ReactNode }) {
  const { ready, dragging } = usePortalShell();
  const pathname = usePathname();

  return (
    <>
      <main
        className={cn(
          "bg-white px-4 pb-28 pt-4 sm:px-6 lg:min-h-[calc(100vh-3.5rem)] lg:pb-12 lg:pt-6 lg:ml-[var(--portal-left)] lg:mr-[var(--portal-right)] lg:px-8",
          ready && !dragging && "lg:transition-[margin] lg:duration-200 lg:ease-out motion-reduce:lg:transition-none"
        )}
      >
        {/* min-w-0 lets the card strips shrink with the page instead of pushing it wider */}
        <div className={cn("w-full min-w-0", isFormPage(pathname) && "mx-auto max-w-5xl")}>{children}</div>
      </main>

      {/* Rounded top corners of the white body (desktop only): left next to the menu, right next to the chat */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed top-14 z-20 hidden size-4 lg:block",
          "[background:radial-gradient(circle_at_100%_100%,transparent_16px,var(--portal-frame)_16.5px)]",
          ready && !dragging && "transition-[left] duration-200 ease-out motion-reduce:transition-none"
        )}
        style={{ left: "var(--portal-left)" }}
      />
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed top-14 z-20 hidden size-4 lg:block",
          "[background:radial-gradient(circle_at_0%_100%,transparent_16px,var(--portal-frame)_16.5px)]",
          ready && !dragging && "transition-[right] duration-200 ease-out motion-reduce:transition-none"
        )}
        style={{ right: "var(--portal-right)" }}
      />
    </>
  );
}

export function OpenChatButton({
  className,
  children,
  onClick,
}: {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const openChat = useOpenChat();

  const handleClick = () => {
    openChat();
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
    >
      {children}
    </button>
  );
}