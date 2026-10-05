"use client";

// src/components/portal/portal-shell.tsx
// Owns the layout state for the two portal sidebars:
//   - left: the menu sidebar, expanded (icons + labels) or collapsed (icon rail)
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
import { cn } from "@/lib/utils";

export const LEFT_EXPANDED = 288; // px, same as the old w-72
export const LEFT_COLLAPSED = 76;
export const CHAT_MIN = 320;
export const CHAT_DEFAULT = 380;
export const CHAT_MAX = 760;

const KEY_LEFT = "portal:left-collapsed";
const KEY_OPEN = "portal:chat-open";
const KEY_WIDTH = "portal:chat-width";

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
      localStorage.setItem(KEY_WIDTH, String(chatWidth));
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
  } as CSSProperties;

  return (
    <PortalShellContext.Provider value={value}>
      <div className="min-h-screen bg-white" style={vars}>
        {children}
      </div>
    </PortalShellContext.Provider>
  );
}

// The page area. On desktop it leaves room for whichever sidebars are showing.
export function PortalMain({ children }: { children: ReactNode }) {
  const { ready, dragging } = usePortalShell();

  return (
    <main
      className={cn(
        "px-4 pb-28 pt-24 sm:px-6 lg:pb-12 lg:pl-[calc(var(--portal-left)+1.5rem)] lg:pr-[calc(var(--portal-right)+1.5rem)]",
        ready && !dragging && "lg:transition-[padding] lg:duration-200 lg:ease-out"
      )}
    >
      <div className="mx-auto max-w-5xl">{children}</div>
    </main>
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
  const { setChatOpen } = usePortalShell();

  const handleClick = () => {
    setChatOpen(true);
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
