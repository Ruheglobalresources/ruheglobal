// src/lib/chat-service.ts
// The applicant's side of the counsellor chat, as plain functions that take the user id.
// ONE place holds the rules; everything else only asks it:
//   - the Hono API (/api/v1/chat/*), used by the website AND the Expo app
//   - the server actions in actions/chat.ts (thin wrappers, kept for the website's old path)
// One OPEN Conversation per applicant, created lazily on the first message, so opening the
// chat and leaving leaves nothing behind. A new conversation starts with the counselor
// assigned to the account (or to one of their submissions) already on it.
import { after } from "next/server";
import { db } from "@/lib/db";
import { notifyStaffOfAwaitingConversation } from "@/lib/conversation-alerts";

const PAGE_SIZE = 50;
export const CHAT_MAX_LENGTH = 2000;

export type ChatMessage = {
  id: string;
  body: string | null;
  fileUrl: string | null;
  createdAt: string; // ISO
  fromMe: boolean;
  seenByMe: boolean;
  seenByOther: boolean;
  senderName?: string | null; // staff view only: who wrote it
  pending?: boolean; // client-only: optimistic message that has not been saved yet
};

export type ChatStaff = { name: string | null; image: string | null };

export type ChatState = {
  conversationId: string | null;
  staff: ChatStaff | null;
  messages: ChatMessage[]; // oldest first
  hasMore: boolean;
};

export type SendChatResult =
  | { success: true; conversationId: string; message: ChatMessage }
  | { success: false; code: "EMPTY" | "TOO_LONG" | "NOT_FOUND"; error: string };

const messageSelect = {
  id: true,
  senderId: true,
  body: true,
  fileUrl: true,
  seenByIds: true,
  createdAt: true,
} as const;

type MessageRow = {
  id: string;
  senderId: string;
  body: string | null;
  fileUrl: string | null;
  seenByIds: string[];
  createdAt: Date;
};

function toChatMessage(row: MessageRow, userId: string): ChatMessage {
  return {
    id: row.id,
    body: row.body,
    fileUrl: row.fileUrl,
    createdAt: row.createdAt.toISOString(),
    fromMe: row.senderId === userId,
    seenByMe: row.seenByIds.includes(userId),
    seenByOther: row.seenByIds.some((id) => id !== userId),
  };
}

// Newest `PAGE_SIZE` messages (optionally older than `before`), returned oldest-first.
async function fetchPage(conversationId: string, userId: string, before?: Date) {
  const rows = await db.message.findMany({
    where: { conversationId, ...(before ? { createdAt: { lt: before } } : {}) },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    select: messageSelect,
  });
  const hasMore = rows.length > PAGE_SIZE;
  const messages = rows.slice(0, PAGE_SIZE).reverse().map((row) => toChatMessage(row, userId));
  return { messages, hasMore };
}

// Only the client of a conversation can read it from here.
async function ownConversation(conversationId: string, userId: string) {
  return db.conversation.findFirst({
    where: { id: conversationId, clientId: userId },
    select: { id: true },
  });
}

// Initial load, and also what the apps poll: the latest page plus read receipts.
export async function getChatState(userId: string): Promise<ChatState> {
  const conversation = await db.conversation.findFirst({
    where: { clientId: userId, status: "OPEN" },
    orderBy: { lastMessageAt: "desc" },
    select: { id: true, staff: { select: { name: true, image: true }, take: 1 } },
  });

  if (!conversation) return { conversationId: null, staff: null, messages: [], hasMore: false };

  const { messages, hasMore } = await fetchPage(conversation.id, userId);
  return { conversationId: conversation.id, staff: conversation.staff[0] ?? null, messages, hasMore };
}

export async function getEarlierMessages(
  userId: string,
  conversationId: string,
  beforeIso: string
): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
  const before = new Date(beforeIso);
  if (Number.isNaN(before.getTime()) || !(await ownConversation(conversationId, userId))) {
    return { messages: [], hasMore: false };
  }
  return fetchPage(conversationId, userId, before);
}

// Called while the chat is open: everything the other side sent is now read.
export async function markConversationSeen(userId: string, conversationId: string): Promise<void> {
  if (!(await ownConversation(conversationId, userId))) return;

  await db.message.updateMany({
    where: { conversationId, senderId: { not: userId }, NOT: { seenByIds: { has: userId } } },
    data: { seenByIds: { push: userId } },
  });
}

export async function sendChatMessage(
  userId: string,
  input: { conversationId?: string | null; body: string }
): Promise<SendChatResult> {
  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (!body) return { success: false, code: "EMPTY", error: "Write a message first" };
  if (body.length > CHAT_MAX_LENGTH) {
    return { success: false, code: "TOO_LONG", error: `Messages can be up to ${CHAT_MAX_LENGTH} characters` };
  }

  let conversationId = input.conversationId ?? null;

  if (conversationId) {
    if (!(await ownConversation(conversationId, userId))) {
      return { success: false, code: "NOT_FOUND", error: "This conversation is no longer available" };
    }
  } else {
    // Reuse an open conversation if one already exists (another tab or device, or a
    // counsellor started it) instead of creating a duplicate.
    const existing = await db.conversation.findFirst({
      where: { clientId: userId, status: "OPEN" },
      orderBy: { lastMessageAt: "desc" },
      select: { id: true },
    });

    if (existing) {
      conversationId = existing.id;
    } else {
      const [owner, assigned] = await Promise.all([
        db.user.findUnique({ where: { id: userId }, select: { counselorId: true } }),
        db.applicationSubmission.findFirst({
          where: { userId, counselorId: { not: null } },
          orderBy: { updatedAt: "desc" },
          select: { counselorId: true },
        }),
      ]);
      // the counselor assigned to the account first, then the one on their latest submission
      const staffId = owner?.counselorId ?? assigned?.counselorId ?? null;

      const created = await db.conversation.create({
        data: {
          clientId: userId,
          ...(staffId ? { staff: { connect: { id: staffId } } } : {}),
        },
        select: { id: true },
      });
      conversationId = created.id;
    }
  }

  const now = new Date();

  const [message, turn] = await db.$transaction([
    db.message.create({
      data: { conversationId, senderId: userId, body, seenByIds: [userId] },
      select: messageSelect,
    }),
    // The first message of a new "awaiting a reply" turn marks the conversation as waiting.
    // count is 0 when it was already waiting, so only that first message sends the alert.
    db.conversation.updateMany({
      where: { id: conversationId, awaitingSince: null },
      data: { awaitingSince: now, lastMessageAt: now },
    }),
  ]);

  if (turn.count === 0) {
    await db.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: now } });
  } else {
    // after the response is sent, so the applicant never waits for the email
    const alert = () => notifyStaffOfAwaitingConversation({ messageId: message.id });
    try {
      after(alert);
    } catch {
      void alert();
    }
  }

  return { success: true, conversationId, message: toChatMessage(message, userId) };
}