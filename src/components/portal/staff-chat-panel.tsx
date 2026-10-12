"use client";

// src/components/portal/staff-chat-panel.tsx
// The chat bar for counselors and admins. Same right sidebar as the applicant's chat (opened from the
// navbar door, drag to resize, its own full page at /portal/chat on phones, above the bottom bar), but it opens on a list of conversations.
// Pick one to read it and reply; the arrow goes back to the list.
//   - applicants only ever see ONE conversation (chat-panel.tsx)
//   - staff see many: their own, the ones of their applicants, and (admins) the unassigned ones
// The email alert opens /portal/conversations/<id>, which lands on /portal?conversation=<id>: the bar opens on that conversation.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CheckCheck, GripVertical, Inbox, Loader2, MessageCircle, SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import type { ChatMessage } from "@/lib/chat-service";
import {
  loadEarlierStaff,
  loadInbox,
  loadThread,
  markSeenStaff,
  sendStaffMessage,
  type InboxItem,
  type StaffThread,
} from "@/actions/chat-staff";
import { cn } from "@/lib/utils";
import { Avatar, ROLE_LABELS, dayLabel, isImage, listTimeLabel, mergeMessages, timeLabel } from "./chat-utils";
import { CHAT_MAX, CHAT_MIN, getChatMax, useCloseChat, useOpenChat, usePortalShell } from "./portal-shell";

const MAX_LENGTH = 2000;
const POLL_OPEN_MS = 5_000;
const POLL_CLOSED_MS = 20_000;
const KEY_STEP = 24;

export function StaffChatPanel({ role }: { role: "COUNSELOR" | "ADMIN" }) {
  const { ready, chatOpen, chatWidth, setChatWidth, resetChatWidth, dragging, setDragging, setUnread } =
    usePortalShell();
  const openChat = useOpenChat();
  const closeChat = useCloseChat();

  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [inboxLoading, setInboxLoading] = useState(true);

  const [openId, setOpenId] = useState<string | null>(null);
  const [thread, setThread] = useState<StaffThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stickToBottom = useRef(true);
  const prependHeight = useRef<number | null>(null);
  const sendingRef = useRef(false);
  const firstPageDone = useRef(false);
  const openIdRef = useRef<string | null>(null);

  // ---- inbox -----------------------------------------------------------------

  const refreshInbox = useCallback(async () => {
    try {
      setInbox(await loadInbox());
    } catch {
      // network hiccup or signed out: the next poll tries again
    } finally {
      setInboxLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshInbox();
  }, [refreshInbox]);

  useEffect(() => {
    const tick = () => {
      if (!document.hidden) void refreshInbox();
    };
    const id = window.setInterval(tick, chatOpen ? POLL_OPEN_MS : POLL_CLOSED_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [chatOpen, refreshInbox]);

  const totalUnread = inbox.reduce((sum, item) => sum + item.unread, 0);

  useEffect(() => {
    setUnread(chatOpen ? 0 : totalUnread);
  }, [chatOpen, totalUnread, setUnread]);

  // ---- one conversation ------------------------------------------------------

  const refreshThread = useCallback(async (id: string) => {
    try {
      const data = await loadThread(id);
      if (openIdRef.current !== id) return; // the person moved on
      if (sendingRef.current) return; // do not race an in-flight send
      if (!data) {
        setThread(null);
        setMessages([]);
        return;
      }
      setThread(data);
      setMessages((prev) => mergeMessages(prev.filter((m) => !m.pending), data.messages));
      if (!firstPageDone.current) {
        firstPageDone.current = true;
        setHasMore(data.hasMore);
      }
    } catch {
      // try again on the next poll
    } finally {
      setThreadLoading(false);
    }
  }, []);

  const openConversation = useCallback(
    (id: string) => {
      openIdRef.current = id;
      firstPageDone.current = false;
      stickToBottom.current = true;
      setOpenId(id);
      setThread(null);
      setMessages([]);
      setHasMore(false);
      setDraft("");
      setThreadLoading(true);
      void refreshThread(id);
    },
    [refreshThread]
  );

  const backToList = () => {
    openIdRef.current = null;
    setOpenId(null);
    setThread(null);
    setMessages([]);
    void refreshInbox();
  };

  // Arriving from the email alert: /portal?conversation=<id>
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("conversation");
    if (!id) return;
    openConversation(id);
    const url = new URL(window.location.href);
    url.searchParams.delete("conversation");
    window.history.replaceState(null, "", url);
    // desktop: open the bar. phones: go to the chat page (after the address was cleaned up above)
    openChat();
    // runs once on arrival
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!openId) return;
    const tick = () => {
      if (!document.hidden) void refreshThread(openId);
    };
    const id = window.setInterval(tick, chatOpen ? POLL_OPEN_MS : POLL_CLOSED_MS);
    return () => window.clearInterval(id);
  }, [openId, chatOpen, refreshThread]);

  // read receipts
  const threadUnread = messages.filter((m) => !m.fromMe && !m.seenByMe).length;

  useEffect(() => {
    if (!chatOpen || !openId || threadUnread === 0) return;
    setMessages((prev) => prev.map((m) => (m.fromMe || m.seenByMe ? m : { ...m, seenByMe: true })));
    markSeenStaff(openId)
      .then(() => refreshInbox())
      .catch(() => {});
  }, [chatOpen, openId, threadUnread, refreshInbox]);

  // ---- scrolling -------------------------------------------------------------

  const onScroll = () => {
    const el = listRef.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (prependHeight.current !== null) {
      el.scrollTop += el.scrollHeight - prependHeight.current;
      prependHeight.current = null;
    } else if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, chatOpen, threadLoading, openId]);

  const showEarlier = async () => {
    const oldest = messages.find((m) => !m.pending);
    if (!openId || !oldest || loadingEarlier) return;
    setLoadingEarlier(true);
    try {
      const page = await loadEarlierStaff(openId, oldest.createdAt);
      prependHeight.current = listRef.current?.scrollHeight ?? null;
      setMessages((prev) => mergeMessages(prev, page.messages));
      setHasMore(page.hasMore);
    } catch {
      toast.error("Couldn't load earlier messages");
    } finally {
      setLoadingEarlier(false);
    }
  };

  // ---- composing -------------------------------------------------------------

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [draft, openId]);

  const closed = thread?.status === "CLOSED";

  const send = async () => {
    const body = draft.trim();
    if (!body || !openId || sendingRef.current || closed) return;

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
      const result = await sendStaffMessage({ conversationId: openId, body });
      if (result.success) {
        setMessages((prev) => mergeMessages(prev.filter((m) => m.id !== temp.id), [result.message]));
        void refreshInbox();
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

  // ---- resizing the left border ---------------------------------------------

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

  // ---- render ----------------------------------------------------------------

  const person = thread?.person ?? null;
  const personName = person?.name ?? person?.email ?? "Ruhe team";
  let lastDay = "";
  let lastSender: string | null = null;

  return (
    <>
      <aside
        aria-label="Conversations"
        inert={!chatOpen}
        className={cn(
          "fixed bottom-[var(--portal-bottom-bar)] right-0 top-0 z-40 flex w-full flex-col bg-white lg:bottom-0 lg:z-20 lg:w-[var(--portal-chat-width)] lg:bg-[var(--portal-frame)]",
          chatOpen ? "translate-x-0" : "invisible translate-x-full",
          ready && !dragging && "lg:transition-[translate,visibility] lg:duration-200 lg:ease-out"
        )}
      >
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

        {/* Header: the list, or the conversation that is open */}
        <div className="flex h-[calc(4rem+env(safe-area-inset-top))] shrink-0 items-center gap-3 border-b border-neutral-100 px-4 pt-[env(safe-area-inset-top)] lg:h-14 lg:border-b-0 lg:pt-0">
          {openId ? (
            <>
              <button
                type="button"
                onClick={backToList}
                aria-label="Back to conversations"
                className="grid size-9 shrink-0 place-items-center rounded-full text-neutral-500 outline-none transition hover:bg-neutral-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-ruby-500/50"
              >
                <ArrowLeft size={20} />
              </button>
              <Avatar name={personName} image={person?.image ?? null} className="size-10 text-base" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{thread ? personName : "Loading"}</p>
                <p className="truncate text-xs text-neutral-500">
                  {person ? `${ROLE_LABELS[person.role]}${person.email ? ` · ${person.email}` : ""}` : "\u00A0"}
                </p>
              </div>
              {role === "ADMIN" && (
                <Link
                  href={`/admin/conversations/${openId}`}
                  className="shrink-0 text-xs font-medium text-ruby-600 hover:underline"
                >
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={closeChat}
                aria-label="Back"
                className="-ml-2 grid size-10 shrink-0 place-items-center rounded-full text-ink outline-none transition hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-ruby-500/50 lg:hidden"
              >
                <ArrowLeft size={22} />
              </button>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ruby-50 text-ruby-600">
                <Inbox size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">Conversations</p>
                <p className="truncate text-xs text-neutral-500">
                  {inboxLoading ? "Loading" : `${inbox.length} open${totalUnread ? `, ${totalUnread} unread` : ""}`}
                </p>
              </div>
            </>
          )}
        </div>

        {!openId ? (
          /* The list of conversations */
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {inboxLoading ? (
              <div className="grid h-full place-items-center text-neutral-400">
                <Loader2 className="animate-spin" size={22} />
              </div>
            ) : inbox.length === 0 ? (
              <div className="grid h-full place-items-center px-6 text-center">
                <div>
                  <span className="mx-auto grid size-14 place-items-center rounded-full bg-ruby-50 text-ruby-600">
                    <MessageCircle size={26} />
                  </span>
                  <p className="mt-4 font-semibold text-ink">No open conversations</p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-500">Messages from your applicants will show up here.</p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100 lg:divide-neutral-200/70">
                {inbox.map((item) => {
                  const name = item.person?.name ?? item.person?.email ?? "Ruhe team";
                  const preview = item.lastMessage
                    ? `${item.lastMessage.fromMe ? "You: " : ""}${item.lastMessage.body?.trim() || (item.lastMessage.hasFile ? "Attachment" : "")}`
                    : "No messages yet";
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => openConversation(item.id)}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left outline-none transition hover:bg-neutral-50 focus-visible:bg-neutral-50 lg:hover:bg-white lg:focus-visible:bg-white"
                      >
                        <Avatar name={name} image={item.person?.image ?? null} className="size-11 text-base" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className={cn("truncate text-[15px] text-ink", item.unread > 0 ? "font-semibold" : "font-medium")}>{name}</p>
                            <span className="ml-auto shrink-0 text-[11px] text-neutral-400">{listTimeLabel(item.lastMessageAt)}</span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2">
                            <p className={cn("min-w-0 flex-1 truncate text-sm", item.unread > 0 ? "text-ink" : "text-neutral-500")}>{preview}</p>
                            {item.unread > 0 && (
                              <span className="grid min-w-5 shrink-0 place-items-center rounded-full bg-ruby-500 px-1.5 text-[11px] font-semibold leading-5 text-white">
                                {item.unread > 9 ? "9+" : item.unread}
                              </span>
                            )}
                          </div>
                          {(item.person?.role !== "USER" || item.unassigned || item.awaiting) && (
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {item.person && item.person.role !== "USER" && (
                                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 lg:bg-white">
                                  {ROLE_LABELS[item.person.role]}
                                </span>
                              )}
                              {item.unassigned && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">Unassigned</span>
                              )}
                              {item.awaiting && (
                                <span className="rounded-full bg-ruby-50 px-2 py-0.5 text-[11px] font-medium text-ruby-700">Awaiting reply</span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
          <>
            {/* The conversation */}
            <div
              ref={listRef}
              onScroll={onScroll}
              role="log"
              aria-live="polite"
              className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-4 py-4"
            >
              {threadLoading ? (
                <div className="grid h-full place-items-center text-neutral-400">
                  <Loader2 className="animate-spin" size={22} />
                </div>
              ) : !thread ? (
                <div className="grid h-full place-items-center px-6 text-center">
                  <div>
                    <p className="font-semibold text-ink">This conversation is not available</p>
                    <button type="button" onClick={backToList} className="mt-2 text-sm font-medium text-ruby-600 hover:underline">
                      Back to conversations
                    </button>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="grid h-full place-items-center px-6 text-center text-sm text-neutral-500">No messages yet.</div>
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

                    const senderKey = m.fromMe ? "me" : (m.senderName ?? "other");
                    const showName = !m.fromMe && (showDay || senderKey !== lastSender);
                    lastSender = senderKey;

                    return (
                      <div key={m.id}>
                        {showDay && <p className="py-2 text-center text-xs font-medium text-neutral-400">{dayLabel(m.createdAt)}</p>}
                        {showName && m.senderName && <p className="mb-0.5 px-1 text-[11px] font-medium text-neutral-400">{m.senderName}</p>}
                        <div className={cn("flex", m.fromMe ? "justify-end" : "justify-start")}>
                          <div
                            className={cn(
                              "max-w-[85%] rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed",
                              m.fromMe ? "rounded-br-md bg-ruby-500 text-white" : "rounded-bl-md bg-neutral-100 text-ink lg:bg-white lg:ring-1 lg:ring-neutral-200/70",
                              m.pending && "opacity-70"
                            )}
                          >
                            {m.fileUrl &&
                              (isImage(m.fileUrl) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={m.fileUrl} alt="Attachment" className="mb-1.5 max-h-60 rounded-xl object-cover" />
                              ) : (
                                <a href={m.fileUrl} target="_blank" rel="noreferrer" className="mb-1 block text-sm font-medium underline underline-offset-2">
                                  Open attachment
                                </a>
                              ))}
                            {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                            <p className={cn("mt-0.5 flex items-center justify-end gap-1 text-[11px]", m.fromMe ? "text-white/75" : "text-neutral-400")}>
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
            <div className="shrink-0 border-t border-neutral-100 p-3 lg:border-t-0 lg:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {closed ? (
                <p className="px-2 py-2 text-center text-sm text-neutral-500">This conversation is closed.</p>
              ) : (
                <>
                  <div className="flex items-end gap-2 rounded-3xl border border-neutral-300 bg-white py-1.5 pl-4 pr-1.5 transition focus-within:border-ruby-500 focus-within:ring-2 focus-within:ring-ruby-500/20">
                    <textarea
                      ref={textareaRef}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={onComposerKeyDown}
                      rows={1}
                      maxLength={MAX_LENGTH}
                      aria-label="Message"
                      placeholder="Write a reply..."
                      disabled={!thread}
                      className="max-h-[120px] min-h-9 flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-6 text-ink outline-none placeholder:text-neutral-400"
                    />
                    <button
                      type="button"
                      onClick={() => void send()}
                      disabled={!draft.trim() || sending || !thread}
                      aria-label="Send message"
                      className="grid size-9 shrink-0 place-items-center rounded-full bg-ruby-500 text-white outline-none transition hover:bg-ruby-600 focus-visible:ring-2 focus-visible:ring-ruby-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
                    >
                      <SendHorizontal size={18} />
                    </button>
                  </div>
                  <p className="mt-1.5 px-2 text-[11px] text-neutral-400">Enter to send, Shift+Enter for a new line</p>
                </>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}