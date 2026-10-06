"use client";

// src/components/portal/chat-panel.tsx
// The chat with your counsellor, docked as a right sidebar.
//   - Collapse it with the button in its header; a tab on the right edge brings it back.
//   - Move the cursor onto its left border and drag to make it wider or narrower.
//     The border also works from the keyboard (arrow keys) and resets on double-click.
//   - On phones it opens full-screen instead (no resizing there).
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Check, CheckCheck, GripVertical, Loader2, MessageCircle, PanelRightClose, SendHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { loadChat, loadEarlier, markSeen, sendMessage, type ChatMessage, type ChatStaff } from "@/actions/chat";
import type { PortalCounsellor } from "@/lib/portal-counsellor";
import { cn } from "@/lib/utils";
import { CHAT_MAX, CHAT_MIN, getChatMax, usePortalShell } from "./portal-shell";

const MAX_LENGTH = 2000;
const POLL_OPEN_MS = 5_000;
const POLL_CLOSED_MS = 20_000;
const KEY_STEP = 24;

// Union by id, oldest first. Fresh copies win so read receipts update.
function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]) {
  const byId = new Map<string, ChatMessage>();
  for (const m of current) byId.set(m.id, m);
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: d.getFullYear() === today.getFullYear() ? undefined : "numeric" });
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

const isImage = (url: string) => /\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(url);

function Avatar({ name, image, className }: { name: string | null; image: string | null; className?: string }) {
  return image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} alt="" className={cn("shrink-0 rounded-full object-cover", className)} />
  ) : (
    <span className={cn("grid shrink-0 place-items-center rounded-full bg-ruby-50 font-semibold text-ruby-700", className)}>
      {(name ?? "R").charAt(0).toUpperCase()}
    </span>
  );
}

export function ChatPanel({ counsellor }: { counsellor: PortalCounsellor | null }) {
  const {
    ready,
    chatOpen,
    setChatOpen,
    chatWidth,
    setChatWidth,
    resetChatWidth,
    dragging,
    setDragging,
    unread,
    setUnread,
  } = usePortalShell();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [staff, setStaff] = useState<ChatStaff | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stickToBottom = useRef(true);
  const prependHeight = useRef<number | null>(null);
  const sendingRef = useRef(false);
  const firstLoadDone = useRef(false);

  const person = staff ?? counsellor;
  const title = person?.name ?? "Ruhe support";

  // ---- loading and polling ------------------------------------------------

  const refresh = useCallback(async () => {
    try {
      const state = await loadChat();
      // Don't let a poll race an in-flight send (it would show the message twice).
      if (sendingRef.current) return;
      setConversationId(state.conversationId);
      setStaff(state.staff);
      setMessages((prev) => mergeMessages(prev.filter((m) => !m.pending), state.messages));
      // Only the first load decides this; later polls only see the newest page.
      if (!firstLoadDone.current) {
        firstLoadDone.current = true;
        setHasMore(state.hasMore);
      }
    } catch {
      // network hiccup or signed out: the next poll tries again
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const tick = () => {
      if (!document.hidden) void refresh();
    };
    const id = window.setInterval(tick, chatOpen ? POLL_OPEN_MS : POLL_CLOSED_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [chatOpen, refresh]);

  // ---- unread + read receipts --------------------------------------------

  const unreadCount = messages.filter((m) => !m.fromMe && !m.seenByMe).length;

  useEffect(() => {
    setUnread(chatOpen ? 0 : unreadCount);
  }, [chatOpen, unreadCount, setUnread]);

  useEffect(() => {
    if (!chatOpen || !conversationId || unreadCount === 0) return;
    setMessages((prev) => prev.map((m) => (m.fromMe || m.seenByMe ? m : { ...m, seenByMe: true })));
    markSeen(conversationId).catch(() => {});
  }, [chatOpen, conversationId, unreadCount]);

  // ---- scrolling -----------------------------------------------------------

  const onScroll = () => {
    const el = listRef.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (prependHeight.current !== null) {
      // older messages were added above: keep what the person was reading in place
      el.scrollTop += el.scrollHeight - prependHeight.current;
      prependHeight.current = null;
    } else if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, chatOpen, loading]);

  const showEarlier = async () => {
    const oldest = messages.find((m) => !m.pending);
    if (!conversationId || !oldest || loadingEarlier) return;
    setLoadingEarlier(true);
    try {
      const page = await loadEarlier(conversationId, oldest.createdAt);
      prependHeight.current = listRef.current?.scrollHeight ?? null;
      setMessages((prev) => mergeMessages(prev, page.messages));
      setHasMore(page.hasMore);
    } catch {
      toast.error("Couldn't load earlier messages");
    } finally {
      setLoadingEarlier(false);
    }
  };

  // ---- composing -----------------------------------------------------------

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [draft]);

  useEffect(() => {
    if (chatOpen && window.matchMedia("(min-width: 1024px)").matches) textareaRef.current?.focus();
  }, [chatOpen]);

  const send = async () => {
    const body = draft.trim();
    if (!body || sendingRef.current) return;

    sendingRef.current = true;
    setSending(true);
    stickToBottom.current = true;

    const temp: ChatMessage = {
      id: `pending-${Date.now()}`,
      body,
      fileUrl: null,
      createdAt: new Date().toISOString(),
      fromMe: true,
      seenByMe: true,
      seenByOther: false,
      pending: true,
    };
    setMessages((prev) => [...prev, temp]);
    setDraft("");

    try {
      const result = await sendMessage({ conversationId, body });
      if (result.success) {
        setConversationId(result.conversationId);
        setMessages((prev) => mergeMessages(prev.filter((m) => m.id !== temp.id), [result.message]));
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== temp.id));
        setDraft(body);
        toast.error(result.error);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
      setDraft(body);
      toast.error("Couldn't send your message. Check your connection and try again.");
    } finally {
      sendingRef.current = false;
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const onComposerKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send();
    }
  };

  // ---- resizing the left border -------------------------------------------

  const dragActive = useRef(false);

  useEffect(() => {
    if (!dragging) return;
    const { cursor, userSelect } = document.body.style;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.cursor = cursor;
      document.body.style.userSelect = userSelect;
    };
  }, [dragging]);

  const onHandleDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragActive.current = true;
    setDragging(true);
  };
  const onHandleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragActive.current) setChatWidth(window.innerWidth - e.clientX);
  };
  const onHandleUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragActive.current) return;
    dragActive.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  };
  const onHandleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? KEY_STEP * 4 : KEY_STEP;
    if (e.key === "ArrowLeft") setChatWidth(chatWidth + step);
    else if (e.key === "ArrowRight") setChatWidth(chatWidth - step);
    else if (e.key === "Home") resetChatWidth();
    else return;
    e.preventDefault();
  };

  // ---- render --------------------------------------------------------------

  let lastDay = "";

  return (
    <>
      {/* Tab that brings the chat back. A round button above the bottom bar on phones. */}
      {!chatOpen && (
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          aria-label={unread ? `Open chat, ${unread} unread` : "Open chat"}
          title="Chat with your counsellor"
          className={cn(
            "fixed z-30 grid place-items-center bg-ruby-500 text-white shadow-lg outline-none transition hover:bg-ruby-600 focus-visible:ring-2 focus-visible:ring-ruby-500/50 focus-visible:ring-offset-2",
            "bottom-20 right-4 size-14 rounded-full",
            "lg:bottom-auto lg:right-0 lg:top-1/2 lg:h-14 lg:w-11 lg:-translate-y-1/2 lg:rounded-l-2xl lg:rounded-r-none lg:shadow-md"
          )}
        >
          <MessageCircle size={22} />
          {unread > 0 && (
            <span className="absolute -left-1 -top-1 grid min-w-5 place-items-center rounded-full border-2 border-white bg-ink px-1 text-[11px] font-semibold leading-4 text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      )}

      <aside
        aria-label="Chat with your counsellor"
        inert={!chatOpen}
        className={cn(
          // lg:top-0 is the change: there is no desktop top bar, so the chat starts at the very top
          "fixed bottom-0 right-0 top-16 z-40 flex w-full flex-col border-l border-neutral-200 bg-white lg:top-0 lg:z-20 lg:w-[var(--portal-chat-width)]",
          chatOpen ? "translate-x-0" : "invisible translate-x-full",
          ready && !dragging && "transition-[translate,visibility] duration-200 ease-out"
        )}
      >
        {/* Drag this border to resize (desktop only) */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize chat. Drag, or use the left and right arrow keys."
          aria-valuemin={CHAT_MIN}
          aria-valuemax={ready ? getChatMax() : CHAT_MAX}
          aria-valuenow={chatWidth}
          tabIndex={0}
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          onPointerCancel={onHandleUp}
          onDoubleClick={resetChatWidth}
          onKeyDown={onHandleKeyDown}
          title="Drag to resize. Double-click to reset."
          className="group absolute inset-y-0 -left-2 z-10 hidden w-4 cursor-col-resize touch-none select-none outline-none lg:block"
        >
          <span
            className={cn(
              "absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent transition-all group-hover:w-[3px] group-hover:bg-ruby-400 group-focus-visible:w-[3px] group-focus-visible:bg-ruby-500",
              dragging && "w-[3px] bg-ruby-500"
            )}
          />
          <span
            className={cn(
              "absolute left-1/2 top-1/2 grid h-10 w-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-400 opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100",
              dragging && "opacity-100 text-ruby-500"
            )}
          >
            <GripVertical size={12} />
          </span>
        </div>

        {/* Header */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-neutral-100 px-4">
          <Avatar name={title} image={person?.image ?? null} className="size-10 text-base" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink">{title}</p>
            <p className="truncate text-xs text-neutral-500">{person ? "Your counsellor" : "Ask us anything about your application"}</p>
          </div>
          <button
            type="button"
            onClick={() => setChatOpen(false)}
            aria-label="Collapse chat"
            title="Collapse chat"
            className="grid size-9 shrink-0 place-items-center rounded-full text-neutral-500 outline-none transition hover:bg-neutral-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-ruby-500/50"
          >
            <PanelRightClose size={20} className="hidden lg:block" />
            <X size={20} className="lg:hidden" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={listRef}
          onScroll={onScroll}
          role="log"
          aria-live="polite"
          className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-4 py-4"
        >
          {loading ? (
            <div className="grid h-full place-items-center text-neutral-400">
              <Loader2 className="animate-spin" size={22} />
            </div>
          ) : messages.length === 0 ? (
            <div className="grid h-full place-items-center px-6 text-center">
              <div>
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-ruby-50 text-ruby-600">
                  <MessageCircle size={26} />
                </span>
                <p className="mt-4 font-semibold text-ink">Start the conversation</p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                  Ask about courses, documents or your application. Your counsellor will reply here.
                </p>
              </div>
            </div>
          ) : (
            <>
              {hasMore && (
                <div className="pb-2 text-center">
                  <button
                    type="button"
                    onClick={showEarlier}
                    disabled={loadingEarlier}
                    className="rounded-full px-4 py-1.5 text-xs font-semibold text-ruby-600 transition hover:bg-ruby-50 disabled:opacity-60"
                  >
                    {loadingEarlier ? "Loading..." : "Show earlier messages"}
                  </button>
                </div>
              )}

              {messages.map((m) => {
                const day = new Date(m.createdAt).toDateString();
                const showDay = day !== lastDay;
                lastDay = day;

                return (
                  <div key={m.id}>
                    {showDay && (
                      <p className="py-2 text-center text-xs font-medium text-neutral-400">{dayLabel(m.createdAt)}</p>
                    )}
                    <div className={cn("flex", m.fromMe ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed",
                          m.fromMe ? "rounded-br-md bg-ruby-500 text-white" : "rounded-bl-md bg-neutral-100 text-ink",
                          m.pending && "opacity-70"
                        )}
                      >
                        {m.fileUrl &&
                          (isImage(m.fileUrl) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.fileUrl} alt="Attachment" className="mb-1.5 max-h-60 rounded-xl object-cover" />
                          ) : (
                            <a
                              href={m.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mb-1 block text-sm font-medium underline underline-offset-2"
                            >
                              Open attachment
                            </a>
                          ))}
                        {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                        <p
                          className={cn(
                            "mt-0.5 flex items-center justify-end gap-1 text-[11px]",
                            m.fromMe ? "text-white/75" : "text-neutral-400"
                          )}
                        >
                          {timeLabel(m.createdAt)}
                          {m.fromMe &&
                            (m.pending ? (
                              <Loader2 size={12} className="animate-spin" aria-label="Sending" />
                            ) : m.seenByOther ? (
                              <CheckCheck size={14} aria-label="Seen" />
                            ) : (
                              <Check size={14} aria-label="Sent" />
                            ))}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t border-neutral-100 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-end gap-2 rounded-3xl border border-neutral-300 bg-white py-1.5 pl-4 pr-1.5 transition focus-within:border-ruby-500 focus-within:ring-2 focus-within:ring-ruby-500/20">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onComposerKeyDown}
              rows={1}
              maxLength={MAX_LENGTH}
              aria-label="Message"
              placeholder="Write a message..."
              className="max-h-[120px] min-h-9 flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-6 text-ink outline-none placeholder:text-neutral-400"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={!draft.trim() || sending}
              aria-label="Send message"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-ruby-500 text-white outline-none transition hover:bg-ruby-600 focus-visible:ring-2 focus-visible:ring-ruby-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
            >
              <SendHorizontal size={18} />
            </button>
          </div>
          <p className="mt-1.5 px-2 text-[11px] text-neutral-400">Enter to send, Shift+Enter for a new line</p>
        </div>
      </aside>
    </>
  );
}